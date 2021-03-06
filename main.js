var events = require('events');
var schedule = require('node-schedule');  // https://www.npmjs.com/package/node-schedule
var suncalc = require('suncalc');  // https://github.com/mourner/suncalc
var five = require("johnny-five");  // http://johnny-five.io/
const util = require('util');
const config = require('./config');

var servo_azimuth;
var servo_altitude;
var arrowMover;

console.info("Initializing port...");
// var board = new five.Board();
var board = new five.Board({
  port: config.BOARD_PORT
});

function radians2Degrees(angle) {
  return angle * (180 / Math.PI);
}

var ArrowMover = function(
  servo_azimuth,
  servo_altitude
) {
  this.servo_azimuth = servo_azimuth;
  this.servo_altitude = servo_altitude;
  this.moving_azimuth = false;
  this.moving_altitude = false;
  this.degrees_azimuth = this.degrees_azimuth_target = config.START_AZIMUTH;
  this.degrees_altitude = this.degrees_altitude_target = config.START_ALTITUDE;
};
ArrowMover.prototype = new events.EventEmitter;

ArrowMover.prototype.is_moving = function() {
  var self = this;
  return self.moving_azimuth || self.moving_altitude;
};

ArrowMover.prototype.on('done:azimuth', function() {
  var self = this;
  self.degrees_azimuth = self.degrees_azimuth_target;
  self.moving_azimuth = false;
});

ArrowMover.prototype.on('done:altitude', function() {
  var self = this;
  self.degrees_altitude = self.degrees_altitude_target;
  self.moving_altitude = false;
});


// direction: true for clockwise, false for counterclockwise
ArrowMover.prototype.moveDegrees = function(
  type,
  degrees,
  direction,
  speed
) {
  var self = this;
  var servo = (type === 'azimuth') ? self.servo_azimuth : self.servo_altitude;
  var multiplier = config.DEGREES2SECONDS_AZIMUTH_CW;
  var threshold = config.MOVEMENT_THRESHOLD_AZI;
  if (type === 'altitude') {
    multiplier = (direction === true) ? config.DEGREES2SECONDS_ALTITUDE_CW : config.DEGREES2SECONDS_ALTITUDE_CCW;
    threshold = config.MOVEMENT_THRESHOLD_ALT;
  } else if (type === 'azimuth') {
    multiplier = (direction === true) ? config.DEGREES2SECONDS_AZIMUTH_CW : config.DEGREES2SECONDS_AZIMUTH_CCW;
    threshold = config.MOVEMENT_THRESHOLD_AZI;
  }
  console.log('multiplier: ' + multiplier);

  var seconds = degrees * multiplier * (1 / speed);
  if (seconds < threshold) {
    console.log('Not moving ' + type + ' because required ' + seconds + ' seconds is less than ' +
      threshold);
    if (type === 'altitude') {
      self.moving_altitude = false;
    } else {
      self.moving_azimuth = false;
    }
    return;
  }

  if (direction === true) {
    console.log('moving ' + type + ' clockwise ' + seconds + ' seconds');
    servo.cw(speed);
  } else {
    console.log('moving ' + type + ' counter-clockwise ' + seconds + ' seconds');
    servo.ccw(speed);
  }

  setTimeout(function() {
    servo.stop();
    console.log('done:' + type);
    self.emit('done:' + type);
  }, seconds * 1000);
};

ArrowMover.prototype.moveToAzimuth = function(
  degrees,  // absolute direction, 0 - 360
  speed
) {
  var self = this;

  if (degrees > 360 || degrees < -360) {
    console.error('moveToAzimuth() called with > 360 or < -360 degrees. Ignoring.');
    return;
  } else if (degrees === 360 || degrees === -360) {
    degrees = 0;
  }

  var degreesToMove = Math.abs(degrees - self.degrees_azimuth);
  var direction = true;
  if (degrees - self.degrees_azimuth < 0) direction = false;
  // If going more than halfway around the circle, take the shorter route
  if (degreesToMove > 180) {
    degreesToMove = 360 - degreesToMove;
    direction = !direction;
  }

  console.log('azi degreesToMove: ' + degreesToMove);
  console.log('azi direction: ' + direction);
  console.log('azi speed: ' + speed);
  self.moving_azimuth = true;
  self.degrees_azimuth_target = degrees;
  self.moveDegrees('azimuth', degreesToMove, direction, speed);
};

