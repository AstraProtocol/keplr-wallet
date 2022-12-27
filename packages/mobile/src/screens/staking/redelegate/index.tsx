import {
  FeeType,
  IAmountConfig,
  useRedelegateTxConfig,
} from "@keplr-wallet/hooks";
import { MsgBeginRedelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
  Staking,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatCoin, TX_GAS_DEFAULT } from "../../../common/utils";
import { AlertInline, IRow, ListRowView } from "../../../components";
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

  const dstValidator = queries.cosmos.queryValidators
    .getQueryStatus(Staking.BondStatus.Unspecified)
    .getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);

  const { gasPrice, gasLimit, feeType } = simulateRedelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    sendConfigs.srcValidatorAddress,
    dstValidatorAddress
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = formatCoin(sendConfigs.feeConfig.fee, false, 4);

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
            { rewards: formatCoin(rewardsAmount, false, 4) }
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
          onAmountChanged={(amount, errorText, isFocus) => {
            setAmountIsValid(Number(amount) > 0 && errorText.length === 0);
            setAmountErrorText(isFocus ? "" : errorText);
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

const simulateRedelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  amountConfig: IAmountConfig,
  srcValidatorAddress: string,
  dstValidatorAddress: string
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.redelegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0";
    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
    );

    const msg = {
      type: account.cosmos.msgOpts.redelegate.type,
      value: {
        delegator_address: account.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
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
            typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
            value: MsgBeginRedelegate.encode({
              delegatorAddress: msg.value.delegator_address,
              validatorSrcAddress: msg.value.validator_src_address,
              validatorDstAddress: msg.value.validator_dst_address,
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
      console.log("simulateRedelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.redelegate); // default gas
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
