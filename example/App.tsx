import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import PINCode, { hasUserSetPinCode, deleteUserPinCode } from "../index";

type PinStatus = "choose" | "enter" | "locked";

export default function App() {
  const [status, setStatus] = useState<PinStatus | "menu">("menu");
  const [hasPin, setHasPin] = useState(false);

  React.useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const pinExists = await hasUserSetPinCode();
    setHasPin(pinExists);
  };

  const handleFinishProcess = async (pinCode?: string) => {
    console.log("PIN Code process finished:", pinCode);
    if (status === "choose") {
      // After choosing PIN, switch to menu
      await checkPinStatus();
      setStatus("menu");
      alert("PIN Code set successfully!");
    } else if (status === "enter") {
      // After entering PIN successfully
      setStatus("menu");
      alert("PIN Code verified successfully!");
    }
  };

  const handleDeletePin = async () => {
    await deleteUserPinCode();
    setHasPin(false);
    alert("PIN Code deleted");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {status === "menu" ? (
        <View style={styles.controls}>
          <Text style={styles.title}>PIN Code Demo</Text>

          <TouchableOpacity style={styles.button} onPress={() => setStatus("choose")}>
            <Text style={styles.buttonText}>Choose PIN</Text>
          </TouchableOpacity>

          {hasPin && (
            <>
              <TouchableOpacity style={styles.button} onPress={() => setStatus("enter")}>
                <Text style={styles.buttonText}>Enter PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeletePin}>
                <Text style={styles.buttonText}>Delete PIN</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <PINCode
          status={status}
          finishProcess={handleFinishProcess}
          onFail={(attempts: number) => {
            console.log("Failed attempts:", attempts);
          }}
          maxAttempts={3}
          timeLocked={60000} // 1 minute for demo purposes
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  controls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
