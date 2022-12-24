import { CoinPretty, Dec } from "@keplr-wallet/unit";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";
import { formatCoin } from "../../../common";
import { AlertInfoIcon } from "../../../components";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";

export const EstimateRewardsView: FunctionComponent<{
  validatorAddress: string;
  stakingAmount: CoinPretty;
}> = ({ validatorAddress, stakingAmount }) => {
  const { getValidatorAPR } = useStaking();

  const style = useStyle();
  const intl = useIntl();

  const apr = getValidatorAPR(validatorAddress);
  const numOfYear = 1;
  const rewardsAmount = stakingAmount.mul(new Dec(apr));

  const estimatedRewardsText = `+${formatCoin(rewardsAmount, false, 4)}`;

  return (
    <View
      style={style.flatten([
        "flex-row",
        "items-center",
        "height-48",
        "padding-x-16",
        "background-color-alert-inline-success-background",
      ])}
    >
      <AlertInfoIcon
        style={{ marginRight: 8 }}
        size={20}
        color={style.get("color-white").color}
      />
      <Text
        style={style.flatten([
          "flex-1",
          "text-base-regular",
          "color-label-text-1",
        ])}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {intl.formatMessage({
          id: "common.inline.staking.estimatedRewards",
        }) + " "}
        <Text
          style={style.flatten(["text-underline"])}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {numOfYear +
            " " +
            intl.formatMessage({
              id: "common.text.date.year",
            })}
        </Text>
      </Text>
      <Text
        style={style.flatten(["text-base-medium", "color-rewards-text"])}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {estimatedRewardsText}
      </Text>
    </View>
  );
};
