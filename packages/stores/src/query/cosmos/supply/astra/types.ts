export type InflationParams = {
  params: {
    mint_denom: string;
    inflation_parameters: {
      max_staking_rewards: string;
      r: string;
    };
    enable_inflation: boolean;
  };
};

export type InflationPeriod = {
  period: string;
  epochs_per_period: string;
  epoch_identifier: string;
};

export type InflationRate = {
  inflation_rate: string;
};
