import React, { FunctionComponent } from "react";
import { ViewStyle, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import Clipboard from "expo-clipboard";
import { RectButton } from "../rect-button";
import { CopyIconNew } from "../icon";
import { useToastModal } from "../../providers/toast-modal";
import { useIntl } from "react-intl";

export const AddressCopyableItem: FunctionComponent<{
  style?: ViewStyle;
  address: string;
  maxCharacters: number;
}> = ({ style: propStyle, address }) => {
  const style = useStyle();
  const toast = useToastModal();
  const intl = useIntl();
  // const { isTimedOut, setTimer } = useSimpleTimer();

  return (
    <RectButton
      style={StyleSheet.flatten([
        style.flatten([
          "padding-left-12",
          "padding-right-8",
          "background-color-transparent",
          "flex-row",
          "items-center",
          "justify-center",
        ]),
        propStyle,
      ])}
      onPress={() => {
        Clipboard.setString(address);
        toast.makeToast({
          title: intl.formatMessage({ id: "component.text.copied" }),
          type: "neutral",
          displayTime: 2000,
        });
      }}
      rippleColor={style.get("color-transparent").color}
      underlayColor={style.get("color-transparent").color}
      activeOpacity={1}
    >
      <Text
        numberOfLines={1}
        ellipsizeMode="middle"
        style={style.flatten(["text-base-regular", "color-white", "flex-1"])}
      >
        {address}
      </Text>
      <View style={style.flatten(["margin-left-4", "width-20"])}>
        <CopyIconNew color={style.get("color-white").color} size={17} />
      </View>
    </RectButton>
  );
};
