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
	kickUser = "kickUser",
	userKicked = "userKicked",
	userNotKicked = "userNotKicked",
	banUser = "banUser",
	userBanned = "userBanned",
	userNotBanned = "userNotBanned",
	unbanUser = "unbanUser",
	userUnbanned = "userUnbanned",
	userNotUnbanned = "userNotUnbanned",
	muteUser = "muteUser",
	userMuted = "userMuted",
	userNotMuted = "userNotMuted",
	unmuteUser = "unmuteUser",
	userUnmuted = "userUnmuted",
	userNotUnmuted = "userNotUnmuted",
	inviteUser = "inviteUser",
	userInvited = "userInvited",
	userNotInvited = "userNotInvited",
	sendMsg = "sendMsg",
	msgSended = "msgSended",
	msgNotSended = "msgNotSended",
	logout = "logout",
	dataError = "dataError",
	connected = "connected",
	notConnected = "notConnected",
	userJoined = "userJoined",
	userLeft = "userLeft",
}