import {
  FeeType,
  IAmountConfig,
  useDelegateTxConfig,
} from "@keplr-wallet/hooks";
import { MsgDelegate } from "@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx";
import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
} from "@keplr-wallet/stores";
import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  FEE_RESERVATION,
  formatCoin,
  formatPercent,
  formatUnbondingTime,
  MIN_AMOUNT,
  TX_GAS_DEFAULT,
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
import { ChainStore, useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { AmountInput } from "../../main/components";
import { useStaking } from "../hook/use-staking";
import { EstimateRewardsView, StakingValidatorItem } from "../component";

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
    analyticsStore,
    userBalanceStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const { getValidator, isStakingTo } = useStaking();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

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

  const validator = getValidator(validatorAddress)!;

  const hasStake = isStakingTo(validatorAddress);

  const balanceText = userBalanceStore.getBalanceString();

  const { gasPrice, gasLimit, feeType } = simulateDelegateGasFee(
    chainStore,
    accountStore,
    sendConfigs.amountConfig,
    validatorAddress
  );
  sendConfigs.gasConfig.setGas(gasLimit);
  sendConfigs.feeConfig.setFeeType(feeType);
  const feeText = `${FEE_RESERVATION} ${sendConfigs.amountConfig.sendCurrency.coinDenom}`;

  const unbondingTime =
    queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  const unbondingTimeText = formatUnbondingTime(unbondingTime, intl);

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

    if (account.isReadyToSendTx && amountIsValid) {
      const params = {
        token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
        amount: Number(sendConfigs.amountConfig.amount),
        fee: Number(sendConfigs.feeConfig.fee?.toDec() ?? "0"),
        gas: gasLimit,
        gas_price: gasPrice,
        validator_address: validatorAddress,
        validator_name: validator?.description.moniker,
        commission: Number(
          formatPercent(validator?.commission.commission_rates.rate, true)
        ),
      };

      try {
        let dec = new Dec(sendConfigs.amountConfig.amount);
        dec = dec.mulTruncate(
          DecUtils.getTenExponentN(
            sendConfigs.amountConfig.sendCurrency.coinDecimals
          )
        );
        const amount = new CoinPretty(
          sendConfigs.amountConfig.sendCurrency,
          dec
        );

        transactionStore.updateRawData({
          type: account.cosmos.msgOpts.delegate.type,
          value: {
            amount,
            fee: sendConfigs.feeConfig.fee,
            validatorAddress,
            validatorName: validator?.description.moniker,
            commission: new IntPretty(
              new Dec(validator?.commission.commission_rates.rate ?? 0)
            ),
          },
        });
        const tx = account.cosmos.makeDelegateTx(
          sendConfigs.amountConfig.amount,
          sendConfigs.recipientConfig.recipient
        );
        await tx.sendWithGasPrice(
          { gas: gasLimit },
          sendConfigs.memoConfig.memo,
          {
            preferNoSetMemo: true,
            preferNoSetFee: true,
          },
          {
            onBroadcasted: (txHash) => {
              analyticsStore.logEvent("astra_hub_delegate_token", {
                ...params,
                tx_hash: Buffer.from(txHash).toString("hex"),
                success: true,
              });
              transactionStore.updateTxHash(txHash);
            },
          }
        );
      } catch (e: any) {
        analyticsStore.logEvent("astra_hub_delegate_token", {
          ...params,
          success: false,
          error: e?.message,
        });
        if (e?.message === "Request rejected") {
          return;
        }
        console.log(e);
        transactionStore.updateTxState("failure");
      }
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
              days: unbondingTimeText,
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
          onAmountChanged={(amount, errorText, isFocus) => {
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
            setAmountIsValid(Number(amount) > 0 && errorText.length === 0);
            setAmountErrorText(isFocus ? "" : errorText);
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
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end"])}>
        <View
          style={{
            ...style.flatten(["background-color-background", "justify-center"]),
            height: 48 + 44 + 2 * 12,
          }}
        >
          <EstimateRewardsView
            validatorAddress={validatorAddress}
            stakingAmount={stakingAmount}
          />
          <Button
            text={intl.formatMessage({ id: "Continue" })}
            disabled={amountErrorText.length !== 0}
            loading={account.txTypeInProgress === "delegate"}
            onPress={onContinueHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-y-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});

const simulateDelegateGasFee = (
  chainStore: ChainStore,
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>,
  amountConfig: IAmountConfig,
  validatorAddress: string
) => {
  useEffect(() => {
    simulate();
  }, [amountConfig.amount]);

  const chainId = chainStore.current.chainId;
  const [gasLimit, setGasLimit] = useState(TX_GAS_DEFAULT.delegate);

  const simulate = async () => {
    const account = accountStore.getAccount(chainId);

    const amount = amountConfig.amount || "0";
    let dec = new Dec(amount);
    dec = dec.mulTruncate(
      DecUtils.getTenExponentN(amountConfig.sendCurrency.coinDecimals)
    );

    const msg = {
      type: account.cosmos.msgOpts.delegate.type,
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
            typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
            value: MsgDelegate.encode({
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
      console.log("simulateDelegateGasFee error", e);
      setGasLimit(TX_GAS_DEFAULT.delegate); // default gas
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
