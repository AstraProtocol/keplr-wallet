import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";
import { useIntl } from "react-intl";
import { Text, ViewStyle } from "react-native";
import { Card, CardBody } from "../../../components";
import { useStyle } from "../../../styles";
import { useStaking } from "../hook/use-staking";
import { DashboardMyValidatorItem, DashboardValidatorItem } from "../component";

export const DelegationsItem: FunctionComponent<{
  containerStyle?: ViewStyle;
}> = observer(({ containerStyle }) => {
  const { getDelegations, getValidators, queryValidators } = useStaking();

  const style = useStyle();
  const intl = useIntl();

  const validators = getValidators("BOND_STATUS_BONDED");
  const delegations = getDelegations();
  const hasDelegations = delegations && delegations.length > 0;

  const validatorsMap = useMemo(() => {
    const map: Map<string, Staking.Validator> = new Map();

    for (const val of queryValidators.validators) {
      map.set(val.operator_address, val);
    }

    return map;
  }, [queryValidators.validators]);

  const getDelegationItems = (delegations: Staking.Delegation[]) => {
    return delegations.map((del, key) => {
      const validator = validatorsMap.get(del.delegation.validator_address);
      return <DashboardMyValidatorItem validator={validator} key={key} />;
    });
  };

  const getValidatorItems = (validators: Staking.Validator[]) => {
    return validators.map((validator, key) => {
      return <DashboardValidatorItem validator={validator} key={key} />;
    });
  };

  return (
    <Card style={containerStyle}>
      <CardBody style={style.flatten(["padding-y-0"])}>
        <Text style={style.flatten(["text-large-semi-bold", "color-white"])}>
          {intl.formatMessage({
            id: hasDelegations ? "MyStaking" : "StakingProviders",
          })}
        </Text>
      </CardBody>

      {hasDelegations
        ? getDelegationItems(delegations)
        : getValidatorItems(validators)}
    </Card>
  );
});
