const {Transaction, Block, BlockChain} = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const key = ec.keyFromPrivate(
  "1310869c42c0390b3a250609fb1cd1ff92ace9453bf3048d4d697a925bf2733f"
);

const myWalletPublicAddress = key.getPublic("hex");

let cardano = new BlockChain();

const transaction1 = new Transaction(10, myWalletPublicAddress, "address2");

transaction1.signTransaction(key);
cardano.addTransaction(transaction1);

const transaction2 = new Transaction(100, myWalletPublicAddress, "address3");

transaction2.signTransaction(key);
cardano.addTransaction(transaction2);

cardano.minePendingTransaction(myWalletPublicAddress);

console.log(cardano.getBalance(myWalletPublicAddress));
