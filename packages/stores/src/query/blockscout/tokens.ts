import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { Token, Tokens } from "./types";

export class ObservableQueryTokensInner extends ObservableChainQuery<Tokens> {
  protected queryParams: string;

  static createQueryUrl = (
    hexAddress: string,
    blockscoutUrl: string,
    pagination: { page: number; limit: number }
  ): string => {
    return (
      blockscoutUrl +
      `/api/v1` +
      `?module=account` +
      `&action=tokenlist` +
      `&address=${hexAddress}` +
      `&page=${pagination.page}`
      // `&offset=${pagination.page}` +
      // `&limit=${pagination.limit}`
    );
  };

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryParams: string,
    customBaseUrl: string
  ) {
    super(kvStore, chainId, chainGetter, queryParams, customBaseUrl);
    makeObservable(this);

    this.queryParams = queryParams;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.queryParams.length > 0;
  }

  @computed
  get tokens(): Token[] {
    return this.response ? this.response.data.result : [];
  }
}

export class ObservableQueryTokens extends ObservableChainQueryMap<Tokens> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (queryUrl: string) => {
      const url = new URL(queryUrl);

      return new ObservableQueryTokensInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        url.pathname + url.search,
        url.origin
      );
    });
  }

  getQueryHexAddress(
    hexAddress: string,
    blockscoutUrl: string,
    pagination: { page: number; limit: number }
  ): ObservableQueryTokensInner {
    const key = ObservableQueryTokensInner.createQueryUrl(
      hexAddress,
      blockscoutUrl,
      pagination
    );
    return this.get(key) as ObservableQueryTokensInner;
  }
}
