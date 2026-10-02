#ifndef LVGL_MANAGER_H
#define LVGL_MANAGER_H

#include <Arduino.h>
#include <lvgl.h>

class LvglManager {
public:
    static bool init();
    static void update();

private:
    static lv_disp_draw_buf_t drawBuf;
    static lv_color_t* buf1;
    static lv_color_t* buf2;
    static lv_disp_drv_t dispDrv;
    static lv_indev_drv_t indevDrv;

    static void dispFlushCallback(lv_disp_drv_t* drv, const lv_area_t* area, lv_color_t* color_p);
    static void touchReadCallback(lv_indev_drv_t* drv, lv_indev_data_t* data);
};

#endif // LVGL_MANAGER_H
