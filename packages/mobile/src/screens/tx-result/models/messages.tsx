/* eslint-disable react/display-name */

import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPrimitive } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Coin, CoinPretty, CoinUtils } from "@keplr-wallet/unit";
import yaml from "js-yaml";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import converter from "bech32-converting";
import { Buffer } from "buffer/";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { formatCoin, formatDate, formatPercent } from "../../../common/utils";
import {
  AlignItems,
  buildLeftColumn,
  buildRightColumn,
  IRow,
  RowType,
} from "../../../components";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useStaking } from "../../staking/hook/use-staking";

export interface MessageObj {
  readonly type: string;
  readonly value: unknown;
}

export interface MsgSend {
  value: {
    amount: CoinPretty;
    fee: CoinPretty;
    recipient: string;
    gasLimit: number | string | undefined;
    gasPrice: number | string | undefined;
  };
}

export interface MsgTransfer {
  value: {
    source_port: string;
    source_channel: string;
    token: {
      denom: string;
      amount: string;
    };
    sender: string;
    receiver: string;
    timeout_height: {
      revision_number: string | undefined;
      revision_height: string;
    };
  };
}

export interface MsgDelegate {
  value: {
    amount: CoinPretty;
    fee: CoinPretty;
    validatorAddress: string;
    validatorName: string | undefined;
    commission: number | string | undefined;
    gasLimit: number | string | undefined;
    gasPrice: number | string | undefined;
  };
}

export interface MsgUndelegate {
  value: {
    amount: CoinPretty;
    fee: CoinPretty;
    validatorAddress: string;
    validatorName: string | undefined;
    commission: number | string | undefined;
    gasLimit: number | string | undefined;
    gasPrice: number | string | undefined;
  };
}

export interface MsgWithdrawDelegatorReward {
  value: {
    totalRewards: CoinPretty | undefined;
    fee: CoinPretty;
    validatorRewards: [
      {
        validatorAddress: string;
        validatorName: string;
        rewards: CoinPretty;
      }
    ];
    gasLimit: number | string | undefined;
    gasPrice: number | string | undefined;
  };
}

export interface MsgBeginRedelegate {
  value: {
    amount: CoinPretty;
    fee: CoinPretty;
    srcValidatorAddress: string;
    srcValidatorName: string | undefined;
    srcCommission: number | string | undefined;
    dstValidatorAddress: string;
    dstValidatorName: string | undefined;
    dstCommission: number | string | undefined;
    gasLimit: number | string | undefined;
    gasPrice: number | string | undefined;
  };
}

export interface MsgVote {
  value: {
    proposal_id: string;
    voter: string;
    // In the stargate, option would be the enum (0: empty, 1: yes, 2: abstain, 3: no, 4: no with veto).
    option: string | number;
  };
}

