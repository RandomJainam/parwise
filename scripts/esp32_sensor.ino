/**
 * Smart Parking – ESP32 Firmware
 * ─────────────────────────────────────────────────────────────────────────────
 * This firmware reads HC-SR04 ultrasonic sensor and sends occupancy data to
 * Firebase Realtime Database. The web app reads this data for lot1 → slot A1.
 *
 * Firebase RTDB path written by this device:
 *   /parking/slot1/status    → "OCCUPIED" | "FREE"
 *   /parking/slot1/distance  → float (cm)
 *
 * In the web app:
 *   lot1 (Central Mall Parking) → slot A1 = this sensor's live data
 *   All other slots in lot1     = simulated
 *   All other 99 lots           = fully simulated
 *
 * To add more slots later:
 *   Wire another HC-SR04, add a second block at bottom of loop()
 *   writing to /parking/slot2/... → maps to A2 in the web app
 *
 * Hardware:
 *   ESP32 DevKit v1
 *   HC-SR04: TRIG → GPIO4, ECHO → GPIO18, LED → GPIO19
 *
 * Libraries (install via Arduino Library Manager):
 *   - Firebase ESP Client by mobizt
 *   - ArduinoJson
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ── Pin config ────────────────────────────────────────────────────────────────
#define TRIG_PIN  4
#define ECHO_PIN  18
#define LED_PIN   19

// ── WiFi ──────────────────────────────────────────────────────────────────────
#define WIFI_SSID     "Motog54"
#define WIFI_PASSWORD "12345678"

// ── Firebase ──────────────────────────────────────────────────────────────────
#define DATABASE_URL "spark-6a409-default-rtdb.asia-southeast1.firebasedatabase.app"
#define API_KEY      "AIzaSyB_OtU4E0giWeR-BND3QjbaBD8HJVVeYrY"

// ── RTDB path for this sensor ─────────────────────────────────────────────────
// slot1 → maps to slot "A1" in the web app for lot "lot1"
#define SLOT_PATH "/parking/slot1"

// ── Detection threshold ───────────────────────────────────────────────────────
// Car detected if object is closer than this (cm)
#define OCCUPIED_THRESHOLD_CM 15.0

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ── Distance measurement (averaged over 10 readings) ─────────────────────────
float getDistance() {
  float sum = 0; int valid = 0;
  for (int i = 0; i < 10; i++) {
    digitalWrite(TRIG_PIN, LOW);  delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    noInterrupts();
    long dur = pulseIn(ECHO_PIN, HIGH, 25000);
    interrupts();
    if (dur == 0) { delay(30); continue; }
    float d = (dur * 0.034) / 2.0;
    if (d >= 2 && d <= 400) { sum += d; valid++; }
    delay(30);
  }
  return valid > 0 ? sum / valid : -1;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN,  OUTPUT);

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { Serial.print("."); delay(500); }
  Serial.println("\n✅ WiFi: " + WiFi.localIP().toString());

  // Init Firebase
  config.api_key            = API_KEY;
  config.database_url       = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;
  config.signer.test_mode   = true;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("✅ Firebase ready");
  Serial.println("📡 Writing to: " + String(SLOT_PATH));
  Serial.println("🗺  Web app: lot1 → Slot A1");
}

bool lastOccupied = false;

void loop() {
  float dist = getDistance();

  if (dist < 0) {
    Serial.println("⚠️  Sensor error — check wiring");
    digitalWrite(LED_PIN, LOW);
    delay(3000);
    return;
  }

  bool occupied = dist < OCCUPIED_THRESHOLD_CM;
  String status = occupied ? "OCCUPIED" : "FREE";

  Serial.printf("📏 %.1f cm → %s\n", dist, status.c_str());
  digitalWrite(LED_PIN, occupied ? HIGH : LOW);

  // Send to Firebase when state changes OR every 30s as heartbeat
  static unsigned long lastSent = 0;
  bool stateChanged = (occupied != lastOccupied);
  bool heartbeat    = (millis() - lastSent > 30000);

  if (Firebase.ready() && (stateChanged || heartbeat)) {
    bool ok1 = Firebase.RTDB.setString(&fbdo, String(SLOT_PATH) + "/status",   status);
    bool ok2 = Firebase.RTDB.setFloat (&fbdo, String(SLOT_PATH) + "/distance", dist);

    if (ok1 && ok2) {
      Serial.printf("✅ Firebase updated → %s (%.1f cm)\n", status.c_str(), dist);
    } else {
      Serial.println("❌ Firebase error: " + fbdo.errorReason());
    }

    lastOccupied = occupied;
    lastSent     = millis();
  }

  delay(3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// TO ADD A SECOND SLOT (A2):
// 1. Wire another HC-SR04: TRIG → GPIO5, ECHO → GPIO17
// 2. Add at top:  #define TRIG2 5 / #define ECHO2 17
// 3. In loop(), repeat the same block but write to:
//      /parking/slot2/status   → maps to A2 in the web app
//      /parking/slot2/distance
// 4. In useFirestore.ts, add:  slot2: "A2"  to ESP32_SLOT_MAP
// ─────────────────────────────────────────────────────────────────────────────
