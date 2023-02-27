import { useAmountConfig } from "@keplr-wallet/hooks";
import { MsgWithdrawDelegatorReward as _MsgWithdrawDelegatorReward } from "@keplr-wallet/proto-types/cosmos/distribution/v1beta1/tx";
import {
  MsgBeginRedelegate as _MsgBeginRedelegate,
  MsgDelegate as _MsgDelegate,
  MsgUndelegate as _MsgUndelegate,
} from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { formatCoinAmount, TX_GAS_DEFAULT } from "../../../common";
import { IRow } from "../../../components";
import { useWeb3Transfer } from "../../../hooks/use-web3-transfer";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStaking } from "../../staking/hook/use-staking";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgSend,
  MsgSwap,
  MsgTransferNFT,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgSend,
  renderMsgSwap,
  renderMsgTransferNFT,
  renderMsgUndelegate,
  renderMsgWithdrawDelegatorReward,
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
  const { queryFeeMarket } = useStaking();

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

  const simulateDelegateTx = async (
    amount: string,
    validatorAddress: string,
    defaultConfig: {
      gasPrice: number;
      gasLimit: number;
      gasMultiplier: number;
    } = {
      gasPrice: 100000000000, //100 nano aastra
      gasLimit: TX_GAS_DEFAULT.delegate,
      gasMultiplier: 1,
    }
  ) => {
    amountConfig.setAmount(amount);

    const msg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: _MsgDelegate
        .encode({
          delegatorAddress: account.bech32Address,
          validatorAddress: validatorAddress,
          amount: {
            denom: amountConfig.sendCurrency.coinMinimalDenom,
            amount: new Dec(amount)
              .mulTruncate(
                DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
              )
              .truncate()
              .toString(),
          },
        })
        .finish(),
    };

    const gasPrice =
      Number(queryFeeMarket.gasPrice ?? 0) > 0
        ? Number(queryFeeMarket.gasPrice)
        : defaultConfig.gasPrice;
    let gasLimit = defaultConfig.gasLimit;
    let feeAmount = {
      amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
      denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
    };

    try {
      const { gasUsed } = await account.cosmos.simulateTransaction([msg], {
        amount: [feeAmount],
        gasLimit,
      });

      gasLimit = Math.ceil(gasUsed * defaultConfig.gasMultiplier);
      feeAmount = {
        amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
        denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
      };
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
    } catch (e) {
      console.log("simulateDelegateTx error", e);
    }

    return {
      feeAmount,
      gasPrice,
      gasLimit,
    };
  };

  const simulateUndelegateTx = async (
    amount: string,
    validatorAddress: string,
    defaultConfig: {
      gasPrice: number;
      gasLimit: number;
      gasMultiplier: number;
    } = {
      gasPrice: 100000000000, //100 nano aastra
      gasLimit: TX_GAS_DEFAULT.delegate,
      gasMultiplier: 1,
    }
  ) => {
    amountConfig.setAmount(amount);

    const msg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
      value: _MsgUndelegate
        .encode({
          delegatorAddress: account.bech32Address,
          validatorAddress: validatorAddress,
          amount: {
            denom: amountConfig.sendCurrency.coinMinimalDenom,
            amount: new Dec(amount)
              .mulTruncate(
                DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
              )
              .truncate()
              .toString(),
          },
        })
        .finish(),
    };

    const gasPrice =
      Number(queryFeeMarket.gasPrice ?? 0) > 0
        ? Number(queryFeeMarket.gasPrice)
        : defaultConfig.gasPrice;
    let gasLimit = defaultConfig.gasLimit;
    let feeAmount = {
      amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
      denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
    };

    try {
      const { gasUsed } = await account.cosmos.simulateTransaction([msg], {
        amount: [feeAmount],
        gasLimit,
      });

      gasLimit = Math.ceil(gasUsed * defaultConfig.gasMultiplier);
      feeAmount = {
        amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
        denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
      };
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
    } catch (e) {
      console.log("simulateUndelegateTx error", e);
    }

    return {
      feeAmount,
      gasPrice,
      gasLimit,
    };
  };

  const simulateRedelegateTx = async (
    amount: string,
    validatorSrcAddress: string,
    validatorDstAddress: string,
    defaultConfig: {
      gasPrice: number;
      gasLimit: number;
      gasMultiplier: number;
    } = {
      gasPrice: 100000000000, //100 nano aastra
      gasLimit: TX_GAS_DEFAULT.redelegate,
      gasMultiplier: 1,
    }
  ) => {
    amountConfig.setAmount(amount);

    const msg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
      value: _MsgBeginRedelegate
        .encode({
          delegatorAddress: account.bech32Address,
          validatorSrcAddress,
          validatorDstAddress,
          amount: {
            denom: amountConfig.sendCurrency.coinMinimalDenom,
            amount: new Dec(amount)
              .mulTruncate(
                DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
              )
              .truncate()
              .toString(),
          },
        })
        .finish(),
    };

    const gasPrice =
      Number(queryFeeMarket.gasPrice ?? 0) > 0
        ? Number(queryFeeMarket.gasPrice)
        : defaultConfig.gasPrice;
    let gasLimit = defaultConfig.gasLimit;
    let feeAmount = {
      amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
      denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
    };

    try {
      const { gasUsed } = await account.cosmos.simulateTransaction([msg], {
        amount: [feeAmount],
        gasLimit,
      });

      gasLimit = Math.ceil(gasUsed * defaultConfig.gasMultiplier);
      feeAmount = {
        amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
        denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
      };
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
    } catch (e) {
      console.log("simulateRedelegateTx error", e);
    }

    return {
      feeAmount,
      gasPrice,
      gasLimit,
    };
  };

  const simulateWithdrawRewardsTx = async (
    validatorAddresses: string[],
    defaultConfig: {
      gasPrice: number;
      gasLimit: number;
      gasMultiplier: number;
    } = {
      gasPrice: 100000000000, //100 nano aastra
      gasLimit: TX_GAS_DEFAULT.withdraw,
      gasMultiplier: 1,
    }
  ) => {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        value: _MsgWithdrawDelegatorReward
          .encode({
            delegatorAddress: account.bech32Address,
            validatorAddress,
          })
          .finish(),
      };
    });

    const gasPrice =
      Number(queryFeeMarket.gasPrice ?? 0) > 0
        ? Number(queryFeeMarket.gasPrice)
        : defaultConfig.gasPrice;
    let gasLimit = defaultConfig.gasLimit;
    let feeAmount = {
      amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
      denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
    };

    try {
      const { gasUsed } = await account.cosmos.simulateTransaction(msgs, {
        amount: [feeAmount],
        gasLimit,
      });

      gasLimit = Math.ceil(gasUsed * defaultConfig.gasMultiplier);
      feeAmount = {
        amount: new Dec(gasPrice).mul(new Dec(gasLimit)).toString(0),
        denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
      };
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
    } catch (e) {
      console.log("simulateWithdrawRewardsTx error", e);
    }

    return {
      feeAmount,
      gasPrice,
      gasLimit,
    };
  };

  const sendSendTransaction = async (value?: any) => {
    const data = value as MsgSend["value"];

    let amount = formatCoinAmount(data.amount, true);
    amount = amount.split(",").join("");
    amountConfig.setAmount(amount);

    await transfer(
      data.recipient,
      amountConfig,
      queryFeeMarket.baseFee
        ? {
            baseFee: Number(queryFeeMarket.baseFee),
          }
        : {},
      {
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
      }
    );
  };

  const sendDelegateTransaction = async (value?: any) => {
    const data = value as MsgDelegate["value"];

    let amount = formatCoinAmount(data.amount, true);
    amount = amount.split(",").join("");
    const tx = account.cosmos.makeDelegateTx(amount, data.validatorAddress);

    await tx.sendWithGasPrice(
      {
        gas: Number(data.gasLimit ?? 0),
        gasPrice: {
          denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
          amount: new Dec(data.gasPrice ?? 0),
        },
      },
      "Delegate from Rewards Hub",
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

    let amount = formatCoinAmount(data.amount, true);
    amount = amount.split(",").join("");
    const tx = account.cosmos.makeUndelegateTx(amount, data.validatorAddress);
    await tx.sendWithGasPrice(
      {
        gas: Number(data.gasLimit ?? 0),
        gasPrice: {
          denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
          amount: new Dec(data.gasPrice ?? 0),
        },
      },
      "Undelegate from Rewards Hub",
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

    let amount = formatCoinAmount(data.amount, true);
    amount = amount.split(",").join("");
    const tx = account.cosmos.makeBeginRedelegateTx(
      amount,
      data.srcValidatorAddress,
      data.dstValidatorAddress
    );
    await tx.sendWithGasPrice(
      {
        gas: Number(data.gasLimit ?? 0),
        gasPrice: {
          denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
          amount: new Dec(data.gasPrice ?? 0),
        },
      },
      "Redelegate from Rewards Hub",
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

  const sendWithdrawRewardsTransaction = async (value?: any) => {
    const data = value as MsgWithdrawDelegatorReward["value"];

    const validatorAddresses = data.validatorRewards.map(
      ({ validatorAddress }) => validatorAddress
    );

    const tx = account.cosmos.makeWithdrawDelegationRewardTx(
      validatorAddresses
    );
    await tx.sendWithGasPrice(
      {
        gas: Number(data.gasLimit ?? 0),
        gasPrice: {
          denom: chainStore.current.feeCurrencies[0].coinMinimalDenom,
          amount: new Dec(data.gasPrice ?? 0),
        },
      },
      "Withdraw rewards from Rewards Hub",
      {
        preferNoSetMemo: true,
        preferNoSetFee: true,
      },
      {
        onBroadcasted: (txHash) => {
          // analyticsStore.logEvent("astra_hub_claim_reward", {
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

    if (isWithdrawRewardsTransaction(type)) {
      return renderMsgWithdrawDelegatorReward(
        value as MsgWithdrawDelegatorReward["value"]
      );
    }

    if (isSwapTransaction(type)) {
      const msgEther = transactionStore.txMsgs;
      if (msgEther && msgEther.length > 0) {
        return renderMsgSwap(value as MsgSwap);
      }
      return [];
    }

    if (isSendNFTTransaction(type)) {
      return renderMsgTransferNFT(value as MsgTransferNFT["value"]);
    }

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

  const isWithdrawRewardsTransaction = (type?: string) => {
    return type === account.cosmos.msgOpts.withdrawRewards.type;
  };

  const isSwapTransaction = (type?: string) => {
    return type === "wallet-swap";
  };

  const isSendNFTTransaction = (type?: string) => {
    return type === "transfer-nft";
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

      if (isWithdrawRewardsTransaction(type)) {
        await sendWithdrawRewardsTransaction(value);
      }

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

  const getTxText = (type: string | undefined = undefined) => {
    type = type ?? transactionStore.rawData?.type;

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

    if (isWithdrawRewardsTransaction(type)) {
      return {
        confirmation: intl.formatMessage({
          id: "Tx.WithdrawRewards.Confirmation",
        }),
        pending: intl.formatMessage({ id: "Tx.WithdrawRewards.Pending" }),
        success: intl.formatMessage({ id: "Tx.WithdrawRewards.Success" }),
        failure: intl.formatMessage({ id: "Tx.WithdrawRewards.Failure" }),
      };
    }

    if (isSwapTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.Swap.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.Swap.Pending" }),
        success: intl.formatMessage({ id: "Tx.Swap.Success" }),
        failure: intl.formatMessage({ id: "Tx.Swap.Failure" }),
      };
    }

    if (isSendNFTTransaction(type)) {
      return {
        confirmation: intl.formatMessage({ id: "Tx.SendNFT.Confirmation" }),
        pending: intl.formatMessage({ id: "Tx.SendNFT.Pending" }),
        success: intl.formatMessage({ id: "Tx.SendNFT.Success" }),
        failure: intl.formatMessage({ id: "Tx.SendNFT.Failure" }),
      };
    }

    return;
  };

  return {
    getTxDetailsRows,
    sendTransaction,
    getTxAmount,
    getTxText,

    simulateDelegateTx,
    simulateUndelegateTx,
    simulateRedelegateTx,
    simulateWithdrawRewardsTx,
  };
};
