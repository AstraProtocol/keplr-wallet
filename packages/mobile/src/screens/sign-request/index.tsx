import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Image, Text, Animated } from "react-native";
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

export const TransactionSignRequestView: FunctionComponent<{
  onApprove: (name?: string) => void;
  onReject: (name?: string, isWC?: boolean) => void;
}> = ({ onApprove, onReject }) => {
  const {
    signInteractionStore,
    signClientStore,
    chainStore,
    accountStore,
    queriesStore,
  } = useStore();

  const [isWC, setIsWC] = useState(false);

  useEffect(() => {
    const pendingRequest = signClientStore.pendingRequest;
    const requestSession = signClientStore.requestSession(
      pendingRequest?.topic
    );
    console.log("__DEBUG__: ", requestSession);
    if (pendingRequest && requestSession) {
      setIsWC(true);
    }
  }, [signClientStore]);

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
  console.log(source, sourceUrl);
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
      queriesStore,
      chainId,
      account.bech32Address,
      index
    );

    return content;
  };

  const routes = [
    {
      key: "first",
      title: "Tóm tắt",
    },
    {
      key: "second",
      title: "Dữ liệu",
    },
  ];

  return (
    <React.Fragment>
      {type === SignMsgType.Unknown ? (
        <Animated.ScrollView
          style={style.flatten(["flex-1", "background-color-card-background"])}
          contentContainerStyle={style.flatten(["flex-grow-1"])}
        >
          <RequestHeaderView
            containerStyle={style.flatten([
              "padding-x-16",
              "flex-1",
              "margin-top-64",
              "background-color-card-background",
            ])}
            metadata={metadata}
            source={source}
            sourceUrl={sourceUrl}
            chain={chainStore.current.chainName}
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
                "flex-1",
                "margin-top-64",
                "background-color-card-background",
              ])}
              metadata={metadata}
              source={source}
              sourceUrl={sourceUrl}
              chain={chainStore.current.chainName}
            />
          }
        />
      )}
      <View
        style={style.flatten([
          "margin-bottom-0",
          "margin-x-0",
          "flex",
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
          ])}
        >
          <Button
            containerStyle={style.flatten(["margin-right-12", "flex-1"])}
            color="neutral"
            text={intl.formatMessage({ id: "common.text.reject" })}
            onPress={async () => {
              onReject(source, isWC);
            }}
          />
          <Button
            text={intl.formatMessage({ id: "common.text.verify" })}
            onPress={async () => {
              onApprove(source);
            }}
            containerStyle={style.flatten(["flex-1"])}
          />
        </View>
      </View>
    </React.Fragment>
  );
};
