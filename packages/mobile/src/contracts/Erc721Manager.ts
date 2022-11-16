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

export const useNFTContract = () => {
  const { keyRingStore, transactionStore } = useStore();

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

  const transferNFTOwner = async (
    toAddress: string,
    mintedContractAddress: string,
    ticketId: BigNumberish,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) => {
    transactionStore.updateTxState("pending");

    const manager = await asyncManager;
    const response = await manager
      .getContract(mintedContractAddress)
      .transferFrom(manager.wallet.address, toAddress, ticketId);

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (onBroadcasted) {
      onBroadcasted(Buffer.from(response.hash.slice(2), "hex"));
    }

    const receipt = await response.wait();
    if (onFulfill) {
      onFulfill(receipt);
    }
    transactionStore.updateTxState("success");
  };

  const estimateGasTransferNFTOwner = async (
    toAddress: string,
    mintedContractAddress: string,
    ticketId: BigNumberish
  ) => {
    const manager = await asyncManager;
    return await manager
      .getContract(mintedContractAddress)
      .estimateGas.transferFrom(manager.wallet.address, toAddress, ticketId);
  };

  return {
    getNFTInfo,
    transferNFTOwner,
    estimateGasTransferNFTOwner,
  };
};
