export enum EventGame {

    /* **** *\
    |* Game *|
    \* **** */

    // recv
    gameStart = "start",
    gameEnd = "end",

    //send
    gameImage = "image",
    gameScore = "score",
    gameVictoryScore = "VictoryScore",
    gameTimer = "gameTimer",
    goInGame = "goInGame",

    /* ****** *\
    |* Player *|
    \* ****** */

    // recv
    playerMouvement = "Mouvement",
    playerJoinGame = "joinGame",
    playerJoinQueue = "joinQueue",
    playerLeaveQueue = "leaveQueue",
    playerClickCanvas = "clickCanvas",


    //send


    /* ************* *\
    |* miscellaneous *|
    \* ************* */

    // send
    NotConnected = "NotConnected",
    IsConnected = "IsConnected",

    
}