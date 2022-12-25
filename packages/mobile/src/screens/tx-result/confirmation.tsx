import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoin } from "../../common";
import { Button, ListRowView } from "../../components";
import { CustomNavigationBar } from "../../components/navigation-bar/custom-navigation-bar";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { useTransaction } from "./hook/use-transaction";
import { getSeparatorRow, join } from "./models/messages";

export const TxConfirmationScreen: FunctionComponent = () => {
  const {} = useStore();
  const {
    getTxAmount,
    getTxText,
    getTxDetailsRows,
    sendTransaction,
  } = useTransaction();
  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const txText = getTxText()?.confirmation;
  const txAmountText = formatCoin(getTxAmount(), false, 4);
  const rows = join(getTxDetailsRows(), getSeparatorRow());

  const [isLoading, setIsLoading] = useState(false);

  const onContinueHandler = async () => {
    setIsLoading(true);
    try {
      await sendTransaction();
    } catch (e) {
      console.log("__TRANSACTION__FAIL__", e);
    }
    setIsLoading(false);
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <CustomNavigationBar
        title={intl.formatMessage({ id: "Confirm" })}
        containerStyle={{
          ...style.flatten(["background-color-background"]),
          marginTop: safeAreaInsets.top,
        }}
      />
      <ScrollView
        style={style.flatten(["flex-1"])}
        contentContainerStyle={style.flatten(["padding-y-24"])}
      >
        <Text
          style={style.flatten([
            "color-label-text-2",
            "text-base-regular",
            "text-center",
          ])}
        >
          {txText}
        </Text>
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-2x-large-medium",
            "margin-top-4",
            "text-center",
          ])}
        >
          {txAmountText}
        </Text>
        <View style={style.flatten(["padding-x-16", "margin-top-16"])}>
          <ListRowView hideBorder rows={rows} />
        </View>
      </ScrollView>
      <Button
        text={intl.formatMessage({ id: "Continue" })}
        containerStyle={style.flatten(["margin-x-16", "margin-y-12"])}
        onPress={onContinueHandler}
        loading={isLoading}
      />
      <SafeAreaView />
    </View>
  );
};
