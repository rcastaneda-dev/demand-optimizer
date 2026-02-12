import { useMemo } from "react";
import { SectionList, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import type { PickingStudent } from "@/lib/types";

const ITEM_TYPE_LABEL: Record<string, string> = {
  shirt: "Shirt",
  pants: "Pants",
  shoes: "Shoes",
};

export default function WarehouseScreen() {
  const { pickingList, lastResult } = useApp();

  const sections = useMemo(() => {
    if (!pickingList) return [];
    return pickingList.schools.map((school) => ({
      title: school.school_id,
      studentCount: school.total_students,
      data: school.students,
    }));
  }, [pickingList]);

  const totalStudents = sections.reduce((sum, s) => sum + s.studentCount, 0);

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
        keyExtractor={(item) => item.student_id}
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
        renderItem={({ item }: { item: PickingStudent }) => (
          <View className="ml-4 border-b border-gray-100 py-3">
            <Text className="mb-1 text-sm font-medium text-gray-800">
              {item.student_id}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {item.items.map((it) => (
                <View
                  key={it.type}
                  className="rounded-md bg-gray-100 px-2 py-1"
                >
                  <Text className="text-xs text-gray-600">
                    {ITEM_TYPE_LABEL[it.type] ?? it.type}: {it.sku_id}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View className="mb-2 rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400">
              PICKING SUMMARY
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-800">
              {sections.length} schools · {totalStudents} students
            </Text>
          </View>
        }
      />
    </View>
  );
}
