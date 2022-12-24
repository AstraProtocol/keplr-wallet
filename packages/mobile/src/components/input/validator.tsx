import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, TextStyle, View, ViewStyle, StyleSheet } from "react-native";
import { useStyle } from "../../styles";
import { ValidatorThumbnail } from "../thumbnail";

export const ValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  name?: string | undefined;
  thumbnail?: string | undefined;
  value?: string | undefined;
  valueStyle?: TextStyle;
  right?: React.ReactElement;
}> = observer(
  ({ containerStyle, name, thumbnail, value, valueStyle, right }) => {
    const style = useStyle();
    return (
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "border-radius-16",
            "border-width-1",
            "border-color-card-border",
            "padding-x-16",
            "height-56",
            "background-color-card-background",
            "flex-row",
            "items-center",
          ]),
          containerStyle,
        ])}
      >
        <ValidatorThumbnail
          style={style.flatten(["margin-right-8"])}
          size={40}
          url={thumbnail}
        />
        <View style={style.flatten(["flex-1"])}>
          {name ? (
            <Text
              style={style.flatten(["text-base-medium", "color-label-text-1"])}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
          ) : null}
          {value ? (
            <Text
              style={StyleSheet.flatten([
                style.flatten([
                  "text-small-regular",
                  "color-label-text-2",
                  "margin-top-4",
                ]),
                valueStyle,
              ])}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {value}
            </Text>
          ) : null}
        </View>
        {right ? right : null}
      </View>
    );
  }
);
