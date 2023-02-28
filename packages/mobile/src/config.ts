import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";
import { ChainId } from "@solarswap/sdk";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";

export interface AppChainInfo extends ChainInfo {
  readonly chainSymbolImageUrl?: string;
  readonly hideInUI?: boolean;
  readonly txExplorer?: {
    readonly name: string;
    readonly txUrl: string;
  };
  readonly wcInfor?: {
    readonly relayUrl: string;
    readonly pushServerUrl?: string;
    readonly projectId: string;
    readonly metadata: {
      readonly name: string;
      readonly description: string;
      readonly url: string;
      readonly icons: [string];
    };
  };
  readonly chainIdNumber?: ChainId;
  readonly documentsUrl?: string;
  readonly chainIndexingUrl: string;
  readonly ticketHubUrl: string;
  readonly blockscoutUrl: string;
  readonly ethereumEndpoint: string;
}

export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: "https://cosmos.astranaut.io:26657",
    rest: "https://api.astranaut.io",
    chainId: "astra_11110-1",
    chainIdNumber: 11110,
    chainName: "Mainnet",
    stakeCurrency: {
      coinDenom: "ASA",
      coinMinimalDenom: "aastra",
      coinDecimals: 18,
      coinGeckoId: "aastra",
      coinImageUrl:
        "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
      },
      {
        type: "erc20",
        coinDenom: "USDT",
        coinMinimalDenom: "usdt",
        coinDecimals: 18,
        coinImageUrl:
          "https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png",
        contractAddress: "0x6f74f5511ba144990A8aeBaF20AFBD3B56EedCb2",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
        gasPriceStep: {
          low: 500000000,
          average: 100000000000,
          high: 2000000000,
        },
      },
    ],
    coinType: 60,
    features: ["ibc-transfer", "ibc-go", "eth-key-sign", "eth-address-gen"],
    chainSymbolImageUrl:
      "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Astra Explorer",
      txUrl: "https://explorer.astranaut.io/tx/{txHash}",
    },
    wcInfor: {
      relayUrl: "wss://relay.walletconnect.com",
      pushServerUrl: "https://wc-push.astranaut.io",
      projectId: "af3dd8c81db591806b87e9dbdd42d670",
      metadata: {
        name: "Astra Wallet",
        description: "Everything for Astra",
        url: "https://astranaut.io",
        icons: [
          "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
        ],
      },
    },
    documentsUrl: "https://wallet.astranaut.io",
    chainIndexingUrl: "https://chainindexing.astranaut.io",
    ticketHubUrl: "https://api.tiki.vn/tickethub",
    blockscoutUrl: "https://blockscout.astranaut.io",
    ethereumEndpoint: "https://rpc.astranaut.io",
  },
  {
    rpc: "https://cosmos.astranaut.dev",
    rest: "https://api.astranaut.dev",
    chainId: "astra_11115-1",
    chainIdNumber: 11115,
    chainName: "Testnet",
    stakeCurrency: {
      coinDenom: "ASA",
      coinMinimalDenom: "aastra",
      coinDecimals: 18,
      coinGeckoId: "aastra",
      coinImageUrl:
        "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
    },
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config("astra"),
    currencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/87/4c/61/222e62fdd14e6b76189017f97f5101ed.png",
      },
      {
        type: "erc20",
        coinDenom: "USDT",
        coinMinimalDenom: "usdt",
        coinDecimals: 18,
        coinImageUrl:
          "https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png",
        contractAddress: "0x6f74f5511ba144990A8aeBaF20AFBD3B56EedCb2",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ASA",
        coinMinimalDenom: "aastra",
        coinDecimals: 18,
        coinGeckoId: "aastra",
        coinImageUrl:
          "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
        gasPriceStep: {
          low: 500000000,
          average: 100000000000,
          high: 2000000000,
        },
      },
    ],
    coinType: 60,
    features: ["ibc-transfer", "ibc-go", "eth-key-sign", "eth-address-gen"],
    chainSymbolImageUrl:
      "https://salt.tikicdn.com/ts/upload/2a/74/6d/1000f0249fd530a9313a07fc3e13c1b2.png",
    txExplorer: {
      name: "Astra Explorer",
      txUrl: "https://explorer.astranaut.dev/tx/{txHash}",
    },
    wcInfor: {
      relayUrl: "wss://relay.walletconnect.com",
      pushServerUrl: "https://wc-push.astranaut.dev",
      projectId: "af3dd8c81db591806b87e9dbdd42d670",
      metadata: {
        name: "Astra Wallet",
        description: "Everything for Astra",
        url: "https://astranaut.io",
        icons: [
          "https://salt.tikicdn.com/ts/upload/ae/af/2a/d24e08ad40c1bec8958cc39d5bc924cc.png",
        ],
      },
    },
    documentsUrl: "https://wallet.astranaut.dev",
    chainIndexingUrl: "https://chainindexing.astranaut.dev",
    ticketHubUrl: "https://api.tala.xyz/tickethub",
    blockscoutUrl: "https://blockscout.astranaut.dev",
    ethereumEndpoint: "https://rpc.astranaut.dev",
  },
];
