import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableHighlight } from "react-native";
import { styles } from "../../utils/styles";
import socket from "../../utils/socket";
import { auth } from "../../../config/firebaseConfig";
import LobbyComponent from "../../components/LobbyComponent";
import { StackActions } from "@react-navigation/native";
import { ImageBackgroundContainer } from "../../components/containers/ImageBackgroundContainer";
import { CenteredContainer } from "../../components/containers/CenteredContainer";
import { BasicButton } from "../../components/buttons/BasicButton";

const LobbyScreen = ({ navigation, route }) => {
  const [startGame, setStartGame] = useState(false);
  const [roomDetails, setRoomDetails] = useState({});

  const { name, id } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: name });
    socket.emit("findRoom", id, name, auth.currentUser.displayName);
    socket.on("foundRoom", (roomDetails) => setRoomDetails(roomDetails));
  }, []);

  useEffect(() => {
    socket.on("foundRoom", (roomDetails) => setRoomDetails(roomDetails));
  }, [socket]);

  useEffect(() => {
    socket.on("startGameResponse", (roomDetails) => {
      setRoomDetails(roomDetails);
      if (roomDetails.games[roomDetails.games.length - 1].match.length === 1) {
        console.log("Le jeu vient de commencer!");
        navigation.dispatch(
          StackActions.replace("Game", {
            roomDetails: roomDetails,
          })
        );
      }
    });
    return () => {
      socket.removeAllListeners("startGameResponse");
    };
  }, [socket]);

  function onHandleStartGame() {
    socket.emit("startGame", roomDetails);
  }

  return (
    <ImageBackgroundContainer>
      <Text style={styles.introText}>
        Welcome to your game room. You'll take turns making or guessing a few
        words. Enjoy the game!
      </Text>
      <CenteredContainer>
        <View
          style={[
            styles.messagingscreen,
            { paddingVertical: 15, paddingHorizontal: 10 },
          ]}
        >
          {roomDetails ? (
            <FlatList
              data={roomDetails.users}
              renderItem={({ item }) => (
                <LobbyComponent
                  playerNumber={item}
                  user={auth.currentUser.displayName}
                />
              )}
              keyExtractor={(item) => item}
            />
          ) : (
            <Text>No users in this room...</Text>
          )}
        </View>
        <View style={{ height: 50 }}>
          {roomDetails ? (
            <View>
              {roomDetails.host == auth.currentUser.displayName ? (
                <BasicButton
                  text="Start the game"
                  color="#2c8de7"
                  onPress={onHandleStartGame}
                />
              ) : (
                <BasicButton text="Waiting for host..." color="#2c8de7" />
              )}
            </View>
          ) : (
            ""
          )}
        </View>
      </CenteredContainer>
    </ImageBackgroundContainer>
  );
};

export default LobbyScreen;
