Template.menu.created = function () {
	Session.set("toolbar", "dayPicker");
}

Template.menu.rendered = function () {
	if (Session.get("firstLoad")) {
		Session.set("firstLoad", false);
		setDiningHall("Thorne");
		setToCurrentMeal();
	} else {
		setMeal(Session.get("meal"));
	}

	setDate(0);
	loadMenu();

	var currentFilter = Session.get("filter");
	if (currentFilter == null || currentFilter == "Off") {
		enableFilter("Off");
	} else {
		enableFilter(currentFilter);
	}
}

Template.menu.helpers({
	courseNames: function () {
		return Session.get("courseNames") || [];
	},
	getCourse: function (courseName) {
		var courses = Session.get("courses");
		var course = courses[courseName];
		var filter = Session.get("filter");

		//if we have a filter set, make sure items presented comply
		if (course != null && filter != null && filter != "Off") {
			var filteredCourse = course.slice(0); //make a copy of the menu to remove from
			var removedCount = 0;
			for (var i = 0; i < course.length; i++) {
				var item = course[i];

				//if item does not pass filter, remove from course
				if (!(item.attributes.indexOf(filter) >= 0 || (filter == "V" && item.attributes.indexOf("VE") >= 0))) {
					filteredCourse.splice(i - removedCount, 1);
					removedCount++;
				}
			}
			course = filteredCourse;
		}
		return course || [];
	},
	formatList: function (attributes) {
		return attributes.join(", ");
	},
});

Template.menu.events({
	//meal pickers
	'click #Breakfast': function () {
		setMeal("Breakfast");
		loadMenu();
	},
	'click #Brunch': function () {
		setMeal("Brunch");
		loadMenu();
	},
	'click #Lunch': function () {
		setMeal("Lunch");
		loadMenu();
	},
	'click #Dinner': function () {
		setMeal("Dinner");
		loadMenu();
	},

	//show/hide diet filters
	'click .cornerLink': function () {
		$(".filters").slideToggle();
		if ($(".cornerLink").hasClass("ion-funnel")) {
			$(".cornerLink").removeClass("ion-funnel").addClass("ion-close");
			$("#content").scrollTop(0);
		} else {
			$(".cornerLink").removeClass("ion-close").addClass("ion-funnel");
		}
	},

	//diet filters
	'click #V': function () {
		enableFilter("V");
	},
	'click #VE': function () {
		enableFilter("VE");
	},
	'click #NGI': function () {
		enableFilter("NGI");
	},
	'click #L': function () {
		enableFilter("L");
	},
	'click #Off': function () {
		enableFilter("Off");
	}
});

setMeal = function (meal) {
	Session.set("meal", meal);

	$("#Breakfast,#Brunch,#Lunch,#Dinner").removeClass("active");
	$("#" + meal).addClass("active");
}

//returns current offset, or resets to 0 if in the past
getCurrentOffset = function() {
	var now = new Date();
	var dateCurrent = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	var month = Session.get("month") || dateCurrent.getMonth();
	var day 	= Session.get("day") 	 || dateCurrent.getDate();
	var year 	= Session.get("year")	 || dateCurrent.getFullYear();
	var dateShown = new Date(year, month, day);
	
	var one_day = 1000*60*60*24;
	
	return Math.max(Math.round((dateShown.getTime() - dateCurrent.getTime())/one_day), 0);
}

//adjusts date presented by a given delta
setDate = function (delta) {
	var newOffset = getCurrentOffset() + delta;
	var dateShown = new Date();
	dateShown.setDate(dateShown.getDate() + newOffset);
	
	Session.set("month", dateShown.getMonth());
	Session.set("day", 	 dateShown.getDate());
	Session.set("year",	 dateShown.getFullYear());

	//handles date offset and button status
	switch (newOffset) {
	case 0:
		$("#back").attr("disabled", true);
		break;
	case 6:
		$("#forward").attr("disabled", true);
		break;
	default:
		$("#back").removeAttr("disabled");
		$("#forward").removeAttr("disabled");
		break;
	}

	//handles setting proper title for day
	var day = dateShown.getDay();

	switch (newOffset) {
	case 0:
		Session.set("dayName", "Today");
		break;
	case 1:
		Session.set("dayName", "Tomorrow");
		break;
	default:
		Session.set("dayName", dayOfWeek(day));
		break;
	}

	if (day == 0 || day == 6) {
		$("#Brunch").parent().show();
		$("#Breakfast").parent().hide();
		$("#Lunch").parent().hide();
		if (!$("#Dinner").hasClass("active")) {
			setMeal("Brunch");
		}
	} else {
		$("#Brunch").parent().hide();
		$("#Breakfast").parent().show();
		$("#Lunch").parent().show();
		if ($("#Brunch").hasClass("active")) {
			setMeal("Breakfast");
		}
	}
}

setToCurrentMeal = function () {
	var now = new Date();
	var hours = now.getHours();
	var day = now.getDay();
	if (hours < 10 && day > 0 && day < 6)
		setMeal("Breakfast");
	else if (hours < 14) {
		if (day === 0 || day === 6)
			setMeal("Brunch");
		else
			setMeal("Lunch");
	} else setMeal("Dinner");
}

