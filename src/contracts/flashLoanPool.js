import flashLoanPoolAbi from "../ABI/FlashLoanPool.json" with { type: "json" };
import { web3 } from "./wallet.js";
import { resolveAssetAddress } from "./erc20.js";
import addressJson from "./address.json" with { type: "json" };
import { arrowMiddleware } from "element-plus";
const FlashLoanPoolAddress = addressJson.FlashLoanPool;
const flashLoanPool = new web3.eth.Contract(
  flashLoanPoolAbi,
  FlashLoanPoolAddress,
);

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

export async function getBalance() {
  return web3.utils.fromWei(
    await flashLoanPool.methods
      .getBalance("0x9bd03768a7DCc129555dE410FF8E85528A4F88b5")
      .call(),
    "ether",
  );
}
