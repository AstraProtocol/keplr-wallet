import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ImageBackground, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomNavigationBar } from "../../../../components/navigation-bar/custom-navigation-bar";
import { useStyle } from "../../../../styles";

export const NFTGalleryScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          data: NFTData;
        }
      >,
      string
    >
  >();

  const style = useStyle();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        source={{
          uri:
            route.params.data.thumbnail_url ??
            route.params.data.metadata?.image,
        }}
        style={style.flatten(["width-full", "height-full"])}
        resizeMode={FastImage.resizeMode.contain}
      />

      <CustomNavigationBar
        hideBottomSeparator
        containerStyle={{
          position: "absolute",
          marginTop: safeAreaInsets.top,
        }}
      />
    </View>
  );
});
