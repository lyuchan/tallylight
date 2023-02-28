const OBSWebSocket = require('obs-websocket-js');

/* Create new class using library. */
const obs = new OBSWebSocket();

let sense = []
let pgmid = 0;
let pwvid = 0;
obs.connect('ws://localhost:4444')
  .then(() => {
    console.log('Connected to OBS WebSocket');
    setInterval(() => {
      obs.send('GetSceneList').then((data) => {
        let res = data.scenes
        sense = []
        for (let i = 0; i < res.length; i++) {
          sense.push(res[i].name)
        }
      });
      obs.send('GetCurrentScene').then((data) => {
        pgmid = sense.indexOf(data.name) + 1;
      });
      obs.send('GetPreviewScene').then((data) => {
        pwvid = sense.indexOf(data.name) + 1;
      });
    }, 1000);
  })
  .catch((error) => {
    console.error('Failed to connect to OBS WebSocket:', error);
  });
