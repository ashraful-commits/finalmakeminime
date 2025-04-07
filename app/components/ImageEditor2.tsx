import { useRef, useEffect, useState } from "react";
import { FaCartPlus } from "react-icons/fa";
import html2canvas from "html2canvas";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { v4 as uuidv4 } from 'uuid';
import {
  FaArrowAltCircleUp,
  FaArrowAltCircleDown,
  FaPlus,
  FaMinus,
  FaSync,
} from "react-icons/fa";

const ImageEditor = ({
  faceImage,
  bodyImage,
  skinTone,
  headBackImage,
  setStep,
  step,
  productId,skinToneImage
}) => {
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


  // State
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.7);
  const [rotation, setRotation] = useState(0);
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
    defaultHeadBackImage
  ]);

  useEffect(() => {
    if (!canvasRef.current || !defaultFaceImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageElement = new Image();

    imageElement.src = defaultFaceImage;
    imageElement.crossOrigin = "anonymous";

    imageElement.onload = () => {
      const imageWidth = imageElement.naturalWidth;
      const imageHeight = imageElement.naturalHeight;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      ctx.drawImage(
        imageElement,
        -imageWidth / 2 + imagePosition.x,
        -imageHeight / 2 + imagePosition.y,
        imageWidth,
        imageHeight
      );
      ctx.restore();
    };
  }, [defaultFaceImage, imagePosition, scale, rotation]);

  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - dragStart.x;
    const dy = e.clientY - rect.top - dragStart.y;
    setImagePosition((prevPos) => ({
      x: prevPos.x + dx,
      y: prevPos.y + dy,
    }));
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      setScale((prevScale) => Math.max(prevScale - 0.01, 0.01)); 
    } else {
      setScale((prevScale) => prevScale + 0.01); 
    }
  };

  const handleRotate = (direction) => {
    setRotation((prevRotation) => prevRotation + direction * 5); 
  };

  const handleMove = (direction) => {
    switch (direction) {
      case "up":
        setImagePosition((prevPos) => ({ ...prevPos, y: prevPos.y - 5 }));
        break;
      case "down":
        setImagePosition((prevPos) => ({ ...prevPos, y: prevPos.y + 5 }));
        break;
      case "left":
        setImagePosition((prevPos) => ({ ...prevPos, x: prevPos.x - 5 }));
        break;
      case "right":
        setImagePosition((prevPos) => ({ ...prevPos, x: prevPos.x + 5 }));
        break;
      default:
        break;
    }
  };
  

  const handleAddToCart = async (id: string, faceImage: string) => {
    if (!containerRef.current || !faceImage) {
      console.error('Missing required elements for image processing');
      return;
    }
  
    setLoading(true);
  
    
    try {
      // Capture composite image
      const compositeCanvas = await html2canvas(containerRef.current, {
        useCORS: true,
        backgroundColor: "transparent",
        logging: process.env.NODE_ENV === 'development',
      });
  
      //uuid
      const uuidgen =  uuidv4();
      // Prepare upload promises
      const uploadImage = async (imageData: string, imageType: string) => {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData,uuid:uuidgen}),
        });
  
        if (!response.ok) {
          throw new Error(`${imageType} image upload failed (${response.status})`);
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
      window.location.href = `https://makeminime.vercel.app/product/${id}/customize?error=${encodeURIComponent((error as Error).message)}`;
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="flex flex-col border-r border-r-gray-500 items-center justify-center w-[50%] max-sm:w-full max-sm:border-b z-0 lg:min-h-[90vh] max-sm:min-h-[50vh] md:min-h-[80vh]">
      <div className="relative w-full flex justify-center items-center  bg-center bg-no-repeat max-sm:scale-50 md:scale-75 lg:scale-100 lg:min-h-[90vh] max-sm:min-h-[50vh] md:min-h-[80vh] max-sm:h-[35vh]">
        <div
          ref={containerRef}
          className="relative w-[557px] h-[800px] flex justify-center items-center top-0  "
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
            <canvas
              id="canvasRef"
              ref={canvasRef}
              width={"400px"}
              height={"500px"}
              className=" absolute top-3 hover:cursor-grab hover:border-[6px] rounded-full border-[6px] border-transparent hover:border-yellow-500 hover:border-dotted z-40"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            />
          ) : (
            <img
              className="top-1 absolute max-h-[500px] z-40"
              src="/images/Layer_40_face_preview.png"
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
            className="absolute  h-full z-0"
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
          <div className="flex gap-4 mt-10 absolute right-10 bottom-10 max-sm:bottom-0">
            <button
              onClick={() => handleAddToCart(productId, faceImage)}
              className="bg-green-600 max-sm:scale-75 text-white px-6 py-3 flex justify-center items-center rounded-md text-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" />
              ) : (
                <FaCartPlus className="inline-block mr-2" />
              )}
              Add to Basket
            </button>
          </div>

          {step === 7 && (
        <div className="controls mt-1">
          <div className="flex gap-2 justify-center items-center max-sm:gap-0">
            <button
              onClick={() => handleRotate(1)}
              className="bg-blue-600 text-white px-2 py-1 text-sm rounded-md hover:bg-blue-700 flex items-center gap-2 max-sm:flex-col max-sm:scale-75"
            >
              <FaSync className="inline-block text-sm font-light" /> <span className="inline-block">Rotate right</span>
            </button>
            <button
              onClick={() => handleRotate(-1)}
              className="bg-blue-600 text-white px-2 py-1 text-sm rounded-md hover:bg-blue-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75"
            >
              <FaSync className="inline-block transform rotate-180" /> <span className="inline-block">Rotate left</span>
            </button>

            <button
              onClick={() => handleMove("up")}
              className="bg-gray-600 text-white px-2 py-1 text-sm rounded-md hover:bg-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75"
            >
              <FaArrowAltCircleUp className="inline-block text-sm font-light" /> <span className="inline-block">Up</span>
            </button>
            <button
              onClick={() => handleMove("down")}
              className="bg-gray-600 text-white px-2 py-1 text-sm rounded-md hover:bg-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75"
            >
              <FaArrowAltCircleDown className="inline-block text-sm font-light" /> <span className="inline-block">Down</span>
            </button>

            <button
              onClick={() => setScale((prevScale) => prevScale + 0.01)}
              className="bg-gray-600 text-white px-2 py-1 text-sm rounded-md hover:bg-gray-700 flex items-center gap-2 max-sm:flex-col max-sm:scale-75"
            >
              <FaPlus className="inline-block text-sm font-light" /> <span className="inline-block">Zoom in</span>
            </button>
            <button
              onClick={() =>
                setScale((prevScale) => Math.max(prevScale - 0.01, 0.01))
              }
              className="bg-gray-600 text-white px-2 py-1 text-sm rounded-md hover:bg-gray-700 flex items-center gap-2 max-sm:flex-col max-sm:scale-75"
            >
              <FaMinus className="inline-block text-sm font-light" /> <span className="inline-block">Zoom out</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

// Reusable control button component


export default ImageEditor;