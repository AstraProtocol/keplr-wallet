import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { IRow, ListRowView } from "../../../components";
import { TextLink } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { renderAminoMessages } from "../models/amino";
import {
  getSeparatorRow,
  getTransactionTimeRow,
  insert,
  join,
  MsgSwap,
} from "../models/messages";

export const TransactionDetailsView: FunctionComponent<{
  style?: ViewStyle;
}> = ({ style }) => {
  const styleBuilder = useStyle();

  const { chainStore, transactionStore, accountStore } = useStore();

  const [hasData] = useState(() => {
    if (transactionStore.rawData) {
      return true;
    }
    return false;
  });

  const chainId = chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);
  const rawData = transactionStore.rawData;

  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  let rows: IRow[] = [];
  if (hasData) {
    rows = renderAminoMessages(
      chainStore.current.chainId,
      accountStore,
      transactionStore
    );
    rows = insert(rows, getTransactionTimeRow(), rows.length - 1);

    if (
      rawData?.type !=
      accountStore.getAccount(chainId).cosmos.msgOpts.withdrawRewards.type
    ) {
      rows = join(rows, getSeparatorRow());
    }
  }

  const viewDetailsHandler = () => {
    let txHash = "";
    if (transactionStore.txHash) {
      txHash =
        (rawData?.type === "cosmos-sdk/MsgSend" ? "0x" : "") +
        Buffer.from(transactionStore.txHash).toString("hex").toUpperCase();
    } else if (
      rawData &&
      rawData.type === "wallet-swap" &&
      transactionStore.txState !== "failure"
    ) {
      const rawDataValue = transactionStore.rawData.value;
      txHash = (rawDataValue as MsgSwap).transactionHash || "";
    }

    const url = chainInfo.raw.txExplorer?.txUrl.replace("{txHash}", txHash);
    smartNavigation.pushSmart("WebView", {
      url: url,
    });
  };

  return (
    <View style={style}>
      {hasData && <ListRowView hideBorder rows={rows} />}
      {chainInfo.raw.txExplorer && (
        <TextLink
          size="medium"
          onPress={viewDetailsHandler}
          style={styleBuilder.flatten(["margin-y-16"])}
        >
          {intl.formatMessage(
            { id: "tx.result.viewDetails" },
            { page: chainInfo.raw.txExplorer.name }
          )}
        </TextLink>
      )}
    </View>
  );
};
