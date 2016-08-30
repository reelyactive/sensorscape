/**
 * Copyright reelyActive 2016
 * We believe in an open Internet of Things
 */


// Constant definitions
DEFAULT_SOCKET_URL = 'http://localhost:3001';


/**
 * sensorscape Module
 * All of the JavaScript specific to the dashboard is contained inside this
 * angular module.  The only external dependencies are:
 * - beaver (reelyActive)
 * - socket.io (btford)
 */
angular.module('sensorscape', [ 'ui.bootstrap', 'btford.socket-io',
                                'reelyactive.beaver' ])


/**
 * Socket Factory
 * Creates the websocket connection to the given URL using socket.io.
 */
.factory('Socket', function(socketFactory) {
  return socketFactory({
    ioSocket: io.connect(DEFAULT_SOCKET_URL)
  });
})


/**
 * InteractionCtrl Controller
 * Handles the manipulation of all variables accessed by the HTML view.
 */
.controller('InteractionCtrl', function($scope, Socket, beaver) {

  // Variables accessible in the HTML scope
  $scope.devices = beaver.getDevices();
  $scope.sensors = {};

  // beaver.js listens on the websocket for events
  beaver.listen(Socket);

  // Handle events pre-processed by beaver.js
  beaver.on('appearance', function(event) {
    handleEvent('appearance', event);
  });
  beaver.on('displacement', function(event) {
    handleEvent('displacement', event);
  });
  beaver.on('keep-alive', function(event) {
    handleEvent('keep-alive', event);
  });
  beaver.on('disappearance', function(event) {
    handleEvent('disappearance', event);
  });

  // Handle an event
  function handleEvent(type, event) {
    var advData = event.tiraid.identifier.advData;

    // Sensor data as manufacturerSpecificData
    if(advData && advData.hasOwnProperty('manufacturerSpecificData') &&
       (Object.keys(advData.manufacturerSpecificData).length > 3)) {
      handleManufacturerSpecificData(advData.manufacturerSpecificData, event);
    }
  }

  // Handle manufacturerSpecificData
  function handleManufacturerSpecificData(data, event) {
    if(data.hasOwnProperty('nearable')) {
      handleNearable(data.nearable, event);
    }
  }

  // Handle Estimote Nearables
  function handleNearable(nearable, event) {
    $scope.sensors[nearable.id] = nearable;
    $scope.sensors[nearable.id].type = 'nearable';
    $scope.sensors[nearable.id].time = event.time;   
  }

});
