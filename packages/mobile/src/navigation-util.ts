import { BIP44HDPath, ExportKeyRingData } from "@keplr-wallet/background";
import {
  AddressBookConfig,
  AddressBookData,
  IMemoConfig,
  IRecipientConfig,
  RegisterConfig,
} from "@keplr-wallet/hooks";
import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { SignClientTypes } from "@walletconnect/types";
import { createSmartNavigatorProvider, SmartNavigator } from "./hooks";
import { NewMnemonicConfig } from "./screens/register/mnemonic";
import { PasswordInputScreenType } from "./screens/settings/screens";
import { RegisterType } from "./stores/user-login";

const {
  SmartNavigatorProvider,
  useSmartNavigation,
} = createSmartNavigatorProvider(
  new SmartNavigator({
    "Register.Intro": {
      upperScreenName: "Register",
    },
    "Register.NewUser": {
      upperScreenName: "Register",
    },
    "Register.NotNewUser": {
      upperScreenName: "Register",
    },
    "Register.NewMnemonic": {
      upperScreenName: "Register",
    },
    "Register.VerifyMnemonic": {
      upperScreenName: "Register",
    },
    "Register.RecoverMnemonic": {
      upperScreenName: "Register",
    },
    "Register.NewLedger": {
      upperScreenName: "Register",
    },
    "Register.TorusSignIn": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension.Intro": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension": {
      upperScreenName: "Register",
    },
    "Register.ImportFromExtension.SetPassword": {
      upperScreenName: "Register",
    },
    "Register.End": {
      upperScreenName: "Register",
    },
    "Register.Tutorial": {
      upperScreenName: "Register",
    },
    "Register.SetPincode": {
      upperScreenName: "Register",
    },
    "Register.SetupBiometrics": {
      upperScreenName: "Register",
    },
    "Register.CreateEntry": {
      upperScreenName: "Register",
    },
    Home: {
      upperScreenName: "Main",
    },
    Receive: {
      upperScreenName: "Wallet",
    },
    "Wallet.Send": {
      upperScreenName: "Wallet",
    },
    "Wallet.SendConfirm": {
      upperScreenName: "Wallet",
    },
    "Swap.Home": {
      upperScreenName: "Swap",
    },
    "Swap.Confirm": {
      upperScreenName: "Swap",
    },
    NewHome: {
      upperScreenName: "NewMain",
    },
    Send: {
      upperScreenName: "Others",
    },
    Tokens: {
      upperScreenName: "Others",
    },
    ManageWalletConnect: {
      upperScreenName: "Others",
    },
    Delegate: {
      upperScreenName: "Wallet",
    },
    Undelegate: {
      upperScreenName: "Wallet",
    },
    Redelegate: {
      upperScreenName: "Wallet",
    },
    Governance: {
      upperScreenName: "Others",
    },
    "Governance Details": {
      upperScreenName: "Others",
    },
    Setting: {
      upperScreenName: "Settings",
    },
    SettingSelectAccount: {
      upperScreenName: "Settings",
    },
    "Setting.ViewPrivateData": {
      upperScreenName: "Wallet",
    },
    "Setting.ChainList": {
      upperScreenName: "ChainList",
    },
    "Setting.AddToken": {
      upperScreenName: "Others",
    },
    "Setting.ManageTokens": {
      upperScreenName: "Others",
    },
    AddressBook: {
      upperScreenName: "AddressBooks",
    },
    AddAddressBook: {
      upperScreenName: "AddressBooks",
    },
    Result: {
      upperScreenName: "Others",
    },
    "Web.Intro": {
      upperScreenName: "Web",
    },
    "Web.Dapps": {
      upperScreenName: "Web",
    },
    "Settings.PasswordInput": {
      upperScreenName: "Wallet",
    },
    "Settings.NewPasswordInput": {
      upperScreenName: "Wallet",
    },
    "Staking.Dashboard": {
      upperScreenName: "Stake",
    },
    "Validator.Details": {
      upperScreenName: "Wallet",
    },
    "Validator.List": {
      upperScreenName: "Wallet",
    },
    "Staking.Rewards": {
      upperScreenName: "Wallet",
    },
    Unbonding: {
      upperScreenName: "Wallet",
    },
    "Wallet.History": {
      upperScreenName: "Wallet",
    },
    History: {
      upperScreenName: "History",
    },
    WebView: {
      upperScreenName: "Wallet",
    },
    "Tx.Result": {
      upperScreenName: "Tx",
    },
    "Tx.EvmResult": {
      upperScreenName: "Tx",
    },
    Camera: {
      upperScreenName: "Wallet",
    },
    SessionProposal: {
      upperScreenName: "Wallet",
    },
    "NFT.Details": {
      upperScreenName: "Wallet",
    },
    "NFT.QRCode": {
      upperScreenName: "Wallet",
    },
    "NFT.Send": {
      upperScreenName: "Wallet",
    },
    "NFT.SendConfirm": {
      upperScreenName: "Wallet",
    },
    "NFT.Gallery": {
      upperScreenName: "Wallet",
    },
  }).withParams<{
    NewHome: {
      isRefresh?: boolean;
    };
    "Register.NewMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.VerifyMnemonic": {
      registerConfig: RegisterConfig;
      newMnemonicConfig: NewMnemonicConfig;
      bip44HDPath: BIP44HDPath;
    };
    "Register.SetPincode": {
      walletName?: string;
      isSocialLogin?: boolean;
      registerType?: RegisterType;
      registerConfig: RegisterConfig;
      bip44HDPath: BIP44HDPath;
      mnemonic?: string;
    };
    "Register.SetupBiometrics": {
      registerType?: RegisterType;
      password: string;
    };
    "Register.RecoverMnemonic": {
      registerConfig: RegisterConfig;
    };
    "Register.NewLedger": {
      registerConfig: RegisterConfig;
    };
    "Register.TorusSignIn": {
      registerConfig: RegisterConfig;
      type: "google" | "apple";
    };
    "Register.ImportFromExtension.Intro": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension": {
      registerConfig: RegisterConfig;
    };
    "Register.ImportFromExtension.SetPassword": {
      registerConfig: RegisterConfig;
      exportKeyRingDatas: ExportKeyRingData[];
      addressBooks: { [chainId: string]: AddressBookData[] | undefined };
    };
    "Register.End": {
      registerType?: RegisterType;
      password: string;
    };
    "Register.CreateEntry": {};
    Send: {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
    "Validator.Details": {
      validatorAddress: string;
    };
    "Validator.List": {
      validatorSelector?: (validatorAddress: string) => void;
    };
    Delegate: {
      validatorAddress: string;
    };
    Undelegate: {
      validatorAddress: string;
    };
    Redelegate: {
      validatorAddress: string;
    };
    Unbonding: {
      validatorAddress?: string;
    };
    "Wallet.History": {
      isNavigated?: boolean;
    };
    "Governance Details": {
      proposalId: string;
    };
    "Setting.ViewPrivateData": {
      privateData: string;
      privateDataType: string;
    };
    "Settings.PasswordInput": {
      type: PasswordInputScreenType;
    };
    "Settings.NewPasswordInput": {
      currentPassword: string;
    };
    Setting: {
      floatAlert?: {
        type: "info" | "success" | "warning" | "error";
        content: string;
      };
    };
    AddressBook: {
      recipientConfig?: IRecipientConfig;
      memoConfig?: IMemoConfig;
    };
    AddAddressBook: {
      chainId: string;
      addressBookConfig: AddressBookConfig;
    };
    "Wallet.Send": {
      chainId?: string;
      currency?: string;
      recipient?: string;
    };
    WebView: {
      url?: string;
    };
    "Web.Dapps": {
      name: string;
      uri: string;
    };
    SessionProosal: {
      proposal: SignClientTypes.EventArguments["session_proposal"];
    };
    "NFT.Details": {
      data: NFTData;
    };
    "NFT.QRCode": {
      data: NFTData;
    };
    "NFT.Send": {
      data: NFTData;
    };
    "NFT.SendConfirm": {
      data: NFTData;
      receiver: string;
      fee: CoinPretty;
    };
    "NFT.Gallery": {
      data: NFTData;
    };
  }>()
);

export { useSmartNavigation, SmartNavigatorProvider };
