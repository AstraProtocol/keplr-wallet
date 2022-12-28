import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { SafeAreaView, Text, View } from "react-native";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { useStyle } from "../../styles";
import { AstraLogo, Button } from "../../components";
import { useIntl } from "react-intl";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NetworkConnectionModal {
  onRetryHandler(): void;
}

const NetworkConnectionModalContext = React.createContext<NetworkConnectionModal>(
  { onRetryHandler: () => {} }
);

const NetworkConnectionModal: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  const context = useContext(NetworkConnectionModalContext);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        ...style.flatten(["background-color-background"]),
      }}
    >
      <View
        style={{
          ...style.flatten([
            "height-44",
            "flex-row",
            "items-center",
            "justify-center",
          ]),
          marginTop: safeAreaInsets.top,
        }}
      >
        <AstraLogo />
        <Text
          style={style.flatten([
            "text-large-bold",
            "color-white",
            "text-center",
            "margin-left-8",
          ])}
        >
          {intl.formatMessage({ id: "AstraWallet" })}
        </Text>
      </View>
      <View
        style={style.flatten([
          "flex-1",
          "items-stretch",
          "justify-center",
          "padding-x-page",
        ])}
      >
        <Text
          style={style.flatten([
            "text-x-large-semi-bold",
            "color-gray-10",
            "text-center",
          ])}
        >
          {intl.formatMessage({ id: "common.text.noConnection.title" })}
        </Text>
        <Text
          style={style.flatten([
            "text-base-regular",
            "color-gray-30",
            "margin-top-8",
            "text-center",
          ])}
        >
          {intl.formatMessage({ id: "common.text.noConnection.desc" })}
        </Text>
        <Button
          containerStyle={style.flatten(["margin-top-24"])}
          text={intl.formatMessage({ id: "Retry" })}
          onPress={context.onRetryHandler}
        />
      </View>
      <SafeAreaView />
    </View>
  );
};

export const NetworkConnectionProvider: FunctionComponent = ({ children }) => {
  const netInfo = useNetInfo();
  const [isInternetReachable, setIsInternetReachable] = useState(() => {
    return netInfo.isInternetReachable;
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsInternetReachable(state.isInternetReachable ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, [netInfo, netInfo.isInternetReachable]);

  const onRetryHandler = () => {
    console.log("netInfo state", netInfo.isInternetReachable);
    NetInfo.fetch()
      .then((state) => {
        console.log("state", state.isInternetReachable);
        setIsInternetReachable(state.isInternetReachable ?? true);
      })
      .catch((e) => {
        console.log("e ===", e);
      });
  };

  return (
    <NetworkConnectionModalContext.Provider value={{ onRetryHandler }}>
      {children}
      {isInternetReachable !== true && <NetworkConnectionModal />}
    </NetworkConnectionModalContext.Provider>
  );
};
