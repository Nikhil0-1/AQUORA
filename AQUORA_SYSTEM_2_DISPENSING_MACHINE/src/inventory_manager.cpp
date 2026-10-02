#include "inventory_manager.h"
#include "logger.h"

static const char* TAG = "Inventory";

TankInventory InventoryManager::tanks[5];

void InventoryManager::init() {
    for (int i = 0; i < 5; i++) {
        tanks[i].channel = i + 1;
        tanks[i].estimatedVolumeMl = 4500.0f; // 4.5L default remaining
        tanks[i].maxCapacityMl = 5000.0f;
        tanks[i].lowThresholdMl = 1000.0f;
        tanks[i].isLow = false;
        tanks[i].isOutOfStock = false;
    }
    Logger::info(TAG, "Inventory initialized (Estimated remaining tracked across 5 tanks)");
}

void InventoryManager::deductVolume(int channel, float dispensedMl) {
    if (channel < 1 || channel > 5) return;
    int idx = channel - 1;
    tanks[idx].estimatedVolumeMl -= dispensedMl;
    if (tanks[idx].estimatedVolumeMl < 0.0f) tanks[idx].estimatedVolumeMl = 0.0f;

    tanks[idx].isLow = (tanks[idx].estimatedVolumeMl <= tanks[idx].lowThresholdMl);
    tanks[idx].isOutOfStock = (tanks[idx].estimatedVolumeMl < 50.0f);

    Logger::info(TAG, "Channel %d inventory updated: %.1f ml remaining (ESTIMATED)",
        channel, tanks[idx].estimatedVolumeMl);
}

bool InventoryManager::hasSufficientVolume(int channel, float targetMl) {
    if (channel < 1 || channel > 5) return false;
    return (tanks[channel - 1].estimatedVolumeMl >= targetMl);
}

const TankInventory& InventoryManager::getTank(int channel) {
    if (channel >= 1 && channel <= 5) return tanks[channel - 1];
    return tanks[0];
}
