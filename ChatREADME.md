
# Chat Room Websocket Documentation
We used socket.io.

## Events table
| Events received by the server | Event emitted to the targeted room| Event emitted to the socket sender| Event emitted to all the sockets of the targeted user|
|-|-|-|-|
|`createRoom`||`roomNotCreated` `roomCreated`|`roomJoined`|
|`updateRoom`||`roomNotUpdated` `roomUpdated`||
|`joinRoom`|`memberListUpdated`|`roomNotJoined` |`roomJoined`|
|`leaveRoom`|`memberListUpdated`|`roomNotLeft`|`roomLeft`|
|`addRoomAdmin`|`memberListUpdated`|`roomAdminNotAdded` `roomAdminAdded`|`granted`|
|`removeRoomAdmin`|`memberListUpdated`|`roomAdminNotRemoved` `roomAdminRemoved`|`demoted`|
|`giveRoomOwnership`|`memberListUpdated`|`roomOwnershipNotGived` `roomOwnershipGived`|`granted`|
|`kickUser`|`memberListUpdated`|`userNotKicked` `userKicked`|`kicked`|
|`banUser`|`memberListUpdated`|`userNotBanned` `userBanned`|`banned`|
|`unbanUser`|`memberListUpdated`|`userNotUnbanned` `userUnbanned`|`unbanned`|
|`muteUser`||`userNotMuted` `userMuted`|`muted`|
|`unmuteUser`||`userNotUnmuted` `userUnmuted`|`unmuted`|
|`blockUser`||`userNotBlocked` `userBlocked`||
|`unblockUser`||`userNotUnblocked` `userUnblocked`||
|`inviteUser`||`userNotInvited` `userInvited`|`invited`|
|`uninviteUser`||`userNotUnvited` `userUninvited`||
|`sendRoomMsg`|`roomMsgReceived`|`roomMsgNotSended`||
|`getRoomsList`||`roomsListReceived`||

When the following events succeed `joinRoom`, `leaveRom`, `addRoomAdmin`, `removeRoomAdmin`, `giveRoomOwnership`, `kickUser`, `banUser`, `unbanUser`, `muteUser`, `unmuteUser`, a message using `roomMsgReceived` is sended to the room by the server with the field `userId = -1`, to notify the room on what happened.  

## Data fields
Fields received alongside with an emitted event to the server:    
- `roomName` must be between **`1`** and **`32`** characters.  
- `visibility` must be either **`public`** or **`private`**.  
- `timeout` must be between **`30`** secs to **`1260`** secs (21mins).  
- `message` must be between **`1`** to **`150`** characters.  
- `password` can be an empty string or maximum **`32`** characters.  
  
Also all the `timestamp` fields is filled with a Date that is in ISO format.  

## Others

#### `connected`
```typescript
{ message: string }
```
The user socket is successfully connected.

#### `notConnected`
```typescript
{ message: string }
```
The socket has been disconnected for some reason.
For example the user isn't logged.

#### `dataError`
```typescript
{ message: string }
```
When emitting an event to the server, if the payload validation failed, this event is returned back to the client.  
The returned message explain why the validation of the data has failed.

---

## Events received by the server
#### `logout`
Disconnect all the connected sockets of a user (only the current session ?).

#### `createRoom`
```typescript
{ roomName: string, visibility: string, password: string }
```
Create a room that can be either private/public and/or password protected or not.  
On failure, `roomNotCreated` is sent to the socket that triggered the event.  
On success:
- `roomCreated` is sent to the socket that triggered the event.
- `joined`is sent to all the active sockets of the user that created the room.  

#### `updateRoom`
```typescript
{ roomName: string, visibility: string, password: string }
```
Updates a room by changing the visibility and/or the password.  
On failure, `roomNotUpdated` is sent to the socket that triggered the event.  
On success, `roomUpdated` is sent to the socket that triggered the event.  
*The user must be the **owner** of the room to succeed.*  

