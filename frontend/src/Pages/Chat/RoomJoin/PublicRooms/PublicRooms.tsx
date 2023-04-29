import React, { useState, useEffect } from "react";
import "./PublicRooms.css";
// the component will emit joinRoom event to the server

export default function PublicRooms({ socket }) {
	const [rooms, setRooms] = useState([]);

	// emit via the socket the event "getRoomsList"
	useEffect(() => {
		socket.emit("getRoomsList");
	}, [socket]);

	useEffect(() => {
		socket.on("roomsListReceived", handleRoomsList);
		return () => {
			socket.off("roomsListReceived", handleRoomsList);
		};
	}, [socket]);

	const handleRoomsList = ({ roomsList }) => {
		// {"roomsList":[{"roomName":"PUBLICCC","protected":false}]}}
		setRooms(roomsList);
	};

	return (
		<div className="rooms-list">
			<div className="rooms-list-header">
				<h3>Salons publics</h3>
			</div>
			{/*/ create a div that iterate through rooms and print each room name and visibilty*/}
			<div className="rooms">
				{rooms.map((room, i) => (
					<div key={i} className="room">
						<div className="room-name">{room.roomName}</div>
						<div className="room-visibility">
							{room.protected ? "Protege" : "Public"}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
