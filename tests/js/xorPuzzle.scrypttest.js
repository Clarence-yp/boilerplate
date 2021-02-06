/**
 * Test for xorPuzzle contract in JavaScript
 **/
const path = require('path');
const { expect } = require('chai');
const {
  bsv,
  buildContractClass,
  PubKey,
  Sig,
  signTx,
  toHex,
  Bytes,
} = require('scryptlib');
const {
  inputIndex,
  inputSatoshis,
  newTx,
  compileContract,
} = require('../../helper');

// for xor with publicKeyA
const data = '9999';
const dataBuf = Buffer.from(data);
const dataBufHash = bsv.crypto.Hash.sha256(dataBuf);
const dataBufHashHex = toHex(dataBufHash).padStart(66, '0');
const dataBufHashBI = BigInt('0x' + dataBufHashHex);
console.log(dataBufHashBI);
console.log(dataBufHashHex);

const data_false = '9998';
const dataBuf_false = Buffer.from(data_false);
const dataBufHash_false = bsv.crypto.Hash.sha256(dataBuf_false);
const dataBufHashHex_false = toHex(dataBufHash_false).padStart(66, '0');

// for output of locking transaction
const privateKeyA = new bsv.PrivateKey.fromRandom('testnet');
console.log(`Private key generated: '${privateKeyA.toWIF()}'`);
const publicKeyA = privateKeyA.publicKey;
const publicKeyAHex = toHex(publicKeyA);
const publicKeyABI = BigInt('0x' + publicKeyAHex);
console.log(publicKeyABI);
console.log(publicKeyAHex);

const xorResult = dataBufHashBI ^ publicKeyABI;
let xorResultHex = xorResult.toString(16).padStart(66, '0');
console.log(xorResult);
console.log(xorResultHex);

const privateKeyB = new bsv.PrivateKey.fromRandom('testnet');
console.log(`Private key generated: '${privateKeyB.toWIF()}'`);
const addressB = privateKeyB.toAddress();

const tx = newTx();

describe('Test sCrypt contract HashPuzzle In Javascript', () => {
  let xorPuzzle, result, sig;

  before(() => {
    const XorPuzzle = buildContractClass(compileContract('xorPuzzle.scrypt'));
    xorPuzzle = new XorPuzzle(new Bytes(xorResultHex));
    xorPuzzle.txContext = { tx, inputIndex, inputSatoshis };
    sig = signTx(
      tx,
      privateKeyA,
      xorPuzzle.lockingScript.toASM(),
      inputSatoshis
    );
    console.log(toHex(sig));
    console.log(tx.toString());
  });

  it('check should succeed when correct data provided', () => {
    result = xorPuzzle
      .unlock(
        new Sig(toHex(sig)),
        new PubKey(toHex(publicKeyA)),
        new Bytes(dataBufHashHex)
      )
      .verify();
    expect(result.success, result.error).to.be.true;
  });

  it('check should fail when wrong data provided', () => {
    result = xorPuzzle
      .unlock(
        new Sig(toHex(sig)),
        new PubKey(toHex(publicKeyA)),
        new Bytes(dataBufHashHex_false)
      )
      .verify();
    expect(result.success, result.error).to.be.false;
  });
});
