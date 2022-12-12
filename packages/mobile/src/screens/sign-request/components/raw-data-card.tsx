import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { Msg as AminoMsg } from "@cosmjs/launchpad";
import { Card, CardBody } from "../../../components/card";
import { useStyle } from "../../../styles";
import { renderRawDataMessage } from "./messages";

export const RawDataCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  msgs: AminoMsg[];
}> = observer(({ containerStyle, msgs }) => {
  const style = useStyle();
  const renderedMsgs = (() => {
    return (msgs as readonly AminoMsg[]).map((msg, i) => {
      const { content } = renderRawDataMessage(msg);
      return <CardBody key={i.toString()}>{content}</CardBody>;
    });
  })();

  return <Card style={containerStyle}>{renderedMsgs}</Card>;
});
