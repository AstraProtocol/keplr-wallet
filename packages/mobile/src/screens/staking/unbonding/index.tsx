import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useCallback, useRef } from "react";
import { useIntl } from "react-intl";
import { Animated, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoin, formatUnbondingTime } from "../../../common/utils";
import { AlertInline } from "../../../components";
import { CardDivider } from "../../../components/card";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";
import { AnimatedNavigationBar } from "./animated-navigation-bar";

export const UnbondingScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress?: string;
        }
      >,
      string
    >
  >();
  const validatorAddress = route.params.validatorAddress;

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const { chainStore } = useStore();
  const {
    getValidator,
    getValidatorThumbnail,
    getUnbondingAmountOf,
    getTotalUnbondingAmount,
    getUnbondingTime,
    getTotalUnbondings,
    getUnbondingOf,
  } = useStaking();

  const unbondingTime = getUnbondingTime();
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl, 1);

  let unbondings = getTotalUnbondings();
  if (validatorAddress) {
    const unbonding = getUnbondingOf(validatorAddress);
    if (unbonding) {
      unbondings = [unbonding];
    }
  }

  const validator = getValidator(validatorAddress);
  const unbondingAmount = validatorAddress
    ? getUnbondingAmountOf(validatorAddress)
    : getTotalUnbondingAmount();

  const title = validator
    ? intl.formatMessage(
        { id: "staking.unbonding.validatorTotalAmount" },
        { name: validator.description.moniker }
      )
    : intl.formatMessage({ id: "TotalUnstakingAmount" });

  const getSimpleItem = (
    key: React.Key | null | undefined,
    params: {
      amount: string;
      time: string;
    }
  ) => {
    const { amount, time } = params;
    return (
      <View key={key}>
        <View
          style={style.flatten(["flex-row", "justify-between", "margin-y-16"])}
        >
          <Text
            style={style.flatten(["text-base-regular", "color-label-text-1"])}
          >
            {amount}
          </Text>
          <Text
            style={style.flatten(["text-base-regular", "color-label-text-1"])}
          >
            {time}
          </Text>
        </View>
        <CardDivider
          style={style.flatten([
            "background-color-card-separator",
            "margin-x-0",
          ])}
        />
      </View>
    );
  };

  const getItem = (
    key: React.Key | null | undefined,
    params: {
      icon?: string;
      name?: string;
      amount: string;
      time: string;
    }
  ) => {
    const { icon, name, amount, time } = params;
    return (
      <View key={key}>
        <View
          style={style.flatten(["flex-row", "justify-between", "margin-y-16"])}
        >
          <View style={style.flatten(["flex-row", "justify-start"])}>
            <ValidatorThumbnail size={24} url={icon} />
            <View style={style.flatten(["padding-x-4"])}>
              <Text
                style={style.flatten([
                  "text-base-regular",
                  "color-label-text-1",
                ])}
              >
                {name}
              </Text>
              <Text
                style={style.flatten([
                  "text-base-regular",
                  "color-label-text-1",
                  "margin-top-2",
                ])}
              >
                {amount}
              </Text>
            </View>
          </View>
          <Text
            style={style.flatten(["text-base-regular", "color-label-text-1"])}
          >
            {time}
          </Text>
        </View>
        <CardDivider
          style={style.flatten([
            "background-color-card-separator",
            "margin-x-0",
          ])}
        />
      </View>
    );
  };

  const getUnbondingItems = () => {
    const items = unbondings.reduce((currentItems, unbonding) => {
      const validator = getValidator(unbonding.validatorAddress);
      const thumbnail = getValidatorThumbnail(unbonding.validatorAddress);
      const entries = unbonding.entries;

      const newItems = entries.map((entry) => {
        const current = new Date().getTime();

        const relativeEndTime =
          (new Date(entry.completionTime).getTime() - current) / 1000;

        const remainingText = formatUnbondingTime(relativeEndTime, intl);

        return {
          icon: thumbnail,
          name: validator?.description.moniker ?? "...",
          amount: formatCoin(entry.balance),
          time: remainingText,
          second: relativeEndTime,
        };
      });

      return [...currentItems, ...newItems];
    }, [] as { icon?: string; name?: string; amount: string; time: string; second: number }[]);

    return items
      .sort((a, b) => (a.second > b.second ? 1 : -1))
      .map((item, index) => {
        if (validatorAddress) {
          return getSimpleItem(index, item);
        }
        return getItem(index, item);
      });
  };

  const safeAreaInsets = useSafeAreaInsets();

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const onScrollContent = useCallback((e) => {
    opacityAnim.setValue(e.nativeEvent.contentOffset.y > 0 ? 255 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style.flatten(["background-color-background", "flex-grow-1"])}>
      <AnimatedNavigationBar title={title} animOpacity={opacityAnim} />
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={style.flatten(["flex-grow-1", "padding-x-16"])}
        onScroll={onScrollContent}
        stickyHeaderIndices={[2]}
      >
        <View style={style.flatten(["padding-16", "items-center"])}>
          <Text
            style={style.flatten(["color-label-text-2", "text-small-regular"])}
          >
            {title}
          </Text>
          <Text
            style={style.flatten([
              "color-label-text-1",
              "text-3x-large-medium",
            ])}
          >
            {formatCoin(unbondingAmount)}
          </Text>
        </View>
        <View style={style.flatten(["background-color-background"])}>
          <AlertInline
            type="info"
            content={intl.formatMessage(
              { id: "staking.unbonding.noticeWithdrawalPeriod" },
              { coin: unbondingAmount.denom, days: unbondingTimeText }
            )}
          />
          <Text
            style={style.flatten([
              "margin-y-8",
              "color-label-text-2",
              "text-center",
              "text-small-regular",
            ])}
          >
            {intl.formatMessage(
              { id: "staking.unbonding.viewHistoryGuide" },
              { coin: chainStore.current.stakeCurrency.coinDenom }
            )}
            <Text
              style={style.flatten(["text-underline", "color-link-text"])}
              onPress={() => {
                smartNavigation.navigateSmart("Wallet.History", {
                  isNavigated: true,
                });
              }}
            >
              {intl.formatMessage({ id: "History" }).toLocaleLowerCase()}
            </Text>
          </Text>
        </View>
        <View
          style={style.flatten([
            "height-32",
            "margin-top-16",
            "padding-y-8",
            "background-color-background",
            "border-width-bottom-1",
            "border-color-card-separator",
          ])}
        >
          <View
            style={style.flatten(["flex-row", "justify-between", "height-16"])}
          >
            <Text
              style={style.flatten(["color-label-text-2", "text-small-medium"])}
            >
              {validatorAddress
                ? intl.formatMessage({ id: "staking.unbonding.amount" })
                : intl.formatMessage({ id: "MyUnstaking" })}
            </Text>
            <Text
              style={style.flatten(["color-label-text-2", "text-small-medium"])}
            >
              {intl.formatMessage({ id: "ReceiveIn" })}
            </Text>
          </View>
        </View>
        {getUnbondingItems()}
        <View
          style={{ height: safeAreaInsets.top + safeAreaInsets.bottom + 44 }}
        />
      </ScrollView>
    </View>
  );
});
