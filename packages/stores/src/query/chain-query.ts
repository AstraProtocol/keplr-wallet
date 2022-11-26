import { KVStore } from "@keplr-wallet/common";
import Axios, { AxiosInstance } from "axios";
import { override } from "mobx";
import { ChainGetter, HasMapStore, ObservableQuery } from "../common";

export class ObservableChainQuery<
  T = unknown,
  E = unknown
> extends ObservableQuery<T, E> {
  // Chain Id should not be changed after creation.
  protected readonly _chainId: string;
  protected readonly chainGetter: ChainGetter;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    url: string,
    customBaseUrl: string | undefined = undefined
  ) {
    const chainInfo = chainGetter.getChain(chainId);
    const baseURL = customBaseUrl || chainInfo.rest;

    const instance = Axios.create({
      baseURL,
      ...chainInfo.restConfig,
    });

    super(kvStore, instance, url, {}, baseURL);

    this._chainId = chainId;
    this.chainGetter = chainGetter;
  }

  @override
  protected get instance(): AxiosInstance {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }

  get chainId(): string {
    return this._chainId;
  }
}

export class ObservableChainQueryMap<
  T = unknown,
  E = unknown
> extends HasMapStore<ObservableChainQuery<T, E>> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    creater: (key: string) => ObservableChainQuery<T, E>
  ) {
    super(creater);
  }
}
