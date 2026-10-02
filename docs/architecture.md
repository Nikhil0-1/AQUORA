# AQUORA Platform Architecture

```
                         AQUORA
                           │
                    TOUCHSCREEN KIOSK (800×480)
                           │
                    CUSTOMER WEB APP
                           │
                           ▼
                    CLOUD BACKEND (Express / Supabase)
                           │
                  PAYMENT GATEWAY (Razorpay / UPI)
                           │
                  VERIFIED PAYMENT
                           │
                    DISPENSING JOB
                           │
                         Wi-Fi / HTTP
                           │
                           ▼
                     ESP32 CONTROLLER
                           │
              ┌────────────┼────────────┐
              │            │            │
           PUMPS       FLOW SENSORS   SAFETY (E-Stop)
              │            │
       ┌──────┼──────┐     │
      P1     P2     P3    F1..F5
       │      │      │
      T1     T2     T3
```

## System Components

1. **Touchscreen Kiosk (800×480 Landscape)**: Dedicated landscape touch UI featuring large touch targets, aqua liquid particle background, 5 product cards, quantity selector, order summary, and real-time sensor progress telemetry.
2. **Backend Engine**: Handles product catalog, Razorpay payment verification, HMAC signatures, duplicate payment prevention (idempotency), single-pump job creation, machine telemetry, and calibration updates.
3. **Machine Simulator**: Browser-based ESP32 emulator running the exact HTTP machine protocol with interactive pump relays, flow sensor pulse generation, and emergency stop simulation.
4. **ESP32 Controller Firmware**: C++ PlatformIO firmware managing 5 independent channels (Tank N → Pump N → Sensor N → Nozzle N) with ISR pulse counting, flow timeout safety, and duplicate job rejection.
