export type InflationParams = {
  mint_denom: string;
  inflation_parameters: {
    max_staking_rewards: string;
    r: string;
  };
  enable_inflation: boolean;
};

export type InflationParamsResponse = {
  params: InflationParams;
};

export type Coin = {
  denom: string;
  amount: string;
};

export type InflationEpochMintProvision = {
  epoch_mint_provision: Coin;
};

export type InflationPeriod = {
  period: string;
  epochs_per_period: string;
  epoch_identifier: string;
};

export type InflationRate = {
  inflation_rate: string;
};

export type MintBlockProvision = {
  provision: Coin;
};
