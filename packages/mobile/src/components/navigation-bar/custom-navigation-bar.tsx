import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Image, Text, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSmartNavigation } from "../../navigation-util";
import { useStyle } from "../../styles";
import { LeftArrowIcon } from "../icon";

export const CustomNavigationBar: FunctionComponent<{
  title?: string;
  icon?: {
    url?: string;
    hidden?: boolean;
  };
  hideBottomSeparator?: boolean;
  containerStyle?: ViewStyle;
}> = observer(({ title, icon, hideBottomSeparator, containerStyle }) => {
  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  return (
    <View
      style={{
        ...style.flatten(
          [
            "width-full",
            "flex-row",
            "padding-x-16",
            "height-44",
            "items-center",
          ],
          [
            hideBottomSeparator === true
              ? "border-width-bottom-0"
              : "border-width-bottom-1",
            hideBottomSeparator === true
              ? "border-color-transparent"
              : "border-color-card-separator",
          ]
        ),
        ...containerStyle,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          smartNavigation.goBack();
        }}
      >
        <LeftArrowIcon size={24} color={style.get("color-white").color} />
      </TouchableOpacity>
      {icon && icon.url && icon.hidden !== true ? (
        <Image
          source={{ uri: icon?.url }}
          style={style.flatten([
            "width-40",
            "height-40",
            "margin-left-12",
            "margin-right-8",
          ])}
          resizeMode="contain"
        />
      ) : null}
      <Text
        style={style.flatten([
          "flex-1",
          "text-center",
          "margin-right-24",
          "color-white",
          "text-large-bold",
        ])}
      >
        {title}
      </Text>
    </View>
  );
});
