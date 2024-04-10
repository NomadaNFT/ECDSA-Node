import { useState } from "react";
import * as secp from 'ethereum-cryptography/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak";

import server from "./server";

/**
   * Private keys
   * 
   * - ffeef1ba36dd7472a7ae1f221833d5588963085af807d2f3a16bb946d63b64f7
   * - f2e3a7d3f7cb6c9bee98f253cebf497d97c428df65312441390da264be8b808f
   * - bcd83f574b3444357f411f9e8a3b800e0c33a2e814d147463d64193befb7be31
   * 
   * Public Keys
   * 
   * - 02904d1ef124cf6c92f5fb9ef44657b94d43d64f34d93e046fc61bafc3a1e8c7b9
   * - 025cf9c5790e87521a89582fc3e9a50300690ad999c513ebcc29c6a9d56d3c13a0
   * - 03f1fbe33dc6a4c4b39e144b72608ed4a88f6a7f77fd5b4b7c77e59d989905ef0b
   * 
   */

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  const signMessage = (msg) => secp.secp256k1.sign(hashMessage(msg), privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    const message = {
      amount: sendAmount * 1,
      recipient
    }

    console.log('Private Key: ', privateKey)
    console.log('Message: ', message)
    // debugger;
    const signedMessage = signMessage(message);

    const r = signedMessage.r.toString();
    const s = signedMessage.s.toString();
    const recovery = signedMessage.recovery;

    console.log('Signature', signedMessage);
    // debugger;


    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: {
          r,
          s,
          recovery
        },
        message,
        sender: address,
      });
      setBalance(balance);
    } catch (ex) {
      console.log('Exception: ', ex.message)
      alert(ex.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
