import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";

import { Text, View, ViewStyle } from "react-native";
import { Button } from "../../../components/button";
import { Card, CardBody } from "../../../components/card";

import { useIntl } from "react-intl";
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
                "color-label-text-1",
                "body3",
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
                  id: "APR",
                })}
                bottomSheetContentView={
                  <Text
                    style={style.flatten([
                      "color-label-text-1",
                      "text-base-regular",
                      "margin-x-16",
                      "margin-top-8",
                      "margin-bottom-24",
                    ])}
                  >
                    Phần trăm lợi nhuận theo năm. Lãi xuất biến động liên tục,
                    nên phần thưởng dự tính có thể khác với phần thưởng thực tế
                    nhận được.
                  </Text>
                }
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
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
            </View>
            <View style={style.flatten(["flex-1"])}>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "Commission",
                })}
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Commission",
                })}
                bottomSheetContentView={
                  <Text
                    style={style.flatten([
                      "color-label-text-1",
                      "text-base-regular",
                      "margin-x-16",
                      "margin-top-8",
                      "margin-bottom-24",
                    ])}
                  >
                    1 phần từ phần thưởng của bạn sẽ được chia cho nhà cung cấp
                    staking. Phí này sẽ dùng để họ bảo mật hệ thống và xử lý các
                    giao dịch.
                  </Text>
                }
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
                  id: "TotalShares",
                })}
                bottomSheetContentView={
                  <Text
                    style={style.flatten([
                      "color-label-text-1",
                      "text-base-regular",
                      "margin-x-16",
                      "margin-top-8",
                      "margin-bottom-24",
                    ])}
                  >
                    Bao gồm ASA của nhà cung cấp staking và ASA bởi người dùng
                    đang stake.
                  </Text>
                }
              />
              <Text
                style={style.flatten([
                  "color-label-text-1",
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
                textStyle={style.flatten(["text-small-medium"])}
                bottomSheetTitle={intl.formatMessage({
                  id: "Uptime",
                })}
                bottomSheetContentView={
                  <Text
                    style={style.flatten([
                      "color-label-text-1",
                      "text-base-regular",
                      "margin-x-16",
                      "margin-top-8",
                      "margin-bottom-24",
                    ])}
                  >
                    Thời gian hoạt động của nhà cung cấp staking. Trong lúc nhà
                    cung cấp ngừng hoạt động, bạn sẽ không nhận được phần
                    thưởng.
                  </Text>
                }
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
              bottomSheetTitle={intl.formatMessage({
                id: "validator.details.maxRate",
              })}
              bottomSheetContentView={
                <Text
                  style={style.flatten([
                    "color-label-text-1",
                    "text-base-regular",
                    "margin-x-16",
                    "margin-top-8",
                    "margin-bottom-24",
                  ])}
                >
                  Tỷ lệ này được cài đặt bởi nhà cung cấp staking khi thiết lập.
                  Nhà cung cấp không thể đặt mức phí vượt quá phần trăm mà họ đã
                  chọn.
                </Text>
              }
            />
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {intl.formatMessage(
                { id: "validator.details.percentValue" },
                {
                  percent: formatPercent(
                    validator.commission.commission_rates.max_rate,
                    true
                  ),
                }
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
              text={intl.formatMessage({
                id: "validator.details.maxChangeRate",
              })}
              textStyle={style.flatten(["text-base-regular"])}
              bottomSheetTitle={intl.formatMessage({
                id: "validator.details.maxChangeRate",
              })}
              bottomSheetContentView={
                <Text
                  style={style.flatten([
                    "color-label-text-1",
                    "text-base-regular",
                    "margin-x-16",
                    "margin-top-8",
                    "margin-bottom-24",
                  ])}
                >
                  Đấy là phần trăm phí vận hành mà nhà cung cấp có thể thay đổi
                  tối đa hàng ngày
                </Text>
              }
            />
            <Text
              style={style.flatten(["color-label-text-1", "text-base-regular"])}
            >
              {intl.formatMessage(
                { id: "validator.details.percentValue" },
                {
                  percent: formatPercent(
                    validator.commission.commission_rates.max_change_rate,
                    true
                  ),
                }
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
              text={intl.formatMessage({ id: "validator.details.updateTime" })}
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
