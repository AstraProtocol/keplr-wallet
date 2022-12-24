import { Staking } from "@keplr-wallet/stores";
import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../../components";
import { CardDivider } from "../../../components/card";
import { CloseLargeIcon } from "../../../components/icon/outlined";
import { registerModal } from "../../../modals/base";
import { useStyle } from "../../../styles";
import { StakingValidatorItem } from "../component";
import { useStaking } from "../hook/use-staking";

export const ValidatorsBottomSheet: FunctionComponent<{
  label: string;
  isOpen: boolean;
  close: () => void;
  maxItemsToShow?: number;
  selectedValidator: Staking.Validator | undefined;
  setSelectedValidator: (validator: Staking.Validator | undefined) => void;
  modalPersistent?: boolean;
  currentValidator: string;
}> = registerModal(
  ({
    label,
    close,
    selectedValidator,
    setSelectedValidator,
    maxItemsToShow,
    modalPersistent,
    currentValidator: currentValidatorAddress,
  }) => {
    const { getValidators } = useStaking();

    const style = useStyle();
    const intl = useIntl();
    const safeAreaInsets = useSafeAreaInsets();

    const validators = getValidators("BOND_STATUS_BONDED");

    const [toValidator, setToValidator] = useState(selectedValidator);

    const data = useMemo(() => {
      return validators.filter((validator) => {
        return validator.operator_address !== currentValidatorAddress;
      });
    }, [validators, currentValidatorAddress]);

    const scrollViewRef = useRef<ScrollView | null>(null);
    const initOnce = useRef<boolean>(false);

    const onInit = () => {
      if (!initOnce.current) {
        if (scrollViewRef.current) {
          scrollViewRef.current.flashScrollIndicators();

          if (maxItemsToShow) {
            const selectedIndex = data.findIndex(
              (val) => val.operator_address === toValidator?.operator_address
            );

            if (selectedIndex) {
              const scrollViewHeight = maxItemsToShow * 64 + 72;

              scrollViewRef.current.scrollTo({
                y: selectedIndex * 64 - scrollViewHeight / 2 + 32,
                animated: false,
              });
            }
          }

          initOnce.current = true;
        }
      }
    };

    const onContinueHandler = async () => {
      setSelectedValidator(toValidator);
      if (!modalPersistent) {
        close();
      }
    };

    return (
      <View style={style.flatten(["padding-0"])}>
        <View
          style={style.flatten([
            "background-color-gray-10",
            "width-48",
            "height-6",
            "margin-bottom-12",
            "self-center",
            "border-radius-16",
          ])}
        />
        <View
          style={style.flatten([
            "border-radius-16",
            "overflow-hidden",
            "background-color-gray-90",
          ])}
        >
          <View
            style={style.flatten([
              "flex-row",
              "items-center",
              "height-40",
              "margin-top-8",
            ])}
          >
            <View
              style={style.flatten(["margin-x-16", "height-24", "width-24"])}
            />
            <Text
              style={style.flatten([
                "flex-1",
                "text-medium-bold",
                "color-label-text-1",
                "text-center",
              ])}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={close}
              style={style.flatten(["margin-x-16"])}
            >
              <CloseLargeIcon color={style.get("color-white").color} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{
              maxHeight: maxItemsToShow ? 64 * maxItemsToShow : undefined,
            }}
            ref={scrollViewRef}
            persistentScrollbar={true}
            onLayout={onInit}
          >
            {data.map((validator, index) => {
              return (
                <View key={index}>
                  <RectButton
                    key={validator.operator_address}
                    style={style.flatten(["flex-row"])}
                    onPress={() => {
                      setToValidator(validator);
                    }}
                  >
                    <StakingValidatorItem
                      containerStyle={style.flatten([
                        "flex-1",
                        "margin-top-0",
                        "margin-x-0",
                        "background-color-transparent",
                      ])}
                      validator={validator}
                      hasStake={false}
                    />
                    <RadioItem
                      selected={
                        validator.operator_address ===
                        toValidator?.operator_address
                      }
                      containerStyle={style.flatten(["margin-16"])}
                    />
                  </RectButton>
                  <CardDivider
                    style={style.flatten([
                      "background-color-card-separator",
                      "margin-bottom-0",
                      "margin-x-16",
                    ])}
                  />
                </View>
              );
            })}
          </ScrollView>
          <Button
            text={intl.formatMessage({ id: "common.text.confirm" })}
            disabled={!toValidator}
            onPress={onContinueHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
          <View style={{ height: 12 + safeAreaInsets.bottom }} />
        </View>
      </View>
    );
  },
  {
    disableSafeArea: true,
  }
);

const RadioItem: FunctionComponent<{
  selected?: boolean;
  containerStyle?: ViewStyle;
}> = ({ selected = false, containerStyle }) => {
  const style = useStyle();

  return (
    <View style={containerStyle}>
      <View
        style={style.flatten(
          [
            "width-20",
            "height-20",
            "items-center",
            "justify-center",
            "margin-2",
            "border-width-1",
            "border-radius-12",
            "background-color-gray-100",
          ],
          [selected ? "border-color-primary" : "border-color-border"]
        )}
      >
        <View
          style={style.flatten(
            ["width-12", "height-12", "border-radius-6"],
            [
              selected
                ? "background-color-primary"
                : "background-color-gray-100",
            ]
          )}
        />
      </View>
    </View>
  );
};
