import Web3Auth, {
  LOGIN_PROVIDER,
  MFA_LEVELS,
  OPENLOGIN_NETWORK,
  SUPPORTED_KEY_CURVES,
} from "@web3auth/react-native-sdk";
import * as WebBrowser from "expo-web-browser";

export const SocialLoginConfig = {
  MAINNET: {
    clientId:
      "BHftGI2brFY3JpsuYYD1dt7IySVq0EZbbUMTVssAeUavVd4Fb61m9gYkRR0xkxHpq3BBs6-od1Q9a5pXhq0Gwi4",
    network: OPENLOGIN_NETWORK.CELESTE,
    loginConfig: {
      [LOGIN_PROVIDER.GOOGLE]: {
        verifier: "stellalab-google",
        typeOfLogin: LOGIN_PROVIDER.GOOGLE,
        clientId:
          "595199874047-ps4dtg93tvb6v52211hgk0ot4haajln6.apps.googleusercontent.com", // google's client id
      },
      [LOGIN_PROVIDER.APPLE]: {
        verifier: "stellalab-auth0-apple",
        typeOfLogin: LOGIN_PROVIDER.APPLE,
        clientId: "vG9Gie8LppUcL1eieQvwcSo1hWizo0TS", // auth0's client id
      },
    },
  },
  TESTNET: {
    clientId:
      "BDvHyz0eHU11kRD-mNjp_FV4PXsZVCtj4QBRIIzwYDSB6gQsLZhxHGQgiPHbj8Gm5V3gdTsmoGAHsFIG3UrnUIY",
    network: OPENLOGIN_NETWORK.TESTNET,
    loginConfig: {
      [LOGIN_PROVIDER.GOOGLE]: {
        verifier: "stellalab-google",
        typeOfLogin: LOGIN_PROVIDER.GOOGLE,
        clientId:
          "595199874047-ps4dtg93tvb6v52211hgk0ot4haajln6.apps.googleusercontent.com", // google's client id
      },
      [LOGIN_PROVIDER.APPLE]: {
        verifier: "stellalab-auth0-apple",
        typeOfLogin: LOGIN_PROVIDER.APPLE,
        clientId: "vG9Gie8LppUcL1eieQvwcSo1hWizo0TS", // auth0's client id
      },
    },
  },
};

export const useSocialLogin = () => {
  enum SUPPORTED_LOGIN_PROVIDER {
    GOOGLE = "google",
    APPLE = "apple",
  }

  const redirectUrl = "app.astra.oauth://auth";

  const openLogin = async (loginProvider: SUPPORTED_LOGIN_PROVIDER) => {
    const web3auth = new Web3Auth(WebBrowser, {
      ...SocialLoginConfig.TESTNET,
      whiteLabel: { name: "Astra - Reward Hub" },
    });

    const state = await web3auth.login({
      loginProvider,
      redirectUrl,
      mfaLevel: MFA_LEVELS.NONE,
      curve: SUPPORTED_KEY_CURVES.SECP256K1,
      extraLoginOptions: {
        domain: "https://dev-4w2j7gug0itulgsu.us.auth0.com", // domain of your auth0 app
        verifierIdField: "sub",
      },
    });

    return { provider: loginProvider, ...state };
  };

  return { SUPPORTED_LOGIN_PROVIDER, openLogin };
};
