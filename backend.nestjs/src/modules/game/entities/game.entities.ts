export class Coordonnee {
    x : number;
    y : number;
}

export class Circle {
    x : number;
    y : number;
    r : number;
    angle : number;
    // color or img
}

export class Square {
    x : number;
    y : number;
    height : number;
    width : number;
    // color or img
}

export class Racket {
    x : number; // peut etre non obligatoire
    y : number;
    lenght : number;
    width : number;
    // color or img
}

export class Player {
    racket : Racket;
    score : number;
    // player 1 or 2 ?
    // id, name etc....
}

// Create class Match ?
// export class Match {
//     id : number;
//     player1 : Player;
//     player2 : Player;
//     time : jsp

// }