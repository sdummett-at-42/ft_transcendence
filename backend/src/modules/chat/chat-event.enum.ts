export enum Event {
	createRoom = "createRoom",
	roomCreated = "roomCreated",
	roomNotCreated = "roomNotCreated",
	updateRoom = "updateRoom",
	roomUpdated = "roomUpdated",
	roomNotUpdated = "roomNotUpdated",
	joinRoom = "joinRoom",
	roomJoined = "roomJoined",
	roomNotJoined = "roomNotJoined",
	leaveRoom = "leaveRoom",
	roomLeft = "roomLeft",
	roomNotLeft = "roomNotLeft",
	addRoomAdmin = "addRoomAdmin",
	roomAdminAdded = "roomAdminAdded",
	roomAdminNotAdded = "roomAdminNotAdded",
	removeRoomAdmin = "removeRoomAdmin",
	roomAdminRemoved = "roomAdminRemoved",
	roomAdminNotRemoved = "roomAdminNotRemoved",
	giveRoomOwnership = "giveRoomOwnership",
	roomOwnershipGived = "roomOwnershipGived",
	roomOwnershipNotGived = "roomOwnershipNotGived",
	granted = "granted",
	demoted = "demoted",
	kickUser = "kickUser",
	userKicked = "userKicked",
	userNotKicked = "userNotKicked",
	kicked = "kicked",
	banUser = "banUser",
	userBanned = "userBanned",
	userNotBanned = "userNotBanned",
	banned = "banned",
	unbanUser = "unbanUser",
	userUnbanned = "userUnbanned",
	userNotUnbanned = "userNotUnbanned",
	unbanned = "unbanned",
	muteUser = "muteUser",
	userMuted = "userMuted",
	userNotMuted = "userNotMuted",
	muted = "muted",
	unmuteUser = "unmuteUser",
	userUnmuted = "userUnmuted",
	userNotUnmuted = "userNotUnmuted",
	unmuted = "unmuted",
	inviteUser = "inviteUser",
	userInvited = "userInvited",
	userNotInvited = "userNotInvited",
	uninviteUser = "uninviteUser",
	userUninvited = "userUninvited",
	userNotUninvited = "userNotUninvited",
	invited = "invited",
	sendRoomMsg = "sendRoomMsg",
	roomMsgReceived = "roomMsgReceived",
	roomMsgNotSended = "roomMsgNotSended",
	logout = "logout",
	dataError = "dataError",
	connected = "connected",
	notConnected = "notConnected",
	memberListUpdated = "memberListUpdated",
	getRoomsList = "getRoomsList",
	roomsListReceived = "roomsListReceived",
	blockUser = "blockUser",
	userBlocked = "userBlocked",
	userNotBlocked = "userNotBlocked",
	unblockUser = "unblockUser",
	userUnblocked = "userUnblocked",
	userNotUnblocked = "userNotUnblocked",
	getRoomMsgHist = "getRoomMsgHist",
	roomMsgHistNotReceived = "roomMsgHistNotReceived",
	roomMsgHistReceived = "roomMsgHistReceived",
	sendDM = "sendDM",
	DMNotSended = "DMNotSended",
	DMReceived = "DMReceived",
	unreadNotif = "unreadNotif",
	notifRead = "notifRead",
	getUserRooms = "getUserRooms",
	userRooms = "userRooms",
	getDmsList = "getDmsList",
	dmsList = "dmsList",
}