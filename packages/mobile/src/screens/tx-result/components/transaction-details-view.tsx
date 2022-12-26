import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { ListRowView } from "../../../components";
import { TextLink } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useTransaction } from "../hook/use-transaction";
import {
  getSeparatorRow,
  getTransactionTimeRow,
  insert,
  join,
  MsgSwap,
} from "../models/messages";

export const TransactionDetailsView: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = ({ containerStyle }) => {
  const { getTxDetailsRows } = useTransaction();
  const { chainStore, transactionStore, accountStore } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const chainId = chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);
  const rawData = transactionStore.rawData;

  let rows = (() => {
    let rows = getTxDetailsRows();
    rows = insert(rows, getTransactionTimeRow(), rows.length - 1);

    if (
      rawData?.type !=
      accountStore.getAccount(chainId).cosmos.msgOpts.withdrawRewards.type
    ) {
      rows = join(rows, getSeparatorRow());
    }
    return rows;
  })();

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
      const rawDataValue = rawData.value;
      txHash = (rawDataValue as MsgSwap).transactionHash || "";
    }

    const url = chainInfo.raw.txExplorer?.txUrl.replace("{txHash}", txHash);
    smartNavigation.pushSmart("WebView", {
      url: url,
    });
  };

  return (
    <View style={containerStyle}>
      <ListRowView hideBorder rows={rows} />
      {chainInfo.raw.txExplorer && (
        <TextLink
          size="medium"
          onPress={viewDetailsHandler}
          style={style.flatten(["margin-y-16"])}
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
