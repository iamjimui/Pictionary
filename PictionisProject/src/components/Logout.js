import {
  Image,
  Text,
  ImageBackground,
  StyleSheet,
  Button,
  TouchableHighlight,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

export default function Logout({ navigation }) {
  const image = { uri: "http://localhost:8081/assets/logout-logo-blanc.png" };
  userLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <TouchableHighlight onPress={() => this.userLogout()}>
      <Image source={image} resizeMode="cover" style={styles.image}></Image>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 20,
    width: 20,
  },
});
