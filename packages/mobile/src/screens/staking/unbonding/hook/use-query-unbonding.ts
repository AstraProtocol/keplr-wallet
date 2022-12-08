import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { useStore } from "../../../../stores";

export type UnbondingBalance = {
  validatorAddress: string;
  entries: {
    creationHeight: Int;
    completionTime: string;
    balance: CoinPretty;
  }[];
};

export const useQueryUnbonding = () => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const chain = chainStore.getChain(chainStore.current.chainId);
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const currency = chain.stakeCurrency;

  const getUnbondingTime = (): number => {
    return queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  };

  const getUnbondings = (): UnbondingBalance[] => {
    return queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances;
  };

  const getUnbondingOf = (
    validatorAddress: string
  ): UnbondingBalance | undefined => {
    return getUnbondings().find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );
  };

  const getUnbondingsTotal = (
    unbondingBalances: UnbondingBalance[]
  ): CoinPretty => {
    const zeroAmount = new CoinPretty(currency, new Dec(0));
    return unbondingBalances.reduce((unbondingAmount, unbonding) => {
      return unbondingAmount.add(
        unbonding.entries.reduce((entryAmount, entry) => {
          return entryAmount.add(entry.balance);
        }, zeroAmount)
      );
    }, zeroAmount);
  };

  return {
    getUnbondingTime,
    getUnbondings,
    getUnbondingOf,
    getUnbondingsTotal,
  };
};
