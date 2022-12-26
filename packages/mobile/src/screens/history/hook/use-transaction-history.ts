import {
  BeginRedelegateContent,
  DelegateContent,
  EthereumTxContent,
  ExecContent,
  GrantContent,
  SendContent,
  Tx,
  UndelegateContent,
  WithdrawDelegatorRewardContent,
} from "@keplr-wallet/stores/build/query/chain-indexing/tx";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import moment from "moment";
import { useIntl } from "react-intl";
import { formatCoin } from "../../../common/utils";
import { useStore } from "../../../stores";

enum SupportedMsgs {
  MsgSend = "/cosmos.bank.v1beta1.MsgSend",
  MsgDelegate = "/cosmos.staking.v1beta1.MsgDelegate",
  MsgUndelegate = "/cosmos.staking.v1beta1.MsgUndelegate",
  MsgBeginRedelegate = "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  MsgWithdrawDelegatorReward = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  MsgGrant = "/cosmos.authz.v1beta1.MsgGrant",
  MsgRevoke = "/cosmos.authz.v1beta1.MsgRevoke",
  MsgExec = "/cosmos.authz.v1beta1.MsgExec",
  MsgEthereumTx = "/ethermint.evm.v1.MsgEthereumTx",
}

export interface ITransactionItem {
  hash: string;
  action: string;
  rightText: string;
  timestamp: string;
  status: "success" | "failure" | undefined;
}

