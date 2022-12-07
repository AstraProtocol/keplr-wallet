import {
  AccountStore,
  CosmosAccount,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretQueries,
  Staking,
} from "@keplr-wallet/stores";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Image, Text, View, ViewStyle } from "react-native";
import { formatCoin, formatPercent } from "../../../common/utils";
import {
  buildLeftColumn,
  buildRightColumn,
  IRow,
  ListRowView,
} from "../../../components";
import { Card, CardBody, CardDivider } from "../../../components/card";
import { RightArrowIcon } from "../../../components/icon";
import { ValidatorItem } from "../../../components/input";
import { RectButton } from "../../../components/rect-button";
import { useSmartNavigation } from "../../../navigation-util";
import { ChainStore } from "../../../stores/chain";
import { useStyle } from "../../../styles";

export const DelegationsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  chainStore: ChainStore;
  accountStore: AccountStore<[CosmosAccount, CosmwasmAccount, SecretAccount]>;
  queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
  >;
}> = observer(({ containerStyle, chainStore, accountStore, queriesStore }) => {
  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryDelegations = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
    account.bech32Address
  );

  const delegations = queryDelegations.delegations.sort((a, b) => {
    return Number(b.balance.amount) - Number(a.balance.amount);
  });

  const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Unspecified
  );
  const unbondingsQuery = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const unbondings = unbondingsQuery.unbondingBalances;

  const validatorsMap = useMemo(() => {
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of queryValidators.validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [queryValidators.validators]);

  const style = useStyle();
  const intl = useIntl();

  const smartNavigation = useSmartNavigation();

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <Text style={style.flatten(["text-large-semi-bold", "color-white"])}>
          <FormattedMessage id="staking.delegate.label" />
        </Text>
      </CardBody>

      {delegations && delegations.length > 0 ? (
        <CardBody
          style={style.flatten([
            "padding-x-0",
            "padding-y-0",
            "padding-bottom-16",
          ])}
        >
          {delegations.map((del) => {
            const val = validatorsMap.get(del.delegation.validator_address);
            if (!val) {
              return null;
            }

            const thumbnail = queryValidators.getValidatorThumbnail(
              val.operator_address
            );

            const amount = queryDelegations.getDelegationTo(
              val.operator_address
            );

            const rewards = queryRewards.getStakableRewardOf(
              val.operator_address
            );

            if (amount.toDec().isZero() && rewards.toDec().isZero()) {
              return null;
            }

            const zeroAmount = new CoinPretty(amount.currency, new Dec(0));
            const unbonding = unbondings.find(
              (unbonding) => val.operator_address === unbonding.validatorAddress
            );
            const unbondingAmount =
              unbonding?.entries.reduce((coin, entry) => {
                return coin.add(entry.balance);
              }, zeroAmount) || zeroAmount;

            const rows: IRow[] = [
              {
                type: "items",
                cols: [
                  buildLeftColumn({
                    text: intl.formatMessage({
                      id: "staking.delegate.invested",
                    }),
                  }),
                  buildRightColumn({ text: formatCoin(amount, false, 2) }),
                ],
              },
              {
                type: "items",
                cols: [
                  buildLeftColumn({
                    text: intl.formatMessage({
                      id: "staking.delegate.profit",
                    }),
                  }),
                  buildRightColumn({
                    text: "+" + formatCoin(rewards, false, 4),
                    textColor: style.get("color-rewards-text").color,
                  }),
                ],
              },
              {
                type: "items",
                cols: [
                  buildLeftColumn({
                    text: intl.formatMessage({
                      id: "staking.unbonding.unbondingAmount",
                    }),
                  }),
                  buildRightColumn({
                    text: formatCoin(unbondingAmount, false, 2),
                  }),
                ],
              },
            ];

            return (
              <RectButton
                key={del.delegation.validator_address}
                style={style.flatten([
                  "flex",
                  "margin-x-16",
                  "margin-top-16",
                  "border-radius-16",
                  "background-color-card-background",
                ])}
                onPress={() => {
                  smartNavigation.navigateSmart("Validator.Details", {
                    validatorAddress: del.delegation.validator_address,
                  });
                }}
                underlayColor={style.get("color-transparent").color}
                activeOpacity={0}
              >
                <ValidatorItem
                  containerStyle={style.flatten([
                    "background-color-transparent",
                    "border-width-0",
                    "border-radius-0",
                    "padding-y-16",
                  ])}
                  thumbnail={thumbnail}
                  name={val.description.moniker}
                  value={intl.formatMessage(
                    { id: "validator.details.commission.percent" },
                    {
                      percent: formatPercent(
                        val.commission.commission_rates.rate,
                        true
                      ),
                    }
                  )}
                  right={
                    <View
                      style={style.flatten([
                        "width-24",
                        "height-24",
                        "items-center",
                        "justify-center",
                      ])}
                    >
                      <RightArrowIcon height={14} />
                    </View>
                  }
                />
                <CardDivider
                  style={style.flatten(["background-color-card-separator"])}
                />
                <ListRowView
                  rows={rows}
                  style={{
                    paddingVertical: 8,
                  }}
                  hideBorder
                  clearBackground
                />
              </RectButton>
            );
          })}
        </CardBody>
      ) : (
        <DelegationsEmptyItem
          label={intl.formatMessage({ id: "staking.delegate.empty" })}
          containerStyle={style.flatten([
            "background-color-background",
            "margin-y-32",
          ])}
        />
      )}
    </Card>
  );
});

export const DelegationsEmptyItem: FunctionComponent<{
  containerStyle?: ViewStyle;
  label: string;
}> = observer(({ containerStyle, label }) => {
  const style = useStyle();
  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-bottom-0", "items-center"])}>
        <Image
          source={require("../../../assets/image/empty-order-list.png")}
          resizeMode="contain"
          style={style.flatten(["height-60"])}
        />
        <Text
          style={style.flatten([
            "text-center",
            "text-caption2",
            "color-gray-30",
            "margin-top-12",
          ])}
        >
          {label}
        </Text>
      </CardBody>
    </Card>
  );
});
