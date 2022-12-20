import { CoinPretty } from "@keplr-wallet/unit";
import { formatCoin } from "../../../common/utils";
import { useStore } from "../../../stores";

export const useQueryBalances = () => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const chainId = chainStore.current.chainId;

  const waitBalanceResponses = async () => {
    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);
    const chain = chainStore.getChain(chainId);

    Promise.all([
      queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .stakable.waitFreshResponse(),
      queries.cosmos.queryTokens
        .getQueryHexAddress(
          account.ethereumHexAddress,
          chain.raw.blockscoutUrl,
          { page: 1, limit: 10 }
        )
        .waitFreshResponse(),
    ]);
  };

  const getBalances = () => {
    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);
    const chain = chainStore.getChain(chainId);

    const queryBalances = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    );
    const queryTokens = queries.cosmos.queryTokens.getQueryHexAddress(
      account.ethereumHexAddress,
      chain.raw.blockscoutUrl,
      { page: 1, limit: 10 }
    );

    const balances = [
      queryBalances.stakable.balance,
      ...queryTokens.tokens
        .filter((token) => token.type === "ERC-20")
        .map(
          (token) =>
            new CoinPretty(
              {
                coinDecimals: Number(token.decimals),
                coinDenom: token.symbol,
                coinMinimalDenom: token.symbol,
                coinImageUrl:
                  "https://salt.tikicdn.com/ts/ta/9d/c3/c2/4420480a5596c4e366a5342f9d7ef87e.png",
                contractAddress: token.contractAddress,
              },
              token.balance
            )
        ),
    ];

    console.log(
      "_____balance_____",
      balances.map((bal) => {
        return formatCoin(bal, false, 2);
      })
    );

    return balances;
  };

  return { waitBalanceResponses, getBalances };
};
