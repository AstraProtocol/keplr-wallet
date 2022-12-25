import { useAmountConfig } from "@keplr-wallet/hooks";
import { CoinPretty } from "@keplr-wallet/unit";
import React from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { formatCoin } from "../../../common";
import { IRow, ListRowView } from "../../../components";
import { useWeb3Transfer } from "../../../hooks/use-web3-transfer";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgSend,
  MsgUndelegate,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgSend,
  renderMsgUndelegate,
} from "../models/messages";

export const useTransaction = () => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    transactionStore,
    analyticsStore,
  } = useStore();
  const { transfer } = useWeb3Transfer();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const chainId = chainStore.current.chainId;
  const account = accountStore.getAccount(chainId);

  const amountConfig = useAmountConfig(
    chainStore,
    queriesStore,
    chainId,
    account.bech32Address
  );

  const sendSendTransaction = async (value?: any) => {
    const data = value as MsgSend["value"];

    amountConfig.setAmount(formatCoin(data.amount, true, 4));

    await transfer(data.recipient, amountConfig, {
      onBroadcasted: (txHash) => {
        // analyticsStore.logEvent("astra_hub_transfer_token", {
        //   ...params,
        //   tx_hash: "0x" + Buffer.from(txHash).toString("hex"),
        //   success: true,
        // });
        transactionStore.updateTxHash(txHash);

        smartNavigation.navigate("Tx", {
          screen: "Tx.EvmResult",
        });
      },
    });
  };

  const sendDelegateTransaction = async (value?: any) => {
    const data = value as MsgDelegate["value"];

    const tx = account.cosmos.makeDelegateTx(
      formatCoin(data.amount, true, 4),
      data.validatorAddress
    );

    await tx.sendWithGasPrice(
      { gas: Number(data.gasLimit ?? 0) },
      "",
      {
        preferNoSetMemo: true,
        preferNoSetFee: true,
      },
      {
        onBroadcasted: (txHash) => {
          // analyticsStore.logEvent("astra_hub_delegate_token", {
          //   ...params,
          //   tx_hash: Buffer.from(txHash).toString("hex"),
          //   success: true,
          // });
          transactionStore.updateTxHash(txHash);
        },
      }
    );
  };

  const sendUndelegateTransaction = async (value?: any) => {
    const data = value as MsgUndelegate["value"];

    const tx = account.cosmos.makeUndelegateTx(
      formatCoin(data.amount, true, 4),
      data.validatorAddress
    );
    await tx.sendWithGasPrice(
      { gas: Number(data.gasLimit ?? 0) },
      "",
      {
        preferNoSetMemo: true,
        preferNoSetFee: true,
      },
      {
        onBroadcasted: (txHash) => {
          // analyticsStore.logEvent("astra_hub_undelegate_token", {
          //   ...params,
          //   tx_hash: Buffer.from(txHash).toString("hex"),
          //   success: true,
          // });
          transactionStore.updateTxHash(txHash);
        },
      }
    );
  };

  const sendRedelegateTransaction = async (value?: any) => {
    const data = value as MsgBeginRedelegate["value"];

    const tx = account.cosmos.makeBeginRedelegateTx(
      formatCoin(data.amount, true, 4),
      data.srcValidatorAddress,
      data.dstValidatorAddress
    );
    await tx.sendWithGasPrice(
      { gas: Number(data.gasLimit ?? 0) },
      "",
      {
        preferNoSetMemo: true,
        preferNoSetFee: true,
      },
      {
        onBroadcasted: (txHash: Uint8Array) => {
          // analyticsStore.logEvent("astra_hub_redelegate_token", {
          //   ...params,
          //   tx_hash: Buffer.from(txHash).toString("hex"),
          //   success: true,
          // });
          transactionStore.updateTxHash(txHash);
        },
      }
    );
  };

  const getTxDetailsRows = (): IRow[] => {
    if (!transactionStore.rawData) {
      return [];
    }

    const { type, value } = transactionStore.rawData;

    if (isSendTransaction(type)) {
      return renderMsgSend(value as MsgSend["value"]);
    }

    if (isDelegateTransaction(type)) {
      return renderMsgDelegate(value as MsgDelegate["value"]);
    }

    if (isUndelegateTransaction(type)) {
      return renderMsgUndelegate(value as MsgUndelegate["value"]);
    }

    if (isRedelegateTransaction(type)) {
      return renderMsgBeginRedelegate(value as MsgBeginRedelegate["value"]);
    }

    // if (type === account.cosmos.msgOpts.withdrawRewards.type) {
    //   return renderMsgWithdrawDelegatorReward(
    //     value as MsgWithdrawDelegatorReward["value"]
    //   );
    // }

    // if (type === "wallet-swap") {
    //   const msgEther = transactionStore.txMsgs;
    //   if (msgEther && msgEther.length > 0) {
    //     return renderMsgSwap(value as MsgSwap);
    //   }
    //   return [];
    // }

    // if (type === "transfer-nft") {
    //   return renderMsgTransferNFT(value as MsgTransferNFT["value"]);
    // }

    return [];
  };

  const isSendTransaction = (type?: string) => {
    return type === account.cosmos.msgOpts.send.native.type;
  };

  const isDelegateTransaction = (type?: string) => {
    return type === account.cosmos.msgOpts.delegate.type;
  };

  const isUndelegateTransaction = (type?: string) => {
    return type === account.cosmos.msgOpts.undelegate.type;
  };

  const isRedelegateTransaction = (type?: string) => {
    return type === account.cosmos.msgOpts.redelegate.type;
  };

  const sendTransaction = async () => {
    if (!transactionStore.rawData) {
      return;
    }

    const { type, value } = transactionStore.rawData;

    try {
      if (isSendTransaction(type)) {
        await sendSendTransaction(value);
      }

      if (isDelegateTransaction(type)) {
        await sendDelegateTransaction(value);
      }

      if (isUndelegateTransaction(type)) {
        await sendUndelegateTransaction(value);
      }

      if (isRedelegateTransaction(type)) {
        await sendRedelegateTransaction(value);
      }

      // if (type === account.cosmos.msgOpts.withdrawRewards.type) {
      //   await renderMsgWithdrawDelegatorReward(
      //     value as MsgWithdrawDelegatorReward["value"]
      //   );
      // }

      // if (type === "wallet-swap") {
      //   const msgEther = transactionStore.txMsgs;
      //   if (msgEther && msgEther.length > 0) {
      //     await renderMsgSwap(value as MsgSwap);
      //   }
      //   return [];
      // }

      // if (type === "transfer-nft") {
      //   await renderMsgTransferNFT(value as MsgTransferNFT["value"]);
      // }
    } catch (e) {
      transactionStore.updateTxState("failure");
      throw e;
    }
  };

  // const getTxDetailsView = (
  //   containerStyle: ViewStyle | undefined = undefined
  // ) => {
  //   if (!transactionStore.rawData) {
  //     return null;
  //   }

  //   const rows = getTxDetailsRows(transactionStore.rawData);
  //   return (
  // <View style={{ ...containerStyle }}>
  //   <ListRowView rows={rows} />
  // </View>
  //   );
  // };

  const getTxAmount = () => {
    if (!transactionStore.rawData) {
      return;
    }

    const { value } = transactionStore.rawData;

    if (!value["amount"]) {
      return;
    }

    return value["amount"] as CoinPretty;
  };

  const getTxText = () => {
    if (!transactionStore.rawData) {
      return;
    }

    const { type } = transactionStore.rawData;

    if (isSendTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.Send.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.Send.Pending" }),
        success: intl.formatMessage({ id: "Tx.Send.Success" }),
        failure: intl.formatMessage({ id: "Tx.Send.Failure" }),
      };
    }

    if (isDelegateTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.Delegate.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.Delegate.Pending" }),
        success: intl.formatMessage({ id: "Tx.Delegate.Success" }),
        failure: intl.formatMessage({ id: "Tx.Delegate.Failure" }),
      };
    }

    if (isUndelegateTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.Undelegate.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.Undelegate.Pending" }),
        success: intl.formatMessage({ id: "Tx.Undelegate.Success" }),
        failure: intl.formatMessage({ id: "Tx.Undelegate.Failure" }),
      };
    }

    if (isRedelegateTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.Redelegate.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.Redelegate.Pending" }),
        success: intl.formatMessage({ id: "Tx.Redelegate.Success" }),
        failure: intl.formatMessage({ id: "Tx.Redelegate.Failure" }),
      };
    }

    return;
  };

  return {
    // getTxDetailsView,
    getTxDetailsRows,
    sendTransaction,
    getTxAmount,
    getTxText,
  };
};
