import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { useState , useEffect } from 'react';
import ChatroomList from "./ChatroomList";
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.css"
import "./chat.scss"
import { socket } from "./Socket";
import { createContext, useContext } from "react";

export const DatabaseContext = createContext();

export default function ChatLogin() {
  const [selectedList, setSelectedList] = useState(null);
  const [userId, setUserId] = useState(0);
  const [database, setDatabase] = useState([]);
  const [shouldUpdateDatabase, setShouldUpdateDatabase] = useState(false);

  useEffect(() => {
    const fetchData = async () => {

      await fetch("http://localhost:3001/users/", {
          method: "GET",
          credentials: "include"
      })
          .then((response) => response.json())
          .then(json => {
              setDatabase(json);
          });
    };
    fetchData();
    // console.log("database", database);
  }, [socket]);

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

  const handleListClick = (list) => {
    console.log("List:",list);
    setSelectedList(list);
    const payload = {
      roomName: selectedList,
    }
    socket.emit("getRoomMsgHist", payload);
  }
  const handleLeaveRoom = () => {
      const confirmed = window.confirm("Are you sure you want leave this room?");
      if (confirmed) {
        console.log("good bye~~~~", selectedList);
        const payload = {
          roomName : selectedList,
        }
        socket.emit("leaveRoom", payload);
        setSelectedList("");
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

  useEffect(()=>{
    console.log("here????");
    const fetchData = async () => {

      await fetch("http://localhost:3001/users/me", {
          method: "GET",
          credentials: "include"
      })
          .then((response) => response.json())
          .then(json => {
              setUserId(json.id);
              console.log("SearchBar:",  typeof(json.id));
          });
    };
    fetchData();
  }, []);

    useEffect(() => {
      function onConnect(payload) {
        console.log("connected socket!");
      }
  
      function onDisconnect() {
        console.log("connected socket NOT");
      }
  
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
  
      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    }, [socket]);

    if (!socket) {
      return <div>Connecting to server...</div>;
    } else {
    return (
      <div >
        <div className="containerhere clearfix">
          <div className="row">
            <DatabaseContext.Provider value={database}>
              <ChatroomList socket={socket}  onListClick={handleListClick} />
              <Message socket={socket} selectedList={selectedList} onQuit={handleLeaveRoom} UserId = {userId} onUpdate={handleChildComponentUpdate}/>
              <RoomDetail socket={socket} selectedList={selectedList} onUpdate={handleChildComponentUpdate}/>
            </DatabaseContext.Provider>
      </div>
      </div>
    </div>
    );
  }
};