export const useTransactionHistory = () => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const intl = useIntl();

  const chainId = chainStore.current.chainId;
  const account = accountStore.getAccount(chainId);
  const bech32Address = account.bech32Address;
  const url = chainStore.getChain(chainId).raw.chainIndexingUrl;

  const getTxs = async (page: number, limit: number = 20) => {
    const queries = queriesStore.get(chainId);
    const query = queries.cosmos.queryTxs.getQueryBech32Address(
      bech32Address,
      url,
      { page: page > 0 ? page : 1, limit: limit > 0 ? limit : 0 }
    );

    await query.waitFreshResponse();

    return {
      txs: query.txs,
      pagination: query.pagination,
    };
  };

  const formatAmount = (
    amount: { amount: string; denom: string },
    hideDenom: boolean = false,
    maximumFractionDigits: number = 2
  ) => {
    let amountText = "";

    let currency = chainStore.current.currencies.find(
      (cur) => cur.coinMinimalDenom === amount.denom
    );
    if (currency) {
      amountText = formatCoin(
        new CoinPretty(currency, amount.amount),
        hideDenom,
        maximumFractionDigits
      );
    }

    return amountText;
  };

  const getAmountFromLog = (tx: Tx) => {
    const msg = tx.messages[0];
    const content = msg.content as EthereumTxContent;
    const logs = JSON.parse(tx.log) as Log[];

    return (
      logs
        .filter((log) => log.msgIndex === content.msgIndex)
        .map((log) => {
          const attributes =
            log.events.find((event) => event.type === "coin_received")
              ?.attributes || [];
          let found = false;
          let amount = {
            amount: "",
            denom: "",
          };
          for (
            let index = 0;
            index < attributes.length - 1 && !found;
            index++
          ) {
            const attr = attributes[index];
            if (attr.key === "receiver" && attr.value === tx.account) {
              for (
                let nextIndex = index + 1;
                nextIndex < attributes.length && !found;
                nextIndex++
              ) {
                const nextAttr = attributes[nextIndex];
                if (nextAttr.key === "amount") {
                  found = true;

                  const searchIndex = nextAttr.value.search(/[^0-9]/g);
                  amount = {
                    amount: nextAttr.value.substring(0, searchIndex),
                    denom: nextAttr.value.substring(
                      searchIndex,
                      nextAttr.value.length
                    ),
                  };
                }
              }
            }
          }

          return amount;
        })
        .shift() || {
        amount: "",
        denom: "",
      }
    );
  };

  const parseMsgSend = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find((msg) => msg.type === SupportedMsgs.MsgSend);
    if (!msg) {
      return {};
    }

    const content = msg.content as SendContent;

    const action = intl.formatMessage({
      id: `History.${
        content.fromAddress === bech32Address ? "Send" : "Receive"
      }`,
    });

    return {
      action,
      rightText: formatAmount(content.amount[0]),
    };
  };

  const parseMsgDelegate = (tx: Tx): Record<string, any> => {
    const msgs = tx.messages.filter((msg) => {
      return (
        msg.type === SupportedMsgs.MsgDelegate &&
        (msg.content as DelegateContent).delegatorAddress === bech32Address
      );
    });

    const amount = msgs
      .map((msg) => (msg.content as DelegateContent).amount)
      .reduce(
        (prev, current) => {
          return {
            amount: new Dec(prev.amount)
              .add(new Dec(current.amount))
              .toString(),
            denom: current.denom,
          };
        },
        {
          amount: "0",
          denom: "",
        }
      );

    let actionMessageId = "History.Stake";
    if (tx.messageTypes.indexOf(SupportedMsgs.MsgExec) != -1) {
      actionMessageId = "History.Stake.Auto";
    }

    return {
      action: intl.formatMessage({ id: actionMessageId }),
      rightText: formatAmount(amount),
    };
  };

  const parseMsgUndelegate = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find(
      (msg) => msg.type === SupportedMsgs.MsgUndelegate
    );
    if (!msg) {
      return {};
    }

    const content = msg.content as UndelegateContent;

    const action = intl.formatMessage({
      id: "History.Unstake",
    });

    return {
      action,
      rightText: formatAmount(content.amount),
    };
  };

  const parseMsgBeginRedelegate = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find(
      (msg) => msg.type === SupportedMsgs.MsgBeginRedelegate
    );
    if (!msg) {
      return {};
    }

    const content = msg.content as BeginRedelegateContent;

    const action = intl.formatMessage({
      id: "History.Redelegate",
    });

    return {
      action,
      rightText: formatAmount(content.amount),
    };
  };

  const parseMsgWithdrawDelegatorReward = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find(
      (msg) => msg.type === SupportedMsgs.MsgWithdrawDelegatorReward
    );
    if (!msg) {
      return {};
    }

    const content = msg.content as WithdrawDelegatorRewardContent;

    const action = intl.formatMessage({
      id: "History.WithdrawRewards",
    });

    return {
      action,
      rightText: formatAmount(content.amount[0], false, 4),
    };
  };

  const parseMsgGrant = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find((msg) => msg.type === SupportedMsgs.MsgGrant);
    if (!msg) {
      return {};
    }

    const content = msg.content as GrantContent;

    const grant = content.params.maybeGenericGrant.grant;

    const action = intl.formatMessage({
      id: "History.Grant.Stake",
    });

    const expirationText =
      intl.formatMessage({ id: "Expire" }) +
      ": " +
      moment(grant.expiration).format("DD/MM/YYYY");

    return { action, rightText: expirationText };
  };

  const parseMsgRevoke = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find((msg) => msg.type === SupportedMsgs.MsgRevoke);
    if (!msg) {
      return {};
    }

    const action = intl.formatMessage({
      id: "History.Revoke.Stake",
    });

    return {
      action,
    };
  };

  const parseMsgExec = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find((msg) => msg.type === SupportedMsgs.MsgExec);
    if (!msg) {
      return {};
    }

    const content = msg.content as ExecContent;

    return {
      action: content.msgName,
    };
  };

  const parseMsgEthereumTx = (tx: Tx): Record<string, any> => {
    const msg = tx.messages.find(
      (msg) => msg.type === SupportedMsgs.MsgEthereumTx
    );
    if (!msg) {
      return {};
    }

    const content = msg.content as EthereumTxContent;

    let amountText = formatAmount({
      amount: content.params.data.value,
      denom: "aastra",
    });

    let action = content.msgName;
    let actionMessageId = "";

    switch (msg.evmType) {
      case "swapExactTokensForETH":
        // swap USDT > ASA
        amountText = formatAmount(getAmountFromLog(tx));
        actionMessageId = `History.Swap.USDT/ASA`;
        break;
      case "swapExactETHForTokens":
        // swap ASA > USDT
        actionMessageId = `History.Swap.ASA/USDT`;
        break;
      case "transferFrom":
        // transfer nft
        amountText = "";
        action =
          content.params.from === account.ethereumHexAddress
            ? "SendNFT"
            : "ReceiveNFT";
        actionMessageId = `History.${action}`;
        break;
      default:
        // transfer
        action =
          content.params.from === account.ethereumHexAddress
            ? "Send"
            : "Receive";
        actionMessageId = `History.${action}`;
        break;
    }

    return {
      hash: content.txHash,
      action: intl.formatMessage({ id: actionMessageId }),
      rightText: amountText,
    };
  };

  const parseTx = (tx: Tx): Record<string, any> => {
    let messageTypes = tx.messageTypes;
    let msgType = messageTypes[0];

    messageTypes = tx.messageTypes.filter((type) => {
      // Determine what msg type is executed
      return type != SupportedMsgs.MsgExec;
    });

    if (messageTypes.length != 0) {
      msgType =
        messageTypes.find((type) => {
          return (
            type === SupportedMsgs.MsgGrant ||
            type === SupportedMsgs.MsgRevoke ||
            type === SupportedMsgs.MsgDelegate
          );
        }) || msgType;
    }

    const parserMapping: Record<string, (tx: Tx) => Record<string, any>> = {
      [SupportedMsgs.MsgSend]: parseMsgSend,
      [SupportedMsgs.MsgDelegate]: parseMsgDelegate,
      [SupportedMsgs.MsgUndelegate]: parseMsgUndelegate,
      [SupportedMsgs.MsgBeginRedelegate]: parseMsgBeginRedelegate,
      [SupportedMsgs.MsgWithdrawDelegatorReward]: parseMsgWithdrawDelegatorReward,
      [SupportedMsgs.MsgGrant]: parseMsgGrant,
      [SupportedMsgs.MsgRevoke]: parseMsgRevoke,
      [SupportedMsgs.MsgExec]: parseMsgExec,
      [SupportedMsgs.MsgEthereumTx]: parseMsgEthereumTx,
    };

    let params: Record<string, any> = {};
    if (msgType && parserMapping[msgType]) {
      params = parserMapping[msgType](tx);
    }

    return {
      hash: tx.hash,
      action: "",
      rightText: "",
      status: tx.success ? "success" : "failure",
      timestamp: tx.blockTime,
      ...params,
    };
  };

  return {
    getTxs,
    parseTx,
  };
};

type Log = {
  msgIndex: number;
  events: { type: string; attributes: { key: string; value: string }[] }[];
};
