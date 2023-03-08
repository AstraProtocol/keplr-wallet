/* eslint-disable react/display-name */
import { KeyRingStatus } from "@keplr-wallet/background";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  NavigationContainerRef,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { AppState, AppStateStatus, Text, View } from "react-native";
import { BorderlessButton } from "react-native-gesture-handler";
import {
  GovernanceDetailsScreen,
  GovernanceScreen,
} from "./screens/governance";
import { RegisterIntroScreen } from "./screens/register";
import { RegisterEndScreen } from "./screens/register/end";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterNewUserScreen } from "./screens/register/new-user";
import { RegisterNotNewUserScreen } from "./screens/register/not-new-user";
import { SendScreen } from "./screens/send";
import { SettingChainListScreen } from "./screens/setting/screens/chain-list";
import { SettingsScreen } from "./screens/settings";
import { ViewPrivateDataScreen } from "./screens/settings/screens/view-private-data";
import { WebScreen } from "./screens/web";
import { useStore } from "./stores";
import { useStyle } from "./styles";

import { BlurredBottomTabBar } from "./components/bottom-tabbar";
import {
  BlurredHeaderScreenOptionsPreset,
  HeaderRightButton,
  WalletHeaderScreenOptionsPreset,
} from "./components/header";
import { HeaderAddIcon } from "./components/header/icon";
import {
  ConnectIcon,
  HistoryTabbarIcon,
  HomeTabbarIcon,
  SettingTabbarIcon,
  StakeTabbarIcon,
} from "./components/icon";
import { FocusedScreenProvider } from "./providers/focused-screen";
import { PageScrollPositionProvider } from "./providers/page-scroll-position";
import { CameraScreen } from "./screens/camera";
import { TorusSignInScreen } from "./screens/register/torus";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import {
  DelegateScreen,
  RedelegateScreen,
  StakingDashboardScreen,
  StakingRewardScreen,
  UnbondingScreen,
  UndelegateScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/staking";
import { TokensScreen } from "./screens/tokens";
import {
  TxConfirmationScreen,
  TxEvmResultScreen,
  TxResultScreen,
} from "./screens/tx-result";
import { UnlockScreen } from "./screens/unlock";

import { MainScreen } from "./screens/main";
import {
  NFTDetailsScreen,
  NFTQRCodeScreen,
  NFTSendScreen,
  ReceiveScreen,
  SendConfirmScreen,
  SendTokenScreen,
  SwapScreen,
} from "./screens/main/screens";
import { ManageWalletConnectScreen } from "./screens/manage-wallet-connect";
import {
  ImportFromExtensionIntroScreen,
  ImportFromExtensionScreen,
  ImportFromExtensionSetPasswordScreen,
} from "./screens/register/import-from-extension";
import { NewPincodeScreen } from "./screens/register/pincode";
import { RegisterTutorialcreen } from "./screens/register/tutorial";
import {
  SettingAddTokenScreen,
  SettingManageTokensScreen,
} from "./screens/setting/screens/token";
import {
  NewPasswordInputScreen,
  PasswordInputScreen,
  VersionScreen,
} from "./screens/settings/screens";
import { WebpageScreenScreenOptionsPreset } from "./screens/web/components/webpage-screen";
import { DappsWebpageScreen } from "./screens/web/webpages";

import {
  StackCardInterpolationProps,
  StackCardStyleInterpolator,
} from "@react-navigation/stack";
import { useIntl } from "react-intl";
import { SmartNavigatorProvider } from "./navigation-util";
import { SwapProvider } from "./providers/swap/provider";
import { FAQScreen } from "./screens/faq";
import { HistoryScreen } from "./screens/history";
import { NFTGalleryScreen } from "./screens/main/screens/nft/nft-gallery";
import { NFTSendConfirmScreen } from "./screens/main/screens/nft/nft-send-confirm";
import { SwapConfirmScreen } from "./screens/main/screens/swap-confirm";
import { SetupBiometricsScreen } from "./screens/register/biometrics";
import { RegisterCreateEntryScreen } from "./screens/register/create-entry";
import { SessionProposalScreen } from "./screens/wallet-connect";
import { WebViewScreen } from "./screens/web/default";

export const modalStyleInterpolator: StackCardStyleInterpolator = (
  props: StackCardInterpolationProps
) => {
  const { current, layouts } = props;

  return {
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.75, 1],
      }),
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },

    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
        extrapolate: "clamp",
      }),
    },
  };
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const NewMainNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="NewHome"
      headerMode="screen"
    >
      <Stack.Screen
        name="NewHome"
        component={MainScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const HistoryNavigation: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="History"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "TransactionHistory" }),
        }}
        name="History"
        component={HistoryScreen}
      />
    </Stack.Navigator>
  );
};

