import { ObservableChainQuery } from "../../chain-query";
import { MintingInflation } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { computed, makeObservable } from "mobx";
import { Coin, ObservableQueryMintBlockProvision } from "./astra";

export class ObservableQueryMint {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly _queryMintInflation: ObservableQueryMintingInfation,
    protected readonly _queryAstraMintBlockProvision: ObservableQueryMintBlockProvision
  ) {
    makeObservable(this);
  }

  @computed
  get mintBlockProvision(): Coin | undefined {
    return this._queryAstraMintBlockProvision.mintBlockProvision;
  }
}

export class ObservableQueryMintingInfation extends ObservableChainQuery<MintingInflation> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/cosmos/mint/v1beta1/inflation");
  }
}
