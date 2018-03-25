var events = require('events');
var schedule = require('node-schedule');  // https://www.npmjs.com/package/node-schedule
var suncalc = require('suncalc');  // https://github.com/mourner/suncalc
var five = require("johnny-five");  // http://johnny-five.io/
var config = require('./config');

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
  this.degrees_azimuth = config.START_AZIMUTH;
  this.degrees_altitude = config.START_ALTITUDE;
};
ArrowMover.prototype = new events.EventEmitter;

ArrowMover.prototype.is_moving = function() {
  var self = this;
  return self.moving_azimuth || self.moving_altitude;
};

// direction: true for clockwise, false for counterclockwise
ArrowMover.prototype.moveDegrees = function(
  type,
  degrees,
  direction = true,
  speed = config.SPEED
) {
  var self = this;
  var servo = (type === 'azimuth') ? self.servo_azimuth : self.servo_altitude;
  var seconds = degrees * config.DEGREES2SECONDS * (1 / speed);

  if (direction === true) {
    console.log('moving ' + type + ' clockwise ' + seconds + ' seconds');
    servo.cw(speed);
  } else {
    console.log('moving ' + type + ' counter-clockwise ' + seconds + ' seconds');
    servo.ccw(speed);
  }

  setTimeout(function() {
    servo.stop();
    self.emit('done:' + type);
  }, seconds * 1000);
};

ArrowMover.prototype.moveToAzimuth = function(
  degrees,  // absolute direction, 0 - 360
  speed = config.SPEED
) {
  var self = this;

  if (degrees > 360) {
    console.error('moveToAzimuth() called with > 360 degrees.');
  }
  else if (degrees === 360) degrees = 0;

  var degreesToMove = Math.abs(degrees - self.degrees_azimuth);
  var direction = true;
  if (degrees - self.degrees_azimuth < 0) direction = false;
  // If going more than halfway around the circle, take the shorter route
  if (degreesToMove > 180) {
    degreesToMove = 360 - degreesToMove;
    direction = !direction;
  }

  console.log('degreesToMove: ' + degreesToMove);
  console.log('direction: ' + direction);
  console.log('speed: ' + speed);
  self.moving_azimuth = true;
  self.moveDegrees('azimuth', degreesToMove, direction, speed);
  self.on('done:azimuth', function() {
    self.degrees_azimuth = degrees;
    self.moving_azimuth = false;
  });
};


trackMoon = function() {
  var servo_azimuth = new five.Servo.Continuous(config.PIN_AZIMUTH);
  var servo_altitude = new five.Servo.Continuous(config.PIN_ALTITUDE);
  var arrowMover = new ArrowMover(servo_azimuth, servo_altitude);
  var first_run = true;

  var j = schedule.scheduleJob(config.SCHEDULE, function() {
    var moonPos = suncalc.getMoonPosition(new Date(), config.LAT, config.LON);
    var moon_azimuth = radians2Degrees(moonPos['azimuth']);
    var moon_altitude = radians2Degrees(moonPos['altitude']);
    console.log('----- ' + new Date() + ' -----');
    console.log('moon_azimuth: ' + moon_azimuth);
    console.log('moon_altitude: ' + moon_altitude);
    if (!arrowMover.is_moving()) {
      // run as fast as possible the first time, then use global speed
      var speed = (first_run === true) ? 1 : config.SPEED;
      arrowMover.moveToAzimuth(moon_azimuth, speed);
      // arrowMover.moveToAltitude() here
      first_run = false;
    } else {
      console.log('Arrow in motion; skipping this movement.');
    }
  });
};

testFullCircle = function (direction) {
  var servo_azimuth = new five.Servo.Continuous(config.PIN_AZIMUTH);
  var servo_altitude = new five.Servo.Continuous(config.PIN_ALTITUDE);
  var arrowMover = new ArrowMover(servo_azimuth, servo_altitude);

  arrowMover.moveDegrees('azimuth', 360, direction, config.SPEED);
};


board.on("ready", function() {
  testFullCircle(true);  // CW
  // testFullCircle(false);  // CCW
});
// board.on("ready", trackMoon);
