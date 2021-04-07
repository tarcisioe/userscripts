// ==UserScript==
// @name        Jitsi Notifications
// @namespace   tarcisioe
// @match       https://meet.jit.si/*
// @grant       none
// @version     1.0
// @author      Tarcísio Eduardo Moreira Crocomo
// @description Adds desktop notifications for Jitsi's chat and raise hand features.
// ==/UserScript==

(() => {
  async function waitCondition(cond) {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (cond()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  async function getNotificationPermission () {
    if (Notification.permission === 'granted') {
      return;
    }

    Notification.requestPermission();
    await waitCondition(() => Notification.permission === 'granted');
  }

  function notify(title, text) {
    if (!document.hasFocus()) {
      new Notification(title, { body: text });
    }
  }

  async function main() {
    await waitCondition(() => window.APP.conference._room !== undefined );
    await getNotificationPermission();

    const conference = window.APP.conference;
    const room = conference._room;
    const ownUserID = conference.getMyUserId();

    room.addEventListener(
      'conference.participant_property_changed',
      (user, property, _, new_value) => {
        if (property === 'raisedHand' && new_value === "true") {
          notify("Hand raised", `${user._displayName} levantou a mão`);
        }
      },
    );

    room.addEventListener(
      'conference.messageReceived',
      (userID, message, _2, displayName) => {
        if (userID != ownUserID) {
          notify("New message", `${displayName}: ${message}`);
        }
      },
    );
  }

  main();
})();
