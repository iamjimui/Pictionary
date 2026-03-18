import { io } from "socket.io-client";
import { IP_COMPUTER } from "@env";

const socket = io.connect(`http://${IP_COMPUTER}:4000/`);
export default socket;