export const RegisterNavigation: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Register.Intro"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false,
          title: "",
        }}
        name="Register.Intro"
        component={RegisterIntroScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "CreateNewWallet" }),
        }}
        name="Register.Tutorial"
        component={RegisterTutorialcreen}
      />

      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "CreateNewWallet" }),
        }}
        name="Register.NewUser"
        component={RegisterNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Existing Wallet",
        }}
        name="Register.NotNewUser"
        component={RegisterNotNewUserScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "CreateNewWallet" }),
        }}
        name="Register.NewMnemonic"
        component={NewMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "CreateNewWallet" }),
        }}
        name="Register.VerifyMnemonic"
        component={VerifyMnemonicScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "RecoverWallet" }),
        }}
        name="Register.RecoverMnemonic"
        component={RecoverMnemonicScreen}
      />
      <Stack.Screen name="Register.TorusSignIn" component={TorusSignInScreen} />
      <Stack.Screen
        options={{
          // Only show the back button.
          title: "",
        }}
        name="Register.ImportFromExtension.Intro"
        component={ImportFromExtensionIntroScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Register.ImportFromExtension"
        component={ImportFromExtensionScreen}
      />
      <Stack.Screen
        options={{
          title: "Import Extension",
        }}
        name="Register.ImportFromExtension.SetPassword"
        component={ImportFromExtensionSetPasswordScreen}
      />
      <Stack.Screen name="Register.End" component={RegisterEndScreen} />
      <Stack.Screen name="Register.SetPincode" component={NewPincodeScreen} />
      <Stack.Screen
        name="Register.SetupBiometrics"
        component={SetupBiometricsScreen}
      />
      <Stack.Screen
        name="Register.CreateEntry"
        component={RegisterCreateEntryScreen}
      />
    </Stack.Navigator>
  );
};

export const TxNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      headerMode="screen"
      initialRouteName="Tx.Confirmation"
    >
      <Stack.Screen
        name="Tx.Confirmation"
        component={TxConfirmationScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Tx.EvmResult"
        component={TxEvmResultScreen}
        options={{
          cardShadowEnabled: true,
          cardOverlayEnabled: true,
          headerShown: false,
          cardStyle: { backgroundColor: "transparent" },
          cardStyleInterpolator: modalStyleInterpolator,
        }}
      />
    </Stack.Navigator>
  );
};

export const TransactionNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      headerMode="screen"
      initialRouteName="Tx.Result"
    >
      <Stack.Screen
        name="Tx.Result"
        component={TxResultScreen}
        options={{
          cardShadowEnabled: true,
          cardOverlayEnabled: true,
          headerShown: false,
          cardStyle: { backgroundColor: "transparent" },
          cardStyleInterpolator: modalStyleInterpolator,
        }}
      />
    </Stack.Navigator>
  );
};

export const StakingNavigation: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Staking.Dashboard"
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Staking.Dashboard"
        component={StakingDashboardScreen}
      />
    </Stack.Navigator>
  );
};

export const OtherNavigation: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
      <Stack.Screen
        options={{
          title: "Send",
        }}
        name="Send"
        component={SendScreen}
      />
      <Stack.Screen
        options={{
          title: "Tokens",
        }}
        name="Tokens"
        component={TokensScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "connectedApps.title" }),
        }}
        name="ManageWalletConnect"
        component={ManageWalletConnectScreen}
      />
      <Stack.Screen
        options={{
          title: "Governance",
        }}
        name="Governance"
        component={GovernanceScreen}
      />
      <Stack.Screen
        options={{
          title: "Proposal",
        }}
        name="Governance Details"
        component={GovernanceDetailsScreen}
      />
    </Stack.Navigator>
  );
};

