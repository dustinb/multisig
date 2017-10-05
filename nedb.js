var PERM_CREATEFUND = 0x01;

var Datastore = require('nedb');

var funds = new Datastore({ filename: 'fund.db', autoload: true });

var addresses = new Datastore({ filename: 'address.db', autoload: true });
addresses.ensureIndex({fieldName: 'address', unique: true});

addresses.persistence.compactDatafile();

//addresses.persistence.setAutocompactionInterval(5000);

addresses.find({address: "n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b"}, function(err, docs) {
  console.log(docs);
});

var dustin = {
  name: "Dustin",
  address: "n4GXsB9rHfRx5CXP78ZPwcxqkwKG6vXu5b",
  permissions: PERM_CREATEFUND
};

addresses.insert(dustin);

