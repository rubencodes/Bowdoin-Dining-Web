Template.navDrawer.events({
	'click #ThorneLink': function () {
		setDiningHall("Thorne");
		Session.set("template", "menu");
		$("#menu-checkbox").attr("checked", false);
	},
	'click #MoultonLink': function () {
		setDiningHall("Moulton");
		Session.set("template", "menu");
		$("#menu-checkbox").attr("checked", false);
	},
	'click #PubLink': function () {
		setTitle("Pub");
		Session.set("template", "pub");
		$("#menu-checkbox").attr("checked", false);
	},
	'click #OneCardLink': function () {
		setTitle("OneCard");
		Session.set("template", "oneCard");
		$("#menu-checkbox").attr("checked", false);
	}
});