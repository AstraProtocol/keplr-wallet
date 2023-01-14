import { useDelegateTxConfig } from "@keplr-wallet/hooks";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  FEE_RESERVATION,
  formatUnbondingTime,
  MIN_AMOUNT,
} from "../../../common/utils";
import { AlertInline } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import {
  IRow,
  ListRowView,
} from "../../../components/foundation-view/list-row-view";
import { EthereumEndpoint } from "../../../config";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AmountInput } from "../../main/components";
import { useTransaction } from "../../tx-result/hook/use-transaction";
import { EstimateRewardsView, StakingValidatorItem } from "../component";
import { useStaking } from "../hook/use-staking";

export const DelegateScreen: FunctionComponent = observer(() => {
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

  const validatorAddress = route.params.validatorAddress;

  const {
    chainStore,
    accountStore,
    queriesStore,
    userBalanceStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const { getValidator, isStakingTo, getUnbondingTime } = useStaking();
  const { simulateDelegateTx } = useTransaction();

  const account = accountStore.getAccount(chainStore.current.chainId);

  const sendConfigs = useDelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    EthereumEndpoint
  );

  useEffect(() => {
    updateNavigationTitle();
  }, []);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const validator = getValidator(validatorAddress);

  const hasStake = isStakingTo(validatorAddress);

  const balanceText = userBalanceStore.getBalanceString();

  const feeText = `${FEE_RESERVATION} ${sendConfigs.amountConfig.sendCurrency.coinDenom}`;

  const unbondingTime = getUnbondingTime();
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl, 1);

  const [amountIsValid, setAmountIsValid] = useState(false);
  const [amountErrorText, setAmountErrorText] = useState("");
  const [stakingAmount, setStakingAmount] = useState(
    new CoinPretty(chainStore.current.stakeCurrency, 0)
  );

  const rows: IRow[] = [
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

  const getRightLabelView = () => {
    return (
      <View>
        <Text
          style={style.flatten(["text-small-regular", "color-label-text-2"])}
        >
          {intl.formatMessage({ id: "Available" }) + " "}
          <Text style={style.flatten(["color-label-text-1"])}>
            {balanceText}
          </Text>
        </Text>
      </View>
    );
  };

  const onContinueHandler = async () => {
    Keyboard.dismiss();

    const { feeAmount, gasPrice, gasLimit } = await simulateDelegateTx(
      sendConfigs.amountConfig.amount,
      validatorAddress
    );
    sendConfigs.feeConfig.setManualFee(feeAmount);
    sendConfigs.gasConfig.setGas(gasLimit);

    if (account.isReadyToSendTx && amountIsValid) {
      let dec = new Dec(sendConfigs.amountConfig.amount);
      dec = dec.mulTruncate(
        DecUtils.getTenExponentN(
          sendConfigs.amountConfig.sendCurrency.coinDecimals
        )
      );
      const amount = new CoinPretty(sendConfigs.amountConfig.sendCurrency, dec);

      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.delegate.type,
        value: {
          amount,
          fee: sendConfigs.feeConfig.fee,
          validatorAddress,
          validatorName: validator?.description.moniker,
          commission: validator?.commission.commission_rates.rate,
          gasLimit,
          gasPrice,
        },
      });

      smartNavigation.navigateSmart("Tx.Confirmation", {});
    }
  };

  const updateNavigationTitle = () => {
    smartNavigation.setOptions({
      title: intl.formatMessage({ id: "Stake" }),
    });
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten(["padding-x-page"])}
        enableOnAndroid
      >
        <View style={style.flatten(["height-page-pad"])} />
        <AlertInline
          type="info"
          content={intl.formatMessage(
            { id: "stake.delegate.warning" },
            {
              time: unbondingTimeText,
              denom: sendConfigs.amountConfig.sendCurrency.coinDenom,
            }
          )}
        />
        <StakingValidatorItem
          containerStyle={style.flatten(["margin-top-20", "margin-x-0"])}
          validator={validator}
        />
        {hasStake && (
          <AlertInline
            type="warning"
            hideIcon
            hideBorder
            content={intl.formatMessage({
              id: "common.inline.staking.unstakingInfo",
            })}
            style={style.flatten(["margin-top-4"])}
          />
        )}
        <AmountInput
          labelText={intl.formatMessage({ id: "Amount" })}
          rightLabelView={getRightLabelView()}
          amountConfig={sendConfigs.amountConfig}
          availableAmount={userBalanceStore.getBalance()}
          feeConfig={sendConfigs.feeConfig}
          onAmountChanged={(amount, { msg }, isFocus) => {
            setStakingAmount(
              new CoinPretty(
                chainStore.current.stakeCurrency,
                new Dec(amount || "0").mul(
                  DecUtils.getTenExponentN(
                    chainStore.current.stakeCurrency.coinDecimals
                  )
                )
              )
            );
            setAmountIsValid(Number(amount) > 0 && msg.length === 0);
            setAmountErrorText(isFocus ? "" : msg);
          }}
          config={{ minAmount: MIN_AMOUNT, feeReservation: FEE_RESERVATION }}
          containerStyle={style.flatten(["margin-top-20"])}
        />
        <ListRowView
          rows={rows}
          style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
          hideBorder
          clearBackground
        />
        <EstimateRewardsView
          validatorAddress={validatorAddress}
          stakingAmount={stakingAmount}
        />
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end"])}>
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
