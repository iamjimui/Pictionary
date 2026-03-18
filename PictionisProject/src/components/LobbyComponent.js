import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const LobbyComponent = ({ playerNumber, user }) => {
  const iconColor = randomColor();

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <Ionicons
          name="person"
          size={20}
          color={iconColor}
          style={styles.avatar}
        />
        <Text style={styles.playerLabel}>Player {playerNumber}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: "center",
  },
  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#326BA6",
    width: "100%",
    borderRadius: 8,
    padding: 15,
    gap: 10,
  },
  avatar: {
    marginRight: 10,
  },
  playerLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  playerName: {
    color: "white",
  },
});

export default LobbyComponent;
