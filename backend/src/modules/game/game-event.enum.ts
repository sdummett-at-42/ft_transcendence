export enum EventGame {

    /* **** *\
    |* Game *|
    \* **** */

    // game recv (client)
    gameStart = "start",
    gameEnd = "end",

    playerClickCanvas = "clickCanvas",
    playerJoinGame = "joinGame",        // Client join game Spec/ Player Rejoin
    playerMouvement = "Mouvement",      // Player send his mouse coord
    
    // game emit (srv)
    gameImage = "image",                // Send All object on map to print
    gameScore = "score",                // Send Actual score of players
    gameVictory = "victory",            // game is end
    gameTimer = "gameTimer",            // Time in game
    
    /* ***** *\
    |* Lobby *|
    \* ***** */
    
    // Lobby Emit (Client)
    playerJoinQueue = "joinQueue",      // Player join Q
    playerLeaveQueue = "leaveQueue",    // Player leave Q
    
    
    // Lobby recv (srv)
    lobbyGoGame = "goInGame", // send id game to join /game/:id


    /* ************* *\
    |* miscellaneous *|
    \* ************* */

    // send
    NotConnected = "NotConnected",
    IsConnected = "IsConnected",

    
}