export const WalletNavigation: FunctionComponent = () => {
  const navigation = useNavigation();
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.receive.title" }),
        }}
        name="Receive"
        component={ReceiveScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.send.title" }),
        }}
        name="Wallet.Send"
        component={SendTokenScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "wallet.sendConfirm.title" }),
        }}
        name="Wallet.SendConfirm"
        component={SendConfirmScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "Swap" }),
        }}
        name="Swap"
        component={SwapScreen}
      />
      <Stack.Screen
        options={{
          title: "",
        }}
        name="Setting.ViewPrivateData"
        component={ViewPrivateDataScreen}
      />

      <Stack.Screen
        options={{
          title: "",
        }}
        name="Settings.PasswordInput"
        component={PasswordInputScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "ChangePassword" }),
        }}
        name="Settings.NewPasswordInput"
        component={NewPasswordInputScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "Version" }),
        }}
        name="Settings.Version"
        component={VersionScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Validator.Details"
        component={ValidatorDetailsScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Validator.List"
        component={ValidatorListScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "ClaimRewards" }),
        }}
        name="Staking.Rewards"
        component={StakingRewardScreen}
      />
      <Stack.Screen name="Delegate" component={DelegateScreen} />
      <Stack.Screen name="Undelegate" component={UndelegateScreen} />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "RedelegateStakingProvider" }),
        }}
        name="Redelegate"
        component={RedelegateScreen}
      />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Unbonding"
        component={UnbondingScreen}
      />
      <Stack.Screen
        options={{
          title: intl.formatMessage({ id: "TransactionHistory" }),
        }}
        name="Wallet.History"
        component={HistoryScreen}
      />
      <Stack.Screen
        name="WebView"
        options={{
          title: "",
        }}
        component={WebViewScreen}
      />
      <Stack.Screen
        name="Camera"
        options={{
          headerShown: false,
        }}
        component={CameraScreen}
      />
      <Stack.Screen
        name="FAQ"
        options={{
          headerShown: false,
        }}
        component={FAQScreen}
      />
      <Stack.Screen
        name="SessionProposal"
        options={{
          title: "",
        }}
        component={SessionProposalScreen}
      />
      <Stack.Screen
        options={{
          title: "Add Token",
        }}
        name="Setting.AddToken"
        component={SettingAddTokenScreen}
      />
      <Stack.Screen
        options={{
          title: "Manage Tokens",
          headerRight: () => (
            <HeaderRightButton
              onPress={() => {
                navigation.navigate("Setting.AddToken");
              }}
            >
              <HeaderAddIcon />
            </HeaderRightButton>
          ),
        }}
        name="Setting.ManageTokens"
        component={SettingManageTokensScreen}
      />
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
        name="NFT.Details"
        component={NFTDetailsScreen}
      />
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
        name="NFT.Send"
        component={NFTSendScreen}
      />
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
        name="NFT.SendConfirm"
        component={NFTSendConfirmScreen}
      />
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
        name="NFT.QRCode"
        component={NFTQRCodeScreen}
      />
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
        name="NFT.Gallery"
        component={NFTGalleryScreen}
      />
    </Stack.Navigator>
  );
};

export const SettingsStackScreen: FunctionComponent = () => {
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Setting"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
};

export const SwapStackScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const screenOptions = {
    ...WalletHeaderScreenOptionsPreset,
    headerStyle: style.flatten(["background-color-background"]),
    headerTitleStyle: style.flatten(["color-white", "text-large-bold"]),
  };

  return (
    <SwapProvider>
      <Stack.Navigator screenOptions={screenOptions} headerMode="screen">
        <Stack.Screen
          options={{
            title: intl.formatMessage({ id: "Swap" }),
          }}
          name="Swap.Home"
          component={SwapScreen}
        />
        <Stack.Screen
          options={{
            title: intl.formatMessage({ id: "wallet.swapConfirm.title" }),
          }}
          name="Swap.Confirm"
          component={SwapConfirmScreen}
        />
      </Stack.Navigator>
    </SwapProvider>
  );
};

