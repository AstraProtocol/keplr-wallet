import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect } from "react";
import { View } from "react-native";
import { useStyle } from "../../../styles";
import { AddressInput, AmountInput } from "../components";

import { useStore } from "../../../stores";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { EthereumEndpoint } from "../../../config";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { buildLeftColumn, buildRightColumn, IRow, ListRowView } from "../../../components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatCoin } from "../../../common/utils";

export const SendTokenScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
    userBalanceStore,
  } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainId,
    account.bech32Address,
    EthereumEndpoint
  );

  useEffect(() => {
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  sendConfigs.gasConfig.setGas(200000);
  sendConfigs.feeConfig.setFeeType("average");
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  console.log("__DEBUG__ error === ", sendConfigError);
  const txStateIsValid = sendConfigError == null;
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "stake.delegate.available" }) }),
        buildRightColumn({ text: userBalanceStore.getBalanceString() }),
      ]
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({ text: intl.formatMessage({ id: "component.amount.input.fee" }) }),
        buildRightColumn({ text: feeText }),
      ]
    },
  ];

  const onSendHandler = async () => {
    if (account.isReadyToSendTx && txStateIsValid) {
      try {
        transactionStore.updateTxData({
          chainInfo: chainStore.current,
          amount: sendConfigs.amountConfig,
          fee: sendConfigs.feeConfig,
          memo: sendConfigs.memoConfig,
        });
        await account.sendToken(
          sendConfigs.amountConfig.amount,
          sendConfigs.amountConfig.sendCurrency,
          sendConfigs.recipientConfig.recipient,
          sendConfigs.memoConfig.memo,
          sendConfigs.feeConfig.toStdFee(),
          {
            preferNoSetFee: true,
            preferNoSetMemo: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("astra_hub_transfer_token", {
                tx_hash: Buffer.from(txHash).toString("hex"),
                token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                amount: Number(sendConfigs.amountConfig.amount),
                fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                fee_type: sendConfigs.feeConfig.feeType,
                gas: sendConfigs.gasConfig.gas,
                receiver_address: sendConfigs.recipientConfig.recipient,
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_transfer_token", {
          token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
          amount: Number(sendConfigs.amountConfig.amount),
          fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
          fee_type: sendConfigs.feeConfig.feeType,
          gas: sendConfigs.gasConfig.gas,
          receiver_address: sendConfigs.recipientConfig.recipient,
          success: false,
          error: e?.message,
        });
        if (e?.message === "Request rejected") {
          return;
        }
        transactionStore.rejectTransaction();
        console.log("__DEBUG_ sendErr: ", e);
        smartNavigation.navigateSmart("NewHome", {});
      }
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <View style={{ height: 24 }} />
        <AddressInput recipientConfig={sendConfigs.recipientConfig} />
        <View style={{ height: 24 }} />
        <AmountInput amountConfig={sendConfigs.amountConfig} />
        <View style={{ height: 24 }} />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0 }}
          hideBorder
          clearBackground
        />
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View style={{ ...style.flatten(["background-color-background"]), height: 56 }}>
          <Button
            text={intl.formatMessage({ id: "wallet.send.continue" })}
            disabled={!account.isReadyToSendTx || !txStateIsValid}
            loading={account.txTypeInProgress === "send"}
            onPress={onSendHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});