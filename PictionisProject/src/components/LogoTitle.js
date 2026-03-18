import { Image, Text, ImageBackground, StyleSheet } from "react-native";

export default function LogoTitle () {
    const image = {uri: 'http://localhost:8081/assets/etna-logo-blanc.png'};
    return (<Image source={image} resizeMode='contain' style={logoTitleStyles.image}>
    </Image>);
};

const logoTitleStyles = StyleSheet.create({
    image: {
        height:70,
        width:70
    },
});