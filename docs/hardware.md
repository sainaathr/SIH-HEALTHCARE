# VitalGuard Hardware Specification

## ESP32 Wearable Node Design

### Microcontroller
**Espressif ESP32-WROOM-32E**
- Dual-core Xtensa LX6 @ 240 MHz
- 520 KB SRAM, 4MB Flash
- IEEE 802.11 b/g/n Wi-Fi, Bluetooth 4.2
- Operating voltage: 3.3V

---

## Attached Sensors

### 1. MAX30102 — Optical PPG (HR + SpO2)
- **Communication:** I2C (address: 0x57)
- **Sample rate:** 200 Hz configurable
- **Heart rate:** 0–254 BPM (±5% error)
- **SpO2:** 70–100% (±2% error)
- **Placement:** Fingertip or wrist strap
- **Power:** 1.8V VLED, active: 600µA

### 2. MPU6050 — 6-Axis IMU (Fall Detection)
- **Communication:** I2C (address: 0x68 / 0x69)
- **Accelerometer range:** ±2g / ±4g / ±8g / ±16g
- **Gyroscope range:** ±250 / ±500 / ±1000 / ±2000 °/sec
- **Fall detection algorithm:** g-force spike >2.5g → orientation change → horizontal (±30° of floor plane) within 500ms window
- **Anti-false-positive:** Requires sustained horizontal position >200ms after impact

### 3. DS18B20 — Digital Temperature Sensor
- **Communication:** One-Wire protocol (GPIO)
- **Resolution:** 9–12 bit (configurable)
- **Accuracy:** ±0.5°C (−10°C to +85°C)
- **Sample rate:** 1 reading/second

### 4. NEO-6M — GPS Module
- **Communication:** UART (9600 baud)
- **Position accuracy:** 2.5m CEP
- **Time to first fix:** 27s cold start, 1s hot start
- **Update rate:** 1 Hz (configurable to 5 Hz)
- **Power:** 45mA tracking

---

## Data Transmission

### Protocol: HTTP REST (MQTT planned for production)
- Telemetry POST to `/api/ingest` every 3 seconds
- JSON payload format:

```json
{
  "device_id": "ESP32-WROOM-001",
  "patient_id": 1,
  "timestamp": "2024-11-01T14:23:45Z",
  "heart_rate": 82,
  "spo2": 97.4,
  "temperature": 37.1,
  "respiration_rate": 16,
  "acceleration": 1.02,
  "orientation": "UPRIGHT",
  "activity_state": "WALKING",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "speed": 0.8,
  "battery": 87.5
}
```

---

## Power Architecture

- **Primary:** 3.7V 2000mAh LiPo battery
- **Charging:** USB-C via TP4056 charge module
- **Expected runtime:** ~18–24 hours continuous monitoring
- **Low battery alert:** Software triggers at <15%

---

## Bill of Materials (BOM)

| Component | Unit Cost (INR) |
|-----------|-----------------|
| ESP32-WROOM-32E | ₹350 |
| MAX30102 PPG Module | ₹200 |
| MPU6050 IMU Module | ₹80 |
| DS18B20 Temperature | ₹40 |
| NEO-6M GPS Module | ₹350 |
| LiPo 2000mAh | ₹250 |
| TP4056 Charger | ₹50 |
| Wrist Strap + PCB Case | ₹180 |
| **Total per unit** | **≈ ₹1,500** |

---

## Roadmap: Production Sensors

| Sensor | Upgrade | Benefit |
|--------|---------|---------|
| AD8232 | Single-lead ECG | Arrhythmia, AFib, QT interval |
| SIM7600 | 5G NB-IoT | Cellular connectivity outside Wi-Fi |
| Blood Pressure Cuff | Non-invasive BP | Systolic / diastolic tracking |
| TF Luna | ToF Lidar | Bed exit / fall prediction |
