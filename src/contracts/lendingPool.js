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
  return BigInt(normalized);
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
      : "No DebtVault found",
  );

  return debtVaultIds;
}

export async function getOwnerDebtVaultIds(ownerAddress) {
  const owner = ownerAddress || (await getDefaultAccount());
  return lendingPool.methods.getOwnerDebtVaultIds(owner).call();
}

export async function getReserveAssetsWithConfig() {
  try {
    const reserves = await lendingPool.methods.getReserveAssets().call();
    // 返回所有的储备资产列表
    // 前端可以根据 API 文档了解哪些资产可以作为抵押物
    return reserves;
  } catch (err) {
    console.error("Failed to get reserve assets:", err);
    return [];
  }
}

export async function getUserCustodiedShares(userAddress, assetAddress) {
  const user = userAddress || (await getDefaultAccount());
  try {
    const shares = await lendingPool.methods
      .getUserCustodiedShares(user, assetAddress)
      .call();
    return String(shares);
  } catch (err) {
    console.error("Failed to get custodied shares:", err);
    return "0";
  }
}

export async function getUserDebtBalance(userAddress, assetAddress) {
  const user = userAddress || (await getDefaultAccount());
  try {
    const debt = await lendingPool.methods
      .getUserDebtBalance(user, assetAddress)
      .call();
    return String(debt);
  } catch (err) {
    console.error("Failed to get debt balance:", err);
    return "0";
  }
}

export async function openDebtVault() {
  const defaultAccount = await getDefaultAccount();
  const predictedId = await lendingPool.methods.nextDebtVaultId().call();
  const receipt = await lendingPool.methods
    .openDebtVault()
    .send({ from: defaultAccount });

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

  const receipt = await lendingPool.methods
    .deposit(assetAddress, amountWei)
    .send({ from: defaultAccount });

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

  const receipt = await lendingPool.methods
    .withdraw(assetAddress, amountWei)
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}

export async function depositCollateral({
  debtVaultId,
  asset,
  amount,
  unit = "ether",
}) {
  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const receipt = await lendingPool.methods
    .depositCollateral(normalizedDebtVaultId, assetAddress, amountWei)
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    receipt,
  };
}

export async function withdrawCollateral({
  debtVaultId,
  asset,
  amount,
  unit = "ether",
}) {
  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const assetAddress = resolveAssetAddress(asset);
  const amountWei = toWeiAmount(amount, unit);

  const receipt = await lendingPool.methods
    .withdrawCollateral(normalizedDebtVaultId, assetAddress, amountWei)
    .send({ from: defaultAccount });

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

  const receipt = await lendingPool.methods
    .borrow(normalizedDebtVaultId, assetAddress, amountWei)
    .send({ from: defaultAccount });

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

  const receipt = await lendingPool.methods
    .repay(normalizedDebtVaultId, assetAddress, amountWei)
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    approveTxHash: approveReceipt?.transactionHash || "",
    receipt,
    approveReceipt,
  };
}

export async function liquidate({
  debtVaultId,
  debtAsset,
  collateralAsset,
  amount,
  unit = "ether",
}) {
  const defaultAccount = await getDefaultAccount();
  const normalizedDebtVaultId = normalizeDebtVaultId(debtVaultId);
  const debtAssetAddress = resolveAssetAddress(debtAsset);
  const collateralAssetAddress = resolveAssetAddress(collateralAsset);
  const amountWei = toWeiAmount(amount, unit);

  const approveReceipt = await approveIfNeeded({
    asset: debtAssetAddress,
    amountWei,
    owner: defaultAccount,
    spender: address,
  });

  const receipt = await lendingPool.methods
    .liquidate(
      normalizedDebtVaultId,
      debtAssetAddress,
      collateralAssetAddress,
      amountWei,
    )
    .send({ from: defaultAccount });

  return {
    txHash: receipt.transactionHash,
    approveTxHash: approveReceipt?.transactionHash || "",
    receipt,
  };
}

export async function diagnosticCheck() {
  console.log("🔍 启动诊断检查...");

  try {
    // 1. 检查连接
    const accounts = await web3.eth.getAccounts();
    console.log("✓ 账户:", accounts[0]);

    // 2. 检查合约地址
    console.log("✓ LendingPool 地址:", address);

    // 3. 检查合约是否可访问
    const code = await web3.eth.getCode(address);
    if (code === "0x") {
      console.error("❌ 错误：LendingPool 地址上没有合约代码");
      return false;
    }
    console.log("✓ 合约代码存在");

    // 4. 检查账户余额
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log("✓ 账户余额:", web3.utils.fromWei(balance, "ether"), "ETH");

    // 5. 尝试简单的 read-only 调用
    try {
      const reserves = await lendingPool.methods.getReserveAssets().call();
      console.log("✓ getReserveAssets 可用，包含:", reserves.length, "个资产");
    } catch (err) {
      console.error("❌ getReserveAssets 失败:", err?.message);
    }

    // 6. 检查 ABI 中的方法
    const methodNames = abi
      .filter((item) => item.type === "function")
      .map((item) => item.name);
    console.log("✓ ABI 包含", methodNames.length, "个方法");

    console.log("✅ 诊断完成");
    return true;
  } catch (err) {
    console.error("❌ 诊断失败:", err);
    return false;
  }
}
