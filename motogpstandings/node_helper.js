var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('Moto GP standings helper started ...');
  },

  getStocks: function (url) {
      var self = this;

      request({ url: url, method: 'GET' }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
              self.sendSocketNotification('HTML_RESULT', body);
          }
      });

  },

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_STANDINGS') {
      this.getStocks(payload);
    }
  }

});