#### `joinRoom`
```typescript
{ roomName: string, password: string}
```
Attempt to join an existing room.  
On failure, `roomNotJoined` is sent to the socket that triggered the event.  
On success:
 - `roomJoined` is sent to the socket that triggered the event 
 - `joined` is sent to all the active sockets of the user.
 - `userJoined` is sent to the room.  

#### `leaveRoom`
```typescript
{ roomName: string }
```
Leave a room, if the leaver is the owner then a new owner is set. If no more user is in the room then the room is destroyed.  
On failure, `roomNotLeft` is sent to the socket that triggered the event.  
On success:
- `roomLeft` is sent to all the active sockets of the user.
-  `userLeft` is sent to the room.  

#### addRoomAdmin
```typescript
{ roomName: string, userId: string }
```
Give a member the admin title.  
On failure, `roomAdminNotAdded` is sent to the socket that triggered the event.  
On success:
 - `roomAdminAdded` is sent to the socket that triggered the event.
 - `granted` is sent to the all the active sockets of the user that has been added to the admin list.  
 - `memberListUpdated` is sent to the room.
*The user must be the **owner** of the room to succeed.*  

#### `removeRoomAdmin`
```typescript
{ roomName: string, userId: number }
```
Remove the admin title to a member.  
On failure, `roomAdminNotRemoved` is sent to the socket that triggered the event.  
On success:
 - `roomAdminRemoved` is sent to the socket that triggered the event 
 - `demoted` is sent to all the active sockets of the user that has been demoted to a normal member.
 - `memberListUpdated` is sent to the room.  
*The user must be the **owner** of the room to succeed.*  

#### `giveRoomOwnership`
```typescript
{ roomName: string, userId: number }
```
Give the ownership to another user.  
On failure, `roomOwnershipNotGived` is sent to the socket that triggered the event.  
On success:
- `roomOwnershipGived` is sent to the socket that triggered the event.
- `granted` is sent to all the active sockets of the user that gived ownership.
- `memberListUpdated` is sent to the room.
Give a member the owner title.
*The user must be the **owner** of the room to succeed.*  

#### `kickUser`
```typescript
{ roomName: string, userId: number }
```
Kick out user from the room.  
On failure, `userNotKicked` is sent to the socket that triggered the event.  
On success:
- `userKicked` is sent to the socket that triggered the event.
- `kicked` is sent to all the active sockets of the user that has been kicked.
- `memberListUpdated` is sent to the room.
*The user must be either the **owner** or an **admin** to succeed.*  

#### `banUser`
```typescript
{ roomName: string, userId: number }
```
Ban a user from a room. It has no limit on the time. The user will not be able to join the room even if invited.  
On failure, `userNotBanned` is sent to the socket that triggered the event.  
On success:
- `userBanned` is sent to the socket that triggered the event.
- `banned` is sent to all the active sockets of the user that has been banned.
- `memberListUpdated` is sent to the room.

*The user must be either the **owner** or an **admin** to succeed.*  

#### `unbanUser`
```typescript
{ roomName: string, userId: number }
```
Unban a user.  
On failure, `userNotUnbanned` is sent to the socket that triggered the event.  
On success:
- `userBanned` is sent to the socket that triggered the event.
- `unbanned` is sent to all the active sockets of the user that has been unbanned.
- `` is sent to the room.

*The user must be either the **owner** or an **admin** to succeed.*  

#### `muteUser`
```typescript
{ roomName: string, userId: number, timeout: number }
```
Mute a user for `timeout` seconds.  
On failure, `userNotMuted` is sent to the socket that triggered the event.  
On success:
- `userMuted` is sent to the socket that triggered the event.
- `muted` is sent to all the active sockets of the user that has been muted.
- `` is sent to the room.

*The user must be either the **owner** or an **admin** to succeed.*  

#### `unmuteUser`
```typescript
{ roomName: string, userId: number }
```
Unmute a user.  
On failure, `userNotUnmuted` is sent to the socket that triggered the event.  
On success:
- `userMuted` is sent to the socket that triggered the event.
- `muted` is sent to all the active sockets of the user that has been unmuted.
- `` is sent to the room.

