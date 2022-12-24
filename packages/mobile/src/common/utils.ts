import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { IntlShape } from "react-intl";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_AMOUNT = 0.01;
export const MIN_REWARDS_AMOUNT = 0.01;
export const FEE_RESERVATION = 0.1;
export const LOCALE_FORMAT = {
  locale: "en-US",
  fractionDelimitter: ".",
  maximumFractionDigits: (value: number): number => {
    return value >= 1000 ? 0 : value >= 0.01 ? 2 : 4;
  },
};
export const TX_GAS_DEFAULT = {
  delegate: 250000,
  undelegate: 250000,
  redelegate: 250000,
  withdraw: 250000,
};

export const formatCoin = (
  coin?: CoinPretty,
  hideDenom: boolean = false,
  maximumFractionDigits: number | undefined = undefined
) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  let formattedText = value.toLocaleString(LOCALE_FORMAT.locale, {
    minimumFractionDigits: 18,
  });

  // Prevent rounded value
  const fractionDigits =
    maximumFractionDigits ?? LOCALE_FORMAT.maximumFractionDigits(value);
  const parts = formattedText.split(LOCALE_FORMAT.fractionDelimitter);

  if (fractionDigits != 0) {
    formattedText =
      parts[0] +
      LOCALE_FORMAT.fractionDelimitter +
      parts[1].substring(0, fractionDigits);
  } else {
    formattedText = parts[0];
  }

  formattedText = removeZeroFractionDigits(formattedText);

  if (!hideDenom) {
    formattedText += " " + coin.denom.toUpperCase();
  }
  return formattedText;
};

export const formatDate = (date: Date) => {
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTextNumber = (value: string) => {
  var replacedValue = value.split(",").join(LOCALE_FORMAT.fractionDelimitter);
  const idx = replacedValue.indexOf(LOCALE_FORMAT.fractionDelimitter);
  if (idx !== -1) {
    replacedValue =
      replacedValue.substring(0, idx) +
      LOCALE_FORMAT.fractionDelimitter +
      replacedValue
        .substring(idx + 1, replacedValue.length)
        .split(LOCALE_FORMAT.fractionDelimitter)
        .join("");
  }

  return replacedValue;
};

export const formatPercent = (
  value: any,
  hideSymbol: boolean = false,
  maxDecimals: number = 0
) => {
  return (
    new IntPretty(new Dec(value ?? 0))
      .moveDecimalPointRight(2)
      .maxDecimals(maxDecimals)
      .trim(true)
      .toString() + (hideSymbol ? "" : "%")
  );
};

export const formatUnbondingTime = (sec: number, intl: IntlShape) => {
  const relativeEndTimeDays = sec / (3600 * 24);
  const relativeEndTimeHours = sec / 3600;

  if (relativeEndTimeDays >= 1) {
    return intl.formatMessage(
      { id: "validator.details.unbonding.days" },
      { days: Math.round(relativeEndTimeDays) }
    );
  } else if (relativeEndTimeHours > 0) {
    return intl.formatMessage(
      { id: "validator.details.unbonding.hours" },
      { hours: Math.round(relativeEndTimeHours) }
    );
  }

  return "";
};

export const removeZeroFractionDigits = (text: string) => {
  var formattedText = text;
  if (formattedText.indexOf(LOCALE_FORMAT.fractionDelimitter) !== -1) {
    while (formattedText.endsWith("0")) {
      formattedText = formattedText.slice(0, -1);
    }
    if (formattedText.endsWith(LOCALE_FORMAT.fractionDelimitter)) {
      formattedText = formattedText.slice(0, -1);
    }
  }
  return formattedText;
};
