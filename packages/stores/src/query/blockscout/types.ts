export type Tokens = {
  result: Token[];
  hasNextPage: boolean;
  nextPagePath: string;
};

export type Token = {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
};
