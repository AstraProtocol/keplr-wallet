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

  const getValidator = (validatorAddress: string) => {
    return queryValidators.getValidator(validatorAddress);
  };

  const getValidatorThumbnail = (validatorAddress: string) => {
    return queryValidators.getValidatorThumbnail(validatorAddress);
  };

  const getValidatorAPR = (validatorAddress: string) => {
    return 0.25;
    // return getValidator(validatorAddress);
  };

  const getTotalSharesAmountOf = (validatorAddress: string) => {
    const validator = getValidator(validatorAddress);

    return new CoinPretty(
      chainStore.current.stakeCurrency,
      new Dec(validator?.tokens || 0)
    );
  };

  const getTotalUnbondingAmount = () => {
    return queryUnbondingDelegations.total;
  };

  const getUnbondingAmountOf = (validatorAddress: string) => {
    const stakingAmount = getStakingAmountOf(validatorAddress);

    const zeroAmount = new CoinPretty(stakingAmount.currency, new Dec(0));
    const unbonding = queryUnbondingDelegations.unbondingBalances.find(
      (unbonding) => validatorAddress === unbonding.validatorAddress
    );

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

  const hasRewards = () => {
    return getTotalRewardsAmount().toDec().gt(new Dec(0));
  };

  const hasUnbonding = () => {
    return getTotalUnbondingAmount().toDec().gt(new Dec(0));
  };

  return {
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

    isStakingTo,
    hasRewards,
    hasUnbonding,

    queryValidators,
    queryDelegations,
    queryUnbondingDelegations,
    queryRedelegations,
  };
};
