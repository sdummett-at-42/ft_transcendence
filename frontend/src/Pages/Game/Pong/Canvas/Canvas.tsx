import React, { useEffect, useRef, useState } from 'react';
import './Canvas.css';
import { Shape } from '../../../../../../backend/src/modules/game/entities/game.entities';

interface CanvasProps {
  elements: Shape[];
  idGame: string;
  socketRef: React.MutableRefObject<SocketIOClient.Socket>;
  // victory: any[];
}

const Canvas: React.FC<CanvasProps> = ({ elements, idGame, socketRef}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth * 0.8);
  const [canvasHeight, setCanvasHeight] = useState(canvasWidth * 0.5);
  const [angle, setAngle] = useState(0);



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
      setCanvasWidth(window.innerWidth * 1);
      setCanvasHeight(canvasWidth / 2);

      // Get distance bottom canvas et bottom page
      const canvasBottom = window.innerHeight - canvasRef.current.getBoundingClientRect().bottom;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

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

      let largeur = distx;
      let hauteur = disty;

      if (xprim < disty * 2) { // longueur max
        if (largeur > 1000)
          largeur = 1000;
        setCanvasHeight(largeur / 2);
        setCanvasWidth(largeur);
      } else { // hauteur max
        if (hauteur > 500)
          hauteur = 500;
        setCanvasHeight(hauteur);
        setCanvasWidth(hauteur * 2);
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
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
          var gradient = ctx.createRadialGradient(element.pos.x, element.pos.y, 0, element.pos.x, element.pos.y, element.r);
          gradient.addColorStop(1, 'white');
          gradient.addColorStop(0, 'red');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          ctx.fill();
        } else if (element.type === 'Circle') {
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          let gradient = ctx.createRadialGradient(element.pos.x, element.pos.y, 0, element.pos.x, element.pos.y, element.r);
          gradient.addColorStop(1, 'blue');
          gradient.addColorStop(0, 'green');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = 'green';
          ctx.beginPath();
          ctx.stroke();
        } else if (element.type === 'BlackHole') {
          let gradient = ctx.createRadialGradient(element.pos.x, element.pos.y, 0, element.pos.x, element.pos.y, element.r);
          gradient.addColorStop(1, 'black');
          gradient.addColorStop(0, 'grey');
          ctx.strokeStyle = 'white';
          ctx.beginPath();
          ctx.arc(element.pos.x, element.pos.y, element.r, 0, 2 * Math.PI);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (element.type === 'Square') {
          ctx.fillStyle = 'white';
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
    // window.addEventListener('resize', resizeCanvas);
    
    // Resize Canvas and draw content
    resizeCanvas();
    drawCanvas();
    setAngle(angle + Math.PI / 60);
    if (angle >= Math.PI * 2)
      setAngle(angle - Math.PI * 2);

    // Clean up event listeners on unmount
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
      // window.removeEventListener('resize', resizeCanvas);
    };
  }, [elements, idGame, socketRef]);

  return (
      <canvas className="canvas" ref={canvasRef}></canvas>
  );
};

export default Canvas;