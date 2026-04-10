import flashLoanBotAbi from "../ABI/FlashLoanBot.json" with { type: "json" };
import { web3 } from "./wallet.js";
import { resolveAssetAddress } from "./erc20.js";

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
  if (!/^[0-9]+$/.test(normalized)) {
    throw new Error("Invalid debtVaultId");
  }
  return BigInt(normalized);
}

export async function flashLiquidate({
  flashBotAddress,
  debtVaultId,
  debtAsset,
  collateralAsset,
  amount,
  unit = "ether",
}) {
  if (!web3.utils.isAddress(flashBotAddress)) {
    throw new Error("Invalid flash bot address");
  }

  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const assetAddress = resolveAssetAddress(debtAsset);
  const collateralAddress = resolveAssetAddress(collateralAsset);
  const amountWei = toWeiAmount(amount, unit);

  const contract = new web3.eth.Contract(flashLoanBotAbi, flashBotAddress);
  const receipt = await contract.methods
    .borrow(assetAddress, amountWei, normalizedDebtVaultId, collateralAddress)
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}