*The user must be either the **owner** or an **admin** to succeed.*  

#### `blockUser`
```typescript
{ roomName: string, userId: number }
```
Block user message. That means that the blocker will not be able to receive messages from `userId` in `roomName`. The blocked user will still be able to send message in the room.  
On failure, `userNotBlocked` is sent to the socket that triggered the event.  
On success:
- `userBlocked` is sent to the socket that triggered the event.
- `` is sent to all the active sockets of the user that
- `` is sent to the room.

#### `unblockUser`
```typescript
{ roomName: string, userId: number }
```
Unblock a user.  
On failure, `userNotUnblock` is sent to the socket that triggered the event.  
On success:
- `userUnblocked` is sent to the socket that triggered the event.
- `` is sent to all the active sockets of the user that
- `` is sent to the room.

#### inviteUser
```typescript
{ roomName: string, userId: number }
```
Invite a user in a room.  
On failure, `userNotInvited` is sent to the socket that triggered the event.  
On success:
- `userInvited` is sent to the socket that triggered the event.
- `invited` is sent to all the active sockets of the user that has been invited.
- `` is sent to the room.

#### `uninviteUser`
```typescript
{ roomName: string, userId: number }
```
Uninvite a user from the room.  
On failure, `userNotUninvited` is sent to the socket that triggered the event.  
On success:
- `userUninvited` is sent to the socket that triggered the event.
- `` is sent to all the active sockets of the user that
- `` is sent to the room.

#### `sendRoomMsg`
```typescript
{ roomName: string, message: string }
```
Send a message in a room.  
On failure, `roomMsgNotSended` is sent to the socket that triggered the event.  
On success:
- `` is sent to the socket that triggered the event.
- `` is sent to all the active sockets of the user that
- `roomMsgReceived` is sent to the room.  

#### `getRoomsList`
```typescript
undefined
```
Get all the public rooms.  
Returns `roomsListReceived`

---

## Event emitted by the server to the targeted room

#### `memberListUpdated`
```typescript
{ roomName: string, memberList: [{ owner: number, admins: [number], members: [number] }] }
```
This event is sended to the room when a user join, left or has been gived a title etc...

#### `roomMsgReceived`
```typescript
{ roomName: string, userId: number, message }
```
A message has been sended to the room.

## Event emitted by the server to the socket that triggered the event

The payload returned by `roomsListReceived`:
```typescript
{ roomsList: [{ roomName: string, protected: boolean }] }
```

The payload returned is the same for the following events;  
`roomNotCreated`, `roomCreated`, `roomNotUpdated`, `roomUpdated`, `roomNotJoined`,  
`roomJoined`, `roomAdminNotAdded`, `roomAdminAdded`, `roomAdminNotRemoved`,  
`roomAdminRemoved`, `roomOwnershipNotGived`, `roomOwnershipGived`, `userNotKicked`,  
`userNotBanned`, `userNotUnbanned`, `userNotMuted`, `userNotUnmuted`, `userNotBlocked`,  
`userBlocked`, `userNotUnblocked`, `userUnblocked`, `userNotInvited`, `userInvited`,  
`userNotUninvited`, `userUninvited`, `roomMsgNotSended`:
```typescript
{ roomName: string, timestamp: Date, message: string }
```

---

## Event emitted to all the sockets of the targeted user

The targeted user is the one on which the event will affect.  
For example if `banUser` is triggered, the targeted user is the one who is being banned.  
Another example if `createRoom` or `joinRoom` is triggered, the targeted user is the one who is respectively creating or joining the room.  

The payload returned is the same for the following events;
`roomJoined`,`roomLeft`,`granted`,`demoted`,`kicked`,`banned`,`unbanned`,`unmuted`,  
`invited`,`uninvited`,`muted`:
```typescript
{ roomName: string, timestamp: Date, message: string }
```

The payload returned alongside with the `muted` event is:
```typescript
{ roomName: string, timeout: number, message: string }
```
