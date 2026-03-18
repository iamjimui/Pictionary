import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { database } from "../../../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default GameResultScreen = () => {
  const [winner, setWinner] = useState(null);
  const [points, setPoints] = useState(null);
  const navigation = useNavigation();
  const image = { uri: "http://localhost:8081/assets/background.png" };

  const handleReturnHome = () => {
    navigation.navigate("Home");
  };

  const fetchUserResult = async () => {
    try {
      const q = query(
        collection(database, "results"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      let userResultData = null;
      querySnapshot.forEach((doc) => {
        const resultData = doc.data();
        setWinner(resultData.winner.user);
        setPoints(resultData.winner.points);
      });
    } catch (error) {
      console.error("Error fetching user result: ", error);
      return null;
    }
  };

  useEffect(() => {
    fetchUserResult();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="repeat" style={styles.image}>
        <Text style={styles.title}>Game results</Text>
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>The winner is : {winner}</Text>
          <Text style={styles.resultText}>Points: {points}</Text>
        </View>
        <TouchableOpacity onPress={handleReturnHome} style={styles.button}>
          <Text style={styles.buttonText}>Back home</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },
  resultContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    marginLeft: 30,
    marginRight: 30,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    borderColor: "#2c8de7",
    backgroundColor: "#2c8de7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: "center",
    marginLeft: 100,
    marginRight: 100,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
