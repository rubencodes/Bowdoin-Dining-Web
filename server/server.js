var BowdoinAPI = "https://gooseeye.bowdoin.edu/ws-csGoldShim/Service.asmx";

Meteor.methods({
	getMenu: function (sYear, sMonth, sDay, offset) {
		this.unblock();
		return HTTP.get("http://www.bowdoin.edu/atreus/lib/xml/" + sYear + "-" + sMonth + "-" + sDay + "/" + offset + ".xml");
	},
	getSOAPEnvelope: function (service) {
		return "<?xml version=\"1.0\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\"><soapenv:Header/><soapenv:Body>" + service + "</soapenv:Body></soapenv:Envelope>";
	},
	getOneCardData: function () {
		var envelope = Meteor.call("getSOAPEnvelope");
		
		var url = BowdoinAPI, 
				hostname = "gooseeye.bowdoin.edu",
				domain   = "bowdoin.edu", 
				username = "", 
				password = "";

		var ntlm = Meteor.require('ntlm'), 
				ntlmrequest = Npm.require('request').defaults({
					agentClass: Meteor.require('agentkeepalive').HttpsAgent
				});

		ntlmrequest(url, {
			headers: {
				'Authorization': ntlm.challengeHeader(hostname, domain),
			}
		}, function(err, res) {
			ntlmrequest(url, {
				headers: {
					'Authorization': ntlm.responseHeader(res, url, domain, username, password)
				}
			}, function (err, res, body) {
				console.log(res.headers);
				//expected 200 OK, received 401 with Negiotiate, NTLM header.
			});
		});
	}
});

Meteor.startup(function () {
	// code to run on server at startup
});