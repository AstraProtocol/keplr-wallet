import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { formatDate } from "../../../common";
import { ListRowView } from "../../../components";
import { TextLink } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useStaking } from "../../staking/hook/use-staking";
import { useTransaction } from "../hook/use-transaction";
import {
  getSeparatorRow,
  getTransactionRow,
  getTransactionTimeRow,
  insert,
  join,
  MsgSwap,
  MsgUndelegate,
} from "../models/messages";

export const TransactionDetailsView: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { getTxDetailsRows } = useTransaction();
  const { getUnbondingOf } = useStaking();
  const { chainStore, transactionStore, accountStore } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const chainId = chainStore.current.chainId;
  const chainInfo = chainStore.getChain(chainId);
  const rawData = transactionStore.rawData;

  const rows = useMemo(() => {
    let rows = getTxDetailsRows();

    if (
      rawData?.type !=
      accountStore.getAccount(chainId).cosmos.msgOpts.withdrawRewards.type
    ) {
      rows = insert(rows, getTransactionTimeRow(), rows.length - 1);

      if (
        transactionStore.txState === "success" &&
        rawData?.type ===
          accountStore.getAccount(chainId).cosmos.msgOpts.undelegate.type
      ) {
        const validatorAddress =
          (rawData?.value as MsgUndelegate["value"]).validatorAddress ?? "";
        const unbonding = getUnbondingOf(validatorAddress);

        const completionTime =
          unbonding?.entries[unbonding?.entries.length - 1].completionTime;

        if (completionTime) {
          const unbondingTime = new Date(completionTime);

          rows = insert(
            rows,
            getTransactionRow(
              intl.formatMessage({ id: "UnbondingTime" }),
              formatDate(unbondingTime)
            ),
            rows.length - 1
          );
        }
      }

      rows = join(rows, getSeparatorRow());
    }
    return rows;
  }, [transactionStore.txState]);

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
        <View style={style.flatten(["margin-y-16", "items-center"])}>
          <TextLink size="medium" onPress={viewDetailsHandler}>
            {intl.formatMessage(
              { id: "tx.result.viewDetails" },
              { page: chainInfo.raw.txExplorer.name }
            )}
          </TextLink>
        </View>
      )}
    </View>
  );
});
