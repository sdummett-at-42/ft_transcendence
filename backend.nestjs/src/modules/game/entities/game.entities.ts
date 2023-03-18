export class Coordonnee {
    x : number;
    y : number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}

export class Circle {
    pos : Coordonnee;
    r : number;
    // color or img

    constructor(x:number, y:number, r:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
    }
}

export class Bullet {
    pos : Coordonnee;   // Coordonnee
    r : number;         // size of radius
    v : number;         // speed
    a : number;         // direction
    // color or img

    constructor(x:number, y:number, r:number, v:number, a:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
        this.v = v;
        this.a = a;
    }
}

export class Square {
    pos : Coordonnee;
    height : number;
    width : number;
    // color or img

    constructor(x:number, y:number, height:number, width:number) {
        this.pos = new Coordonnee(x, y);
        this.height = height;
        this.width = width;
    }
}

export class Racket {
    x : number; // peut etre non obligatoire
    y : number;
    lenght : number;
    width : number;
    // color or img

    constructor(x:number, y:number, lenght:number, width:number) {
        // this.pos = new Coordonnee(x, y);
        this.x = x;
        this.y = y;
        this.lenght = lenght;
        this.width = width;
    }
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