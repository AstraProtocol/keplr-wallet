import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { BottomArrowIcon } from "../../../components";
import { useStyle } from "../../../styles";
import { StakingValidatorItem } from "../component";
import { ValidatorsBottomSheet } from "./validator-list-bottom-sheet";

export const SelectValidatorItem: FunctionComponent<{
  currentValidator: string;
  onSelectedValidator: (address: string) => void;
}> = observer(({ currentValidator, onSelectedValidator }) => {
  const style = useStyle();
  const intl = useIntl();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const [validator, setValidator] = useState<Staking.Validator | undefined>(
    undefined
  );

  const setSelectedValidator = (validator: Staking.Validator | undefined) => {
    if (validator) {
      setValidator(validator);
      onSelectedValidator(validator.operator_address);
    }
  };

  return (
    <React.Fragment>
      <ValidatorsBottomSheet
        label={intl.formatMessage({ id: "StakingProviders" })}
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={8}
        selectedValidator={validator}
        setSelectedValidator={setSelectedValidator}
        currentValidator={currentValidator}
      />
      <RectButton
        activeOpacity={1}
        onPress={() => {
          setIsOpenModal(true);
        }}
        style={style.flatten(["border-radius-12"])}
      >
        <View
          style={style.flatten([
            "flex-row",
            "background-color-card-background",
            "border-radius-12",
          ])}
        >
          {validator ? (
            <StakingValidatorItem
              containerStyle={style.flatten([
                "flex-1",
                "margin-top-0",
                "margin-x-0",
                "background-color-transparent",
              ])}
              labelStyle={style.flatten(["margin-right-32"])}
              validator={validator}
              hasStake={false}
              hideTotalShares={true}
            />
          ) : (
            <View style={style.flatten(["flex-1", "margin-16"])}>
              <Text
                style={style.flatten([
                  "flex-1",
                  "text-base-regular",
                  "color-label-text-1",
                ])}
              >
                {intl.formatMessage({
                  id: "SelectStakingProvider",
                })}
              </Text>
            </View>
          )}
          <BottomArrowIcon
            containerStyle={{
              position: "absolute",
              right: 16,
              top: 16,
            }}
          />
        </View>
      </RectButton>
    </React.Fragment>
  );
});
