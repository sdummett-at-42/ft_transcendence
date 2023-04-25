import React, { useEffect, useRef, useState } from 'react';
import './Canvas.css';
import { Shape } from '../../../../../backend/src/modules/game/entities/game.entities';

interface CanvasProps {
  elements: Shape[];
  idGame: string;
  socketRef: React.MutableRefObject<SocketIOClient.Socket>;
  victory: any[];
}

const Canvas: React.FC<CanvasProps> = ({ elements, idGame, socketRef, victory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth * 0.8);
  const [canvasHeight, setCanvasHeight] = useState(canvasWidth * 0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* *********************** *\
    |* Setting size and resize *|
    \* *********************** */

    // h 800 | w 400   2/1

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    // Try resize
    const resizeCanvas = () => {
      // console.log("RESIZE ");
      // console.log("window.innerWidth:", window.innerWidth);

      // Set canvas size
      setCanvasWidth(window.innerWidth * 1);
      setCanvasHeight(canvasWidth / 2);

      // console.log(canvas);

      // Get distance bottom canvas et bottom page
      const canvasBottom = window.innerHeight - canvasRef.current.getBoundingClientRect().bottom;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      console.log(`canvasBottom = ${canvasBottom}`);
      console.log(`window.innerWidth = ${window.innerWidth}`);
      console.log(`      canvasWidth = ${canvasWidth}`);
      console.log(`window.innerHeight= ${window.innerHeight}`);
      console.log(`     canvasHeight = ${canvasHeight}`);
      // console.log(`canvasBottom = ${canvasBottom}`);
      console.log(" ********************** ");

      // canvasRef.current?.getBoundingClientRect().bottom; dist hautpage - canvasbas
      // canvasRef.current?.getBoundingClientRect().top;    dist hautpage - canvashaut
      // bottom > top

      const x = 2;
      const xprim = window.innerWidth - 2;
      const y = canvasRef.current.getBoundingClientRect().top;
      const yprim = window.innerHeight - 2;

      const disty = yprim - y;
      const distx = xprim - x;
      // haut gauche 0,y
      // bas droite  x,disty

      const largeur = distx;
      const hauteur = disty;

      if (xprim < disty * 2) { // longueur max
        setCanvasHeight(largeur / 2);
        setCanvasWidth(largeur);
      } else { // hauteur max
        setCanvasHeight(hauteur);
        setCanvasWidth(hauteur * 2);
      }

      // // resize vertical
      // if (canvasBottom < 0) {
      //   const canvasTop = canvasRef.current.getBoundingClientRect().top;
      //   const windowHeight = window.innerHeight;
      //   const distanceToBottom = windowHeight - canvasTop;
      //   setCanvasHeight(distanceToBottom);
      //   setCanvasWidth(canvasHeight * 2);
      // }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // console.log(`${canvas.width} / ${canvas.height} = ${canvas.width / canvas.height}`);

      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';

      //drawCanvas();
    };

    /* *********************** *\
    |*       Draw Canvas       *|
    \* *********************** */

    const drawCanvas = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // if (canvasResize === true)
      ctx.scale(canvas.width / 800, canvas.height / 400);

      // Draw elements
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.type === 'Bullet') {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          ctx.fill();
        } else if (element.type === 'Circle') {
          ctx.strokeStyle = 'blue';
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (element.type === 'BlackHole') {
          ctx.strokeStyle = 'black';
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (element.type === 'Square') {
          ctx.fillStyle = 'green';
          ctx.fillRect(element.pos.x, element.pos.y, element.width, element.length);
        }
      }
    }

    /* ************************ *\
    |* Get input user to server *|
    \* ************************ */

    // Add event listeners
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / (canvasWidth / 800);
      const y = (event.clientY - rect.top) / (canvasHeight / 400);
      socketRef.current.emit('Mouvement', { roomId: idGame, data: { x, y } });
    };

    const handleMouseClick = (event: MouseEvent) => {
      socketRef.current.emit('clickCanvas', idGame);
    };


    /* ************************ *\
    |* ------------------------ *|
    \* ************************ */
    
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    window.addEventListener('resize', resizeCanvas);
    
    // Draw canvas content
    // resizeCanvas();
    if (!victory.length)
      drawCanvas();

    // Clean up event listeners on unmount
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [elements, idGame, socketRef]);


  
  // si la partie a ete fini (gagner par un joueur)
  if (victory.length) {
    console.log("VICTORY NO NULL");
    console.log(victory);
    return (
      <div>
        <h1>Le Gagnant est bidule !</h1>
      </div>
    )
  }

  return (
    //<div className="canvas-container">
      <canvas className="canvas" ref={canvasRef} />
    //</div>
  );
};

export default Canvas;