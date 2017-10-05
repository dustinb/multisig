// Oracle implementing random odds of signing a transaction.

bitcoin = require('bitcoinjs-lib');
nedb = require('nedb');

var NETWORK = bitcoin.networks.testnet;
var odds = [];

function log(message) {
  console.log(message);
}

var db = new nedb({ filename: 'random.db', autoload: true });

db.find({}, function(err, docs) {

  if (docs.length) {
    odds = docs;
  } else {
    // Generate odds
    for(var i=10; i<100; i+=10) {
      var ECPair =  bitcoin.ECPair.makeRandom({network: NETWORK});

      var odd = {};
      odd.address = ECPair.getAddress();
      odd.sig = bitcoin.message.sign(ECPair, odd.address, NETWORK).toString('base64');
      odd.wif = ECPair.toWIF();
      odd.name = i + '% Chance';
      db.insert(odd);
      odds.push(odd);
    }
  }

  console.log(odds);

  var socket = require('socket.io-client')('http://localhost:3000');

  socket.on('connect', function() {
    log('Connected');
    socket.emit('register', odds);
  });

  socket.on('pubkey', function(fund) {
    log(fund);
    // We acknowledge any fund with no prejiduce
    fund.pubkeys.forEach(function(address) {
      odds.forEach(function(odd) {
        if (odd.address == address) {
          var pair = bitcoin.ECPair.fromWIF(odd.wif, NETWORK);
          socket.emit('ackfund', {fund: fund._id, key: pair.getPublicKeyBuffer().toString('hex')});
        }
      });
    });

  });

});
