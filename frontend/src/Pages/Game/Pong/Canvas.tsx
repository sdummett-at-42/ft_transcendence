import React, { useEffect, useRef } from 'react';
import './Canvas.css';
import { Shape } from "../../../../../backend/src/modules/game/entities/game.entities"


interface CanvasProps {
    elements: Shape[];
    room: string;
    socketRef: React.MutableRefObject<SocketIOClient.Socket>;
}

const Canvas: React.FC<CanvasProps> = ({ elements, room, socketRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas = canvasRef.current;

  console.log("element:", elements);
  console.log("room:", room);

  useEffect(() => {
    if (!canvas) return;
        const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Add event listener for mouse move
    const handleMouseMove = (event: MouseEvent) => {

      // Calculate relative position of mouse
        const rect = canvas.getBoundingClientRect(); // obtenir la position de l'élément Canvas
        const x = event.clientX - rect.left; // position X de la souris sur l'élément
        const y = event.clientY - rect.top; // position Y de la souris sur l'élément

      // Emit socket event
      socketRef.current.emit('Mouvement', { roomId: room, data: { x, y } });
    };
    ctx.addEventListener('mousemove', handleMouseMove);

    // Clean up event listener and socket connection on unmount
    return () => {
      ctx.removeEventListener('mousemove', handleMouseMove);
    };
  }, [room]);

  useEffect(() => {
    if (!canvas) return;
        const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Définir la largeur et la hauteur du canvas
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    console.log("image");
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    //ctx.beginPath();

    console.log(`size = ${elements.length}`);
    console.log(elements);
    for (let i = 0; i < elements.length; i++)
    {
        ctx.beginPath();
        //console.log(`type is ${elements[0].type}`);
        if (elements[i].type === "Bullet")
        {
            console.log("this is bullet");
            // pos : Coordonnee;   // Coordonnee
            // r : number;         // size of radius
            // v : number;         // speed
            // a : number;         // direction
            ctx.fillStyle = "red"; // a remplacer par couleur objet
            ctx.arc(elements[i].pos.x, elements[i].pos.y, elements[i].r, 0, 2 * Math.PI);
            ctx.fill();
        }
        else if (elements[i].type === "Circle")
        {
            console.log("this is Circle");
            ctx.strokeStyle = "blue";
            ctx.arc(elements[i].pos.x, elements[i].pos.y, elements[i].r, 0, 2 * Math.PI);
            //ctx.fill();
            ctx.stroke();
        }
        else if (elements[i].type === "BlackHole")
        {
            console.log("this is BlackHole");
            ctx.strokeStyle = "Black";
            ctx.arc(elements[i].pos.x, elements[i].pos.y, elements[i].r, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (elements[i].type === "Square")
        {
            console.log("this is saqure");
            ctx.fillStyle = "green";
            ctx.fillRect(elements[i].pos.x, elements[i].pos.y, elements[i].width, elements[i].length);
            ctx.fill();
        }
    }}, [elements]);

    return <canvas className="canvas" ref={canvasRef} />;
};

export default Canvas;