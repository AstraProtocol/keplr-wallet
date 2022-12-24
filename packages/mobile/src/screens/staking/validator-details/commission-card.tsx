import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";

import { Text, View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { Card, CardBody } from "../../../components/card";

import { FormattedMessage, useIntl } from "react-intl";
import { formatCoin, formatDate, formatPercent } from "../../../common/utils";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { useStaking } from "../hook/use-staking";

export const CommissionsCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
  showStake: boolean;
}> = observer(({ containerStyle, validatorAddress, showStake }) => {
  const {
    getTotalSharesAmountOf,
    getValidatorAPR,
    queryValidators,
  } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const validator = useMemo(() => {
    return queryValidators.validators.find(
      (val) => val.operator_address === validatorAddress
    );
  }, [queryValidators.validators, validatorAddress]);

  let dateText = "";
  if (validator) {
    const date = new Date(validator.commission.update_time);
    dateText = formatDate(date);
  }
  const uptimeText = "100%";

  const totalStakesAmount = getTotalSharesAmountOf(validatorAddress);
  const apr = getValidatorAPR(validatorAddress);

  return (
    <Card style={containerStyle}>
      {validator ? (
        <CardBody style={style.flatten(["padding-y-0"])}>
          {validator.description.details ? (
            <Text
              style={style.flatten([
                "text-left",
                "color-gray-10",
                "body3",
                // "margin-top-16"
              ])}
            >
              {validator.description.details}
              {validator.description.website ? (
                <Text
                  style={style.flatten(["text-underline", "color-link-text"])}
                >
                  {validator.description.website}
                </Text>
              ) : null}
            </Text>
          ) : null}
          <View style={style.flatten(["flex-row", "margin-top-24"])}>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "InterestRate",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {intl.formatMessage(
                  {
                    id: "common.text.apr",
                  },
                  {
                    percent: formatPercent(apr, true),
                  }
                )}
              </Text>
              {/* <TooltipLabel
                text={intl.formatMessage(
                  { id: "validator.details.votingPower" },
                  { percent: 6.51 }
                )}
              /> */}
            </View>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "OperatingFee",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {formatPercent(validator.commission.commission_rates.rate)}
              </Text>
            </View>
          </View>
          <View style={style.flatten(["flex-row", "margin-top-24"])}>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "TotalShares",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {formatCoin(totalStakesAmount, false, 0)}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "Uptime",
                })}
                textStyle={style.flatten(["text-small-regular"])}
              />
              <Text
                style={style.flatten([
                  "color-gray-10",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {uptimeText}
              </Text>
            </View>
          </View>
          {showStake ? (
            <Button
              containerStyle={style.flatten(["margin-top-24"])}
              text={intl.formatMessage({ id: "Stake" })}
              onPress={() => {
                smartNavigation.navigateSmart("Delegate", {
                  validatorAddress,
                });
              }}
            />
          ) : null}

          <View
            style={style.flatten([
              "height-1",
              "background-color-border",
              "margin-top-24",
            ])}
          />
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-24",
            ])}
          >
            <Text
              style={style.flatten(["color-gray-10", "text-base-semi-bold"])}
            >
              {intl.formatMessage({
                id: "validator.details.commission.details",
              })}
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.maxRate" })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: formatPercent(
                    validator.commission.commission_rates.max_rate,
                    true
                  ),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({
                id: "validator.details.maxChangeRate",
              })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              <FormattedMessage
                id="validator.details.percentValue"
                values={{
                  percent: formatPercent(
                    validator.commission.commission_rates.max_change_rate,
                    true
                  ),
                }}
              />
            </Text>
          </View>
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "justify-between",
              "margin-top-16",
            ])}
          >
            <TooltipLabel
              text={intl.formatMessage({ id: "validator.details.updateTime" })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text style={style.flatten(["color-gray-10", "text-base-regular"])}>
              {dateText}
            </Text>
          </View>
        </CardBody>
      ) : null}
    </Card>
  );
});
