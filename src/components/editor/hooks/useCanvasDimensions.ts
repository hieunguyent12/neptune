import { useEffect, useState } from "react";

export function useCanvasDimensions() {
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });

  // we need to set the dimensions inside a useEffect because "window" does not exist when Next.js renders the page in the server
  useEffect(() => {
    setCanvasDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  return canvasDimensions;
}
