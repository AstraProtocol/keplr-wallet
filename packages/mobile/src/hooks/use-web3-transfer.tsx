import { BigNumber } from "@ethersproject/bignumber";
import { TransactionRequest, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useMemo } from "react";
import { default as Web3HttpProvider } from "web3-providers-http";
import { EthereumEndpoint } from "../config";
import { useStore } from "../stores";

export const useWeb3Transfer = () => {
  const { keyRingStore, transactionStore } = useStore();

  const asyncManager = useMemo(async () => {
    const privateKey = await keyRingStore.exportPrivateKey();
    const provider = new Web3Provider(
      new (Web3HttpProvider as any)(EthereumEndpoint)
    );
    const wallet = new Wallet(privateKey, provider);

    return {
      provider,
      wallet,
    };
  }, [keyRingStore]);

  const estimateGas = async (
    toAddress: string,
    amountConfig: IAmountConfig,
    defaultConfig:
      | { baseFee?: number; priorityFee?: number }
      | undefined = undefined
  ) => {
    const manager = await asyncManager;

    const estimateGas = await manager.provider.estimateGas({
      from: manager.wallet.address,
      to: toAddress,
      value: getTxAmount(amountConfig),
    });

    let gasPrice = "0x0";
    let baseFee = defaultConfig?.baseFee;
    if (baseFee) {
      if (defaultConfig?.priorityFee) {
        baseFee += defaultConfig?.priorityFee;
      }
      gasPrice = "0x" + baseFee.toString(16);
    } else {
      gasPrice = (await manager.provider.getGasPrice()).toHexString();
    }

    return {
      gasLimit: estimateGas,
      gasPrice,
    };
  };

  const transfer = async (
    toAddress: string,
    amountConfig: IAmountConfig,
    defaultConfig:
      | { baseFee?: number; priorityFee?: number }
      | undefined = undefined,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) => {
    transactionStore.updateTxState("pending");

    const manager = await asyncManager;

    const { gasLimit, gasPrice } = await estimateGas(
      toAddress,
      amountConfig,
      defaultConfig
    );

    let txData = await buildTxData(amountConfig);
    txData = {
      ...txData,
      to: toAddress,
      gasLimit,
      ...(defaultConfig?.priorityFee
        ? {
            maxPriorityFeePerGas:
              "0x" + defaultConfig?.priorityFee.toString(16),
          }
        : {}),
      maxFeePerGas: gasPrice,
    };

    const signedTx = await manager.wallet.signTransaction(txData);
    console.log("__DEBUG__ signedTx", signedTx);
    try {
      const response = await manager.provider.sendTransaction(signedTx);
      console.log("__DEBUG__ response", response);

      let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
      let onFulfill: ((tx: any) => void) | undefined;

      if (onTxEvents) {
        if (typeof onTxEvents === "function") {
          onFulfill = onTxEvents;
        } else {
          onBroadcasted = onTxEvents.onBroadcasted;
          onFulfill = onTxEvents.onFulfill;
        }
      }

      if (onBroadcasted) {
        console.log("__DEBUG__ hash", response.hash.slice(2));
        onBroadcasted(Buffer.from(response.hash.slice(2), "hex"));
      }

      const receipt = await manager.provider.waitForTransaction(response.hash);
      console.log("__DEBUG__ receipt", receipt);
      if (onFulfill) {
        onFulfill(receipt);
      }
      transactionStore.updateTxState("success");
    } catch (e) {
      console.log("__DEBUG__ e", e);
      transactionStore.updateTxState("failure");
    }
  };

  const getTxAmount = (amountConfig: IAmountConfig) => {
    const actualAmount = (() => {
      let dec = new Dec(amountConfig.amount);
      dec = dec.mul(
        DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
      );
      return dec.truncate().toString();
    })();
    const amount = BigNumber.from(actualAmount);
    return amount;
  };

  const buildTxData = async (amountConfig: IAmountConfig) => {
    const manager = await asyncManager;
    const nonce = await manager.provider.getTransactionCount(
      manager.wallet.address
    );

    const chainId = await manager.wallet.getChainId();
    const txData: TransactionRequest = {
      chainId: chainId,
      from: manager.wallet.address,
      value: getTxAmount(amountConfig),
      nonce,
      type: 2,
      maxPriorityFeePerGas: "0x" + Number(1_500_000_000).toString(16),
      maxFeePerGas: "0x" + Number(1_001_500_000_000).toString(16),
    };
    return txData;
  };

  return {
    estimateGas,
    transfer,
  };
};