ArrowMover.prototype.moveToAltitude = function(
  degrees,
  speed
) {
  var self = this;
  if (degrees > 90 || degrees < -90) {
    console.error('moveToAltitude() called with > 90 or < -90 degrees. Ignoring.');
    return;
  }

  var degreesToMove = Math.abs(degrees - self.degrees_altitude);
  var direction = true;
  if (degrees - self.degrees_altitude < 0) direction = false;

  console.log('alt degreesToMove: ' + degreesToMove);
  console.log('alt direction: ' + direction);
  console.log('alt speed: ' + speed);
  self.moving_altitude = true;
  self.degrees_altitude_target = degrees;
  self.moveDegrees('altitude', degreesToMove, direction, speed);
};


trackMoon = function() {
  var first_run = true;
  var speed_alt = config.SPEED_ALTITUDE;

  var j = schedule.scheduleJob(config.SCHEDULE, function() {
    var moonPos = suncalc.getMoonPosition(new Date(), config.LAT, config.LON);
    var moon_azimuth = 180 + radians2Degrees(moonPos['azimuth']);
    var moon_altitude = radians2Degrees(moonPos['altitude']);
    console.log('----- ' + new Date() + ' -----');
    console.log('moon_azimuth: ' + moon_azimuth);
    console.log('moon_altitude: ' + moon_altitude);
    if (!arrowMover.is_moving()) {
      // run as fast as possible the first time, then use global speed
      // var speed_azi = (first_run === true) ? config.MAXSPEED_AZIMUTH : config.SPEED_AZIMUTH;
      var speed_azi = config.SPEED_AZIMUTH;
      arrowMover.moveToAzimuth(moon_azimuth, speed_azi);
      arrowMover.moveToAltitude(moon_altitude, speed_alt);
      first_run = false;
    } else {
      console.log('Arrow in motion; skipping this movement.');
    }
  });
};

testFullCircle = function (direction) {
  arrowMover.moveDegrees('azimuth', 360, direction, config.SPEED_AZIMUTH);
  // setTimeout(function() {
  //   arrowMover.moveDegrees('altitude', 20, direction, 0.06, config.DEGREES2SECONDS_ALTITUDE);
  // }, 1000);
  // servo_altitude.stop();

  // console.log(util.inspect(servo_azimuth));
  // console.log('deadband: ' + servo_azimuth.deadband);
};

nudge = function (axis, degrees, direction) {
  arrowMover.moveDegrees(axis, degrees, direction, config.SPEED_AZIMUTH);
};

board.on("ready", function() {
  servo_azimuth = new five.Servo.Continuous({
    pin: config.PIN_AZIMUTH,
    deadband: config.DEADBAND_AZIMUTH
  });
  servo_altitude = new five.Servo.Continuous({
    pin: config.PIN_ALTITUDE,
    deadband: config.DEADBAND_ALTITUDE
  });
  arrowMover = new ArrowMover(servo_azimuth, servo_altitude);
  trackMoon();
//  testFullCircle(true);

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", function(ch, key) {
    if (!key) {
      return;
    }

    if (key.name === "q") {
      console.log("Quitting");
      process.exit();
    } else if (key.name === "up") {
      console.log("alt CW");
      nudge('altitude', 4, true);
    } else if (key.name === "down") {
      console.log("alt CCW");
      nudge('altitude', 4.2, false);
    } else if (key.name === "left") {
      console.log("azi CCW");
      nudge('azimuth', 4, false);
    } else if (key.name === "right") {
      console.log("azi CW");
      nudge('azimuth', 4, true);
    } else if (key.name === "space") {
      console.log("Stopping");
      servo_azimuth.stop();
      servo_altitude.stop();
    }
  });
});
