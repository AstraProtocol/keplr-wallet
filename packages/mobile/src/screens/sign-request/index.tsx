import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { FormattedMessage, useIntl } from "react-intl";
import FastImage from "react-native-fast-image";
import { Button } from "../../components";
import { CardDivider } from "../../components/card";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { DetailsDataCard, RawDataCard } from "./components";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { getType } from "./helper";

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

  const intl = useIntl();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: "first",
      title: "Tóm tắt",
    },
    {
      key: "second",
      title: "Dữ liệu",
    },
  ]);

  const FirstRoute = () => (
    <DetailsDataCard
      containerStyle={style.flatten([
        "margin-y-card-gap",
        "background-color-transparent",
        "flex-1",
      ])}
      msgs={msgs as AminoMsg[]}
      accountStore={accountStore}
      chainStore={chainStore}
      queriesStore={queriesStore}
    />
  );

  const SecondRoute = () => (
    <RawDataCard
      containerStyle={style.flatten([
        "margin-y-card-gap",
        "background-color-transparent",
        "flex-1",
      ])}
      msgs={msgs as AminoMsg[]}
    />
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  return (
    <React.Fragment>
      <View style={style.flatten(["padding-x-16", "flex", "margin-top-20"])}>
        <View
          style={style.flatten([
            "padding-12",
            "flex-row",
            "justify-center",
            "items-center",
          ])}
        >
          <View
            style={style.flatten([
              "width-80",
              "height-80",
              "border-radius-64",
              "background-color-secondary",
              "items-center",
              "justify-center",
            ])}
          >
            {metadata && metadata.icons.length > 0 ? (
              <FastImage
                style={{
                  width: 64,
                  height: 64,
                }}
                source={{
                  uri: metadata.icons[0],
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <Image
                source={require("../../assets/image/icon_verified.png")}
                resizeMode="contain"
                style={style.flatten(["width-64", "height-64"])}
              />
            )}
          </View>
        </View>
        <Text style={style.flatten(["color-gray-10", "text-center", "h4"])}>
          {intl.formatMessage(
            { id: "walletconnect.text.verify" },
            { name: source, type: type }
          )}
        </Text>
        <View
          style={style.flatten([
            "margin-top-8",
            "flex-row",
            "height-24",
            "justify-center",
            "items-center",
          ])}
        >
          <Text style={style.flatten(["color-gray-30", "body3"])}>
            {sourceUrl}
          </Text>
          <View
            style={style.flatten([
              "height-24",
              "margin-left-6",
              "padding-x-6",
              "border-radius-22",
              "border-width-1",
              "border-color-blue-60",
              "background-color-alert-inline-info-background",
              "items-center",
              "justify-center",
            ])}
          >
            <Text
              style={style.flatten([
                "color-gray-10",
                "text-center",
                "text-caption2",
              ])}
            >
              {chainStore.current.chainName}
            </Text>
          </View>
        </View>
      </View>
      <TabView
        lazy
        renderLazyPlaceholder={() => <Text>empyt</Text>}
        style={style.flatten(["margin-top-16", "height-600"])}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={style.get("background-color-tab-icon-active")}
            //   scrollEnabled={true}
            style={style.flatten([
              "background-color-transparent",
              "border-width-bottom-1",
              "border-color-border",
            ])}
            renderLabel={({ route, focused }) => (
              <Text
                style={style.flatten(
                  ["text-base-regular", "color-tab-icon-inactive"],
                  [
                    focused && "text-base-semi-bold",
                    focused && "color-tab-icon-active",
                  ]
                )}
              >
                {` ${route.title} ` /* add space to avoid text is truncated */}
              </Text>
            )}
          />
        )}
      />
      {/* <View style={style.flatten(["flex-7"])} /> */}
      <View style={style.flatten(["margin-bottom-0", "margin-x-0", "flex"])}>
        <CardDivider
          style={style.flatten(["background-color-gray-70", "margin-0"])}
        />
        <View style={style.flatten(["flex-row", "padding-16", "items-center"])}>
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
