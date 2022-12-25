import React, { FunctionComponent, useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useQueryBalances } from "../../main/hook/use-query-balance";
import { useStaking } from "../hook/use-staking";
import { DelegationsItem } from "./delegate";
import { DashboardHeader } from "./header";
import { RewardsItem } from "./rewards";

export const StakingDashboardScreen: FunctionComponent = () => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  const { chainStore, accountStore, queriesStore } = useStore();
  const {
    queryRewards,
    queryDelegations,
    queryUnbondingDelegations,
  } = useStaking();
  const { waitBalanceResponses } = useQueryBalances();

  const onRefresh = useCallback(async () => {
    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      waitBalanceResponses(),
      queryRewards.waitFreshResponse(),
      queryDelegations.waitFreshResponse(),
      queryUnbondingDelegations.waitFreshResponse(),
    ]);
  }, [accountStore, chainStore, queriesStore]);

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <ScrollView
        style={{
          marginTop: safeAreaInsets.top,
        }}
        contentContainerStyle={{
          ...style.flatten(["padding-bottom-48"]),
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <DashboardHeader containerStyle={style.flatten(["margin-top-24"])} />
        <RewardsItem containerStyle={style.flatten(["margin-top-24"])} />
        <DelegationsItem
          containerStyle={style.flatten([
            "background-color-background",
            "margin-top-24",
          ])}
        />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: safeAreaInsets.bottom + 16,
          }}
        />
      </ScrollView>
    </View>
  );
};
