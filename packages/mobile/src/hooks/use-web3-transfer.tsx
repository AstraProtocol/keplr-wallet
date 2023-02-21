import { BigNumber } from "@ethersproject/bignumber";
import { TransactionRequest, Web3Provider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { IAmountConfig } from "@keplr-wallet/hooks";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useMemo } from "react";
import { default as Web3HttpProvider } from "web3-providers-http";
import { useStore } from "../stores";

export const useWeb3Transfer = () => {
  const { chainStore, keyRingStore, transactionStore } = useStore();
  const chainId = chainStore.current.chainId;
  const chain = chainStore.getChain(chainId);
  const ethereumEndpoint = chain.raw.ethereumEndpoint;

  const asyncManager = useMemo(async () => {
    const privateKey = await keyRingStore.exportPrivateKey();
    const provider = new Web3Provider(
      new (Web3HttpProvider as any)(ethereumEndpoint)
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

    const feeData = await manager.provider.getFeeData();

    let maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas?.toNumber() ?? 1500000000;
    if (defaultConfig?.priorityFee) {
      maxPriorityFeePerGas = defaultConfig.priorityFee;
    }

    let maxFeePerGas = feeData.maxFeePerGas?.toNumber() ?? 0;
    if (defaultConfig?.baseFee) {
      maxFeePerGas = defaultConfig.baseFee + maxPriorityFeePerGas;
    }

    return {
      gasLimit: estimateGas,
      maxFeePerGas: "0x" + maxFeePerGas.toString(16),
      maxPriorityFeePerGas: "0x" + maxPriorityFeePerGas.toString(16),
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

    const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } = await estimateGas(
      toAddress,
      amountConfig,
      defaultConfig
    );

    let txData = await buildTxData(amountConfig);
    txData = {
      ...txData,
      to: toAddress,
      gasLimit,
      maxPriorityFeePerGas,
      maxFeePerGas,
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
    };
    return txData;
  };

  return {
    estimateGas,
    transfer,
  };
};
