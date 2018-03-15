var config = {};

config.DEGREES2SECONDS = 1;  // multiplier to convert degrees to seconds of continuous servo motion
config.SPEED = 0.2;  // 0 (off) - 1 (full speed)
// on a Pi this should I think be '/dev/serial0' but may need to do some research depending on model/environment
config.BOARD_PORT = "/dev/ttyS3";
config.PIN_AZIMUTH = 10;
config.PIN_ALTITUDE = 11;
// in cron format; see https://www.npmjs.com/package/node-schedule
// also https://crontab.guru/every-5-minutes
// config.SCHEDULE = '*/5 * * * *';  // 5 minutes
config.SCHEDULE = '*/1 * * * *';  // 1 minute
config.LAT = 45.494531;
config.LON = -73.571727;
config.START_AZIMUTH = 0;
config.START_ALTITUDE = 0;

module.exports = config;
