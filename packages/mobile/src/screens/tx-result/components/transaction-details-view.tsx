import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { View, ViewStyle } from "react-native";
import { Button, IRow, ListRowView } from "../../../components";
import { useStore } from "../../../stores";
import { renderAminoMessages } from "../models/amino";
import { renderDirectMessages } from "../models/direct";
import { useIntl } from "react-intl";
import { useSmartNavigation } from "../../../navigation-util";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { chainStore, transactionStore, accountStore } = useStore();

  const [hasData] = useState(() => {
    if (transactionStore.txMsgsMode && transactionStore.txMsgs) {
      return true;
    }
    return false;
  });

  const mode = transactionStore.txMsgsMode;
  const chainId =
    transactionStore.txData?.chainInfo?.chainId ?? chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);

  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  let rows: IRow[] = [];
  if (hasData) {
    if (mode === "amino") {
      rows = renderAminoMessages({
        chainStore,
        transactionStore,
        accountStore,
      });
    } else if (mode === "direct") {
      rows = renderDirectMessages();
    }
  }

  const viewDetailsHandler = () => {
    if (chainInfo.raw.txExplorer && transactionStore.txHash) {
      const txHash = Buffer.from(transactionStore.txHash)
        .toString("hex")
        .toUpperCase();
      const url = chainInfo.raw.txExplorer.txUrl.replace(
        "{txHash}",
        txHash
      );
      smartNavigation.pushSmart("WebView", {
        url: url,
      });
    }
  };

  return (
    <View style={style}>
      {hasData && <ListRowView rows={rows} />}
      {chainInfo && chainInfo.raw.txExplorer && transactionStore.txHash && (
        <Button
          text={intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: "Astra Scan" }
          )}
          mode="text"
          containerStyle={{ marginTop: 16 }}
          onPress={viewDetailsHandler}
        />
      )}
    </View>
  );
});