import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
  SafeAreaView,
  StatusBar,
  ImageBackground,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, database } from "../../../config/firebaseConfig";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

export default function Signup({ navigation }) {
  const image = { uri: "http://localhost:8081/assets/background.png" };
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageURL, setImageURL] = useState("");

  const onHandleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
        .then(function (res) {
          updateProfile(auth.currentUser, {
            displayName: username,
            photoURL: "",
          });
          const newUser = {
            uid: auth.currentUser.uid,
            email: email,
            username: username,
            photoURL: imageURL,
          };
          setDoc(doc(database, "users", newUser.uid), newUser);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  return (
    <View>
      {/* Background Image */}
      <ImageBackground source={image} resizeMode="repeat" style={styles.image}>
        {/* Title */}
        <Text style={styles.title}>Inscription</Text>

        <SafeAreaView>
          {/* Input Fields */}
          <View style={styles.viewTextInput}>
            <TextInput
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              value={username}
              onChangeText={(text) => setUsername(text)}
              style={styles.textInput}
            />
          </View>
          <View style={styles.viewTextInput}>
            <TextInput
              placeholder="Enter email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus={true}
              value={email}
              onChangeText={(text) => setEmail(text)}
              style={styles.textInput}
            />
          </View>
          <View style={styles.viewTextInput}>
            <TextInput
              placeholder="Enter password"
              autoCapitalize="none"
              autoCorrect={false}
              showSoftInputOnFocus={false}
              secureTextEntry={true}
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={styles.textInput}
            />
          </View>

          <View style={styles.shadowProp}>
            {/* Login Button */}
            <TouchableHighlight
              style={styles.buttonSignup}
              onPress={onHandleSignup}
            >
              <Text style={styles.textButtonSignup}>S'inscrire</Text>
            </TouchableHighlight>
          </View>

          {/* Navigation to Login Screen */}
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>
              Vous avez déjà un compte?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}
              >
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
      {/* StatusBar */}
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  viewTextInput: {
    textAlign: "center",
    paddingLeft: 50,
    paddingRight: 50,
  },
  title: {
    color: "white",
    fontSize: 20,
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonSignup: {
    height: "100%",
    justifyContent: "center",
    backgroundColor: "#2c8de7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2c8de7",
  },
  textButtonSignup: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 18,
  },
  shadowProp: {
    height: 65,
    marginRight: 50,
    marginLeft: 50,
    shadowColor: "#fff",
    shadowOffset: { width: -2, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  textInput: {
    backgroundColor: "white",
    borderColor: "#2fdae0",
    borderWidth: 3,
    textAlign: "center",
    height: 50,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 17,
  },
});
