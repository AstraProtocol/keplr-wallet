import { observer } from "mobx-react-lite";
import React, { Fragment, FunctionComponent } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeftArrowIcon } from "../../../components";
import { Card } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";

export const AnimatedNavigationBar: FunctionComponent<{
  title?: string;
  animOpacity: Animated.Value;
}> = observer(({ title, animOpacity }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();
  const smartNavigation = useSmartNavigation();
  const viewAnimOpacity = {
    opacity: animOpacity.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
    }),
  };
  const height = 44 + safeAreaInsets.top;

  const getNavigationBar = (title: string) => {
    return (
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
              "flex-row",
              "items-center",
              "margin-right-24",
              "justify-center",
            ]),
          }}
        >
          <Text
            style={style.flatten([
              "text-center",
              "color-white",
              "text-large-bold",
            ])}
          >
            {title}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Card
      style={{
        ...style.flatten([
          "background-color-transparent",
          "width-full",
          "border-width-bottom-1",
          "border-color-card-separator",
        ]),
        height: height,
      }}
    >
      <Fragment>
        {getNavigationBar("")}
        <Animated.View
          style={[
            {
              ...style.flatten([
                "absolute",
                "background-color-background",
                "width-full",
              ]),
              height: height,
            },
            viewAnimOpacity,
          ]}
        >
          {getNavigationBar(title || "")}
        </Animated.View>
      </Fragment>
    </Card>
  );
});
