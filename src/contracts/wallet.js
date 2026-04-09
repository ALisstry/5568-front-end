import { createEVMClient, getInfuraRpcUrls } from "@metamask/connect-evm";
import Web3 from "web3";
export const evmClient = await createEVMClient({
  dapp: {
    name: "5568 Project",
    url: window.location.href,
    // iconUrl: "https://mydapp.com/icon.png", // Optional
  },
  api: {
    supportedNetworks: {
      // "0x1": "https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY",
      // "0xaa36a7": "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY",
      "0x7a69": "http://127.0.0.1:8545", // Hardhat Network (本地开发网络)
    },
  },
});

export const provider = evmClient.getProvider();
export const web3 = new Web3(provider);