export interface MsgInstantiateContract {
  value: {
    // Admin field can be omitted.
    admin?: string;
    sender: string;
    code_id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    init_msg: object;
    init_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

// This message can be a normal cosmwasm message or a secret-wasm message.
export interface MsgExecuteContract {
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object | string;
    sender: string;
    // The field is for wasm message.
    funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    // The bottom fields are for secret-wasm message.
    sent_funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    callback_code_hash?: string;
    callback_sig?: string | null;
  };
}

export interface MsgLink {
  value: {
    links: [
      {
        from: string;
        to: string;
      }
    ];
    address: string;
  };
}

export interface MsgSwap {
  inputAmount: string;
  outputAmount: string;
  exchageRate: string;
  minimumReceived: string;
  liquidityFee: string;
  slippageTolerance: string;
  timestamp?: number;
  transactionHash?: string;
  txFee?: string;
  gasUsed?: string;
}

export interface MsgTransferNFT {
  value: {
    fee: CoinPretty;
    recipient: string;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function renderUnknownMessage(msg: object) {
  return {
    icon: undefined,
    title: "Custom",
    content: <UnknownMsgView msg={msg} />,
    scrollViewHorizontal: true,
  };
}

const common: {
  type: RowType;
  alignItems?: AlignItems;
  itemSpacing?: number;
} = {
  type: "items",
  alignItems: AlignItems.center,
  itemSpacing: 12,
};

export const getTransactionTimeRow = (date: Date | undefined = undefined) => {
  const intl = useIntl();

  return {
    ...common,
    cols: [
      buildLeftColumn({
        text: intl.formatMessage({
          id: "TransactionTime",
        }),
        flex: 4,
      }),
      buildRightColumn({ text: formatDate(date ?? new Date()), flex: 6 }),
    ],
  };
};

export const getTransactionFeeRow = (feeAmount: CoinPretty) => {
  const intl = useIntl();

  return getTransactionRow(
    intl.formatMessage({
      id: "TransactionFee",
    }),
    formatCoin(feeAmount, false, 6)
  );
};

export const getTransactionRow = (leftText: string, rightText: string) => {
  return {
    ...common,
    cols: [
      buildLeftColumn({
        text: leftText,
      }),
      buildRightColumn({ text: rightText }),
    ],
  };
};

export const getSeparatorRow = () => {
  return { type: "separator" } as IRow;
};

export function renderMsgSend(value: MsgSend["value"]): IRow[] {
  const intl = useIntl();

  let _toAddress = value.recipient;
  if (_toAddress.startsWith("astra")) {
    try {
      _toAddress = converter("astra").toHex(value.recipient);
      console.log("toAddress: ", _toAddress);
    } catch {}
  }

  const rows: IRow[] = [
    {
      ...common,
      alignItems: AlignItems.top,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "ReceiverAddress",
          }),
          flex: 4,
        }),
        buildRightColumn({ text: _toAddress, flex: 6 }),
      ],
    },
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export function renderMsgSwap(data: MsgSwap): IRow[] {
  const intl = useIntl();

  // const total = BigNumber.from(dataSign.value).add(
  //   BigNumber.from(dataSign.gas)
  // );
  const rows: IRow[] = [
    // {
    //   ...common,
    //   cols: [
    //     buildLeftColumn({
    //       text: "Hex Data",
    //       flex: 3,
    //     }),
    //     buildRightColumn({
    //       text: data.data,
    //       flex: 7,
    //     }),
    //   ],
    // },
    {
      ...common,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "swap.exchangeRate" }),
          flex: 3,
        }),
        buildRightColumn({
          text: data.exchageRate,
          flex: 7,
        }),
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "TransactionFee" }),
          flex: 3,
        }),
        buildRightColumn({
          text: data.txFee || "",
          flex: 7,
        }),
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "swap.liquidityFee" }),
          flex: 5,
        }),
        buildRightColumn({
          text: data.liquidityFee,
          flex: 5,
        }),
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "swap.titleSlippageDescribe" }),
          flex: 3,
        }),
        buildRightColumn({
          text: data.slippageTolerance,
          flex: 7,
        }),
      ],
    },
  ];

  return rows;
}

