const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3030 });

let speakers = [];

const {ADD, REMOVE, REMOVEFIRST, UPDATE, SPEAKERS} = require('../src/constants.js');

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    data = JSON.parse(data);
    console.log(data);
    let index;

    switch(data.action) {
      case SPEAKERS:
        ws.send(JSON.stringify(speakers));
        return;
      case ADD:
        index = speakers.indexOf(data.name);
        if (index < 0 && data.name !== '') {
          speakers.push(data.name);
        }
        break;
      case REMOVE:
        index = speakers.indexOf(data.name);
        if (index > -1) {
          speakers.splice(index, 1);
        }
        break;
      case REMOVEFIRST:
        if (speakers.length > 0) {
          speakers.splice(0,1);
        }
        break;
      case UPDATE:
        index = speakers.indexOf(data.oldName);
        if (index > -1) {
          speakers[index] = data.newName;
        }
        break;
      default:
    }

    console.log(speakers);

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(speakers));
      }
    });
  });
});

