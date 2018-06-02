var config = {};

config.MOVEMENT_THRESHOLD = 1;  // under this # of seconds, don't move

config.DEGREES2SECONDS_AZIMUTH_CW = 0.0936;  // multiplier to convert degrees to seconds of continuous servo motion
config.DEGREES2SECONDS_AZIMUTH_CCW = 0.0753;
config.MAXSPEED_AZIMUTH = 0.75;  // maximum possible
config.SPEED_AZIMUTH = 0.2;
config.DEADBAND_AZIMUTH = [92, 92];

config.DEGREES2SECONDS_ALTITUDE_CW = 0.013;
config.DEGREES2SECONDS_ALTITUDE_CCW = 0.0097;
config.SPEED_ALTITUDE = 0.06;  // minimum possible
config.DEADBAND_ALTITUDE = [92, 92];

// Windows/WSL: /dev/ttyS3 Pi 3: /dev/ttyACM0
config.BOARD_PORT = "/dev/ttyACM0";
config.PIN_AZIMUTH = 10;
config.PIN_ALTITUDE = 9;
// in cron format; see https://www.npmjs.com/package/node-schedule
// also https://crontab.guru/every-5-minutes
// config.SCHEDULE = '*/5 * * * *';  // 5 minutes
config.SCHEDULE = '*/1 * * * *';  // 1 minute
config.LAT = 40.760062;
config.LON = -73.928431;
config.START_AZIMUTH = 0;
config.START_ALTITUDE = 0;

module.exports = config;
