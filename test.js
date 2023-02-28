//const os = require('os');
const dgram = require('dgram');
const fs = require('fs');
const express = require("express");
const MESSAGE = Buffer.from(JSON.stringify([{
    "get": "ping"
}]));
const PORT = 8080;
const webPORT = 80;
const { json } = require('stream/consumers');
const app = express();
const SocketServer = require("ws").Server;
const server = app.listen(webPORT, () => {
    console.log("Application started and Listening on port 8080");
});

const wss = new SocketServer({ server });
const client = dgram.createSocket('udp4');
const espAddresses = []; // 儲存esp8266的IP地址的陣列
const timers = {};
let user;
let atemip = "192.168.255.255";
let BROADCAST_ADDR = '192.168.50.255'; // 廣播地址
fs.readFile('./data/login_data.json', 'utf-8', (err, data) => {
    if (err) {
        throw err;
    }
    user = JSON.parse(data.toString());
});


app.use(express.static(__dirname + "/web"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/web/index.html");
});


/////////////////////////websocket/////////////////////////

wss.on("connection", (ws) => {
    ws.on("message", (event) => {
        let res = JSON.parse(event.toString());
        console.log(res);
        if (res.get == "login") {
            let login = getlogin(res.uuid, res.password);
            send(JSON.stringify({ get: "login", password: login[0], name: login[1] }));
        }
        if (res.get == "atemip") {
            send(JSON.stringify({ get: "atemip", data: "ok" }));
            atemip = res.ip;
            BROADCAST_ADDR = getlocal(atemip);
        }

        if (res.get == "tallyip") {
            send(JSON.stringify({ get: "tallyip", ip: espAddresses }));
        }
        if (res.get == "tallylight") {
            send(JSON.stringify({ get: "tallylight", data: "ok" }));
            sendtally(res.ip, JSON.stringify([{ get: "tallyidset", id: res.data }]))
        }
        if (res.get == "findtally") {
            send(JSON.stringify({ get: "findtally", data: "ok" }));
            sendtally(res.ip, JSON.stringify([{ get: "find" }]))
        }


    });
    ws.on("close", () => {

    });
});
/////////////////////////find_tally/////////////////////////

client.bind(() => {
    client.setBroadcast(true);
});

client.on('listening', () => {
    console.log('Broadcasting messages...');
    setInterval(() => {
        client.send(MESSAGE, PORT, BROADCAST_ADDR, (err) => {
            if (err) {
                console.error(err);
            } else {
                //console.log('Broadcast message sent');
                //console.log(espAddresses)
            }
        });
    }, 1000); // 每5秒廣播一次
});

client.on('error', (err) => {
    console.error(`Error: ${err}`);
});

client.on('message', (msg, rinfo) => {
    // console.log(`Received message from ${rinfo.address}:${rinfo.port}: ${msg}`);
    if (!espAddresses.includes(rinfo.address)) {
        espAddresses.push(rinfo.address); // 將新的IP地址加入到陣列中
        console.log(`found new esp8266: ${rinfo.address}`);
    }

    if (!timers[rinfo.address]) {
        timers[rinfo.address] = setTimeout(() => {
            // 刪除IP地址
            espAddresses.splice(espAddresses.indexOf(rinfo.address), 1);
            delete timers[rinfo.address];
            console.log(`ESP8266 ${rinfo.address} removed due to inactivity`);

        }, 5000); // 設定定時器時間為25秒
    } else {
        clearTimeout(timers[rinfo.address]);
        timers[rinfo.address] = setTimeout(() => {
            espAddresses.splice(espAddresses.indexOf(rinfo.address), 1);
            delete timers[rinfo.address];
            console.log(`ESP8266 ${rinfo.address} removed due to inactivity`);

        }, 5000); // 設定定時器時間為25秒
    }

});
/////////////////////////function/////////////////////////

//getlocaliplist
/*
function getlocaliplist() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    Object.keys(interfaces).forEach((netInterface) => {
        interfaces[netInterface].forEach((interfaceObject) => {
            if (interfaceObject.family === 'IPv4' && !interfaceObject.internal) {

                addresses.push(interfaceObject.address);
                //addresses = interfaceObject;
            }
        });
    });
    return addresses;
}*/
//帳密檢測
function getlogin(uuid, password) {
    console.log(uuid)
    console.log(password)
    for (let i = 0; i < user.length; i++) {
        if (uuid == user[i].uuid) {
            if (password == user[i].password) {
                console.log("ok");
                console.log(user[i].name)
                return [true, user[i].name];
            }
        }
    }
    console.log("no");
    return [false, null];
}

function settallynum(data) {

}
//ws send
function send(sendData) {
    let clients = wss.clients;
    clients.forEach((client) => {
        client.send(sendData);//回去的資料
    });
}
function webtally(pgm, pwv) {
    send(JSON.stringify({ get: "sendtally", pgm: pgm, pwv: pwv }));
}
function tally(pgm, pwv) {
    sendtally(BROADCAST_ADDR, JSON.stringify([{ get: "tally", pgm: pgm, pwv: pwv }]))
}
function sendtally(ip, data) {
    let MESSAGE = Buffer.from(data);
    client.send(MESSAGE, PORT, ip, (err) => {
        if (err) {
            console.error(err);
        } else {
            // console.log('Broadcast message sent');
            // console.log(data)
        }
    });
}
function getlocal(ip) {
    let iparray = ip.split(/[.]/);
    return iparray[0] + "." + iparray[1] + "." + iparray[2] + ".255"
}




const OBSWebSocket = require('obs-websocket-js');

/* Create new class using library. */
const obs = new OBSWebSocket();

let sense = []
let pgmid = 0;
let pwvid = 0;
let oldpgmid = 0;
let oldpwvid = 0;
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
            if (oldpgmid != pgmid || oldpwvid != pwvid) {
                oldpgmid = pgmid;
                oldpwvid = pwvid
                webtally(pgmid, pwvid);
                tally(pgmid, pwvid);
            }

        }, 5);
        setInterval(() => {
            webtally(pgmid, pwvid);
            tally(pgmid, pwvid);
        }, 100);
    })
    .catch((error) => {
        console.error('Failed to connect to OBS WebSocket:', error);
    });
