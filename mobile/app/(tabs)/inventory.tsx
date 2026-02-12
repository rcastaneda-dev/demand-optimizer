import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import SkuGauge from "@/components/SkuGauge";

export default function InventoryScreen() {
  const { inventory, lastResult, fetchInventory } = useApp();
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
              BOTTLENECK
            </Text>
            <Text className="text-sm font-medium text-gray-800">
              Missing {topShortage.deficit} units of{" "}
              <Text className="font-bold">{topShortage.sku_id}</Text> to unlock{" "}
              <Text className="font-bold">{topShortage.school_id}</Text>
            </Text>
          </View>
        )}

        {/* 90% cap legend */}
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-3 w-0.5 bg-gray-600" />
          <Text className="text-xs text-gray-400">90% safety cap</Text>
        </View>

        {/* SKU gauges */}
        {sortedInventory.map((item) => (
          <SkuGauge key={item.sku_id} item={item} />
        ))}

        {sortedInventory.length === 0 && (
          <View className="items-center p-8">
            <Text className="text-sm text-gray-400">
              No inventory data loaded
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
