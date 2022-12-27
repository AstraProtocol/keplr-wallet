import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { CoinPretty } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { ScrollView, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoin } from "../../../../common/utils";
import {
  buildLeftColumn,
  buildRightColumn,
  Button,
  IRow,
  ListRowView,
} from "../../../../components";
import { AvoidingKeyboardBottomView } from "../../../../components/avoiding-keyboard/avoiding-keyboard-bottom";
import { CustomNavigationBar } from "../../../../components/navigation-bar/custom-navigation-bar";
import { useNFTContract } from "../../../../contracts/Erc721Manager";
import { useSmartNavigation } from "../../../../navigation-util";
import { useStore } from "../../../../stores";
import { useStyle } from "../../../../styles";

export const NFTSendConfirmScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          data: NFTData;
          receiver: string;
          fee: CoinPretty;
        }
      >,
      string
    >
  >();

  const { transactionStore, analyticsStore } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();
  const smartNavigation = useSmartNavigation();

  const { transferNFTOwner } = useNFTContract();

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "ReceiverAddress" }),
          flex: 4,
        }),
        buildRightColumn({ text: route.params.receiver, flex: 6 }),
      ],
    },
    { type: "separator" },
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage({ id: "TransactionFee" }),
        }),
        buildRightColumn({ text: formatCoin(route.params.fee, false, 6) }),
      ],
    },
  ];

  const onSendHandler = async () => {
    const baseTrackingParams = {
      // token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
      // amount: Number(sendConfigs.amountConfig.amount),
      fee: formatCoin(route.params.fee, true, 6),
      // gas: gasLimit.toString(),
      // gas_price: gasPrice,
      receiver_address: route.params.receiver,
    };

    try {
      transactionStore.updateRawData({
        type: "transfer-nft",
        value: {
          fee: route.params.fee,
          recipient: route.params.receiver,
          content: route.params.data.title,
        },
      });

      await transferNFTOwner(
        route.params.receiver,
        route.params.data.collection_address,
        route.params.data.token_id,
        {
          onBroadcasted: (txHash) => {
            analyticsStore.logEvent("astra_hub_transfer_nft_owner", {
              ...baseTrackingParams,
              tx_hash: "0x" + Buffer.from(txHash).toString("hex"),
              success: true,
            });
            transactionStore.updateTxHash(txHash);

            smartNavigation.navigate("Tx", {
              screen: "Tx.EvmResult",
            });
          },
        }
      );
    } catch (e: any) {
      analyticsStore.logEvent("astra_hub_transfer_nft_owner", {
        ...baseTrackingParams,
        success: false,
        error: e?.message,
      });
      if (e?.message === "Request rejected") {
        return;
      }
      console.log("__DEBUG_ sendErr: ", e);
      transactionStore.updateTxState("failure");
    }
  };

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <CustomNavigationBar
        title={intl.formatMessage({ id: "Confirm" })}
        containerStyle={{
          ...style.flatten(["background-color-background"]),
          marginTop: safeAreaInsets.top,
        }}
      />

      <ScrollView>
        <View style={style.flatten(["padding-x-16", "items-center"])}>
          <FastImage
            style={style.flatten(["margin-top-24", "width-160", "height-160"])}
            source={{
              uri: route.params.data.metadata?.image,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />

          <Text
            style={style.flatten([
              "text-base-regular",
              "text-center",
              "color-label-text-2",
              "margin-top-16",
            ])}
          >
            {intl.formatMessage({ id: "nft.collectible.send" })}
          </Text>

          <Text
            style={style.flatten([
              "text-large-medium",
              "text-center",
              "color-label-text-1",
              "margin-top-4",
            ])}
          >
            {route.params.data.title}
          </Text>
        </View>

        <View style={style.flatten(["padding-x-16", "margin-top-32"])}>
          <ListRowView rows={rows} />
        </View>
      </ScrollView>
      <View
        style={style.flatten(["flex-1", "justify-end", "margin-bottom-12"])}
      >
        <View style={style.flatten(["height-1", "background-color-gray-70"])} />
        <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: 56,
          }}
        >
          <Button
            text={intl.formatMessage({ id: "Continue" })}
            onPress={onSendHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
