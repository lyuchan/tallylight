#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <EEPROM.h>

#define LED_PIN D4   // 連接 WS2812 LED 的腳位
#define LED_COUNT 8  // LED 燈條的 LED 數量
WiFiManager wm;
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);
//const char* ssid = "lyuchan2.4";
//const char* password = "david0831";
WiFiUDP udp;
const int udpPort = 8080;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE];
int id = 0;
void setup() {
  //wm.resetSettings();

  strip.begin();
  strip.show(); 
  light(0,0,255);
   wm.autoConnect("set_my_tally","super_password");
   light(0,0,0);
   // 初始化 LED 燈條，並將所有 LED 關閉
  //Serial.begin(115200);
  //id = reeprom(eepromaddress);
 // Serial.println(id);
  //WiFi.begin(ssid, password);
  //while (WiFi.status() != WL_CONNECTED) {
  //  delay(1000);
   // Serial.println("Connecting to WiFi...");
  //}
  //Serial.println("Connected to WiFi");
  udp.begin(udpPort);
  //Serial.print("Listening on UDP port ");
  //Serial.println(udpPort);
}

void loop() {
  int packetSize = udp.parsePacket();
  if (packetSize) {
    //Serial.print("Received packet of size ");
    //Serial.println(packetSize);
    int len = udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
    if (len > 0) {
      packetBuffer[len] = 0;
    }
    ////Serial.println("Contents:");
    ////Serial.println(packetBuffer);
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, packetBuffer);
    if (error) {
      //Serial.print(F("de//SerializeJson() failed: "));
      //Serial.println(error.f_str());
      return;
    }
    const char* get = doc[0]["get"];
    //int pgm = doc[0]["pgm"];


    if (strcmp(get, "ping") == 0) {  //偵測上線用
      udp.beginPacket(udp.remoteIP(), udp.remotePort());
      udp.write("pong!");
      udp.endPacket();
      //Serial.println("pong!");
    } else if (strcmp(get, "tallyidset") == 0) {  //設定tally id
      int idbuffer = doc[0]["id"];                //id
     // weeprom(eepromaddress, idbuffer);
      id = idbuffer;
      //Serial.print("setid:");
      //Serial.println(id);
    } else if (strcmp(get, "find") == 0) {  //尋找tally
      //Serial.println("find!");
      flashWhite(10);
    } else if (strcmp(get, "tally") == 0) {  //設定tally
      int pgm = doc[0]["pgm"];               //pgm
      int pwv = doc[0]["pwv"];               //pwv
      //Serial.printf("tally pgm:%d pwv:%d", pgm, pwv);
      if ((id != pgm) && (id != pwv)) {  //off
        light(0, 0, 0);
      }
      if ((id == pgm) && (id != pwv)) {  //pgm
        light(255, 0, 0);
      }
      if ((id != pgm) && (id == pwv)) {  //pwv
        light(0, 255, 0);
      }
      if ((id == pgm) && (id == pwv)) {  //pgm+pwv
        light(255, 255, 0);
      }
    }
  }
}
void light(int r, int g, int b) {
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(r, g, b));
  }
  strip.show();
}
void light(uint32_t color) {
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, color);
  }
  strip.show();
}
void flashWhite(int numFlashes) {
  uint32_t color = strip.getPixelColor(0);
  for (int i = 0; i < numFlashes; i++) {
    light(255, 255, 255);
    delay(50);  // 等待 0.1 秒
    light(0, 0, 0);
    delay(50);  // 等待 0.1 秒
  }
  light(color);
}/*
void weeprom(int address, int number) {
  EEPROM.put(address, number);
  EEPROM.commit();
}
int reeprom(int address) {
  int readValue;
  EEPROM.get(address, readValue);
  return readValue;
}*/