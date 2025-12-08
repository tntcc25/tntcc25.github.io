const BAUD_RATE = 9600; // This should match the baud rate in your Arduino sketch

let port, connectBtn; // Declare global variables

function setup() {
  setupSerial(); // Run our serial setup function (below)

  // Create a canvas that is the size of our browser window.
  // windowWidth and windowHeight are p5 variables
  createCanvas(windowWidth, windowHeight);

  // p5 text settings. BOLD and CENTER are constants provided by p5.
  // See the "Typography" section in the p5 reference: https://p5js.org/reference/
  textFont("system-ui", 50);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

function draw() {
   const portIsOpen = checkPort(); // Check whether the port is open (see checkPort function below)
   if (!portIsOpen) return; // If the port is not open, exit the draw loop

   let str = port.readUntil("\n"); // Read from the port until the newline
   if (str.length == 0) return; // If we didn't read anything, return.
    let message = str.trim().split(","); // Split the string into an array
    const buttonPin = Number(message[0]);  // First value is button state
    const pot = Number(message[1]); // Second value is potentiometer reading
    if (buttonPin === 0) { // button not pressed
      background("darkcyan"); // set background color
      fill("white"); // set text color
      text("Press button to start", windowWidth / 2, windowHeight / 2); // display instruction
      port.write(2); // send 2 to Arduino (LED off)
    } else if (buttonPin === 1) { // button pressed
      translate(windowWidth/2, windowHeight/2); // move origin to center
      background("purple"); // set background color
      fill("orange"); // set shape color
      circle(0, 0, 200); // draw circle at center
      let d = dist(mouseX, mouseY, width / 2, height / 2); // distance from mouse to center
      let insideCircle = d < 100; // check if mouse is inside circle
      if (insideCircle) { // mouse is inside circle
        angleMode(DEGREES); // set angle mode to degrees
        let rot = map(pot, 522, 1023, -90, 90); // map potentiometer value to rotation angle
        rotate(rot); // rotate by mapped angle
        fill("orange"); // set triangle color
        triangle(-100, 0, 100, 0, 0, -150); // draw triangle
        fill("orange"); // set circle color
        circle(0, 0, 200); // redraw circle to cover triangle center
        let LedBrightness = int(rot + 90); // map rotation to LED brightness (0-180)
        port.write(LedBrightness); // send brightness to Arduino
      }
    }
  }

// Three helper functions for managing the serial connection.

function setupSerial() {
  port = createSerial();

  // Check to see if there are any ports we have used previously
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    // If there are ports we've used, open the first one
    port.open(usedPorts[0], BAUD_RATE);
  }

  // create a connect button
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(5, 5); // Position the button in the top left of the screen.
  connectBtn.mouseClicked(onConnectButtonClicked); // When the button is clicked, run the onConnectButtonClicked function
}

function checkPort() {
  if (!port.opened()) {
    // If the port is not open, change button text
    connectBtn.html("Connect to Arduino");
    // Set background to gray
    background("gray");
    return false;
  } else {
    // Otherwise we are connected
    connectBtn.html("Disconnect");
    return true;
  }
}

function onConnectButtonClicked() {
  // When the connect button is clicked
  if (!port.opened()) {
    // If the port is not opened, we open it
    port.open(BAUD_RATE);
  } else {
    // Otherwise, we close it!
    port.close();
  }
}

// refereced example code under button directory and class example code on servo motor