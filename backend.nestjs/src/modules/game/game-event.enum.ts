export enum EventGame {

    /* **** *\
    |* Game *|
    \* **** */

    // recv
    gameStart = "start",
    gameEnd = "end",

    //send
    gameImage = "image",

    /* ****** *\
    |* Player *|
    \* ****** */

    // recv
    playerMouvement = "Mouvement",
    playerJoinGame = "joinGame",
    playerJoinQueue = "joinQueue",
    playerLeaveQueue = "leaveQueue",

    //send


    /* ************* *\
    |* miscellaneous *|
    \* ************* */

    // send
    NotConnected = "NotConnected",
    IsConnected = "IsConnected",

    
}