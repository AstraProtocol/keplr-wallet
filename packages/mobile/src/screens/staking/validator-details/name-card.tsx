import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";

import { Staking } from "@keplr-wallet/stores";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { Card, CardBody } from "../../../components/card";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const ValidatorNameCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unspecified
  );

  const validator = useMemo(() => {
    return queryValidators.validators.find(
      (val) => val.operator_address === validatorAddress
    );
  }, [queryValidators.validators, validatorAddress]);

  const thumbnail = queryValidators.getValidatorThumbnail(validatorAddress);

  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Card
      style={StyleSheet.flatten([
        style.flatten(["background-color-transparent"]),
        containerStyle,
      ])}
    >
      <View
        style={{
          height: safeAreaInsets.top + 44,
        }}
      />
      {validator ? (
        <CardBody
          style={style.flatten([
            "items-center",
            "padding-y-0",
            "margin-top-16",
          ])}
        >
          <ValidatorThumbnail size={80} url={thumbnail} />
          <Text
            style={style.flatten(["subtitle1", "color-white", "margin-top-16"])}
          >
            {validator.description.moniker}
          </Text>
        </CardBody>
      ) : null}
    </Card>
  );
});
