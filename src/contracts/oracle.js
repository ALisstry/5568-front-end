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

function toWeiAmount(amount, unit = "ether") {
  const normalizedAmount = String(amount ?? "").trim();
  if (!normalizedAmount) {
    throw new Error("Amount is required");
  }

  try {
    return web3.utils.toWei(normalizedAmount, unit);
  } catch {
    throw new Error(`Invalid amount or unit: ${normalizedAmount} ${unit}`);
  }
}

function resolveAssetAddress(asset) {
  if (asset === "Alice") return aliceAddress;
  if (asset === "Bob") return bobAddress;
  if (web3.utils.isAddress(asset)) return asset;
  throw new Error(`Unsupported asset: ${asset}`);
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

export async function setPrice({ asset, amount, unit = "ether" }) {
  const defaultAccount = await getDefaultAccount();
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const receipt = await oracle.methods
    .setPrice(assetAddress, amountWei)
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}
