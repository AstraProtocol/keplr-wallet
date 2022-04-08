import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

import {
  ASTRA_REST_CONFIG,
  ASTRA_REST_ENDPOINT,
  ASTRA_RPC_CONFIG,
  ASTRA_RPC_ENDPOINT,
  PRIVILEGED_ORIGINS,
 
} from "./config.var";

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: ASTRA_RPC_ENDPOINT,
    rpcConfig: ASTRA_RPC_CONFIG,
    rest: ASTRA_REST_ENDPOINT,
    restConfig: ASTRA_REST_CONFIG,
    chainId: "astra_11110-1",
    chainName: "Astra",
    stakeCurrency: {
      coinDenom: "ASTRA",
      coinMinimalDenom: "astra",
      coinDecimals: 18,
      coinGeckoId: "astra",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://app.astranaut.network"
        : "https://app.astranaut.network",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://app.astranaut.network/#/stake"
        : "https://app.astranaut.network/#/stake",
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASTRA",
        coinMinimalDenom: "astra",
        coinDecimals: 18,
        coinGeckoId: "astra",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASTRA",
        coinMinimalDenom: "astra",
        coinDecimals: 18,
        coinGeckoId: "astra",
      },
    ],
    coinType: 60,
    features: ["ibc-transfer", "ibc-go"],
  }
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;
