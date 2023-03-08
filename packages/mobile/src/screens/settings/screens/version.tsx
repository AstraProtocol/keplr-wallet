import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useStyle } from "../../../styles";
import { useIntl } from "react-intl";
import codePush from "react-native-code-push";
import DeviceInfo from "react-native-device-info";
import { PageWithScrollView } from "../../../components/page";
import { Button } from "../../../components";
import { SafeAreaView } from "react-native-safe-area-context";

export const VersionScreen: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();

  const [appVersion] = useState(() => DeviceInfo.getVersion());
  const [buildNumber] = useState(() => DeviceInfo.getBuildNumber());
  // "undefined" means that it is on fetching,
  // empty string "" means that there is no data.
  const [currentCodeVersion, setCurrentCodeVersion] = useState<
    string | undefined
  >(undefined);
  const [latestCodeVersion, setLatestCodeVersion] = useState<
    string | undefined
  >(undefined);
  const [pendingCodeVersion, setPendingCodeVersion] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    codePush.getUpdateMetadata(codePush.UpdateState.RUNNING).then((update) => {
      if (update) {
        setCurrentCodeVersion(update.label);
      } else {
        setCurrentCodeVersion("");
      }
    });

    codePush.getUpdateMetadata(codePush.UpdateState.LATEST).then((update) => {
      if (update) {
        setLatestCodeVersion(update.label);
      } else {
        setLatestCodeVersion("");
      }
    });

    codePush.getUpdateMetadata(codePush.UpdateState.PENDING).then((update) => {
      if (update) {
        setPendingCodeVersion(update.label);
      } else {
        setPendingCodeVersion("");
      }
    });
  }, []);

  const parseVersion = (version: string | undefined) => {
    if (version === undefined) {
      return "Fetching...";
    }

    if (version === "") {
      return "None";
    }

    return version;
  };

  return (
    <PageWithScrollView backgroundColor={style.get("color-background").color}>
      <Text
        style={style.flatten([
          "text-medium-regular",
          "color-label-text-1",
          "margin-top-24",
          "padding-x-16",
        ])}
      >
        {intl.formatMessage({ id: "Local" })}
      </Text>
      <Item
        label={intl.formatMessage({ id: "AppVersion" })}
        value={appVersion}
      />
      <Item
        label={intl.formatMessage({ id: "BuildNumber" })}
        value={buildNumber}
      />
      <Text
        style={style.flatten([
          "text-medium-regular",
          "color-label-text-1",
          "margin-top-24",
          "padding-x-16",
        ])}
      >
        {intl.formatMessage({ id: "Remote" })}
      </Text>
      <Item
        label={intl.formatMessage({ id: "CodePushVersion" })}
        value={currentCodeVersion}
      />
      <Item
        label={intl.formatMessage({ id: "LatestCodePushVersion" })}
        value={latestCodeVersion}
      />
      <Item
        label={intl.formatMessage({ id: "PendingCodePushVersion" })}
        value={pendingCodeVersion}
      />
      <View style={style.flatten(["height-24"])} />
      <SafeAreaView />
    </PageWithScrollView>
  );
};

const Item: FunctionComponent<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        "background-color-card-background",
        "padding-page",
        "margin-top-16",
      ])}
    >
      <Text style={style.flatten(["text-base-medium", "color-label-text-1"])}>
        {label}
      </Text>
      <Text style={style.flatten(["text-base-medium", "color-label-text-2"])}>
        {value}
      </Text>
    </View>
  );
};
