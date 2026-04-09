import { evmClient } from "./wallet.js";

export const connect = async function () {
  try {
    const { accounts, chainId } = await evmClient.connect({
      chainIds: ["0x7a69"],
    });
    // console.log("Connected account:", accounts[0]);
    // console.log("Active chain:", chainId);
    return { address: accounts[0], chainId };
  } catch (error) {
    if (error.code === 4001) {
      console.log("User rejected the connection request");
    } else if (error.code === -32002) {
      console.log("Connection request already pending");
    } else {
      console.error("Connection failed:", error);
      throw error;
    }
  }
};
