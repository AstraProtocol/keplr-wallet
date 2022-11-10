import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useUnmount } from "../../hooks";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";
import { TransactionActionView } from "./components/transaction-action-view";
import { TransactionDetailsView } from "./components/transaction-details-view";
import { TransactionStateView } from "./components/transaction-state-view";
import { TransactionTitleView } from "./components/transaction-title-view";

export const TxEvmResultScreen: FunctionComponent = observer(() => {
  const { transactionStore } = useStore();

  useUnmount(() => {
    transactionStore.rejectTransaction();
  });

  const style = useStyle();

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <ScrollView style={style.flatten(["flex-1"])}>
        <TransactionStateView />
        <TransactionTitleView />
        <TransactionDetailsView
          style={{
            marginTop: 38,
            marginBottom: 16,
            marginHorizontal: 16,
            flex: 1,
          }}
        />
      </ScrollView>
      <TransactionActionView style={style.flatten(["margin-bottom-12"])} />
      <SafeAreaView />
    </View>
  );
});
