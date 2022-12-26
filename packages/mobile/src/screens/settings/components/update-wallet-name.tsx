import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import { Button } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { NormalInput } from "../../../components/input/normal-input";
import { registerModal } from "../../../modals/base";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const UpdateWalletNameModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title: string;
  value?: string;
}> = registerModal(({ close, value = "" }) => {
  const style = useStyle();
  const intl = useIntl();
  const { keyRingStore } = useStore();

  const [name, setName] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  async function updateName() {
    setIsLoading(true);
    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore) => {
      return keyStore.selected;
    });
    await keyRingStore.updateNameKeyRing(index, name);
    setIsLoading(false);
    Keyboard.dismiss();
    close();
  }

  return (
    <View style={style.flatten(["height-full", "justify-center"])}>
      <View
        style={style.flatten([
          "margin-x-page",
          "content-stretch",
          "items-stretch",
          "background-color-card-background",
          "border-color-card-border",
          "border-width-1",
          "border-radius-8",
        ])}
      >
        <Text
          style={style.flatten([
            "text-center",
            "text-large-semi-bold",
            "color-label-text-1",
            "margin-x-16",
            "margin-y-16",
          ])}
        >
          {intl.formatMessage({ id: "common.text.updateWalletName" })}
        </Text>
        <NormalInput
          value={name}
          onChangeText={setName}
          style={{
            marginHorizontal: 16,
          }}
          autoFocus
          editable={!isLoading}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "stretch",
            alignItems: "center",
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          <Button
            color="neutral"
            mode="outline"
            text={intl.formatMessage({ id: "Cancel" })}
            onPress={() => {
              Keyboard.dismiss();
              close();
            }}
            containerStyle={style.flatten(["flex-1"])}
          />
          <Button
            text={intl.formatMessage({ id: "Save" })}
            onPress={updateName}
            disabled={name.length == 0}
            loading={isLoading}
            containerStyle={style.flatten(["flex-1", "margin-left-8"])}
          />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});
