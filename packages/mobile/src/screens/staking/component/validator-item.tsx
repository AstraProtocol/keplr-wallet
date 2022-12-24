import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View, ViewStyle } from "react-native";
import { formatCoin, formatPercent } from "../../../common";
import {
  buildLeftColumn,
  buildRightColumn,
  Button,
  CardDivider,
  IRow,
  ListRowView,
  RectButton,
  RightArrowIcon,
  ValidatorItem,
  ValidatorThumbnail,
} from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";

export const StakingValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator: Staking.Validator;
  hasStake?: boolean;
}> = observer(({ containerStyle, validator, hasStake = undefined }) => {
  const style = useStyle();
  const intl = useIntl();
  const {
    getValidatorThumbnail,
    getValidatorAPR,
    getTotalSharesAmountOf,
    getRewardsAmountOf,
    getStakingAmountOf,
    isStakingTo,
  } = useStaking();

  const validatorAddress = validator.operator_address;

  if (hasStake === undefined) {
    hasStake = isStakingTo(validatorAddress);
  }

  const thumbnail = getValidatorThumbnail(validatorAddress);

  const staked = getStakingAmountOf(validatorAddress);
  const rewards = getRewardsAmountOf(validatorAddress);
  const votingPower = getTotalSharesAmountOf(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);

  const rows = [
    ...(hasStake
      ? [
          {
            key: intl.formatMessage({
              id: "validator.details.delegated.invested",
            }),
            value: formatCoin(staked, false, 2),
          },
          {
            key: intl.formatMessage({
              id: "validator.details.delegated.profit",
            }),
            value: "+" + formatCoin(rewards, false, 4),
            valueColor: style.get("color-rewards-text").color,
          },
        ]
      : [
          {
            key:
              intl.formatMessage({ id: "common.text.interest" }) +
              " " +
              formatPercent(apr) +
              ` ${intl.formatMessage({ id: "_dot_" })} ` +
              intl.formatMessage({ id: "common.text.commission" }) +
              " " +
              formatPercent(validator.commission.commission_rates.rate),
          },
          {
            key:
              intl.formatMessage({
                id: "stake.delegate.validator.totalShares",
              }) +
              " " +
              formatCoin(votingPower, false, 0),
          },
        ]),
  ];

  return (
    <View
      style={{
        ...style.flatten([
          "flex-row",
          "items-start",
          "margin-x-16",
          "margin-top-12",
          "padding-16",
          "border-radius-16",
          "background-color-card-background",
        ]),
        ...containerStyle,
      }}
    >
      <ValidatorThumbnail size={40} url={thumbnail} />
      <View style={style.flatten(["flex-1", "items-stretch", "margin-left-8"])}>
        <Text
          style={style.flatten(["text-medium-medium", "color-label-text-1"])}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {validator.description.moniker}
        </Text>
        {rows.map(({ key, value, valueColor }) => {
          return (
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "margin-top-4",
              ])}
            >
              <Text
                style={style.flatten([
                  "text-small-regular",
                  "color-label-text-2",
                ])}
              >
                {key}
              </Text>
              {value && value.length !== 0 ? (
                <Text
                  style={{
                    ...style.flatten([
                      "text-small-regular",
                      "color-label-text-1",
                      "margin-left-4",
                    ]),
                    ...(valueColor ? { color: valueColor } : {}),
                  }}
                >
                  {value}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
});

export const DashboardMyValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator: Staking.Validator;
}> = observer(({ containerStyle, validator }) => {
  const {
    getValidatorAPR,
    getValidatorThumbnail,
    getRewardsAmountOf,
    getStakingAmountOf,
    getUnbondingAmountOf,
  } = useStaking();

  const validatorAddress = validator.operator_address;

  const thumbnail = getValidatorThumbnail(validatorAddress);
  const stakingAmount = getStakingAmountOf(validatorAddress);
  const rewardsAmount = getRewardsAmountOf(validatorAddress);
  const unbondingAmount = getUnbondingAmountOf(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);

  if (stakingAmount.toDec().isZero() && rewardsAmount.toDec().isZero()) {
    return null;
  }

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "staking.delegate.invested",
          }),
        }),
        buildRightColumn({ text: formatCoin(stakingAmount, false, 2) }),
      ],
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "staking.delegate.profit",
          }),
        }),
        buildRightColumn({
          text: "+" + formatCoin(rewardsAmount, false, 4),
          textColor: style.get("color-rewards-text").color,
        }),
      ],
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "staking.unbonding.unbondingAmount",
          }),
        }),
        buildRightColumn({
          text: formatCoin(unbondingAmount, false, 2),
        }),
      ],
    },
  ];

  return (
    <RectButton
      key={validatorAddress}
      style={{
        ...style.flatten([
          "margin-x-16",
          "margin-top-12",
          "border-radius-16",
          "background-color-card-background",
        ]),
        ...containerStyle,
      }}
      onPress={() => {
        smartNavigation.navigateSmart("Validator.Details", {
          validatorAddress: validatorAddress,
        });
      }}
      underlayColor={style.get("color-transparent").color}
      activeOpacity={0}
    >
      <ValidatorItem
        containerStyle={style.flatten([
          "background-color-transparent",
          "border-width-0",
          "border-radius-0",
          "height-72",
        ])}
        thumbnail={thumbnail}
        name={validator.description.moniker}
        value={
          intl.formatMessage({
            id: "common.text.interest",
          }) +
          " " +
          formatPercent(apr) +
          ` ${intl.formatMessage({ id: "_dot_" })} ` +
          intl.formatMessage(
            { id: "validator.details.commission.percent" },
            {
              percent: formatPercent(
                validator.commission.commission_rates.rate,
                true
              ),
            }
          )
        }
        right={
          <View
            style={style.flatten([
              "width-24",
              "height-24",
              "items-center",
              "justify-center",
            ])}
          >
            <RightArrowIcon height={14} />
          </View>
        }
      />
      <CardDivider style={style.flatten(["background-color-card-separator"])} />
      <ListRowView
        rows={rows}
        style={{
          paddingVertical: 8,
        }}
        hideBorder
        clearBackground
      />
    </RectButton>
  );
});

