Template.oneCard.rendered = function () {
	Session.set("toolbar", "");
	//loadOneCardData();
}

loadOneCardData = function () {
	Meteor.call("getOneCardData");
}