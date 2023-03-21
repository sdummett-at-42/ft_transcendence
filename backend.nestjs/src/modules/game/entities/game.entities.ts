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
    racket : Square;
    score : number;
    // player 1 or 2 ?
    // id, name etc....

    constructor(x:number, y:number, height:number, width:number) {
        this.racket = new Square(x, y, height, width);
        this.score = 0;
        // couleur / skin
    }
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