import { useEffect, useRef } from "react";
import { Platform, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import type { InventoryItem } from "@/lib/types";

interface Props {
  item: InventoryItem;
}

function getBarColor(pct: number): string {
  if (pct >= 85) return "bg-error";
  if (pct >= 70) return "bg-warning";
  return "bg-success";
}

function getTextColor(pct: number): string {
  if (pct >= 85) return "text-error";
  if (pct >= 70) return "text-warning";
  return "text-success";
}

export default function SkuGauge({ item }: Props) {
  const pct = Math.round(item.usage_pct * 100);
  const prevPct = useRef(pct);

  useEffect(() => {
    // Trigger haptic when usage crosses the 90% safety cap
    if (Platform.OS !== "web" && prevPct.current < 90 && pct >= 90) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    prevPct.current = pct;
  }, [pct]);

  return (
    <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      {/* Header row */}
      <View className="mb-1 flex-row items-baseline justify-between">
        <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
          {item.sku_id}
        </Text>
        <Text className={`text-sm font-semibold ${getTextColor(pct)}`}>
          {pct}%
        </Text>
      </View>

      {item.description ? (
        <Text className="mb-2 text-xs text-gray-400" numberOfLines={1}>
          {item.description}
        </Text>
      ) : null}

      {/* Gauge bar with 90% cap marker */}
      <View className="h-3 overflow-hidden rounded-full bg-gray-200">
        <View
          className={`h-full rounded-full ${getBarColor(pct)}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
        {/* 90% cap marker */}
        <View
          className="absolute top-0 h-full w-0.5 bg-gray-600"
          style={{ left: "90%" }}
        />
      </View>

      {/* Detail text */}
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-gray-400">
          {item.allocated} / {item.total_stock_available} allocated
        </Text>
        <Text className="text-xs text-gray-400">
          {item.remaining} remaining
        </Text>
      </View>
    </View>
  );
}
