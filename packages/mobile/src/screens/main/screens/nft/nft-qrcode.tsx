import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { BlurView } from "@react-native-community/blur";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import {
  ImageBackground,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomNavigationBar } from "../../../../components/navigation-bar/custom-navigation-bar";
import { useStyle } from "../../../../styles";

export const NFTQRCodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          data: NFTData;
        }
      >,
      string
    >
  >();

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        source={{ uri: route.params.data.metadata?.image }}
        style={style.flatten(["width-full", "height-full", "justify-center"])}
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
            blurAmount={30}
          />
        ) : (
          <View
            style={style.flatten([
              "absolute",
              "opacity-80",
              "background-color-black",
              "width-full",
              "height-full",
            ])}
          />
        )}
        <View
          style={style.flatten([
            "background-color-white",
            "items-center",
            "margin-x-16",
            "padding-24",
            "border-radius-16",
          ])}
        >
          <Text
            style={style.flatten([
              "color-black",
              "text-center",
              "text-medium-medium",
            ])}
          >
            {intl.formatMessage({ id: "nft.qrcode.checkinStand" })}
          </Text>
          <View style={style.flatten(["padding-16", "margin-top-8"])}>
            <QRCode
              size={windowDimensions.width - 2 * (16 + 24 + 16)}
              color={"black"}
              backgroundColor={"white"}
              value={route.params.data.token_id}
            />
          </View>
        </View>
      </ImageBackground>

      <CustomNavigationBar
        hideBottomSeparator
        title={route.params.data.title}
        icon={{
          url:
            route.params.data.thumbnail_url ??
            route.params.data.metadata?.image,
        }}
        containerStyle={{
          position: "absolute",
          marginTop: safeAreaInsets.top,
        }}
      />
    </View>
  );
});
