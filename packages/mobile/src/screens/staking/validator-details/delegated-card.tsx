import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Text, View, ViewStyle } from "react-native";
import { formatCoin } from "../../../common/utils";
import { Button, CannotRedelegateIcon } from "../../../components";
import { Card } from "../../../components/card";
import { registerModal } from "../../../modals/base";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { PropertyView, PropertyViewIconType } from "../component/property";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();
  const intl = useIntl();

  const [
    displayCannotRedelegateModal,
    setDisplayCannotRedelegateModal,
  ] = useState(false);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  const redelegation = queries.cosmos.queryRedelegations
    .getQueryBech32Address(account.bech32Address)
    .getRedelegations({ dstValidatorAddress: validatorAddress })
    .shift();

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

  const unbondingsQuery = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondings = unbondingsQuery.unbondingBalances;

  const zeroAmount = new CoinPretty(staked.currency, new Dec(0));
  const unbonding = unbondings.find(
    (unbonding) => validatorAddress === unbonding.validatorAddress
  );
  const unbondingAmount =
    unbonding?.entries.reduce((coin, entry) => {
      return coin.add(entry.balance);
    }, zeroAmount) || zeroAmount;

  return (
    <Card style={containerStyle}>
      <View
        style={style.flatten([
          "padding-x-12",
          "padding-y-16",
          "background-color-card-background",
          "border-radius-16",
        ])}
      >
        <PropertyView
          iconType={PropertyViewIconType.staked}
          label={intl.formatMessage({
            id: "validator.details.delegated.invested",
          })}
          value={formatCoin(staked, false, 2)}
          labelStyle={style.flatten(["color-staking-staked-text"])}
        />
        <Button
          size="medium"
          text={intl.formatMessage({
            id: "validator.details.delegated.investMore",
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
              id: "validator.details.delegated.regelegate",
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
              id: "validator.details.delegated.undelegate",
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
              id: "validator.details.delegated.profit",
            })}
            value={"+" + formatCoin(rewards, false, 4)}
            labelStyle={style.flatten(["color-staking-rewards-text"])}
          />
          <View style={style.flatten(["width-8"])} />
          <View style={style.flatten(["flex-1"])}>
            <PropertyView
              iconType={PropertyViewIconType.unbonding}
              label={intl.formatMessage(
                { id: "validator.details.delegated.unbonding" },
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
                  id: "common.text.follow",
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
            id: "common.text.understand",
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
          "margin-x-40",
          "padding-16",
          "border-radius-8",
          "border-width-1",
          "border-color-gray-60",
          "background-color-gray-90",
        ])}
      >
        <CannotRedelegateIcon />
        <Text
          style={style.flatten([
            "text-medium-semi-bold",
            "color-gray-10",
            "margin-top-16",
            "text-center",
          ])}
        >
          {title}
        </Text>
        <Text
          style={style.flatten([
            "text-base-regular",
            "color-gray-30",
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
