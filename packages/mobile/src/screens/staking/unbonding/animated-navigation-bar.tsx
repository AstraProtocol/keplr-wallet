import { observer } from "mobx-react-lite";
import React, { Fragment, FunctionComponent } from "react";
import { Animated, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../../components/card";
import { CustomNavigationBar } from "../../../components/navigation-bar/custom-navigation-bar";
import { useStyle } from "../../../styles";

export const AnimatedNavigationBar: FunctionComponent<{
  title?: string;
  animOpacity: Animated.Value;
  hideBottomSeparator?: boolean;
  containerStyle?: ViewStyle;
}> = observer(({ title, animOpacity, hideBottomSeparator, containerStyle }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();
  const viewAnimOpacity = {
    opacity: animOpacity.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
    }),
  };
  const height = 44 + safeAreaInsets.top;

  const getNavigationBar = (
    title: string,
    hideBottomSeparator: boolean = false
  ) => {
    return (
      <CustomNavigationBar
        hideBottomSeparator={hideBottomSeparator}
        title={title}
        containerStyle={{
          marginTop: safeAreaInsets.top,
        }}
      />
    );
  };

  return (
    <Card
      style={{
        ...style.flatten(["background-color-transparent", "width-full"]),
        height: height,
        ...containerStyle,
      }}
    >
      <Fragment>
        {getNavigationBar("", hideBottomSeparator)}
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
          {getNavigationBar(title || "", hideBottomSeparator)}
        </Animated.View>
      </Fragment>
    </Card>
  );
});
