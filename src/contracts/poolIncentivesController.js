import poolIncentivesControllerABI from "../ABI/PoolIncentivesController.json" with { type: "json" };
import addressJson from "./address.json" with { type: "json" };
import { web3 } from "./wallet.js";
import { getConnectedAccounts } from "./wallet.js";

const poolIncentivesControllerAddress = addressJson.PoolIncentivesController;
const poolIncentivesController = new web3.eth.Contract(
  poolIncentivesControllerABI,
  poolIncentivesControllerAddress,
);

// 获取当前可收取奖励代币数量
export async function getUnclaimedRewards() {
  const accounts = await getConnectedAccounts();
  try {
    return await poolIncentivesController.methods
      .unclaimedRewards(accounts[0])
      .call();
  } catch (err) {
    alert(err);
  }
}

// 收取奖励代币
export async function claimPoolCoin() {
  const accounts = await getConnectedAccounts();
  try {
    return await poolIncentivesController.methods
      .claimRewards(accounts[0])
      .send({
        from: accounts[0],
      });
  } catch (err) {
    alert(err);
  }
}
