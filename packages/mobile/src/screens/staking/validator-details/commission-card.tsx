import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";

import { Text, View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { Card, CardBody } from "../../../components/card";

import { useIntl } from "react-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  formatCoinTotalShares,
  formatDate,
  formatPercent,
} from "../../../common/utils";
import { useSmartNavigation } from "../../../navigation-util";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";
import { useStaking } from "../hook/use-staking";
import {
  CommissionInfo0,
  CommissionInfo1,
  CommissionInfo2,
} from "./commission-icon";

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
  const safeAreaInsets = useSafeAreaInsets();

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

  const getDescView = (
    desc: string,
    containerStyle: ViewStyle | undefined = undefined
  ) => {
    return (
      <View
        style={{
          ...style.flatten(["margin-x-16", "margin-top-8"]),
          marginBottom: safeAreaInsets.bottom + 24,
          ...containerStyle,
        }}
      >
        <Text
          style={style.flatten(["color-label-text-1", "text-base-regular"])}
        >
          {desc}
        </Text>
      </View>
    );
  };

  const getCommissionDescView = () => {
    return (
      <View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "padding-x-16",
            "margin-x-16",
            "margin-top-24",
          ])}
        >
          <CommissionInfo0 />
          <View style={style.flatten(["flex-1", "margin-left-8"])}>
            <View style={style.flatten(["flex-row"])}>
              <CommissionInfo1 />
              <Text
                style={style.flatten([
                  "flex-1",
                  "color-label-text-2",
                  "text-small-regular",
                  "margin-left-8",
                ])}
              >
                {intl.formatMessage({
                  id: "Tooltip.Commission.Info.1",
                })}
              </Text>
            </View>
            <View style={style.flatten(["flex-row", "margin-top-12"])}>
              <CommissionInfo2 />
              <Text
                style={style.flatten([
                  "flex-1",
                  "color-label-text-2",
                  "text-small-regular",
                  "margin-left-8",
                ])}
              >
                {intl.formatMessage({
                  id: "Tooltip.Commission.Info.2",
                })}
              </Text>
            </View>
          </View>
        </View>
        {getDescView(
          intl.formatMessage({
            id: "Tooltip.Commission.Desc",
          }),
          style.flatten(["margin-top-24"])
        )}
      </View>
    );
  };

  return (
    <Card style={containerStyle}>
      {validator ? (
        <CardBody style={style.flatten(["padding-y-0"])}>
          {validator.description.details ? (
            <Text
              style={style.flatten([
                "text-left",
                "color-label-text-1",
                "body3",
                "margin-top-12",
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
                  id: "APR",
                })}
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Tooltip.APR.Title",
                })}
                bottomSheetContentView={getDescView(
                  intl.formatMessage({
                    id: "Tooltip.APR.Desc",
                  })
                )}
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {formatPercent(apr) + "/" + intl.formatMessage({ id: "Year" })}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "Commission",
                })}
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Tooltip.Commission.Title",
                })}
                bottomSheetContentView={getCommissionDescView()}
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
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
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Tooltip.TotalShares.Title",
                })}
                bottomSheetContentView={getDescView(
                  intl.formatMessage({
                    id: "Tooltip.TotalShares.Desc",
                  })
                )}
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
                  "text-x-large-medium",
                  "margin-top-2",
                ])}
              >
                {formatCoinTotalShares(totalStakesAmount)}
              </Text>
            </View>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "Uptime",
                })}
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Tooltip.Uptime.Title",
                })}
                bottomSheetContentView={getDescView(
                  intl.formatMessage({
                    id: "Tooltip.Uptime.Desc",
                  })
                )}
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
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
              style={style.flatten([
                "color-label-text-1",
                "text-base-semi-bold",
              ])}
            >
              {intl.formatMessage({
                id: "CommissionDetails",
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
              text={intl.formatMessage({ id: "CommissionMaxRate" })}
              textStyle={style.flatten(["text-base-regular"])}
              bottomSheetTitle={intl.formatMessage({
                id: "Tooltip.CommissionMaxRate.Title",
              })}
              bottomSheetContentView={getDescView(
                intl.formatMessage({
                  id: "Tooltip.CommissionMaxRate.Desc",
                })
              )}
            />
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {formatPercent(validator.commission.commission_rates.max_rate)}
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
                id: "CommissionMaxChangeRate",
              })}
              textStyle={style.flatten(["text-base-regular"])}
              bottomSheetTitle={intl.formatMessage({
                id: "Tooltip.CommissionMaxChangeRate.Title",
              })}
              bottomSheetContentView={getDescView(
                intl.formatMessage({
                  id: "Tooltip.CommissionMaxChangeRate.Desc",
                })
              )}
            />
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {formatPercent(
                validator.commission.commission_rates.max_change_rate
              )}
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
              text={intl.formatMessage({ id: "LastChange" })}
              textStyle={style.flatten(["text-base-regular"])}
            />
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {dateText}
            </Text>
          </View>
        </CardBody>
      ) : null}
    </Card>
  );
});
