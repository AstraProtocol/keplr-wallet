import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/button";
import { IAmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { useIntl } from "react-intl";
import { NormalInput } from "../../../components/input/normal-input";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  Text,
  TextInputSubmitEditingEventData,
  View,
  ViewStyle,
} from "react-native";
import {
  formatTextNumber,
  FRACTION_DIGITS,
  MIN_AMOUNT,
  removeZeroFractionDigits,
} from "../../../common/utils";

export type AmountErrorCode =
  | "INVALID_AMOUNT"
  | "MINIMUM_AMOUNT"
  | "INSUFFICIENT_AMOUNT"
  | "INSUFFICIENT_FEE_RESERVATION"
  | "";
export interface IError<T> {
  msg: string;
  code: T;
}

export const AmountInput: FunctionComponent<{
  labelText?: string;
  hideDenom?: boolean;
  amountConfig: IAmountConfig;
  availableAmount?: CoinPretty;
  feeConfig?: IFeeConfig;
  containerStyle?: ViewStyle;
  onAmountChanged?: (
    amount: string,
    error: IError<AmountErrorCode>,
    isFocus: boolean
  ) => void;
  config?: {
    feeReservation: number;
    minAmount: number;
  };
  inputRef?: any;
  onSubmitEditting?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void;
  overrideError?: (error: IError<AmountErrorCode>) => IError<AmountErrorCode>;
  returnKeyType?: ReturnKeyTypeOptions;
  rightLabelView?: React.ReactNode;
}> = observer(
  ({
    labelText,
    hideDenom,
    amountConfig,
    availableAmount,
    feeConfig,
    containerStyle,
    onAmountChanged = (
      amount: string,
      error: IError<AmountErrorCode>,
      isFocus: boolean
    ) => {
      console.log(amount, error, isFocus);
    },
    config = {
      feeReservation: 0,
      minAmount: MIN_AMOUNT,
    },
    inputRef,
    onSubmitEditting,
    overrideError,
    returnKeyType,
    rightLabelView,
  }) => {
    const style = useStyle();
    const intl = useIntl();

    const [isFocus, setIsFocus] = useState(false);
    const [amountText, setAmountText] = useState(
      formatTextNumber(amountConfig.amount)
    );
    const [errorText, setErrorText] = useState("");
    const [showError, setShowError] = useState(false);

    const infoText = intl.formatMessage(
      { id: "component.amount.input.error.minimum" },
      { amount: config.minAmount, denom: amountConfig.sendCurrency.coinDenom }
    );

    useEffect(() => {
      setShowError(!isFocus);
      onChangeTextHandler(amountText);
    }, [isFocus, amountText]);

    function onChangeTextHandler(amountText: string) {
      const text = amountText.split(",").join("");
      const amount = Number(text);
      let error: IError<AmountErrorCode> = {
        code: "",
        msg: "",
      };

      if (text.length === 0 || Number.isNaN(amount) || amount < 0) {
        if (text.length !== 0) {
          error.code = "INVALID_AMOUNT";
          error.msg = intl.formatMessage({
            id: "InvalidAmount",
          });
        }

        if (overrideError) {
          error = overrideError(error);
        }

        setErrorText(error.msg);
        onAmountChanged("0", error, isFocus);
        return;
      }

      amountConfig.setAmount(text);

      const amountDec = new Dec(text);
      const minAmountDec = new Dec(config.minAmount);
      const availableAmountDec = availableAmount
        ? availableAmount.toDec()
        : new Dec(0);
      const feeReservationDec = new Dec(Math.max(0, config.feeReservation));

      if (amountDec.lt(minAmountDec)) {
        error.code = "MINIMUM_AMOUNT";
        error.msg = intl.formatMessage(
          { id: "component.amount.input.error.minimum" },
          {
            amount: config.minAmount,
            denom: amountConfig.sendCurrency.coinDenom,
          }
        );
      } else if (
        amountDec.gt(availableAmountDec.sub(feeReservationDec)) ||
        (feeConfig && feeConfig.error)
      ) {
        if (
          feeReservationDec.isPositive() &&
          amountDec.lte(availableAmountDec)
        ) {
          error.code = "INSUFFICIENT_FEE_RESERVATION";
          error.msg = intl.formatMessage(
            {
              id: "component.amount.input.error.insufficientFeeReservation",
            },
            {
              amount: config.feeReservation,
              denom: amountConfig.sendCurrency.coinDenom,
            }
          );
        } else {
          error.code = "INSUFFICIENT_AMOUNT";
          error.msg = intl.formatMessage({
            id: "component.amount.input.error.insufficientAmount",
          });
        }
      }

      if (overrideError) {
        error = overrideError(error);
      }

      setErrorText(error.msg);
      onAmountChanged(text, error, isFocus);
    }

    const onMaxHandler = () => {
      if (!availableAmount) {
        return;
      }

      const maxAmount = availableAmount
        .toDec()
        .gt(new Dec(config.feeReservation))
        ? availableAmount.toDec().sub(new Dec(config.feeReservation))
        : new Dec(0);
      setAmountText(
        removeZeroFractionDigits(maxAmount.toString(FRACTION_DIGITS))
      );
    };

    return (
      <View style={containerStyle}>
        <NormalInput
          maxLength={22}
          value={amountText}
          label={labelText}
          info={infoText}
          error={showError ? errorText : ""}
          onChangeText={(text) => {
            setAmountText(formatTextNumber(text));
          }}
          onBlur={() => {
            setIsFocus(false);
          }}
          onFocus={() => {
            setIsFocus(true);
          }}
          placeholder="0"
          keyboardType="numeric"
          rightView={
            availableAmount && (
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: 16,
                  alignItems: "center",
                }}
              >
                {!hideDenom && (
                  <Text
                    style={style.flatten([
                      "text-base-regular",
                      "color-label-text-2",
                      "margin-right-8",
                    ])}
                  >
                    {amountConfig.sendCurrency.coinDenom}
                  </Text>
                )}
                <Button
                  text={intl.formatMessage({
                    id: "Max",
                  })}
                  size="medium"
                  mode="ghost"
                  onPress={onMaxHandler}
                />
              </View>
            )
          }
          style={{ marginBottom: errorText || infoText ? 24 : 0 }}
          inputRef={inputRef}
          onSubmitEditting={onSubmitEditting}
          returnKeyType={returnKeyType}
          rightLabelView={rightLabelView}
        />
      </View>
    );
  }
);
