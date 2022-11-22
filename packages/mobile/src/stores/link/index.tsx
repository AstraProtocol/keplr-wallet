import { KeyRingStatus } from "@keplr-wallet/background";
import { KVStore } from "@keplr-wallet/common";
import { KeyRingStore } from "@keplr-wallet/stores";
import { action, autorun, makeObservable, observable } from "mobx";
import { AppState, Linking } from "react-native";

export class LinkStore {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly keyRingStore: KeyRingStore
  ) {
    makeObservable(this);

    this.initDeepLink();

    this.eventListener.addEventListener("keplr_keystorechange", () => {
      console.log("__DEBUG__ handlePendingUri after keplr_keystorechange");
      this.handlePendingUri();
    });
  }

  protected _canLock = false;

  protected pendingLinkUri: string = "";

  @observable
  protected _needGoBackToBrowser: boolean = false;

  /*
   XXX: Fairly hacky part.
        In Android, it seems posible that JS works, but all views deleted.
        This case seems to happen when the window size of the app is forcibly changed or the app is exited.
        But there doesn't seem to be an API that can detect this.
        The reason this is a problem is that the stores are all built with a singleton concept.
        Even if the view is initialized and recreated, this store is not recreated.
        In this case, the url handler of the deep link does not work and must be called through initialURL().
        To solve this problem, we leave the detection of the activity state to another component.
        If a component that cannot be unmounted is unmounted, it means the activity is killed.
   */
  protected _isAndroidActivityKilled = false;

  /**
   needGoBackToBrowser indicates that all requests from the wallet connect are processed when the request is from the deep link.
   This store doesn't show any indicator to user or close the app.
   The other component (maybe provider) should act according to this field.
   */
  get needGoBackToBrowser(): boolean {
    return this._needGoBackToBrowser;
  }

  get canLock(): boolean {
    return this._canLock;
  }

  protected async initDeepLink() {
    console.log("__DEBUG__ initDeepLink");
    await this.checkInitialURL();

    Linking.addEventListener("url", (e) => {
      this.processDeepLinkURL(e.url);
    });

    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (this._isAndroidActivityKilled) {
          // If the android activity restored, the deep link url handler will not work.
          // We should recheck the initial URL()
          this.checkInitialURL();
        }
        this._isAndroidActivityKilled = false;
      } else {
        this.clearNeedGoBackToBrowser();
      }
    });
  }

  protected async checkInitialURL() {
    console.log("__DEBUG__ checkInitialURL");
    const initialURL = await Linking.getInitialURL();
    if (initialURL) {
      this.processDeepLinkURL(initialURL);
    }
  }

  protected processDeepLinkURL(_url: string) {
    try {
      const url = new URL(_url);
      if (url.protocol === "astrawallet:") {
        this.saveDeepLink(_url);
        console.log("__DEBUG__ linkStore:", _url);
      }
    } catch (e) {
      console.log(e);
    }
  }

  onAndroidActivityKilled() {
    this._isAndroidActivityKilled = true;
  }

  @action
  clearNeedGoBackToBrowser() {
    this._needGoBackToBrowser = false;
  }

  protected async handlePendingUri() {
    await this.waitInitStores();
    this._canLock = true;
    console.log("__DEBUG__ got pendingUrl: ", this.pendingLinkUri);
    if (this.pendingLinkUri.length > 0) {
      const internalDeeplink = this.pendingLinkUri.replace(
        "astrawallet://",
        "astrawallet://internal-"
      );
      console.log("url: ", internalDeeplink);
      const supported = await Linking.canOpenURL(internalDeeplink);
      if (supported) {
        await Linking.openURL(internalDeeplink);
      }
      this.pendingLinkUri = "";
    }
  }
  async saveDeepLink(uri: string): Promise<void> {
    this.pendingLinkUri = uri;
    await this.kvStore.set("aw_pending_link_uri", uri);
  }

  protected async waitInitStores(): Promise<void> {
    // Wait until the chain store and account store is ready.
    if (this.keyRingStore.status !== KeyRingStatus.UNLOCKED) {
      await new Promise<void>((resolve) => {
        const disposer = autorun(() => {
          if (this.keyRingStore.status === KeyRingStatus.UNLOCKED) {
            resolve();
            if (disposer) {
              disposer();
            }
          }
        });
      });
    }
  }
}
