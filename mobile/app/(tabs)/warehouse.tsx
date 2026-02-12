import { useMemo } from "react";
import { SectionList, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";

export default function WarehouseScreen() {
  const { schools, lastResult } = useApp();

  const selectedIds = new Set(
    lastResult?.selection.selected_school_ids ?? []
  );

  // Build picking list grouped by School → Student-level SKU items
  const sections = useMemo(() => {
    return schools
      .filter((s) => selectedIds.has(s.school_id))
      .sort((a, b) => a.school_id.localeCompare(b.school_id))
      .map((school) => ({
        title: school.school_id,
        studentCount: school.total_students,
        data: Object.entries(school.sku_demand).map(([sku, qty]) => ({
          sku,
          qty,
        })),
      }));
  }, [schools, lastResult]);

  if (!lastResult || sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="mb-2 text-base font-medium text-gray-500">
          No picking list available
        </Text>
        <Text className="text-center text-sm text-gray-400">
          Run an optimization from the Home tab to generate a warehouse prep
          list
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.sku}-${index}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View className="mb-2 mt-4 rounded-xl bg-primary/10 px-4 py-3">
            <Text className="text-sm font-bold text-primary">
              {section.title}
            </Text>
            <Text className="text-xs text-primary/70">
              {section.studentCount} students
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="ml-4 flex-row items-center justify-between border-b border-gray-100 py-3">
            <Text className="text-sm text-gray-700">{item.sku}</Text>
            <Text className="text-sm font-bold text-gray-900">
              ×{item.qty}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <View className="mb-2 rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400">
              PICKING SUMMARY
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-800">
              {sections.length} schools · {sections.reduce((sum, s) => sum + s.data.length, 0)} line items
            </Text>
          </View>
        }
      />
    </View>
  );
}
