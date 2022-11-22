import * as React from "react";
import { FunctionComponent } from "react";
import { Platform, StatusBar } from "react-native";
import { ModalsProvider } from "./modals/base";
import { AppNavigation } from "./navigation";
import { StoreProvider } from "./stores";
import { StyleProvider } from "./styles";

import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertModalProvider } from "./providers/alert-modal";
import { autoUpdateBody, withAutoDownloadUI } from "./providers/auto-update";
import { ConfirmModalProvider } from "./providers/confirm-modal";
import { InteractionModalsProvider } from "./providers/interaction-modals-provider";
import { LoadingScreenProvider } from "./providers/loading-screen";
import { NetworkConnectionProvider } from "./providers/network-connection";
import { ToastModalProvider } from "./providers/toast-modal";
import * as SplashScreen from "./screens/splash";
import { AppIntlProvider } from "./translations";

if (Platform.OS === "android") {
  // https://github.com/web-ridge/react-native-paper-dates/releases/tag/v0.2.15

  // Even though React Native supports the intl on android with "org.webkit:android-jsc-intl:+" option,
  // it seems that android doesn't support all intl API and this bothers me.
  // So, to reduce this problem on android, just use the javascript polyfill for intl.
  require("@formatjs/intl-getcanonicallocales/polyfill");
  require("@formatjs/intl-locale/polyfill");

  require("@formatjs/intl-pluralrules/polyfill");
  require("@formatjs/intl-pluralrules/locale-data/en.js");
  require("@formatjs/intl-pluralrules/locale-data/vi.js");

  require("@formatjs/intl-displaynames/polyfill");
  require("@formatjs/intl-displaynames/locale-data/en.js");
  require("@formatjs/intl-displaynames/locale-data/vi.js");

  // require("@formatjs/intl-listformat/polyfill");
  // require("@formatjs/intl-listformat/locale-data/en.js");

  require("@formatjs/intl-numberformat/polyfill");
  require("@formatjs/intl-numberformat/locale-data/en.js");
  require("@formatjs/intl-numberformat/locale-data/vi.js");

  require("@formatjs/intl-relativetimeformat/polyfill");
  require("@formatjs/intl-relativetimeformat/locale-data/en.js");
  require("@formatjs/intl-relativetimeformat/locale-data/vi.js");

  require("@formatjs/intl-datetimeformat/polyfill");
  require("@formatjs/intl-datetimeformat/locale-data/en.js");
  require("@formatjs/intl-datetimeformat/locale-data/vi.js");

  require("@formatjs/intl-datetimeformat/add-golden-tz.js");

  // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const RNLocalize = require("react-native-localize");
  // if ("__setDefaultTimeZone" in Intl.DateTimeFormat) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone());
  // }
  // On android, setting the timezone makes that the hour in date looks weird if the hour exceeds 24. Ex) 00:10 AM -> 24:10 AM.
  // Disable the timezone until finding the solution.
}

// Prevent native splash screen from autohiding.
// UnlockScreen/ AutoUpdate screen will hide the splash screen
SplashScreen.preventAutoHideAsync();

const AppNavigationWithAutoUI = withAutoDownloadUI(AppNavigation);

const AppBody: FunctionComponent = () => {
  const additionalMessages = {};

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    messaging().registerDeviceForRemoteMessages();

    return unsubscribe;
  }, []);

  return (
    <StyleProvider>
      <StoreProvider>
        <AppIntlProvider
          additionalMessages={additionalMessages}
          formats={{
            date: {
              en: {
                // Prefer not showing the year.
                // If the year is different with current time, recommend to show the year.
                // However, this recomendation should be handled in the component logic.
                // year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
                minute: "2-digit",
                timeZoneName: "short",
              },
            },
          }}
        >
          <StatusBar
            translucent={true}
            backgroundColor="#FFFFFF00"
            barStyle="light-content"
          />
          <SafeAreaProvider>
            <ModalsProvider>
              <LoadingScreenProvider>
                <ConfirmModalProvider>
                  <NetworkConnectionProvider>
                    <AlertModalProvider>
                      <ToastModalProvider>
                        <InteractionModalsProvider>
                          <AppNavigationWithAutoUI />
                        </InteractionModalsProvider>
                      </ToastModalProvider>
                    </AlertModalProvider>
                  </NetworkConnectionProvider>
                </ConfirmModalProvider>
              </LoadingScreenProvider>
            </ModalsProvider>
          </SafeAreaProvider>
        </AppIntlProvider>
      </StoreProvider>
    </StyleProvider>
  );
};

// should only use codePush in release version,
// other versions like dev and RC, UAT should use local code
// set below value = true to use codePush from AppCenter
const useCodePush = (() => {
  // return false here if want to use local bundle instead of check for update in AppCenter
  if (__DEV__) return false;
  return true;
})();
const CodePushAppBody = autoUpdateBody(AppBody, useCodePush);

export const App: FunctionComponent = () => {
  return <CodePushAppBody />;
};
