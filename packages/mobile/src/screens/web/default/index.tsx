import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import WebView from "react-native-webview";

import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { observer } from "mobx-react-lite";
import { PageWithScrollView } from "../../../components";
import { useStyle } from "../../../styles";
import { WebViewStateContext } from "../components/context";
import { OnScreenWebpageScreenHeader } from "../components/header";

export const WebViewScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          url: string;
        }
      >,
      string
    >
  >();
  const style = useStyle();

  const webviewRef = useRef<WebView | null>(null);
  const [currentURL, setCurrentURL] = useState(() => {
    if (route.params.url) {
        return route.params.url;
    }

    return "";
  });

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    // Handle the hardware back button on the android.
    const backHandler = () => {
      if (!isFocused || webviewRef.current == null) {
        return false;
      }

      if (!canGoBack) {
        return false;
      }

      webviewRef.current.goBack();
      return true;
    };

    if (isFocused) {
      BackHandler.addEventListener("hardwareBackPress", backHandler);
    }

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backHandler);
    };
  }, [canGoBack, isFocused]);

  const navigation = useNavigation();

  useEffect(() => {
    // Android disables the gesture by default.
    // If we turn on the gesture manually without checking OS,
    // the gesture will turn on even on Android.
    // So, checking platform is required.
    if (Platform.OS === "ios") {
      navigation.setOptions({
        gestureEnabled: !canGoBack,
      });
    }
  }, [canGoBack, navigation]);

  return (
      <WebView
        source={{uri: currentURL}}
        onNavigationStateChange={(e) => {
          // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
          // Use two handlers to measure simultaneously in ios and android.
          setCanGoBack(e.canGoBack);
          setCanGoForward(e.canGoForward);
          setCurrentURL(e.url);
        }}
        onLoadProgress={(e) => {
          // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
          // Use two handlers to measure simultaneously in ios and android.
          setCanGoBack(e.nativeEvent.canGoBack);
          setCanGoForward(e.nativeEvent.canGoForward);

          setCurrentURL(e.nativeEvent.url);
        }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        decelerationRate="normal"
        allowsBackForwardNavigationGestures={true}
      />
  );
});