const express = require("express");
const app = express();
const PORT = 4000;

const words = [
  "Apple",
  "Strawberry",
  "Toothbrush",
  "Lemon",
  "Sea",
  "Toothpaste",
  "Rainbow",
  "Bed",
  "Game",
  "Bee",
  "Lemon",
  "Eraser",
  "Water",
  "Bubble",
  "Vampire",
  "Run",
  "Ocean",
  "Hair",
  "Cry",
  "Ear",
  "Tears",
  "Cat",
  "Sleep",
  "Sharpener",
  "Whisk",
  "Cupcake",
  "Bat",
  "Hat",
  "Drink",
  "Rat",
  "Battery",
];

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const generateID = () => Math.random().toString(36).substring(2, 10);

let rooms = [];

app.get("/api", (req, res) => {
  res.json(rooms);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "<http://localhost:3000>",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socketIO.emit("roomsList", rooms);

  socket.on("createRoom", (roomName, user) => {
    const data = {
      id: generateID(),
      name: roomName,
      host: user,
      users: [user],
      messages: [],
      games: [],
    };
    socket.join(roomName);
    rooms.push(data);
    socketIO.emit("roomsList", rooms);
  });

  socket.on("findRoom", (id, name, user) => {
    if (id && user) {
      for (const room of rooms) {
        if (room.users.includes(user)) {
          socket.leave(room.name);
          room.users.splice(room.users.indexOf(user), 1);
        }
      }
      socket.join(name);
      console.log(`${user} joined the room ${id}.`);
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].id == id) {
          index = i;
        }
      }
      if (rooms[index] && !rooms[index].users.includes(user)) {
        rooms[index].users.push(user);
      }
      socketIO.to(name).emit("foundRoom", rooms[index]);
    }
  });

  socket.on("newMessage", (data) => {
    const { room_id, message, user, timestamp } = data;
    const targetRoom = rooms.find((room) => room.id == room_id);
    if (targetRoom) {
      const newMessage = {
        id: generateID(),
        text: message,
        user,
        time: `${timestamp.hour}:${timestamp.mins}`,
      };
      socket.to(targetRoom.name).emit("roomMessage", newMessage);
      targetRoom.messages.push(newMessage);
      socket.emit("roomsList", rooms);
      socket.emit("foundRoom", targetRoom.messages);
    }
  });

  socket.on("draw", ({ roomDetails, pathPayload }) => {
    socketIO.to(roomDetails.name).emit("draw", pathPayload);
  });

  socket.on("startGame", (roomDetails) => {
    const randomUserIndex = Math.floor(
      Math.random() * roomDetails.users.length
    );
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const playersList = roomDetails.users.map((user) => ({
      player: user,
      score: 0,
      winner: 0
    }));
    const newGame = {
      id: generateID(),
      players: playersList,
      settings: { time: 60, rounds: 4 },
      match: [
        {
          round: 1,
          artist: playersList[randomUserIndex].player,
          word: randomWord,
          totalDuration: 60,
        },
      ],
    };
    const targetRoom = rooms.find((room) => room.id === roomDetails.id);
    if (targetRoom) {
      targetRoom.games.push(newGame);
      socketIO.to(roomDetails.name).emit("startGameResponse", targetRoom);
    }
  });

  socket.on("guessWord", (roomDetails, word, user) => {
    const targetRoom = rooms.find((room) => room.id === roomDetails.id);
    if (targetRoom) {
      const currentGame = targetRoom.games[targetRoom.games.length - 1];
      const currentMatch = currentGame.match[currentGame.match.length - 1];
      if (word === currentMatch.word.toLowerCase()) {
        const player = currentGame.players.find(
          (player) => player.player === user
        );
        if (player) player.score += 1;
        if (currentGame.settings.rounds > currentGame.match.length) {
          const randomUser =
            targetRoom.users[
              Math.floor(Math.random() * targetRoom.users.length)
            ];
          const randomWord = words[Math.floor(Math.random() * words.length)];
          const newRound = {
            round: currentGame.match.length + 1,
            artist: randomUser,
            word: randomWord,
            totalDuration: currentGame.settings.time,
          };
          currentGame.match.push(newRound);
          socketIO
            .to(roomDetails.name)
            .emit("draw", { eventName: "CLEAR_BOARD" });
          socketIO
            .to(roomDetails.name)
            .emit("nextRound", { status: "SUCCESS", payload: targetRoom });
        } else {
          socketIO
            .to(roomDetails.name)
            .emit("nextRound", { status: "SUCCESS", payload: targetRoom });
        }
      } else {
        
        socketIO
          .to(roomDetails.name)
          .emit("nextRound", { status: "FAILED", payload: targetRoom });
      }
    }
  });

  socket.on("timeOut", (roomDetails, user) => {
    const targetRoom = rooms.find((room) => room.id === roomDetails.id);
    if (targetRoom) {
      const currentGame = targetRoom.games[targetRoom.games.length - 1];
      const currentMatch = currentGame.match[currentGame.match.length - 1];
      const player = currentGame.players.find(
        (player) => player.player === user
      );
      if (currentGame.settings.rounds > currentGame.match.length) {
        const randomUser =
          targetRoom.users[
            Math.floor(Math.random() * targetRoom.users.length)
          ];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const newRound = {
          round: currentGame.match.length + 1,
          artist: randomUser,
          word: randomWord,
          totalDuration: currentGame.settings.time,
        };
        currentGame.match.push(newRound);
        socketIO
          .to(roomDetails.name)
          .emit("draw", { eventName: "CLEAR_BOARD" });
        socketIO
          .to(roomDetails.name)
          .emit("nextRound", { status: "SUCCESS", payload: targetRoom });
      } else {
        socketIO
          .to(roomDetails.name)
          .emit("nextRound", { status: "SUCCESS", payload: targetRoom });
      }
    }
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log(`🔥: ${socket.id} user disconnected!`);
  });
});
