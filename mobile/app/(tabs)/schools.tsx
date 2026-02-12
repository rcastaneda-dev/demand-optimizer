import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

import { useApp } from "@/context/AppContext";
import SchoolCard from "@/components/SchoolCard";

type SortMode = "students" | "bottlenecks";

export default function SchoolsScreen() {
  const { schools, lastResult, fetchSchools } = useApp();
  const [sortMode, setSortMode] = useState<SortMode>("students");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSchools();
    setRefreshing(false);
  }, [fetchSchools]);

  const selectedIds = new Set(lastResult?.selection.selected_school_ids ?? []);

  // Build a map of school_id → number of shortage SKUs
  const shortageMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (lastResult?.shortages) {
      for (const s of lastResult.shortages) {
        map[s.school_id] = (map[s.school_id] ?? 0) + 1;
      }
    }
    return map;
  }, [lastResult]);

  const sortedSchools = useMemo(() => {
    const copy = [...schools];
    if (sortMode === "students") {
      copy.sort((a, b) => b.total_students - a.total_students);
    } else {
      copy.sort(
        (a, b) => (shortageMap[a.school_id] ?? 0) - (shortageMap[b.school_id] ?? 0)
      );
    }
    return copy;
  }, [schools, sortMode, shortageMap]);

  return (
    <View className="flex-1 bg-gray-100">
      {/* Quick Filter bar */}
      <View className="flex-row gap-2 bg-white px-4 py-3 shadow-sm">
        <FilterChip
          label="Most Students"
          active={sortMode === "students"}
          onPress={() => setSortMode("students")}
        />
        <FilterChip
          label="Fewest Bottlenecks"
          active={sortMode === "bottlenecks"}
          onPress={() => setSortMode("bottlenecks")}
        />
      </View>

      <FlatList
        data={sortedSchools}
        keyExtractor={(item) => item.school_id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5BFF" />
        }
        renderItem={({ item }) => (
          <SchoolCard
            school={item}
            isSelected={selectedIds.has(item.school_id)}
            shortageCount={shortageMap[item.school_id] ?? 0}
          />
        )}
        ListEmptyComponent={
          <View className="items-center p-8">
            <Text className="text-sm text-gray-400">
              No schools loaded yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "bg-gray-100"}`}
    >
      <Text
        className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
