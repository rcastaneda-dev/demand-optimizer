import { useCallback, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Set of approved SKU IDs from the picking list */
  approvedSkus: Set<string>;
}

type ScanResult = {
  sku: string;
  approved: boolean;
} | null;

export default function BarcodeScanner({ visible, onClose, approvedSkus }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);

      const isApproved = approvedSkus.has(data);
      setScanResult({ sku: data, approved: isApproved });

      if (Platform.OS !== "web") {
        if (isApproved) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    },
    [scanned, approvedSkus]
  );

  const handleScanAgain = useCallback(() => {
    setScanned(false);
    setScanResult(null);
  }, []);

  const handleClose = useCallback(() => {
    setScanned(false);
    setScanResult(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between bg-gray-900 px-4 pb-4 pt-14">
          <Text className="text-lg font-bold text-white">Scan to Verify</Text>
          <Pressable onPress={handleClose} className="rounded-full bg-white/20 p-2">
            <FontAwesome name="close" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Camera or permission request */}
        {!permission?.granted ? (
          <View className="flex-1 items-center justify-center px-8">
            <FontAwesome name="camera" size={48} color="#6B7280" />
            <Text className="mt-4 text-center text-base text-gray-400">
              Camera access is required to scan barcodes
            </Text>
            <Pressable
              onPress={requestPermission}
              className="mt-6 rounded-xl bg-primary px-8 py-3"
            >
              <Text className="text-base font-semibold text-white">Grant Access</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "code128",
                  "code39",
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "qr",
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Scan overlay crosshair */}
            {!scanned && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="h-56 w-56 rounded-2xl border-2 border-white/60" />
                <Text className="mt-4 text-sm text-white/80">
                  Point at a barcode to verify
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Scan result */}
        {scanResult && (
          <View
            className={`px-6 pb-10 pt-6 ${
              scanResult.approved ? "bg-success" : "bg-error"
            }`}
          >
            <View className="mb-3 flex-row items-center gap-3">
              <FontAwesome
                name={scanResult.approved ? "check-circle" : "times-circle"}
                size={28}
                color="#fff"
              />
              <Text className="text-lg font-bold text-white">
                {scanResult.approved ? "Approved" : "Not on Picking List"}
              </Text>
            </View>
            <Text className="mb-4 text-base text-white/90">
              SKU: {scanResult.sku}
            </Text>
            <Pressable
              onPress={handleScanAgain}
              className="rounded-xl bg-white/20 px-6 py-3"
            >
              <Text className="text-center text-base font-semibold text-white">
                Scan Another
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}
