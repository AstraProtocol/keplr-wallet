import { formatUnits, parseUnits } from "@ethersproject/units";
import { CurrencyAmount, ETHER, JSBI, Pair, Trade } from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SwapAction, SwapInfoState, SwapType } from "../providers/swap/reducer";
import {
  calculateSlippagePercent,
  ERROR_KEY,
  FIXED_DECIMAL_PLACES,
  GAS_PRICE,
  MAXIMUM_PRICE_IMPACT,
  ONE_ASA,
  SIGNIFICANT_DECIMAL_PLACES,
  SwapField,
  TIME_DEBOUNCE,
} from "../utils/for-swap";
import { computeTradePriceBreakdown } from "../utils/for-swap/compute-price";
import { useDebounce } from "./use-debounce";
import { swapEstimateGas, useSwapCallArguments } from "./use-swap-callback";

interface UseSwapProps {
  fetchTrade: (
    valueSwap: string,
    dependentField: SwapField
  ) => Promise<Trade[] | undefined>;
  swapInfos: SwapInfoState;
  tokenBalances: {
    [Key in SwapField]: CurrencyAmount | undefined;
  };
  dispatch: React.Dispatch<SwapAction> | null;
  pairData: Pair | undefined;
}
export interface UseSwapAggregationValue {
  lpFee?: string | undefined;
  pricePerInputCurrency?: string | undefined;
  minimunReceived?: string | undefined;
  priceImpact?: string | undefined;
  trade?: Trade | undefined;
  isReadyToSwap?: boolean;
  txFee?: string | undefined;
}

export const useSwapState = ({
  fetchTrade,
  swapInfos,
  tokenBalances,
  dispatch,
  pairData,
}: UseSwapProps) => {
  const [outputSwapValue, setOutputSwapValue] = useState<string>("");
  const {
    dependentField,
    independentField,
    slippageTolerance,
    swapValue,
  } = useMemo(() => swapInfos, [swapInfos]);

  const debouncedSwapValue = useDebounce(swapValue, TIME_DEBOUNCE);

  const [
    aggregationValue,
    setAggregationValue,
  ] = useState<UseSwapAggregationValue>({
    lpFee: "",
    pricePerInputCurrency: "",
    minimunReceived: "",
    priceImpact: "",
    trade: undefined,
    isReadyToSwap: false,
    txFee: "",
  });

  const swapCalls = useSwapCallArguments(
    aggregationValue.trade,
    swapInfos.slippageTolerance,
    true
  );

  const calculateValue = useCallback(
    (trade: Trade) => {
      const { inputAmount, outputAmount } = trade;
      const pricePerInputCurrency =
        independentField === SwapField.Output
          ? outputAmount.divide(inputAmount).toSignificant(FIXED_DECIMAL_PLACES)
          : inputAmount
              .divide(outputAmount)
              .toSignificant(SIGNIFICANT_DECIMAL_PLACES);
      const outputSwapValue =
        independentField === SwapField.Output
          ? outputAmount.toSignificant(SIGNIFICANT_DECIMAL_PLACES)
          : inputAmount.toSignificant(SIGNIFICANT_DECIMAL_PLACES);
      const {
        realizedLPFee,
        priceImpactWithoutFee,
      } = computeTradePriceBreakdown(trade);
      const minimunReceived = trade
        .minimumAmountOut(calculateSlippagePercent(slippageTolerance))
        .toSignificant(FIXED_DECIMAL_PLACES);
      const isPriceImpactTooHigh = priceImpactWithoutFee?.greaterThan(
        MAXIMUM_PRICE_IMPACT
      );

      setOutputSwapValue(outputSwapValue);
      setAggregationValue((state) => ({
        ...state,
        lpFee: realizedLPFee?.toSignificant(SIGNIFICANT_DECIMAL_PLACES) || "",
        priceImpact:
          priceImpactWithoutFee?.toSignificant(SIGNIFICANT_DECIMAL_PLACES) ||
          "",
        trade,
        minimunReceived,
        pricePerInputCurrency,
        isReadyToSwap: !isPriceImpactTooHigh,
      }));
    },
    [independentField, slippageTolerance]
  );

  const getOutputValue = useCallback(async () => {
    if (
      debouncedSwapValue &&
      dependentField &&
      typeof fetchTrade !== undefined
    ) {
      const trades = await fetchTrade(debouncedSwapValue, dependentField);
      if (trades && trades.length > 0) {
        return calculateValue(trades[0]);
      }
    } else {
      setOutputSwapValue("");
    }
  }, [debouncedSwapValue, dependentField, fetchTrade, calculateValue]);

  const getTransactionFee = useCallback(async () => {
    if (!swapCalls || swapCalls.length === 0) return;
    const { gasEstimate } = await swapEstimateGas(swapCalls);

    const txFee = formatUnits(gasEstimate.mul(GAS_PRICE.testnet), "gwei");
    setAggregationValue((state) => ({ ...state, txFee }));
  }, [swapCalls]);

  const values = useMemo(
    () => ({
      [dependentField]: swapValue,
      [independentField]: outputSwapValue,
    }),
    [dependentField, independentField, outputSwapValue, swapValue]
  );

  useEffect(() => {
    const get = async () => {
      await getOutputValue();
    };
    get();
  }, [debouncedSwapValue, dependentField, getOutputValue]);

  useEffect(() => {
    if (!swapCalls || swapCalls.length === 0) return;
    const get = async () => {
      await getTransactionFee();
    };
    get();
  }, [swapCalls, getTransactionFee]);

  useEffect(() => {
    // check insufficient balance
    const inputValue = values[SwapField.Input];
    const balance = tokenBalances[SwapField.Input];
    if (!balance || !inputValue || !dispatch) return;
    let error = "";
    try {
      // check balance
      const parseInput = parseUnits(
        inputValue,
        balance?.currency?.decimals
      ).toString();
      const isTrue = JSBI.lessThanOrEqual(JSBI.BigInt(parseInput), balance.raw);
      if (!isTrue) {
        error = ERROR_KEY.INSUFFICIENT_BALANCE;
      }

      // check limit ASA
      const isGreaterThan1ASA = JSBI.greaterThanOrEqual(
        JSBI.BigInt(parseInput),
        ONE_ASA
      );
      if (balance.currency.symbol === ETHER.symbol && !isGreaterThan1ASA) {
        error = ERROR_KEY.LIMIT_ONE_ASA;
      }
    } catch (err) {
      console.error("Error when input value", { err });
      error = ERROR_KEY.INVALID_INPUT;
    }

    dispatch({
      type: SwapType.SET_ERROR,
      payload: error,
    });
  }, [dispatch, tokenBalances, values]);

  useEffect(() => {
    // init exchangeRate
    if (
      pairData &&
      !outputSwapValue &&
      !aggregationValue.pricePerInputCurrency
    ) {
      const { token0, token1Price, token0Price } = pairData;
      const dependentFieldSymbol =
        tokenBalances[dependentField]?.currency?.symbol;
      const exchangeRate =
        token0.symbol === dependentFieldSymbol ? token0Price : token1Price;
      const price = exchangeRate.toSignificant(FIXED_DECIMAL_PLACES);

      setAggregationValue({
        pricePerInputCurrency: price,
      });
    }
  }, [
    aggregationValue.pricePerInputCurrency,
    dependentField,
    independentField,
    outputSwapValue,
    pairData,
    tokenBalances,
  ]);

  return {
    values,
    ...aggregationValue,
  };
};