import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../styles";

export const Chip: FunctionComponent<{
  containerStyle?: ViewStyle;
  type?: "info" | "success" | "error" | "warning";
  size?: "small" | "medium";
  text: string;
}> = ({ containerStyle, type = "info", size = "medium", text }) => {
  const style = useStyle();

  return (
    <View
      style={{
        ...style.flatten([
          "padding-x-8",
          `padding-y-${size === "medium" ? 4 : 2}` as any,
          "border-radius-16",
          `background-color-alert-inline-${type}-background` as any,
        ]),
        ...containerStyle,
      }}
    >
      <Text
        style={style.flatten(
          [`color-alert-inline-${type}-main` as any],
          [size === "medium" ? "text-small-regular" : "text-x-small-regular"]
        )}
      >
        {text}
      </Text>
    </View>
  );
};

export const _Chip: FunctionComponent<{
  color?: "primary" | "secondary" | "danger";
  mode?: "fill" | "light" | "outline";
  text: string;
}> = ({ color = "primary", mode = "fill", text }) => {
  const style = useStyle();

  const backgroundColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return `background-color-${color}`;
      case "light":
        return `background-color-chip-light-${color}`;
      case "outline":
        return "background-color-transparent";
    }
  })();

  const textColorDefinition = (() => {
    switch (mode) {
      case "fill":
        return "color-white";
      case "outline":
      case "light":
        return `color-${color}`;
    }
  })();

  return (
    <View
      style={style.flatten(
        [
          backgroundColorDefinition as any,
          "padding-x-8",
          "padding-y-2",
          "border-radius-32",
          "justify-center",
          "items-center",
        ],
        [
          mode === "outline" && "border-width-1",
          mode === "outline" && (`border-color-${color}` as any),
        ]
      )}
    >
      <Text
        style={style.flatten([
          "text-overline",
          "text-center",
          textColorDefinition as any,
        ])}
      >
        {text}
      </Text>
    </View>
  );
};
