import { View, Text } from "react-native";

interface Props {
  eligibleCount: number;
  blockedCount: number;
}

export default function StatusCards({ eligibleCount, blockedCount }: Props) {
  return (
    <View className="mb-4 flex-row gap-3">
      <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-success/10">
          <Text className="text-lg">✓</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">
          {eligibleCount}
        </Text>
        <Text className="text-sm text-gray-500">Eligible Schools</Text>
      </View>

      <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
        <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-error/10">
          <Text className="text-lg">✕</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900">
          {blockedCount}
        </Text>
        <Text className="text-sm text-gray-500">Blocked Schools</Text>
      </View>
    </View>
  );
}
