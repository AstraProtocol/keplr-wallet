import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../../components";
import { AvoidingKeyboardBottomView } from "../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { CloseLargeIcon } from "../../../components/icon/outlined/navigation";
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
  const styleBuilder = useStyle();
  const intl = useIntl();
  const { keyRingStore } = useStore();

  const [name, setName] = useState(value);

  async function updateName() {
    const index = keyRingStore.multiKeyStoreInfo.findIndex((keyStore) => {
      return keyStore.selected;
    });
    await keyRingStore.updateNameKeyRing(index, name);
    Keyboard.dismiss();
    close();
  }

  return (
    <View style={styleBuilder.flatten(["height-full", "justify-center"])}>
      <View
        style={styleBuilder.flatten([
          "margin-x-page",
          "content-stretch",
          "items-stretch",
          "background-color-card-background",
          "border-color-card-border",
          "border-width-1",
          "border-radius-8",
        ])}
      >
        <View
          style={{
            flexDirection: "row",
            alignContent: "stretch",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              ...styleBuilder.flatten([
                "flex-1",
                "text-medium-medium",
                "color-label-text-1",
                "margin-left-16",
              ]),
              marginVertical: 12,
            }}
          >
            {intl.formatMessage({ id: "common.text.updateWalletName" })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              close();
            }}
            style={{ marginRight: 12 }}
          >
            <CloseLargeIcon />
          </TouchableOpacity>
        </View>
        <View
          style={styleBuilder.flatten(["height-1", "background-color-border"])}
        />
        <NormalInput
          value={name}
          onChangeText={setName}
          style={{
            marginHorizontal: 16,
            marginVertical: 12,
          }}
          autoFocus
        />
        <View
          style={styleBuilder.flatten(["height-1", "background-color-border"])}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "stretch",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Button
            color="neutral"
            mode="outline"
            text={intl.formatMessage({ id: "common.text.cancel" })}
            onPress={() => {
              Keyboard.dismiss();
              close();
            }}
            containerStyle={{ flex: 1 }}
          />
          <Button
            text={intl.formatMessage({ id: "common.text.save" })}
            onPress={updateName}
            disabled={name.length == 0}
            containerStyle={{
              flex: 1,
              marginLeft: 8,
            }}
          />
        </View>
      </View>
      <AvoidingKeyboardBottomView />
    </View>
  );
});