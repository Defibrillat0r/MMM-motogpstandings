Module.register("MMM-motogpstandings",{

	// Define module defaults
	defaults: {
		maximumEntries: 10, // Total Maximum Entries
		updateInterval: 1 * 10 * 1000, // Update every 10 secs minutes.
		animationSpeed: 2000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
                initialLoadDelay: 0, // start delay seconds.
		
                apiBase: 'http://transport.opendata.ch/v1/stationboard',
                id: "008503203",
				baseUrl: 'http://www.motogp.com/en',
                
		titleReplace: {
			"Zeittabelle ": ""
		},
	},

	// Define required scripts.
	/*getStyles: function() {
		return ["swisstransport.css", "font-awesome.css"];
	},*/

	// Define required scripts.
	/*getScripts: function() {
		return ["moment.js"];
	},*/

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

                this.trains = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},    
    
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.id === "") {
			wrapper.innerHTML = "Please set the correct Station ID: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Loading riders ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var table = document.createElement("table");
		table.className = "small";

		/*for (var t in this.trains) {
			var trains = this.trains[t];

			var row = document.createElement("tr");
			table.appendChild(row);

			var depCell = document.createElement("td");
			depCell.className = "departuretime";
			depCell.innerHTML = trains.departureTimestamp;
			row.appendChild(depCell);

                        if(trains.delay) {
                            var delayCell = document.createElement("td");
                            delayCell.className = "delay red";
                            delayCell.innerHTML = "+" + trains.delay + " min";
                            row.appendChild(delayCell);
                        } else {
                            var delayCell = document.createElement("td");
                            delayCell.className = "delay red";
                            delayCell.innerHTML = trains.delay;
                            row.appendChild(delayCell);
                        }

			var trainNameCell = document.createElement("td");
			trainNameCell.innerHTML = trains.name;
			trainNameCell.className = "align-right bright";
			row.appendChild(trainNameCell);

			var trainToCell = document.createElement("td");
			trainToCell.innerHTML = trains.to;
			trainToCell.className = "align-right trainto";
			row.appendChild(trainToCell);

			if (this.config.fade && this.config.fadePoint < 1) {
				if (this.config.fadePoint < 0) {
					this.config.fadePoint = 0;
				}
				var startingPoint = this.trains.length * this.config.fadePoint;
				var steps = this.trains.length - startingPoint;
				if (t >= startingPoint) {
					var currentStep = t - startingPoint;
					row.style.opacity = 1 - (1 / steps * currentStep);
				}
			}

		}*/

		wrapper.innerHTML = this.resultTable;
		return wrapper;
	},

	/* updateTimetable(compliments)
	 * Requests new data from openweather.org.
	 * Calls processTrains on succesfull response.
	 */
	updateTimetable: function() {
		var url = this.config.apiBase + this.getParams();
		var self = this;
		var retry = true;
		url = this.config.baseUrl;
		/*var trainRequest = new XMLHttpRequest();
		trainRequest.open("GET", url, true);
		trainRequest.onreadystatechange = function() {
			self.processTrains(this.response);

			if (this.readyState === 4) {
				if (this.status === 200) {
					//self.processTrains(JSON.parse(this.response));
					self.processTrains(this.response);
				} else if (this.status === 401) {
					self.config.id = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect waht so ever...");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load trains.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		trainRequest.send();*/
		console.log("send socket notification");
		this.sendSocketNotification('GET_STANDINGS', url);
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function() {
		var params = "?";
                params += "id=" + this.config.id;
		params += "&limit=" + this.config.maximumEntries;
                
		return params;
	},

	/* processTrains(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processTrains: function(data) {

		/*this.trains = [];
		for (var i = 0, count = data.stationboard.length; i < count; i++) {

			var trains = data.stationboard[i];
			this.trains.push({

				departureTimestamp: moment(trains.stop.departureTimestamp * 1000).format("HH:mm"),
				delay: trains.stop.delay,
				name: trains.name,
				to: trains.to

			});
		}*/
		console.log("loaded = true");
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
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
			console.log("got html result");
            this.result = payload;
            this.processTrains(payload);
        }    
	},

});