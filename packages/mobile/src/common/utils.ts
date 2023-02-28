import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { IntlShape } from "react-intl";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_AMOUNT = 0.01;
export const FEE_RESERVATION = 0.5;
export const FRACTION_DIGITS = 2;
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
  withdraw: 150000,
};

export const formatCoinAmount = (
  coin?: CoinPretty,
  hideDenom: boolean = false
) => {
  return formatCoin(coin, hideDenom, FRACTION_DIGITS);
};

export const formatCoinFee = (
  coin?: CoinPretty,
  hideDenom: boolean = false
) => {
  // if (coin && coin.toDec().lt(new Dec(0.000001))) {
  //   return `< 0.000001 ${coin.denom.toUpperCase()}`;
  // }

  return formatCoin(coin, hideDenom, (value: number): number => {
    return value >= 1 ? FRACTION_DIGITS : 6;
  });
};

export const formatCoinRewards = (
  coin?: CoinPretty,
  hideDenom: boolean = false
) => {
  return formatCoin(coin, hideDenom, (value: number): number => {
    return value >= 1 ? FRACTION_DIGITS : 6;
  });
};

export const formatCoinTotalShares = (
  coin?: CoinPretty,
  hideDenom: boolean = false
) => {
  return formatCoin(coin, hideDenom, 0);
};

export const formatCoin = (
  coin?: CoinPretty,
  hideDenom: boolean = false,
  maximumFractionDigits: ((value: number) => number) | number = 0
) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  let formattedText = value.toLocaleString(LOCALE_FORMAT.locale, {
    minimumFractionDigits: 18,
  });

  // Prevent rounded value
  let fractionDigits = 0;
  if (typeof maximumFractionDigits === "function") {
    fractionDigits = maximumFractionDigits(value);
  } else {
    fractionDigits = maximumFractionDigits;
  }
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

  if (replacedValue.startsWith(LOCALE_FORMAT.fractionDelimitter)) {
    replacedValue = "0" + replacedValue;
  }

  return replacedValue;
};

export const formatPercent = (
  value: any,
  hideSymbol: boolean = false,
  maxDecimals: number = 2
) => {
  return (
    new IntPretty(new Dec(value ?? 0))
      .moveDecimalPointRight(2)
      .maxDecimals(maxDecimals)
      .trim(true)
      .toString() + (hideSymbol ? "" : "%")
  );
};

export const formatUnbondingTime = (
  sec: number,
  intl: IntlShape,
  maxUnits: number = 2
) => {
  maxUnits = Math.max(maxUnits, 1);

  const minuteSeconds = 60;
  const hourSeconds = 60 * minuteSeconds;
  const daySeconds = 24 * hourSeconds;

  const days = Math.floor(sec / daySeconds);
  const hours = Math.floor((sec - days * daySeconds) / hourSeconds);
  const minutes = Math.floor(
    (sec - (days * daySeconds + hours * hourSeconds)) / minuteSeconds
  );
  const seconds = Math.floor(
    sec - (days * daySeconds + hours * hourSeconds + minutes * minuteSeconds)
  );

  let dateTexts = [] as string[];
  if (days > 0) {
    dateTexts = [
      ...dateTexts,
      days + " " + intl.formatMessage({ id: days > 1 ? "Days" : "Day" }),
    ];
  }
  if (hours > 0) {
    dateTexts = [
      ...dateTexts,
      hours + " " + intl.formatMessage({ id: hours > 1 ? "Hours" : "Hour" }),
    ];
  }
  if (minutes > 0) {
    dateTexts = [
      ...dateTexts,
      minutes +
        " " +
        intl.formatMessage({ id: minutes > 1 ? "Minutes" : "Minute" }),
    ];
  }
  dateTexts = [
    ...dateTexts,
    seconds +
      " " +
      intl.formatMessage({ id: seconds > 1 ? "Seconds" : "Second" }),
  ];

  return dateTexts.slice(0, Math.min(dateTexts.length, maxUnits)).join(" ");
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
