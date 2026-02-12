import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { School } from "@/lib/types";

interface Props {
  school: School;
  isSelected: boolean;
  shortageCount: number;
}

export default function SchoolCard({ school, isSelected, shortageCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const skuEntries = Object.entries(school.sku_demand);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      className="mb-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-90"
    >
      <View className="flex-row items-center">
        {/* Left: school info */}
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">
            {school.school_id}
          </Text>
          <Text className="text-sm text-gray-500">
            {school.total_students} students
          </Text>
        </View>

        {/* Center: kit readiness bar */}
        <View className="mx-3 flex-1">
          <View className="h-2 overflow-hidden rounded-full bg-gray-200">
            <View
              className={`h-full rounded-full ${isSelected ? "bg-success" : "bg-error"}`}
              style={{ width: isSelected ? "100%" : "0%" }}
            />
          </View>
          <Text className="mt-1 text-center text-xs text-gray-400">
            {isSelected ? "100%" : "Incomplete"}
          </Text>
        </View>

        {/* Right: badge */}
        <View
          className={`rounded-full px-3 py-1 ${isSelected ? "bg-success/15" : "bg-error/15"}`}
        >
          <Text
            className={`text-xs font-semibold ${isSelected ? "text-success" : "text-error"}`}
          >
            {isSelected ? "✓ Fulfilled" : "Blocked"}
          </Text>
        </View>
      </View>

      {/* Shortage hint for blocked schools */}
      {!isSelected && shortageCount > 0 && (
        <Text className="mt-2 text-xs text-warning">
          {shortageCount} bottleneck SKU(s)
        </Text>
      )}

      {/* Expandable: SKU shopping list */}
      {expanded && skuEntries.length > 0 && (
        <View className="mt-3 border-t border-gray-100 pt-3">
          <Text className="mb-2 text-xs font-semibold text-gray-500">
            SKU DEMAND
          </Text>
          {skuEntries.map(([sku, qty]) => (
            <View key={sku} className="flex-row justify-between py-1">
              <Text className="text-sm text-gray-700">{sku}</Text>
              <Text className="text-sm font-semibold text-gray-900">
                ×{qty}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
