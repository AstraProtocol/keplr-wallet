import { Mnemonic } from "@keplr-wallet/crypto";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Keyboard, Text, View } from "react-native";
import FastImage from "react-native-fast-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCoinFee } from "../../../../common/utils";
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
import { AddressInput } from "../../components";

export const NFTSendScreen: FunctionComponent = observer(() => {
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

  const {
    chainStore,
    accountStore,
    queriesStore,
    transactionStore,
  } = useStore();

  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();
  const smartNavigation = useSmartNavigation();

  const { estimateGasTransferNFTOwner } = useNFTContract();

  const [estimateGasOnce, setEstimateGasOnce] = useState(false);
  const [addressIsValid, setAddressIsValid] = useState(false);
  const [addressErrorText, setAddressErrorText] = useState("");
  const [feeText, setFeeText] = useState("0 ASA");

  const estimateGas = () => {
    if (estimateGasOnce) {
      return;
    }

    setEstimateGasOnce(true);

    estimateGasTransferNFTOwner(
      sendConfigs.recipientConfig.recipient,
      route.params.data.collection_address,
      route.params.data.token_id
    )
      .then((gasLimit) => {
        const gasPrice = 1000000000;
        const feeDec = new Dec(gasLimit?.toBigInt() || 0).mul(
          new Dec(gasPrice)
        );
        const fee = new CoinPretty(
          sendConfigs.amountConfig.sendCurrency,
          feeDec
        );
        setFeeText(formatCoinFee(fee));
      })
      .catch((e) => {
        console.log(e);
        setEstimateGasOnce(false);
      });
  };

  useEffect(() => {
    if (addressIsValid) {
      estimateGas();
    }
  }, [addressIsValid]);

  const chainId = chainStore.current.chainId;
  const chain = chainStore.getChain(chainId);
  const ethereumEndpoint = chain.raw.ethereumEndpoint;

  const account = accountStore.getAccount(chainStore.current.chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    account.bech32Address,
    ethereumEndpoint
  );

  const rows: IRow[] = [
    {
      type: "items",
      cols: [
        buildLeftColumn({
          text: intl.formatMessage(
            { id: "TransactionFee" },
            { denom: sendConfigs.amountConfig.sendCurrency.coinDenom }
          ),
        }),
        buildRightColumn({ text: feeText }),
      ],
    },
  ];

  const onSendHandler = async () => {
    Keyboard.dismiss();

    if (addressIsValid) {
      let gasLimit;
      try {
        gasLimit = await estimateGasTransferNFTOwner(
          sendConfigs.recipientConfig.recipient,
          route.params.data.collection_address,
          route.params.data.token_id
        );
      } catch (e) {
        console.log(e);
        return;
      }

      const gasPrice = 1000000000;

      //   const gasLimit = parseInt(gas.toHexString().slice(2), 16);
      //   const gasPrice = parseInt(price.slice(2), 16);
      const feeDec = new Dec(gasLimit?.toBigInt() || 0).mul(new Dec(gasPrice));
      const fee = new CoinPretty(sendConfigs.amountConfig.sendCurrency, feeDec);

      // const params = {
      //   token: sendConfigs.amountConfig.sendCurrency?.coinDenom,
      //   amount: Number(sendConfigs.amountConfig.amount),
      //   fee: Number(
      //     feeDec.mulTruncate(
      //       DecUtils.getTenExponentN(
      //         -sendConfigs.amountConfig.sendCurrency.coinDecimals
      //       )
      //     ) ?? "0"
      //   ),
      //   gas: gasLimit.toString(),
      //   gas_price: gasPrice,
      //   receiver_address: sendConfigs.recipientConfig.recipient,
      // };

      smartNavigation.navigateSmart("NFT.SendConfirm", {
        data: route.params.data,
        receiver: sendConfigs.recipientConfig.recipient,
        fee: fee,
      });

      // try {
      //   transactionStore.updateRawData({
      //     type: "transfer-nft",
      //     value: {
      //       fee: new CoinPretty(sendConfigs.amountConfig.sendCurrency, feeDec),
      //       recipient: sendConfigs.recipientConfig.recipient,
      //     },
      //   });

      //   await transferNFTOwner(
      //     sendConfigs.recipientConfig.recipient,
      //     route.params.data.collection_address,
      //     route.params.data.token_id,
      //     {
      //       onBroadcasted: (txHash) => {
      //         analyticsStore.logEvent("astra_hub_transfer_nft_owner", {
      //           ...params,
      //           tx_hash: "0x" + Buffer.from(txHash).toString("hex"),
      //           success: true,
      //         });
      //         transactionStore.updateTxHash(txHash);

      //         smartNavigation.navigate("Tx", {
      //           screen: "Tx.EvmResult",
      //         });
      //       },
      //     }
      //   );
      // } catch (e: any) {
      //   analyticsStore.logEvent("astra_hub_transfer_nft_owner", {
      //     ...params,
      //     success: false,
      //     error: e?.message,
      //   });
      //   if (e?.message === "Request rejected") {
      //     return;
      //   }
      //   console.log("__DEBUG_ sendErr: ", e);
      //   transactionStore.updateTxState("failure");
      // }
    }
  };

  const privateKey = Buffer.from(
    Mnemonic.generateWalletFromMnemonic(
      "chase resist zone cube industry bunker rebuild direct season arrest mask run",
      `m/44'/60'/0'/0/0`
    )
  );

  // console.log("__mnemonic__", validMnemonic);
  console.log("__privateKey__", privateKey.toString("hex"));

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <CustomNavigationBar
        title={intl.formatMessage({ id: "nft.collectible.send" })}
        containerStyle={{
          ...style.flatten(["background-color-background"]),
          marginTop: safeAreaInsets.top,
        }}
      />

      <KeyboardAwareScrollView
        enableOnAndroid
        // style={style.flatten(["padding-16"])}
        // contentContainerStyle={style.flatten(["flex-grow-1"])}
      >
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
              "text-small-regular",
              "text-center",
              "color-label-text-1",
              "margin-top-12",
            ])}
          >
            {route.params.data.title}
          </Text>
        </View>

        <View
          style={style.flatten([
            "background-color-card-separator",
            "height-1",
            "margin-y-24",
          ])}
        />

        <View style={style.flatten(["padding-x-16"])}>
          <AddressInput
            recipientConfig={sendConfigs.recipientConfig}
            onAddressChanged={(address, errorText, isFocus) => {
              setAddressIsValid(address.length !== 0 && errorText.length === 0);
              setAddressErrorText(isFocus ? "" : errorText);
            }}
            onSubmitEditting={onSendHandler}
          />

          <ListRowView
            rows={rows}
            style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 16 }}
            hideBorder
            clearBackground
          />
        </View>

        {/* <View
          style={{
            ...style.flatten(["background-color-background"]),
            height: safeAreaInsets.bottom,
          }}
        /> */}
      </KeyboardAwareScrollView>
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
            disabled={addressErrorText.length !== 0}
            loading={transactionStore.rawData !== undefined}
            onPress={onSendHandler}
            containerStyle={style.flatten(["margin-x-page", "margin-top-12"])}
          />
        </View>
        <AvoidingKeyboardBottomView />
      </View>
    </View>
  );
});
