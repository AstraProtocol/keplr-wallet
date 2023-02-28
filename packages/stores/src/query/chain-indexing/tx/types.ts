export type Pagination = {
  total_record: number;
  total_page: number;
  current_page: number;
  limit: number;
};

export type Txs = {
  result: Tx[];
  pagination: Pagination;
};

export type Tx = {
  account: string;
  blockHeight: number;
  blockHash: string;
  blockTime: string;
  hash: string;
  messageTypes: string[];
  success: boolean;
  code: number;
  log: string;
  fee: { denom: string; amount: string }[];
  feePayer: string;
  feeGranter: string;
  gasWanted: number;
  gasUsed: number;
  memo: string;
  timeoutHeight: number;
  messages: TxMessage[];
};

export type TxMessage = {
  type: string;
  evmType: string;
  content:
    | SendContent
    | DelegateContent
    | UndelegateContent
    | BeginRedelegateContent
    | WithdrawDelegatorRewardContent
    | GrantContent
    | RevokeContent
    | ExecContent
    | EthereumTxContent
    | VoteContent
    | undefined;
};

export interface SendContent {
  fromAddress: string;
  toAddress: string;
  amount: { amount: string; denom: string }[];
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface DelegateContent {
  delegatorAddress: string;
  validatorAddress: string;
  amount: { amount: string; denom: string };
  autoClaimedRewards: { amount: string; denom: string };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface UndelegateContent {
  delegatorAddress: string;
  validatorAddress: string;
  amount: { amount: string; denom: string };
  autoClaimedRewards: { amount: string; denom: string };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
  unbondCompleteAt: Date;
}

export interface BeginRedelegateContent {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  amount: { amount: string; denom: string };
  autoClaimedRewards: { amount: string; denom: string };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
  unbondCompleteAt: Date;
}

export interface WithdrawDelegatorRewardContent {
  delegatorAddress: string;
  validatorAddress: string;
  recipientAddress: string;
  amount: { amount: string; denom: string }[];
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface GrantContent {
  params: {
    maybeSendGrant?: any;
    maybeStakeGrant?: any;
    maybeGenericGrant: {
      "@type": string;
      granter: string;
      grantee: string;
      grant: { expiration: string; authorization: { msg: string } };
    };
  };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface RevokeContent {
  params: {
    "@type": string;
    msgs: { "@type": string }[];
    grantee: string;
  };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface ExecContent {
  params: {
    "@type": string;
    msgs: { "@type": string }[];
    grantee: string;
  };
  amount: { amount: string; denom: string }[];
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface EthereumTxContent {
  params: {
    "@type": string;
    data: {
      "@type": string;
      gas: string;
      gasPrice: string;
      nonce: string;
      value: string;
      to: string;
    };
    from: string;
    hash: string;
    size: number;
  };
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}

export interface VoteContent {
  voter: string;
  // amount: { amount: string; denom: string }[];
  option: string;
  proposalId: string;
  txHash: string;
  msgName: string;
  version: number;
  msgIndex: number;
  name: string;
  uuid: string;
  height: number;
}
