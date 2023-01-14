export type FeeMarketParams = {
  params: {
    no_base_fee: boolean;
    base_fee_change_denominator: number;
    elasticity_multiplier: number;
    enable_height: string;
    base_fee: string;
    min_gas_price: string;
    min_gas_multiplier: string;
  };
};
