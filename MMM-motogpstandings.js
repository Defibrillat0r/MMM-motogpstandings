Module.register("MMM-motogpstandings",{

	// Define module defaults
	defaults: {
		maximumEntries: 10, // Total Maximum Entries
		updateInterval: 60 * 60 * 1000, // Update every 60 minutes.
		animationSpeed: 2000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.

		baseUrl: 'http://54.171.219.170/live/json/motogp/2016/ranking.json',
                

	},

	// Define required scripts.
	getStyles: function() {
		return ["motogpstandings.css"];
	},
	
	start: function() {
		Log.info("Starting module: " + this.name);

		moment.locale(config.language);
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},    

	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = "Loading riders ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = "small";
		
		var row = document.createElement("tr");
		row.className = "header";
		table.appendChild(row);
		
		var posCell = document.createElement("td");
		posCell.innerHTML = "Pos.";
		row.appendChild(posCell);
			
		var nameCell = document.createElement("td");
		nameCell.innerHTML = "Fahrer";
		row.appendChild(nameCell);
			
		var countryCell = document.createElement("td");
		countryCell.innerHTML = "Land";
		row.appendChild(countryCell);
			
		var bikeCell = document.createElement("td");
		bikeCell.innerHTML = "Bike";
		row.appendChild(bikeCell);
			
		var pointsCell = document.createElement("td");
		pointsCell.innerHTML = "Punkte";
		row.appendChild(pointsCell);
		
		var count = 0;
		for(var rider in this.resultTable.rankings[1].standing)
		{
			if(count >= this.config.maximumEntries)
				break;
			count++;
			
			var riderObj = this.resultTable.rankings[1].standing[rider];
			
			var row = document.createElement("tr");
			table.appendChild(row);
			
			var posCell = document.createElement("td");
			posCell.innerHTML = riderObj.position;
			row.appendChild(posCell);
			
			var nameCell = document.createElement("td");
			nameCell.innerHTML = riderObj.name+" "+riderObj.surname;
			row.appendChild(nameCell);
			
			var countryCell = document.createElement("td");
			countryCell.innerHTML = riderObj.country_id;
			row.appendChild(countryCell);
			
			var bikeCell = document.createElement("td");
			bikeCell.innerHTML = riderObj.carbike;
			row.appendChild(bikeCell);
			
			var pointsCell = document.createElement("td");
			pointsCell.innerHTML = riderObj.points;
			row.appendChild(pointsCell);
			
			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.config.maximumEntries * this.config.fadePoint;
				var steps = this.config.maximumEntries - startingPoint;
				if (rider >= startingPoint) {
					var currentStep = rider - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}
		}		
		
		return table;
	},

	
	updateTimetable: function() {
		var url = this.config.baseUrl;
		console.log("send socket notification");
		this.sendSocketNotification('GET_STANDINGS', url);
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateTimetable();
		}, nextLoad);
	},
	
	socketNotificationReceived: function(notification, payload) {
        if (notification === "HTML_RESULT") {
			this.resultTable = JSON.parse(payload);
			this.loaded = true;
			this.updateDom(this.config.animationSpeed);
        }    
	},

});