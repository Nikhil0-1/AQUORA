#ifndef INVENTORY_MANAGER_H
#define INVENTORY_MANAGER_H

#include <Arduino.h>

struct TankInventory {
    int channel;
    float estimatedVolumeMl;
    float maxCapacityMl;
    float lowThresholdMl;
    bool isLow;
    bool isOutOfStock;
};

class InventoryManager {
public:
    static void init();
    static void deductVolume(int channel, float dispensedMl);
    static bool hasSufficientVolume(int channel, float targetMl);
    static const TankInventory& getTank(int channel);

private:
    static TankInventory tanks[5];
};

#endif // INVENTORY_MANAGER_H
