# ESP32 Firmware Guide

## Location
- Production Firmware Source: `/firmware/esp32-aquora/`
- Synced Firmware Mirror: `/firmware/esp32-vending-controller/`

## Compilation & Flashing with PlatformIO

```bash
cd firmware/esp32-aquora
pio run              # Compile firmware
pio run --target upload # Flash to connected ESP32 over USB
pio device monitor   # Open 115200 serial monitor
```

## Modular Source Architecture
- `include/config.h`: Pin mappings, safety timeouts, API endpoints.
- `src/main.cpp`: Main setup and execution loop.
- `src/logger.*`: Thread-safe serial logger.
- `src/machine_state.*`: Deterministic state transitions.
- `src/storage_manager.*`: NVS preferences for calibration factors & duplicate job ID buffer.
- `src/calibration.*`: Channel calibration manager.
- `src/flow_sensor.*`: ISR pulse counters for 5 independent sensors.
- `src/pump_controller.*`: Interlocked single-pump driver.
- `src/safety_manager.*`: Emergency stop ISR and flow timeout supervisor.
- `src/job_manager.*`: Job validation.
- `src/wifi_manager.*`: Non-blocking Wi-Fi reconnect loop.
- `src/api_client.*`: HTTP Client for backend machine API.
- `src/telemetry.*`: JSON telemetry serializer.
