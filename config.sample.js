var config = {};

config.MOVEMENT_THRESHOLD = 1;  // under this # of seconds, don't move

config.DEGREES2SECONDS_AZIMUTH = 0.125;  // multiplier to convert degrees to seconds of continuous servo motion
config.MAXSPEED_AZIMUTH = 0.75;  // maximum possible
config.SPEED_AZIMUTH = 0.2;
config.DEADBAND_AZIMUTH = [92, 92];

config.DEGREES2SECONDS_ALTITUDE_CW = 0.0191;  // multiplier to convert degrees to seconds of continuous servo motion
config.DEGREES2SECONDS_ALTITUDE_CCW = 0.0134;  // multiplier to convert degrees to seconds of continuous servo motion
config.SPEED_ALTITUDE = 0.06;  // minimum possible
config.DEADBAND_ALTITUDE = [92, 92];

// on a Pi this should I think be '/dev/serial0' but may need to do some research depending on model/environment
config.BOARD_PORT = "/dev/ttyS3";
config.PIN_AZIMUTH = 9;
config.PIN_ALTITUDE = 10;
// in cron format; see https://www.npmjs.com/package/node-schedule
// also https://crontab.guru/every-5-minutes
// config.SCHEDULE = '*/5 * * * *';  // 5 minutes
config.SCHEDULE = '*/1 * * * *';  // 1 minute
config.LAT = 45.494531;
config.LON = -73.571727;
config.START_AZIMUTH = 0;
config.START_ALTITUDE = 0;

module.exports = config;
