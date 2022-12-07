import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { LOCALE_FORMAT } from "../../../common/utils";
import {
  StakingRewardsIcon,
  StakingStakedIcon,
  StakingUnbondingIcon,
} from "../../../components";
import { useStyle } from "../../../styles";

export enum PropertyViewIconType {
  staked,
  rewards,
  unbonding,
}

export const PropertyView: FunctionComponent<{
  containerStyle?: ViewStyle;
  iconType?: PropertyViewIconType;
  label: string;
  value: string;
  subValue?: string;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  subValueStyle?: TextStyle;
}> = observer(
  ({
    containerStyle,
    iconType,
    label,
    value,
    subValue,
    labelStyle,
    valueStyle,
    subValueStyle,
  }) => {
    const style = useStyle();

    const getIcon = () => {
      switch (iconType) {
        case PropertyViewIconType.staked:
          return <StakingStakedIcon />;
        case PropertyViewIconType.rewards:
          return <StakingRewardsIcon />;
        case PropertyViewIconType.unbonding:
          return <StakingUnbondingIcon />;
      }
    };

    const delimitter =
      value.indexOf(LOCALE_FORMAT.fractionDelimitter) !== -1
        ? LOCALE_FORMAT.fractionDelimitter
        : " ";
    let parts = value.split(delimitter);

    return (
      <View
        style={StyleSheet.flatten([
          style.flatten([
            "flex-1",
            "margin-left-0",
            "justify-center",
          ]),
          containerStyle,
        ])}
      >
        <View style={style.flatten(["flex-row", "items-center"])}>
          {iconType != undefined ? (
            <View style={style.flatten(["margin-right-4"])}>{getIcon()}</View>
          ) : null}
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                "color-gray-30",
                "text-small-medium",
                "margin-top-0",
              ]),
              labelStyle,
            ])}
          >
            {label}
          </Text>
        </View>
        <View style={style.flatten(["flex-row", "margin-top-2", "items-end"])}>
          <Text
            style={StyleSheet.flatten([
              style.flatten(["color-gray-10", "text-x-large-medium"]),
              valueStyle,
            ])}
          >
            {parts[0]}
          </Text>
          <Text
            style={StyleSheet.flatten([
              style.flatten([
                "color-gray-30",
                "text-small-medium",
                "margin-bottom-4",
              ]),
              valueStyle,
            ])}
          >
            {parts.length > 1 ? delimitter + parts[1] : ""}
          </Text>
        </View>
        {subValue && (
          <Text
            style={StyleSheet.flatten([
              style.flatten(["color-gray-30", "subtitle4", "margin-bottom-0"]),
              subValueStyle,
            ])}
          >
            {subValue}
          </Text>
        )}
      </View>
    );
  }
);
