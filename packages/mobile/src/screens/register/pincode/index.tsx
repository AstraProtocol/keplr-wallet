import { BIP44HDPath } from "@keplr-wallet/background";
import { RegisterConfig } from "@keplr-wallet/hooks";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MIN_PASSWORD_LENGTH } from "../../../common/utils";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { Button } from "../../../components/button";
import { NormalInput } from "../../../components/input/normal-input";
import { useSmartNavigation } from "../../../navigation-util";
import { useToastModal } from "../../../providers/toast-modal";
import { useStore } from "../../../stores";
import { RegisterType } from "../../../stores/user-login";
import { useStyle } from "../../../styles";

export const NewPincodeScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          walletName?: string;
          isSocialLogin?: boolean;
          registerType?: RegisterType;
          registerConfig: RegisterConfig;
          mnemonic?: string;
          bip44HDPath: BIP44HDPath;
        }
      >,
      string
    >
  >();

  const { userLoginStore, keyRingStore } = useStore();
  const style = useStyle();
  const intl = useIntl();

  const toastModal = useToastModal();

  const smartNavigation = useSmartNavigation();

  const {
    walletName = "",
    isSocialLogin = false,
    registerType,
    registerConfig,
    mnemonic,
    bip44HDPath,
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

    let registerMnemonic = mnemonic;
    let registerPassword = confirmPassword;

    // Social Login
    if (isSocialLogin) {
      try {
        await userLoginStore.reconstructSocialLoginData({
          password: confirmPassword,
        });

        registerMnemonic = await userLoginStore.getSeedPhrase();
        registerPassword = await userLoginStore.getPassword();
      } catch (e) {
        console.log(e);
        setPasswordErrorText(
          intl.formatMessage({ id: "common.text.wrongPassword" })
        );
        setIsCreating(false);
        return;
      }
    } else if (!registerMnemonic) {
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
    }

    await registerConfig.createMnemonic(
      name,
      registerMnemonic,
      registerPassword,
      bip44HDPath
    );

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

    // Clear social login data
    if (!isSocialLogin) {
      await userLoginStore.clearLoginData();
    }

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

  useEffect(() => {
    // Social Login
    if (isSocialLogin && registerType !== RegisterType.unknown) {
      toastModal.makeToast({
        title: intl.formatMessage(
          {
            id:
              registerType !== RegisterType.recover
                ? "register.alert.socialLogin.newAccount"
                : "register.alert.socialLogin.existedAccount",
          },
          {
            provider:
              userLoginStore.selectedServiceProviderType?.toString() || "",
          }
        ),
        type: registerType !== RegisterType.recover ? "success" : "infor",
        bottomOffset: 60,
      });
    }
  }, [registerType]);

  const actionButtonTitle =
    registerType === RegisterType.recover
      ? intl.formatMessage({ id: "register.button.restoreAccount" })
      : intl.formatMessage({ id: "register.button.createAccount" });

  function updateNavigationTitle() {
    let textId;
    if (registerType === RegisterType.recover) {
      textId = "register.recoverMnemonic.title";
    } else {
      textId = "register.setPincode.title";
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
        {!isSocialLogin && (
          <NormalInput
            returnKeyType="next"
            autoFocus
            value={name}
            label={intl.formatMessage({ id: "common.text.accountHolder" })}
            onChangeText={setName}
            style={{ marginBottom: 24 }}
            onSubmitEditting={() => {
              passwordInputRef.current.focus();
            }}
            editable={!isCreating}
          />
        )}

        <NormalInput
          returnKeyType="next"
          value={password}
          label={intl.formatMessage({ id: "common.text.password" })}
          error={canVerify ? "" : passwordErrorText}
          info={passwordInfor}
          secureTextEntry={true}
          showPassword={showPassword}
          onShowPasswordChanged={setShowPassword}
          onChangeText={setPassword}
          onBlur={validateInputData}
          style={{ marginBottom: 24, paddingBottom: 24 }}
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
