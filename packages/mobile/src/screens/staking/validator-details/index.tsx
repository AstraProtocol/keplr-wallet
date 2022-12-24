import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useRef } from "react";
import { useStyle } from "../../../styles";

import { Animated, Image, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStaking } from "../hook/use-staking";
import { CommissionsCard } from "./commission-card";
import { DelegatedCard } from "./delegated-card";
import { ValidatorHeaderCard } from "./header-card";
import { ValidatorNameCard } from "./name-card";

export const ValidatorDetailsScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const { isStakingTo } = useStaking();

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const safeAreaInsets = useSafeAreaInsets();
  const height = 44 + safeAreaInsets.top;
  const validatorAddress = route.params.validatorAddress;

  const style = useStyle();

  const hasStake = isStakingTo(validatorAddress);

  const onScrollContent = useCallback((e) => {
    opacityAnim.setValue(e.nativeEvent.contentOffset.y > 0 ? 255 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style.flatten(["background-color-background", "flex-grow-1"])}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        <Image
          resizeMode="contain"
          source={require("../../../assets/image/background_top.png")}
        />
      </View>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={style.flatten(["flex-grow-1"])}
        onScroll={onScrollContent}
      >
        <ValidatorNameCard validatorAddress={validatorAddress} />
        {hasStake ? (
          <DelegatedCard
            containerStyle={style.flatten([
              "background-color-transparent",
              "padding-x-8",
              "margin-top-24",
            ])}
            validatorAddress={validatorAddress}
          />
        ) : (
          [
            <View
              style={style.flatten([
                "height-1",
                "background-color-card-separator",
                "margin-x-page",
                "margin-top-24",
              ])}
            />,
          ]
        )}
        <CommissionsCard
          showStake={!hasStake}
          containerStyle={style.flatten([
            "background-color-transparent",
            "flex-1",
            "margin-bottom-16",
          ])}
          validatorAddress={validatorAddress}
        />
        <View style={{ height: safeAreaInsets.bottom }} />
      </ScrollView>
      <ValidatorHeaderCard
        validatorAddress={validatorAddress}
        animOpacity={opacityAnim}
        containerStyle={{
          position: "absolute",
          width: "100%",
          height: height,
          backgroundColor: "transparent",
        }}
      />
    </View>
  );
});
