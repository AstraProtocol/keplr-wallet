import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useStore } from "../../../stores";
import { Colors, useStyle } from "../../../styles";
import { Staking } from "@keplr-wallet/stores";
import { useRedelegateTxConfig } from "@keplr-wallet/hooks";
import { PageWithScrollView } from "../../../components/page";
import { Text, View } from "react-native";
import { AmountInput, ValidatorItem } from "../../../components/input";
import { Button } from "../../../components/button";
import { useSmartNavigation } from "../../../navigation-util";
import {
  ItemRow,
  AlignItems,
} from "../../../components/foundation-view/item-row";
import { TextAlign } from "../../../components/foundation-view/text-style";
import { FormattedMessage, useIntl } from "react-intl";
import { SelectValidatorItem } from "./select-validator";
import { formatCoin } from "../../../common/utils";

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

  const validatorAddress = route.params.validatorAddress;

  const smartNavigation = useSmartNavigation();

  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const srcValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(validatorAddress);

  const srcValidatorThumbnail = srcValidator
    ? queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidatorThumbnail(validatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidatorThumbnail(validatorAddress)
    : undefined;

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

  const dstValidator =
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Bonded)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonding)
      .getValidator(dstValidatorAddress) ||
    queries.cosmos.queryValidators
      .getQueryStatus(Staking.BondStatus.Unbonded)
      .getValidator(dstValidatorAddress);

  useEffect(() => {
    sendConfigs.recipientConfig.setRawRecipient(dstValidatorAddress);
  }, [dstValidatorAddress, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.error ??
    sendConfigs.amountConfig.error ??
    sendConfigs.memoConfig.error ??
    sendConfigs.gasConfig.error ??
    sendConfigs.feeConfig.error;
  const txStateIsValid = sendConfigError == null;
  sendConfigs.feeConfig.setFeeType("average");
  const feeText = formatCoin(sendConfigs.feeConfig.fee);

  return (
    <PageWithScrollView
      backgroundColor={Colors["background"]}
      style={style.flatten(["padding-x-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <View style={style.flatten(["height-page-pad"])} />
      <Text style={style.flatten(["color-gray-30", "subtitle2"])}>
        <FormattedMessage id="stake.redelegate.from" />
      </Text>
      <ValidatorItem
        containerStyle={style.flatten(["margin-bottom-16"])}
        name={srcValidator ? srcValidator.description.moniker : "..."}
        thumbnail={srcValidatorThumbnail}
        value={staked.trim(true).shrink(true).maxDecimals(6).toString()}
      />
      <SelectValidatorItem
        currentValidator={validatorAddress}
        onSelectedValidator={(address) => {
          setDstValidatorAddress(address);
        }}
      />

      <AmountInput
        label={intl.formatMessage({ id: "stake.redelegate.amountLabel" })}
        amountConfig={sendConfigs.amountConfig}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.redelegate.available" }),
            textColor: Colors["gray-30"],
          },
          {
            text: staked.trim(true).shrink(true).maxDecimals(6).toString(),
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
      />
      <ItemRow
        style={{ marginHorizontal: 0, paddingHorizontal: 0 }}
        alignItems={AlignItems.center}
        itemSpacing={12}
        columns={[
          {
            text: intl.formatMessage({ id: "stake.redelegate.fee" }),
            textColor: Colors["gray-30"],
          },
          {
            text: feeText,
            textColor: Colors["gray-10"],
            textAlign: TextAlign.right,
            flex: 1,
          },
        ]}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text={intl.formatMessage({ id: "stake.redelegate.redelagate" })}
        size="large"
        disabled={!account.isReadyToSendTx || !txStateIsValid}
        loading={account.txTypeInProgress === "redelegate"}
        onPress={async () => {
          if (account.isReadyToSendTx && txStateIsValid) {
            try {
              transactionStore.updateTxData({
                chainInfo: chainStore.current,
                amount: sendConfigs.amountConfig,
                fee: sendConfigs.feeConfig,
                memo: sendConfigs.memoConfig,
              });
              const tx = account.cosmos.makeBeginRedelegateTx(
                sendConfigs.amountConfig.amount,
                sendConfigs.srcValidatorAddress,
                sendConfigs.dstValidatorAddress
              );
              await tx.simulateAndSend(
                { gasAdjustment: 1.3 },
                sendConfigs.memoConfig.memo,
                {
                  preferNoSetMemo: true,
                  preferNoSetFee: true,
                },
                {
                  onBroadcasted: (txHash: Uint8Array) => {
                    analyticsStore.logEvent("astra_hub_redelegate_token", {
                      tx_hash: Buffer.from(txHash).toString("hex"),
                      token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                      amount: Number(sendConfigs.amountConfig.amount),
                      fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                      fee_type: sendConfigs.feeConfig.feeType,
                      gas: sendConfigs.gasConfig.gas,
                      from_validator_address: sendConfigs.srcValidatorAddress,
                      from_validator_name: srcValidator?.description.moniker,
                      from_commission: 100 * Number(srcValidator?.commission.commission_rates.rate ?? "0"),
                      to_validator_address: sendConfigs.dstValidatorAddress,
                      to_validator_name: dstValidator?.description.moniker,
                      to_commission: 100 * Number(dstValidator?.commission.commission_rates.rate ?? "0"),
                      success: true,
                    });
                    transactionStore.updateTxHash(txHash);
                  },
                }
              );
            } catch (e: any) {
              analyticsStore.logEvent("astra_hub_redelegate_token", {
                token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
                amount: Number(sendConfigs.amountConfig.amount),
                fee: Number(sendConfigs.feeConfig.fee?.trim(true).hideDenom(true).toString() ?? "0"),
                fee_type: sendConfigs.feeConfig.feeType,
                gas: sendConfigs.gasConfig.gas,
                from_validator_address: sendConfigs.srcValidatorAddress,
                from_validator_name: srcValidator?.description.moniker,
                from_commission: 100 * Number(srcValidator?.commission.commission_rates.rate ?? "0"),
                to_validator_address: sendConfigs.dstValidatorAddress,
                to_validator_name: dstValidator?.description.moniker,
                to_commission: 100 * Number(dstValidator?.commission.commission_rates.rate ?? "0"),
                success: false,
                error: e?.message,
              });
              if (e?.message === "Request rejected") {
                return;
              }
              transactionStore.rejectTransaction();
              console.log(e);
              smartNavigation.navigateSmart("NewHome", {});
            }
          }
        }}
      />
      <View style={style.flatten(["height-page-pad"])} />
    </PageWithScrollView>
  );
});