import { action, makeObservable, observable } from "mobx";

export enum RegisterType {
  new,
  recover,
  unknown,
}

export class UserLoginStore {
  protected _socialLoginEnabledFunc?: () => boolean;

  constructor() {
    makeObservable(this);
  }

  //
  // Register Type
  //
  @observable
  protected _registerType: RegisterType = RegisterType.unknown;

  get registerType(): RegisterType {
    return this._registerType;
  }

  @action
  updateRegisterType(state: RegisterType) {
    this._registerType = state;
  }
}
