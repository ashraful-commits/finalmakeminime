import React, { useRef, useState, useEffect, useCallback } from 'react';

type HandleType = 'move' | 'resize' | 'rotate';

const MoveableScalableCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [aspectRatio] = useState(200/200); // Initial aspect ratio
  
  const [rect, setRect] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  });

  const icons = {
    move: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMgNnYzaC0ydi0zSDl2M0g3VjRINHYyaDN2M0g0djJoM3YzaDJ2LTNoM3YzaDJ2LTNoM3YtMkgxNVY5aC0yVjZ6bS0yIDhIN1Y5aDR2NXptNiAwdi01aDR2NXoiIGZpbGw9IiM0NDQiLz48L3N2Zz4=',
    resize: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgMTlINVY1aDdWM0g1YTIgMiAwIDAgMC0yIDJ2MTRhMiAyIDAgMCAwIDIgMmgxNGMyLjIxIDAgMi0xLjc5IDItMnYtN2gtMnY3ek0xNCAzdjJoMy41OWwtOS44MyA5LjgzIDEuNDEgMS40MUwxOSA0LjQxVjhIMjFWM2gtN3oiIGZpbGw9IiM0NDQiLz48L3N2Zz4=',
    rotate: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgNmMtMy44NyAwLTcgMy4xMy03IDdoMnYtMS43OUwxNi45IDMuMSAxNC4xMiA2bDMuODkgMy44OSAxLjQxLTEuNDFMMTkgNWgtM1YzaDV2NWgtMlY3YzAtMi43Ni0yLjI0LTUtNS01em0wIDEyYy0uODMgMC0xLjUuNjctMS41IDEuNXMuNjcgMS41IDEuNSAxLjUgMS41LS42NyAxLjUtMS41LS42Ny0xLjUtMS41LTEuNXpNMTIgOGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTAgNmMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6bTctMS41YzAtLjgyLS42Ny0xLjUtMS41LTEuNXMtMS41LjY4LTEuNSAxLjUgLjY3IDEuNSAxLjUgMS41IDEuNS0uNjcgMS41LTEuNXpNMTIgMGMtNi42MyAwLTEyIDUuMzctMTIgMTJoMGMwIDYuNjMgNS4zNyAxMiAxMiAxMnMxMi01LjM3IDEyLTEyaC0xMmMwLTYuNjMtNS4zNy0xMi0xMi0xMnoiIGZpbGw9IiM0NDQiLz48L3N2Zz4='
  };

  const getHandlePositions = useCallback(() => {
    const centerX = rect.x + rect.width/2;
    const centerY = rect.y + rect.height/2;
    const angle = rotation * Math.PI / 180;

    // Rotated positions calculation
    const rotatePoint = (x: number, y: number) => {
      return {
        x: centerX + (x - centerX) * Math.cos(angle) - (y - centerY) * Math.sin(angle),
        y: centerY + (x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle)
      };
    };

    return {
      move: rotatePoint(rect.x, rect.y), // Top-left
      rotate: rotatePoint(rect.x + rect.width, rect.y), // Top-right
      resize: rotatePoint(rect.x + rect.width, rect.y + rect.height) // Bottom-right
    };
  }, [rect, rotation]);

  const drawIcon = useCallback(async (ctx: CanvasRenderingContext2D, type: HandleType, x: number, y: number) => {
    const img = new Image();
    img.src = icons[type];
    await new Promise(resolve => { img.onload = resolve; });
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -12, -12, 24, 24);
    ctx.restore();
  }, [icons, rotation]);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main rectangle
    ctx.save();
    ctx.translate(rect.x + rect.width/2, rect.y + rect.height/2);
    ctx.rotate(rotation * Math.PI / 180);
    
    ctx.fillStyle = 'rgba(100, 150, 250, 0.8)';
    ctx.fillRect(-rect.width/2, -rect.height/2, rect.width, rect.height);
    ctx.restore();

    // Draw handles
    const handles = getHandlePositions();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;

    await drawIcon(ctx, 'move', handles.move.x, handles.move.y);
    await drawIcon(ctx, 'rotate', handles.rotate.x, handles.rotate.y);
    await drawIcon(ctx, 'resize', handles.resize.x, handles.resize.y);
    
    ctx.shadowColor = 'transparent';
  }, [rect, rotation, getHandlePositions, drawIcon]);

  const getActiveHandleType = useCallback((mouseX: number, mouseY: number): HandleType | null => {
    const handles = getHandlePositions();
    const handleRadius = 15;

    const checkHandle = (x: number, y: number) => {
      return Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2) < handleRadius;
    };

    if (checkHandle(handles.move.x, handles.move.y)) return 'move';
    if (checkHandle(handles.rotate.x, handles.rotate.y)) return 'rotate';
    if (checkHandle(handles.resize.x, handles.resize.y)) return 'resize';

    return null;
  }, [getHandlePositions]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const handle = getActiveHandleType(mouseX, mouseY);
    if (handle) {
      setActiveHandle(handle);
      setIsDragging(true);
      setStartPos({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeHandle || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rectBounds = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rectBounds.left;
    const mouseY = e.clientY - rectBounds.top;
    const deltaX = mouseX - startPos.x;
    const deltaY = mouseY - startPos.y;

    switch(activeHandle) {
      case 'move': {
        const angle = -rotation * Math.PI / 180;
        const rotatedDeltaX = deltaX * Math.cos(angle) - deltaY * Math.sin(angle);
        const rotatedDeltaY = deltaX * Math.sin(angle) + deltaY * Math.cos(angle);
        
        setRect(prev => ({
          ...prev,
          x: prev.x + rotatedDeltaX,
          y: prev.y + rotatedDeltaY
        }));
        break;
      }

      case 'resize': {
        const angle = rotation * Math.PI / 180;
        const delta = (deltaX * Math.cos(angle) + deltaY * Math.sin(angle));
        const scale = 1 + delta / Math.hypot(rect.width, rect.height);
        
        setRect(prev => ({
          ...prev,
          width: Math.max(50, prev.width * scale),
          height: Math.max(50, prev.height * scale)
        }));
        break;
      }

      case 'rotate': {
        const centerX = rect.x + rect.width/2;
        const centerY = rect.y + rect.height/2;
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (40 / Math.PI);
        setRotation(((angle % 360) + 360) % 360);
        break;
      }
    }

    setStartPos({ x: mouseX, y: mouseY });
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    draw();
  }, [rect, rotation, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: activeHandle ? {
          move: 'move',
          resize: 'nwse-resize',
          rotate: 'grab'
        }[activeHandle] : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default MoveableScalableCanvas;