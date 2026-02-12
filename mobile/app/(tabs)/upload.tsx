import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { uploadCSVText } from "@/lib/api";
import { useApp } from "@/context/AppContext";

interface UploadSection {
  label: string;
  description: string;
  endpoint: "inventory" | "students";
  columns: string;
}

const SECTIONS: UploadSection[] = [
  {
    label: "Inventory CSV",
    description: "Upload stock levels for all SKUs",
    endpoint: "inventory",
    columns: "sku_id, description, total_stock_available",
  },
  {
    label: "Student Enrollment CSV",
    description: "Upload student uniform assignments",
    endpoint: "students",
    columns: "student_id, school_id, shirt_sku, pants_sku, shoe_size_sku",
  },
];

async function readAssetAsText(asset: DocumentPicker.DocumentPickerAsset): Promise<string> {
  // On web, the asset exposes a File object we can read directly
  if (Platform.OS === "web") {
    const webFile = (asset as any).file as File | undefined;
    if (webFile) return webFile.text();
  }
  // On native (and web fallback): fetch the file URI
  const res = await fetch(asset.uri);
  return res.text();
}

function UploadCard({ section }: { section: UploadSection }) {
  const { fetchSchools, fetchInventory } = useApp();
  // Store full asset in a ref (avoids React serialization issues)
  const assetRef = useRef<DocumentPicker.DocumentPickerAsset | null>(null);
  // Simple string state just for rendering
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    upserted: number;
    errors: string[];
  } | null>(null);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "*/*"],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        assetRef.current = asset;
        setFileName(asset.name);
        setResult(null);
      }
    } catch (err: any) {
      Alert.alert("File Selection Failed", err.message);
    }
  };

  const upload = async () => {
    const asset = assetRef.current;
    if (!asset) return;
    setUploading(true);
    setResult(null);
    try {
      const csvContent = await readAssetAsText(asset);
      const res = await uploadCSVText(section.endpoint, csvContent);
      setResult(res);
      if (section.endpoint === "inventory") {
        await fetchInventory();
      } else {
        await fetchSchools();
      }
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
      <Text className="text-base font-bold text-gray-900">
        {section.label}
      </Text>
      <Text className="mt-1 text-sm text-gray-500">{section.description}</Text>

      <View className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
        <Text className="text-xs font-medium text-gray-400">
          REQUIRED COLUMNS
        </Text>
        <Text className="mt-1 text-xs text-gray-600">{section.columns}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 }}>
        <Pressable
          onPress={pickFile}
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
            Select File
          </Text>
        </Pressable>

        {fileName ? (
          <Text style={{ flex: 1, fontSize: 14, color: "#6B7280" }} numberOfLines={1}>
            {fileName}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={upload}
        disabled={!fileName || uploading}
        style={{
          marginTop: 16,
          alignItems: "center",
          borderRadius: 12,
          backgroundColor: fileName ? "#2D5BFF" : "#9CA3AF",
          paddingVertical: 12,
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
            Upload
          </Text>
        )}
      </Pressable>

      {result && (
        <View className="mt-3 rounded-lg bg-success/10 px-3 py-2">
          <Text className="text-sm font-medium text-success">
            {result.upserted} records uploaded successfully
          </Text>
          {result.errors.length > 0 && (
            <Text className="mt-1 text-xs text-warning">
              {result.errors.length} row(s) skipped — tap to see details
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function UploadScreen() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text className="mb-1 text-lg font-bold text-gray-900">
        Data Upload
      </Text>
      <Text className="mb-5 text-sm text-gray-500">
        Import inventory and student enrollment data from CSV files
      </Text>

      {SECTIONS.map((section) => (
        <UploadCard key={section.endpoint} section={section} />
      ))}
    </ScrollView>
  );
}
