import { StyleSheet, ImageBackground } from "react-native";

export const ImageBackgroundContainer = ({ children }) => {
  const image = { uri: "http://localhost:8081/assets/background.png" };
  return (
    <ImageBackground
      source={image}
      style={imageStyle.image}
      resizeMode="repeat"
    >
      {children}
    </ImageBackground>
  );
};

const imageStyle = StyleSheet.create({
  image: {
    height: "100%",
    width: "100%",
  },
});
