var bitcoin = require('bitcoinjs-lib');
var nedb = require('nedb');
var assert = require('assert');
var async = require('async');

var NETWORK = bitcoin.networks.testnet;
function log(message) {
  console.log(message);
};

function Oracle(addresses, funds, io) {
  this.io = io;
  this.funds = new nedb({ filename: funds, autoload: true });
  this.addresses = new nedb({ filename: addresses, autoload: true });

}

/**
 * Authenticate socket connection.
 * 1.) Address must exist
 * 2.) Signature must match
 */
Oracle.prototype.register = function(socket, items) {
  var me = this;
  socket.valid = false;
  socket.addresses = [];

  async.each(items, function(item, callback) {
    // TODO Check types, length of data
    try {
      // Check signature, message is the address. If signature is ok store
      // the address.  Some of these may not be known to the system yet.
      log('Register' + item.name + ' ' + item.address);
      if (bitcoin.message.verify(item.address, item.sig, item.address, NETWORK)) {
        log('Register Success');
        socket.addresses.push(item.address);
      } else {
        log('Register Failure');
      }
    } catch(ex) {
      callback('Signature error');
    }

  }, function() {
    // TODO Verify this Oracle
    socket.valid = true;
  });

};


// Someone wants to create a fund, should we let them?
Oracle.prototype.create = function(fund, call) {
  log(fund);

  assert(fund.created, 'Fund object error');
  assert(typeof fund.addresses == 'object', 'Need addresses to fund');

  var numAddresses = fund.addresses.length;
  if (fund.required > numAddresses) {
    log('Too many signatures required');
  }
  var id = bitcoin.crypto.hash256(fund.addresses.join('') + fund.required).toString('hex');
  log(id.toString('hex'));

  var Oracle = this;

  this.funds.find({"_id": id}, function(err, docs) {
    if (docs.length > 0) {
      log('Fund with id ' + id + ' already exists');
      Oracle.requestKeys();
    } else {
      log('Creating fund ' + id);
      fund._id = id;
      fund.status = -1 * fund.addresses.length;
      fund.pubkeys = fund.addresses;
      Oracle.funds.insert(fund);
    }
  });

};

// For any connected Oracle let them know we need a pub key from them
Oracle.prototype.requestKeys = function() {
  var me = this;
  me.io.sockets.sockets.forEach(function(socket) {
    log('Do we need pub keys from ' + socket.addresses.join(',') + '?');
    socket.addresses.forEach(function(address) {
      me.funds.find({"pubkeys": address}, function(err, funds) {
        funds.forEach(function(fund) {
          log('Yes we need a pub key for ' + fund.name);
          socket.emit('pubkey', fund);
        });
      });
    });
  });
};

Oracle.prototype.ackfund = function(data) {
  var me = this;
  try {
    var pair = bitcoin.ECPair.fromPublicKeyBuffer(new Buffer(data.key, 'hex'), NETWORK);
    var address = pair.getAddress();
    me.funds.find({_id: data.fund, "pubkeys": address}, function(err, funds) {
      funds.forEach(function(fund) {
        console.log('Acknowledge fund ' + fund.name + ' ' + fund._id);
        var index = fund.pubkeys.indexOf(address);
        fund.pubkeys[index] = data.key;
        fund.status++;
        me.funds.update({"_id": fund._id}, fund);
      });
    });
  } catch(ex) {
    log('Provided bad data');
  }
};

// Build a multi sig address from these keys
Oracle.prototype.build = function() {
  var me = this;

  me.funds.find({"status": 1}, function(err, funds) {
    funds.forEach(function(fund) {
      var keys = [];
      fund.pubkeys.forEach(function(key) {
        keys.push(new Buffer(key, 'hex'));
      });

      log('Building multi-sig address for ' + fund.name);
      fund.redeem = bitcoin.script.multisigOutput(fund.required, keys);
      var scriptPubKey = bitcoin.script.scriptHashOutput(bitcoin.crypto.hash160(fund.redeem));
      fund.address = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
      fund.status++
      fund.redeem = fund.redeem.toString('hex');
      me.funds.update({"_id": fund._id}, fund);
    });
  });
}

function Funds() {
 this.network = bitcoin.network.testnet;
}

Funds.prototype.request = function(fund) {

};

module.exports.Oracle = Oracle;