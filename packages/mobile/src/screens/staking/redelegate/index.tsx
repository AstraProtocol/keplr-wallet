import { useRedelegateTxConfig } from "@keplr-wallet/hooks";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatCoinAmount, formatCoinFee } from "../../../common/utils";
import { AlertInline, IRow, ListRowView } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AmountInput } from "../../main/components";
import { useTransaction } from "../../tx-result/hook/use-transaction";
import { StakingValidatorItem } from "../component";
import { useStaking } from "../hook/use-staking";
import { SelectValidatorItem } from "./select-validator";

export const RedelegateScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const { getValidator, getRewardsAmountOf } = useStaking();
  const { simulateRedelegateTx } = useTransaction();

  const validatorAddress = route.params.validatorAddress;

  const {
    chainStore,
    accountStore,
    queriesStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const srcValidator = getValidator(validatorAddress);
  const rewardsAmount = getRewardsAmountOf(validatorAddress);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useRedelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  const [dstValidatorAddress, setDstValidatorAddress] = useState("");

  const dstValidator = getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);

  useEffect(() => {
    simulateRedelegateTx(
      sendConfigs.amountConfig.amount,
      sendConfigs.srcValidatorAddress,
      dstValidatorAddress
    ).then(({ feeAmount, gasPrice, gasLimit }) => {
      sendConfigs.feeConfig.setManualFee(feeAmount);
      sendConfigs.gasConfig.setGas(gasLimit);
      setGasPrice(gasPrice);
      setGasLimit(gasLimit);
    });
  }, [sendConfigs.amountConfig.amount]);

  const [gasPrice, setGasPrice] = useState(0);
  const [gasLimit, setGasLimit] = useState(0);

  const feeText = formatCoinFee(sendConfigs.feeConfig.fee);

  const [amountIsValid, setAmountIsValid] = useState(false);
  const [amountErrorText, setAmountErrorText] = useState("");

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "TransactionFee" }),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

  const onContinueHandler = async () => {
    Keyboard.dismiss();

    if (account.isReadyToSendTx && amountIsValid && dstValidatorAddress) {
      let dec = new Dec(sendConfigs.amountConfig.amount);
      dec = dec.mulTruncate(
        DecUtils.getTenExponentN(
          sendConfigs.amountConfig.sendCurrency.coinDecimals
        )
      );
      const amount = new CoinPretty(sendConfigs.amountConfig.sendCurrency, dec);

      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.redelegate.type,
        value: {
          amount,
          fee: sendConfigs.feeConfig.fee,
          srcValidatorAddress: sendConfigs.srcValidatorAddress,
          srcValidatorName: srcValidator?.description.moniker || "",
          srcCommission: srcValidator?.commission.commission_rates.rate,
          dstValidatorAddress: sendConfigs.dstValidatorAddress,
          dstValidatorName: dstValidator?.description.moniker || "",
          dstCommission: dstValidator?.commission.commission_rates.rate,
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
        <View style={style.flatten(["height-24"])} />
        <Text style={style.flatten(["color-label-text-1", "text-base-bold"])}>
          {intl.formatMessage({ id: "From" })}
        </Text>
        <StakingValidatorItem
          containerStyle={style.flatten(["margin-top-4", "margin-x-0"])}
          validator={srcValidator}
        />
        <AlertInline
          type="warning"
          hideIcon
          hideBorder
          content={intl.formatMessage(
            {
              id: "common.inline.staking.redelegatingInfo",
            },
            { rewards: formatCoinAmount(rewardsAmount) }
          )}
          style={style.flatten(["margin-top-4"])}
        />
        <Text
          style={style.flatten([
            "text-base-bold",
            "color-label-text-1",
            "margin-top-24",
            "margin-bottom-4",
          ])}
        >
          {intl.formatMessage({ id: "To" })}
        </Text>
        <SelectValidatorItem
          currentValidator={validatorAddress}
          onSelectedValidator={(address) => {
            setDstValidatorAddress(address);
          }}
        />
        <AmountInput
          labelText={intl.formatMessage({ id: "Amount" })}
          amountConfig={sendConfigs.amountConfig}
          feeConfig={sendConfigs.feeConfig}
          onAmountChanged={(amount, { msg }, isFocus) => {
            setAmountIsValid(Number(amount) > 0 && msg.length === 0);
            setAmountErrorText(isFocus ? "" : msg);
          }}
          overrideError={(error) => {
            const { code } = error;
            let msg = error.msg;

            switch (code) {
              case "INSUFFICIENT_AMOUNT":
                msg = intl.formatMessage({
                  id: "InsufficientStakeAmount",
                });
                break;
              default:
                break;
            }
            return {
              code,
              msg,
            };
          }}
          availableAmount={staked}
          containerStyle={style.flatten(["margin-top-24"])}
        />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
          hideBorder
          clearBackground
        />
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end"])}>
        <View
          style={style.flatten(["height-1", "background-color-card-separator"])}
        />
        <View
          style={{
            ...style.flatten(["background-color-background", "justify-center"]),
            height: 44 + 2 * 12,
          }}
        >
          <Button
            text={intl.formatMessage({ id: "Continue" })}
            disabled={amountErrorText.length !== 0}
            onPress={onContinueHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-y-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
