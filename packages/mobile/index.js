/**
 * @format
 */
import "./ignore-warnings";

import "fast-text-encoding";
import "./shim";

import "text-encoding";

import "react-native-gesture-handler";

import "react-native-url-polyfill/auto";

import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from "react-native";

import "./init";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const App = require("./src/app").App;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appName = require("./app.json").name;

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