export function renderMsgBeginRedelegate(value: MsgBeginRedelegate["value"]) {
  const intl = useIntl();

  const rows: IRow[] = [
    getTransactionRow(
      intl.formatMessage({
        id: "tx.result.models.msgBeginRedelegate.from",
      }),
      value.srcValidatorName ?? ""
    ),
    getTransactionRow(
      intl.formatMessage({
        id: "To",
      }),
      value.dstValidatorName ?? ""
    ),
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export function renderMsgUndelegate(value: MsgUndelegate["value"]): IRow[] {
  const intl = useIntl();

  const rows: IRow[] = [
    getTransactionRow(
      intl.formatMessage({
        id: "tx.result.models.msgUndelegate.from",
      }),
      value.validatorName ?? ""
    ),
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export function renderMsgDelegate(value: MsgDelegate["value"]) {
  const { getValidatorAPR } = useStaking();
  const intl = useIntl();

  const commissionText = formatPercent(value.commission);
  const apr = getValidatorAPR(value.validatorAddress);

  const rows: IRow[] = [
    getTransactionRow(
      intl.formatMessage({
        id: "StakingProvider",
      }),
      value.validatorName ?? ""
    ),
    getTransactionRow(
      intl.formatMessage({
        id: "APR",
      }),
      formatPercent(apr)
    ),
    getTransactionRow(
      intl.formatMessage({
        id: "Commission",
      }),
      commissionText
    ),
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export function renderMsgWithdrawDelegatorReward(
  value: MsgWithdrawDelegatorReward["value"]
): IRow[] {
  const intl = useIntl();
  const style = useStyle();

  let rows: IRow[] = [
    getTransactionRow(
      intl.formatMessage({
        id: "tx.result.models.msgWithdrawDelegatorReward.withdraw",
      }),
      ""
    ),
  ];

  const validatorRows = value.validatorRewards.map(
    ({ validatorName, rewards }) => {
      return {
        ...common,
        cols: [
          buildLeftColumn({
            text: validatorName,
            textColor: style.get("color-label-text-1").color,
          }),
          buildRightColumn({ text: formatCoin(rewards, false, 4) }),
        ],
      };
    }
  );

  rows = [
    ...rows,
    ...validatorRows,
    getSeparatorRow(),
    getTransactionTimeRow(),
    getSeparatorRow(),
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export function renderMsgVote(
  proposalId: string,
  option: string | number
): IRow[] {
  const intl = useIntl();
  const textualOption = (() => {
    if (typeof option === "string") {
      return option;
    }

    switch (option) {
      case 0:
        return intl.formatMessage({
          id: "Empty",
        });
      case 1:
        return intl.formatMessage({
          id: "tx.result.models.msgVote.option.yes",
        });
      case 2:
        return intl.formatMessage({
          id: "tx.result.models.msgVote.option.abstain",
        });
      case 3:
        return intl.formatMessage({ id: "No" });
      case 4:
        return intl.formatMessage({
          id: "tx.result.models.msgVote.option.noWithVeto",
        });
      default:
        return intl.formatMessage({
          id: "tx.result.models.msgVote.option.unspecified",
        });
    }
  })();

  const rows: IRow[] = [
    {
      ...common,
      alignItems: AlignItems.top,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "tx.result.models.msgVote.option.vote",
          }),
          flex: 3,
        }),
        buildRightColumn({ text: textualOption, flex: 7 }),
      ],
    },
    {
      ...common,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "tx.result.models.msgVote.option.proposalLabel",
          }),
          flex: 3,
        }),
        buildRightColumn({
          text: intl.formatMessage(
            { id: "tx.result.models.msgVote.option.proposalValue" },
            { proposalId }
          ),
          flex: 7,
        }),
      ],
    },
  ];

  return rows;
}

export function renderMsgExecuteContract(
  currencies: Currency[],
  sentFunds: CoinPrimitive[],
  _callbackCodeHash: string | undefined,
  contract: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string
) {
  const sent: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of sentFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    sent.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  // const isSecretWasm = callbackCodeHash != null;

  return {
    icon: "fas fa-cog",
    title: "Execute Wasm Contract",
    content: (
      <Text>
        <Text>
          <Text>Execute contract </Text>
          <Text style={{ fontWeight: "bold" }}>
            {Bech32Address.shortenAddress(contract, 26)}
          </Text>
          {sent.length > 0 ? (
            <Text>
              <Text> by sending </Text>
              <Text style={{ fontWeight: "bold" }}>
                {sent
                  .map((coin) => {
                    return `${coin.amount} ${coin.denom}`;
                  })
                  .join(",")}
              </Text>
            </Text>
          ) : undefined}
        </Text>
        {/* TODO: Add secret wasm badge */}
        {/*isSecretWasm ? (
          <React.Fragment>
            <br />
            <Badge
              color="primary"
              pill
              style={{ marginTop: "6px", marginBottom: "6px" }}
            >
              <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
            </Badge>
          </React.Fragment>
        ) : (
          <br />
        )*/}
        <WasmExecutionMsgView msg={msg} />
      </Text>
    ),
  };
}

export function renderMsgTransferNFT(value: MsgTransferNFT["value"]): IRow[] {
  const intl = useIntl();

  let _toAddress = value.recipient;
  if (_toAddress.startsWith("astra")) {
    try {
      _toAddress = converter("astra").toHex(value.recipient);
      console.log("toAddress: ", _toAddress);
    } catch {}
  }

  const rows: IRow[] = [
    {
      ...common,
      alignItems: AlignItems.top,
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "ReceiverAddress",
          }),
          flex: 4,
        }),
        buildRightColumn({ text: _toAddress, flex: 6 }),
      ],
    },
    getTransactionFeeRow(value.fee),
  ];

  return rows;
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const style = useStyle();

  // TODO: Toggle open button?
  // const [isOpen, setIsOpen] = useState(true);
  // const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via Keplr, Keplr cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that Keplr cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const keplr = await accountStore
            .getAccount(chainStore.current.chainId)
            .getKeplr();
          if (!keplr) {
            throw new Error("Can't get the keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(chainStore.current.chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            "Failed to decrypt Secret message. This may be due to Keplr viewing key not matching the transaction viewing key."
          );
        }
      })();
    }
  }, [accountStore, chainStore, chainStore.current.chainId, msg]);

  return (
    <Text style={style.flatten(["margin-top-8"])}>
      <Text>{`\n${detailsMsg}`}</Text>
      {warningMsg ? (
        <Text style={style.flatten(["color-danger-200"])}>{warningMsg}</Text>
      ) : null}
    </Text>
  );
});

