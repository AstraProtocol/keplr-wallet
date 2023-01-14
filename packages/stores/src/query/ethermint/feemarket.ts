import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../common";
import { ObservableChainQuery } from "../chain-query";
import { FeeMarketParams } from "./types";

export class ObservableQueryFeeMarket {
  protected _params: ObservableQueryFeeMarketParams;

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    this._params = new ObservableQueryFeeMarketParams(
      kvStore,
      chainId,
      chainGetter
    );

    makeObservable(this);
  }

  @computed
  get params() {
    return this._params.params;
  }

  @computed
  get baseFee() {
    return this._params.baseFee;
  }

  @computed
  get gasPrice() {
    return this._params.gasPrice;
  }

  @computed
  get gasMultiplier() {
    return this._params.gasMultiplier;
  }
}

export class ObservableQueryFeeMarketParams extends ObservableChainQuery<FeeMarketParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/ethermint/feemarket/v1/params");
    makeObservable(this);
  }

  @computed
  get params() {
    if (!this.response) {
      return;
    }

    return this.response.data.params;
  }

  @computed
  get baseFee() {
    if (!this.response) {
      return;
    }

    return this.response.data.params.base_fee;
  }

  @computed
  get gasPrice() {
    if (!this.response) {
      return;
    }

    return this.response.data.params.min_gas_price;
  }

  @computed
  get gasMultiplier() {
    if (!this.response) {
      return;
    }

    return this.response.data.params.min_gas_multiplier;
  }
}
