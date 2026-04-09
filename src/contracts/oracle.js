import { web3 } from "./wallet.js";
import addressJson from "./address.json" with { type: "json" };
import ABI from "../ABI/SimpleOracle.json" with { type: "json" };

const address = addressJson.Oracle;
const bobAddress = addressJson.BobToken;
const aliceAddress = addressJson.AliceToken;
const oracle = new web3.eth.Contract(ABI, address);

async function getDefaultAccount() {
  const accounts = await web3.eth.getAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error("MetaMask account is not connected");
  }
  return accounts[0];
}
export async function getBobPrice() {
  try {
    return await oracle.methods.getPrice(bobAddress).call();
  } catch (err) {
    alert(err);
  }
}

export async function getAlicePrice() {
  try {
    return await oracle.methods.getPrice(aliceAddress).call();
  } catch (err) {
    alert(err);
  }
}
