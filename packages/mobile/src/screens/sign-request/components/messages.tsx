import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPrimitive, Staking } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { CoinUtils, Coin, CoinPretty } from "@keplr-wallet/unit";
import { clearDecimals } from "../../../modals/sign/messages";
import { Text, TouchableOpacity, View } from "react-native";
import { useStyle } from "../../../styles";

import { MsgGrant, MsgObj, MsgRevoke } from "../models";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Hypher from "hypher";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import english from "hyphenation.en-us";
import {
  CollapseIcon,
  ExpandIcon,
  ItemRow,
  TextAlign,
} from "../../../components";
import { CardBody, CardDivider } from "../../../components/card";
import { typeOf } from "../helper";

const h = new Hypher(english);

// https://zpl.fi/hyphenation-in-react-native/
function hyphen(text: string): string {
  return h.hyphenateText(text);
}

export function renderRawDataMessage(
  msg: any,
  showHeader: boolean,
  index: number
): {
  title: string;
  content: React.ReactElement;
  scrollViewHorizontal?: boolean;
} {
  return {
    title: "Custom",
    content: <RawMsgView msg={msg} showHeader={showHeader} index={index} />,
    scrollViewHorizontal: true,
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const RawMsgView: FunctionComponent<{
  msg: any;
  showHeader: boolean;
  index: number;
}> = ({ msg, showHeader, index }) => {
  const style = useStyle();
  const type = typeOf(msg);
  const [isOpen, setIsOpen] = useState(false);

  const prettyMsg = useMemo(() => {
    try {
      return JSON.stringify(msg, null, 2);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  }, [msg]);

  if (showHeader) {
    return (
      <View
        style={style.flatten([
          "padding-16",
          "background-color-gray-80",
          "border-radius-12",
        ])}
      >
        <View style={style.flatten(["flex-row", "justify-around"])}>
          <Text
            style={style.flatten([
              "text-base-medium",
              "color-gray-10",
              "margin-right-16",
              "flex-1",
            ])}
          >
            {type}
          </Text>
          <TouchableOpacity
            style={style.flatten(["width-24", "height-24"])}
            onPress={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <CollapseIcon
                color={style.get("color-gray-30").color}
                size={24}
              />
            ) : (
              <ExpandIcon color={style.get("color-gray-30").color} size={24} />
            )}
          </TouchableOpacity>
        </View>
        {isOpen ? (
          <React.Fragment>
            <CardDivider
              style={style.flatten([
                "margin-0",
                "margin-y-12",
                "background-color-gray-70",
              ])}
            />
            <Text style={style.flatten(["text-base-regular", "color-gray-10"])}>
              {prettyMsg}
            </Text>
          </React.Fragment>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-80",
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
    content: <DelegateMsgView msg={content} />,
  };
}

export function renderUnDelegateMsg(
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
  const content = `Cho quyền rút ${amoutContent} từ gói ${validator}`;

  return {
    title: "Stake",
    content: <DelegateMsgView msg={content} />,
  };
}

export function renderBeginRedelegateMsg(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  srcValidator: string,
  dstValidator: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom,
  };

  const amoutContent = hyphen(`${amount.amount} ${amount.denom}`);
  const content = `Cho quyền chuyển đổi gói tích lũy ${amoutContent}`;

  return {
    title: "Stake",
    content: (
      <ReDelegateMsgView
        msg={content}
        srcValidator={srcValidator}
        dstValidator={dstValidator}
      />
    ),
  };
}

export function renderWithdrawDelegatorRewardMsg(
  amount: CoinPretty,
  validator: string
) {
  // Delegate <b>{amount}</b> to <b>{validator}</b>
  const amoutContent = hyphen(`${amount.toString()}`);
  const content = `Cho quyền nhận phần thường ${amoutContent} từ gói tích lũy ${validator}`;

  return {
    title: "Stake",
    content: <DelegateMsgView msg={content} />,
  };
}

export function renderGrantMsg(msgs: any[]) {
  const renderedMsgs = (() => {
    return msgs.map((msg, i) => {
      if ("grant" in msg) {
        const grantMsg = msg as MsgGrant;
        switch (grantMsg.grant?.authorization?.msg) {
          case "/cosmos.staking.v1beta1.MsgDelegate": {
            const message = `Cho quyền tich luỹ vào gói ${msg.grantee}`;
            return (
              <GrantMsgView
                key={i.toString()}
                msg={message}
                grantee={msg.grantee}
              />
            );
          }
          case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
            const message = `Cho quyền tự động nhận phần thường từ ${msg.grantee} và sử dụng phần thưởng đó để tái tích luỹ`;
            return (
              <GrantMsgView
                key={i.toString()}
                msg={message}
                grantee={msg.grantee}
              />
            );
          }
        }
      } else {
        const revokeMsg = msg as MsgRevoke;
        switch (revokeMsg.msg_type_url) {
          case "/cosmos.staking.v1beta1.MsgDelegate": {
            const message = `Thu hồi quyền tich luỹ vào gói ${msg.grantee}`;
            return (
              <GrantMsgView
                key={i.toString()}
                msg={message}
                grantee={msg.grantee}
              />
            );
          }
          case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
            const message = `Thu hồi quyền tự động nhận phần thường từ ${msg.grantee} và sử dụng phần thưởng đó để tái tích luỹ`;
            return (
              <RevokeMsgView
                key={i.toString()}
                msg={message}
                grantee={msg.grantee}
              />
            );
          }
        }
      }
      const prettyMsg = useMemo(() => {
        try {
          return JSON.stringify(msg, null, 2);
        } catch (e) {
          console.log(e);
          return "Failed to decode the msg";
        }
      }, [msg]);
      return <DelegateMsgView key={i.toString()} msg={prettyMsg} />;
    });
  })();

  return {
    title: "Grant",
    content: <React.Fragment>{renderedMsgs}</React.Fragment>,
  };
}

export const DelegateMsgView: FunctionComponent<{
  msg: string;
}> = ({ msg }) => {
  const style = useStyle();
  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-80",
        "border-radius-12",
        "flex-row",
        "justify-around",
      ])}
    >
      <Text
        style={style.flatten([
          "text-base-medium",
          "color-gray-10",
          "margin-right-16",
          "flex-1",
        ])}
      >
        {msg}
      </Text>
      <ExpandIcon color={style.get("color-gray-30").color} size={24} />
    </View>
  );
};

