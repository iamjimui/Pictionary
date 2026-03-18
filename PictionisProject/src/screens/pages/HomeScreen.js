import React from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import { auth } from "../../../config/firebaseConfig";
import { ImageBackgroundContainer } from "../../components/containers/ImageBackgroundContainer";
import { BasicButton } from "../../components/buttons/BasicButton";

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackgroundContainer>
      <View style={styles.container}>
        <Image
          source={require("../../../assets/header.png")}
          style={styles.image}
        />
        <View>
          <Text style={styles.text}>
            Welcome,{" "}
            {auth.currentUser.displayName ? auth.currentUser.displayName : ""}
          </Text>
        </View>
        <BasicButton
          color="#7FFF00"
          text="Play"
          onPress={() => navigation.navigate("SearchLobby")}
        />
      </View>
    </ImageBackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  image: {
    width: 300,
    height: 60,
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
