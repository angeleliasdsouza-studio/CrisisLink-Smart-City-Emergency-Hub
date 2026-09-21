#include <Wire.h>
#include <DHT.h>

#define DHTPIN        2      
#define DHTTYPE       DHT11  
#define RED_LED_PIN   8      
#define GREEN_LED_PIN 9      
#define BUZZER_PIN    10     

const float TEMP_THRESHOLD_C   = 38.0; 
const float VIBRATION_THRESHOLD = 4500.0;

DHT dht(DHTPIN, DHTTYPE);

const int MPU_ADDR = 0x68;
int16_t AcX, AcY, AcZ;
float base_x = 0, base_y = 0, base_z = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Default state
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  noTone(BUZZER_PIN);

  dht.begin();

  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); 
  Wire.write(0);    
  Wire.endTransmission(true);

  readMPU();
  base_x = AcX;
  base_y = AcY;
  base_z = AcZ;
}

void readMPU() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); 
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true); 
  
  AcX = Wire.read() << 8 | Wire.read(); 
  AcY = Wire.read() << 8 | Wire.read(); 
  AcZ = Wire.read() << 8 | Wire.read(); 
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  readMPU();

  long dx = AcX - base_x;
  long dy = AcY - base_y;
  long dz = AcZ - base_z;
  
  float dynamic_vibration = sqrt(dx * dx + dy * dy + dz * dz);

  // Baseline tracking
  base_x = (base_x * 0.85) + (AcX * 0.15);
  base_y = (base_y * 0.85) + (AcY * 0.15);
  base_z = (base_z * 0.85) + (AcZ * 0.15);

  bool isTempEmergency = (!isnan(t) && t >= TEMP_THRESHOLD_C);
  bool isVibeEmergency = (dynamic_vibration >= VIBRATION_THRESHOLD);
  bool isEmergency     = isTempEmergency || isVibeEmergency;

  if (isEmergency) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, LOW);
    tone(BUZZER_PIN, 1000); // Send 1kHz PWM tone for loud passive buzzer sound
  } else {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, HIGH);
    noTone(BUZZER_PIN);     // Turn off sound
  }

  Serial.print("TEMP:");
  if (isnan(t)) Serial.print("ERR"); else Serial.print(t, 1);
  
  Serial.print("|HUMIDITY:");
  if (isnan(h)) Serial.print("ERR"); else Serial.print((int)h);

  Serial.print("|VIBRATION:");
  Serial.print(isVibeEmergency ? "HIGH" : "LOW");

  Serial.print("|STATUS:");
  Serial.println(isEmergency ? "EMERGENCY" : "NORMAL");

  delay(500);
}