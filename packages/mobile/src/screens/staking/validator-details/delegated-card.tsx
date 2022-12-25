import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Text, View, ViewStyle } from "react-native";
import { formatCoin } from "../../../common/utils";
import { Button } from "../../../components";
import { Card } from "../../../components/card";
import { registerModal } from "../../../modals/base";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { PropertyView, PropertyViewIconType } from "../component/property";
import { useStaking } from "../hook/use-staking";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const {
    getUnbondingAmountOf,
    getStakingAmountOf,
    getRewardsAmountOf,
    getRedelegationsTo,
  } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const [
    displayCannotRedelegateModal,
    setDisplayCannotRedelegateModal,
  ] = useState(false);

  const stakingAmount = getStakingAmountOf(validatorAddress);
  const rewardsAmount = getRewardsAmountOf(validatorAddress);
  const unbondingAmount = getUnbondingAmountOf(validatorAddress);

  const redelegation = getRedelegationsTo(validatorAddress).shift();

  const redelegationCompletionTime = useMemo(() => {
    const completionTime = redelegation?.entries.shift()?.redelegation_entry
      .completion_time;
    return (completionTime
      ? new Date(completionTime)
      : new Date()
    ).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [redelegation]);

  return (
    <Card style={containerStyle}>
      <View
        style={style.flatten([
          "padding-x-12",
          "padding-y-16",
          "background-color-card-background",
          "border-radius-16",
          "border-width-1",
          "border-color-card-border",
        ])}
      >
        <PropertyView
          iconType={PropertyViewIconType.staked}
          label={intl.formatMessage({
            id: "StakingAmount",
          })}
          value={formatCoin(stakingAmount, false, 2)}
          labelStyle={style.flatten(["color-staking-staked-text"])}
        />
        <Button
          size="medium"
          text={intl.formatMessage({
            id: "Stake",
          })}
          containerStyle={style.flatten(["margin-y-8"])}
          onPress={() => {
            smartNavigation.navigateSmart("Delegate", {
              validatorAddress,
            });
          }}
        />
        <View
          style={style.flatten(["margin-y-0", "flex-row", "justify-center"])}
        >
          <Button
            size="medium"
            mode="outline"
            text={intl.formatMessage({
              id: "Redelegate",
            })}
            containerStyle={style.flatten(["flex-1"])}
            onPress={() => {
              if (!redelegation) {
                smartNavigation.navigateSmart("Redelegate", {
                  validatorAddress,
                });
                return;
              }

              setDisplayCannotRedelegateModal(true);
            }}
          />
          <View style={style.flatten(["width-8"])} />
          <Button
            size="medium"
            mode="outline"
            text={intl.formatMessage({
              id: "Unstake",
            })}
            containerStyle={style.flatten(["flex-1"])}
            onPress={() => {
              smartNavigation.navigateSmart("Undelegate", {
                validatorAddress,
              });
            }}
          />
        </View>
        <View
          style={style.flatten([
            "height-1",
            "background-color-card-separator",
            "margin-y-16",
          ])}
        />
        <View style={style.flatten(["flex-row", "items-start"])}>
          <PropertyView
            iconType={PropertyViewIconType.rewards}
            label={intl.formatMessage({
              id: "RewardsAmount",
            })}
            value={"+" + formatCoin(rewardsAmount, false, 4)}
            labelStyle={style.flatten(["color-staking-rewards-text"])}
          />
          <View style={style.flatten(["width-8"])} />
          <View style={style.flatten(["flex-1"])}>
            <PropertyView
              iconType={PropertyViewIconType.unbonding}
              label={intl.formatMessage(
                { id: "TotalUnstakingAmount" },
                { denom: unbondingAmount.denom }
              )}
              value={formatCoin(unbondingAmount, false, 2)}
              labelStyle={style.flatten(["color-staking-unbonding-text"])}
            />
            {unbondingAmount.toDec().isPositive() && (
              <Text
                style={style.flatten([
                  "color-link-text",
                  "text-small-medium",
                  "margin-top-2",
                ])}
                onPress={() => {
                  smartNavigation.navigateSmart("Unbonding", {
                    validatorAddress,
                  });
                }}
              >
                {intl.formatMessage({
                  id: "Follow",
                })}
              </Text>
            )}
          </View>
        </View>
        <CannotRedelegateModal
          isOpen={displayCannotRedelegateModal}
          close={() => {
            setDisplayCannotRedelegateModal(false);
          }}
          title={intl.formatMessage({
            id: "common.modal.cannotRedelegate.title",
          })}
          content={intl.formatMessage(
            { id: "common.modal.cannotRedelegate.content" },
            { date: redelegationCompletionTime }
          )}
          buttonText={intl.formatMessage({
            id: "Understand",
          })}
        />
      </View>
    </Card>
  );
});

const CannotRedelegateModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  content: string;
  buttonText: string;
}> = registerModal(({ close, title, content, buttonText }) => {
  const style = useStyle();

  return (
    <View style={style.flatten(["height-full", "justify-center"])}>
      <View
        style={style.flatten([
          "items-center",
          "content-stretch",
          "margin-x-16",
          "padding-16",
          "border-radius-12",
          "background-color-card-background",
        ])}
      >
        <Text
          style={style.flatten([
            "text-large-bold",
            "color-label-text-1",
            "text-center",
          ])}
        >
          {title}
        </Text>
        <Text
          style={style.flatten([
            "text-base-regular",
            "color-label-text-1",
            "margin-top-8",
            "text-center",
          ])}
        >
          {content}
        </Text>
        <View style={style.flatten(["width-full", "content-stretch"])}>
          <Button
            text={buttonText}
            onPress={close}
            containerStyle={style.flatten(["margin-top-16"])}
          />
        </View>
      </View>
    </View>
  );
});
