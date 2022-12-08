import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AppState,
  AppStateStatus,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { useStyle } from "../../styles";

import { observer } from "mobx-react-lite";

import { ChainUpdaterService } from "@keplr-wallet/background";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { FormattedMessage } from "react-intl";
import { RectButton } from "react-native-gesture-handler";
import { usePrevious } from "../../hooks";
import { useSmartNavigation } from "../../navigation-util";
import {
  ITransactionItem,
  useTransactionHistory,
} from "./hook/use-transaction-history";
import { TransactionItem } from "./transaction_history_item";

export type PageRequestInfo = {
  totalRecord: number;
  totalPage: number;
  currentPage: number;
  limit: number;
};

export const HistoryScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          isNavigated?: boolean;
        }
      >,
      string
    >
  >();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 0,
    limit: 20,
  } as PageRequestInfo);
  const [histories, setHistories] = useState([] as ITransactionItem[]);

  const { chainStore } = useStore();
  const { getTxs, parseTx } = useTransactionHistory();

  const style = useStyle();

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const smartNavigation = useSmartNavigation();
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
    if (pageInfo.currentPage == 0) {
      refreshHandler();
    }
  }, [pageInfo]);

  const refreshHandler = async () => {
    if (refreshing || loading) {
      return;
    }

    setRefreshing(true);

    const { txs, pagination } = await getTxs(1, pageInfo.limit);
    const firstPageHistories = txs.map((tx) =>
      parseTx(tx)
    ) as ITransactionItem[];

    setHistories(firstPageHistories);
    setPageInfo({
      totalRecord: pagination.total_record,
      totalPage: pagination.total_page,
      currentPage: pagination.current_page,
      limit: pagination.limit,
    });
    setRefreshing(false);
  };

  const loadMoreHandler = async () => {
    if (loading || pageInfo.currentPage >= pageInfo.totalPage) {
      return;
    }

    setLoading(true);

    const { txs, pagination } = await getTxs(
      pageInfo.currentPage + 1,
      pageInfo.limit
    );
    const nextPageHistories = txs.map((tx) =>
      parseTx(tx)
    ) as ITransactionItem[];

    let newestHistories = [] as ITransactionItem[];
    if (pagination.total_record > pageInfo.totalRecord) {
      const limit = pagination.total_record - pageInfo.totalRecord;
      const { txs } = await getTxs(1, limit);
      newestHistories = txs.map((tx) => parseTx(tx)) as ITransactionItem[];
    }

    setHistories([...newestHistories, ...histories, ...nextPageHistories]);
    setPageInfo({
      totalRecord: pagination.total_record,
      totalPage: pagination.total_page,
      currentPage: pagination.current_page,
      limit: pagination.limit,
    });
    setLoading(false);
  };

  return (
    <View style={style.flatten(["flex-grow-1", "background-color-background"])}>
      <FlatList
        style={style.flatten(["flex-1", "padding-x-page"])}
        data={histories}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshHandler} />
        }
        ListEmptyComponent={
          <Text
            style={style.flatten([
              "color-text-black-low",
              "text-left",
              "padding-3",
              "body3",
              "flex-1",
            ])}
          >
            <FormattedMessage id="history.emptyHistory" />
          </Text>
        }
        ItemSeparatorComponent={() => (
          <View
            style={style.flatten([
              "height-1",
              "background-color-card-separator",
            ])}
          />
        )}
        ListFooterComponent={
          <View style={{ flex: 1 }}>
            {loading && (
              <Text
                style={style.flatten([
                  "color-text-black-low",
                  "text-center",
                  "padding-3",
                  "body3",
                  "flex-1",
                ])}
              >
                <FormattedMessage id="common.loading" />
              </Text>
            )}
          </View>
        }
        onEndReached={loadMoreHandler}
        keyExtractor={(_item, index) => `transaction_${index}`}
        renderItem={({ item }) => (
          <RectButton
            style={style.flatten(["margin-y-16"])}
            activeOpacity={0}
            onPress={() => {
              const chainId = chainStore.current.chainId;
              const txExplorer = chainStore.getChain(chainId).raw.txExplorer;
              const txHash = item.hash;
              if (txExplorer && txHash) {
                const url = txExplorer.txUrl.replace(
                  "{txHash}",
                  txHash.toUpperCase()
                );
                smartNavigation.navigateSmart("WebView", {
                  url: url,
                });
              }
            }}
          >
            <TransactionItem item={item} />
          </RectButton>
        )}
      />
      {route.params?.isNavigated !== true ? (
        <View style={style.flatten(["height-44"])} />
      ) : null}
      <SafeAreaView />
    </View>
  );
});
