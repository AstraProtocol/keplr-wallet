import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import { useStyle } from "../../../styles";
import { AddressInput, AmountInput } from "../components";

import { useSendTxConfig } from "@keplr-wallet/hooks";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FEE_RESERVATION, MIN_AMOUNT } from "../../../common/utils";
import {
  buildLeftColumn,
  buildRightColumn,
  IRow,
  ListRowView,
} from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import { EthereumEndpoint } from "../../../config";
import { useWeb3Transfer } from "../../../hooks/use-web3-transfer";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";

export const SendTokenScreen: FunctionComponent = observer(() => {
  const {
    chainStore,
    accountStore,
    queriesStore,
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

  const { estimateGas } = useWeb3Transfer();

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

  const amountInputRef = useRef<any>();

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

  const feeText = `${FEE_RESERVATION} ${sendConfigs.amountConfig.sendCurrency.coinDenom}`;

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const [addressIsValid, setAddressIsValid] = useState(false);
  const [amountIsValid, setAmountIsValid] = useState(false);
  const [addressErrorText, setAddressErrorText] = useState("");
  const [amountErrorText, setAmountErrorText] = useState("");

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "Available" }),
        }),
        buildRightColumn({ text: userBalanceStore.getBalanceString() }),
      ],
    },
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage(
            { id: "component.amount.input.feeReservation" },
            { denom: sendConfigs.amountConfig.sendCurrency.coinDenom }
          ),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

  const onSendHandler = async () => {
    Keyboard.dismiss();

    if (amountIsValid && addressIsValid) {
      const { gasLimit: gas, gasPrice: price } = await estimateGas(
        sendConfigs.recipientConfig.recipient,
        sendConfigs.amountConfig
      );

      const gasLimit = parseInt(gas.toHexString().slice(2), 16);
      const gasPrice = parseInt(price.slice(2), 16);
      let feeDec = new Dec(gasLimit).mul(new Dec(gasPrice));

      let dec = new Dec(sendConfigs.amountConfig.amount);
      dec = dec.mulTruncate(
        DecUtils.getTenExponentN(
          sendConfigs.amountConfig.sendCurrency.coinDecimals
        )
      );
      const amount = new CoinPretty(sendConfigs.amountConfig.sendCurrency, dec);

      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.send.native.type,
        value: {
          amount,
          fee: new CoinPretty(sendConfigs.amountConfig.sendCurrency, feeDec),
          recipient: sendConfigs.recipientConfig.recipient,
          gasLimit,
          gasPrice,
        },
      });

      smartNavigation.navigateSmart("Tx.Confirmation", {});
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <View style={{ height: 24 }} />
        <AddressInput
          recipientConfig={sendConfigs.recipientConfig}
          onAddressChanged={(address, errorText, isFocus) => {
            setAddressIsValid(address.length !== 0 && errorText.length === 0);
            setAddressErrorText(isFocus ? "" : errorText);
          }}
          returnKeyType={"next"}
          onSubmitEditting={() => {
            amountInputRef.current.focus();
          }}
        />
        <View style={{ height: 24 }} />
        <AmountInput
          hideDenom
          labelText={intl.formatMessage({
            id: "component.amount.input.sendindAmount",
          })}
          amountConfig={sendConfigs.amountConfig}
          availableAmount={userBalanceStore.getBalance()}
          feeConfig={sendConfigs.feeConfig}
          onAmountChanged={(amount, errorText, isFocus) => {
            setAmountIsValid(Number(amount) > 0 && errorText.length === 0);
            setAmountErrorText(isFocus ? "" : errorText);
          }}
          config={{ minAmount: MIN_AMOUNT, feeReservation: FEE_RESERVATION }}
          inputRef={amountInputRef}
        />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
          hideBorder
          clearBackground
        />
      </KeyboardAwareScrollView>
      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View style={style.flatten(["height-1", "background-color-card-separator"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 56,
          }}
        >
          <Button
            text={intl.formatMessage({ id: "Continue" })}
            disabled={
              amountErrorText.length !== 0 || addressErrorText.length !== 0
            }
            onPress={onSendHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
