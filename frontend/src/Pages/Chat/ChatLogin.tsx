// import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { useState, useEffect,useCallback, useContext } from 'react';
import ChatroomList from "./ChatroomList";
import Message from './Message';
import RoomDetail from "./RoomDetail";
import "./chat.scss"
import { createContext } from "react";
import { io } from "socket.io-client";
import Cookies from 'js-cookie';
import { useParams } from "react-router-dom";
import { UserContext } from "./../../context/UserContext"
import { useNavigate } from "react-router-dom";
export const DatabaseContext = createContext();



let socket;

export default function ChatLogin() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState(null);
  const [myUserId, setMyUserId] = useState(0);
  const [database, setDatabase] = useState([]);
  const [shouldUpdateDatabase, setShouldUpdateDatabase] = useState(false);
  const [ifsocket, setIfSocket] = useState(false);
  const [ifDM, setIfDM] = useState(false);
  const [toDMID, setToDMID] = useState({ id: 0, name: "" });
  const [ifDataReady, setifDataReady] = useState(false);
  const [blockList, setBlockList] = useState([]);
  const { userId, userName } = useParams();
  const { user, gameSocketRef } = useContext(UserContext);
  

  
  const handleGetInvitationGame = (data : {player : number, you : number, type : string}) => {
    console.log('handleGetInvitationGame');

    const senderId : number = data.player;
    const typeGame : string = data.type; // "ranked" | "custom"
    const yourId : number = data.you;

    const res : Boolean = false;

    // refuse :
    // if ()
      gameSocketRef.current.emit('reponseInvitationGame', {p1 : senderId, p2 : yourId, res : false});

    // accepte
    // if () 
      gameSocketRef.current.emit('reponseInvitationGame', {p1 : senderId, p2 : yourId, res : false});
    
  }

  // after agree client go in game
  const handlegoInGame = (data : string) => {
    console.log('handlegoInGame');
    navigate(`/game/${data}`);
  }

  // send to initial sender if target doesn't accept
  const handleRefuseInvitationGame = (data : number) => {
    console.log('handleRefuseInvitationGame');
    const userId = data;

    // userId a refuser ou n'est pas disponible pour une game
  }

  // when client click en button to send invitation use:
  // gameSocketRef.current.emit('sendInvitationGame', idTarget : number);


  // Handle the socket events
  useEffect(() => {

    gameSocketRef.current.on('getInvitationGame', handleGetInvitationGame);
    gameSocketRef.current.on('goInGame', handlegoInGame);
    gameSocketRef.current.on('refuseInvitationGame', handleRefuseInvitationGame);
    return () => {
      gameSocketRef.current.off('getInvitationGame', handleGetInvitationGame);
      gameSocketRef.current.off('goInGame', handlegoInGame);
      gameSocketRef.current.off('refuseInvitationGame', handleRefuseInvitationGame);

    };
   }, [
    handleGetInvitationGame,
    handlegoInGame,
    handleRefuseInvitationGame,
    gameSocketRef
  ]);

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
    console.log("List:",name, id, ifDM);
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

  const handleBlockList = useCallback((payload) =>{
    console.log("handleBlockList", payload);
    setBlockList(payload.list);
},[blockList])

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
          setMyUserId(json.id);
        });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("memberListUpdated", handleUpdateDatabase);
    }
    return () => {
      if (socket) {
        socket.off("memberListUpdated", handleUpdateDatabase);
      }
    };
  }, [socket, handleUpdateDatabase]);

  useEffect(() =>{
    console.log("outside", typeof(userId), userName);
    setRoomName(userName);
    setIfDM(true);
    setToDMID({id :Number(userId), name: userName});

  },[])

  useEffect(() => {
    socket = io("http://localhost:3001", {
      auth: {
        token: Cookies.get('connect.sid')
      }
    });
    socket.on('connect', () => {
      setIfSocket(true)
      socket.emit("getUserRooms");
      socket.emit("getDmsList");
      socket.emit("getBlockList");
      console.log('Socket connected');
    });
    socket.on('disconnect', () => {
      setIfSocket(false)
      console.log('Socket disconnected');
    });
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    if (socket){
      socket.on('userBlockList',handleBlockList);
    }
    return()=>{
      if (socket){
        socket.off('userBlockList',handleBlockList);
      }
    }
  },[handleBlockList]);

  if (ifsocket == false) {
    return <div>Connecting to server...</div>;
  } else {
    return (
      <div className="Chat-body">
        <div className="containerhere containerhere clearfix">
          <div className="row">
            <DatabaseContext.Provider value={database}>
              <ChatroomList socket={socket} onListClick={handleListClick} onUpdate={handleChildComponentUpdate} ifDM={ifDM} toDMID={toDMID} ifDataReady={ifDataReady} />
              <Message socket={socket} roomName={roomName} ifDM={ifDM} toDMID={toDMID} onQuit={handleLeaveRoom} UserId={myUserId} onUpdate={handleChildComponentUpdate} />
              <RoomDetail socket={socket} onListClick={handleListClick} roomName={roomName} onUpdate={handleChildComponentUpdate} UserId={myUserId} ifDM={ifDM} blockList={blockList}/>
            </DatabaseContext.Provider>
          </div>
        </div>
      </div>
    );
  }
};