export const RevokeMsgView: FunctionComponent<{
  msg: string;
  grantee: string;
}> = ({ msg, grantee }) => {
  const style = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-80",
        "border-radius-12",
        "margin-bottom-16",
      ])}
    >
      <View style={style.flatten(["flex-row", "justify-around"])}>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-gray-10",
            "margin-right-16",
            "flex-1",
          ])}
        >
          {msg}
        </Text>
        <TouchableOpacity
          style={style.flatten(["width-24", "height-24"])}
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <CollapseIcon color={style.get("color-gray-30").color} size={24} />
          ) : (
            <ExpandIcon color={style.get("color-gray-30").color} size={24} />
          )}
        </TouchableOpacity>
      </View>
      {isOpen ? (
        <React.Fragment>
          <CardDivider
            style={style.flatten([
              "margin-0",
              "margin-top-12",
              "background-color-gray-70",
            ])}
          />
          <ItemRow
            style={{
              paddingHorizontal: 0,
              marginTop: 12,
              marginBottom: 12,
              marginLeft: 0,
              marginRight: 0,
            }}
            columns={[
              {
                text: "Địa chỉ của người bị thu hồi quyền",
                textColor: style.get("color-label-text-2").color,
              },
              {
                text: grantee,
                textColor: style.get("color-label-text-1").color,
                textAlign: TextAlign.right,
                flex: 1,
              },
            ]}
          />
        </React.Fragment>
      ) : null}
    </View>
  );
};
export const GrantMsgView: FunctionComponent<{
  msg: string;
  grantee: string;
}> = ({ msg, grantee }) => {
  const style = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-80",
        "border-radius-12",
        "margin-bottom-16",
      ])}
    >
      <View style={style.flatten(["flex-row", "justify-around"])}>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-gray-10",
            "margin-right-16",
            "flex-1",
          ])}
        >
          {msg}
        </Text>
        <TouchableOpacity
          style={style.flatten(["width-24", "height-24"])}
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <CollapseIcon color={style.get("color-gray-30").color} size={24} />
          ) : (
            <ExpandIcon color={style.get("color-gray-30").color} size={24} />
          )}
        </TouchableOpacity>
      </View>
      {isOpen ? (
        <React.Fragment>
          <CardDivider
            style={style.flatten([
              "margin-0",
              "margin-top-12",
              "background-color-gray-70",
            ])}
          />
          <ItemRow
            style={{
              paddingHorizontal: 0,
              marginTop: 12,
              marginBottom: 12,
              marginLeft: 0,
              marginRight: 0,
            }}
            columns={[
              {
                text: "Địa chỉ của nhà được cấp quyền",
                textColor: style.get("color-label-text-2").color,
              },
              {
                text: grantee,
                textColor: style.get("color-label-text-1").color,
                textAlign: TextAlign.right,
                flex: 1,
              },
            ]}
          />
        </React.Fragment>
      ) : null}
    </View>
  );
};
export const ReDelegateMsgView: FunctionComponent<{
  msg: string;
  srcValidator: string;
  dstValidator: string;
}> = ({ msg, srcValidator, dstValidator }) => {
  const style = useStyle();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View
      style={style.flatten([
        "padding-16",
        "background-color-gray-80",
        "border-radius-12",
      ])}
    >
      <View style={style.flatten(["flex-row", "justify-around"])}>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-gray-10",
            "margin-right-16",
            "flex-1",
          ])}
        >
          {msg}
        </Text>
        <TouchableOpacity
          style={style.flatten(["width-24", "height-24"])}
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <CollapseIcon color={style.get("color-gray-30").color} size={24} />
          ) : (
            <ExpandIcon color={style.get("color-gray-30").color} size={24} />
          )}
        </TouchableOpacity>
      </View>
      {isOpen ? (
        <React.Fragment>
          <CardDivider
            style={style.flatten([
              "margin-0",
              "margin-top-12",
              "background-color-gray-70",
            ])}
          />
          <ItemRow
            style={{
              paddingHorizontal: 0,
              marginTop: 12,
              marginBottom: 12,
              marginLeft: 0,
              marginRight: 0,
            }}
            columns={[
              {
                text: "Chuyển từ",
                textColor: style.get("color-label-text-2").color,
              },
              {
                text: srcValidator,
                textColor: style.get("color-label-text-1").color,
                textAlign: TextAlign.right,
                flex: 1,
              },
            ]}
          />
          <CardDivider
            style={style.flatten(["margin-0", "background-color-gray-70"])}
          />
          <ItemRow
            style={{
              paddingHorizontal: 0,
              marginTop: 12,
              marginBottom: 12,
              marginLeft: 0,
              marginRight: 0,
            }}
            columns={[
              {
                text: "Sang",
                textColor: style.get("color-label-text-2").color,
              },
              {
                text: dstValidator,
                textColor: style.get("color-label-text-1").color,
                textAlign: TextAlign.right,
                flex: 1,
              },
            ]}
          />
        </React.Fragment>
      ) : null}
    </View>
  );
};