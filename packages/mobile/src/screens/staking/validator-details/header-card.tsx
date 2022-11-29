import { observer } from "mobx-react-lite";
import React, { Fragment, FunctionComponent } from "react";
import { useIntl } from "react-intl";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeftArrowIcon } from "../../../components";
import { Card } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";

export const ValidatorHeaderCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  animOpacity: Animated.Value;
}> = observer(({ containerStyle, animOpacity }) => {
  const inl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const viewAnimOpacity = {
    opacity: animOpacity.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
    }),
  };

  return (
    <Card style={containerStyle}>
      <Fragment>
        <Animated.View
          style={[
            {
              ...style.flatten(["absolute", "background-color-background"]),
              width: "100%",
              height: safeAreaInsets.top + 44,
            },
            viewAnimOpacity,
          ]}
        />
        <View
          style={{
            ...style.flatten([
              "flex-row",
              "padding-x-16",
              "height-44",
              "justify-center",
              "items-center",
            ]),
            marginTop: safeAreaInsets.top,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              smartNavigation.goBack();
            }}
          >
            <LeftArrowIcon size={24} color={style.get("color-white").color} />
          </TouchableOpacity>
          <View
            style={{
              ...style.flatten([
                "flex-1",
                "justify-center",
                "items-center",
                "margin-right-24",
              ]),
            }}
          >
            <Text style={style.flatten(["text-center", "color-white", "h5"])}>
              {inl.formatMessage({ id: "validator.details.new.title" })}
            </Text>
          </View>
        </View>
      </Fragment>
    </Card>
  );
});
