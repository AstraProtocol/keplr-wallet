import { RegisterConfig } from "@keplr-wallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MIN_PASSWORD_LENGTH } from "../../../common/utils";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import { NormalInput } from "../../../components/input/normal-input";
import { useSocialLogin } from "../../../hooks/use-social-login";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { RegisterType } from "../../../stores/user-login";
import { useStyle } from "../../../styles";
import { useBIP44Option } from "../bip44";
import { AppleIcon, GoogleIcon } from "../create-entry/icons";

export const NewPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          walletName?: string;
          registerType?: RegisterType;
          registerConfig: RegisterConfig;
          mnemonic?: string;
          privateKey?: Uint8Array;
          metadata?: Record<string, string>;
        }
      >,
      string
    >
  >();

  const { userLoginStore, keyRingStore, signClientStore } = useStore();
  const { SUPPORTED_LOGIN_PROVIDER } = useSocialLogin();
  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();
  const bip44Option = useBIP44Option();

  const {
    walletName = "",
    registerType,
    registerConfig,
    mnemonic,
    privateKey,
    metadata,
  } = route.params;

  const [name, setName] = useState(walletName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inputDataValid, setInputDataValid] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");

  const [canVerify, setCanVerify] = useState(false);

  const passwordInputRef = useRef<any>();
  const confirmPasswordInputRef = useRef<any>();
  const passwordInfor = intl.formatMessage(
    { id: "common.text.minimumCharacters" },
    { number: `${MIN_PASSWORD_LENGTH}` }
  );
  const onCreate = async () => {
    setIsCreating(true);

    const registerMnemonic = mnemonic;
    const registerPrivateKey = privateKey;
    const registerPassword = confirmPassword;

    // Social Login
    if (!registerMnemonic && !registerPrivateKey) {
      setIsCreating(false);
      return;
    }

    userLoginStore.updateRegisterType(
      registerType === RegisterType.recover
        ? RegisterType.recover
        : RegisterType.new
    );

    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore: any) => {
      return keyStore.selected;
    });
    if (index !== -1) {
      await keyRingStore.forceDeleteKeyRing(index);
      await signClientStore.clear();
    }

    console.log("__NAME__", name);
    if (registerMnemonic) {
      await registerConfig.createMnemonic(
        name,
        registerMnemonic,
        registerPassword,
        bip44Option.bip44HDPath,
        metadata
      );
    } else if (registerPrivateKey) {
      await registerConfig.createPrivateKey(
        name,
        registerPrivateKey,
        registerPassword,
        metadata
      );
    }

    try {
      // Definetly, the last key is newest keyring.
      if (keyRingStore.multiKeyStoreInfo.length > 0) {
        await keyRingStore.changeKeyRing(
          keyRingStore.multiKeyStoreInfo.length - 1
        );
      }
    } catch (e: any) {
      console.log(e);
    }

    userLoginStore.updateRegisterType(RegisterType.unknown);

    smartNavigation.reset({
      index: 0,
      routes: [
        {
          name: "Register.End",
          params: {
            registerType: registerType,
            password: confirmPassword,
          },
        },
      ],
    });
  };

  useEffect(() => {
    updateNavigationTitle();
  });

  useEffect(() => {
    if (password.length > 0 && confirmPassword.length > 0) {
      setCanVerify(true);
    } else {
      setCanVerify(false);
    }
    validateInputData();
  }, [name, password, confirmPassword]);

  const actionButtonTitle =
    registerType === RegisterType.recover
      ? intl.formatMessage({ id: "RecoverWallet" })
      : intl.formatMessage({ id: "CreateNewWallet" });

  function updateNavigationTitle() {
    let textId;
    if (registerType === RegisterType.recover) {
      textId = "RecoverWallet";
    } else {
      textId = "CreateNewWallet";
    }

    smartNavigation.setOptions({
      title: intl.formatMessage({ id: textId }),
    });
  }

  const onSubmitEditing = async () => {
    Keyboard.dismiss();

    await validateInputData();
    setCanVerify(inputDataValid);
    showErrors();
    if (inputDataValid) {
      console.log("__start on create__");
      await onCreate();
    }
  };

  const validateInputData = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setInputDataValid(false);
      return;
    }
    if (confirmPassword.length === 0 || confirmPassword !== password) {
      setInputDataValid(false);
      return;
    }
    setInputDataValid(true);
  };

  const showErrors = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordErrorText(passwordInfor);
      setConfirmPasswordErrorText("");
      passwordInputRef.current.focus();
      return;
    }
    setPasswordErrorText("");
    if (confirmPassword.length === 0 || confirmPassword !== password) {
      setConfirmPasswordErrorText(
        intl.formatMessage({ id: "common.text.passwordNotMatching" })
      );
      confirmPasswordInputRef.current.focus();
      return;
    }
    setConfirmPasswordErrorText("");
  };

  const getSocialLoginView = () => {
    let icon: React.ReactNode;
    switch (metadata?.loginProvider) {
      case SUPPORTED_LOGIN_PROVIDER.GOOGLE:
        icon = <GoogleIcon size={24} />;
        break;
      case SUPPORTED_LOGIN_PROVIDER.APPLE:
        icon = <AppleIcon size={24} />;
        break;
      default:
        return;
    }

    return (
      <View style={style.flatten(["flex-row", "margin-top-8", "items-center"])}>
        {icon}
        <Text
          style={style.flatten([
            "text-base-regular",
            "color-label-text-1",
            "margin-left-8",
          ])}
        >
          {metadata?.email}
        </Text>
      </View>
    );
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <KeyboardAwareScrollView
        contentContainerStyle={style.flatten([
          "flex-grow-1",
          "padding-x-page",
          "padding-top-24",
        ])}
        enableOnAndroid
      >
        <NormalInput
          returnKeyType="next"
          autoFocus={walletName.length == 0}
          value={name}
          label={intl.formatMessage({ id: "WalletName" })}
          onChangeText={setName}
          // style={{ marginBottom: 24 }}
          onSubmitEditting={() => {
            passwordInputRef.current.focus();
          }}
          editable={!isCreating}
        />
        {getSocialLoginView()}

        <NormalInput
          returnKeyType="next"
          autoFocus={walletName.length != 0}
          value={password}
          label={intl.formatMessage({ id: "Password" })}
          error={canVerify ? "" : passwordErrorText}
          info={passwordInfor}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setPassword}
          onBlur={validateInputData}
          style={{ marginTop: 24, marginBottom: 24, paddingBottom: 24 }}
          inputRef={passwordInputRef}
          onSubmitEditting={() => {
            confirmPasswordInputRef.current.focus();
          }}
          editable={!isCreating}
        />

        <NormalInput
          returnKeyType="done"
          value={confirmPassword}
          label={intl.formatMessage({ id: "common.text.inputVerifyPassword" })}
          error={canVerify ? "" : confirmPasswordErrorText}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setConfirmPassword}
          onBlur={validateInputData}
          validations={[
            {
              validateFunc: (value: string) => {
                return value.length == 0 || value === password;
              },
              error: intl.formatMessage({
                id: "common.text.passwordNotMatching",
              }),
            },
          ]}
          style={{
            marginBottom: confirmPasswordErrorText.length !== 0 ? 12 : 0,
            paddingBottom: 24,
          }}
          inputRef={confirmPasswordInputRef}
          onSubmitEditting={onSubmitEditing}
          editable={!isCreating}
        />
      </KeyboardAwareScrollView>
      <View style={style.flatten(["flex-1", "justify-end", "margin-bottom-0"])}>
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 68,
          }}
        >
          <Button
            text={actionButtonTitle}
            loading={isCreating}
            onPress={onSubmitEditing}
            disabled={!canVerify || isCreating}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
