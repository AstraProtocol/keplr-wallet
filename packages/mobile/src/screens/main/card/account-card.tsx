import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { Text, View, ViewStyle } from "react-native";
import { formatCoinAmount } from "../../../common/utils";
import { AddressCopyableItem } from "../../../components/address-copyable";
import { Card, CardBody } from "../../../components/card";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const AccountCardNew: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const stakable = queryStakable.balance;

  return (
    <Card style={containerStyle}>
      <CardBody
        style={style.flatten(["padding-y-0", "justify-center", "items-center"])}
      >
        <Text style={style.flatten(["color-white", "text-4x-large-semi-bold"])}>
          {formatCoinAmount(stakable)}
        </Text>
      </CardBody>
      <View style={{ alignItems: "center" }}>
        <AddressCopyableItem
          style={{ width: 200, marginTop: 6 }}
          address={account.ethereumHexAddress}
          maxCharacters={22}
        />
      </View>
    </Card>
  );
});
