import { useState } from "react";
import Star from "./Star";

function StarRating({ onChange }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const changeRating = (newRating) => {
    setRating(newRating);
    onChange?.(newRating);
  };

  const handleHover = (newHoverRating) => {
    setHoverRating(newHoverRating);
  };

  return (
    <span>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          rating={value}
          hoverRating={hoverRating}
          onHover={handleHover}
          onClick={changeRating}
        />
      ))}
    </span>
  );
}

export default StarRating;
