import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { Card, CardBody } from "../../../components/card";
import { renderRawDataMessage } from "./messages";
import { useStyle } from "../../../styles";

export const RawDataCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  msgs: AminoMsg[];
}> = observer(({ containerStyle, msgs }) => {
  const style = useStyle();
  const showHeader = msgs.length > 1;
  const renderedMsgs = (() => {
    return (msgs as readonly AminoMsg[]).map((msg, i) => {
      const { content } = renderRawDataMessage(msg, showHeader, i);
      return (
        <CardBody
          style={style.flatten(["padding-y-0", "flex-grow-1"])}
          key={i.toString()}
        >
          {content}
        </CardBody>
      );
    });
  })();

  return <Card style={containerStyle}>{renderedMsgs}</Card>;
});
