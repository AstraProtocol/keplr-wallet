import React, { FunctionComponent, useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { FormattedMessage, useIntl } from "react-intl";
import FastImage from "react-native-fast-image";
import { CollapseIcon, ExpandIcon, Button } from "../../components";
import { CardDivider } from "../../components/card";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

export const TransactionSignRequestView: FunctionComponent<{
  onApprove: (name?: string) => void;
  onReject: (name?: string, isWC?: boolean) => void;
}> = ({ onApprove, onReject }) => {
  const { signInteractionStore, signClientStore, chainStore } = useStore();

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

  const [isOpen, setIsOpen] = useState(false);
  const style = useStyle();

  const signDocWrapper = signInteractionStore.waitingData?.data.signDocWrapper;
  const mode = signDocWrapper ? signDocWrapper.mode : "none";
  const msgs = signDocWrapper
    ? signDocWrapper.mode === "amino"
      ? signDocWrapper.aminoSignDoc.msgs
      : signDocWrapper.protoSignDoc.txMsgs
    : [];
  console.log("__DEBUG__ mode:", mode, " msgs:", msgs);

  const messsages = JSON.stringify(msgs, null, 2);
  const source = isWC ? session?.peer.metadata.name : data?.msgOrigin;
  const sourceUrl = isWC ? session?.peer.metadata.url : data?.msgOrigin;

  const intl = useIntl();
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
            { name: source }
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

        <TouchableOpacity
          onPress={() => {
            setIsOpen(!isOpen);
          }}
          style={style.flatten([
            "flex-row",
            "justify-center",
            "items-center",
            "margin-16",
          ])}
        >
          <Text style={style.flatten(["color-primary", "text-base-medium"])}>
            <FormattedMessage
              id={
                isOpen
                  ? "walletconnect.action.hide"
                  : "walletconnect.action.show"
              }
            />
          </Text>
          {isOpen ? (
            <CollapseIcon size={20} color={style.get("color-primary").color} />
          ) : (
            <ExpandIcon size={20} color={style.get("color-primary").color} />
          )}
        </TouchableOpacity>
      </View>
      {isOpen ? (
        <View
          style={style.flatten([
            "flex",
            "border-radius-16",
            "border-color-card-border",
            "background-color-card-background",
            "border-width-1",
            "margin-x-16",
            "padding-16",
            "max-height-276",
          ])}
        >
          <ScrollView style={style.flatten(["flex-0"])}>
            <Text style={style.flatten(["color-gray-10", "body3", "flex-0"])}>
              {messsages}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <View style={style.flatten(["flex-1"])} />
      )}
      <View style={style.flatten(["flex-7"])} />
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
