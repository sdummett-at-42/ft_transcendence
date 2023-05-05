import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import "./chat.scss"
import ChatroomList from "./ChatRoomList/ChatroomList";
import Message from './Message/Message';
import RoomDetail from "./RoomDetail/RoomDetail";
import Cookies from 'js-cookie';
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import Invitation from "../Invitation/Invitation";
import Blob from "../Blob/Blob";

export const DatabaseContext = createContext();

let socket;

export default function ChatLogin() {
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

  const handleUpdateDatabase = async () => {
    await fetch(`${import.meta.env.VITE_BACKENDURL}/users/`, {
      method: "GET",
      credentials: "include"
    })
      .then((response) => {
		if (response.status == 401) {
			window.location.href = "/";
			return null;
		}
		return response.json()
	})
      .then(json => {
        setDatabase(json);
      });
  };

  const handleListClick = (name, id, ifDM) => {
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
    setBlockList(payload.list);
},[blockList])

  useEffect(() => {
    if (shouldUpdateDatabase) {
      handleUpdateDatabase();
    }
  }, [shouldUpdateDatabase]);

  useEffect(() => {
      const fetchData = async () => {
          await fetch(`${import.meta.env.VITE_BACKENDURL}/users/`, {
              method: "GET",
              credentials: "include"
          })
          .then((response) => {
			if (response.status == 401) {
				window.location.href = "/";
				return null;
			}
			return response.json()
		})
          .then(json => {
              setDatabase(json);
              setifDataReady(true);
          });
      };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
		try {
			await fetch(`${import.meta.env.VITE_BACKENDURL}/users/me`, {
			  method: "GET",
			  credentials: "include"
			})
			  .then((response) => {
				  if (response.status == 401) {
					  window.location.href = "/";
					  return null;
				  }
				  return response.json()
			  })
			  .then(json => {
				setMyUserId(json.id);
			  });

		} catch (error) {}

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


  useEffect(() => {
    socket = io(`${import.meta.env.VITE_BACKENDURL}`, {
      auth: {
        token: Cookies.get('connect.sid')
      }
    });
    socket.on('connect', () => {
      setIfSocket(true)
      socket.emit("getUserRooms");
      socket.emit("getDmsList");
      socket.emit("getBlockList");
    });
    if (userName){
      setRoomName(userName);
      setIfDM(true);
      setToDMID({id :Number(userId), name: userName});
      const payload = {
        userId: Number(userId), // if i use state of roomName, the emit will delay
      }
      socket.emit("getDmHist", payload);
    }
    socket.on('disconnect', () => {
      setIfSocket(false)
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
			<Blob />
          <div className="Chat-container">
            <DatabaseContext.Provider value={database}>
              <ChatroomList socket={socket} onListClick={handleListClick} onUpdate={handleChildComponentUpdate} ifDM={ifDM} toDMID={toDMID} ifDataReady={ifDataReady} />
              <Message socket={socket} roomName={roomName} ifDM={ifDM} toDMID={toDMID} onQuit={handleLeaveRoom} UserId={myUserId} onUpdate={handleChildComponentUpdate} />
              <RoomDetail socket={socket} onListClick={handleListClick} roomName={roomName} onUpdate={handleChildComponentUpdate} UserId={myUserId} ifDM={ifDM} blockList={blockList}/>
            </DatabaseContext.Provider>
            <Invitation />
          </div>
      </div>
    );
  }
};
