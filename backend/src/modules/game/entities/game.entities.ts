import { Server } from 'socket.io';

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

    constructor(x:number, y:number, r:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
    }
}

export class BlackHole implements Shape {
    type : string = "BlackHole";
    pos : Coordonnee;
    r : number;

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

    speed : number;

    constructor(x:number, y:number, r:number, v:number, f:number, a:number) {
        this.pos = new Coordonnee(x, y);
        this.r = r;
        this.v = v;
        this.f = f;
        this.a = a;

        this.speed = 5;
    }
}

export class Square implements Shape {
    type : string = "Square";
    pos : Coordonnee;
    width : number;
    length : number;

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

    side?: number;

    score : number = 0;
    racket? : Square;

    // if player got relaunch bullet
    relaunchBulletBool = false;
    
    // End game set elo win/lose
    eloChange : number = 0;

    // constructor(id : number, name : string, elo : number, eloTab : number[]) {
    constructor(data : any) {
        this.id = data.id;
        this.name = data.name;
        this.elo = data.elo;
        this.socket = data.socket;
    }
}

export class Field {
    height : number;
    width : number;

    constructor(height:number, width:number){
        this.height = height;
        this.width = width;
    }
}
export class Game {
    id : number;
    roomId : string;
    server? : Server;
    p1 : Player;
    p2 : Player;
    boolRanked : Boolean;

    p1socket?: any;
    p2socket?: any;

    boolMap : Boolean = false;
    map?: number;

    field : Field; // size
    shapes : Shape[] = [];

    startBool : Boolean = false;
    endBool : Boolean = false;
    deleteBool : Boolean = false;

    timeoutJoin?: NodeJS.Timeout;

    // gameInterval
    gameInterval?: NodeJS.Timeout;
    launchBulletTimer

    // Game is paused
    pause : Boolean = false;
    pauseP1 : Boolean = false;
    pauseP2 : Boolean = false;
    // when pause start
    pauseStart?: Date;
    pauseP1Start?: Date;
    pauseP2Start?: Date;
    // how much time is spend on pause
    pauseP1Time : number = 0;
    pauseP2Time : number = 0;
    pauseTotalTime : number = 0;
    // number of times activate
    pauseP1Max : number = 0;
    pauseP2Max : number = 0;
    pauseTotalMax : number = 5;


    // Game date
    dateStart?: Date;

    // les mettre propres aux bullets ?
    bulletInterval?: NodeJS.Timeout; // stocker ID de l'intervalle de la partie -> a chaque passqge bullet se deplace
    frequencyInterval?: NodeJS.Timeout; // stocker ID de l'intervalle f bullet -> a chaque passage bullet.f ++

    // number of obstacle + racket
    numberElement? : number;

    // Limit score:
    limitScoreBool: Boolean = true; // true == limit
    limitScore: number = 5; 

    // Limit pause time:
    limitPauseTimerBool: Boolean = true; // true == limit
    limitPauseTimer: number = 30 * 1000; // droit a x ms de pause

    // Limit game timer:
    limitTimerBool: Boolean = true ; // true == limit
    limitTimer: number = 5 * 60 * 1000;// 5 min
    //limitTimer: number = 5000;// 5 sec

    // Game end
    typewin?: Boolean; // 0 score 1 abandon
    winner?: Player;
    loser?: Player;



    constructor(id : number, p1 : Player, p2 : Player, type : string) {
        this.id = id;
        this.roomId = "game" + id;
        this.p1 = p1;
        this.p2 = p2;

        this.p1.side = 1;
        this.p2.side = 2;

        this.field = new Field(400, 800);

        if (type === "ranked")
            this.boolRanked = true;
        else
            this.boolRanked = false;
    }
}