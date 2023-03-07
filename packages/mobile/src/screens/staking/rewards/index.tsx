import React, { FunctionComponent, useEffect, useState } from "react";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

import { useSendTxConfig } from "@keplr-wallet/hooks";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useIntl } from "react-intl";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import {
  formatCoinAmount,
  formatCoinFee,
  MIN_AMOUNT,
} from "../../../common/utils";
import { Button } from "../../../components/button";
import { useTransaction } from "../../tx-result/hook/use-transaction";
import { useStaking } from "../hook/use-staking";
import { RewardDetails } from "./rewards";

export type StakableRewards = {
  delegatorAddress?: string;
  validatorAddress?: string;
  validatorName?: string;
  rewardsAmount?: CoinPretty;
};

export const StakingRewardScreen: FunctionComponent = () => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
  } = useStore();
  const { getValidator, getRewardsAmountOf, getDelegations } = useStaking();
  const { simulateWithdrawRewardsTx, sendTransaction } = useTransaction();

  const chainId = chainStore.current.chainId;
  const chain = chainStore.getChain(chainId);
  const ethereumEndpoint = chain.raw.ethereumEndpoint;

  const account = accountStore.getAccount(chainStore.current.chainId);

  const style = useStyle();
  const intl = useIntl();

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    ethereumEndpoint
  );

  const stakableRewardsList = getDelegations()
    .map((delegation) => {
      const validator = getValidator(delegation.delegation.validator_address);
      const rewardsAmount = getRewardsAmountOf(
        delegation.delegation.validator_address
      );

      return {
        delegatorAddress: account.bech32Address,
        validatorAddress: validator?.operator_address,
        validatorName: validator?.description.moniker,
        rewardsAmount,
      };
    })
    .filter((stakableRewards) => {
      const { rewardsAmount } = stakableRewards;
      return rewardsAmount.toDec().gte(new Dec(MIN_AMOUNT));
    })
    .sort((a, b) => {
      // Sort DESC
      return Number(b.rewardsAmount.toDec()) - Number(a.rewardsAmount.toDec());
    });

  const stakingReward = stakableRewardsList
    ? stakableRewardsList
        ?.map(({ rewardsAmount }) => rewardsAmount)
        .reduce((oldRewards, newRewards) => {
          return oldRewards.add(newRewards);
        })
    : undefined;

  const validatorAddresses = stakableRewardsList.map(
    (info) => info.validatorAddress
  ) as string[];

  useEffect(() => {
    simulateWithdrawRewardsTx(validatorAddresses)
      .then(({ feeAmount, gasPrice, gasLimit }) => {
        sendConfigs.feeConfig.setManualFee(feeAmount);
        sendConfigs.gasConfig.setGas(gasLimit);
        setGasPrice(gasPrice);
        setGasLimit(gasLimit);
        setIsGasEstimated(true);
      })
      .catch((e) => {
        console.log("__ERROR__", e);
        setIsGasEstimated(false);
      });
  }, []);

  const [gasPrice, setGasPrice] = useState(0);
  const [gasLimit, setGasLimit] = useState(0);
  const [isGasEstimated, setIsGasEstimated] = useState(false);

  const feeText = formatCoinFee(sendConfigs.feeConfig.fee);

  const withdrawAllRewards = async () => {
    // const params = {
    //   token: stakingReward?.denom,
    //   amount: Number(stakingReward?.toDec() || 0),
    //   fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
    //   gas: gasLimit,
    //   gas_price: gasPrice,
    //   validator_addresses: JSON.stringify(validatorAddresses),
    // };

    try {
      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.withdrawRewards.type,
        value: {
          totalRewards: stakingReward,
          fee: sendConfigs.feeConfig.fee,
          validatorRewards: stakableRewardsList,
          gasLimit,
          gasPrice,
        },
      });

      await sendTransaction();
    } catch (e: any) {
      // analyticsStore.logEvent("astra_hub_claim_reward", {
      //   ...params,
      //   success: false,
      //   error: e?.message,
      // });
      // if (e?.message === "Request rejected") {
      //   return;
      // }
      // transactionStore.updateTxState("failure");
      console.log("__TRANSACTION__FAIL__", e);
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <View style={style.flatten(["height-24"])} />
      <Text
        style={style.flatten([
          "color-gray-30",
          "text-base-regular",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "TotalRewardsAmount" })}
      </Text>
      <Text
        style={style.flatten([
          "color-gray-10",
          "text-4x-large-semi-bold",
          "text-center",
          "margin-top-4",
          "margin-bottom-24",
        ])}
      >
        {formatCoinAmount(stakingReward)}
      </Text>
      <View
        style={style.flatten([
          "height-1",
          "background-color-gray-70",
          "margin-x-page",
        ])}
      />
      <ScrollView style={style.flatten(["flex-1"])}>
        <RewardDetails
          stakableRewardsList={stakableRewardsList}
          feeText={feeText}
          containerStyle={style.flatten(["background-color-background"])}
        />
      </ScrollView>
      <View style={style.flatten(["height-1", "background-color-gray-70"])} />
      <Button
        containerStyle={style.flatten(["margin-y-12", "margin-x-page"])}
        text={intl.formatMessage({ id: "ClaimRewards" })}
        onPress={withdrawAllRewards}
        loading={account.txTypeInProgress === "withdrawRewards"}
        disabled={!isGasEstimated}
      />
      <SafeAreaView />
    </View>
  );
};