export const DashboardValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator: Staking.Validator;
}> = observer(({ containerStyle, validator }) => {
  const {
    getValidatorThumbnail,
    getValidatorAPR,
    getTotalSharesAmountOf,
  } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const validatorAddress = validator.operator_address;

  const thumbnail = getValidatorThumbnail(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);
  const totalSharesAmount = getTotalSharesAmountOf(validatorAddress);

  const rows = [
    {
      key: intl.formatMessage({ id: "common.text.interest" }),
      value: `~${intl.formatMessage(
        { id: "common.text.apr" },
        { percent: formatPercent(apr, true) }
      )}`,
    },
    {
      key: intl.formatMessage({ id: "common.text.commission" }),
      value: formatPercent(validator.commission.commission_rates.rate),
    },
    {
      key: intl.formatMessage({ id: "common.text.totalShares" }),
      value: formatCoin(totalSharesAmount, false, 0),
    },
  ];

  return (
    <RectButton
      key={validatorAddress}
      style={{
        ...style.flatten([
          "margin-x-16",
          "margin-top-12",
          "border-radius-16",
          "background-color-card-background",
        ]),
        ...containerStyle,
      }}
      onPress={() => {
        smartNavigation.navigateSmart("Validator.Details", {
          validatorAddress: validatorAddress,
        });
      }}
      underlayColor={style.get("color-transparent").color}
      activeOpacity={0}
    >
      <View
        style={style.flatten([
          "border-color-card-border",
          "padding-x-16",
          "flex-row",
          "items-start",
          "background-color-transparent",
          "padding-y-16",
        ])}
      >
        <ValidatorThumbnail size={40} url={thumbnail} />
        <View
          style={style.flatten(["flex-1", "items-stretch", "margin-left-8"])}
        >
          <Text
            style={style.flatten(["text-medium-medium", "color-label-text-1"])}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {validator.description.moniker}
          </Text>
          {rows.map(({ key, value }) => {
            return (
              <View
                style={style.flatten([
                  "flex-row",
                  "items-center",
                  "margin-top-8",
                ])}
              >
                <Text
                  style={style.flatten([
                    "text-small-regular",
                    "color-label-text-2",
                  ])}
                >
                  {key}
                </Text>
                <Text
                  style={style.flatten([
                    "text-small-regular",
                    "color-label-text-1",
                    "margin-left-4",
                  ])}
                >
                  {value}
                </Text>
              </View>
            );
          })}
          <Button
            size="medium"
            text={intl.formatMessage({ id: "common.text.stake" })}
            containerStyle={style.flatten(["margin-top-16"])}
            onPress={() => {
              smartNavigation.navigateSmart("Delegate", {
                validatorAddress: validatorAddress,
              });
            }}
          />
        </View>
        <View
          style={style.flatten([
            "width-24",
            "height-24",
            "items-center",
            "justify-center",
            "margin-left-8",
          ])}
        >
          <RightArrowIcon height={14} />
        </View>
      </View>
    </RectButton>
  );
});
