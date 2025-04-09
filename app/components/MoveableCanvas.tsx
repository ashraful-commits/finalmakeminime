import React, { useRef, useState, useEffect, useCallback } from 'react';

type HandleType = 'move' | 'resize' | 'rotate';

const MoveableScalableCanvas = ({step}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [aspectRatio] = useState(200 / 200);
  
    const [rect, setRect] = useState({
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    });

  const icons = {
    move: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMgNnYzaC0ydi0zSDl2M0g3VjRINHYyaDN2M0g0djJoM3YzaDJ2LTNoM3YzaDJ2LTNoM3YtMkgxNVY5aC0yVjZ6bS0yIDhIN1Y5aDR2NXptNiAwdi01aDR2NXoiIGZpbGw9IiM0NDQiLz48L3N2Zz4=',
    resize: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA8CAMAAAAe9Wm0AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAFRQTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFOB9uAAAABx0Uk5TABCf/9+/j38/MM8gcG/AQOCAkO/wUGCgr9CwX4KbFhwAAAGoSURBVHiczZbdksIgDIVBZJVai7CtVff933PVkvBjA+nFzuy5UqefDTmHTIRYJMVWyZ1Saq+/DkfDZzoV9WZPbahXn+r04VxlhxVokaaPSkNqT0I0o5T9M+hSQFQvbPpQL4x1fgDWUS/KIKznxXqyuAL65gWq8LZjQS6UPwbKb4DsBO+6MqAZOuDgWIyshxSZmKeu3Yzw6POTBHtuTahDSBg4FmkqSEVIXEuP69CwfJmhGY3Lm0HizvLY5NAJPN7VIFvkAKNY89iW/eJ4/AGJR6D2tMfmo8fosaZf9U7EPfsfaEbp8Y/W5/DH/jLOeSXo8ZT9vKt31a95bDDZhNDjpIS+ZYVc8ditlZxpxWO44jQU5w2eYW5D6DEOtXBbq/mX0AydQzUm8TiEueNAAofa0jDFgqLHJkJDC8qHGhdKPbZcKA61fuXikUKP7QYoDjW3AUKPs/a3hEOtEb3plm5XEwuCIfbcrt4bkkshIq9SFUq3NCpFtoQUAzI1ZqT6UFnL6BRJP5LQg4KeOtk+bkipGPtCtl29dG8zyE5uHl4l++2rOGOJ/g/6BdWfFz5S5aSmAAAAAElFTkSuQmCC',
    rotate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAABACAMAAACUXCGWAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAI1QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6ocz+AAAAC90Uk5TAD9vf18wTxCPv//LIPCf8vmvQPyg42DA+9WAUP3Q+tL3w3Cw8+Hv8ZC05+X19qWzD6QRAAACaElEQVR4nO2Xa3eiMBCGq4jolIWagGCgxYJtbe3u//95SxLuTC4cP3XPvl88ZsLDZDKZDA8P//VjtVqt1s5m5U7Ht87aswJsdnvo9Ljb+L2JG37NyDO5QQhPMFD957BtjIQP0MiE2I8JUhRiR5iP4m+iRfgBpHOE1InUE5gZkoW5CgE1fedZQHbjp56TJDkBvPSYwjdBvKKdfIbXkrQ7QljVLZGGlR7iFbR1uyKTSLFLF2AtpGVQiHzEzNrntZCDnJS+KRLJLcwQ1pgjdUpHJojbMvDntw7XuwHSBETBGBwkDaSUMVUwyJSBQz5ETGNFPOwg8lQBQUxcrhXkJBxRn+9olCQ4pHmTptIco2Sk63zKlReQs75GGCVWA9ldDE+u5j5HiO442IrxapGy+yCJNkkQeWtnVi2WQtywrltHFGLvyCdffjgZfFwIQVNzqScSMjmsEoIVVlQumlbRssASFMLooqyXdeMLG81NF32niGIJLhd5s4Xc+Gw6S/CbqZwM5Suq4JVnD0UKDSaW4hmRieGLVSfmiVuZVnNLCNbnuLkpkb1k1q74sj2IlT7mn2bIq4zI9AwPnSxNDHlToo7UroiowLdhmzNQRmRgvmgp7reYpO5iI7FYGmrOIZHupjflBnjFb+mMo5rhtO2f5j1u2Ny3Bbokv+u20J2ZUmjfyPeIAHIbBqc0Tf0TvA2/Rvz1oe/VDYxhN8xLwz5wtvUXTxD3Y3loU7qG3erLu7gZB1wo7ArxqFsdKwf7m7aMAfvSUDTaSpE/cydCtgjB5ZXP4uEzXM71z4ktuO3HIJKxa8VYSey+Pf8N/QXgKzs7DWsX9gAAAABJRU5ErkJggg==',
  
 
};


  const getHandlePositions = useCallback(() => {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const angle = rotation * Math.PI / 180;

    const rotatePoint = (x: number, y: number) => {
      return {
        x: centerX + (x - centerX) * Math.cos(angle) - (y - centerY) * Math.sin(angle),
        y: centerY + (x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle)
      };
    };

    return {
      move: rotatePoint(rect.x, rect.y),
      rotate: rotatePoint(rect.x + rect.width, rect.y),
      resize: rotatePoint(rect.x + rect.width, rect.y + rect.height),
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
    ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = 'rgba(100, 150, 250, 0.8)';
    ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    ctx.restore();

    // Only draw handles if step is not 5
    if (step !== 5) {
      const handles = getHandlePositions();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;

      await drawIcon(ctx, 'move', handles.move.x, handles.move.y);
      await drawIcon(ctx, 'rotate', handles.rotate.x, handles.rotate.y);
      await drawIcon(ctx, 'resize', handles.resize.x, handles.resize.y);
      ctx.shadowColor = 'transparent';
    }
  }, [rect, rotation, getHandlePositions, drawIcon, step]);

  const getActiveHandleType = useCallback((mouseX: number, mouseY: number): HandleType | null => {
    if (step === 5) return null; // Disable handles when step is 5
    
    const handles = getHandlePositions();
    const handleRadius = 15;

    const checkHandle = (x: number, y: number) => {
      return Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2) < handleRadius;
    };

    if (checkHandle(handles.move.x, handles.move.y)) return 'move';
    if (checkHandle(handles.rotate.x, handles.rotate.y)) return 'rotate';
    if (checkHandle(handles.resize.x, handles.resize.y)) return 'resize';

    return null;
  }, [getHandlePositions, step]);

  const MouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const mouseY = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const handle = getActiveHandleType(mouseX, mouseY);
    if (handle) {
      setActiveHandle(handle);
      setIsDragging(true);
      setStartPos({ x: mouseX, y: mouseY });
    }
  };

  const MouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeHandle || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rectBounds = canvas.getBoundingClientRect();
    const mouseX = 'touches' in e ? e.touches[0].clientX - rectBounds.left : e.clientX - rectBounds.left;
    const mouseY = 'touches' in e ? e.touches[0].clientY - rectBounds.top : e.clientY - rectBounds.top;
    const deltaX = mouseX - startPos.x;
    const deltaY = mouseY - startPos.y;

    switch (activeHandle) {
      case 'move': {
        const angle = -rotation * Math.PI / 180;
        const rotatedDeltaX = deltaX * Math.cos(angle) - deltaY * Math.sin(angle);
        const rotatedDeltaY = deltaX * Math.sin(angle) + deltaY * Math.cos(angle);

        setRect(prev => ({
          ...prev,
          x: prev.x + rotatedDeltaX,
          y: prev.y + rotatedDeltaY,
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
          height: Math.max(50, prev.height * scale),
        }));
        break;
      }

      case 'rotate': {
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (40 / Math.PI);
        setRotation(((angle % 360) + 360) % 360);
        break;
      }
    }

    setStartPos({ x: mouseX, y: mouseY });
  };

  const MouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    draw();
  }, [rect, rotation, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={557}
      height={800}
      style={{
        border: '1px solid red',
        borderRadius: '8px',
        cursor: activeHandle ? {
          move: 'move',
          resize: 'nwse-resize',
          rotate: 'grab',
        }[activeHandle] : 'default',
      }}
      onMouseDown={MouseDown}
      onMouseMove={MouseMove}
      onMouseUp={MouseUp}
      onMouseLeave={MouseUp}
      onTouchStart={MouseDown}
      onTouchMove={MouseMove}
      onTouchEnd={MouseUp}
    />
  );
};

export default MoveableScalableCanvas;