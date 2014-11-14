Template.dayPicker.helpers({
	dayName: function () {
		return Session.get("dayName");
	}
});

Template.dayPicker.events({
	'click #back': function () {
		setDate(-1);
		loadMenu();
	},
	'click #forward': function () {
		setDate(1);
		loadMenu();
	}
});