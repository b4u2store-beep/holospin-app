#include <FastLED.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <ElegantOTA.h>
#include <LittleFS.h>

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
    
    // Web Server
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/html", "<h1>Holospin ESP32 Web Interface</h1>");
    });
    
    server.serveStatic("/", LittleFS, "/");

    server.on("/config", HTTP_POST, [](AsyncWebServerRequest *request){}, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
        StaticJsonDocument<200> doc;
        DeserializationError error = deserializeJson(doc, data);
        if (error) {
            request->send(400, "text/plain", "Invalid JSON");
            return;
        }
        
        currentPattern = doc["pattern"].as<String>();
        textSpeed = doc["speed"].as<int>();
        intensity = doc["intensity"].as<int>();
        long colorVal = strtol(doc["color"].as<String>().substring(1).c_str(), NULL, 16);
        patternColor = CRGB(colorVal >> 16, (colorVal >> 8) & 0xFF, colorVal & 0xFF);
        request->send(200, "text/plain", "OK");
    });
    
    ElegantOTA.begin(&server);
    server.begin();
    Serial.println("HTTP Server Started");
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
    delay(5);
}

