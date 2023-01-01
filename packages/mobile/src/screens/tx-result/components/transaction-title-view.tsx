import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { StyleSheet, Text, View } from "react-native";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { MsgSwap } from "../models/messages";

export const TransactionTitleView: FunctionComponent = observer(() => {
  const { transactionStore } = useStore();
  const style = useStyle();
  const intl = useIntl();

  const rawData = transactionStore.rawData;
  if (rawData && rawData.type !== "wallet-swap") {
    return null;
  }
  const viewData = rawData?.value as MsgSwap;
  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(["items-center", "padding-x-16", "margin-top-4"]),
      ])}
    >
      <Text
        style={style.flatten([
          "text-2x-large-medium",
          "color-label-text-1",
          "text-center",
        ])}
      >
        {intl.formatMessage({ id: "From" }) +
          " " +
          viewData.inputAmount +
          "\n" +
          intl.formatMessage({ id: "To" }) +
          " " +
          viewData.outputAmount}
      </Text>
    </View>
  );
});
