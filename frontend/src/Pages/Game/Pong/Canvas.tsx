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
  const [canvasResize, setCanvasResize] = useState(false);


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
      // Set canvas size
      setCanvasWidth(window.innerWidth * 0.8); // set canvas width to 80% of window width
      setCanvasHeight(canvas.width * 0.5); // set canvas height to half of canvas width

      // Set canvas style size
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      // Scale context
       //ctx.scale(canvasWidth / 800, canvasHeight / 400);

      // Redraw the canvas content
      //drawCanvas();
      //setCanvasResize(true);
    };

    /* *********************** *\
    |*       Draw Canvas       *|
    \* *********************** */

    const drawCanvas = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // if (canvasResize === true)
      ctx.scale(canvasWidth / 800, canvasHeight / 400);

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
    window.addEventListener('resize', () => {
    if (!window.ResizeObserver) {
        console.log("Console is open, disable automatic canvas resizing");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        drawCanvas();
      } else {
        console.log("Console is closed, enable automatic canvas resizing");
        resizeCanvas();
      }
    });
    
    // Draw canvas content
    drawCanvas();
    setCanvasResize(false);

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
  }

  return (
   // <div className="canvasContainer">
      <canvas className="canvas" ref={canvasRef} />
   // </div>
  );
};

export default Canvas;