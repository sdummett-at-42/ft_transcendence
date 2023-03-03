# Websocket Documentation
We used socket.io.

## Chat rooms

### Event table
This table describe the events that can be received by the server associated with the events it will respond with.
 
| Events received by the server | Events sended by the server |
| ----------------------------- | --------------------------- |
| [`createRoom`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#createroom) | [`roomCreated`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomCreated) [`roomNotCreated`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomNotCreated) |
| [`updateRoom`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#updateRoom) | [`roomUpdated`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomUpdated), [`roomNotUpdated`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomNotUpdated) |
| [`joinRoom`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#joinRoom)   | [`roomJoined`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomJoined) [`roomNotJoined`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomNotJoined) |
| [`leaveRoom`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#leaveRoom)  | [`roomLeft`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomLeft) [`roomNotLeft`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#roomNotLeft) |
| [`banUser`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#banUser)    | [`userBanned`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userBanned) [`userNotBanned`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userNotBanned) |
| [`unbanUser`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#unbanUser)  | [`userUnbanned`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userUnbanned) [`userNotUnbanned`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userNotUnbanned) |
| [`muteUser`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#muteUser)   | [`userMuted`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userMuted) [`userNotMuted`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userNotMuted) |
| [`unmuteUser`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#unmuteUser) | [`userUnmuted`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userUnmuted) [`userNotUnMuted`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userNotUnmuted) |
| [`inviteUser`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#inviteUser) | [`userInvited`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userInvited) [`userNotInvited`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#userNotInvited) |
| [`sendMsg`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#sendMsg)    | [`msgSended`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#msgSended) [`msgNotSended`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#msgNotSended) |
| [`logout`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#logout)     |  |
|  | [`dataError`](https://github.com/sdummett/ft_transcendence/blob/sdummett/ChatREADME.md#dataError) |

### Event reference

#### createRoom
```typescript
{ roomName: string, isPublic: boolean, password?: string }
```
Create a room that can be either private/public and/or password protected or not.

 *`roomName` must be between **1** and **32** characters.*  
 *Obviously if `isPublic` is true it will be visible by everyone.*  
 *If `password` is *undefined* that means that the room isn't protected.*  

#### roomCreated
#### roomNotCreated
#### updateRoom
```typescript
{ roomName: string, isPublic?: boolean, password?: string }
```
Updates the room by changing the visibility and/or the password.

 *`roomName` must be between **1** and **32** characters.*  
 *`isPublic` changes the visibilty of the room, if false no one will see the room.*  
 *If `password` is undefined no change will be made to it, but if it's an empty string, password will be unset. Else password will be set to the new value.*  
*The user must be the **owner** of the room to succeed.*  

#### roomUpdated
#### roomNotUpdated
#### joinRoom
```typescript
{ roomName: string, password?: string}
```
Attempt to join a room.

*`roomName` must be between **1** and **32** characters.*  
*`password` will be used if the room has one.*  

#### roomJoined
#### roomNotJoined
#### leaveRoom
```typescript
{ roomName: string }
```
Leave a room, if the leaver is the owner then a new owner is set. If no more user is in the room then the room is destroyed.  

*`roomName` must be between **1** and **32** characters.*  

#### roomLeft
#### roomNotLeft
#### banUser
```typescript
{ roomName: string, userId: number }
```
Ban a user from a room. Its has no limit on the time. The user will not be able to join the room even if invited.

*`roomName` must be between **1** and **32** characters.*  
*The `userId` to ban.*  
*The user must be either the **owner** or an **admin** to succeed.*  

#### userBanned
#### userNotBanned
#### unbanUser
```typescript
{ roomName: string, userId: number }
```
Unban a user.

*`roomName` must be between **1** and **32** characters.*  
*The `userId` to unban.*  
*The user must be either the **owner** or an **admin** to succeed.*  

#### userUnbanned
#### userNotUnbanned
#### muteUser
```typescript
{ roomName: string, userId: number, timeout: number }
```
Mute a user.

*`roomName` must be between **1** and **32** characters.*  
*The `userId` to mute.*  
The `timeout` must be between **30** secs to **1260** secs (21mins).  
*The user must be either the **owner** or an **admin** to succeed.*  

#### userMuted
#### userNotMuted
#### unmuteUser
```typescript
{ roomName: string, userId: number }
```
Unmute a user.

*`roomName` must be between **1** and **32** characters.*  
*The `userId` to unmute.*  
*The user must be either the **owner** or an **admin** to succeed.*  

#### userUnmuted
#### userNotUnmuted
#### inviteUser
```typescript
{ roomName: string, userId: number }
```
Invite a user in a room.
#### userInvited
#### userNotInvited
#### sendMsg
```typescript
{ roomName: string, message: string }
```
Send a message in a room.

*`roomName` must be between **1** and **32** characters.*  
*The `message` must be between **1** to **150** characters.*  
#### msgSended
#### msgNotSended
#### logout
Disconnect all the connected sockets of a user.

#### dataError
```typescript
{ message: string }
```
The returned message explain why the validation of the data has failed.

## Side notes

Must implement "kick" event. Same as ban but it's not permanent(TODO)  
Must implement "block" event. A user can avoid receiving message from a specific user. Should we implement it on the frontend? (TODO)  
Must implement "grant" event. A privileged user giving privileges to another (TODO)  

Ps: Chat between two users isn't implemented yet.  
