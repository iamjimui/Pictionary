import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, Text, Pressable, SafeAreaView, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import Modal from "../../components/Modal";
import SearchLobbyComponent from "../../components/SearchLobbyComponent";
import { styles } from "../../utils/styles";
import socket from "../../utils/socket";
import { ImageBackgroundContainer } from "../../components/containers/ImageBackgroundContainer";
import { IP_COMPUTER } from "@env";

const SearchLobbyScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [openModal, setOpenModal] = useState(true);

  function featherClicked() {
    setOpenModal(!openModal);
  }

  function fetchGroups() {
    fetch(`http://${IP_COMPUTER}:4000/api`)
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
      })
      .catch((err) => console.error(err));
  }

  //👇🏻 Runs when the component mounts
  useLayoutEffect(() => {
    fetchGroups();
  }, []);

  //👇🏻 Runs whenever there is new trigger from the backend
  useEffect(() => {
    socket.on("roomsList", (rooms) => {
      setRooms(rooms);
    });
  }, [socket]);

  useEffect(() => {
    featherClicked();
  }, []);

  return (
    <ImageBackgroundContainer>
      <View style={styles.searchLobbyHeaderContainer}>
        <Text style={styles.searchLobbyHeader}>Create or join a room ! 😄</Text>
        <Pressable onPress={featherClicked}>
          <Feather name="edit" size={24} color="white" />
        </Pressable>
      </View>

      <View style={styles.chatlistContainer}>
        {rooms.length > 0 ? (
          <FlatList
            data={rooms}
            renderItem={({ item }) => <SearchLobbyComponent item={item} />}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View style={styles.chatemptyContainer}>
            <Text style={styles.chatemptyText}>No rooms created! 🥶</Text>
            <Text style={styles.chatemptyText}>
              Click the icon above to create a Chat room
            </Text>
          </View>
        )}
      </View>
      {openModal && <Modal toggleButton={featherClicked} />}
    </ImageBackgroundContainer>
  );
};

export default SearchLobbyScreen;
