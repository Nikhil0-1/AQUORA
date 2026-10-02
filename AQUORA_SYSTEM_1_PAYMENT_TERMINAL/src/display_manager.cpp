#include "display_manager.h"
#include "../include/pins.h"
#include "../include/board_config.h"
#include "logger.h"

static const char* TAG = "DisplayMgr";

esp_lcd_panel_handle_t DisplayManager::panelHandle = NULL;
uint16_t* DisplayManager::frameBuffer = NULL;

bool DisplayManager::init() {
    Logger::info(TAG, "Initializing 800x480 RGB LCD Interface on ESP32-S3");

    // 1. Backlight PWM Initialization
    ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(LCD_PIN_BK_LIGHT, PWM_CHANNEL);
    setBrightness(85); // 85% default brightness

    // 2. Configure 16-Bit RGB Panel
    esp_lcd_rgb_panel_config_t panel_config;
    memset(&panel_config, 0, sizeof(panel_config));

    panel_config.data_width = 16;
    panel_config.psram_trans_align = 64;
    panel_config.clk_src = LCD_CLK_SRC_PLL160M;
    panel_config.disp_gpio_num = GPIO_NUM_NC;
    panel_config.pclk_gpio_num = (gpio_num_t)LCD_PIN_PCLK;
    panel_config.vsync_gpio_num = (gpio_num_t)LCD_PIN_VSYNC;
    panel_config.hsync_gpio_num = (gpio_num_t)LCD_PIN_HSYNC;
    panel_config.de_gpio_num = (gpio_num_t)LCD_PIN_DE;

    // 16-bit RGB565 pin mapping
    panel_config.data_gpio_nums[0] = (gpio_num_t)LCD_PIN_DATA_B0;
    panel_config.data_gpio_nums[1] = (gpio_num_t)LCD_PIN_DATA_B1;
    panel_config.data_gpio_nums[2] = (gpio_num_t)LCD_PIN_DATA_B2;
    panel_config.data_gpio_nums[3] = (gpio_num_t)LCD_PIN_DATA_B3;
    panel_config.data_gpio_nums[4] = (gpio_num_t)LCD_PIN_DATA_B4;
    panel_config.data_gpio_nums[5] = (gpio_num_t)LCD_PIN_DATA_G0;
    panel_config.data_gpio_nums[6] = (gpio_num_t)LCD_PIN_DATA_G1;
    panel_config.data_gpio_nums[7] = (gpio_num_t)LCD_PIN_DATA_G2;
    panel_config.data_gpio_nums[8] = (gpio_num_t)LCD_PIN_DATA_G3;
    panel_config.data_gpio_nums[9] = (gpio_num_t)LCD_PIN_DATA_G4;
    panel_config.data_gpio_nums[10] = (gpio_num_t)LCD_PIN_DATA_G5;
    panel_config.data_gpio_nums[11] = (gpio_num_t)LCD_PIN_DATA_R0;
    panel_config.data_gpio_nums[12] = (gpio_num_t)LCD_PIN_DATA_R1;
    panel_config.data_gpio_nums[13] = (gpio_num_t)LCD_PIN_DATA_R2;
    panel_config.data_gpio_nums[14] = (gpio_num_t)LCD_PIN_DATA_R3;
    panel_config.data_gpio_nums[15] = (gpio_num_t)LCD_PIN_DATA_R4;

    panel_config.timings.pclk_hz = LCD_PIXEL_CLOCK_HZ;
    panel_config.timings.h_res = LCD_H_RES;
    panel_config.timings.v_res = LCD_V_RES;
    panel_config.timings.hsync_pulse_width = LCD_HSYNC_PULSE_WIDTH;
    panel_config.timings.hsync_back_porch = LCD_HSYNC_BACK_PORCH;
    panel_config.timings.hsync_front_porch = LCD_HSYNC_FRONT_PORCH;
    panel_config.timings.vsync_pulse_width = LCD_VSYNC_PULSE_WIDTH;
    panel_config.timings.vsync_back_porch = LCD_VSYNC_BACK_PORCH;
    panel_config.timings.vsync_front_porch = LCD_VSYNC_FRONT_PORCH;
    panel_config.timings.flags.pclk_active_neg = true;

    panel_config.flags.fb_in_psram = 1;

    esp_err_t err = esp_lcd_new_rgb_panel(&panel_config, &panelHandle);
    if (err != ESP_OK) {
        Logger::error(TAG, "Failed to create RGB LCD panel: 0x%x", err);
        return false;
    }

    err = esp_lcd_panel_reset(panelHandle);
    if (err != ESP_OK) {
        Logger::error(TAG, "Failed to reset LCD panel: 0x%x", err);
        return false;
    }

    err = esp_lcd_panel_init(panelHandle);
    if (err != ESP_OK) {
        Logger::error(TAG, "Failed to init LCD panel: 0x%x", err);
        return false;
    }

    Logger::info(TAG, "RGB LCD panel initialized successfully (800x480)");
    return true;
}

void DisplayManager::setBrightness(uint8_t percentage) {
    if (percentage > 100) percentage = 100;
    uint32_t duty = (percentage * 255) / 100;
    ledcWrite(PWM_CHANNEL, duty);
}

esp_lcd_panel_handle_t DisplayManager::getPanelHandle() {
    return panelHandle;
}

uint16_t* DisplayManager::getFrameBuffer() {
    return frameBuffer;
}
