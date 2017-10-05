// https://github.com/bitcoin/bips/blob/master/bip-0019.mediawiki
// https://bitcointalk.org/index.php?topic=918183.0
// http://www.cs.princeton.edu/~tongbinw/bitcoinIDE/build/editor.html
var bitcoin = require('bitcoinjs-lib');

var network = bitcoin.networks.testnet;

var pair1 = bitcoin.ECPair.fromWIF('cTRa78FCBcMH9hAWo3mqf1k7XWeLTanLwiVK4YKyf7aCXvb6wG5A', network);
console.log(pair1.getPublicKeyBuffer().toString('hex'));

var pair2 = bitcoin.ECPair.fromWIF('cVaBixERMwUNpTGJyKtx43m9b4BjTr8ZoUTDqh5utQeLroyajZ3i', network);
var pair3 = bitcoin.ECPair.fromWIF('cToe3hQKbP7KKa5m1o4YRc35smUyCj7HRbcoR72v2Bpj5pvm2URC', network);

// 2 of 3
// OP_DUP OP_HASH160 <pubKeyHash1> OP_EQUALVERIFY OP_CHECKSIG OP_TOALTSTACK
// OP_DUP OP_HASH160 <pubKeyHash2> OP_EQUALVERIFY OP_CHECKSIG OP_TOALTSTACK
// OP_DUP OP_HASH160 <pubKeyHash3> OP_EQUALVERIFY OP_CHECKSIG
// OP_FROMALTSTACK OP_FROMALTSTACK OP_ADD OP_ADD OP_2 OP_EQUAL

var asm = 'OP_DUP OP_HASH160 ' + bitcoin.crypto.hash160(pair1.getPublicKeyBuffer()).toString('hex') + ' OP_EQUALVERIFY OP_CHECKSIG OP_TOALTSTACK';
asm += ' OP_DUP OP_HASH160 ' + bitcoin.crypto.hash160(pair2.getPublicKeyBuffer()).toString('hex') + ' OP_EQUALVERIFY OP_CHECKSIG OP_TOALTSTACK';
asm += ' OP_DUP OP_HASH160 ' + bitcoin.crypto.hash160(pair1.getPublicKeyBuffer()).toString('hex') + ' OP_EQUALVERIFY OP_CHECKSIG';
asm  += ' OP_FROMALTSTACK OP_FROMALTSTACK OP_ADD OP_ADD OP_2 OP_EQUAL';

console.log(asm);

var redeem = bitcoin.script.fromASM(asm);

var scriptPubKey = bitcoin.script.scriptHashOutput(bitcoin.crypto.hash160(redeem));
multisigAddress = bitcoin.address.fromOutputScript(scriptPubKey, network).toString();
console.log("MultiSig Address: " + multisigAddress);
console.log("Redeem script: " + redeem.toString('hex'));
//return;

// ea724046325f30cc953231bf09baafb0f8b86c6621190c34fe34066ea7229830
// .5 tBTC sent to 2NArCtCWokT1AW4YUh5upSyho1tN3NRveNY vout 1

tx = new bitcoin.TransactionBuilder(network);
tx.addInput('ea724046325f30cc953231bf09baafb0f8b86c6621190c34fe34066ea7229830', 1);
tx.addOutput('n2Ac5CJyn9NRMU4QSeZKHSwQ9vdyB3hFxe', 0.4 * 10000000);
tx.sign(0, pair1, redeem);

// 0100000001309822a76e0634fe340c1921666cb8f8b0afba09bf313295cc305f32464072ea0100000000ffffffff01005a6202000000001976a914e28171272f340e6cf1e84d46aefff2a5178e9ed288ac00000000