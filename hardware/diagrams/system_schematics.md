# AQUORA System Architecture & Schematics Diagrams

## High-Level Distributed Architecture
```mermaid
graph TD
    subgraph SYSTEM 1: PAYMENT TERMINAL (AQ-PT-001)
        UI[Elecrow 7.0 Inch 800x480 HMI]
        ESP32S3[ESP32-S3 Core Controller]
        TOUCH[GT911 Capacitive Touch]
        PRINTER[ESC/POS Thermal Receipt Printer]
        UI --- ESP32S3
        TOUCH --- ESP32S3
        PRINTER --- ESP32S3
    end

    subgraph CLOUD / SERVER INFRASTRUCTURE
        GW[Razorpay / UPI Payment Gateway]
        BACKEND[Aquora Authoritative Backend]
        DB[(Supabase PostgreSQL Database)]
        WS[Realtime WebSocket Engine]
        GW -->|POST Webhook with HMAC| BACKEND
        BACKEND <--> DB
        BACKEND <--> WS
    end

    subgraph SYSTEM 2: SANITIZER DISPENSING MACHINE (AQ-DM-001)
        ESP32[ESP32 Safety Controller]
        ESTOP[Hardware E-Stop Push Button]
        MOSFETS[5x N-Channel Logic MOSFETs]
        PUMPS[5x 12V DC Dispensing Pumps]
        FLOWSENSORS[5x Turbine Flow Sensors]
        NOZZLES[5x Anti-Drip Spray Nozzles]

        ESP32 -->|Interlock Gating| MOSFETS
        MOSFETS --> PUMPS
        PUMPS --> FLOWSENSORS
        FLOWSENSORS -->|Pulse Counting ISR| ESP32
        FLOWSENSORS --> NOZZLES
        ESTOP -->|Hardware Cut & Signal| ESP32
    end

    ESP32S3 -->|1. Create Order & Fetch QR| BACKEND
    WS -->|3. Live Sensor Progress| ESP32S3
    BACKEND -->|2. Authorize Signed Job| ESP32
    ESP32 -->|4. Completion Telemetry| BACKEND
```

## Physical Fluid Channel Schematic (Section 27)
```mermaid
flowchart LR
    subgraph CHANNEL 1
        T1[(Tank 1: Classic)] --> P1[Pump 1] --> F1[Flow Sensor 1] --> N1[Nozzle 1]
    end
    subgraph CHANNEL 2
        T2[(Tank 2: Aloe Vera)] --> P2[Pump 2] --> F2[Flow Sensor 2] --> N2[Nozzle 2]
    end
    subgraph CHANNEL 3
        T3[(Tank 3: Herbal)] --> P3[Pump 3] --> F3[Flow Sensor 3] --> N3[Nozzle 3]
    end
    subgraph CHANNEL 4
        T4[(Tank 4: Premium)] --> P4[Pump 4] --> F4[Flow Sensor 4] --> N4[Nozzle 4]
    end
    subgraph CHANNEL 5
        T5[(Tank 5: Family)] --> P5[Pump 5] --> F5[Flow Sensor 5] --> N5[Nozzle 5]
    end
```
