export type Pagination = {
  limit: number;
  page: number;
  total: number;
};

export type NFTResponse = {
  result: {
    data: NFTData[];
    limit: number;
    page: number;
    total: number;
  };
};

export type NFTData = {
  collection_name: string;
  collection_address: string;
  collection_url: string;
  token_standard: string;
  contract_address: string;
  token_id: string;
  owner_address: string;
  time: string;
  title: string;
  subtitle: string;
  thumbnail_url: string;
  image_url: string;
  metabase_url: string;
  metadata: {
    name: string;
    image: string;
    attributes: {
      value: string;
      trait_type: string;
    }[];
    description: string;
    external_url: string;
    animation_url: string;
  };
};
