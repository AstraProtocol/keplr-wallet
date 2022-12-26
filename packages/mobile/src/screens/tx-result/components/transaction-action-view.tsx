import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { View, ViewStyle } from "react-native";
import { Button } from "../../../components";
import { useSmartNavigation } from "../../../navigation-util";
import { useStore } from "../../../stores";
import { useStyle } from "../../../styles";

export const TransactionActionView: FunctionComponent<{
  style?: ViewStyle;
}> = observer(({ style }) => {
  const { transactionStore } = useStore();
  const styleBuilder = useStyle();
  const intl = useIntl();
  const smartNavigation = useSmartNavigation();

  const [txState, setTxState] = useState(transactionStore.txState);

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  return (
    <View style={style}>
      <View
        style={styleBuilder.flatten(["height-1", "background-color-border"])}
      />
      <View
        style={{ flexDirection: "row", marginTop: 12, marginHorizontal: 16 }}
      >
        <Button
          text={intl.formatMessage({ id: "Home" })}
          color={txState == "failure" ? "neutral" : "primary"}
          containerStyle={styleBuilder.flatten(["flex-1"])}
          onPress={async () => {
            smartNavigation.navigateSmart("NewHome", { isRefresh: true });
          }}
        />
        {txState == "failure" && (
          <Button
            text={intl.formatMessage({ id: "Back" })}
            containerStyle={styleBuilder.flatten(["margin-left-8", "flex-1"])}
            onPress={async () => {
              smartNavigation.goBack();
            }}
          />
        )}
      </View>
    </View>
  );
});
