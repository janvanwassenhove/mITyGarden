import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { createI18n, setSharedI18n } from "@mity-garden/i18n";

// Initialize i18n
const i18n = createI18n({ locale: "en" });
setSharedI18n(i18n);

// Placeholder home screen — full implementation in Milestone 8
function HomeScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿</Text>
      <Text style={styles.title}>mITyGarden</Text>
      <Text style={styles.subtitle}>Garden Design App</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Mobile app — Milestone 8{"\n"}
          Full canvas, wizard and asset library coming soon.
        </Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create New Garden</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App(): React.ReactElement {
  return (
    <NavigationContainer>
      <HomeScreen />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4e8",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logo: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: "700", color: "#1b5e20", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#c8e6c9",
    alignItems: "center",
  },
  cardText: { textAlign: "center", color: "#555", lineHeight: 22 },
  button: {
    backgroundColor: "#4caf50",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
