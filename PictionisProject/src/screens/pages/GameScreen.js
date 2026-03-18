import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { auth, database } from "../../../config/firebaseConfig";
import socket from "../../utils/socket";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ImageBackgroundContainer } from "../../components/containers/ImageBackgroundContainer";
import ClearBoardButton from "../../components/ClearBoardButton";
import { SketchCanvas } from "@terrylinla/react-native-sketch-canvas";

const DrawingEvents = {
  CLEAR_BOARD: "CLEAR_BOARD",
  START_DRAWING: "START_DRAWING",
  DRAWING: "DRAWING",
  STOP_DRAWING: "STOP_DRAWING",
};

const CheckWordResult = {
  CLOSE: "Close word...",
  NOT_CLOSE: "Not a close word, try again...",
  FOUNDED: "Word founded!!!",
};

const generateID = () => Math.random().toString(36).substring(2, 10);

export default function GameScreen({ navigation, route }) {
  let { roomDetails } = route.params;
  const [gameConfig, setGameConfig] = useState(
    roomDetails.games[roomDetails.games.length - 1].match
  );
  const [currentPoints, setCurrentPoints] = useState(0);
  const canvas = useRef(null);
  const [pathIds, setPathIds] = useState([]);
  const [currentPathId, setCurrentPathId] = useState(0);
  const [currentPath, setCurrentPath] = useState([]);
  const [disableTextInput, setDisableTextInput] = useState(true);
  const [remainingTime, setRemainingTime] = useState(30);
  const [checkText, setCheckText] = useState(null);
  const [inputWord, setInputWord] = useState('');

  useEffect(() => {
    timer();
  }, [])

  function timer() {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          timeOut();
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }

  function saveResult() {
    try {
      const data = {
        winner: {
          user: auth.currentUser.displayName,
          points: currentPoints,
        },
        timestamp: serverTimestamp(),
      };
      setDoc(doc(database, "results", generateID()), data);
      console.log("Result saved successfully!");
    } catch (error) {
      console.error("Error saving result: ", error);
    }
  }

  useEffect(() => {
    
  }, [gameConfig]);

  function checkRound() {
    socket.on("nextRound", ({ status, payload }) => {
      if (status == "SUCCESS") {
        var curPoints = 0;
        roomDetails = payload;
        setGameConfig(roomDetails.games[roomDetails.games.length - 1].match);
        setRemainingTime(30);
        for (
          let i = 0;
          i < roomDetails.games[roomDetails.games.length - 1].players.length;
          i++
        ) {
          if (
            auth.currentUser.displayName ==
            roomDetails.games[roomDetails.games.length - 1].players[i].player
          ) {
            curPoints = roomDetails.games[roomDetails.games.length - 1].players[i].score;
            setCurrentPoints(
              roomDetails.games[roomDetails.games.length - 1].players[i].score
            );
          }
        }
        if (
          roomDetails.games[roomDetails.games.length - 1].match.length ===
          roomDetails.games[roomDetails.games.length - 1].settings.rounds
        ) {
          try {
            console.log(roomDetails.games[roomDetails.games.length - 1].players)
            var playerWin = null;
            var playerLosersList = [];
            for (var i = 0; i < roomDetails.games[roomDetails.games.length - 1].players.length; i++) {
              if (playerWin === null) {
                playerWin = roomDetails.games[roomDetails.games.length - 1].players[i];
              } else if (playerWin) {
                if (playerWin.score < roomDetails.games[roomDetails.games.length - 1].players[i].score) {
                  playerLosersList.push(playerWin);
                  playerWin = roomDetails.games[roomDetails.games.length - 1].players[i];
                } else {
                  playerLosersList.push(roomDetails.games[roomDetails.games.length - 1].players[i]);
                }
              }
            }
            const data = {
              winner: {
                user: playerWin.player,
                points: curPoints,
              },
              losers : playerLosersList,
              timestamp: serverTimestamp()
            };
            if (data.winner.user == auth.currentUser.displayName) {
              setDoc(doc(database, "results", generateID()), data);
            }
            console.log("Result saved successfully!");
          } catch (error) {
            console.error("Error saving result: ", error);
          }
          navigation.navigate("GameResult");
        }
      }
    });
  }

  useEffect(() => {
    checkRound();
    return () => {
      socket.removeAllListeners("nextRound");
    };
  }, [socket]);

  useEffect(() => {
    canvas.current.deletePath(currentPathId);
    canvas.current.addPath({
      drawer: "user1",
      size: {
        width: Math.round(Dimensions.get("window").width),
        height: Math.round(Dimensions.get("window").height),
      },
      path: {
        id: currentPathId,
        color: "black",
        width: 5,
        data: currentPath,
      },
    });
  }, [currentPath, currentPathId]);

  const createSocketEvent = (eventName, payload) => {
    socket.emit("draw", { roomDetails, pathPayload: { eventName, payload } });
  };

  useEffect(() => {
    socket.on("draw", (event) => {
      if (
        !(
          gameConfig[gameConfig.length - 1].artist ==
          auth.currentUser.displayName
        ) ||
        event.eventName === DrawingEvents.CLEAR_BOARD
      )
        actionBasedOnEvents(event);
    });
    return () => {
      socket.removeAllListeners("draw");
    };
  }, [socket]);

  const coordinatesToPathDataString = (xy) => {
    return `${xy.x},${xy.y}`;
  };

  function actionBasedOnEvents(event) {
    switch (event.eventName) {
      case DrawingEvents.CLEAR_BOARD: {
        canvas.current.clear();
        setCurrentPath([]);
        setCurrentPathId(0);
        setPathIds([]);
        return;
      }
      case DrawingEvents.START_DRAWING: {
        setCurrentPathId(event.payload.pathId);
        setCurrentPath([event.payload.xy]);
        setPathIds((pathIds) => [...pathIds, event.payload.pathId]);
        return;
      }
      case DrawingEvents.DRAWING: {
        setCurrentPath((currentPath) => [...currentPath, event.payload.xy]);
        return;
      }
      case DrawingEvents.STOP_DRAWING: {
        return;
      }
      default:
        return;
    }
  }

  function clearBoard() {
    createSocketEvent(DrawingEvents.CLEAR_BOARD, {});
  }

  const drawStartEvent = (x, y) => {
    const pathId = pathIds.length + 1;
    setCurrentPathId(pathId);
    setPathIds((pathIds) => [...pathIds, pathId]);
    createSocketEvent(DrawingEvents.START_DRAWING, {
      xy: coordinatesToPathDataString({ x, y }),
      pathId,
    });
  };

  const drawEvent = (x, y) => {
    createSocketEvent(DrawingEvents.DRAWING, {
      xy: coordinatesToPathDataString({ x, y }),
      currentPathId,
    });
  };

  const drawEndEvent = (event) => {
    createSocketEvent(DrawingEvents.STOP_DRAWING, { currentPathId });
  };

  function checkGuess({ nativeEvent }) {
    setInputWord('');
    const { text } = nativeEvent;
    const wordToGuess = gameConfig[gameConfig.length - 1].word;

    const distance = levenshteinDistance(
      text.toLowerCase(),
      wordToGuess.toLowerCase()
    );

    if (distance < 3) {
      setCheckText(CheckWordResult.CLOSE);
      setTimeout(() => {
        setCheckText(null);
      }, 2000);
    }

    if (distance >= 3) {
      setCheckText(CheckWordResult.NOT_CLOSE);
      setTimeout(() => {
        setCheckText(null);
      }, 2000);
    }

    socket.emit(
      "guessWord",
      roomDetails,
      text.toLowerCase(),
      auth.currentUser.displayName
    );

  }

  function timeOut() {
    socket.emit(
      "timeOut",
      roomDetails,
      auth.currentUser.displayName
    );
    timer();
  }

  function levenshteinDistance(str1, str2) {
    const dp = Array.from(Array(str1.length + 1), () =>
      Array(str2.length + 1).fill(0)
    );

    for (let i = 0; i <= str1.length; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }

    return dp[str1.length][str2.length];
  }
  

  return (
    <ImageBackgroundContainer>
      <View style={styles.container}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#d1cbcb",
          }}
        >
          <View style={styles.headers}>
            {gameConfig[gameConfig.length - 1].artist ==
            auth.currentUser.displayName ? (
              <Text style={styles.headerText}>
                Draw: {gameConfig[gameConfig.length - 1].word}
              </Text>
            ) : (
              <Text style={styles.headerText}>
                {`Guess: ${gameConfig[gameConfig.length - 1].word.length}`}
              </Text>
            )}
          </View>
          <View style={styles.headers}>
            <Text
              style={styles.headerText}
            >{`Round: ${gameConfig.length}`}</Text>
          </View>
          <View style={styles.headers}>
            <Text style={styles.headerText}>{`Points: ${currentPoints}`}</Text>
          </View>
          <View style={styles.headers}>
            <Text style={styles.headerText}>{`Timer: ${remainingTime}`}</Text>
          </View>
        </View>
        <Animated.View />
        <View style={{ flex: 1, flexDirection: "row" }}>
          <SketchCanvas
            ref={canvas}
            style={{ flex: 1 }}
            strokeColor={"black"}
            strokeWidth={5}
            onStrokeStart={drawStartEvent}
            onStrokeChanged={drawEvent}
            onStrokeEnd={drawEndEvent}
            touchEnabled={
              gameConfig[gameConfig.length - 1].artist ==
              auth.currentUser.displayName
            }
          />
          <Text
            style={{
              color: checkText === CheckWordResult.CLOSE ? "orange" : "red",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            {checkText}
          </Text>
        </View>
        {gameConfig[gameConfig.length - 1].artist ==
        auth.currentUser.displayName ? (
          <ClearBoardButton onPress={clearBoard} />
        ) : (
          <TextInput
            style={{
              backgroundColor: "#d9d5d4",
              width: "100%",
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              letterSpacing: 2,
            }}
            value={inputWord}
            autoCapitalize="characters"
            autoCorrect={false}
            autoCompleteType="off"
            placeholder="Any guesses??"
            editable={disableTextInput}
            onChangeText={(text) => setInputWord(text)}
            onSubmitEditing={checkGuess}
          />
        )}
      </View>
    </ImageBackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  headers: {
    flex: 1,
    borderRadius: 1,
    borderColor: "#000",
    backgroundColor: "#326BA6",
    padding: 10,
  },
  headerText: {
    textAlign: "center",
    fontSize: 20,
    color: "white",
  },
  textCheckWord: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 400,
    justifyContent: "center",
    alignItems: "center",
  },
});
