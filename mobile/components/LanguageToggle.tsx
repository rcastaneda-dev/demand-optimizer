import { Pressable, Text } from "react-native";
import { useApp } from "@/context/AppContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useApp();

  return (
    <Pressable
      onPress={toggleLocale}
      className="mr-4 rounded-full border border-white/30 px-3 py-1"
    >
      <Text className="text-sm font-semibold text-white">
        {locale === "es" ? "EN" : "ES"}
      </Text>
    </Pressable>
  );
}
