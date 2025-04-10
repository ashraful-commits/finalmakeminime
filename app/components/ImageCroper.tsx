import React, { useRef, useEffect } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { FaRedo, FaCrop,  } from "react-icons/fa";

interface ImageCropperProps {
  src: string;
  onCropChange?: (croppedImage: string) => void;
  onCrop?: (croppedImage: string) => void;
  className?: string;
  setUploadedPhoto?: React.Dispatch<React.SetStateAction<File | null>>;
  setCropedImage?: React.Dispatch<React.SetStateAction<string | null>>;
  setStep?: React.Dispatch<React.SetStateAction<number>>;
  step?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropChange,
  onCrop,
  className,
  setUploadedPhoto,
  setCropedImage,
  setStep,
  step,
}) => {
  const cropperRef = useRef<CropperRef>(null);

  useEffect(() => {
    if (cropperRef.current) {
      console.log("Cropper initialized");
    }
  }, []);

  const handleCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      
      if (canvas) {
        const croppedDataUrl: string = canvas.toDataURL("image/png");

        setCropedImage?.(croppedDataUrl);
        setStep?.(5);

        localStorage.setItem("cropedImage", JSON.stringify(croppedDataUrl));

        onCropChange?.(croppedDataUrl);
        onCrop?.(croppedDataUrl);
      }
    }
  };

  const resetCropper = () => {
    cropperRef.current?.reset();
  };

  const handleChangePhoto = () => {
    setUploadedPhoto?.(null);
    setStep?.(0);
  };

  return (
    <div
      className={`w-full h-full max-sm:relative max-sm:w-full justify-between max-sm:justify-center flex flex-col items-center space-y-4 min-h-full  max-sm:mb-5 ${
        step !== 7 ? " max-sm:min-h-[100vh]" : ""
      }`}
    >

<h1 className="my-5 text-blue-500 text-lg font-bold">Select Your Face</h1>

<p className="text-gray-500 text-sm my-2 text-center">Before cropping, take a moment to zoom in on your face for a precise selection. This ensures a perfect fit!</p>
      <Cropper
       autoZoom={true}
        ref={cropperRef}
        src={src}
        className={className || "w-full h-96 max-sm:h-52 min-h-[500px] max-sm:min-h-[300px] border border-gray-300"}
      />

      {/* Controls */}
      <div className="flex max-sm:scale- space-x-2  rounded-md justify-center items-center p-5 w-full  max-sm:z-100">
        <button
          onClick={handleChangePhoto}
          className="px-2 py-2 max-sm:trancate bg-blue-600 text-blue-100 hover:text-white text-sm rounded hover:bg-blue-800  flex justify-center items-center   gap-2"
        >
          Change Photo
        </button>
        <button
          onClick={resetCropper}
          className="px-2 py-2  max-sm:gap-1 bg-red-100 bg-opacity-50 text-red-900 hover:text-white text-sm rounded hover:bg-red-800 border border-red-800 flex justify-center items-center gap-2  max-sm:text-sm"
        >
          <FaRedo />
        </button>
        <button
          onClick={handleCrop}
          className="px-20 max-sm:px-8  max-sm:px-8 py-2 bg-blue-500   text-white text-sm rounded hover:bg-blue-800  flex justify-center items-center gap-2 max-sm:gap-1 "
        >
          <FaCrop className="font-xl" />{" "}
          <span className="trancate block">Confirm</span>
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
