import React, { useEffect, useRef } from 'react';
import './Canvas.css';
import { Shape } from '../../../../../backend/src/modules/game/entities/game.entities';

interface CanvasProps {
  elements: Shape[];
  idGame: string;
  socketRef: React.MutableRefObject<SocketIOClient.Socket>;
}

const Canvas: React.FC<CanvasProps> = ({ elements, idGame, socketRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Add event listeners
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      socketRef.current.emit('Mouvement', { roomId: idGame, data: { x, y } });
    };

    const handleMouseClick = (event: MouseEvent) => {
      socketRef.current.emit('clickCanvas', idGame);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    

    // Clean up event listeners on unmount
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
    };
  }, [elements, idGame, socketRef]);

  return <canvas className="canvas" ref={canvasRef} />;
};

export default Canvas;
