import { Staking } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomNavigationBar } from "../../../components/navigation-bar/custom-navigation-bar";
import { useStyle } from "../../../styles";
import { DashboardValidatorItem } from "../component";
import { useStaking } from "../hook/use-staking";

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const { getValidators } = useStaking();

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const data = getValidators("BOND_STATUS_BONDED");

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <CustomNavigationBar
        hideBottomSeparator
        title={intl.formatMessage({ id: "validator.list.new.title" })}
        containerStyle={{
          ...style.flatten(["background-color-background"]),
          marginTop: safeAreaInsets.top,
        }}
      />
      <FlatList
        data={data}
        keyExtractor={(item: Staking.Validator) => item.operator_address}
        renderItem={({ item }: { item: Staking.Validator; index: number }) => {
          return <DashboardValidatorItem validator={item} />;
        }}
        contentContainerStyle={{
          paddingBottom: safeAreaInsets.bottom + 16,
        }}
      />
    </View>
  );
});
