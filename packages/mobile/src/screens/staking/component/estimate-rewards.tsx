import { CoinPretty, Dec } from "@keplr-wallet/unit";
import React, { Fragment, FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoinRewards } from "../../../common";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";
import { TooltipLabel } from "./tooltip-label";

export const EstimateRewardsView: FunctionComponent<{
  validatorAddress: string;
  stakingAmount: CoinPretty;
}> = ({ validatorAddress, stakingAmount }) => {
  const { getValidatorAPR } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const apr = getValidatorAPR(validatorAddress);
  const daysPerYear = 365;
  const rewardsAmount = stakingAmount.mul(new Dec(apr / daysPerYear));

  const estimatedRewardsText =
    "+" +
    formatCoinRewards(rewardsAmount) +
    "/" +
    intl.formatMessage({ id: "Day" });

  return (
    <Fragment>
      <View style={style.flatten(["flex-row", "items-center", "margin-top-8"])}>
        <TooltipLabel
          textStyle={style.flatten(["text-base-regular"])}
          text={intl.formatMessage({
            id: "APR",
          })}
          bottomSheetTitle={intl.formatMessage({
            id: "Tooltip.APR.Title",
          })}
          bottomSheetContentView={
            <View
              style={{
                ...style.flatten(["margin-x-16", "margin-top-8"]),
                marginBottom: safeAreaInsets.bottom + 24,
              }}
            >
              <Text
                style={style.flatten([
                  "color-label-text-1",
                  "text-base-regular",
                ])}
              >
                {intl.formatMessage({ id: "Tooltip.APR.Desc" })}
              </Text>
            </View>
          }
        />
        <Text
          style={style.flatten([
            "flex-1",
            "text-base-medium",
            "text-right",
            "color-rewards-text",
            "margin-left-8",
          ])}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {estimatedRewardsText}
        </Text>
      </View>
    </Fragment>
  );
};
