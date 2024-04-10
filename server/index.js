const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const {keccak256} = require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());

const balances = {
  "02904d1ef124cf6c92f5fb9ef44657b94d43d64f34d93e046fc61bafc3a1e8c7b9": 1000,
  "025cf9c5790e87521a89582fc3e9a50300690ad999c513ebcc29c6a9d56d3c13a0": 500,
  "03f1fbe33dc6a4c4b39e144b72608ed4a88f6a7f77fd5b4b7c77e59d989905ef0b": 800,
};


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // console.log('Hello send', req.body)
  // TODO
  // Get a signature from the client side  
  // Recover the public address from the signature
  const hashMessage = message => keccak256(Uint8Array.from(message));

  const { signature, message, sender } = req.body;
  const { recipient, amount } = message;

  const parsedSignature = {
    recovery: signature.recovery,
    r: BigInt(signature.r),
    s: BigInt(signature.s)
  }

  const isValid = secp.secp256k1.verify(parsedSignature, hashMessage(message), sender) === true;
  
  if(!isValid) res.status(400).send({ message: "Bad signature!"});
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
