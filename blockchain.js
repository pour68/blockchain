const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// const key = ec.genKeyPair();
// const publicKey = key.getPublic("hex"); //
// const privateKey = key.getPrivate("hex"); // d04f6ca9afd57e2b216ff81cf2f5a5899aae8c820b3cbe4f869361445d39599d

class Transaction {
  constructor(
    amount,
    senderPublicAddress = "",
    recieverPublicAddress = "",
    timestamp = Date.now()
  ) {
    this.amount = amount;
    this.senderPublicAddress = senderPublicAddress;
    this.recieverPublicAddress = recieverPublicAddress;
    this.timestamp = timestamp;
  }

  hashGenerator() {
    return SHA256(
      `${this.amount}${this.recieverPublicAddress}${this.timestamp}`
    ).toString();
  }

  signTransaction(key) {
    if (key.getPublic("hex") !== this.senderPublicAddress) {
      throw new Error("You can not transfer for others.");
    }

    const hashCode = this.hashGenerator();
    const sign = key.sign(hashCode, "base64");

    this.signature = sign.toDER("hex");
  }

  isValidTransaction() {
    if (this.senderPublicAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("signature is wrong!");
    }

    const publicKey = ec.keyFromPublic(this.senderPublicAddress, "hex");
    return publicKey.verify(this.hashGenerator(), this.signature);
  }
}

class Block {
  constructor(transactions, prevHash = "", timestamp = Date.now()) {
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.prevHash = prevHash;
    this.hash = this.hashGenerator();
    this.nonce = 1;
  }

  hashGenerator() {
    return SHA256(
      `${this.hash}${this.prevHash}${this.timestamp}${JSON.stringify(
        this.transactions
      )}`
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.hashGenerator();
    }

    // mine successfully happen!
    console.log("mine successfully happen!");
  }

  hasValidTransactions() {
    this.transactions.forEach((transaction) => {
      if (!transaction.isValidTransaction()) {
        return false;
      }
    });

    return true;
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.generateGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 20;
  }

  generateGenesisBlock() {
    const firstBlock = new Block([], null);

    return firstBlock;
  }

  getLatestBlock() {
    const latestBlockIndex = this.chain.length - 1;

    return this.chain[latestBlockIndex];
  }

  getBalance(address) {
    let balance = 0;

    this.chain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        if (transaction.senderPublicAddress === address) {
          //   if (balance > transaction.amount) {
          balance -= transaction.amount;
          //   } else {
          //     throw new Error("not valid transaction, look your balance!");
          //   }
        }

        if (transaction.recieverPublicAddress === address) {
          balance += transaction.amount;
        }
      });
    });

    return balance;
  }

  addTransaction(transaction) {
    if (
      !transaction.senderPublicAddress ||
      !transaction.recieverPublicAddress
    ) {
      throw new Error("wrong public addresses");
    }

    if (!transaction.isValidTransaction()) {
      throw new Error();
    }

    // if (this.getBalance(transaction.senderPublicAddress) < transaction.amount) {
    //   throw new Error();
    // }

    this.pendingTransactions.push(transaction);

    console.log("transaction added successfully.");
  }

  minePendingTransaction(minerAddress) {
    let block = new Block(this.pendingTransactions);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(this.miningAward, null, minerAddress),
    ];
  }

  getAllTransactions(address) {
    let myTransaction = [];

    this.chain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        if (
          transaction.senderPublicAddress === address ||
          transaction.recieverPublicAddress === address
        ) {
          myTransaction.push(transaction);
        }
      });
    });

    return myTransaction;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      let currentBlock = this.chain[i];
      let prevBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.hashGenerator()) {
        return false;
      }

      if (prevBlock.hash !== currentBlock.prevHash) {
        return false;
      }
    }

    return true;
  }
}

module.exports.Transaction = Transaction;
module.exports.Block = Block;
module.exports.BlockChain = BlockChain;
