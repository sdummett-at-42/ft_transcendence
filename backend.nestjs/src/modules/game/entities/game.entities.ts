export interface Shape {
    type: string;
    pos: Coordonnee;
  }

export class Coordonnee {
    x : number;
    y : number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}

export class Circle implements Shape {
    type : string = "Circle";
    pos : Coordonnee;
    r : number;
    // color or img

    constructor(x:number, y:number, r:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
    }
}

export class BlackHole implements Shape {
    type : string = "BlackHole";
    pos : Coordonnee;
    r : number;
    // color or img

    constructor(x:number, y:number, r:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
    }
}

export class Bullet implements Shape {
    type : string = "Bullet";
    pos : Coordonnee;   // Coordonnee
    r : number;         // size of radius
    v : number;         // speed
    f : number;         // frequence
    a : number;         // direction
    // color or img

    constructor(x:number, y:number, r:number, v:number, f:number, a:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
        this.v = v;
        this.f = f;
        this.a = a;
    }
}

export class Square implements Shape {
    type : string = "Square";
    pos : Coordonnee;
    width : number;
    length : number;
    // color or img

    constructor(x:number, y:number, length:number, width:number) {
        this.pos = new Coordonnee(x, y);
        this.width = width;
        this.length = length;
    }
}

export class Player {
    id : number;
    name : string;
    elo : number;
    socket : string;
//    eloTab : number[];
    //socket : string;

    score : number = 0;
    racket? : Square;
    
    // player 1 or 2 ?
    // id, name etc....

    // constructor(id : number, name : string, elo : number, eloTab : number[]) {
    constructor(data : any) {
        console.log("construcotr PLayer, data :", data);
        this.id = data.userId;
        this.name = data.name;
        this.elo = data.elo;
        this.socket = data.socket;
        //this.socket = data.socket;
        //this.eloTab = data.elo[];
    }

    // constructor(x:number, y:number, height:number, width:number) {
    //     this.racket = new Square(x, y, height, width);

    // }
}

export class Field {
    height : number;
    width : number;
    //shapes : Shape[]; // pour les map perso
    // definir ici couleur / skin map j1 j2 ?

    constructor(height:number, width:number){
        this.height = height;
        this.width = width;
        //this.shapes = shapes;
    }
}

export class Game {
    id : number;
    roomId : string;

    p1 : Player;
    p2 : Player;

    field : Field; // size
    shapes : Shape[] = [];

    bulletInterval: NodeJS.Timeout; // stocker ID de l'intervalle de la partie
    frequencyInterval: NodeJS.Timeout; // stocker ID de l'intervalle f bullet

    numberElement? : number;
    speed? : number;

    constructor(id : number, p1 : Player, p2 : Player) {
        this.id = id;
        this.roomId = "game" + id;
        this.p1 = p1;
        this.p2 = p2;

        this.field = new Field(400, 800);
    }
}