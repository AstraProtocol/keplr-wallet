import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_AMOUNT = 10;
export const MIN_REWARDS_AMOUNT = 0.001;

export const formatCoin = (coin?: CoinPretty, hideDenom: boolean = false) => {
  if (!coin) {
    return "";
  }

  const value = Number(coin.toDec());
  const maximumFractionDigits = value >= 1000 ? 0 : (value > 1 ? 3 : 6);
  var formattedText = value.toLocaleString("en-US", { maximumFractionDigits });
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

export const formatNumber = (value: string) => {
  const replacedValue = value.split(",").join("");
  const numValue = Number(replacedValue);
  if (!numValue) {
    return value;
  }

  const idx = replacedValue.indexOf(".");
  var fraction = "";
  if (idx !== -1) {
    fraction = replacedValue.substring(idx, Math.min(idx + 4, replacedValue.length));
  }

  return numValue.toLocaleString("en-US", { maximumFractionDigits: 0 }) + fraction;
};

export const formatPercent = (value: any, hideSymbol: boolean = false) => {
  return new IntPretty(new Dec(value ?? 0))
    .moveDecimalPointRight(2)
    .maxDecimals(2)
    .trim(true)
    .toString() + (hideSymbol ? "" : "%");
};