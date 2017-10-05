// http://bitcoin.stackexchange.com/questions/36758/any-way-to-create-a-multisig-address-from-bitcoin-addresses-instead-of-public-k
//https://github.com/edmundedgar/bitcoin-branching-transaction-builder
//https://bitcointalk.org/index.php?topic=918183.20
var http = require('http');
var fs = require('fs');
var bitcoin = require('bitcoinjs-lib');
var BranchingTransactionBuilder = require('./branching_transaction_builder.js');
//var ECKey = bitcoin.ECKey;
//var Address = bitcoin.Address;
//var scripts = bitcoin.scripts;

var BitcoinAddress1 = "n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b";
var pair1 = bitcoin.ECPair.fromWIF('cTRa78FCBcMH9hAWo3mqf1k7XWeLTanLwiVK4YKyf7aCXvb6wG5A', bitcoin.networks.testnet);
var BitcoinAddress2 = "mpZd4A5YLHnW6WFkUUXQM9aH81sEwjM4dH";
var pair2 = bitcoin.ECPair.fromWIF('cVaBixERMwUNpTGJyKtx43m9b4BjTr8ZoUTDqh5utQeLroyajZ3i', bitcoin.networks.testnet);

var addr1 =  bitcoin.address.fromBase58Check(BitcoinAddress1);
var addr2 =  bitcoin.address.fromBase58Check(BitcoinAddress2);
console.log(addr1.hash);
console.log(addr2.hash);
var branch1 = bitcoin.script.pubKeyHashOutput(addr1.hash);
var branch2 = bitcoin.script.pubKeyHashOutput(addr2.hash);

var branch_builder = new BranchingTransactionBuilder(new bitcoin.TransactionBuilder(bitcoin.networks.testnet));
branch_builder.addSubScript(branch1);
branch_builder.addSubScript(branch2);
var branch_redeem_script = branch_builder.script();
console.log(bitcoin.script.toASM(branch_redeem_script));
console.log(bitcoin.crypto.hash160(branch_redeem_script));

var scriptPubKey = bitcoin.script.scriptHashOutput(bitcoin.crypto.hash160(branch_redeem_script));
console.log(scriptPubKey);
//var scriptPubKey = bitcoin.script.scriptHashOutput(bitcoin.script.scriptHashOutput(branch_redeem_script));
var multisigAddress = bitcoin.address.fromOutputScript(scriptPubKey, bitcoin.networks.testnet).toString();
console.log("MultiSig Address: " + multisigAddress);
console.log("Redeem script: " + branch_redeem_script.toString('hex'));

// TX be0da5a6e3a3127520b9eaee79edf45e715f812d676ba7373385bc5b33c8e2f7 1 tbtc sent
var branch_redeem_script2 = branch_builder.script(branch_redeem_script.toString('hex'));
var spend_builder = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);
spend_builder.addInput('be0da5a6e3a3127520b9eaee79edf45e715f812d676ba7373385bc5b33c8e2f7', 1);
spend_builder.addOutput("n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b", 90000000);
var gp_builder = new BranchingTransactionBuilder(spend_builder);
gp_builder.selectInputBranch(0, 1, 2);


//var addrToSendTo = bitcoin.address.fromBase58Check("n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b");
//var branchToSendTo = bitcoin.script.pubKeyHashOutput(addrToSendTo.hash);

gp_builder.signBranch(0, pair1, branch_redeem_script2, null, branch2);
var tx = gp_builder.build();

console.log(tx.toHex());

return;

// cTRa78FCBcMH9hAWo3mqf1k7XWeLTanLwiVK4YKyf7aCXvb6wG5A
addr1 = bitcoin.address.fromBase58Check('n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b').hash.toString('hex');
// cVaBixERMwUNpTGJyKtx43m9b4BjTr8ZoUTDqh5utQeLroyajZ3i
addr2 = bitcoin.address.fromBase58Check('mpZd4A5YLHnW6WFkUUXQM9aH81sEwjM4dH').hash.toString('hex');
// cToe3hQKbP7KKa5m1o4YRc35smUyCj7HRbcoR72v2Bpj5pvm2URC
addr3 = bitcoin.address.fromBase58Check('mp2YXMhC5A9wozRu38BfGg5MMm3bavuSTB').hash.toString('hex');
var asm = 'OP_DUP OP_HASH160 ' + addr1 + ' OP_EQUALVERIFY OP_ROT';
asm += ' OP_DUP OP_HASH160 ' + addr2 + ' OP_EQUALVERIFY OP_ROT';
asm += ' OP_DUP OP_HASH160 ' + addr3 + ' OP_EQUALVERIFY OP_ROT 02 OP_CHECKSIG';

console.log(asm);
branch_redeem_script = bitcoin.script.fromASM(asm);
var scriptPubKey = bitcoin.script.scriptHashOutput(bitcoin.crypto.hash160(branch_redeem_script));
console.log(scriptPubKey);
multisigAddress = bitcoin.address.fromOutputScript(scriptPubKey, bitcoin.networks.testnet).toString();
console.log("MultiSig Address: " + multisigAddress);
console.log("Redeem script: " + branch_redeem_script.toString('hex'));

//MultiSig Address: 2N3CLgvu9s1tXjDowbRbbkoXWkL3doWZxto
//Redeem script: 76a914f990ad6481993a29b89944439e421f72e34e4ac9887b76a914633a51ccd5a36875b621b04df989e624ec0992f6887b76a9145d59a474832fe17083a968ad004e821b07d552ae887b0102ac
// Sent 1 bitcoin 0fda350341fa8f23ef500cd2bd27d90f19eaf489895b28f5eec226e0a04f9e14

// Attempt to spend OP_ROT tx
var txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);
txb.addInput('0fda350341fa8f23ef500cd2bd27d90f19eaf489895b28f5eec226e0a04f9e14', 1);
txb.addOutput('n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b', 100000);
var pair1 = bitcoin.ECPair.fromWIF('cTRa78FCBcMH9hAWo3mqf1k7XWeLTanLwiVK4YKyf7aCXvb6wG5A', bitcoin.networks.testnet);
var pair2 = bitcoin.ECPair.fromWIF('cVaBixERMwUNpTGJyKtx43m9b4BjTr8ZoUTDqh5utQeLroyajZ3i', bitcoin.networks.testnet);

txb.sign(0, pair1, branch_redeem_script);
txb.sign(0, pair2, branch_redeem_script);
var tx = txb.build();
console.log(tx.toHex());

http.createServer(function (req, res) {
  console.log(req);
  //res.sendFile();

  fs.readFile(__dirname + '/index.html', "binary", function(err, file) {
    if(err) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
    }

    res.writeHead(200);
    res.write(file, "binary");
    res.end();
  });

  //res.writeHead(200, {'Content-Type': 'text/plain'});
  //res.end(index);
}).listen(3333);
