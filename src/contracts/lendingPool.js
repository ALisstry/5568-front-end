import addressJson from "./address.json" with { type: "json" };
import abi from "../ABI/LendingPool.json" with { type: "json" };
import { web3 } from "./wallet.js";
import { approveIfNeeded, resolveAssetAddress } from "./erc20.js";

const address = addressJson.LendingPool;
const lendingPool = new web3.eth.Contract(abi, address);

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

  let amountWei;
  try {
    amountWei = web3.utils.toWei(normalizedAmount, unit);
  } catch {
    throw new Error(`Invalid amount or unit: ${normalizedAmount} ${unit}`);
  }

  if (BigInt(amountWei) <= 0n) {
    throw new Error("Amount must be greater than 0");
  }

  return amountWei;
}

function normalizeDebtVaultId(debtVaultId) {
  const normalized = String(debtVaultId ?? "").trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error("Invalid debtVaultId");
  }
  return normalized;
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

export const transferTest = async function () {
  const fromAddress = await getDefaultAccount();

  const destination = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const amount = web3.utils.toWei("0.1", "ether");

  const receipt = await web3.eth.sendTransaction({
    from: fromAddress,
    to: destination,
    value: amount,
  });
  return receipt;
};

export const getBalance = async function () {
  try {
    const account = await getDefaultAccount();
    return web3.utils.fromWei(await web3.eth.getBalance(account), "ether");
  } catch (err) {
    alert(err);
    throw err;
  }
};

export async function getAccountInfo() {
  const defaultAccount = await getDefaultAccount();
  const debtVaultIds = await lendingPool.methods
    .getOwnerDebtVaultIds(defaultAccount)
    .call();

  alert(
    debtVaultIds.length
      ? `DebtVault IDs: ${debtVaultIds.join(", ")}`
      : "No DebtVault found"
  );

  return debtVaultIds;
}

export async function getOwnerDebtVaultIds(ownerAddress) {
  const owner = ownerAddress || (await getDefaultAccount());
  return lendingPool.methods.getOwnerDebtVaultIds(owner).call();
}

export async function openDebtVault() {
  const defaultAccount = await getDefaultAccount();
  const predictedId = await lendingPool.methods.nextDebtVaultId().call();
  const receipt = await sendWithEstimate(
    lendingPool.methods.openDebtVault(),
    defaultAccount
  );

  return {
    debtVaultId: String(predictedId),
    txHash: receipt.transactionHash,
    receipt,
  };
}

export async function deposit({ asset, amount, unit = "ether" }) {
  const defaultAccount = await getDefaultAccount();
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const approveReceipt = await approveIfNeeded({
    asset: assetAddress,
    amountWei,
    owner: defaultAccount,
    spender: address,
  });

  const receipt = await sendWithEstimate(
    lendingPool.methods.deposit(assetAddress, amountWei),
    defaultAccount
  );

  return {
    txHash: receipt.transactionHash,
    approveTxHash: approveReceipt?.transactionHash || "",
    receipt,
    approveReceipt,
  };
}

export async function withdraw({ asset, amount, unit = "ether" }) {
  const defaultAccount = await getDefaultAccount();
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const receipt = await sendWithEstimate(
    lendingPool.methods.withdraw(assetAddress, amountWei),
    defaultAccount
  );

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}

export async function borrow({ debtVaultId, asset, amount, unit = "ether" }) {
  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const receipt = await sendWithEstimate(
    lendingPool.methods.borrow(normalizedDebtVaultId, assetAddress, amountWei),
    defaultAccount
  );

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}

export async function repay({ debtVaultId, asset, amount, unit = "ether" }) {
  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const approveReceipt = await approveIfNeeded({
    asset: assetAddress,
    amountWei,
    owner: defaultAccount,
    spender: address,
  });

  const receipt = await sendWithEstimate(
    lendingPool.methods.repay(normalizedDebtVaultId, assetAddress, amountWei),
    defaultAccount
  );

  return {
    txHash: receipt.transactionHash,
    approveTxHash: approveReceipt?.transactionHash || "",
    receipt,
    approveReceipt,
  };
}
