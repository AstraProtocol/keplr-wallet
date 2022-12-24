import { KVStore } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import {
  Coin,
  InflationEpochMintProvision,
  InflationParams,
  InflationParamsResponse,
  InflationPeriod,
  InflationRate,
} from "./types";

export class ObservableQueryInflationParams extends ObservableChainQuery<InflationParamsResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/astra/inflation/v1/params");

    makeObservable(this);
  }

  @computed
  get params(): InflationParams | undefined {
    if (!this.response) {
      return;
    }

    if (this.error) {
      throw Error(this.error.message);
    }

    return this.response.data.params;
  }
}

export class ObservableQueryInflationEpochMintProvision extends ObservableChainQuery<InflationEpochMintProvision> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/astra/inflation/v1/epoch_mint_provision"
    );

    makeObservable(this);
  }

  @computed
  get epochMintProvision(): Coin | undefined {
    if (!this.response) {
      return;
    }

    if (this.error) {
      throw Error(this.error.message);
    }

    return this.response.data.epoch_mint_provision;
  }
}

export class ObservableQueryInflationInflationPeriod extends ObservableChainQuery<InflationPeriod> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/astra/inflation/v1/inflation_period"
    );

    makeObservable(this);
  }

  @computed
  get period(): InflationPeriod | undefined {
    if (!this.response) {
      return;
    }

    if (this.error) {
      throw Error(this.error.message);
    }

    return this.response.data;
  }
}

export class ObservableQueryInflationInflationRate extends ObservableChainQuery<InflationRate> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/astra/inflation/v1/inflation_rate");

    makeObservable(this);
  }

  @computed
  get rate(): Dec | undefined {
    if (!this.response) {
      return;
    }

    if (this.error) {
      throw Error(this.error.message);
    }

    return new Dec(this.response.data.inflation_rate);
  }
}
