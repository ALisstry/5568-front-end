import flashLoanSwapAbi from "../ABI/FlashLoanSwap.json" with { type: "json" };
import { web3 } from "./wallet.js";
import addressJson from "./address.json" with { type: "json" };
const flashLoanSwapAddress = addressJson.FlashLoanSwap;
const flashLoanSwap = new web3.eth.Contract(
  flashLoanSwapAbi,
  flashLoanSwapAddress,
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

export async function setExchangeRate(exchangeRate, unit = "ether") {
  return await flashLoanSwap.methods
    .setExchangeRate(toWeiAmount(exchangeRate, unit))
    .send({ from: await getDefaultAccount() });
}
