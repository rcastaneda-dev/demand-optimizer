import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import i18n from "@/lib/i18n";
import GlobalHealthBar from "@/components/GlobalHealthBar";
import StatusCards from "@/components/StatusCards";
import OptimizeFAB from "@/components/OptimizeFAB";

export default function DashboardScreen() {
  const {
    schools,
    lastResult,
    isOptimizing,
    locale,
    fetchSchools,
    fetchInventory,
    startOptimization,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSchools();
    fetchInventory();
  }, [fetchSchools, fetchInventory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSchools(), fetchInventory()]);
    setRefreshing(false);
  }, [fetchSchools, fetchInventory]);

  const totalStudents = schools.reduce((sum, s) => sum + s.total_students, 0);
  const studentsServed = lastResult?.selection.total_students_served ?? 0;
  const eligibleCount = lastResult?.selection.selected_school_ids.length ?? 0;
  const blockedCount = schools.length - eligibleCount;

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5BFF" />
        }
      >
        <GlobalHealthBar
          studentsServed={studentsServed}
          totalStudents={totalStudents}
        />

        <StatusCards
          eligibleCount={eligibleCount}
          blockedCount={blockedCount}
        />

        {lastResult && (
          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <Text className="mb-2 text-sm font-medium text-gray-500">
              {i18n.t("dashboard.lastOptimization")}
            </Text>
            <Text className="text-base text-gray-700">
              {i18n.t("dashboard.schoolsSelected", { count: lastResult.selection.selected_school_ids.length })}
              {" · "}
              {lastResult.shortages.length > 0
                ? i18n.t("dashboard.bottleneckSkus", { count: lastResult.shortages.length })
                : i18n.t("dashboard.noShortages")}
            </Text>
          </View>
        )}

        {!lastResult && !isOptimizing && (
          <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
            <Text className="mb-2 text-base font-medium text-gray-500">
              {i18n.t("dashboard.noOptimizationYet")}
            </Text>
            <Text className="text-center text-sm text-gray-400">
              {i18n.t("dashboard.tapToOptimize")}
            </Text>
          </View>
        )}
      </ScrollView>

      <OptimizeFAB onPress={startOptimization} loading={isOptimizing} />
    </View>
  );
}
