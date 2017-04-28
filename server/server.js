var BowdoinAPI = "https://gooseeye.bowdoin.edu/ws-csGoldShim/Service.asmx";

Meteor.publish("favorites", function (itemIds) {
  itemIds = JSON.parse("["+itemIds+"]") || [];
  itemIds = itemIds.map(function(itemId) { return itemId.toString(); });

  var favorites = Favorites.find({
    itemId: {
      $in: itemIds
    }
  });

  return favorites;
}, {
  url: "favorites/:0",
  httpMethod: "get"
});

Meteor.publish("getFavoriteCount", function () {
  return Favorites.find();
});

Meteor.methods({
  getMenu: function (sYear, sMonth, sDay, offset) {
    this.unblock();
    var url = "https://www.bowdoin.edu/atreus/lib/xml/" + sYear + "-" + sMonth + "-" + sDay + "/" + offset + ".xml";

    return HTTP.get(url);
  },
  getSOAPEnvelope: function (service) {
    return "<?xml version=\"1.0\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\"><soapenv:Header/><soapenv:Body>" + service + "</soapenv:Body></soapenv:Envelope>";
  },
  getOneCardData: function () {
    //get SOAP envelope for getting user accounts
    var envelope = Meteor.call("getSOAPEnvelope", "<tem:GetCSGoldSVCBalances/>");

    var ntlm = Meteor.npmRequire('httpntlm').ntlm;
    var async = Meteor.npmRequire('async');
    var httpreq = Meteor.npmRequire('httpreq');
    var HttpsAgent = Meteor.npmRequire('agentkeepalive').HttpsAgent;
    var keepaliveAgent = new HttpsAgent();

    var options = {
      url: BowdoinAPI,
      username: '',
      password: '',
      domain: 'bowdoin.edu',
      workstation: ''
    };

    async.waterfall([
			function (callback) {
        var type1msg = ntlm.createType1Message(options);

        httpreq.post(options.url, {
          headers: {
            'Connection': 'keep-alive',
            'Authorization': type1msg
          },
          agent: keepaliveAgent
        }, callback);
			},

			function (res, callback) {
        if (!res.headers['www-authenticate'])
          return callback(new Error('www-authenticate not found on response of second request'));

        var type2msg = ntlm.parseType2Message(res.headers['www-authenticate']);
        var type3msg = ntlm.createType3Message(type2msg, options);

        httpreq.post(options.url, {
          headers: {
            'Connection': 'Close',
            'Authorization': type3msg,
            'body': envelope
          },
          allowRedirects: false,
          agent: keepaliveAgent
        }, callback);
			}
		], function (err, res) {
      if (err) return console.log(err);

      console.log(res.headers);
      console.log(res.body);
    });
  },

});

Meteor.method("favorite", function (itemId) {
  var item = Favorites.findOne({ itemId: itemId });

  if (item) {
    //if it exists, update it
    Favorites.update({
      _id: item._id
    }, {
      $inc: {
        favorites: 1
      }
    });
  } else {
    //if it doesn't exist, create it
    Favorites.insert({
      itemId: itemId,
      favorites: 1
    });
  }
}, {
  getArgsFromRequest: function (request) {
    return request.body && Object.keys(request.body).length > 0 ? Object.keys(request.body) : [];
  }
});

Meteor.method("unfavorite", function(itemId) {
  var item = Favorites.findOne({ itemId: itemId });
  if (item) {
    //if it exists, update it
    Favorites.update({
      _id: item._id
    }, {
      $inc: {
        favorites: item.favorites > 0 ? -1 : 0
      }
    });
  } else {
    //if it doesn't exist, create it
    Favorites.insert({
      itemId: itemId,
      favorites: 0
    });
  }
}, {
  getArgsFromRequest: function (request) {
    return request.body && Object.keys(request.body).length > 0 ? Object.keys(request.body) : [];
  }
});

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

Meteor.startup(function () {
  // code to run on server at startup

});
