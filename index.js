var noble = require('noble');
var request = require('request-json');

var apiURL = process.env.APIURL;
var LOCATION = process.env.LOCATION;
var client = request.createClient(apiURL);

// Variables to help us increase accuracy
var RSSI_THRESHOLD    = -90;
var API_UPDATE_INTERVAL = 5000; // milliseconds

// devices the hydrant has seen since last api update
var seenDeviceIds = [];

// events the devices has seen since the last api update
var eventQueue = [];

// list of device ids to listen for
var listenDeviceIds = [];

function updateAPI() {
  // send event queue to server
  console.log('POSTing sending events', eventQueue);

  if (eventQueue.length > 0) {
    client.post(apiURL + '/api/event', { events: eventQueue }, function(err, res) {
      console.log(res.statusCode);
      eventQueue.length = 0;
      seenDeviceIds.length = 0;
    });
  }
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log("Device has started, looking for device IDs");
    client.get(apiURL + '/api/devices', function(err, res, devices) {
      console.log(err);
      console.log(res.statusCode, devices);
      listenDeviceIds = devices;

      console.log('scanning...');
      noble.startScanning([], true);
      setInterval(updateAPI, API_UPDATE_INTERVAL);
    });
  } else {
    console.log("Error...not connected or cannot connect");
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {

  var deviceId = peripheral.address;
  if (listenDeviceIds.indexOf(deviceId) > -1 && seenDeviceIds.indexOf(deviceId) === -1) {
    console.log("Device discovered: ", peripheral.address);
    // queue event to be sent if we recognize the device and have not queued an event yet
    seenDeviceIds.push(deviceId);
    var eventPayload = {
      device: deviceId,
      location: LOCATION,
      time: Date.now()
    };
    eventQueue.push(eventPayload);
  } else if (listenDeviceIds.indexOf(deviceId) > -1 && seenDeviceIds.indexOf(deviceId) !== -1) {
    console.log('already seen', deviceId);
  }
});
