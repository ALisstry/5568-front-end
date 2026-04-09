import abi from "../ABI/AliceToken.json" with { type: "json" };
import addressJson from "./address.json" with { type: "json" };
import { web3 } from "./wallet.js";
const address = addressJson.AliceToken;
const poolAddress = addressJson.LendingPool;
const aliceToken = new web3.eth.Contract(abi, address);
export async function approve(amount) {
  try {
    const result = await aliceToken.methods
      .approve(poolAddress, String(amount))
      .send({
        from: (await web3.eth.getAccounts())[0],
      });
    alert("Success: " + result);
    console.log(result);
  } catch (err) {
    alert("Failed: " + err);
  }
}

export async function balanceOf() {
  try {
    const result = await aliceToken.methods
      .balanceOf((await web3.eth.getAccounts())[0])
      .call();
    alert(`Success: ${web3.utils.fromWei(result, "ether")}`);
  } catch (err) {
    alert("Failed: " + err);
  }
}

export async function allowance() {
  try {
    const result = await aliceToken.methods
      .allowance((await web3.eth.getAccounts())[0], poolAddress)
      .call();
    alert("Success: " + web3.utils.fromWei(result, "ether"));
  } catch (err) {
    alert("Failed: " + err);
  }
}
