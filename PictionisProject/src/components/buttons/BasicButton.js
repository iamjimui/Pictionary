import { StyleSheet, Button } from "react-native";

export const BasicButton = ({ text, onPress, color }) => {
  return <Button title={text} onPress={onPress} color={color} />;
};
