import addressJson from "./address.json" with { type: "json" };
import abi from "../ABI/LendingPool.json" with { type: "json" };
import { web3 } from "./wallet.js";
const address = addressJson.LendingPool;
const lendingPool = new web3.eth.Contract(abi, address);
export const transferTest = async function () {
  // Get user's Ethereum public address
  const fromAddress = (await web3.eth.getAccounts())[0];

  const destination = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const amount = web3.utils.toWei("0.1", "ether"); // Convert 0.0001 ether to wei

  // Submit transaction to the blockchain and wait for it to be mined
  const receipt = await web3.eth.sendTransaction({
    from: fromAddress,
    to: destination,
    value: amount,
  });
  return receipt;
};

export const getBalance = async function () {
  try {
    const address = (await web3.eth.getAccounts())[0];
    return web3.utils.fromWei(await web3.eth.getBalance(address), "ether");
  } catch (err) {
    alert(err);
    throw err;
  }
};

export async function getAccountInfo() {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];

  try {
    const result = await lendingPool.methods
      .getAccountInfo(defaultAccount)
      .call();
    alert(web3.utils.fromWei(result.collateral, "ether"));
  } catch (err) {
    alert(err);
  }
}

export async function deposit(amount, unit) {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const finalAmount = web3.utils.toWei(String(amount), unit || "ether");

  try {
    const gas = await lendingPool.methods
      .deposit(finalAmount)
      .estimateGas({ from: defaultAccount });
    const receipt = await lendingPool.methods.deposit(finalAmount).send({
      from: defaultAccount,
      gas,
    });
    alert("Success: " + "Transaction Hash: " + receipt.transactionHash);
  } catch (err) {
    alert("Failed: " + err);
    throw err;
  }
}
