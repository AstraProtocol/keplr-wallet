import { observer } from "mobx-react-lite";
import moment from "moment";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Text, View } from "react-native";
import { RightArrowIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import { ITransactionItem } from "./hook/use-transaction-history";

export const TransactionItem: FunctionComponent<{
  item?: ITransactionItem;
}> = observer(({ item }) => {
  const style = useStyle();
  const intl = useIntl();

  var statusTextColor = style.get("color-yellow-50");
  var statusText = intl.formatMessage({ id: "history.status.unknown" });
  switch (item?.status) {
    case "success":
      statusTextColor = style.get("color-green-50");
      statusText = intl.formatMessage({ id: "history.status.success" });
      break;
    case "failure":
      statusTextColor = style.get("color-red-50");
      statusText = intl.formatMessage({ id: "history.status.failure" });
      break;
  }

  return (
    <View style={style.flatten(["padding-0"])}>
      <View style={style.flatten(["flex-row", "content-stretch"])}>
        <Text
          style={style.flatten(["flex-1", "text-base-medium", "color-gray-10"])}
        >
          {item?.action}
        </Text>
        <Text
          style={style.flatten([
            "text-base-medium",
            "color-gray-10",
            "text-right",
          ])}
        >
          {item?.rightText}
        </Text>
        <View
          style={style.flatten([
            "height-20",
            "width-20",
            "margin-left-8",
            "items-center",
            "justify-center",
          ])}
        >
          <RightArrowIcon height={6.25} />
        </View>
      </View>
      <View
        style={style.flatten(["flex-row", "content-stretch", "margin-top-4"])}
      >
        <Text
          style={style.flatten([
            "flex-1",
            "text-small-regular",
            "color-gray-30",
          ])}
        >
          {moment(item?.timestamp).format("HH:mm - DD/MM/YYYY")}
        </Text>
        <Text
          style={{
            ...style.flatten([
              "text-small-regular",
              "text-right",
              "margin-right-28",
            ]),
            ...statusTextColor,
          }}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
});