/*
export function renderMsgInstantiateContract(
  currencies: Currency[],
  intl: IntlShape,
  initFunds: CoinPrimitive[],
  admin: string | undefined,
  codeId: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  initMsg: object
) {
  const funds: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of initFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    funds.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom,
    });
  }

  return {
    icon: "fas fa-cog",
    title: intl.formatMessage({
      id: "sign.list.message.wasm/MsgInstantiateContract.title",
    }),
    content: (
      <React.Fragment>
        <FormattedMessage
          id="sign.list.message.wasm/MsgInstantiateContract.content"
          values={{
            b: (...chunks: any[]) => <b>{chunks}</b>,
            br: <br />,
            admin: admin ? Bech32Address.shortenAddress(admin, 30) : "",
            ["only-admin-exist"]: (...chunks: any[]) => (admin ? chunks : ""),
            codeId: codeId,
            label: label,
            ["only-funds-exist"]: (...chunks: any[]) =>
              funds.length > 0 ? chunks : "",
            funds: funds
              .map((coin) => {
                return `${coin.amount} ${coin.denom}`;
              })
              .join(","),
          }}
        />
        <br />
        <WasmExecutionMsgView msg={initMsg} />
      </React.Fragment>
    ),
  };
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const [isOpen, setIsOpen] = useState(true);
  const intl = useIntl();

  const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via Keplr, Keplr cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that Kepler cannot decrypt it and allows the user to choose.
    if (typeof msg === "string") {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, "base64"));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const keplr = await accountStore
            .getAccount(chainStore.current.chainId)
            .getKeplr();
          if (!keplr) {
            throw new Error("Can't get the keplr API");
          }

          const enigmaUtils = keplr.getEnigmaUtils(chainStore.current.chainId);
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg("");
        } catch {
          setWarningMsg(
            intl.formatMessage({
              id:
                "sign.list.message.wasm/MsgExecuteContract.content.warning.secret-wasm.failed-decryption",
            })
          );
        }
      })();
    }
  }, [chainStore, chainStore.current.chainId, intl, msg]);

  return (
    <div>
      {isOpen ? (
        <React.Fragment>
          <pre style={{ width: "280px" }}>{isOpen ? detailsMsg : ""}</pre>
          {warningMsg ? <div>{warningMsg}</div> : null}
        </React.Fragment>
      ) : null}
      <Button
        size="sm"
        style={{ float: "right", marginRight: "6px" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          toggleOpen();
        }}
      >
        {isOpen
          ? intl.formatMessage({
              id: "sign.list.message.wasm.button.close",
            })
          : intl.formatMessage({
              id: "sign.list.message.wasm.button.details",
            })}
      </Button>
    </div>
  );
});
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const UnknownMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const style = useStyle();

  const prettyMsg = useMemo(() => {
    try {
      return yaml.dump(msg);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  }, [msg]);

  return (
    <Text style={style.flatten(["body3", "color-text-black-low"])}>
      {prettyMsg}
    </Text>
  );
};

export function clearDecimals(dec: string): string {
  if (!dec.includes(".")) {
    return dec;
  }

  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === "0") {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === ".") {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}

export function join<T extends any>(items: T[], separator?: T): T[] {
  let newItems: T[] = [];
  items.forEach((item, index) => {
    newItems = [
      ...newItems,
      item,
      ...(index < items.length - 1 && separator ? [separator] : []),
    ];
  });
  return newItems;
}

export function insert<T extends any>(items: T[], item: T, index: number): T[] {
  if (index < 0 || items.length < index) {
    return items;
  }

  return [...items.slice(0, index), item, ...items.slice(index)];
}
