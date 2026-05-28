# POV-Line ESP32 (Custom Hardware Configuration)

## Your Hardware Configuration
- **MCU**: ESP32
- **LEDs**: 88 WS2812B LEDs total (2 arms, 44 LEDs per arm)
- **Sensor**: Hall Effect Sensor
- **Pines**:
  - Arm A LEDs (Pin 23)
  - Arm B LEDs (Pin 18)
  - Hall Sensor (Pin 4)

## Setup instructions
1. Install [PlatformIO](https://platformio.org/).
2. Open this `/firmware` directory in VS Code with the PlatformIO extension.
3. Modify `platformio.ini` if specific pin adjustments are needed.
4. Run `pio run --target upload` to build and upload.

## Note
This is a custom configuration based on your provided hardware setup.
