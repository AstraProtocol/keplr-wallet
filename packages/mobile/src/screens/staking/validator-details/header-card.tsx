import { Staking } from "@keplr-wallet/stores";
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
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const ValidatorHeaderCard: FunctionComponent<{
  validatorAddress: string;
  containerStyle?: ViewStyle;
  animOpacity: Animated.Value;
}> = observer(({ validatorAddress, containerStyle, animOpacity }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unspecified
  );

  const thumbnail = queryValidators.getValidatorThumbnail(validatorAddress);
  const validator = queryValidators.getValidator(validatorAddress);

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

  const getNavigationBar = (
    title: string,
    icon?: {
      url?: string;
      hidden?: boolean;
    }
  ) => {
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
            ...style.flatten(
              ["flex-1", "flex-row", "items-center", "margin-right-24"],
              [icon?.hidden !== true ? "justify-start" : "justify-center"]
            ),
          }}
        >
          {icon?.hidden !== true ? (
            <ValidatorThumbnail
              size={24}
              url={icon?.url}
              style={style.flatten(["margin-x-8"])}
            />
          ) : null}
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
    <Card style={containerStyle}>
      <Fragment>
        {getNavigationBar(inl.formatMessage({ id: "StakingProvider" }), {
          hidden: true,
        })}
        <Animated.View
          style={[
            {
              ...style.flatten(["absolute", "background-color-background"]),
              width: "100%",
              height: safeAreaInsets.top + 44,
            },
            viewAnimOpacity,
          ]}
        >
          {getNavigationBar(validator?.description.moniker || "", {
            url: thumbnail,
          })}
        </Animated.View>
      </Fragment>
    </Card>
  );
});
