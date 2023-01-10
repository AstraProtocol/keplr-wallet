import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { useStore } from "../../../stores";

export const useStaking = () => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const chainId = chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unspecified
  );
  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );
  const queryUnbondingDelegations = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const queryRedelegations = queries.cosmos.queryRedelegations.getQueryBech32Address(
    account.bech32Address
  );
  const queryPool = queries.cosmos.queryPool;
  const queryInflation = queries.cosmos.queryInflation;
  const queryMint = queries.cosmos.queryMint;

  const getChainAPR = () => {
    // const dailyRewards = Number(
    //   queryInflation.epochMintProvision?.amount || "0"
    // );

    // if (queryPool.bondedTokens.toDec().isZero() || dailyRewards === 0) {
    //   return 0;
    // }

    // const bonded = Number(queryPool.bondedTokens.toCoin().amount);

    // return (dailyRewards * 365.25) / bonded;
    const blockProvision = Number(
      queryMint.mintBlockProvision?.amount || "0"
    );

    if (queryPool.bondedTokens.toDec().isZero() || blockProvision === 0) {
      return 0;
    }

    const bonded = Number(queryPool.bondedTokens.toCoin().amount);

    return (blockProvision * 10519200) / bonded;
  };

  const getValidators = (
    status:
      | "BOND_STATUS_UNSPECIFIED"
      | "BOND_STATUS_UNBONDED"
      | "BOND_STATUS_UNBONDING"
      | "BOND_STATUS_BONDED" = "BOND_STATUS_UNSPECIFIED"
  ) => {
    return queryValidators.validators
      .filter((validator) => validator.status === status)
      .sort((val1, val2) => {
        return new Dec(val2.tokens).gt(new Dec(val1.tokens)) ? 1 : -1;
      });
  };

  const getValidator = (validatorAddress?: string) => {
    if (!validatorAddress) {
      return;
    }
    return queryValidators.getValidator(validatorAddress);
  };

  const getValidatorThumbnail = (validatorAddress: string) => {
    return queryValidators.getValidatorThumbnail(validatorAddress);
  };

  const getValidatorAPR = (validatorAddress: string) => {
    const validator = getValidator(validatorAddress);
    const chainAPR = getChainAPR();
    const commissionRate = Number(
      validator?.commission.commission_rates.rate || "0"
    );
    return chainAPR * (1 - commissionRate);
  };

  const getTotalSharesAmountOf = (validatorAddress: string) => {
    const validator = getValidator(validatorAddress);

    return new CoinPretty(
      chainStore.current.stakeCurrency,
      new Dec(validator?.tokens || 0)
    );
  };

  const getUnbondingTime = () => {
    return queries.cosmos.queryStakingParams.unbondingTimeSec ?? 172800;
  };

  const getTotalUnbondings = () => {
    return queryUnbondingDelegations.unbondingBalances;
  };

  const getUnbondingOf = (validatorAddress: string) => {
    return getTotalUnbondings().find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );
  };

  const getTotalUnbondingAmount = () => {
    return queryUnbondingDelegations.total;
  };

  const getUnbondingAmountOf = (validatorAddress: string) => {
    const stakingAmount = getStakingAmountOf(validatorAddress);

    const zeroAmount = new CoinPretty(stakingAmount.currency, new Dec(0));
    const unbonding = getUnbondingOf(validatorAddress);

    return (
      unbonding?.entries.reduce((coin, entry) => {
        return coin.add(entry.balance);
      }, zeroAmount) || zeroAmount
    );
  };

  const getTotalStakingAmount = () => {
    return queryDelegations.total;
  };

  const getStakingAmountOf = (validatorAddress: string) => {
    return queryDelegations.getDelegationTo(validatorAddress);
  };

  const getTotalRewardsAmount = () => {
    return queryRewards.stakableReward;
  };

  const getRewardsAmountOf = (validatorAddress: string) => {
    return queryRewards.getStakableRewardOf(validatorAddress);
  };

  const getDelegations = () => {
    return queryDelegations.delegations.sort((a, b) => {
      return Number(b.balance.amount) - Number(a.balance.amount);
    });
  };

  const getRedelegationsTo = (validatorAddress: string) => {
    return queryRedelegations.getRedelegations({
      dstValidatorAddress: validatorAddress,
    });
  };

  const isStakingTo = (validatorAddress: string) => {
    return getStakingAmountOf(validatorAddress).toDec().gt(new Dec(0));
  };

  const hasUnbonding = () => {
    return getTotalUnbondingAmount().toDec().gt(new Dec(0));
  };

  return {
    getChainAPR,

    getValidators,
    getValidator,
    getValidatorThumbnail,
    getValidatorAPR,

    getTotalSharesAmountOf,
    getRewardsAmountOf,
    getStakingAmountOf,
    getUnbondingAmountOf,

    getTotalStakingAmount,
    getTotalRewardsAmount,
    getTotalUnbondingAmount,

    getDelegations,
    getRedelegationsTo,

    getUnbondingTime,
    getUnbondingOf,
    getTotalUnbondings,

    isStakingTo,
    hasUnbonding,

    queryValidators,
    queryRewards,
    queryDelegations,
    queryUnbondingDelegations,
    queryRedelegations,
    queryPool,
    queryInflation,
    queryMint,
  };
};
