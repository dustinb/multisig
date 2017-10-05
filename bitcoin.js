var foobar = {
  base58: require('bs58'),
  bitcoin: require('bitcoinjs-lib'),
  ecurve: require('ecurve'),
  BigInteger: require('bigi'),
  Buffer: require('buffer')
}

module.exports = foobar

// browserify foobar.js -s bitcoin-lib > www/js/bitcoin-lib.js