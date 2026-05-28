#include <FastLED.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <ElegantOTA.h>
#include <LittleFS.h>
#include <ESPmDNS.h>
#include <NimBLEDevice.h>

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

NimBLEServer *pServer = NULL;
NimBLECharacteristic * pTxCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

class MyServerCallbacks: public NimBLEServerCallbacks {
    void onConnect(NimBLEServer* pServer) {
      deviceConnected = true;
    }
    void onDisconnect(NimBLEServer* pServer) {
      deviceConnected = false;
    }
};

class MyCallbacks: public NimBLECharacteristicCallbacks {
    void onWrite(NimBLECharacteristic *pCharacteristic) {
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

void setupBLE() {
    NimBLEDevice::init("Holospin_POV");
    pServer = NimBLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());
    
    NimBLEService *pService = pServer->createService(SERVICE_UUID);
    pTxCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_TX,
                      NIMBLE_PROPERTY::NOTIFY
                    );
    
    NimBLECharacteristic * pRxCharacteristic = pService->createCharacteristic(
                         CHARACTERISTIC_UUID_RX,
                         NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::WRITE_NR
                       );
    pRxCharacteristic->setCallbacks(new MyCallbacks());
    pService->start();
    
    NimBLEAdvertising *pAdvertising = NimBLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pServer->getAdvertising()->start();
    Serial.println("BLE Advertising Started, waiting for clients...");
}

void setup() {
    Serial.begin(115200);
    delay(2000); // 1. נותן למתח להתייצב
    Serial.println("Starting Setup...");

    if(!LittleFS.begin(true)){
        Serial.println("An Error has occurred while mounting LittleFS");
        return;
    }

    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);
    pinMode(MOTOR_PIN, OUTPUT);
    digitalWrite(MOTOR_PIN, HIGH);

    // 2. קודם כל לדים - וכיבוי שלהם כדי לחסוך חשמל בהתחלה
    FastLED.addLeds<WS2812B, LED_PIN_A, GRB>(armA, NUM_LEDS_PER_ARM);
    FastLED.addLeds<WS2812B, LED_PIN_B, GRB>(armB, NUM_LEDS_PER_ARM);
    FastLED.setBrightness(intensity);
    FastLED.clear();
    FastLED.show();

    // 3. הפעלת ה-AP
    WiFi.mode(WIFI_AP_STA);
    if (WiFi.softAP(AP_SSID, AP_PASS)) {
        Serial.println("AP Started. IP: " + WiFi.softAPIP().toString());
    } else {
        Serial.println("AP Failed");
    }
    
    delay(500); // הפסקה קטנה בין רדיו לרדיו
    
    // 4. הפעלת BLE עם NimBLE
    setupBLE();

    // CORS Header Middleware
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
    
    // Web Server routing
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
    server.on("/api/diagnostic", HTTP_GET, [](AsyncWebServerRequest *request){
        StaticJsonDocument<200> doc;
        doc["status"] = "ok";
        doc["uptime"] = millis();
        doc["free_heap"] = ESP.getFreeHeap();
        doc["wifi_rssi"] = WiFi.RSSI();
        String response;
        serializeJson(doc, response);
        request->send(200, "application/json", response);
    });
    server.on("/api/logs", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/plain", "Holospin Boot Logs\nSystem initialized.\nReady.");
    });
    server.on("/calibrate", HTTP_POST, [](AsyncWebServerRequest *request){
        request->send(200, "application/json", "{\"status\": \"success\"}");
    });
    server.serveStatic("/", LittleFS, "/");
    server.on("/config", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        StaticJsonDocument<200> doc;
        DeserializationError error = deserializeJson(doc, data);
        if (error) { request->send(400, "text/plain", "Invalid JSON"); return; }
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
    server.onNotFound([](AsyncWebServerRequest *request) {
        if (request->method() == HTTP_OPTIONS) { request->send(200); } 
        else { request->send(404, "text/plain", "Not found"); }
    });
    
    ElegantOTA.begin(&server);

    // 5. חיבור לראוטר (בלי לחסום את כל הקוד)
    WiFi.begin(ROUTER_SSID, ROUTER_PASS);
    
    // 6. תפעיל בסוף את ה-WebServer
    server.begin();
    Serial.println("HTTP Server Started");
    
    // Check router connection asynchronously
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    Serial.println();
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Connected to router: " + WiFi.localIP().toString());
        if (MDNS.begin(HOSTNAME)) {
            Serial.println("MDNS responder started, use http://holospin.local/");
        }
    } else {
        Serial.println("Failed to connect to router. Operating in AP mode.");
    }
    
    // AsyncWebServer doesn't require xTaskCreatePinnedToCore since it manages its own tasks.
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
    
    // Slow down FastLED while advertising to keep BLE stable
    if (!deviceConnected) {
        delay(50);
    } else {
        delay(5);
    }
}