export const AddressBookStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Address Book",
        }}
        name="AddressBook"
        component={AddressBookScreen}
      />
      <Stack.Screen
        options={{
          title: "New Address Book",
        }}
        name="AddAddressBook"
        component={AddAddressBookScreen}
      />
    </Stack.Navigator>
  );
};

export const ChainListStackScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        ...BlurredHeaderScreenOptionsPreset,
        headerTitleStyle: style.flatten(["h5", "color-text-black-high"]),
      }}
      headerMode="screen"
    >
      <Stack.Screen
        options={{
          title: "Chain List",
        }}
        name="Setting.ChainList"
        component={SettingChainListScreen}
      />
    </Stack.Navigator>
  );
};

export const WebNavigation: FunctionComponent = () => {
  return (
    <Stack.Navigator
      initialRouteName="Web.Intro"
      screenOptions={{
        ...WebpageScreenScreenOptionsPreset,
      }}
      headerMode="screen"
    >
      <Stack.Screen name="Web.Intro" component={WebScreen} />
      <Stack.Screen name="Web.Dapps" component={DappsWebpageScreen} />
    </Stack.Navigator>
  );
};

export const MainTabNavigation: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const {
    remoteConfigStore,
    keyRingStore,
    linkStore,
    signClientStore,
  } = useStore();

  const dappsEnabled = remoteConfigStore.getBool("feature_dapps_enabled");
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      console.log(
        `App has change from ${appState.current} to the ${nextAppState}!, status: `,
        keyRingStore.status
      );

      if (
        linkStore.canLock &&
        nextAppState === "background" &&
        keyRingStore.status === KeyRingStatus.UNLOCKED
      ) {
        // Wait the account of selected chain is loaded.
        await keyRingStore.lock();
        await signClientStore.close();
        navigation.dispatch(StackActions.replace("Unlock"));
      }
    },
    [keyRingStore, linkStore.canLock, signClientStore, navigation]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const color = style.get(
            `color-tab-icon-${focused ? "active" : "inactive"}`
          ).color;
          const size = 24;

          switch (route.name) {
            case "NewMain":
              return <HomeTabbarIcon size={size} color={color} />;
            case "D-apps":
              return <ConnectIcon size={size} color={color} />;
            case "History":
              return <HistoryTabbarIcon size={size} color={color} />;
            case "Setting":
              return <SettingTabbarIcon size={size} color={color} />;
            case "Stake":
              return <StakeTabbarIcon size={size} color={color} />;
          }
        },
        tabBarLabel: ({ focused }) => {
          let name = "";
          switch (route.name) {
            case "NewMain":
              name = intl.formatMessage({ id: "Assets" });
              break;
            case "Stake":
              name = intl.formatMessage({ id: "Staking" });
              break;
            case "D-apps":
              name = intl.formatMessage({ id: "Dapps" });
              break;
            case "History":
              name = intl.formatMessage({ id: "History" });
              break;
            case "Setting":
              name = intl.formatMessage({ id: "Settings" });
              break;
          }
          return (
            <Text
              style={style.flatten([
                "text-x-small-medium",
                "text-center",
                `color-tab-text-${focused ? "active" : "inactive"}` as any,
              ])}
            >
              {name}
            </Text>
          );
        },
        tabBarButton: (props) => (
          <View
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderTopWidth: 2,
              borderColor:
                props.accessibilityState?.selected === true
                  ? style.get("color-tab-icon-active").color
                  : "transparent",
            }}
          >
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <BorderlessButton
              {...props}
              activeOpacity={1}
              style={{
                height: "100%",
                aspectRatio: 1.9,
                maxWidth: "100%",
              }}
            />
          </View>
        ),
      })}
      tabBarOptions={{
        style: {
          borderTopWidth: 1,
          borderTopColor: style.get("color-border").color,
          shadowColor: style.get("color-transparent").color,
          elevation: 0,
        },
        showLabel: true,
      }}
      tabBar={(props) => (
        <BlurredBottomTabBar {...props} enabledScreens={["Home"]} />
      )}
    >
      <Tab.Screen
        name="NewMain"
        component={NewMainNavigation}
        // options={{
        //   unmountOnBlur: true,
        // }}
      />
      <Tab.Screen name="Stake" component={StakingNavigation} />
      {dappsEnabled && <Tab.Screen name="D-apps" component={WebNavigation} />}
      <Tab.Screen
        name="History"
        component={HistoryNavigation}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen name="Setting" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigation: FunctionComponent = observer(() => {
  const {
    keyRingStore,
    analyticsStore,
    signInteractionStore,
    transactionStore,
  } = useStore();

  const navigationRef = useRef<NavigationContainerRef | null>(null);
  const routeNameRef = useRef<string | null>(null);

  const linking = {
    prefixes: ["astrawallet://"],
    config: {
      screens: {
        MainTabNavigation: {
          screens: {
            History: "/internal-history",
            Setting: "/internal-setting",
            Stake: "/internal-stake",
          },
        },
      },
    },
  };

  useEffect(() => {
    if (signInteractionStore.waitingData) {
      console.log("__navigationRef.current__", navigationRef.current);
      console.log(
        "__navigationRef.current__route",
        navigationRef.current?.getCurrentRoute()
      );
      transactionStore.updateTxState("pending");

      navigationRef.current?.navigate("Transaction", {
        screen: "Tx.Result",
        params: {
          txState: "pending",
        },
      });
    }
  }, [signInteractionStore.waitingData, transactionStore]);

  return (
    <PageScrollPositionProvider>
      <FocusedScreenProvider>
        <SmartNavigatorProvider>
          <NavigationContainer
            linking={
              keyRingStore.status === KeyRingStatus.UNLOCKED
                ? linking
                : undefined
            }
            ref={navigationRef}
            onReady={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                routeNameRef.current = routerName.name;
                analyticsStore.logPageView(routerName.name);
              }
            }}
            onStateChange={() => {
              const routerName = navigationRef.current?.getCurrentRoute();
              if (routerName) {
                const previousRouteName = routeNameRef.current;
                const currentRouteName = routerName.name;
                if (previousRouteName !== currentRouteName) {
                  analyticsStore.logPageView(currentRouteName);
                }
                routeNameRef.current = currentRouteName;
              }
            }}
          >
            <Stack.Navigator
              initialRouteName={
                keyRingStore.status !== KeyRingStatus.UNLOCKED
                  ? "Unlock"
                  : "MainTabNavigation"
              }
              screenOptions={{
                headerShown: false,
                ...TransitionPresets.SlideFromRightIOS,
              }}
              headerMode="screen"
            >
              <Stack.Screen name="Unlock" component={UnlockScreen} />
              <Stack.Screen
                name="MainTabNavigation"
                component={MainTabNavigation}
              />
              <Stack.Screen name="Register" component={RegisterNavigation} />
              <Stack.Screen name="Others" component={OtherNavigation} />
              <Stack.Screen name="Wallet" component={WalletNavigation} />
              <Stack.Screen name="Tx" component={TxNavigation} />
              <Stack.Screen
                name="Transaction"
                component={TransactionNavigation}
                options={{
                  cardShadowEnabled: true,
                  cardOverlayEnabled: true,
                  headerShown: false,
                  cardStyle: { backgroundColor: "transparent" },
                  cardStyleInterpolator: modalStyleInterpolator,
                }}
              />
              <Stack.Screen name="Swap" component={SwapStackScreen} />
              <Stack.Screen
                name="AddressBooks"
                component={AddressBookStackScreen}
              />
              <Stack.Screen name="ChainList" component={ChainListStackScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          {/* <ModalsRenderer /> */}
        </SmartNavigatorProvider>
      </FocusedScreenProvider>
    </PageScrollPositionProvider>
  );
});
