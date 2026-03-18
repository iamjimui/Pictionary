import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { styles } from "../utils/styles";
import { auth } from "../../config/firebaseConfig";
//👇🏻 Import socket from the socket.js file in utils folder
import socket from "../utils/socket";

const Modal = ({ toggleButton }) => {
  const [groupName, setGroupName] = useState("");

  const closeModal = () => {
    toggleButton();
  };

  const handleCreateRoom = () => {
    //👇🏻 sends a message containing the group name to the server
    socket.emit("createRoom", groupName, auth.currentUser.displayName);
    closeModal();
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalsubheading}>Create a room</Text>
      <TextInput
        style={styles.modalinput}
        placeholder="Room's name"
        onChangeText={(value) => setGroupName(value)}
      />
      <View style={styles.modalbuttonContainer}>
        {/* 👇🏻 The create button triggers the function*/}
        <Pressable style={styles.modalbutton} onPress={handleCreateRoom}>
          <Text style={styles.modaltext}>Create</Text>
        </Pressable>

        <Pressable
          style={[styles.modalbutton, { backgroundColor: "#E14D2A" }]}
          onPress={() => closeModal()}
        >
          <Text style={styles.modaltext}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Modal;
