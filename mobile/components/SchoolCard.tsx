import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { School } from "@/lib/types";
import i18n from "@/lib/i18n";

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
      className="mb-3 overflow-hidden rounded-2xl active:opacity-90"
      style={[
        glassBase,
        isSelected ? glassSelected : glassExcluded,
      ]}
    >
      <View className="p-4">
        <View className="flex-row items-center">
          {/* Left: school info */}
          <View className="flex-1">
            <Text
              className="text-base text-gray-900"
              style={{ fontFamily: "Inter_700Bold" }}
            >
              {school.school_id}
            </Text>
            <Text
              className="text-sm text-gray-500"
              style={{ fontFamily: "Inter_500Medium" }}
            >
              {school.total_students} {i18n.t("common.students")}
            </Text>
          </View>

          {/* Center: kit readiness bar */}
          <View className="mx-3 flex-1">
            <View className="h-2 overflow-hidden rounded-full bg-gray-200/60">
              <View
                className={`h-full rounded-full ${isSelected ? "bg-success" : "bg-error"}`}
                style={{ width: isSelected ? "100%" : "0%" }}
              />
            </View>
            <Text
              className="mt-1 text-center text-xs text-gray-400"
              style={{ fontFamily: "Inter_400Regular" }}
            >
              {isSelected ? "100%" : i18n.t("common.incomplete")}
            </Text>
          </View>

          {/* Right: badge */}
          <View
            className={`rounded-full px-3 py-1 ${isSelected ? "bg-success/15" : "bg-error/15"}`}
          >
            <Text
              className={`text-xs ${isSelected ? "text-success" : "text-error"}`}
              style={{ fontFamily: "Inter_600SemiBold" }}
            >
              {isSelected ? i18n.t("common.fulfilled") : i18n.t("common.blocked")}
            </Text>
          </View>
        </View>

        {/* Shortage hint for blocked schools */}
        {!isSelected && shortageCount > 0 && (
          <Text
            className="mt-2 text-xs text-warning"
            style={{ fontFamily: "Inter_500Medium" }}
          >
            {i18n.t("common.bottleneckSkus", { count: shortageCount })}
          </Text>
        )}

        {/* Expandable: SKU shopping list */}
        {expanded && skuEntries.length > 0 && (
          <View className="mt-3 border-t border-gray-200/50 pt-3">
            <Text
              className="mb-2 text-xs text-gray-500"
              style={{ fontFamily: "Inter_600SemiBold" }}
            >
              {i18n.t("common.skuDemand")}
            </Text>
            {skuEntries.map(([sku, qty]) => (
              <View key={sku} className="flex-row justify-between py-1">
                <Text
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "Inter_400Regular" }}
                >
                  {sku}
                </Text>
                <Text
                  className="text-sm text-gray-900"
                  style={{ fontFamily: "Inter_700Bold" }}
                >
                  x{qty}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Glassmorphism base: translucent background + blur + subtle border
const glassBase = {
  borderWidth: 1,
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
};

// Selected school: brighter glass with green-tinted border
const glassSelected = {
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  borderColor: "rgba(39, 174, 96, 0.25)",
};

// Excluded school: dimmer glass with red-tinted border
const glassExcluded = {
  backgroundColor: "rgba(255, 255, 255, 0.55)",
  borderColor: "rgba(235, 87, 87, 0.2)",
};
