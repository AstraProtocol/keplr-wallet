import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Image, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";

export const DashboardHeader: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  // const { chainStore } = useStore();
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  return (
    <View
      style={{
        ...style.flatten(["padding-x-16", "justify-between"]),
        ...containerStyle,
      }}
    >
      <View
        style={style.flatten([
          "padding-x-24",
          "padding-y-20",
          "items-center",
          "border-radius-32",
          "background-color-alert-inline-error-background",
        ])}
      >
        <Text style={style.flatten(["color-white", "text-2x-large-semi-bold"])}>
          Staking lãi tới
        </Text>
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-x-large-semi-bold",
            "margin-top-8",
          ])}
        >
          17%/năm
        </Text>
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-base-regular",
            "text-center",
            "margin-top-12",
          ])}
        >
          Khóa một lượng ASA để nhận thưởng hàng ngày. Rút bất kỳ lúc nào, không
          mất lãi. Không kỳ hạn.
        </Text>
      </View>
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
          Câu hỏi thường gặp
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            smartNavigation.navigateSmart("FAQ", {});
          }}
          style={style.flatten(["margin-left-4"])}
        >
          <Image
            style={style.flatten(["width-16", "height-16"])}
            resizeMode="contain"
            source={require("../../../assets/image/icon_tooltip.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});
