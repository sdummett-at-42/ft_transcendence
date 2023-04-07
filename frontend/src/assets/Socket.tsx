import { io } from "socket.io-client";
import Cookies from 'js-cookie';

export const socket = io("http://localhost:3001", {
    auth: {
      token: Cookies.get('connect.sid')
    }
});