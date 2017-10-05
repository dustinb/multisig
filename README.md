Oracle Controller

Message and queue based work

1.) Register - Oracle registers with address by signing the address as verification
2.) Fund - Create a fund from multiple addresses, specify m of n
3.) PubKey Requests - Oracles connected offer or reject fund request
4.) Fund Accpeted - Multi-sig is created
5.) Fund Rejected - Fund fails too many rejections or expires
6.) Balance Tracked - Payments to fund are tracked
7.) Spend Fund - Transaction created to spend part or all of fund
8.) Sign Requests - Oracles connected requested to sign or reject Spend
9.) Transmit Transaction once m signed

Person Oracle treated somewhat differently?


Address {
  name: "Dustin",
  address: mxj23j4l23j4,
  permissions: [fund-request]
}

Permissions
  - Fund Request

Address Request
 - Any  Address with Fund Request permissions can request a new "Account" from

 fundRequest {
    requested: address
    addresses: [address,address,address]
    required: 2
    pubkeys: []
 }

Each Oracle must send public key.  Once all Oracle's agree to fund the
fund is created.

  fund {
    requested: address,
    pubkeys: [<key1>,<key2>,<key3>],
    description: "Organization Donations",
    redeem: <redeemscript>,
    address: 2lkj342342k34j
  }

Coins can now be send to the address as normal.  Oracles will receive fund
balance information.

Any oracle can initiate a spend from funds they are part of

  spend {
    fund: address,
    requested: address,
    to: address
  }

Oracles

Paper Oracle: Does not sign any transactions but will provide public keys if requested
NFL Oracle: Provide address for each game outcome.
BOSS Oracle