const dgram = require('dgram');
const PORT = 8080;
const webPORT = 80;
const BROADCAST_ADDR = '192.168.50.255'; // 廣播地址
const MESSAGE = Buffer.from('ping');

const client = dgram.createSocket('udp4');
client.bind(() => {
  client.setBroadcast(true);
});
const espAddresses = []; // 儲存esp8266的IP地址的陣列
client.on('listening', () => {
  console.log('Broadcasting messages...');
  setInterval(() => {
    client.send(MESSAGE, PORT, BROADCAST_ADDR, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Broadcast message sent');
        console.log(espAddresses)
      }
    });
  }, 1000); // 每5秒廣播一次
});

client.on('error', (err) => {
  console.error(`Error: ${err}`);
});
const timers = {};
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

