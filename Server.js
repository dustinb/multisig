var PERM_CREATEFUND = 0x01;

var bitcoin = require('bitcoinjs-lib');
var NETWORK = bitcoin.networks.testnet;
var server = require('http').createServer();
var io = require('socket.io')(server);

var Spoons = require('./Spoons.js');

var Oracle = new Spoons.Oracle('address.db', 'funds.db', io);

// Bug those clients if we want pub keys from them.  It's up to them to respond
// or put our requests on hold
setInterval(function() {
  Oracle.requestKeys();
}, 15000);

Oracle.build();
/*
setInterval(function() {
  Oracle.build();
}, 15000);
*/

function log(message) {
  console.log(message);
};

/*
io.use(function(socket, next) {
  if (socket.valid) {
    next();
  }
});
*/

io.on('connection', function(socket) {
  socket.valid = false;

  // Will validate the connection
  socket.on('register', function(data) {
    Oracle.register(socket, data);
  });

  // Someone want's to create a new fund
  socket.on('fund', function(data, fn) {
    Oracle.create(data, fn);
  });

  // Someone is acknowledging a fund with their pubkey
  socket.on('ackfund', function(pubkey) {
    Oracle.ackfund(pubkey);
  });

});

server.listen(3000);