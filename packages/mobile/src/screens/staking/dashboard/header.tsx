import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { QuestionIcon } from "../component/tooltip-icon";
import { GradientBackground } from "./gradient-background";

export const DashboardHeader: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  return (
    <View
      style={{
        ...style.flatten(["padding-x-16"]),
        ...containerStyle,
      }}
    >
      <ImageBackground
        source={require("../dashboard/dashboard-banner-bg.png")}
        resizeMode="cover"
        style={style.flatten(["padding-x-24", "padding-y-20", "items-center"])}
        imageStyle={style.flatten([
          "border-radius-32",
          "border-color-border",
          "border-width-1",
        ])}
      >
        <Text style={style.flatten(["color-white", "text-x-large-semi-bold"])}>
          {intl.formatMessage({ id: "Dashboard.Banner.1" })}
        </Text>
        <View
          style={style.flatten([
            "margin-top-8",
            "border-radius-16",
            "items-center",
            "justify-center",
            "background-color-alert-inline-error-background",
            "overflow-hidden",
          ])}
        >
          <View
            style={{
              ...style.flatten(["items-center"]),
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          >
            <GradientBackground width={120} height={40} />
          </View>

          <Text
            style={style.flatten([
              "color-label-text-1",
              "text-x-large-semi-bold",
              "text-center",
              "margin-x-12",
              "margin-y-2",
            ])}
          >
            {intl.formatMessage({ id: "Dashboard.Banner.2" })}
          </Text>
        </View>
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-base-regular",
            "text-center",
            "margin-top-12",
          ])}
        >
          {intl.formatMessage({ id: "Dashboard.Banner.3" })}
        </Text>
      </ImageBackground>
      <View
        style={style.flatten([
          "flex-row",
          "items-center",
          "justify-center",
          "margin-top-12",
          "padding-bottom-8",
        ])}
      >
        <Text
          style={style.flatten([
            "color-label-text-2",
            "text-base-regular",
            "text-center",
          ])}
        >
          {intl.formatMessage({ id: "FAQ" })}
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            smartNavigation.navigateSmart("FAQ", {});
          }}
          style={style.flatten(["margin-left-4"])}
        >
          <QuestionIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
});
