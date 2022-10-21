import { useRegisterConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Platform, SafeAreaView, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { AllIcon, PageWithView } from "../../../components";
import { InfoIcon } from "../../../components/icon/outlined";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { useBIP44Option } from "../bip44";
import { AppleIcon, GoogleIcon, MnemonicIcon } from "./icons";

export const RegisterCreateEntryScreen: FunctionComponent = observer(() => {
  const { keyRingStore, userLoginStore } = useStore();
  const style = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();
  const registerConfig = useRegisterConfig(keyRingStore, []);
  const bip44Option = useBIP44Option();

  async function registerWithGoogle() {
    await userLoginStore.openLogin({
      serviceProviderType: "google",
    });

    smartNavigation.pushSmart("Register.SetPincode", {
      walletName: userLoginStore.socialLoginData?.email,
      isSocialLogin: true,
      registerType: userLoginStore.registerType,
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  }

  async function registerWithApple() {
    await userLoginStore.openLogin({
      serviceProviderType: "apple",
    });

    smartNavigation.pushSmart("Register.SetPincode", {
      walletName: userLoginStore.socialLoginData?.email,
      isSocialLogin: true,
      registerType: userLoginStore.registerType,
      registerConfig,
      bip44HDPath: bip44Option.bip44HDPath,
    });
  }

  function registerWithMnemonic() {
    smartNavigation.navigateSmart("Register.Tutorial", {});
  }

  function showConvenientInfo() {}

  function showSafeInfo() {}

  return (
    <PageWithView
      disableSafeArea={true}
      style={style.flatten([
        "background-color-background",
        "height-full",
        "padding-16",
      ])}
    >
      <SafeAreaView>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-gray-10",
              "margin-right-8",
            ])}
          >
            {intl.formatMessage({
              id: "register.createEntry.section.convenient",
            })}
          </Text>
          <RectButton onPress={showConvenientInfo}>
            <InfoIcon />
          </RectButton>
        </View>
        <EntryItem
          iconType="google"
          title={intl.formatMessage({
            id: "register.createEntry.item.title.google",
          })}
          onPress={registerWithGoogle}
        />
        {/* {Platform.OS === "ios" && (
          <EntryItem
            iconType="apple"
            title={intl.formatMessage({
              id: "register.createEntry.item.title.apple",
            })}
            onPress={registerWithApple}
          />
        )} */}
        <View style={{ height: 16 }} />
        <View style={{ flexDirection: "row" }}>
          <Text
            style={style.flatten([
              "text-medium-semi-bold",
              "color-gray-10",
              "margin-right-8",
            ])}
          >
            {intl.formatMessage({ id: "register.createEntry.section.safe" })}
          </Text>
          <RectButton onPress={showSafeInfo}>
            <InfoIcon />
          </RectButton>
        </View>
        <EntryItem
          iconType="mnemonic"
          title={intl.formatMessage({
            id: "register.createEntry.item.title.mnemonic",
          })}
          subTitle={intl.formatMessage({
            id: "register.createEntry.item.desc.mnemonic",
          })}
          onPress={registerWithMnemonic}
        />
      </SafeAreaView>
    </PageWithView>
  );
});

export type EntryItemIconType = "google" | "apple" | "mnemonic";

export const EntryItem: FunctionComponent<{
  iconType: EntryItemIconType;
  title: string;
  subTitle?: string;
  onPress?: () => void;
}> = observer(({ iconType, title, subTitle, onPress }) => {
  const styleBuilder = useStyle();

  let Icon;
  switch (iconType) {
    case "google":
      Icon = GoogleIcon;
      break;
    case "apple":
      Icon = AppleIcon;
      break;
    default:
      Icon = MnemonicIcon;
      break;
  }

  return (
    <RectButton
      onPress={onPress}
      style={{
        marginVertical: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: styleBuilder.get("color-card-background").color,
        flexDirection: "row",
        alignContent: "stretch",
        alignItems: "center",
      }}
      activeOpacity={0}
    >
      <Icon />
      <View style={{ flex: 1, marginHorizontal: 12, alignItems: "stretch" }}>
        <Text
          style={styleBuilder.flatten(["text-base-medium", "color-gray-10"])}
        >
          {title}
        </Text>
        {subTitle && (
          <Text
            style={styleBuilder.flatten([
              "text-small-regular",
              "color-gray-30",
              "margin-top-4",
            ])}
          >
            {subTitle}
          </Text>
        )}
      </View>
      <AllIcon color={styleBuilder.get("color-white").color} />
    </RectButton>
  );
});
