# ⚙️ AQUORA SYSTEM 2 (DISPENSING MACHINE) — USER CONFIGURATION GUIDE

This document lists **every parameter** in the firmware, categorized strictly into:
1. **MUST EDIT** (Required before flashing for your local network)
2. **OPTIONAL** (Tune according to your physical hardware setup)
3. **DO NOT EDIT** (Core safety, protocol, and architectural logic)

---

## 🔴 1. MUST EDIT (Before First Upload)

File to edit: [`secrets.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/secrets.h)

| Macro Name | Default Value | Description / What to Enter |
|---|---|---|
| `AQUORA_WIFI_SSID` | `"Aquora-WiFi"` | The exact SSID (Name) of your 2.4GHz Wi-Fi network. |
| `AQUORA_WIFI_PASSWORD` | `"AquoraPass123"` | The password for your 2.4GHz Wi-Fi network. |
| `AQUORA_MACHINE_SECRET` | `"aquora_machine_secret_key_demo_change_in_prod"` | The HMAC pre-shared key matching your backend database `machine_credentials`. |

File to edit: [`config.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/config.h)

| Macro Name | Default Value | Description / What to Enter |
|---|---|---|
| `AQUORA_API_URL` | `"http://192.168.1.100:3001"` | The IP address or domain name of your running AQUORA backend server. |

---

## 🟡 2. OPTIONAL (Hardware Tuning & Field Calibration)

File to edit: [`config.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/config.h)

| Macro Name | Default Value | Description / When to Edit |
|---|---|---|
| `DEFAULT_PULSES_PER_ML_CH1` | `0.450f` | Flow calibration factor for Channel 1 (Thin liquid sanitizer). Adjust after graduated cylinder calibration test. |
| `DEFAULT_PULSES_PER_ML_CH2` | `0.380f` | Flow calibration factor for Channel 2 (Aloe Vera viscous gel). |
| `DEFAULT_PULSES_PER_ML_CH3` | `0.450f` | Flow calibration factor for Channel 3 (Herbal Neem). |
| `DEFAULT_PULSES_PER_ML_CH4` | `0.420f` | Flow calibration factor for Channel 4 (Premium Moisturizing). |
| `DEFAULT_PULSES_PER_ML_CH5` | `0.450f` | Flow calibration factor for Channel 5 (Family Antimicrobial). |

File to edit: [`pins.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/pins.h)

| Macro Name | Default Value | Description / When to Edit |
|---|---|---|
| `PUMP_1_PIN` – `PUMP_5_PIN` | `25, 26, 27, 14, 12` | Pump driver MOSFET gate pins. Only change if custom PCB routes differently. |
| `FLOW_1_PIN` – `FLOW_5_PIN` | `34, 35, 32, 33, 39` | Flow sensor pulse interrupt pins. (Note: GPIO 34, 35, 39 are input-only). |
| `EMERGENCY_STOP_PIN` | `36` | Active LOW hardware emergency stop button input pin. |

---

## 🟢 3. DO NOT EDIT (Safety & Machine Protocol Enforcements)

File: [`include/safety_limits.h`](file:///c:/Users/DELL/Desktop/client%20hardware/AQUORA_SYSTEM_2_DISPENSING_MACHINE/include/safety_limits.h)

- `MAX_ACTIVE_PUMPS (1)`: Enforces single-pump interlock. Never increase to $> 1$ to prevent brownout and fluid backflow.
- `FLOW_START_TIMEOUT_MS (3000)`: 3-second dry-run cutoff if flow sensor fails to spin.
- `MAX_DISPENSE_TIME_MS (45000)`: 45-second hard safety timeout for all pump operations.
- `AQUORA_PROTOCOL_VERSION (1)`: Protocol handshake version with backend.
