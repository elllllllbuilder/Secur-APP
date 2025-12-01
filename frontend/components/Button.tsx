import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

type Props = { title: string; onPress?: () => void; loading?: boolean };
export default function Button({ title, onPress, loading }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        backgroundColor: "#111827",
        padding: 14,
        borderRadius: 10,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "700" }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
