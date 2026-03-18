import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, Button, SafeAreaView, StatusBar, ImageBackground, TouchableHighlight } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../../../config/firebaseConfig";

export default function LoginScreen ({navigation}) {
    const image = {uri: 'http://localhost:8081/assets/background.png'};
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onHandleLogin = () => {
        if (email !== "" && password !== "") {
            signInWithEmailAndPassword(auth, email, password)
            .then(async () => {
                console.log("Login success");
            })
            .catch((err) => Alert.alert("Login error", err.message));
        }
    };
    
    return (
        <View>
            <ImageBackground source={image} resizeMode='repeat' style={styles.image}>
            {/* Title */}
            <Text style={styles.title}>Connexion</Text>
        
            <SafeAreaView>
                {/* Input Fields */}
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
                    secureTextEntry={true}
                    textContentType="password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    style={styles.textInput}
                    />
                </View>
        
                <View style={styles.shadowProp}>
                    {/* Login Button */}
                    <TouchableHighlight style={styles.buttonSignup} onPress={onHandleLogin}>
                        <Text style={styles.textButtonSignup}>Se connecter</Text>
                    </TouchableHighlight>
                </View>
        
                {/* Navigation to Signup Screen */}
                <View
                style={{
                    marginTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                }}
                >
                <Text style={{ color: "gray", fontWeight: "600", fontWeight:'bold', fontSize: 14 }}>
                    Vous n'avez toujours pas un compte?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}>S'inscrire</Text>
                </TouchableOpacity>
                </View>
                </SafeAreaView>
                {/* StatusBar */}
                <StatusBar barStyle="light-content" />

            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        height:'100%',
        width:'100%',
    },
    viewTextInput:{
        textAlign:'center',
        paddingLeft:50,
        paddingRight:50,
    },
    title: {
        color: 'white',
        fontSize: 20,
        lineHeight: 84,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    buttonSignup:{
        height:'100%',
        justifyContent:'center',
        backgroundColor: '#2c8de7',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2c8de7',
    },
    textButtonSignup:{
        textAlign:'center',
        fontWeight: "bold", 
        color: "#ffffff", 
        fontSize: 18 
    },
    shadowProp: {
        height:65,
        marginRight: 50,
        marginLeft: 50,
        shadowColor: '#fff',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation:3,
    },
    textInput:{
        backgroundColor:'white',
        borderColor:'#2fdae0',
        borderWidth:3,
        textAlign:'center',
        height:50,
        borderRadius: 10,
        marginBottom:15,
        fontSize:17
    }
});