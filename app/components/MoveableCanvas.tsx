import React, { useRef, useState, useEffect, useCallback } from 'react';

type HandleType = 'move' | 'resize' | 'rotate';

const MoveableScalableCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [aspectRatio] = useState(200 / 200); // Initial aspect ratio

  const [rect, setRect] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
  });

  const icons = {
    move: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiB2aWV3Qm94PSIwIDAgMjQwIDI0MCI+PHBhdGggZmlsbD0iIzk5OUZGNCIgZD0iTTAgTWlSRnMuMzAyMYyAxcyw0IDgwIDEuOSIQyWZsW0JhLTV0ODMuMzYxMGQgMzctMkg0YzkuMjAyNTIgMTkuNzAgMjUuMDQ4LDEuMTc3IChjMQlsZ2twNzI45VVbTQyIDUuMmM2LTYuNDIgLDAsOXVsIHg4di02cHwgLGUwJGMsOC4wMTAxZ2YlMioyLTAuMTkvMTkwOyInZnMsMjcuMzA4MTQ4YDUgNHcgPlRleHQgSACsMC4yNjM5Mi46LGE3ODk1LDM1Ljc0IHRlbCwzLjhtPS0xMCkvcGFytICNjLTI1IDE5LnRpIDMwMTAxMiAwINGTON MAwOGVTYSxkeCzgY2QxLDU7ODIwIE5IbG09M2xXNGMtaGFuZzAwMTA3MywzY2IgTENzoTE2Yy44MTEuMTBzLDQ2OSwxMDsyLjI1MiwwMTEuYzkwMC44NDEU7dmEzMjMuMjI5OTU+Ljk3aXJhMyY/zESNDB5IDFDOSm8ZFXMWRlIDA0Qll0djNdIglzbG9yZTc3NzAydCToYnRjaGxueHRsbCw2cy0xMGFocHl0Jy4xdW50IC8gNy01ZTAzNjExbE0xcDQwQlhkSXA6X1AWYuYAYOHRkOVM3IDI1LjxEODkmMDA3WmNxLDEgMDFZywEMDquybXgGHA6MWgjMC4drsiIj+sLTYwLTk4djZkbnIuYjBsM0UzLjN0YWI1MDcyczIyZSs0eXEkwcHguzHiM2H1CRUBIQ2M9OCwkMiwyYy41aIIbSBxZTgxNzA4azMuWjk7pmh35IyOTBQUjAsOHItZjMuNTVzVE6jMTdVXDR0IC0wLTM4ZW0uIGk0NTQydhw6ZSwgYjc7MjBtMjAtM2MgYzw4MTA2NEkgKGFeemkuMTA4MTA1NQdTE2dUO08IHZpIHR5Qll/OnTQ1dDF1bnUtdHVEiaEBIMyMG9tRVNmNzUubAIAZnJjaCk5NGUuM0MtNDVDNTBlYWYwMCY7Y3AAaTAga2U2MDI0Zm0yLTE2OGFsYnl0JSwsMZcTc3UsMTFvhOBiMSc3IiY3LTVjMyw3OzM2NTc0Y6Q1TXg7aDBDNC8xJGIXPGFydGVyYXmhJnpfaDBJBmksNjc5NWksMzvM2ZjUwNWY0MSw0Wml4IE0zOSZPY2gxLDFhdDAyMHM2ZDQwMC9NY2h0NEFmUkM1WiJjKiMiMjUwLgI7ZFk3QU4tPHgjY0RRWElMbmNtJCw5KDE5IGZfZXkgIiw3k5yZyBsZ2wgbm5Xbnp0aXJ3LCRWbCwgPC91LFl938uK1gYEFTRxGHZz1mMzNqIjUgYzAwMi1BRSddU0VSdy03YKgtMC45Ii4/UM5MaC44MnJpdGUFjJtuD2s9ISc4MliYyBzSUI2YTAyNC0nR0UgZWIzZWZiODFkNzBELGghOmg3Nzl0aHRFbmVzcFlsQqlGUaBRZTBDNgItViYgMzI4ZXxzeWUw4NLg3fGNhfGIby71jM2RoZiAzazAzIg4yNzQbV0khOD03bHhubS4yNCp0IE5EO3M0LTg3NiA4YTA5yAgIDc9Mw==',
    resize: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiB2aWV3Qm94PSIwIDAgMjQwIDI0MCI+PHBhdGggZD0iTTUuNzUxIDMuNzI5YzE4LjMgMTguMzktni42MjggMjMuMjU1LDUuMDA5bDEuMDQgMTdmNjIgOS4wNCA0MS8yODEyfTd2MC40MDUgMTIuNzkwNfMyLjU2MyAuMTM1Yy0xMC4zMTcuNzIzLS45MDgiIEuMDE0OCI6IEJpLjY3OSA4LjU0IDI5LjY4LS41MmQzIDEuMDU5LTIuNzc0LTguMjA5IDEuMjU2LS4yNTUtMS83LjU5MjU1MS51N2IuMTQ3NTAxMS43MjZQUmY4dDlYmljP6ZHJncm80LjQ0YTY0YzUuNiAyMy42ZDcuNDAzIFdlVi40b00TbTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHRyYW5zZm9ybT0iNDAuMSkiIHZlcnNpb249IjEu1MDYxICErasLCGV0dWV0VEPcNXY3OS48M3k5bnciID4+PC9zdmc+',
    rotate: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiB2aWV3Qm94PSIwIDAgMjQwIDI0MCI+PHBhdGggZD0iTTAgMzcuNTJoMUGxJ2lvcywsIy4xOCwxMTU4Njc2NTcuNzUuODAyNSw1Ljc3NC04LjUwOS42OTMyMTUxOTAxYzAtMTQuNTk5LTkuNjA1Njg4OC0yOCwxMDA5MDkwNC4zNDZDN1k5MDIuMTQ2NzUiaTYuOTgxMi44NTUtLjU2MSw1MTQiIDcuNDYxeDY0LC42NzM1IDEuMSAyNSAYjAuMyAwLjc5MCwwIDMuMjM4djIuMyA5M2MuNS4xMzMuMzI1Ny40NDk1bC4zNTUgZC5NBAzxYS4BOjAwOC45MzgyMDM1ZDksLkC3YWc3dHk5ZXIuMTgxMyAyLjE5eHkyICg1MC4wNzAwMCw1NTouMiA8MSAmIjApIC8+PC9zdmc+',
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

    ctx.save();
    ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = 'rgba(100, 150, 250, 0.8)';
    ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
    ctx.restore();

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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
          rotate: 'grab',
        }[activeHandle] : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    />
  );
};

export default MoveableScalableCanvas;