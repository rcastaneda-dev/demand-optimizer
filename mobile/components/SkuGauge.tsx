import { useEffect, useRef } from "react";
import { Platform, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import type { InventoryItem } from "@/lib/types";
import i18n from "@/lib/i18n";

interface Props {
  item: InventoryItem;
}

function getBarColor(pct: number): string {
  if (pct >= 85) return "#EB5757";
  if (pct >= 70) return "#F2994A";
  return "#27AE60";
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
      <View style={{ height: 12, borderRadius: 6, backgroundColor: "#E5E7EB", overflow: "hidden" }}>
        <View
          style={{
            height: "100%",
            borderRadius: 6,
            backgroundColor: getBarColor(pct),
            width: `${Math.min(pct, 100)}%`,
          }}
        />
        {/* 90% cap marker */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: "90%",
            height: "100%",
            width: 2,
            backgroundColor: "#4B5563",
          }}
        />
      </View>

      {/* Detail text */}
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-gray-400">
          {i18n.t("common.allocated", { allocated: item.allocated, total: item.total_stock_available })}
        </Text>
        <Text className="text-xs text-gray-400">
          {i18n.t("common.remaining", { count: item.remaining })}
        </Text>
      </View>
    </View>
  );
}
