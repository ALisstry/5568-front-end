import erc20Abi from "../ABI/AliceToken.json" with { type: "json" };
import addressJson from "./address.json" with { type: "json" };
import { web3 } from "./wallet.js";

const DEFAULT_SPENDER = addressJson.LendingPool;

const TOKEN_ALIAS = Object.freeze({
  Alice: addressJson.AliceToken,
  Bob: addressJson.BobToken,
  AliceToken: addressJson.AliceToken,
  BobToken: addressJson.BobToken,
});

function isAddressLike(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function resolveAssetAddress(asset) {
  if (!asset) {
    throw new Error("Asset is required");
  }

  if (isAddressLike(asset)) {
    return asset;
  }

  const fromAlias = TOKEN_ALIAS[String(asset).trim()];
  if (fromAlias) {
    return fromAlias;
  }

  throw new Error(`Unsupported asset: ${asset}`);
}

function getTokenContract(asset) {
  const assetAddress = resolveAssetAddress(asset);
  return new web3.eth.Contract(erc20Abi, assetAddress);
}

export async function getAllowance({ asset, owner, spender = DEFAULT_SPENDER }) {
  const tokenContract = getTokenContract(asset);
  const allowance = await tokenContract.methods.allowance(owner, spender).call();
  return BigInt(allowance);
}

async function sendWithEstimate(method, from) {
  let gas;
  try {
    gas = await method.estimateGas({ from });
  } catch {
    gas = undefined;
  }

  return method.send(gas ? { from, gas } : { from });
}

export async function approveIfNeeded({
  asset,
  amountWei,
  owner,
  spender = DEFAULT_SPENDER,
}) {
  const required = BigInt(String(amountWei));
  if (required <= 0n) {
    throw new Error("Approval amount must be greater than 0");
  }

  const currentAllowance = await getAllowance({ asset, owner, spender });
  if (currentAllowance >= required) {
    return null;
  }

  const tokenContract = getTokenContract(asset);
  const method = tokenContract.methods.approve(spender, String(required));
  return sendWithEstimate(method, owner);
}
