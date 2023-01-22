import { ethers } from "./ethers.5.6.1.cdn.min.js";
import { contractAddress, abi } from "./config.js";

const content = document.getElementsByClassName("content-body")[0];
const connectButton = document.getElementsByClassName("btn-connect")[0];
const balanceButton = document.getElementsByClassName("btn-balance")[0];
const accountInfo = document.getElementsByClassName("account-info")[0];
const fundButton = document.getElementsByClassName("btn-fund")[0];
const withdrawButton = document.getElementsByClassName("btn-withdraw")[0];
const loadingLayer = document.getElementsByClassName("loader-container")[0];
const ethAmountInput = document.getElementById("eth_amount");

const disconnect = async () => {
  try {
    location.reload();
  } catch (e) {
    console.error(e);
  }
};

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("Wallet detected");
      const res = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      accountInfo.innerHTML = `Account: ${res[0]}`;
      connectButton.innerHTML = "Disconnect wallet";
      connectButton.onclick = disconnect;
      content.style = "display: block";
    } catch (e) {
      console.log("Connecting canceled");
    }
  } else {
    alert("Please install MetaMask to continue working");
  }
};

const fund = async () => {
  try {
    const ethAmount = ethAmountInput.value;
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      try {
        loadingLayer.style = "display: flex";
        const transactionRes = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        });

        await listenForTransactionMine(transactionRes, provider);
        console.log("Done!");
        loadingLayer.style = "display: none";
        ethAmountInput.value = null;
      } catch (e) {
        console.error(e);
        loadingLayer.style = "display: none";
      }
    } else {
      alert("Please install MetaMask to continue working");
    }
  } catch (e) {
    console.error(e);
    loadingLayer.style = "display: none";
  }
};

const getBalance = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
    document.getElementsByClassName(
      "contract-balance"
    )[0].innerHTML = `Contract balance: ${ethers.utils.formatEther(
      balance
    )} ETH`;
  } else {
    alert("Please install MetaMask to continue working");
  }
};

const withdraw = async () => {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      loadingLayer.style = "display: flex";
      const transactionRes = await contract.withdraw();
      await listenForTransactionMine(transactionRes, provider);
      console.log("Done!");
      loadingLayer.style = "display: none";
    } catch (e) {
      console.error(e);
      loadingLayer.style = "display: none";
    }
  } else {
    alert("Please install MetaMask to continue working");
    loadingLayer.style = "display: none";
  }
};

const listenForTransactionMine = (transactionRes, provider) => {
  return new Promise((resolve, reject) => {
    provider.once(transactionRes.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve(transactionReceipt.confirmations);
    });
  });
};

const main = () => {
  if (!!connectButton) {
    connectButton.onclick = connect;
  }
  if (!!fundButton) {
    fundButton.onclick = fund;
  }
  if (!!balanceButton) {
    balanceButton.onclick = getBalance;
  }
  if (!!withdrawButton) {
    withdrawButton.onclick = withdraw;
  }
};

main();
