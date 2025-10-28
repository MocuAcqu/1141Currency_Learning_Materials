import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ResultsCharts from "../../components/ResultsCharts";

// ====== Theme ======
const COLORS = {
  bg: "#f5f7fb",
  card: "#ffffff",
  primary: "#2D5975", 
  primarySoft: "#e0ecff",
  textDark: "#1f2937",
  text: "#4b5563",
  border: "#e5e7eb",
  danger: "#e63946",
};

// 依你的環境調整（若用行動裝置 + 本機後端，Android 模擬器要用 10.0.2.2）
const API_BASE =
  Platform.select({
    ios: "http://192.168.0.160:5000",
    android: "http://192.168.0.160:5000",
    default: "http://192.168.0.160:5000",
  })!;

export default function RecognizeScreen() {
  const [img, setImg] = useState<string | null>(null);
  const [resJson, setResJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Web: 隱藏 input[file]（支援 capture 相機）
  const webFileInputRef = useRef<HTMLInputElement | null>(null);
  const isWeb = Platform.OS === "web";

  const shadowStyle = useMemo(
    () => ({
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    }),
    []
  );

  const askAlbum = async () => {
    if (isWeb) {
      webFileInputRef.current?.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("需要相簿權限才能選擇圖片");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImg(result.assets[0].uri);
      setResJson(null);
    }
  };

  const askCamera = async () => {
    if (isWeb) {
      // Web 無法直接開相機，交給隱藏 input + capture
      webFileInputRef.current?.setAttribute("capture", "environment");
      webFileInputRef.current?.click();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("需要相機權限才能拍照");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImg(result.assets[0].uri);
      setResJson(null);
    }
  };

  const onPickWebFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setImg(objectUrl);
    setResJson(null);
  };

  const upload = async () => {
    if (!img) return;
    try {
      setLoading(true);
      const form = new FormData();

      if (Platform.OS === "web") {
        // Web: 以 Blob 上傳
        const res = await fetch(img);
        const blob = await res.blob();
        form.append("image", blob, "upload.jpg");
      } else {
        // iOS/Android: 以檔案物件結構上傳
        const file: any = { uri: img, name: "upload.jpg", type: "image/jpeg" };
        form.append("image", file);
      }

      const resp = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });
      const json = await resp.json();
      setResJson(json);
    } catch (err: any) {
      setResJson({ ok: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // ====== UI ======
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* 隱藏的 Web input */}
      {isWeb && (
        <input
          ref={webFileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onPickWebFile}
        />
      )}

      {/* Header Segments */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 24,
            padding: 8,
            flexDirection: "row",
            gap: 8,
            ...shadowStyle,
          }}
        >
          <FancyButton label="📷 開啟相機" onPress={askCamera} />
          <FancyButton label="🖼️ 從相簿匯入" onPress={askAlbum} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 20,
          gap: 16,
        }}
      >
        {/* 圖片卡片 */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 16,
            padding: 12,
            ...shadowStyle,
          }}
        >
          {img ? (
            <Image
              source={{ uri: img }}
              style={{ width: "100%", height: 200, borderRadius: 12 }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                height: 160,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: COLORS.text }}>尚未選擇圖片</Text>
            </View>
          )}

          <View style={{ height: 12 }} />

          <TouchableOpacity
            onPress={upload}
            disabled={!img || loading}
            style={{
              alignSelf: "center",
              backgroundColor: !img || loading ? "#96abc0" : COLORS.primary,
              paddingVertical: 12,
              paddingHorizontal: 28,
              borderRadius: 24,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>上傳辨識</Text>
          </TouchableOpacity>
        </View>

        {/* 載入指示 */}
        {loading && (
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              ...shadowStyle,
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 8, color: COLORS.text }}>辨識中…</Text>
          </View>
        )}

        {/* 結果卡片 */}
        {resJson && (
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 16,
              padding: 16,
              gap: 12,
              ...shadowStyle,
            }}
          >
            {resJson.ok ? (
              <ResultsCharts resJson={resJson} color={COLORS.primary} />
            ) : (
              <>
                <Text style={{ color: COLORS.danger, fontWeight: "700", fontSize: 16 }}>發生錯誤</Text>
                <Text selectable style={{ color: COLORS.text }}>
                  {String(resJson.error ?? "Unknown error")}
                </Text>
              </>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function FancyButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: COLORS.primarySoft,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: COLORS.primary, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
}
