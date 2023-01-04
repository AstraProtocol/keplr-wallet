import { KVStore } from "@keplr-wallet/common";
import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
} from "@keplr-wallet/stores";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { NFTData, Pagination } from "@keplr-wallet/stores/build/query/nft";
import { CoinPretty } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";
import { formatCoinAmount } from "../../common/utils";
import { ChainStore } from "../chain";

export class UserBalanceStore {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: AccountStore<
      [CosmosAccount, CosmwasmAccount, SecretAccount]
    >,
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
    >
  ) {
    makeObservable(this);
  }

  getBalance(chainId?: string): CoinPretty {
    const selectedChainId = chainId ?? this.chainStore.current.chainId;

    const account = this.accountStore.getAccount(selectedChainId);
    const queries = this.queriesStore.get(selectedChainId);

    const queryStakable = queries.queryBalances.getQueryBech32Address(
      account.bech32Address
    ).stakable;

    return queryStakable.balance;
  }

  getBalanceString(chainId?: string): string {
    const balance = this.getBalance(chainId);
    return formatCoinAmount(balance);
  }

  // NFTs

  @observable protected _fetching: boolean = false;
  @observable protected _nfts: NFTData[] = [];
  @observable protected _pagination: Pagination = {
    page: 0,
    limit: 10,
    total: 0,
  };

  @computed
  get fetching(): boolean {
    return this._fetching;
  }

  @computed
  get nfts(): NFTData[] {
    return this._nfts;
  }

  @computed
  get pagination(): Pagination {
    return this._pagination;
  }

  @action
  setFetching(fetching: boolean) {
    this._fetching = fetching;
  }

  @action
  setNFTs(nfts: NFTData[]) {
    this._nfts = nfts;
  }

  @action
  appendNFTs(nfts: NFTData[]) {
    if (nfts.length != 0) {
      this._nfts = [...this._nfts, ...nfts];
    }
  }

  @action
  setPagination(pagination: Pagination) {
    this._pagination = pagination;
  }
}
