#include <FastLED.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <ElegantOTA.h>
#include <LittleFS.h>
#include <ESPmDNS.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Pins
#define LED_PIN_A 25
#define LED_PIN_B 26
#define HALL_SENSOR_PIN 4
#define MOTOR_PIN 17
#define NUM_LEDS_PER_ARM 44

// Wi-Fi Config - CHANGE THESE TO YOUR SETTINGS
#define ROUTER_SSID "YOUR_ROUTER_SSID"
#define ROUTER_PASS "YOUR_ROUTER_PASS"
#define AP_SSID "Holospin_AP"
#define AP_PASS "12345678"
#define HOSTNAME "holospin"

// BLE Config
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_RX "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CHARACTERISTIC_UUID_TX "beb5483e-36e1-4688-b7f5-ea07361b26a9"

// Playback Files
#define PLAYBACK_FILE_COUNT 2
const char* PLAYBACK_FILES[PLAYBACK_FILE_COUNT] = {
  "/images/butterfly.png",
  "/videos/galaxy.mp4"
};

CRGB armA[NUM_LEDS_PER_ARM];
CRGB armB[NUM_LEDS_PER_ARM];

// Timing & Config
volatile unsigned long lastPulseTime[3] = {0, 0, 0};
volatile unsigned long pulseIntervals[5] = {0, 0, 0, 0, 0};
volatile int pulseIdx = 0;
String currentPattern = "clock";
int textSpeed = 50;
int intensity = 80;
CRGB patternColor = CRGB::Red;

AsyncWebServer server(80);

BLEServer *pServer = NULL;
BLECharacteristic * pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    }
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue().c_str();
      if (rxValue.length() > 0) {
        Serial.println("*********");
        Serial.print("Received Value: ");
        for (int i = 0; i < rxValue.length(); i++)
          Serial.print(rxValue[i]);
        Serial.println();
        Serial.println("*********");
      }
    }
};

void IRAM_ATTR hallISR() {
    static unsigned long lastISR = 0;
    unsigned long now = millis();
    if(now - lastISR < 50) return;
    
    unsigned long interval = now - lastISR;
    pulseIntervals[pulseIdx] = interval;
    pulseIdx = (pulseIdx + 1) % 5;
    
    lastPulseTime[0] = now;
    lastISR = now;
}

void setup() {
    Serial.begin(115200);
    delay(2000);
    Serial.println("Starting Setup...");

    if(!LittleFS.begin(true)){
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);
    pinMode(MOTOR_PIN, OUTPUT);
    digitalWrite(MOTOR_PIN, HIGH);

    FastLED.addLeds<WS2812B, LED_PIN_A, GRB>(armA, NUM_LEDS_PER_ARM);
    FastLED.addLeds<WS2812B, LED_PIN_B, GRB>(armB, NUM_LEDS_PER_ARM);
    FastLED.setBrightness(intensity);

    // Wi-Fi
    WiFi.mode(WIFI_AP_STA);
    if (WiFi.softAP(AP_SSID, AP_PASS)) {
        Serial.println("AP Started. IP: " + WiFi.softAPIP().toString());
    } else {
        Serial.println("AP Failed");
    }
    
    WiFi.begin(ROUTER_SSID, ROUTER_PASS);
    
    // mDNS
    if (MDNS.begin(HOSTNAME)) {
        Serial.println("MDNS responder started, use http://holospin.local/");
    }
    
    // CORS Header Middleware
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "content-type");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    
    // Web Server
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/html", "<h1>Holospin ESP32 Web Interface</h1>");
    });
    
    server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
        StaticJsonDocument<200> doc;
        doc["pattern"] = currentPattern;
        doc["intensity"] = intensity;
        doc["speed"] = textSpeed;
        char colorHex[8];
        sprintf(colorHex, "#%02x%02x%02x", patternColor.r, patternColor.g, patternColor.b);
        doc["color"] = colorHex;
        
        String response;
        serializeJson(doc, response);
        request->send(200, "application/json", response);
    });
    
    server.on("/api/discover", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "application/json", "{\"status\": \"ok\", \"device\": \"holospin-esp32\"}");
    });

    server.serveStatic("/", LittleFS, "/");

    server.on("/config", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        StaticJsonDocument<200> doc;
        DeserializationError error = deserializeJson(doc, data);
        if (error) {
            request->send(400, "text/plain", "Invalid JSON");
            return;
        }
        
        if (doc.containsKey("pattern")) currentPattern = doc["pattern"].as<String>();
        if (doc.containsKey("speed")) textSpeed = doc["speed"].as<int>();
        if (doc.containsKey("intensity")) {
          intensity = doc["intensity"].as<int>();
          FastLED.setBrightness(intensity);
        }
        if (doc.containsKey("color")) {
          long colorVal = strtol(doc["color"].as<String>().substring(1).c_str(), NULL, 16);
          patternColor = CRGB(colorVal >> 16, (colorVal >> 8) & 0xFF, colorVal & 0xFF);
        }
        request->send(200, "text/plain", "OK");
    });
    
    // OPTIONS handler for CORS preflight
    server.onNotFound([](AsyncWebServerRequest *request) {
        if (request->method() == HTTP_OPTIONS) {
            request->send(200);
        } else {
            request->send(404, "text/plain", "Not found");
        }
    });
    
    ElegantOTA.begin(&server);
    server.begin();
    Serial.println("HTTP Server Started");
    
    // BLE Setup
    BLEDevice::init("Holospin_POV");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    BLEService *pService = pServer->createService(SERVICE_UUID);
    pTxCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_TX,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
    pTxCharacteristic->addDescriptor(new BLE2902());
    
    BLECharacteristic * pRxCharacteristic = pService->createCharacteristic(
                         CHARACTERISTIC_UUID_RX,
                         BLECharacteristic::PROPERTY_WRITE
                       );
    pRxCharacteristic->setCallbacks(new MyCallbacks());
    pService->start();
    
    // BLE Advertising
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    // iOS compatibility
    pAdvertising->setMinPreferred(0x06);  
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();
    Serial.println("BLE Advertising Started, waiting for clients...");
}

void loop() {
    float avgInterval = 0;
    for(int i=0; i<5; i++) avgInterval += pulseIntervals[i];
    avgInterval /= 5;
    
    float phase = avgInterval > 0 ? (float)(millis() - lastPulseTime[0]) / avgInterval : 0;
    if (phase > 1.0) phase = 0;

    FastLED.clear();
    for (int i = 0; i < NUM_LEDS_PER_ARM; i++) {
        armA[i] = CHSV((i * 2) + (phase * 255), 255, intensity);
        armB[i] = CHSV((i * 2) + (phase * 255) + 128, 255, intensity);
    }
    FastLED.show();
    
    // Handle BLE discconnect/reconnect
    if (!deviceConnected && oldDeviceConnected) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("Start advertising");
        oldDeviceConnected = deviceConnected;
    }
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }
    delay(5);
}

