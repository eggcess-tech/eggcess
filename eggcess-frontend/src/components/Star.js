import { FaStar } from "react-icons/fa";
import { useState } from "react";

function Star({ rating, hoverRating, onClick, onHover }) {
  const isFilled = rating <= hoverRating;

  const handleMouseEnter = () => {
    onHover(rating);
  };

  return (
    <FaStar
      fontSize="15pt"
      color={isFilled ? "orange" : "lightgray"}
      onClick={() => onClick(rating)}
      onMouseEnter={handleMouseEnter}
      className="star" // Add this class
    />
  );
}

export default Star;
