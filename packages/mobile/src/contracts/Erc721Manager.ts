import { Contract } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import Axios from "axios";
import { BigNumberish, Wallet } from "ethers";
import { useMemo } from "react";
import { default as Web3HttpProvider } from "web3-providers-http";
import { EthereumEndpoint } from "../config";
import { useStore } from "../stores";
import Erc721ABI from "./abis/erc721.json";
import { Erc721 } from "./types/Erc721";

// TODO: khanh.vo: Cap nhat
// Wallet: privateKey, hexAddress
// Sample Blockchain sdk: mintedContractAddress, ticketId
// const privateKey =
//   "306067cff8bbd7cdb8374c589b32deedf6c2b9c4b66d8f8618e53e9712b873b8";
// const hexAddress = "0x1f6183b9b06a90c4df957bcb4cbfa8a1d72d82e3";
// const mintedContractAddress = "0xf7ccc44e94f0961a816d80de86842612ece5cfa7";
// const ticketId = 2022;

export const useErc721Contract = () => {
  const { keyRingStore } = useStore();

  const asyncManager = useMemo(async () => {
    const privateKey = await keyRingStore.exportPrivateKey();
    const provider = new Web3Provider(
      new (Web3HttpProvider as any)(EthereumEndpoint)
    );
    const wallet = new Wallet(privateKey, provider);

    const getContract = (contractAddress: string): Erc721 => {
      return new Contract(contractAddress, Erc721ABI, wallet) as Erc721;
    };

    return {
      provider,
      wallet,
      getContract,
    };
    // return new Erc721Manager(EthereumEndpoint, privateKey);
  }, [keyRingStore]);

  const getNFTInfo = async (
    mintedContractAddress: string,
    ticketId: BigNumberish
  ) => {
    const uri = await (await asyncManager)
      .getContract(mintedContractAddress)
      .tokenURI(ticketId);
    return (await Axios.get(uri)).data;
  };

  const getBalanceOf = async (mintedContractAddress: string) => {
    const manager = await asyncManager;
    const balance = await manager
      .getContract(mintedContractAddress)
      .balanceOf(manager.wallet.address);
    return balance;
  };

  return {
    getNFTInfo,
    getBalanceOf,
  };
};

// export class Erc721Manager {
//   static shared = new Erc721Manager(EthereumEndpoint, privateKey);

//   readonly provider: Web3Provider;
//   readonly wallet: ethers.Wallet;

//   constructor(rpc: string, privateKey: string) {
//     this.provider = new Web3Provider(new (Web3HttpProvider as any)(rpc));
//     this.wallet = new ethers.Wallet(privateKey, this.provider);
//   }

//   getContract = (contractAddress: string): Erc721 => {
//     return new Contract(contractAddress, Erc721ABI, this.wallet) as Erc721;
//   };
// }
