import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoin, formatPercent } from "../../../common";
import {
  buildLeftColumn,
  buildRightColumn,
  Button,
  CardDivider,
  IRow,
  ListRowView,
  RightArrowIcon,
  ValidatorThumbnail,
} from "../../../components";
import { Chip } from "../../../components/chip";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";
import { TooltipIcon } from "./tooltip-icon";
import { TooltipBottomSheet } from "./tooltip-label";

export const StakingValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator?: Staking.Validator;
  hasStake?: boolean;
}> = ({ containerStyle, validator, hasStake = undefined }) => {
  if (!validator) {
    return null;
  }

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

  const stakingAmount = getStakingAmountOf(validatorAddress);
  const rewardsAmount = getRewardsAmountOf(validatorAddress);
  const totalSharesAmount = getTotalSharesAmountOf(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);

  const aprText = intl.formatMessage({ id: "APR" }) + " " + formatPercent(apr);
  const commissionText =
    intl.formatMessage({ id: "Commission" }) +
    " " +
    formatPercent(validator.commission.commission_rates.rate);
  const totalSharesText =
    intl.formatMessage({
      id: "TotalShares",
    }) +
    " " +
    formatCoin(totalSharesAmount, false, 0);
  const dotText = intl.formatMessage({ id: "_dot_" });

  const rows = [
    ...(hasStake
      ? [
          {
            key: intl.formatMessage({
              id: "StakingAmount",
            }),
            value: formatCoin(stakingAmount, false, 2),
          },
          {
            key: intl.formatMessage({
              id: "RewardsAmount",
            }),
            value: "+" + formatCoin(rewardsAmount, false, 4),
            valueColor: style.get("color-rewards-text").color,
          },
        ]
      : [
          {
            key: aprText + ` ${dotText} ` + commissionText,
          },
          {
            key: totalSharesText,
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
          "border-radius-12",
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
};

export const DashboardMyValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator?: Staking.Validator;
}> = observer(({ containerStyle, validator }) => {
  if (!validator) {
    return null;
  }

  const {
    getValidatorAPR,
    getValidatorThumbnail,
    getRewardsAmountOf,
    getStakingAmountOf,
    getUnbondingAmountOf,
  } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const validatorAddress = validator.operator_address;

  const thumbnail = getValidatorThumbnail(validatorAddress);
  const stakingAmount = getStakingAmountOf(validatorAddress);
  const rewardsAmount = getRewardsAmountOf(validatorAddress);
  const unbondingAmount = getUnbondingAmountOf(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);

  const aprText = intl.formatMessage({ id: "APR" }) + " " + formatPercent(apr);
  const commissionText =
    intl.formatMessage({ id: "Commission" }) +
    " " +
    formatPercent(validator.commission.commission_rates.rate);
  const dotText = intl.formatMessage({ id: "_dot_" });

  if (stakingAmount.toDec().isZero() && rewardsAmount.toDec().isZero()) {
    return null;
  }

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({
            id: "StakingAmount",
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
            id: "RewardsAmount",
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
            id: "UnstakingAmount",
          }),
        }),
        buildRightColumn({
          text: formatCoin(unbondingAmount, false, 2),
        }),
      ],
    },
  ];

  return (
    <View
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
    >
      <ValidatorInfo
        hideStatus={!validator.jailed}
        hideButton
        name={validator.description.moniker}
        thumbnail={thumbnail}
        data={[{ key: aprText + ` ${dotText} ` + commissionText }]}
        active={!validator.jailed}
        onArrowPress={() => {
          smartNavigation.navigateSmart("Validator.Details", {
            validatorAddress: validatorAddress,
          });
        }}
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
    </View>
  );
});

export const DashboardValidatorItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  validator: Staking.Validator;
  hideStakeButton?: boolean;
}> = ({ containerStyle, validator, hideStakeButton = false }) => {
  const { getValidatorAPR, getTotalSharesAmountOf } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const validatorAddress = validator.operator_address;

  const apr = getValidatorAPR(validatorAddress);
  const totalSharesAmount = getTotalSharesAmountOf(validatorAddress);

  const rows = [
    {
      key: intl.formatMessage({ id: "APR" }),
      value: formatPercent(apr) + "/" + intl.formatMessage({ id: "Year" }),
    },
    {
      key: intl.formatMessage({ id: "Commission" }),
      value: formatPercent(validator.commission.commission_rates.rate),
    },
    {
      key: intl.formatMessage({ id: "TotalShares" }),
      value: formatCoin(totalSharesAmount, false, 0),
    },
  ];

  return (
    <View
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
    >
      <ValidatorInfo
        hideStatus
        hideButton={hideStakeButton}
        name={validator.description.moniker}
        data={rows}
        buttonText={intl.formatMessage({ id: "Stake" })}
        onButtonPress={() => {
          smartNavigation.navigateSmart("Delegate", {
            validatorAddress: validatorAddress,
          });
        }}
        onArrowPress={() => {
          smartNavigation.navigateSmart("Validator.Details", {
            validatorAddress: validatorAddress,
          });
        }}
      />
    </View>
  );
};

const ValidatorInfo: FunctionComponent<{
  containerStyle?: ViewStyle;
  name?: string;
  thumbnail?: string;
  data: { key?: string; value?: string; valueColor?: string }[];
  hideStatus?: boolean;
  hideButton?: boolean;
  active?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
  onArrowPress?: () => void;
}> = ({
  containerStyle,
  name,
  thumbnail,
  data,
  hideStatus,
  hideButton,
  active,
  buttonText,
  onButtonPress,
  onArrowPress,
}) => {
  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <View
      style={{
        ...style.flatten([
          "border-color-card-border",
          "padding-x-16",
          "flex-row",
          "items-start",
          "background-color-transparent",
          "padding-y-16",
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
          {name}
        </Text>
        {data.map(({ key, value, valueColor }) => {
          return (
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "margin-top-8",
                // `margin-top-${index != 0 ? 8 : 0}`,
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
              {value && (
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
              )}
            </View>
          );
        })}
        {hideStatus != true && (
          <View
            style={style.flatten(["flex-row", "items-center", "margin-top-8"])}
          >
            <Chip
              size="small"
              type={active ? "success" : "error"}
              text={intl.formatMessage({
                id: active ? "Active" : "Inactive",
              })}
            />
            {!active && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setIsOpen(!isOpen);
                }}
                style={style.flatten(["margin-left-4"])}
              >
                <TooltipIcon size={20} />
              </TouchableOpacity>
            )}
          </View>
        )}
        {hideButton != true && buttonText && (
          <Button
            size="medium"
            text={buttonText}
            containerStyle={style.flatten(["margin-top-16"])}
            onPress={onButtonPress}
          />
        )}
      </View>
      <TouchableOpacity
        activeOpacity={1}
        style={style.flatten([
          "width-24",
          "height-24",
          "items-center",
          "justify-center",
          "margin-left-8",
        ])}
        onPress={onArrowPress}
      >
        <RightArrowIcon height={14} />
      </TouchableOpacity>
      <TooltipBottomSheet
        isOpen={isOpen}
        close={() => {
          setIsOpen(!isOpen);
        }}
        title={intl.formatMessage({ id: "Tooltip.Inactive.Title" })}
        contentView={
          <View
            style={{
              ...style.flatten(["margin-x-16", "margin-top-8"]),
              marginBottom: safeAreaInsets.bottom + 24,
            }}
          >
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {intl.formatMessage({ id: "Tooltip.Inactive.Desc" })}
            </Text>
          </View>
        }
      />
    </View>
  );
};
