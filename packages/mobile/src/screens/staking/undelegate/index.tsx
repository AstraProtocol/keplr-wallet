import {
  FeeType,
  IAmountConfig,
  useUndelegateTxConfig,
} from "@keplr-wallet/hooks";
import { MsgUndelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  formatCoin,
  formatUnbondingTime,
  TX_GAS_DEFAULT,
} from "../../../common/utils";
import { IRow, ListRowView } from "../../../components";
import { AlertInline } from "../../../components/alert-inline";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import {
  buildLeftColumn,
  buildRightColumn,
} from "../../../components/foundation-view/item-row";
import { useSmartNavigation } from "../../../navigation-util";
import { ChainStore, useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AmountInput } from "../../main/components";
import { StakingValidatorItem } from "../component";
import { useStaking } from "../hook/use-staking";

export const UndelegateScreen: FunctionComponent = observer(() => {
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

  const { getValidator, getUnbondingTime } = useStaking();

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

  const validator = getValidator(validatorAddress);

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const sendConfigs = useUndelegateTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    validatorAddress
  );

  useEffect(() => {
    updateNavigationTitle();
  });

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(validatorAddress);
  }, [sendConfigs.recipientConfig, validatorAddress]);

  const { gasPrice, gasLimit, feeType } = simulateUndelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee, false, 4);

  const unbondingTime = getUnbondingTime();
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl, 1);

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

    if (account.isReadyToSendTx && amountIsValid) {
      let dec = new Dec(sendConfigs.amountConfig.amount);
      dec = dec.mulTruncate(
        DecUtils.getTenExponentN(
          sendConfigs.amountConfig.sendCurrency.coinDecimals
        )
      );
      const amount = new CoinPretty(sendConfigs.amountConfig.sendCurrency, dec);

      transactionStore.updateRawData({
        type: account.cosmos.msgOpts.undelegate.type,
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
      title: intl.formatMessage(
        { id: "undelegate.title" },
        { coin: chainStore.current.stakeCurrency.coinDenom }
      ),
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
          type="warning"
          content={intl.formatMessage(
            { id: "common.inline.staking.noticeWithdrawalPeriod" },
            { denom: staked.denom, time: unbondingTimeText }
          )}
        />
        <Text
          style={style.flatten([
            "color-label-text-1",
            "text-base-bold",
            "margin-top-24",
          ])}
        >
          {intl.formatMessage({ id: "From" })}
        </Text>
        <StakingValidatorItem
          containerStyle={style.flatten(["margin-top-4", "margin-x-0"])}
          validator={validator}
          hideTotalShares={true}
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
          style={style.flatten([
            "background-color-background",
            "height-68",
            "justify-center",
            "padding-x-page",
          ])}
        >
          <Button
            text={intl.formatMessage({ id: "Continue" })}
            disabled={amountErrorText.length !== 0}
            onPress={onContinueHandler}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});

const simulateUndelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  amountConfig: IAmountConfig,
  validatorAddress: string
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.undelegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0";
    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
    );

    const msg = {
      type: account.cosmos.msgOpts.undelegate.type,
      value: {
        delegator_address: account.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: amountConfig.sendCurrency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };
    try {
      const { gasUsed } = await account.cosmos.simulateTx(
        [
          {
            typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
            value: MsgUndelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorAddress: msg.value.validator_address,
              amount: msg.value.amount,
            }).finish(),
          },
        ],
        { amount: [] }
      );

      const gasLimit = Math.ceil(gasUsed * 1.3);
      console.log("__DEBUG__ simulate gasUsed", gasUsed);
      console.log("__DEBUG__ simulate gasLimit", gasLimit);
      setGasLimit(gasLimit);
    } catch (e) {
      console.log("simulateUndelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.undelegate); // default gas
    }
  };

  const feeType = "average" as FeeType;
  var gasPrice = 1000000000; // default 1 gwei = 1 nano aastra
  const feeConfig = chainStore.current.feeCurrencies
    .filter((feeCurrency) => {
      return (
        feeCurrency.coinMinimalDenom ===
        chainStore.current.stakeCurrency.coinMinimalDenom
      );
    })
    .shift();
  if (feeConfig?.gasPriceStep) {
    const { [feeType]: wei } = feeConfig.gasPriceStep;
    gasPrice = wei;
  }

  return {
    gasPrice,
    gasLimit,
    feeType,
  };
};
