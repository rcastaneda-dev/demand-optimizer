import { Pressable, Text, ActivityIndicator } from "react-native";

interface Props {
  onPress: () => void;
  loading: boolean;
}

export default function OptimizeFAB({ onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
      style={{ elevation: 6 }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-2xl font-bold text-white">▶</Text>
      )}
    </Pressable>
  );
}
