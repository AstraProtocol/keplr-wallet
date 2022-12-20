import { KVStore } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { ChainGetter } from "../../common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { NFTData, NFTResponse, Pagination } from "./types";

export class ObservableQueryNFTsInner extends ObservableChainQuery<NFTResponse> {
  protected queryParams: string;

  static createQueryUrl = (
    hexAddress: string,
    ticketHubUrl: string,
    pagination: { page: number; limit: number }
  ): string => {
    return (
      ticketHubUrl +
      `/public/accounts/${hexAddress}/nfts` +
      `?page=${pagination.page}` +
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
  get nfts(): NFTData[] {
    return this.response ? this.response.data.result.data : [];
  }

  @computed
  get pagination(): Pagination {
    if (!this.response) {
      return { page: 0, total: 0, limit: 0 };
    }

    const { data, ...pagination } = this.response.data.result;
    return pagination;
  }
}

export class ObservableQueryNFTs extends ObservableChainQueryMap<NFTResponse> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (queryUrl: string) => {
      const url = new URL(queryUrl);

      return new ObservableQueryNFTsInner(
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
    ticketHubUrl: string,
    pagination: { page: number; limit: number }
  ): ObservableQueryNFTsInner {
    const key = ObservableQueryNFTsInner.createQueryUrl(
      hexAddress,
      ticketHubUrl,
      pagination
    );
    return this.get(key) as ObservableQueryNFTsInner;
  }
}
