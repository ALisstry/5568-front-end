import poolCoinABI from "../ABI/PoolCoin.json" with { type: "json" };
import addressJson from "./address.json" with { type: "json" };
import { web3 } from "./wallet.js";
import { getConnectedAccounts } from "./wallet.js";

const poolCoinAddress = addressJson.PoolCoin;
const poolCoin = new web3.eth.Contract(poolCoinABI, poolCoinAddress);

// 获取当前奖励代币数量
export async function getPoolCoinbalance() {
  const accounts = await getConnectedAccounts();
  try {
    return await poolCoin.methods.balanceOf(accounts[0]).call();
  } catch (err) {
    alert(err);
  }
}
