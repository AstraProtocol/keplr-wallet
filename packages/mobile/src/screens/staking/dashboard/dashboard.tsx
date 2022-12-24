import React, { FunctionComponent } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { DelegationsItem } from "./delegate";
import { DashboardHeader } from "./header";
import { RewardsItem } from "./rewards";

export const StakingDashboardScreen: FunctionComponent = () => {
  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  const { chainStore, accountStore, queriesStore } = useStore();
  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map((bal) => {
          return bal.waitFreshResponse();
        }),
      queries.cosmos.queryRewards
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
    ]);
  }, [accountStore, chainStore, queriesStore]);

  return (
    <View style={style.get("background-color-background")}>
      <ScrollView
        style={{
          ...style.flatten(["margin-bottom-48"]),
          marginTop: safeAreaInsets.top,
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
            "margin-bottom-16",
          ])}
        />
      </ScrollView>
      <View style={style.flatten(["height-48"])} />
    </View>
  );
};