loadMenu = function (date) {
	$("#Breakfast,#Brunch,#Lunch,#Dinner").attr("disabled", true);
	//get target date info
	var date = new Date(); //get current date
	var offset = getCurrentOffset(); //get target date offset
	date.setDate(date.getDate() + offset); //get target date
	var day = date.getDay(); //store target day of week

	//get date info of most recent Sunday to target
	var sunday = new Date(date);
	sunday.setDate(sunday.getDate() - day); //get target date
	var sYear = sunday.getFullYear();
	var sMonth = sunday.getMonth();
	var sDay = sunday.getDate();

	var filename = sYear + "-" + sMonth + "-" + sDay + "-" + (day+1);
	var localCopy = getCachedCopy(filename);

	if (!localCopy) {
		$("body").append("<div class='spinner'></div>");
		Meteor.call("getMenu", sYear, sMonth, sDay, day+1, function (error, result) {
			if (result) {
				cache(filename, result.content); //cache xml
				parseMenu(result.content);
			} else {
				var courses = { "No Menu Available" : [{"name": "Check Your Network Connection", "attributes": []}] };
				Session.set("courses", courses);
				Session.set("courseNames", Object.keys(courses));
			}
			$(".spinner").remove();
		});
	} else {
		parseMenu(localCopy);
	}
	$("#Breakfast,#Brunch,#Lunch,#Dinner").removeAttr("disabled");
}

cache = function(filename, value) {
	//first cache the xml
	localStorage.setItem(filename, value); //cache xml
	
	//next, store the filename so we know to delete it later
	var stringifiedFilenameCache = localStorage.getItem("filename-cache");
	if(!stringifiedFilenameCache) {
		stringifiedFilenameCache = "[]";
	}

	var filenameCache = JSON.parse(stringifiedFilenameCache);
	filenameCache.push(filename);
	localStorage.setItem("filename-cache", JSON.stringify(filenameCache));
}

getCachedCopy = function(filename) {
	return localStorage.getItem(filename);
}

clearOldCache = function() {
	//get current date
	var date = new Date();
	var day = date.getDay() + 1; //store day of week

	//get date info of most recent Sunday
	var sunday = new Date(date);
	sunday.setDate(sunday.getDate() - day);
	var sYear = sunday.getFullYear();
	var sMonth = sunday.getMonth();
	var sDay = sunday.getDate() + 1;
	
	//delete anything older than start of this week
	var stringifiedFilenameCache = localStorage.getItem("filename-cache");
	if(!stringifiedFilenameCache) {
		stringifiedFilenameCache = "[]";
	}

	var filenameCache = JSON.parse(stringifiedFilenameCache);
	for(i in filenameCache) {
		filename = filenameCache[i];
		var date = filename.split("-");
		
		//if this date already happened, delete it from cache
		if(sYear > date[0] || 
			 sYear == date[0] && sMonth > date[1] || 
			 sYear == date[0] && sMonth == date[1] && sDay > date[2] || 
			 sYear == date[0] && sMonth == date[1] && sDay == date[2] && day+1 > date[3]) {
			localStorage.removeItem(filename);
		}
	}
}

parseMenu = function (xmlString) {
	//get desired menu info
	var locationId = Session.get("locationId");
	var meal = Session.get("meal");

	xmlDoc = $.parseXML(xmlString);
	$xml = $(xmlDoc);

	var courses = {};
	
	//clear current menu
	Session.set("courses", courses);
	
	$xml.find("#" + meal + ">#" + locationId + ">menu>record").each(function (index) {
		var itemName = $(this).find("webLongName").text();
		if (itemName != "..." && itemName != "Salad Bar") {
			var course = $(this).find("course").text();
			var dietPattern = /\bNGI\b|\bVE\b|\bV\b|\bL\b/;
			var dietAttributes = [];
			while (found = dietPattern.exec(itemName)) {
				itemName = itemName.replace(dietPattern, "");
				dietAttributes.push(found.shift());
			}
			while (found = /\(|\)/.exec(itemName)) {
				itemName = itemName.replace(/\(|\)/, "");
			}

			var item = {
				name: itemName,
				attributes: dietAttributes
			};

			if (courses[course] == null) {
				courses[course] = [item];
			} else {
				courses[course].push(item);
			}
		}
	});
	
	Session.set("courses", courses);
	Session.set("courseNames", Object.keys(courses));
	$("#content").scrollTop(0);
}

enableFilter = function (filter) {
	Session.set("filter", filter);
	localStorage.setItem("filter", filter);
	$("#V,#VE,#Off,#NGI,#L").removeClass("active");
	$("#" + filter).addClass("active");
}

dayOfWeek = function (i) {
	var day;
	switch (i) {
	case 0:
		day = 'Sunday';
		break;
	case 1:
		day = 'Monday';
		break;
	case 2:
		day = 'Tuesday';
		break;
	case 3:
		day = 'Wednesday';
		break;
	case 4:
		day = 'Thursday';
		break;
	case 5:
		day = 'Friday';
		break;
	case 6:
		day = 'Saturday';
		break;
	}
	return day;
}

setDiningHall = function(diningHall) {
	setTitle(diningHall);

	if (diningHall == "Thorne") {
		Session.set("locationId", 49);
	} else if (diningHall == "Moulton") {
		Session.set("locationId", 48);
	}
	
	loadMenu();
}