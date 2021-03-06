#!/usr/bin/env node

const gamepad = require("gamepad");
const robot = require("robotjs");
const startStopDaemon = require("start-stop-daemon");
const notifier = require("node-notifier");

const GAMEPAD_KEYS = {
  UP_ARROW: 5,
  DOWN_ARROW: 6,
  LEFT_ARROW: 7,
  RIGHT_ARROW: 8,

  START: 9,
  BACK: 10,
  
  RB: 14,
  LB: 13,
  
  A: 16,
  B: 17,
  X: 18,
  Y: 19
};

const RC = {
  enabled: true,

  sendNotification: function (status) {
    if (status) {
      notifier.notify({
        title: "Gamepad Remote",
        message: "Key bindings have been enabled"
      })
    } else {
      notifier.notify({
        title: "Gamepad Remote",
        message: "Key bindings have been disabled"
      })
    }
  },

  toggle: function () {
    this.enabled = !this.enabled;
    this.sendNotification(this.enabled);
  }
}

// Sequence object to trigger a callback for a particular key sequence
const Seq = {
  THRESHOLD_TS: 700, 

  keyArr: [],
  lastKeyTs: 0, // Unix timestamp for the last key press
  subscriptions: [],

  add: function (key) {
    const lastKey = this.keyArr [this.keyArr.length - 1];

    if (lastKey && (Date.now() - this.lastKeyTs) > this.THRESHOLD_TS) {
      this.keyArr = [];
    }

    this.keyArr.push (key);
    this.lastKeyTs = Date.now();
  
    for (let i = 0; i < this.subscriptions.length; i++) {
      const subscription = this.subscriptions [i];
      const keysWerePressedInSeq = subscription.seq.every ((val, index) => {
        const currKey = this.keyArr [index];
        
        return currKey && val === currKey;
      });

      if (keysWerePressedInSeq) {
        subscription.callback ();
      }
    }
  },

  subscribeTo: function (keySeq, callback) {
    this.subscriptions.push ({
      seq: keySeq,
      callback
    })
  }
};

startStopDaemon (function () {
  gamepad.init()

  // Create a game loop and poll for events
  setInterval (gamepad.processEvents, 16);

  // Scan for new gamepads as a slower rate
  setInterval (gamepad.detectDevices, 500);

  RC.sendNotification(true);

  // Subscribe to both sequences since they can be confused.
  Seq.subscribeTo ([
    GAMEPAD_KEYS.LB,
    GAMEPAD_KEYS.LB,
    GAMEPAD_KEYS.RB,
    GAMEPAD_KEYS.RB
  ], function () {
    RC.toggle ()
  });

  Seq.subscribeTo ([
    GAMEPAD_KEYS.RB,
    GAMEPAD_KEYS.RB,
    GAMEPAD_KEYS.LB,
    GAMEPAD_KEYS.LB
  ], function () {
    RC.toggle ()
  });
  
  gamepad.on ("up", function (id, num) {
    Seq.add (num);

    // If remote control has been disabled, don't do anything 
    // with keys. 
    if (!RC.enabled) {
      return;
    }
    
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
