import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { Coin, MintBlockProvision } from "./types";

export class ObservableQueryMintBlockProvision extends ObservableChainQuery<MintBlockProvision> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, "/astra/mint/v1/block_provision");

    makeObservable(this);
  }

  @computed
  get mintBlockProvision(): Coin | undefined {
    if (!this.response) {
      return;
    }

    return this.response.data.provision;
  }
}
