import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = { title: string; desc?: string | null; onPress?: () => void };
export function CategoryCard({ title, desc, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
        {title}
      </Text>
      {!!desc && <Text style={{ color: "#6b7280" }}>{desc}</Text>}
    </TouchableOpacity>
  );
}
