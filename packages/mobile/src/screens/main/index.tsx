import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  ImageBackground,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

import { observer } from "mobx-react-lite";

import { ChainUpdaterService } from "@keplr-wallet/background";
import { NFTData } from "@keplr-wallet/stores/build/query/nft";
import { CoinPretty } from "@keplr-wallet/unit";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { useIntl } from "react-intl";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScanIcon } from "../../components";
import { usePrevious } from "../../hooks";
import { useSmartNavigation } from "../../navigation-util";
import { useToastModal } from "../../providers/toast-modal";
import { AccountCardNew, ActionsCard, TokenItemNew } from "./card";
import { CustomTabBar } from "./components";
import { useQueryBalances } from "./hook/use-query-balance";
import { useQueryNfts } from "./hook/use-query-nft";
import { NFTCell, NFTEmptyCell } from "./screens/nft/components/nft-cell";
import { useStaking } from "../staking/hook/use-staking";

export const MainScreen: FunctionComponent = observer(() => {
  const {
    fetchFirstPageNFTs,
    fetchNextPageNFTs,
    nfts: observableNFTs,
  } = useQueryNfts();
  const { waitBalanceResponses, getBalances } = useQueryBalances();
  const {
    queryRewards,
    queryDelegations,
    queryUnbondingDelegations,
  } = useStaking();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [nfts, setNFTs] = useState([0] as any[]);

  const {
    chainStore,
    accountStore,
    queriesStore,
    analyticsStore,
    remoteConfigStore,
  } = useStore();

  const nftSupportEnabled = remoteConfigStore.getBool(
    "feature_nft_support_enabled"
  );

  const style = useStyle();
  const intl = useIntl();
  const toastModal = useToastModal();
  const safeAreaInsets = useSafeAreaInsets();

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(currentChain);

        // TODO: Add the modal for explicit chain update.
        if (result.slient) {
          chainStore.tryUpdateChain(currentChainId);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChain, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };

    const subscriber = AppState.addEventListener("change", appStateHandler);

    return () => {
      subscriber.remove();
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing &&
          !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo,
    ])
  );

  useEffect(() => {
    onRefresh();
  }, [accountStore, chainStore, queriesStore]);

  useEffect(() => {
    showAccessTestnetToast();
  }, [chainStore.current.chainId]);

  const onRefresh = useCallback(async () => {
    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    if (nftSupportEnabled) {
      fetchFirstPageNFTs();
    }

    await Promise.all([
      waitBalanceResponses(),
      queryRewards.waitFreshResponse(),
      queryDelegations.waitFreshResponse(),
      queryUnbondingDelegations.waitFreshResponse(),
    ]);
  }, [accountStore, chainStore, queriesStore]);

  const onEndReached = async () => {
    if (nftSupportEnabled) {
      fetchNextPageNFTs();
    }
  };

  useEffect(() => {
    if (nftSupportEnabled) {
      setNFTs(observableNFTs.length !== 0 ? observableNFTs : [0]);
    }
  }, [observableNFTs]);

  const smartNavigation = useSmartNavigation();

  function showAccessTestnetToast() {
    if (chainStore.current.chainName.toLowerCase().indexOf("testnet") != -1) {
      toastModal.makeToast({
        type: "error",
        title: intl.formatMessage({ id: "common.alert.content.accessTestnet" }),
        bottomOffset: 44,
      });
    }
  }

  const account = accountStore.getAccount(chainStore.current.chainId);
  analyticsStore.setUserProperties({
    astra_hub_from_address: account.ethereumHexAddress,
  });

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          isRefresh?: boolean;
        }
      >,
      string
    >
  >();

  useEffect(() => {
    if (route.params && route.params.isRefresh) {
      console.log("refresh data main screen");
      onRefresh().then();
    }
  }, [onRefresh, route.params]);

  const sections = useMemo(() => {
    return [
      { index: 0, title: "balance", data: [{}] },
      { index: 1, title: "action", data: [{}] },
      {
        index: 2,
        title: "item",
        data: [
          ...(!nftSupportEnabled || selectedTabIndex === 0
            ? getBalances()
            : nfts),
        ],
      },
    ];
  }, [selectedTabIndex, nfts, waitBalanceResponses]);

  const viewDetailsNFTHandler = (data?: NFTData) => {
    if (data) {
      smartNavigation.navigateSmart("NFT.Details", {
        data,
      });
    }
  };

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const viewAnimOpacity = {
    opacity: opacityAnim.interpolate({
      inputRange: [0, 200],
      outputRange: [0, 1],
    }),
  };

  const onScrollContent = useCallback((e) => {
    opacityAnim.setValue(e.nativeEvent.contentOffset.y >= 200 ? 200 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={style.get("background-color-background")}>
      <ImageBackground
        style={style.flatten(["width-full", "height-full"])}
        source={require("../../assets/logo/main_background.png")}
        resizeMode="cover"
      >
        <View
          style={{
            height: safeAreaInsets.top + 44,
          }}
        >
          <Animated.View
            style={[
              {
                ...style.flatten([
                  "absolute",
                  "width-full",
                  "height-full",
                  "background-color-background",
                ]),
              },
              viewAnimOpacity,
            ]}
          />
          <View
            style={{
              ...style.flatten(["flex-row", "justify-center", "items-center"]),
              marginTop: safeAreaInsets.top,
            }}
          >
            <View style={{ width: 44 }} />
            <Text
              style={style.flatten([
                "text-large-bold",
                "color-white",
                "flex-1",
                "text-center",
              ])}
            >
              {intl.formatMessage({ id: "register.intro.appName" })}
            </Text>
            <TouchableOpacity
              style={style.flatten(["width-44", "height-44", "justify-center"])}
              onPress={() => {
                smartNavigation.navigateSmart("Camera", {});
              }}
            >
              <ScanIcon size={32} color={style.get("color-icon-white").color} />
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={sections}
          stickyHeaderIndices={[2]}
          stickySectionHeadersEnabled={true}
          onScroll={onScrollContent}
          renderSectionHeader={({ section }) => {
            if (section.index !== 2) {
              return null;
            }

            return (
              <View>
                <Animated.View
                  style={[
                    {
                      ...style.flatten([
                        "absolute",
                        "width-full",
                        "height-44",
                        "background-color-background",
                      ]),
                    },
                    viewAnimOpacity,
                  ]}
                />
                {nftSupportEnabled ? (
                  <CustomTabBar
                    data={[
                      {
                        title: intl.formatMessage({
                          id: "main.balance.asset.title",
                        }),
                      },
                      {
                        title: intl.formatMessage({
                          id: "main.balance.collection.title",
                        }),
                      },
                    ]}
                    onIndexChanged={(index) => {
                      setSelectedTabIndex(index);
                    }}
                  />
                ) : (
                  <Text
                    style={style.flatten([
                      "color-white",
                      "text-medium-medium",
                      "margin-left-16",
                    ])}
                  >
                    {intl.formatMessage({ id: "main.balance.asset.title" })}
                  </Text>
                )}
              </View>
            );
          }}
          renderSectionFooter={({ section }) => {
            if (section.index !== 2) {
              return null;
            }
            return <View style={style.flatten(["height-16"])} />;
          }}
          renderItem={({ index, section }) => {
            if (section.index === 0) {
              return (
                <AccountCardNew
                  containerStyle={style.flatten([
                    "background-color-transparent",
                    "margin-top-24",
                  ])}
                />
              );
            }

            if (section.index === 1) {
              return (
                <ActionsCard
                  containerStyle={style.flatten([
                    "background-color-transparent",
                    "margin-top-24",
                    "margin-bottom-40",
                  ])}
                />
              );
            }

            if (nftSupportEnabled && selectedTabIndex === 1) {
              if (index % 2 !== 0) {
                return null;
              }

              const leftData = section.data[index] as NFTData;

              if (typeof section.data[index] === "number") {
                return (
                  <NFTEmptyCell index={{ section: section.index, item: 0 }} />
                );
              }

              const rightData: NFTData | undefined =
                index + 1 < section.data.length
                  ? (section.data[index + 1] as NFTData)
                  : undefined;

              return (
                <View
                  style={style.flatten([
                    "flex-row",
                    "padding-x-16",
                    "padding-top-16",
                    "background-color-background",
                  ])}
                >
                  <NFTCell
                    index={{ section: section.index, item: index }}
                    data={leftData}
                    onPress={viewDetailsNFTHandler}
                  />
                  <View style={{ width: 16 }} />
                  {rightData !== undefined ? (
                    <NFTCell
                      index={{ section: section.index, item: index + 1 }}
                      data={rightData}
                      onPress={viewDetailsNFTHandler}
                    />
                  ) : (
                    <View style={style.flatten(["flex-1"])} />
                  )}
                </View>
              );
            }

            const token = section.data[index] as CoinPretty;

            return (
              <TokenItemNew
                containerStyle={style.flatten([
                  "height-74",
                  "background-color-card-background",
                  "border-radius-16",
                  "margin-x-page",
                ])}
                key={token.denom}
                chainInfo={chainStore.current}
                balance={token}
              />
            );
          }}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
          onEndReached={onEndReached}
          keyExtractor={(_item, index) => `nft_${index}`}
          style={style.flatten(["margin-bottom-48"])}
        />
        <View style={{ height: safeAreaInsets.bottom }} />
      </ImageBackground>
    </View>
  );
});
