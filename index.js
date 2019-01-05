#!/usr/bin/env node

const gamepad = require("gamepad");
const robot = require("robotjs");
const startStopDaemon = require("start-stop-daemon");

const GAMEPAD_KEYS = {
  UP_ARROW: 5,
  DOWN_ARROW: 6,
  LEFT_ARROW: 7,
  RIGHT_ARROW: 8,

  START: 9,
  BACK: 10,

  A: 16,
  B: 17,
  X: 18,
  Y: 19
};

startStopDaemon (function () {
  gamepad.init()

  // Create a game loop and poll for events
  setInterval (gamepad.processEvents, 16);

  // Scan for new gamepads as a slower rate
  setInterval (gamepad.detectDevices, 500);

  gamepad.on ("up", function (id, num) {
    if (num === GAMEPAD_KEYS.RIGHT_ARROW) {
      robot.keyTap ("right");
    }

    if (num === GAMEPAD_KEYS.LEFT_ARROW) {
      robot.keyTap ("left");
    }

    if (num === GAMEPAD_KEYS.UP_ARROW) {
      robot.keyTap ("up");
    }

    if (num === GAMEPAD_KEYS.DOWN_ARROW) {
      robot.keyTap ("down");
    }
    
    if (num === GAMEPAD_KEYS.A) {
      robot.keyTap ("space");
    }
  });
});