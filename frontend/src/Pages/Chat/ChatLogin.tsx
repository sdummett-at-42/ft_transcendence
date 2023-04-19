// import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { useState, useEffect } from 'react';
import ChatroomList from "./ChatroomList";
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.scss"
import { socket } from "./Socket";
import { createContext, useContext } from "react";

export const DatabaseContext = createContext();

export default function ChatLogin() {
  const [roomName, setRoomName] = useState(null);
  const [userId, setUserId] = useState(0);
  const [database, setDatabase] = useState([]);
  const [shouldUpdateDatabase, setShouldUpdateDatabase] = useState(false);
  const [ifsocket, setIfSocket] = useState(true);
  const [ifDM, setIfDM] = useState(false);
  const [toDMID, setToDMID] = useState({ id: 0, name: "" });
  const [ifDataReady, setifDataReady] = useState(false);

  const handleUpdateDatabase = async () => {
    await fetch("http://localhost:3001/users/", {
      method: "GET",
      credentials: "include"
    })
      .then((response) => response.json())
      .then(json => {
        setDatabase(json);
      });
  };

  const handleListClick = (name, id, ifDM) => {
    // console.log("here? ifdm", ifDM)
    // console.log("List:",name, id);
    setToDMID({ id: id, name: name });
    setRoomName(name);
    if (ifDM == true)
      setIfDM(true);
    else
      setIfDM(false);
    if (ifDM == false) {
      const payload = {
        roomName: name, // if i use state of roomName, the emit will delay
      }
      socket.emit("getRoomMsgHist", payload);
    }
    else {
      const payload = {
        userId: id, // if i use state of roomName, the emit will delay
      }
      socket.emit("getDmHist", payload);
    }
  }
  const handleLeaveRoom = () => {
    const confirmed = window.confirm("Are you sure you want leave this room?");
    if (confirmed) {
      const payload = {
        roomName: roomName,
      }
      socket.emit("leaveRoom", payload);
      setRoomName("");
    }
  };

  const handleChildComponentUpdate = () => {
    setShouldUpdateDatabase(true);
  };

  useEffect(() => {
    if (shouldUpdateDatabase) {
      handleUpdateDatabase();
    }
  }, [shouldUpdateDatabase]);

  useEffect(() => {
    const fetchData = async () => {

      await fetch("http://localhost:3001/users/", {
        method: "GET",
        credentials: "include"
      })
        .then((response) => response.json())
        .then(json => {
          setDatabase(json);
          setifDataReady(true);
        });
    };
    fetchData();
    // console.log("fetch database 1", database);
  }, []);

  useEffect(() => {
    const fetchData = async () => {

      await fetch("http://localhost:3001/users/me", {
        method: "GET",
        credentials: "include"
      })
        .then((response) => response.json())
        .then(json => {
          setUserId(json.id);
        });
    };
    fetchData();
  }, []);

  useEffect(() => {
    function onConnect(payload) {
      // setIfSocket(true)
      console.log("connected socket!");
      socket.emit("getUserRooms");
      socket.emit("getDmsList");
    }

    function onDisconnect() {
      setIfSocket(false)
      console.log("connected socket NOT");
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on("memberListUpdated", handleUpdateDatabase);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off("memberListUpdated", handleUpdateDatabase);
    };
  }, [socket, handleUpdateDatabase]);

  if (ifsocket == false) {
    return <div>Connecting to server...</div>;
  } else {
    return (
      <div >
        <div className="containerhere containerhere clearfix">
          <div className="row">
            <DatabaseContext.Provider value={database}>
              <ChatroomList socket={socket} onListClick={handleListClick} onUpdate={handleChildComponentUpdate} ifDM={ifDM} toDMID={toDMID} ifDataReady={ifDataReady} />
              <Message socket={socket} roomName={roomName} ifDM={ifDM} toDMID={toDMID} onQuit={handleLeaveRoom} UserId={userId} onUpdate={handleChildComponentUpdate} />
              <RoomDetail socket={socket} onListClick={handleListClick} roomName={roomName} onUpdate={handleChildComponentUpdate} UserId={userId} ifDM={ifDM} />
            </DatabaseContext.Provider>
          </div>
        </div>
      </div>
    );
  }
};
