import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, SectionList, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useApp } from "@/context/AppContext";
import i18n from "@/lib/i18n";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { PickingStudent } from "@/lib/types";

function itemTypeLabel(type: string): string {
  const key = `warehouse.${type}` as const;
  return i18n.t(key, { defaultValue: type });
}

export default function WarehouseScreen() {
  const { pickingList, lastResult, locale, fetchInventory } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Collect all approved SKU IDs from the picking list
  const approvedSkus = useMemo(() => {
    const skus = new Set<string>();
    if (pickingList) {
      for (const school of pickingList.schools) {
        for (const student of school.students) {
          for (const item of student.items) {
            skus.add(item.sku_id);
          }
        }
      }
    }
    return skus;
  }, [pickingList]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  }, [fetchInventory]);

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
          {i18n.t("warehouse.noPickingList")}
        </Text>
        <Text className="text-center text-sm text-gray-400">
          {i18n.t("warehouse.runOptimizationHint")}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <BarcodeScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        approvedSkus={approvedSkus}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.student_id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5BFF" />
        }
        renderSectionHeader={({ section }) => (
          <View className="mb-2 mt-4 rounded-xl bg-primary/10 px-4 py-3">
            <Text className="text-sm font-bold text-primary">
              {section.title}
            </Text>
            <Text className="text-xs text-primary/70">
              {i18n.t("warehouse.studentsCount", { count: section.studentCount })}
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
                    {itemTypeLabel(it.type)}: {it.sku_id}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View className="mb-2 rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-xs font-semibold text-gray-400">
              {i18n.t("warehouse.pickingSummary")}
            </Text>
            <Text className="mt-1 text-base font-medium text-gray-800">
              {i18n.t("warehouse.schoolsStudents", { schools: sections.length, students: totalStudents })}
            </Text>
          </View>
        }
      />

      {/* Scan-to-Verify FAB */}
      <Pressable
        onPress={() => setScannerOpen(true)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#2D5BFF",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <FontAwesome name="barcode" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
