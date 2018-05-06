# moon-arrow
Code for johnny-five control of azimuth and altitude servos for moving moon arrow on a schedule

## Installation
- Hardware: Arduino Uno, 2 continuous servos, jumper cables
- On Pi3:
  - Install ssh/VNC: https://www.hackster.io/IainIsCreative/setting-up-the-raspberry-pi-and-johnny-five-56d60f
  - `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
  - `sudo apt-get upgrade`
  - `sudo apt-get install -y nodejs`
- On Windows: 
  - Install WSL https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/
  - Install Arduino IDE https://www.arduino.cc/en/Main/Software (Windows installer)
- Clone this repository, using GUI or commandline: `git clone https://github.com/saanobhaai/moon-arrow.git /path/to/repos/moon-arrow/`
- In WSL or from linux:
  ```
  sudo npm install johnny-five
  sudo npm install node-schedule
  sudo npm install suncalc
  ```

## Configuration
- Attach azimuth and altitude servos to desired pins with 5V power and ground also connected
- Plug in Arduino to USB port
- Determine port. On a Pi3 this should be `/dev/ttyACM0` but may need to do some research depending on 
model/environment.  
On Windows: 
  - Open Windows Device Manager, note COM port number used by Arduino
  - Map Windows `COM<N>` to WSL `/dev/ttyS<N>`  
  https://blogs.msdn.microsoft.com/wsl/2017/04/14/serial-support-on-the-windows-subsystem-for-linux/  
    In WSL:
    ```
    sudo chmod 666 /dev/ttyS<N>
    stty -F /dev/ttyS<N> sane 57600
    ```
  - Run Arduino IDE serial monitor, verify one-line response from board
- Create config for local environment:
  - `cp /path/to/repo/config.sample.js /path/to/repo/config.js`
  - adjust constants in `config.js` as necessary, using port and pin data derived from above

## Running
- `cd /path/to/repo/`
- `node main.js`
