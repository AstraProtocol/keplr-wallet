import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { BlurView } from "@react-native-community/blur";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  Animated,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, TextLink } from "../../../../components";
import { useSmartNavigation } from "../../../../navigation-util";
import { useStyle } from "../../../../styles";
import { AnimatedNavigationBar } from "../../../staking/unbonding/animated-navigation-bar";
import { QRCodeIcon, SellIcon, SendIcon } from "./icon";

export const NFTDetailsScreen: FunctionComponent = observer(() => {
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
  const smartNavigation = useSmartNavigation();
  const windowDimensions = useWindowDimensions();

  const [isExpanded, setIsExpanded] = useState(false);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const onScrollContent = useCallback((e) => {
    opacityAnim.setValue(e.nativeEvent.contentOffset.y > 0 ? 255 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style.get("background-color-background")}>
      <ScrollView
        scrollEventThrottle={16}
        style={style.flatten(["width-full"])}
        onScroll={onScrollContent}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            width: windowDimensions.width,
            height: windowDimensions.width + safeAreaInsets.top + 44 + 24,
          }}
          onPress={() => {
            smartNavigation.navigateSmart("NFT.Gallery", {
              data: route.params.data,
            });
          }}
        >
          <ImageBackground
            source={{ uri: route.params.data.metadata?.image }}
            style={style.flatten(["absolute", "width-full", "height-full"])}
            resizeMode={FastImage.resizeMode.cover}
          />
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
              style={{
                ...style.flatten([
                  "absolute",
                  "opacity-80",
                  "background-color-black",
                ]),
                width: windowDimensions.width,
                height: windowDimensions.width + safeAreaInsets.top + 44 + 24,
              }}
            />
          )}
          <FastImage
            style={{
              ...style.flatten(["flex-1", "width-full", "margin-bottom-24"]),
              aspectRatio: 1,
              marginTop: safeAreaInsets.top + 44,
            }}
            source={{
              uri: route.params.data.metadata?.image,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
        <View
          style={style.flatten(["padding-x-16", "background-color-background"])}
        >
          <Text
            style={style.flatten([
              "text-x-large-semi-bold",
              "color-label-text-1",
            ])}
            numberOfLines={2}
          >
            {route.params.data.title}
          </Text>
          <Text
            style={style.flatten([
              "text-base-regular",
              "color-label-text-2",
              "margin-top-4",
            ])}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {route.params.data.metadata?.description}
          </Text>
          <View style={style.flatten(["items-start"])}>
            <TextLink
              textStyle={{ textDecorationLine: "none" }}
              onPress={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded
                ? intl.formatMessage({ id: "ViewLess" })
                : intl.formatMessage({ id: "ViewMore" })}
            </TextLink>
          </View>
          <View style={style.flatten(["flex-row", "margin-top-16"])}>
            <Button
              color="neutral"
              text={intl.formatMessage({ id: "nft.text.code" })}
              leftIcon={<QRCodeIcon />}
              containerStyle={style.flatten(["flex-1"])}
              onPress={() => {
                smartNavigation.navigateSmart("NFT.QRCode", {
                  data: route.params.data,
                });
              }}
            />
            <View style={style.flatten(["width-8"])} />
            <Button
              color="neutral"
              text={intl.formatMessage({ id: "Send" })}
              leftIcon={<SendIcon />}
              containerStyle={style.flatten(["flex-1"])}
              onPress={() => {
                smartNavigation.navigateSmart("NFT.Send", {
                  data: route.params.data,
                });
              }}
            />
            <View style={style.flatten(["width-8"])} />
            <Button
              color="neutral"
              text={intl.formatMessage({ id: "nft.text.sell" })}
              leftIcon={<SellIcon />}
              containerStyle={style.flatten(["flex-1"])}
              onPress={() => {}}
              disabled
            />
          </View>
          <View
            style={style.flatten([
              "height-1",
              "margin-y-24",
              "background-color-card-separator",
            ])}
          />
          <Text style={style.flatten(["text-base-bold", "color-label-text-1"])}>
            {intl.formatMessage({ id: "Details" })}
          </Text>
          {route.params.data.metadata?.attributes.map((att) => {
            return (
              <View style={style.flatten(["margin-top-12"])}>
                <Text
                  style={style.flatten([
                    "text-small-regular",
                    "color-label-text-2",
                  ])}
                >
                  {att.trait_type}
                </Text>
                <Text
                  style={style.flatten([
                    "text-base-regular",
                    "color-label-text-1",
                  ])}
                >
                  {att.value}
                </Text>
              </View>
            );
          })}
        </View>
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: safeAreaInsets.bottom + 16,
          }}
        />
      </ScrollView>

      <AnimatedNavigationBar
        hideBottomSeparator
        title={route.params.data.title}
        animOpacity={opacityAnim}
        containerStyle={{ position: "absolute" }}
      />
    </View>
  );
});
