import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoin, formatPercent } from "../../../common/utils";
import { Button } from "../../../components";
import { CardDivider } from "../../../components/card";
import { CloseLargeIcon } from "../../../components/icon/outlined";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { registerModal } from "../../../modals/base";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";
import { TooltipLabel } from "../component";

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
    const style = useStyle();
    const { chainStore, queriesStore } = useStore();
    const intl = useIntl();
    const queries = queriesStore.get(chainStore.current.chainId);
    const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Unspecified
    );

    console.log("__bondedValidators__", bondedValidators.validators);

    const [toValidator, setToValidator] = useState(selectedValidator);
    const safeAreaInsets = useSafeAreaInsets();

    const data = useMemo(() => {
      const data = bondedValidators.validators;
      return data.filter((validator) => {
        return (
          validator.operator_address !== currentValidatorAddress &&
          validator.status === "BOND_STATUS_BONDED"
        );
      });
    }, [bondedValidators.validators, currentValidatorAddress]);

    const renderBall = (selected: boolean) => {
      if (selected) {
        return (
          <View
            style={style.flatten([
              "margin-left-8",
              "width-18",
              "height-18",
              "border-radius-32",
              "background-color-transparent",
              "items-center",
              "justify-center",
              "border-width-1",
              "border-color-primary",
            ])}
          >
            <View
              style={style.flatten([
                "width-8",
                "height-8",
                "border-radius-32",
                "background-color-primary",
              ])}
            />
          </View>
        );
      } else {
        return (
          <View
            style={style.flatten([
              "margin-left-8",
              "width-18",
              "height-18",
              "border-radius-32",
              "background-color-transparent",
              "border-width-1",
              "border-color-gray-10",
            ])}
          />
        );
      }
    };

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
            "border-radius-8",
            "overflow-hidden",
            "background-color-gray-90",
          ])}
        >
          <View style={style.flatten(["flex-row", "items-center"])}>
            <TouchableOpacity
              onPress={close}
              style={style.flatten(["margin-16"])}
            >
              <CloseLargeIcon />
            </TouchableOpacity>
            <Text
              style={style.flatten([
                "flex-1",
                "text-medium-medium",
                "color-label-text-1",
                "text-center",
              ])}
            >
              {label}
            </Text>
            <View
              style={style.flatten(["margin-16", "height-24", "width-24"])}
            />
          </View>
          <CardDivider
            style={style.flatten([
              "background-color-card-separator",
              "margin-x-0",
            ])}
          />
          <View style={style.flatten(["flex", "height-40", "padding-top-12"])}>
            <View
              style={style.flatten([
                "flex-row",
                "justify-between",
                "padding-x-16",
                "margin-bottom-8",
              ])}
            >
              <Text
                style={style.flatten(["color-label-text-2", "text-caption2"])}
              >
                <FormattedMessage id="validator.list.name" />
              </Text>
              <TooltipLabel
                text={intl.formatMessage({
                  id: "validator.list.totalShares",
                })}
              />
            </View>
            <CardDivider
              style={style.flatten([
                "background-color-card-separator",
                "margin-bottom-0",
              ])}
            />
          </View>
          <ScrollView
            style={{
              maxHeight: maxItemsToShow ? 64 * maxItemsToShow : undefined,
            }}
            ref={scrollViewRef}
            persistentScrollbar={true}
            onLayout={onInit}
          >
            {data.map((val, index) => {
              return (
                <View key={index}>
                  <RectButton
                    key={val.operator_address}
                    style={style.flatten([
                      "padding-16",
                      "flex-row",
                      "items-center",
                    ])}
                    onPress={() => {
                      setToValidator(val);
                    }}
                  >
                    <ValidatorThumbnail
                      style={style.flatten(["margin-right-12"])}
                      size={40}
                      url={bondedValidators.getValidatorThumbnail(
                        val.operator_address
                      )}
                    />
                    <View style={style.flatten(["flex-1"])}>
                      <View
                        style={style.flatten([
                          "flex-row",
                          "justify-between",
                          "items-center",
                          "margin-bottom-4",
                        ])}
                      >
                        <Text
                          style={style.flatten([
                            "text-base-medium",
                            "color-label-text-1",
                            "max-width-160",
                          ])}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {val.description.moniker}
                        </Text>
                        <View
                          style={style.flatten([
                            "flex-row",
                            "justify-end",
                            "items-center",
                          ])}
                        >
                          <Text
                            style={style.flatten([
                              "text-base-medium",
                              "color-label-text-1",
                            ])}
                          >
                            {formatCoin(
                              new CoinPretty(
                                chainStore.current.stakeCurrency,
                                new Dec(val.tokens)
                              ),
                              false,
                              0
                            )}
                          </Text>
                          {renderBall(
                            val.operator_address ===
                              toValidator?.operator_address
                          )}
                        </View>
                      </View>
                      <Text
                        style={style.flatten([
                          "text-small-regular",
                          "color-label-text-2",
                        ])}
                      >
                        {intl.formatMessage(
                          { id: "validator.details.commission.percent" },
                          {
                            percent: formatPercent(
                              val.commission.commission_rates.rate,
                              true
                            ),
                          }
                        )}
                      </Text>
                    </View>
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
          <View
            style={style.flatten([
              "height-1",
              "background-color-card-separator",
            ])}
          />
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
