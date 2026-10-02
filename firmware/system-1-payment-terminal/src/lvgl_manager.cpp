#include "lvgl_manager.h"
#include "display_manager.h"
#include "touch_manager.h"
#include "../include/board_config.h"
#include "logger.h"

static const char* TAG = "LvglMgr";

lv_disp_draw_buf_t LvglManager::drawBuf;
lv_color_t* LvglManager::buf1 = NULL;
lv_color_t* LvglManager::buf2 = NULL;
lv_disp_drv_t LvglManager::dispDrv;
lv_indev_drv_t LvglManager::indevDrv;

void LvglManager::dispFlushCallback(lv_disp_drv_t* drv, const lv_area_t* area, lv_color_t* color_p) {
    esp_lcd_panel_handle_t panel = DisplayManager::getPanelHandle();
    if (panel) {
        int offsetx1 = area->x1;
        int offsetx2 = area->x2;
        int offsety1 = area->y1;
        int offsety2 = area->y2;
        esp_lcd_panel_draw_bitmap(panel, offsetx1, offsety1, offsetx2 + 1, offsety2 + 1, color_p);
    }
    lv_disp_flush_ready(drv);
}

void LvglManager::touchReadCallback(lv_indev_drv_t* drv, lv_indev_data_t* data) {
    int16_t touchX = 0;
    int16_t touchY = 0;
    bool touched = TouchManager::readTouch(&touchX, &touchY);

    if (touched) {
        data->state = LV_INDEV_STATE_PR;
        data->point.x = touchX;
        data->point.y = touchY;
    } else {
        data->state = LV_INDEV_STATE_REL;
    }
}

bool LvglManager::init() {
    Logger::info(TAG, "Initializing LVGL core v%d.%d.%d",
        lv_version_major(), lv_version_minor(), lv_version_patch());

    lv_init();

    // Allocate draw buffers in PSRAM
    buf1 = (lv_color_t*)heap_caps_malloc(LVGL_BUFFER_SIZE * sizeof(lv_color_t), MALLOC_CAP_SPIRAM);
    buf2 = (lv_color_t*)heap_caps_malloc(LVGL_BUFFER_SIZE * sizeof(lv_color_t), MALLOC_CAP_SPIRAM);

    if (!buf1 || !buf2) {
        Logger::error(TAG, "Failed to allocate PSRAM draw buffers for LVGL");
        return false;
    }

    lv_disp_draw_buf_init(&drawBuf, buf1, buf2, LVGL_BUFFER_SIZE);

    // Register Display Driver
    lv_disp_drv_init(&dispDrv);
    dispDrv.hor_res = LCD_H_RES;
    dispDrv.ver_res = LCD_V_RES;
    dispDrv.flush_cb = dispFlushCallback;
    dispDrv.draw_buf = &drawBuf;
    lv_disp_drv_register(&dispDrv);

    // Register Input Touch Driver
    lv_indev_drv_init(&indevDrv);
    indevDrv.type = LV_INDEV_TYPE_POINTER;
    indevDrv.read_cb = touchReadCallback;
    lv_indev_drv_register(&indevDrv);

    Logger::info(TAG, "LVGL display and touch drivers registered (800x480)");
    return true;
}

void LvglManager::update() {
    lv_timer_handler();
}
