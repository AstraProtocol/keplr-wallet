import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../../common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Pagination, Tx, Txs } from "./types";

export class ObservableQueryTxsInner extends ObservableChainQuery<Txs> {
  protected queryParams: string;

  static createQueryUrl = (
    bech32Address: string,
    transactionsUrl: string,
    pagination: { page: number; limit: number }
  ): string => {
    return (
      transactionsUrl +
      `/api/v1/accounts/${bech32Address}/transactions` +
      `?pagination=offset` +
      `&order=height.desc` +
      `&page=${pagination.page}` +
      `&limit=${pagination.limit}`
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
  get txs(): Tx[] {
    return this.response ? this.response.data.result : [];
  }

  @computed
  get pagination(): Pagination {
    return this.response
      ? this.response.data.pagination
      : { total_page: 0, total_record: 0, current_page: 0, limit: 0 };
  }
}

export class ObservableQueryTxs extends ObservableChainQueryMap<Txs> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (queryUrl: string) => {
      const url = new URL(queryUrl);

      return new ObservableQueryTxsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        url.pathname + url.search,
        url.origin
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string,
    transactionsUrl: string,
    pagination: { page: number; limit: number }
  ): ObservableQueryTxsInner {
    const key = ObservableQueryTxsInner.createQueryUrl(
      bech32Address,
      transactionsUrl,
      pagination
    );
    return this.get(key) as ObservableQueryTxsInner;
  }
}
