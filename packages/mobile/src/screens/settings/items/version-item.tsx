import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import CodePush, { LocalPackage } from "react-native-code-push";
import DeviceInfo from "react-native-device-info";
import { useStyle } from "../../../styles";
export const AccountVersionItem: FunctionComponent = observer(() => {
  const style = useStyle();
  const [appVersion] = useState(() => DeviceInfo.getVersion());
  const [buildNumber] = useState(() => DeviceInfo.getBuildNumber());
  const [codePushLabel, setCodePushLabel] = useState("");

  useEffect(() => {
    CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
      .then((status) => {
        setCodePushLabel((status as LocalPackage)?.label ?? "");
      })
      .catch((e) => {
        console.log("__ERROR_CodePush__", e);
      });
  }, []);

  return (
    <View style={style.flatten(["height-48", "items-center"])}>
      <Text style={style.flatten(["body3", "color-text-black-low"])}>
        Version {appVersion} ({buildNumber})
        {codePushLabel.length != 0 ? ` - ${codePushLabel}` : ""}
      </Text>
    </View>
  );
});
