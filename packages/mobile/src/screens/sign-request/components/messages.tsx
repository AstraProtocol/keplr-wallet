import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPrimitive, Staking } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { CoinUtils, Coin } from "@keplr-wallet/unit";
import { clearDecimals } from "../../../modals/sign/messages";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";

import { MsgObj } from "../models";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Hypher from "hypher";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import english from "hyphenation.en-us";
import { useStore } from "../../../stores";

const h = new Hypher(english);

// https://zpl.fi/hyphenation-in-react-native/
function hyphen(text: string): string {
  return h.hyphenateText(text);
}

export function renderRawDataMessage(
  msg: MsgObj
): {
  title: string;
  content: React.ReactElement;
  scrollViewHorizontal?: boolean;
} {
  return {
    title: "Custom",
    content: <RawMsgView msg={msg} />,
    scrollViewHorizontal: true,
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const RawMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const style = useStyle();

  const prettyMsg = useMemo(() => {
    try {
      return JSON.stringify(msg, null, 2);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  }, [msg]);

  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-90",
        "border-radius-12",
      ])}
    >
      <Text style={style.flatten(["text-base-regular", "color-gray-10"])}>
        {prettyMsg}
      </Text>
    </View>
  );
};

export function renderDelegateMsg(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validator: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  // Delegate <b>{amount}</b> to <b>{validator}</b>
  const amoutContent = hyphen(`${amount.amount} ${amount.denom}`);
  const content = `Cho quyền tích lũy ${amoutContent} vào gói ${validator}`;

  return {
    title: "Stake",
    content: <DelegateMsgView msg={content} address={validator} />,
  };
}

export const DelegateMsgView: FunctionComponent<{
  msg: string;
  address: string;
}> = ({ msg, address }) => {
  const { queriesStore, chainStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);
  const validator = queries.cosmos.queryValidators
    .getQueryStatus(Staking.BondStatus.Unspecified)
    .getValidator(address);

  const a = `${msg} ${validator?.description.moniker}`;
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-90",
        "border-radius-12",
      ])}
    >
      <Text style={style.flatten(["text-base-regular", "color-gray-10"])}>
        {a}
      </Text>
    </View>
  );
};
