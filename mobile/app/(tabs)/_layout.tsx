import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

import { useApp } from "@/context/AppContext";
import LanguageToggle from "@/components/LanguageToggle";
import i18n from "@/lib/i18n";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // Subscribe to locale changes so tab labels re-render
  const { locale } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2D5BFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
        headerStyle: { backgroundColor: "#2D5BFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontFamily: "Inter_700Bold" },
        headerRight: () => <LanguageToggle />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t("nav.home"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="dashboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schools"
        options={{
          title: i18n.t("nav.schools"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="building" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: i18n.t("nav.inventory"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="warehouse"
        options={{
          title: i18n.t("nav.warehouse"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="truck" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: i18n.t("nav.upload"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="upload" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
