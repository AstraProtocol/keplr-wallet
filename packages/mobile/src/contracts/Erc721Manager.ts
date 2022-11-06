import { Contract } from "@ethersproject/contracts";
import Axios from "axios";
import { ethers } from "ethers";
import { EthereumEndpoint } from "../config";
import Erc721ABI from "./abis/erc721.json";
import { Erc721 } from "./types/Erc721";

// TODO: khanh.vo: Cap nhat 
// Wallet: privateKey, hexAddress
// Sample Blockchain sdk: mintedContractAddress, ticketId
const privateKey =
  "306067cff8bbd7cdb8374c589b32deedf6c2b9c4b66d8f8618e53e9712b873b8";
const hexAddress = "0x1f6183b9b06a90c4df957bcb4cbfa8a1d72d82e3";
const mintedContractAddress = "0xf7ccc44e94f0961a816d80de86842612ece5cfa7";
const ticketId = 2022;

export class Erc721Manager {
  static shared = new Erc721Manager(EthereumEndpoint, privateKey);

  readonly provider: ethers.providers.JsonRpcProvider;
  readonly wallet: ethers.Wallet;

  constructor(rpc: string, privateKey: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  getContract = (contractAddress: string): Erc721 => {
    return new Contract(contractAddress, Erc721ABI, this.wallet) as Erc721;
  };
}

// TODO: khanh.vo: sample code
const sampleCode = async () => {
  const contract = Erc721Manager.shared.getContract(mintedContractAddress);
  console.log("__DEBUG__ contract", contract);

  try {
    const uri = await contract.tokenURI(ticketId);
    // const uri = `https://ipfs.io/ipfs/QmWiQE65tmpYzcokCheQmng2DCM33DEhjXcPB6PanwpAZo/${ticketId}`
    const info = (await Axios.get(uri)).data;
    console.log("__DEBUG__ nft info", info);

    const tokenIds = await contract.getTokenIdsOfOwner(hexAddress);
    console.log("__DEBUG__ nft tokenIds", tokenIds);
  } catch (e) {
    console.log("__DEBUG__ error", e);
  }
};
