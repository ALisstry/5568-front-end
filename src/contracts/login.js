import { evmClient, notifyWalletConnected } from "./wallet.js";

export const connect = async function () {
  try {
    const { accounts, chainId } = await evmClient.connect({
      chainIds: ["0x7a69"],
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("MetaMask did not return any account");
    }

    const result = { address: accounts[0], chainId };
    notifyWalletConnected(result);
    return result;
  } catch (error) {
    if (error.code === 4001) {
      throw new Error("MetaMask connection was rejected");
    }

    if (error.code === -32002) {
      throw new Error("MetaMask connection request is already pending");
    }

    console.error("Connection failed:", error);
    throw error;
  }
};
