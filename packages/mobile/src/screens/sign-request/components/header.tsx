import { CoreTypes } from "@walletconnect/types";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, Image, Text, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { useStyle } from "../../../styles";

export const RequestHeaderView: FunctionComponent<{
  metadata: CoreTypes.Metadata | undefined;
  sourceUrl: string | undefined;
  source: string | undefined;
  chain: string;
  containerStyle?: ViewStyle;
  type: string;
  wasCanceled: boolean;
}> = ({
  metadata,
  source,
  sourceUrl,
  chain,
  containerStyle,
  type,
  wasCanceled,
}) => {
  const style = useStyle();
  const intl = useIntl();
  console.log("__DEBUG__", source, sourceUrl);
  return (
    <View style={containerStyle}>
      <View
        style={style.flatten([
          "padding-x-12",
          "flex-0",
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
              source={require("../../../assets/image/icon_verified.png")}
              resizeMode="contain"
              style={style.flatten(["width-64", "height-64"])}
            />
          )}
        </View>
        {wasCanceled ? (
          <View
            style={style.flatten([
              "height-24",
              "border-radius-16",
              "background-color-red-50-15",
              "margin-top-16",
              "padding-x-8",
              "items-center",
              "flex-row",
              "justify-center",
            ])}
          >
            <View
              style={style.flatten([
                "width-8",
                "height-8",
                "border-radius-8",
                "margin-right-4",
                "background-color-red-50",
              ])}
            />
            <Text
              style={style.flatten(["color-red-50", "text-caption2", "flex-0"])}
            >
              {intl.formatMessage({
                id: "walletconnect.permission.requestCanceled",
              })}
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={style.flatten([
          "color-gray-10",
          "text-center",
          "h4",
          "margin-top-12",
        ])}
      >
        {intl
          .formatMessage(
            { id: "walletconnect.text.verify" },
            { name: source, type: type }
          )
          .replace(" unknown ", " ")}
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
            {chain}
          </Text>
        </View>
      </View>
    </View>
  );
};
