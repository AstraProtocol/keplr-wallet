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
