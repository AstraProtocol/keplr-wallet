import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Animated, StyleSheet, TouchableOpacity } from "react-native";
// import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useIntl } from "react-intl";
import { Button } from "../../components";
import { CardDivider } from "../../components/card";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { RawDataCard, renderMessage, RequestHeaderView } from "./components";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { getType, SignMsgType } from "./helper";
import SignRequestTabView from "./tabview-scrollable";
import { useStaking } from "../staking/hook/use-staking";
import { CloseLargeIcon } from "../../components/icon/outlined";

export const TransactionSignRequestView: FunctionComponent<{
  onApprove: (name?: string) => void;
  onReject: (name?: string, isWC?: boolean) => void;
}> = ({ onApprove, onReject }) => {
  const {
    signInteractionStore,
    signClientStore,
    chainStore,
    accountStore,
  } = useStore();

  const { getValidator, getRewardsAmountOf } = useStaking();
  const [isWC, setIsWC] = useState(false);
  const [wasCanceled, setWasCanceled] = useState(false);

  useEffect(() => {
    const pendingRequest = signClientStore.pendingRequest;
    console.log(
      "__DEBUG__: id",
      pendingRequest?.params.request,
      pendingRequest?.params.request.params.requestId
    );
    const requestSession = signClientStore.requestSession(
      pendingRequest?.topic
    );
    if (pendingRequest && requestSession) {
      setIsWC(true);
    }
    console.log("__DEBUG__: cancelRequestId", signClientStore.cancelRequestId);
    if (
      signClientStore.cancelRequestId &&
      signClientStore.cancelRequestId ===
        signClientStore.pendingRequest?.params.request.params.requestId
    ) {
      console.log("ahihih");
      setWasCanceled(true);
    }
  }, [signClientStore, signClientStore.cancelRequestId]);

  const waitingData = signInteractionStore.waitingData;
  const request = signClientStore.pendingRequest;
  const session = signClientStore.requestSession(request?.topic);

  const metadata = session?.peer.metadata;

  const data = waitingData?.data;

  const style = useStyle();

  const signDocWrapper = signInteractionStore.waitingData?.data.signDocWrapper;
  const mode = signDocWrapper ? signDocWrapper.mode : "none";
  const msgs = signDocWrapper
    ? signDocWrapper.mode === "amino"
      ? signDocWrapper.aminoSignDoc.msgs
      : signDocWrapper.protoSignDoc.txMsgs
    : [];
  const type = getType(msgs as any[]);
  const source = isWC ? session?.peer.metadata.name : data?.msgOrigin;
  const sourceUrl = isWC ? session?.peer.metadata.url : data?.msgOrigin;

  function getNetworkName(str: string): string {
    const delimiterIndex: number = str.indexOf("-");
    if (delimiterIndex >= 0) {
      const networkName: string = str.slice(delimiterIndex + 1);
      return capitalizeFirstLetter(networkName);
    } else {
      return "";
    }
  }

  function capitalizeFirstLetter(str: string): string {
    if (!str) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const networkName = getNetworkName(request?.params.chainId ?? "");

  const intl = useIntl();

  const renderDetail = ({ index }: { index: number }) => {
    const msg = msgs[index];
    const chainId = chainStore.current.chainId;
    const account = accountStore.getAccount(chainId);
    const chainInfo = chainStore.getChain(chainId);
    const { content } = renderMessage(
      account,
      msg,
      chainInfo.currencies,
      getValidator,
      getRewardsAmountOf,
      index,
      intl
    );

    return content;
  };

  const routes = [
    {
      key: "first",
      title: intl.formatMessage({ id: "Summary" }),
    },
    {
      key: "second",
      title: intl.formatMessage({ id: "Data" }),
    },
  ];

  return (
    <React.Fragment>
      <Animated.View
        style={StyleSheet.flatten([
          style.flatten(["background-color-black", "absolute-fill"]),
          {
            opacity: 0,
          },
        ])}
      />

      <View
        style={style.flatten([
          "margin-x-0",
          "flex-1",
          "margin-top-106",
          "background-color-card-background",
          "border-radius-16",
          "overflow-hidden",
        ])}
      >
        {type === SignMsgType.Unknown ? (
          <Animated.ScrollView
            style={style.flatten([
              "flex-1",
              "background-color-card-background",
            ])}
            contentContainerStyle={style.flatten(["flex-grow-1"])}
          >
            <RequestHeaderView
              containerStyle={style.flatten([
                "padding-x-16",
                "flex-1",
                "background-color-card-background",
                wasCanceled ? "margin-top-40" : "margin-top-64",
              ])}
              metadata={metadata}
              source={source}
              sourceUrl={sourceUrl}
              chain={networkName}
              type={intl.formatMessage({ id: type })}
              wasCanceled={wasCanceled}
            />
            <RawDataCard
              containerStyle={style.flatten([
                "margin-y-card-gap",
                "background-color-transparent",
                "flex-1",
              ])}
              msgs={msgs as AminoMsg[]}
            />
          </Animated.ScrollView>
        ) : (
          <SignRequestTabView
            data={msgs as any[]}
            routes={routes}
            renderDetails={renderDetail}
            header={
              <RequestHeaderView
                containerStyle={style.flatten([
                  "padding-x-16",
                  "flex-1",
                  "background-color-card-background",
                  wasCanceled ? "margin-top-40" : "margin-top-64",
                ])}
                metadata={metadata}
                source={source}
                sourceUrl={sourceUrl}
                chain={networkName}
                type={intl.formatMessage({ id: type })}
                wasCanceled={wasCanceled}
              />
            }
          />
        )}
        <TouchableOpacity
          onPress={async () => {
            onReject(source, isWC);
          }}
          style={{
            ...style.flatten([
              "width-44",
              "height-44",
              "items-center",
              "absolute",
            ]),
            right: 0,
            top: 12,
          }}
        >
          <CloseLargeIcon size={24} color={style.get("color-white").color} />
        </TouchableOpacity>
        <View
          style={style.flatten([
            "margin-bottom-0",
            "margin-x-0",
            "background-color-card-background",
          ])}
        >
          <CardDivider
            style={style.flatten(["background-color-gray-70", "margin-0"])}
          />
          <View
            style={style.flatten([
              "flex-row",
              "padding-16",
              "items-center",
              "margin-bottom-16",
              "height-68",
            ])}
          >
            <Button
              containerStyle={style.flatten(["margin-right-12", "flex-1"])}
              color="neutral"
              text={intl.formatMessage({
                id: wasCanceled ? "common.text.close" : "common.text.reject",
              })}
              onPress={async () => {
                onReject(source, isWC);
              }}
            />
            {wasCanceled ? null : (
              <Button
                text={intl.formatMessage({ id: "Confirm" })}
                onPress={async () => {
                  onApprove(source);
                }}
                containerStyle={style.flatten(["flex-1"])}
              />
            )}
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};
