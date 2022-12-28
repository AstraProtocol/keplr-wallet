import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { formatCoin } from "../../../common/utils";
import { VectorCharacter } from "../../../components/vector-character";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const TokenItemNew: FunctionComponent<{
  containerStyle?: ViewStyle;
  balance: CoinPretty;
}> = ({ containerStyle, balance }) => {
  const style = useStyle();
  const { chainStore } = useStore();

  const firstCurrency = chainStore.getChain(chainStore.current.chainId)
    .currencies[0];

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "padding-x-card-horizontal",
          "padding-y-14",
          "margin-top-12",
        ]),
        containerStyle,
      ])}
    >
      <TokenSymbolNew
        style={style.flatten(["margin-right-12"])}
        size={40}
        currency={balance.currency}
      />
      <View style={style.flatten(["flex-1"])}>
        <View style={style.flatten(["flex-row", "justify-between"])}>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-white",
              "uppercase",
            ])}
          >
            {balance.currency.coinDenom}
          </Text>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-white",
              "text-right",
              "padding-right-0",
            ])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatCoin(
              balance,
              true,
              balance.currency.coinMinimalDenom ===
                firstCurrency.coinMinimalDenom
                ? 2
                : 5
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const TokenSymbolNew: FunctionComponent<{
  style?: ViewStyle;
  currency: AppCurrency;

  size: number;

  imageScale?: number;
}> = ({ style: propStyle, size, currency, imageScale = 1 }) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        {
          width: size,
          height: size,
          borderRadius: size,
        },
        style.flatten([
          "items-center",
          "justify-center",
          "overflow-hidden",
          "background-color-transparent",
        ]),
        propStyle,
      ])}
    >
      {currency.coinImageUrl ? (
        <FastImage
          style={{
            width: size * imageScale,
            height: size * imageScale,
          }}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            uri: currency.coinImageUrl,
          }}
        />
      ) : (
        <VectorCharacter
          char={currency.coinDenom[0]}
          height={Math.floor(size * 0.35)}
          color="white"
        />
      )}
    </View>
  );
};
