import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";

import { Staking } from "@keplr-wallet/stores";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { Card, CardBody } from "../../../components/card";

import { useIntl } from "react-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chip } from "../../../components/chip";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipBottomSheet } from "../component";
import { TooltipIcon } from "../component/tooltip-icon";

export const ValidatorNameCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unspecified
  );

  const validator = useMemo(() => {
    return queryValidators.validators.find(
      (val) => val.operator_address === validatorAddress
    );
  }, [queryValidators.validators, validatorAddress]);

  const thumbnail = queryValidators.getValidatorThumbnail(validatorAddress);

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      style={StyleSheet.flatten([
        style.flatten(["background-color-transparent"]),
        containerStyle,
      ])}
    >
      <View
        style={{
          height: safeAreaInsets.top + 44,
        }}
      />
      {validator ? (
        <CardBody
          style={style.flatten([
            "items-center",
            "padding-y-0",
            "margin-top-16",
          ])}
        >
          <ValidatorThumbnail size={80} url={thumbnail} />
          <Text
            style={style.flatten(["subtitle1", "color-white", "margin-top-16"])}
          >
            {validator.description.moniker}
          </Text>
          {validator?.jailed === true && (
            <View
              style={style.flatten([
                "flex-row",
                "items-center",
                "margin-top-4",
              ])}
            >
              <Chip
                size="medium"
                type="error"
                text={intl.formatMessage({
                  id: "Inactive",
                })}
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setIsOpen(!isOpen);
                }}
                style={style.flatten(["margin-left-4"])}
              >
                <TooltipIcon />
              </TouchableOpacity>
            </View>
          )}
          <TooltipBottomSheet
            isOpen={isOpen}
            close={() => {
              setIsOpen(!isOpen);
            }}
            title={intl.formatMessage({ id: "Tooltip.Inactive.Title" })}
            contentView={
              <View
                style={{
                  ...style.flatten(["margin-x-16", "margin-top-8"]),
                  marginBottom: safeAreaInsets.bottom + 24,
                }}
              >
                <Text
                  style={style.flatten([
                    "color-label-text-1",
                    "text-base-regular",
                  ])}
                >
                  {intl.formatMessage({ id: "Tooltip.Inactive.Desc" })}
                </Text>
              </View>
            }
          />
        </CardBody>
      ) : null}
    </Card>
  );
});
