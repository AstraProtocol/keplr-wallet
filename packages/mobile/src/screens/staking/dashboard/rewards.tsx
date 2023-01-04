import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { formatCoinAmount, MIN_AMOUNT } from "../../../common/utils";
import { Button } from "../../../components/button";
import { CardDivider } from "../../../components/card";
import { useSmartNavigation } from "../../../navigation-util";

import { useStyle } from "../../../styles";
import { PropertyView, PropertyViewIconType } from "../component/property";
import { useStaking } from "../hook/use-staking";

export const RewardsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const {
    getTotalStakingAmount,
    getTotalRewardsAmount,
    getTotalUnbondingAmount,
    getRewardsAmountOf,
    getDelegations,
    hasUnbonding,
  } = useStaking();

  const smartNavigation = useSmartNavigation();
  const style = useStyle();
  const intl = useIntl();

  const totalStakingAmount = getTotalStakingAmount();
  const totalRewardsAmount = getTotalRewardsAmount();
  const totalUnbondingAmount = getTotalUnbondingAmount();

  const isPending = hasUnbonding();
  const isRewardExist = (() => {
    return (
      getDelegations().find((delegation) => {
        return getRewardsAmountOf(delegation.delegation.validator_address)
          .toDec()
          .gte(new Dec(MIN_AMOUNT));
      }) != undefined
    );
  })();

  if (totalStakingAmount.toDec().isZero() && !isPending && !isRewardExist) {
    return null;
  }

  return (
    <View
      style={{
        ...style.flatten([
          "margin-x-16",
          "background-color-card-background",
          "border-radius-16",
        ]),
        ...containerStyle,
      }}
    >
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-12",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          iconType={PropertyViewIconType.staked}
          label={intl.formatMessage({
            id: "TotalStakingAmount",
          })}
          value={formatCoinAmount(totalStakingAmount)}
          labelStyle={style.flatten(["color-staking-staked-text"])}
          containerStyle={style.flatten(["flex-6"])}
        />
        <Button
          containerStyle={style.flatten(["flex-4"])}
          onPress={() => {
            smartNavigation.navigateSmart("Validator.List", {});
          }}
          text={intl.formatMessage({
            id: "Stake",
          })}
          size="medium"
        />
      </View>
      <CardDivider style={style.flatten(["background-color-card-separator"])} />
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-12",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          iconType={PropertyViewIconType.rewards}
          label={intl.formatMessage({
            id: "TotalRewardsAmount",
          })}
          value={"+" + formatCoinAmount(totalRewardsAmount)}
          labelStyle={style.flatten(["color-staking-rewards-text"])}
          containerStyle={style.flatten(["flex-6"])}
        />

        <Button
          containerStyle={style.flatten(["flex-4"])}
          text={intl.formatMessage({
            id: "ClaimRewards",
          })}
          color="primary"
          mode="outline"
          size="medium"
          disabled={!isRewardExist}
          onPress={() => {
            smartNavigation.navigateSmart("Staking.Rewards", {});
          }}
        />
      </View>
      <CardDivider style={style.flatten(["background-color-card-separator"])} />
      <View
        style={style.flatten([
          "padding-y-16",
          "margin-x-12",
          "flex-row",
          "items-center",
        ])}
      >
        <PropertyView
          iconType={PropertyViewIconType.unbonding}
          label={intl.formatMessage({
            id: "TotalUnstakingAmount",
          })}
          value={formatCoinAmount(totalUnbondingAmount)}
          labelStyle={style.flatten(["color-staking-unbonding-text"])}
          containerStyle={style.flatten(["flex-6"])}
        />

        <Button
          containerStyle={style.flatten(["flex-4"])}
          text={intl.formatMessage({
            id: "Follow",
          })}
          color="primary"
          mode="outline"
          size="medium"
          disabled={!isPending}
          onPress={() => {
            smartNavigation.navigateSmart("Unbonding", {});
          }}
        />
      </View>
    </View>
  );
});
