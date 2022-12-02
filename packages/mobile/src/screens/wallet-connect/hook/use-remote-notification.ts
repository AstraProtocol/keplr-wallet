import messaging from "@react-native-firebase/messaging";
import Axios from "axios";
import { useStore } from "../../../stores";

export const useRemoteNotification = () => {
  const { chainStore, remoteConfigStore } = useStore();
  const chainId = chainStore.current.chainId;
  const pushServerUrl = chainStore.getChain(chainId).raw.wcInfor?.pushServerUrl;
  const relayServerUrl = chainStore
    .getChain(chainId)
    .raw.wcInfor?.relayUrl.replace("wss", "https");

  const getFcmToken = async () => {
    return await messaging().getToken();
  };

  const registerRemoteNotification = async (
    topic: string,
    peerName: string,
    language: string = "en"
  ) => {
    if (
      !remoteConfigStore.getBool("feature_remote_notification") ||
      !pushServerUrl ||
      !relayServerUrl
    ) {
      return;
    }

    const axios = Axios.create({
      baseURL: pushServerUrl,
    });
    const response = await axios.post("/new", {
      bridge: relayServerUrl,
      topic,
      type: "fcm",
      token: await getFcmToken(),
      peerName,
      language,
    });
    return response.data;
  };

  return { registerRemoteNotification };
};
