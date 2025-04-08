import { useRef, useEffect, useState } from "react";
import { FaCartPlus } from "react-icons/fa";
import html2canvas from "html2canvas";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { v4 as uuidv4 } from 'uuid';

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
  imagePosition:{x:number,y:number};
  setImagePosition:React.Dispatch<React.SetStateAction<{x:number,y:number}>>;
  setScale:React.Dispatch<React.SetStateAction<number>>;
  scale: number;
}
const ImageEditor = ({
  faceImage,
  bodyImage,
  skinTone,
  headBackImage,
  step,
  productId,skinToneImage,rotation,imagePosition,setScale,scale,
  setImagePosition
}:ImageEditorProps) => {
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
      const imageWidth = imageElement.naturalWidth/3;
      const imageHeight = imageElement.naturalHeight/3;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 4;

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
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  
  // Add these touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 2) {
      // Calculate initial distance between two fingers
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchStartDistance(distance);
      setInitialScale(scale);
    } else if (touches.length === 1) {
      // Single touch start
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = touches[0];
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touches = e.touches;
  
    if (touches.length === 2 && pinchStartDistance) {
      // Handle pinch zoom
      const touch1 = touches[0];
      const touch2 = touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = (currentDistance / pinchStartDistance) * initialScale;
      // Limit scale between 0.1x and 3x
      setScale(Math.min(Math.max(newScale, 0.1), 3));
    } else if (touches.length === 1 && isDragging) {
      // Handle single touch drag
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = touches[0];
      const dx = touch.clientX - rect.left - dragStart.x;
      const dy = touch.clientY - rect.top - dragStart.y;
  
      setImagePosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
  
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    setPinchStartDistance(null);
    setLastScale(scale);
  };
  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - dragStart.x;  // Horizontal movement (left/right)
    const dy = e.clientY - rect.top - dragStart.y;   // Vertical movement (up/down)
  
    // Update position if there is movement in either direction
    setImagePosition((prevPos) => ({
      x: prevPos.x + dx,
      y: prevPos.y + dy,
    }));
  
    // Update the starting position for the next move
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Move left function

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      setScale((prevScale) => Math.max(prevScale - 0.01, 0.01)); 
    } else {
      setScale((prevScale) => prevScale + 0.01); 
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
    <div className={` flex-col border-r border-r-gray-500 items-center justify-center w-[50%] max-sm:w-full max-sm:border-b z-0 lg:min-h-[80vh] max-sm:min-h-[400px]  md:min-h-[80vh] ${step===0 || step===4 || step===7 ||step===8 ? "flex":"max-sm:hidden"}`}>
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
            <canvas
              id="canvasRef"
              ref={canvasRef}
              width={"557px"}
              height={"800px"}
              className=" sticky top-3 hover:cursor-grab hover:border-[6px] rounded-full border-[6px] border-transparent z-40 faceImage"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
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

// Reusable control button component


export default ImageEditor;