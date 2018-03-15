# moon-arrow
Code for johnny-five control of azimuth and altitude servos for moving moon arrow on a schedule

## Installation
- Hardware: Arduino Uno, continuous servo, cables
- On Windows: 
  - Install WSL https://www.howtogeek.com/249966/how-to-install-and-use-the-linux-bash-shell-on-windows-10/
  - Install Arduino IDE https://www.arduino.cc/en/Main/Software (Windows installer)
- Clone this repository, using GUI or commandline: `git clone https://github.com/saanobhaai/moon-arrow.git 
/path/to/repos`
- In WSL or from linux:
  ```
  cd /path/to/repo/
  sudo npm install johnny-five
  sudo npm install node-schedule
  sudo npm install suncalc
  ```

## Configuration
- Attach azimuth servo to desired pin with 5V power and ground also connected
- Plug in Arduino to USB port
- Determine port. On a Pi this should I think be `/dev/serial0` but may need to do some research depending on 
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
