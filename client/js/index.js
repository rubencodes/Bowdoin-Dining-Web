/*TODO:
 * fix timezone issue
 * finish onecard integration
 */

//set defaults
Session.setDefault("template", "menu");
Session.setDefault("filter", localStorage.getItem("filter"));
Session.setDefault("firstLoad", true);

var now = new Date();
Session.setDefault("month", now.getMonth());
Session.setDefault("day", 	now.getDate());
Session.setDefault("year",	now.getFullYear());

Template.body.rendered = function () {
	$.getScript("/inobounce.min.js");
	clearOldCache();
}

Template.body.helpers({
	title: function () {
		return Session.get("title")
	},
	template: function () {
		return Session.get("template");
	},
	toolbar: function () {
		return Session.get("toolbar");
	}
});

setTitle = function (name) {
	Session.set("title", name);
}