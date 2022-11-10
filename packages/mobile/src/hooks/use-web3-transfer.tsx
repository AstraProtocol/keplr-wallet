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
  const gaastra1 = "0x3B9ACA00";
  const gasPrice = "0x9502F900"; // 2.5 gaastra

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

  const estimateGas = async (amountConfig: IAmountConfig) => {
    const manager = await asyncManager;
    const txData = await buildTxData(amountConfig);

    const estimateGas = await manager.provider.estimateGas(txData);
    const gasPrice = await manager.provider.getGasPrice();

    return {
      gasLimit: estimateGas,
      gasPrice: gasPrice.toHexString(),
    };
  };

  const transfer = async (
    toAddress: string,
    amountConfig: IAmountConfig,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) => {
    transactionStore.updateTxState("pending");

    const manager = await asyncManager;

    const { gasLimit, gasPrice } = await estimateGas(amountConfig);
    console.log("__DEBUG__ estimateGas", gasLimit.toHexString());
    let txData = await buildTxData(amountConfig);
    txData = {
      ...txData,
      to: toAddress,
      gasLimit,
      maxPriorityFeePerGas: gasPrice,
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

  const buildTxData = async (amountConfig: IAmountConfig) => {
    const actualAmount = (() => {
      let dec = new Dec(amountConfig.amount);
      dec = dec.mul(
        DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
      );
      return dec.truncate().toString();
    })();
    const amount = BigNumber.from(actualAmount);

    const manager = await asyncManager;
    const nonce = await manager.provider.getTransactionCount(
      manager.wallet.address
    );

    const chainId = await manager.wallet.getChainId();
    const txData: TransactionRequest = {
      chainId: chainId,
      from: manager.wallet.address,
      value: amount,
      nonce,
      type: 2,
      maxPriorityFeePerGas: gaastra1,
      maxFeePerGas: gasPrice,
    };
    return txData;
  };

  return {
    estimateGas,
    transfer,
  };
};
