import { useRef, useEffect, useState, useCallback } from "react";
import { FaCartPlus } from "react-icons/fa";
import html2canvas from "html2canvas";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { IoMove, IoResize } from "react-icons/io5";
import { FaArrowsRotate } from "react-icons/fa6";
type HandleType = "move" | "resize" | "rotate";

interface ImageEditorProps {
  faceImage: string;
  bodyImage: string;
  skinTone: string;
  headBackImage: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  productId: string;
  skinToneImage: string;
  rotation: number;
  imagePosition: { x: number; y: number };
  setImagePosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  scale: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
}
const ImageEditor = ({
  faceImage,
  bodyImage,
  skinTone,
  headBackImage,
  step,
  productId,
  skinToneImage,
  rotation,
  imagePosition,
  setScale,
  scale,
  setImagePosition,
}: ImageEditorProps) => {
  // Refs
  const canvasBodyRef = useRef(null);
  const canvasSkinToneRef = useRef(null);
  const canvasTransparentRef = useRef(null);
  const canvasHeadBackRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Default images
  // const defaultBodyImage = bodyImage || "/images/SN-CFC-001-24-25_preview.png";
  const defaultBodyImage = bodyImage || "/images/SN-006_preview (1).png";
  const defualtTransparentBodyImage = "/images/transparentBody.png";
  const defaultSkitToneImage =
    skinToneImage || "/images/Snugzy_Shape_preview_client.png";
  const defaultHeadBackImage = headBackImage || "/images/headblack_preview.png";
  const defaultFaceImage = faceImage;
  const defaultSkinTone = skinTone || "grayscale(100%)";

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const drawImageOnCanvas = (canvasRef, imageSrc, filter = "none") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = filter;

      const width = canvas.width;
      const height = canvas.height;

      const targetAspect = width / height;
      const imgAspect = image.naturalWidth / image.naturalHeight;

      let drawWidth, drawHeight;

      if (imgAspect > targetAspect) {
        drawHeight = height;
        drawWidth = height * imgAspect;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspect;
      }

      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };
  };

  useEffect(() => {
    drawImageOnCanvas(canvasBodyRef, defaultBodyImage);
    drawImageOnCanvas(canvasSkinToneRef, defaultSkitToneImage, defaultSkinTone);
    // drawImageOnCanvas(canvasHeadBackRef, defaultHeadBackImage,defaultSkinTone);
    drawImageOnCanvas(canvasTransparentRef, defualtTransparentBodyImage);
  }, [
    defaultBodyImage,
    defaultSkitToneImage,
    defaultSkinTone,
    defaultHeadBackImage,
  ]);


  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [transform, setTransform] = useState({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    rotation: 0,
    aspectRatio: 1,
  });

  // Store initial positions and dimensions
  const startValues = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    clientX: 0,
    clientY: 0,
  });

  // Get container bounds with memoization
  const getContainerBounds = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() || new DOMRect();
  }, []);

  // Unified input handler with proper touch support
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

      // Maintain aspect ratio for resize
      if (type === "resize") {
        setTransform((prev) => ({
          ...prev,
          aspectRatio: prev.width / prev.height,
        }));
      }
    },
    [getContainerBounds, step, transform]
  );

  // Smooth movement handler using requestAnimationFrame
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
            const angle =
              Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
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
    [
      activeHandle,
      isDragging,
      transform.aspectRatio,
      transform.x,
      transform.y,
      getContainerBounds,transform.height,transform.width
    ]
  );

  // Event handlers with proper passive listeners
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
  }, [isDragging, handleMove,setIsDragging]);

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

  const handleAddToCart = async (id: string, faceImage: string) => {
    if (!containerRef.current || !faceImage) {
      console.error("Missing required elements for image processing");
      return;
    }

    setLoading(true);

    try {
      // Capture composite image
      const compositeCanvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: "transparent",
        logging: process.env.NODE_ENV === "development",
      });

      //uuid
      const uuidgen = uuidv4();
      // Prepare upload promises
      const uploadImage = async (imageData: string, imageType: string) => {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData, uuid: uuidgen }),
        });

        if (!response.ok) {
          throw new Error(
            `${imageType} image upload failed (${response.status})`
          );
        }

        const { result }: { result: string } = await response.json();
        return encodeURIComponent(result);
      };

      const [productImageUrl, faceImageUrl] = await Promise.all([
        uploadImage(compositeCanvas.toDataURL("image/png"), "Composite"),
        uploadImage(faceImage, "Face"),
      ]);

      // Validate upload results
      if (!productImageUrl || !faceImageUrl) {
        throw new Error("Image URL generation failed");
      }

      window.location.href = `https://makeminime.com/?add-to-cart=${id}&quantity=1&image=${productImageUrl}&faceImage=${faceImageUrl}&uuid=${uuidgen}`;
    } catch (error) {
      console.error("Checkout Error:", error);
      // Implement your error handling strategy here (e.g., toast notifications)
      window.location.href = `https://makeminime.vercel.app/product/${id}/customize?error=${encodeURIComponent(
        (error as Error).message
      )}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={` flex-col border-r border-r-gray-500 items-center justify-center w-[50%] max-sm:w-full max-sm:border-b z-0 lg:min-h-[80vh] max-sm:min-h-[400px]  md:min-h-[80vh] ${
        step === 0 || step === 4 || step === 7 || step === 8
          ? "flex"
          : "max-sm:hidden"
      }`}
    >
      <div className="relative w-full flex justify-center items-center  bg-center bg-no-repeat lg:min-h-[90vh] max-sm:min-h-[50vh] md:min-h-[80vh] max-sm:h-[35vh]">
        <div
          ref={containerRef}
          className="relative w-[557px] h-[800px] flex justify-center items-center top-0 max-sm:scale-50 "
        >
          {/* Background Layers */}
          <canvas
            ref={canvasHeadBackRef}
            width={"557px"}
            height={"800px"}
            className="absolute z-10 h-full"
          />

          {/* Face Image */}
          {faceImage ? (
            <div
              ref={canvasRef}
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
                zIndex:50
              }}
            >
              {/* Main Element */}
              <div
              role="button"
              tabIndex={-3}
                style={{
                  position: "absolute",
                  left: transform.x,
                  top: transform.y,
                  width: transform.width,
                  height: transform.height,
                  transform: `rotate(${transform.rotation}deg)`,
                  transition: isDragging
                    ? "none"
                    : "all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                  transformOrigin: "center center",
                  willChange: "transform, width, height",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "4px",
                }}
                onMouseDown={(e) =>{ e.stopPropagation(),handleStart("move", e.clientX, e.clientY)}}
                  onTouchStart={(e) =>
                    {e.stopPropagation(),handleStart(
                      "move",
                      e.touches[0].clientX,
                      e.touches[0].clientY
                    )}
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleStart("move", e.clientX, e.clientY);
                    }
                  }} 
              >
                <img src={defaultFaceImage} alt="" />
                {/* Handles */}
                <div
                  // Move Handle
                  className="flex justify-center items-center"
                  role="button" // Add a role attribute to indicate that it's a interactive element
                  tabIndex={0} // Add tabIndex to make it focusable
                  style={{
                    position: "absolute",
                    top: -28,
                    left: -28,
                    width: 24,
                    height: 24,
                    backgroundColor:"white",
                    cursor: "move",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    touchAction: "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseDown={(e) => {e.stopPropagation(), handleStart("move", e.clientX, e.clientY)}}
                  onTouchStart={(e) =>{e.stopPropagation(),
                    handleStart(
                      "move",
                      e.touches[0].clientX,
                      e.touches[0].clientY
                    )}
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleStart("move", e.clientX, e.clientY);
                    }
                  }} // Add support for keyboard input
                >
                  <IoMove className="text-xl text-blue-500" />
                </div>

                <div
                  // Rotate Handle
                  role="button" // Add a role attribute to indicate that it's a button
                  tabIndex={0} // Add tabIndex to make it focusable
                  style={{
                    position: "absolute",
                    top: -28,
                    right: -28,
                    width: 24,
                    height: 24,
                    backgroundColor:"white",
                    cursor: "grab",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    touchAction: "none",
                    transform: `rotate(${-transform.rotation}deg)`,
                    transition: "background-color 0.2s, transform 0.3s",
                  }}
                  className="flex items-center justify-center"
                  onMouseDown={(e) =>
                    {e.stopPropagation(),handleStart("rotate", e.clientX, e.clientY)}
                  }
                  onTouchStart={(e) =>
                    handleStart(
                      "rotate",
                      e.touches[0].clientX,
                      e.touches[0].clientY
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleStart("rotate", e.clientX, e.clientY);
                    }
                  }} // Add support for keyboard input
                >
                  <FaArrowsRotate className="text-lg text-blue-500" />
                </div>
                <div
                  // Resize Handle
                  role="button" // Add a role attribute to indicate that it's a button
                  tabIndex={0} // Add tabIndex to make it focusable
                  style={{
                    position: "absolute",
                    bottom: -28,
                    right: -28,
                    width: 24,
                    height: 24,
                    backgroundColor:"white",
                    cursor: "nwse-resize",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    touchAction: "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseDown={(e) =>{e.stopPropagation(),
                    handleStart("resize", e.clientX, e.clientY)}
                  }
                  onTouchStart={(e) => {e.stopPropagation(),
                    handleStart(
                      "resize",
                      e.touches[0].clientX,
                      e.touches[0].clientY
                    )}
                  }
                  className="flex justify-center items-center "
                  onKeyDown={(e) => {
                    // Add support for keyboard input
                    if (e.key === "Enter" || e.key === " ") {
                      handleStart("resize", e.clientX, e.clientY);
                    }
                  }}
                >
                  {" "}
                  <IoResize className="text-blue-500 text-xl rotate-90" />{" "}
                </div>
              </div>
            </div>
          ) : (
            <img
              className="top-1 absolute max-h-[450px] z-40 max-sm:scale-90"
              src={"/images/Layer_40_face_preview.png"}
              alt="face preview"
            />
          )}

          {/* Other Layers */}
          <canvas
            ref={canvasSkinToneRef}
            width={"557px"}
            height={"800px"}
            className="absolute z-1 h-full "
          />
          <canvas
            ref={canvasTransparentRef}
            width={"557px"}
            height={"800px"}
            className="absolute  h-full z-50 pointer-events-none"
          />
          <canvas
            ref={canvasBodyRef}
            width={"557px"}
            height={"800px"}
            className=" absolute z-20 top-[0.20rem] h-full "
          />
        </div>
      </div>

      {/* Controls */}
      {step === 7 && (
        <>
          <div className="flex gap-4  absolute  right-10 bottom-1   ">
            <button
              onClick={() => handleAddToCart(productId, faceImage)}
              className="bg-green-600 text-white px-6 py-3 flex justify-center items-center rounded-md text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
              ) : (
                <FaCartPlus className="inline-block mr-2" />
              )}
              Add to Basket
            </button>
          </div>
        </>
      )}
    </div>
  );
};


export default ImageEditor;
