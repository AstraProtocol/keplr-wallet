import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { BlurView } from "@react-native-community/blur";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Image, Platform, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStyle } from "../../../../../styles";

export const NFTEmptyCell: FunctionComponent<{
  index?: { section: number; item: number };
}> = ({ index }) => {
  const style = useStyle();
  const intl = useIntl();

  return (
    <View
      key={`nft_empty_${index?.section}_${index?.item}`}
      style={style.flatten([
        "margin-x-16",
        "margin-top-16",
        "height-160",
        "items-center",
        "justify-center",
      ])}
    >
      <View style={style.flatten(["padding-16", "items-center"])}>
        <Image
          source={require("../images/icon_empty.png")}
          style={style.flatten(["width-56", "height-56"])}
        />
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-base-regular",
            "text-center",
            "margin-top-12",
          ])}
        >
          {intl.formatMessage({ id: "nft.collectible.empty" })}
        </Text>
      </View>
    </View>
  );
};

export const NFTCell: FunctionComponent<{
  index?: { section: number; item: number };
  data?: NFTData;
  onPress?: (data?: NFTData) => void;
}> = ({ index, data, onPress }) => {
  const style = useStyle();

  return (
    <View
      key={`nft_${index?.section}_${index?.item}`}
      style={style.flatten(["flex-1"])}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (onPress) {
            onPress(data);
          }
        }}
      >
        <FastImage
          style={{
            ...style.flatten(["flex-1", "border-radius-8"]),
            aspectRatio: 1,
          }}
          source={{
            uri: data?.thumbnail_url ?? data?.metadata.image,
          }}
          resizeMode={FastImage.resizeMode.cover}
        >
          {Platform.OS === "ios" ? (
            <BlurView
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              blurType="dark"
              blurAmount={10}
            />
          ) : (
            <View
              style={{
                ...style.flatten([
                  "absolute",
                  "width-full",
                  "height-full",
                  "opacity-80",
                  "background-color-black",
                ]),
              }}
            />
          )}

          <FastImage
            style={{
              ...style.flatten(["flex-1"]),
            }}
            source={{
              uri: data?.thumbnail_url ?? data?.metadata.image,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </FastImage>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-label-text-1",
            "margin-top-8",
          ])}
        >
          {data?.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
