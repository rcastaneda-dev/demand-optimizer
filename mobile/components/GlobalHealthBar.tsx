import { View, Text } from "react-native";

interface Props {
  studentsServed: number;
  totalStudents: number;
}

export default function GlobalHealthBar({ studentsServed, totalStudents }: Props) {
  const pct = totalStudents > 0 ? Math.round((studentsServed / totalStudents) * 100) : 0;

  return (
    <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
      <Text className="mb-1 text-sm font-medium text-gray-500">
        Student Coverage
      </Text>
      <Text className="mb-3 text-3xl font-bold text-gray-900">
        {pct}%
      </Text>
      <View className="h-3 overflow-hidden rounded-full bg-gray-200">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </View>
      <Text className="mt-2 text-xs text-gray-400">
        {studentsServed} of {totalStudents} students served
      </Text>
    </View>
  );
}
