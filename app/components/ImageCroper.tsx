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
      className={`w-[50%] max-sm:relative max-sm:w-full justify-center flex flex-col items-center space-y-4 min-h-full  max-sm:mb-5 ${
        step !== 7 ? " max-sm:min-h-[100vh]" : ""
      }`}
    >
      <Cropper
        ref={cropperRef}
        src={src}
        className={className || "w-full h-96 border border-gray-300"}
      />

      {/* Controls */}
      <div className="flex max-sm:scale- space-x-2  rounded-md justify-center items-center p-5 w-full max-sm:sticky max-sm:bottom-0 max-sm:left-0 max-sm:z-100">
        <button
          onClick={handleChangePhoto}
          className="px-2 py-1 max-sm:trancate bg-gray-600 text-gray-100 hover:text-white text-sm rounded hover:bg-gray-800 border border-gray-800 flex justify-center items-center   gap-2"
        >
          Change Photo
        </button>
        <button
          onClick={resetCropper}
          className="px-2 py-1  max-sm:gap-1 bg-red-100 bg-opacity-50 text-red-900 hover:text-white text-sm rounded hover:bg-red-800 border border-red-800 flex justify-center items-center gap-2  max-sm:text-sm"
        >
          <FaRedo /> <span>Reset</span>
        </button>
        <button
          onClick={handleCrop}
          className="px-8 py-2 bg-blue-500   text-white text-sm rounded hover:bg-blue-800 border flex justify-center items-center gap-2 max-sm:gap-1 "
        >
          <FaCrop className="font-xl" />{" "}
          <span className="trancate block">Confirm</span>
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
