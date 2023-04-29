import { io } from "socket.io-client";
import Cookies from 'js-cookie';

export const socket = io(`${import.meta.env.VITE_BACKENDURL}/friends`, {
    auth: {
      token: Cookies.get('connect.sid')
    }
});