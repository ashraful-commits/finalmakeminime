import { useRef, useState, useEffect, useCallback } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import { IoMove, IoResize } from "react-icons/io5";

type HandleType = "move" | "resize" | "rotate";

const MoveableDiv = ({ step }: { step: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);

  // Extend the state to include zoom and position
  const [transform, setTransform] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    rotation: 0,
    aspectRatio: 1,
    zoom: 1,
  });

  const startValues = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    clientX: 0,
    clientY: 0,
  });

  const getContainerBounds = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() || new DOMRect();
  }, []);

  const handleStart = useCallback(
    (type: HandleType, clientX: number, clientY: number) => {
      if (step === 5) return;

      const bounds = getContainerBounds();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;

      startValues.current = {
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        clientX: x,
        clientY: y,
      };

      setActiveHandle(type);
      setIsDragging(true);

      if (type === "resize") {
        setTransform((prev) => ({
          ...prev,
          aspectRatio: prev.width / prev.height,
        }));
      }
    },
    [getContainerBounds, step, transform]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;

      const bounds = getContainerBounds();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      const deltaX = x - startValues.current.clientX;
      const deltaY = y - startValues.current.clientY;

      const updateTransform = () => {
        switch (activeHandle) {
          case "move":
            setTransform((prev) => ({
              ...prev,
              x: startValues.current.x + deltaX,
              y: startValues.current.y + deltaY,
            }));
            break;

          case "resize": {
            const newWidth = Math.max(50, startValues.current.width + deltaX);
            const newHeight = newWidth / transform.aspectRatio;
            setTransform((prev) => ({
              ...prev,
              width: newWidth,
              height: newHeight,
            }));
            break;
          }

          case "rotate": {
            const centerX = transform.x + transform.width / 2;
            const centerY = transform.y + transform.height / 2;
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
            setTransform((prev) => ({
              ...prev,
              rotation: (angle + 360) % 360,
            }));
            break;
          }
        }
      };

      requestAnimationFrame(updateTransform);
    },
    [activeHandle, isDragging, transform.aspectRatio, transform.x, transform.y, getContainerBounds]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  // Responsive container sizing
  useEffect(() => {
    const handleResize = () => {
      const bounds = getContainerBounds();
      setTransform((prev) => ({
        ...prev,
        x: Math.min(prev.x, bounds.width - prev.width),
        y: Math.min(prev.y, bounds.height - prev.height),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getContainerBounds]);

  const rotateLeft = () => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation - 15 + 360) % 360,
    }));
  };

  const rotateRight = () => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 15) % 360,
    }));
  };

  const zoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.1, 3), // For example, limit max zoom to 3x
    }));
  };

  const zoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.1, 1), // For example, minimum zoom is 1x
    }));
  };

  // Function to move div in specific direction
  const moveUp = () => {
    setTransform((prev) => ({
      ...prev,
      y: Math.max(prev.y - 10, 0), // Prevent moving out of bounds
    }));
  };

  const moveDown = () => {
    setTransform((prev) => ({
      ...prev,
      y: prev.y + 10, // You may want to limit maximum movement here
    }));
  };

  const moveLeft = () => {
    setTransform((prev) => ({
      ...prev,
      x: Math.max(prev.x - 10, 0), // Prevent moving out of bounds
    }));
  };

  const moveRight = () => {
    setTransform((prev) => ({
      ...prev,
      x: prev.x + 10, // You may want to limit maximum movement here
    }));
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "557px",
        height: "80vh",
        maxHeight: "800px",
        touchAction: "none",
        userSelect: "none",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      <div
        role="button"
        tabIndex={-5}
        style={{
          position: "absolute",
          left: transform.x,
          top: transform.y,
          width: transform.width * transform.zoom,
          height: transform.height * transform.zoom,
          backgroundColor: "rgba(100, 150, 250, 0.8)",
          transform: `rotate(${transform.rotation}deg)`,
          transition: isDragging
            ? "none"
            : "all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
          transformOrigin: "center center",
          willChange: "transform, width, height",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleStart("move", e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleStart("move", e.touches[0].clientX, e.touches[0].clientY);
        }}
      >
        <img src="/images/IMG_9931_1800x1800.jpg" alt="" style={{ width: "100%", height: "100%", borderRadius: "4px" }} />

        {/* Handles */}
        {/* Move Handle */}
        <div
          role="button"
          tabIndex={0}
          style={{
            position: "absolute",
            top: -28,
            left: -28,
            width: 24,
            height: 24,
            cursor: "move",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            touchAction: "none",
            transition: "background-color 0.2s",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStart("move", e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleStart("move", e.touches[0].clientX, e.touches[0].clientY);
          }}
        >
          <IoMove className="text-xl text-blue-500" />
        </div>

        {/* Rotate Handle */}
        <div
          role="button"
          tabIndex={0}
          style={{
            position: "absolute",
            top: -28,
            right: -28,
            width: 24,
            height: 24,
            cursor: "grab",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            touchAction: "none",
            transform: `rotate(${-transform.rotation}deg)`,
            transition: "background-color 0.2s, transform 0.3s",
          }}
          className="flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStart("rotate", e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleStart("rotate", e.touches[0].clientX, e.touches[0].clientY);
          }}
        >
          <FaArrowsRotate className="text-lg text-blue-500" />
        </div>

        {/* Resize Handle */}
        <div
          role="button"
          tabIndex={0}
          style={{
            position: "absolute",
            bottom: -28,
            right: -28,
            width: 24,
            height: 24,
            cursor: "nwse-resize",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            touchAction: "none",
            transition: "background-color 0.2s",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStart("resize", e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            handleStart("resize", e.touches[0].clientX, e.touches[0].clientY);
          }}
          className="flex justify-center items-center"
        > 
          <IoResize className="text-blue-500 text-xl rotate-90"/> 
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", justifyContent: "space-evenly", marginTop: "10px" }}>
        <button onClick={rotateLeft}>Rotate Left</button>
        <button onClick={rotateRight}>Rotate Right</button>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
      </div>

      {/* Move Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <div>
          <button onClick={moveUp}>Move Up</button>
        </div>
        <div>
          <button onClick={moveLeft}>Move Left</button>
          <button onClick={moveDown}>Move Down</button>
          <button onClick={moveRight}>Move Right</button>
        </div>
      </div>
    </div>
  );
};

export default MoveableDiv;