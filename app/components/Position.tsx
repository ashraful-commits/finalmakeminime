import React from "react";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaArrowUp,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";

const Position = ({ setStep, setImagePosition, setRotation, setScale }) => {
  const moveLeft = () => {
    setImagePosition((prevPos) => ({
      ...prevPos,
      x: prevPos.x - 10, // Adjust '10' to control the movement speed
    }));
  };

  // Move right function
  const moveRight = () => {
    setImagePosition((prevPos) => ({
      ...prevPos,
      x: prevPos.x + 10, // Adjust '10' to control the movement speed
    }));
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
  const handleConfirm = () => {
    setStep(8);
  };
  const handleBack = () => {
    setStep(3);
  };
  return (
    <div className="controls mt-1  w-[50%] max-w-4xl max-sm:max-w-full ">
      <h2 className="text-center max-sm:my-5 my-10 text-lg max-sm:text-sm font-bold w-full">Useing the tools below position the face on the items correctly</h2>
      <div className="grid grid-cols-3 gap-2  justify-center items-center max-sm:gap-4 max-sm:flex max-sm:justify-center">
        <div className="flex flex-col justify-center items-center order-2">
          <span className="text-blue-500">Rotate</span>
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={() => handleRotate(1)}
              className="text-gray-600  px-2 py-1 text-xl rounded-md  flex items-center gap-2 max-sm:flex-col max-sm:scale-75 scale-110  "
            >
              <FaRotateRight className="inline-block text-xl font-light" />
            </button>
            <button
              onClick={() => handleRotate(-1)}
              className="text-gray-600  px-2 py-1 text-xl rounded-md  flex items-center gap-2  max-sm:flex-col max-sm:scale-75 scale-110 "
            >
              <FaRotateLeft className="inline-block text-xl font-light" />
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center order-1  max-sm:col-span-1">
          <span className="text-blue-500">Move</span>
          <div className="flex gap-1 justify-center items-center">
            <button
              onClick={() => handleMove("up")}
              className="text-gray-600  px-2 py-1 text-xl rounded-md hover:text-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75 scale-110 "
            >
              <FaArrowUp className="inline-block text-xl font-light" />
            </button>
            <button
              onClick={() => handleMove("down")}
              className="text-gray-600  px-2 py-1 text-xl rounded-md hover:bg-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75 scale-110 "
            >
              <FaArrowDown className="inline-block text-xl font-light" />
            </button>
            <button
              onClick={() => moveLeft("left")}
              className="text-gray-600  px-2 py-1 text-xl rounded-md hover:text-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75 scale-110 "
            >
              <FaArrowLeft className="inline-block text-xl font-light" />
            </button>
            <button
              onClick={() => moveRight("right")}
              className="text-gray-600 px-2 py-1 text-xl rounded-md hover:text-gray-700 flex items-center gap-2  max-sm:flex-col max-sm:scale-75 scale-110 "
            >
              <FaArrowRight className="inline-block text-xl font-light" />
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center order-3">
          <span className="text-blue-500">Zoom</span>
          <div className="flex">
            <button
              onClick={() => setScale((prevScale) => prevScale + 0.01)}
              className=" text-gray-500 px-2 py-1 text-xl rounded-md hover:text-gray-700 flex items-center gap-2 max-sm:flex-col max-sm:scale-75"
            >
              <FaPlus className="inline-block text-xl font-light" />
            </button>
            <button
              onClick={() =>
                setScale((prevScale) => Math.max(prevScale - 0.1, 0.1))
              }
              className=" text-gray-500 px-2 py-1 text-xl rounded-md hover:text-gray-700 flex items-center gap-2 max-sm:flex-col max-sm:scale-75"
            >
              <FaMinus className="inline-block text-xl font-light" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end items-center min-w-80 max-sm:min-w-40 gap-3 mt-5 max-sm:mb-2">
        <button
          className="px-3 text-sm py-2 bg-gray-200 bg-opacity-50 text-gray-700 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 hover:bg-gray-700 focus:ring-gray-500 hover:text-white flex justify-center items-center gap-2"
          onClick={handleBack}
        >
          {" "}
          <FaArrowLeft /> <span className="inline-block">Back</span>
        </button>
        <button
          className="px-3 text-sm py-2 bg-blue-200 bg-opacity-50 text-blue-500 rounded-lg border border-blue-800 focus:outline-none focus:ring-2 hover:bg-blue-700 hover:text-white focus:ring-blue-500 flex justify-center items-center gap-2"
          onClick={handleConfirm}
        >
          <FaCheck /> <span className="inline-block">Confirm</span>
        </button>
      </div>
    </div>
  );
};

export default Position;
