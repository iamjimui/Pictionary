import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, ImageBackground, LogBox } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebaseConfig";
import HomeScreen from './src/screens/pages/HomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import LobbyScreen from './src/screens/pages/LobbyScreen';
import SearchLobbyScreen from './src/screens/pages/SearchLobbyScreen';
import LogoTitle from './src/components/LogoTitle';
import Logout from './src/components/Logout';
import GameScreen from './src/screens/pages/GameScreen';
import GameResultScreen from './src/screens/pages/GameResultScreen';

export default function App() {
  const Stack = createNativeStackNavigator();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  const onAuthStateChangedHandler = (user) => {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, onAuthStateChangedHandler);

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
      <View style={styles.container}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" 
            screenOptions={{
              headerRight: () => (
              user?(<Logout/>) : (<LogoTitle/>)
              ),
              title: 'Pictionis',
              headerStyle: {
                backgroundColor: '#326ba6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerTitleAlign:'center'
            }}>
              {user? (
                <>
                  <Stack.Screen name="Home">
                    {(props) => <HomeScreen {...props} />}
                  </Stack.Screen>
                  <Stack.Screen
                    name='SearchLobby'
                    component={SearchLobbyScreen}
                  />
                  <Stack.Screen name='Lobby' component={LobbyScreen} />
                  <Stack.Screen name="Game" component={GameScreen} />
                  <Stack.Screen name="GameResult" component={GameResultScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Signup" component={SignupScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  title: {
    textAlign:'center',
  },
  text: {
    color: 'white',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000c0',
  },
});