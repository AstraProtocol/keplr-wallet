import { useStore } from "../../../stores";

export const useQueryNfts = () => {
  const {
    chainStore,
    accountStore,
    queriesStore,
    userBalanceStore,
  } = useStore();

  const chainId = chainStore.current.chainId;

  const getNFTs = async (pageInfo: { page: number; limit: number }) => {
    const account = accountStore.getAccount(chainId);
    const queries = queriesStore.get(chainId);
    const chain = chainStore.getChain(chainId);

    const queryNfts = queries.cosmos.queryNfts.getQueryHexAddress(
      account.ethereumHexAddress,
      chain.raw.ticketHubUrl,
      pageInfo
    );

    await queryNfts.waitFreshResponse();

    return { nfts: queryNfts.nfts, pagination: queryNfts.pagination };
  };

  const fetchNextPageNFTs = () => {
    if (userBalanceStore.fetching) {
      return;
    }

    const page = userBalanceStore.pagination.page;
    const limit = userBalanceStore.pagination.limit;
    const total = userBalanceStore.pagination.total;

    if (page !== 0 && page * limit >= total) {
      return;
    }

    userBalanceStore.setFetching(true);

    getNFTs({
      page: page + 1,
      limit,
    })
      .then(({ nfts, pagination }) => {
        userBalanceStore.appendNFTs(nfts);
        userBalanceStore.setPagination(pagination);
        userBalanceStore.setFetching(false);
      })
      .catch((e) => {
        userBalanceStore.setFetching(false);
      });
  };

  const fetchFirstPageNFTs = () => {
    if (userBalanceStore.fetching) {
      return;
    }

    userBalanceStore.setFetching(true);

    getNFTs({
      page: 1,
      limit: userBalanceStore.pagination.limit,
    })
      .then(({ nfts, pagination }) => {
        if (
          userBalanceStore.pagination.total !== pagination.total ||
          (nfts.length !== 0 &&
            userBalanceStore.nfts.length !== 0 &&
            (userBalanceStore.nfts[0].collection_address !==
              nfts[0].collection_address ||
              userBalanceStore.nfts[0].token_id !== nfts[0].token_id))
        ) {
          userBalanceStore.setNFTs(nfts);
          userBalanceStore.setPagination(pagination);
        }

        userBalanceStore.setFetching(false);
      })
      .catch((e) => {
        userBalanceStore.setFetching(false);
      });
  };

  return {
    getNFTs,
    fetchFirstPageNFTs,
    fetchNextPageNFTs,
    nfts: userBalanceStore.nfts,
    pagination: userBalanceStore.pagination,
  };
};
