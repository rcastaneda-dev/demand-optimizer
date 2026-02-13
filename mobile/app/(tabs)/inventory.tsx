import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import i18n from "@/lib/i18n";
import SkuGauge from "@/components/SkuGauge";

export default function InventoryScreen() {
  const { inventory, lastResult, locale, fetchInventory } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  }, [fetchInventory]);

  const sortedInventory = useMemo(
    () => [...inventory].sort((a, b) => b.usage_pct - a.usage_pct),
    [inventory]
  );

  const topShortage = lastResult?.shortages?.[0] ?? null;

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5BFF" />
        }
      >
        {/* Bottleneck insight card */}
        {topShortage && (
          <View className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-4">
            <Text className="mb-1 text-xs font-semibold text-warning">
              {i18n.t("inventory.bottleneck")}
            </Text>
            <Text className="text-sm font-medium text-gray-800">
              {i18n.t("inventory.missingUnits", {
                deficit: topShortage.deficit,
                sku: topShortage.sku_id,
                school: topShortage.school_id,
              })}
            </Text>
          </View>
        )}

        {/* 90% cap legend */}
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-3 w-0.5 bg-gray-600" />
          <Text className="text-xs text-gray-400">{i18n.t("inventory.safetyCap")}</Text>
        </View>

        {/* SKU gauges */}
        {sortedInventory.map((item) => (
          <SkuGauge key={item.sku_id} item={item} />
        ))}

        {sortedInventory.length === 0 && (
          <View className="items-center p-8">
            <Text className="text-sm text-gray-400">
              {i18n.t("inventory.noInventory")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
