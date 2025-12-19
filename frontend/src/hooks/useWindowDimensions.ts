import { useState, useEffect } from 'react';

type Dimensions = { width: number; height: number };

function getWindowDimensions(): Dimensions {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return { 
    width: document.documentElement.clientWidth, 
    height: document.documentElement.clientHeight 
  };
}

export default function useWindowDimensions(): Dimensions {
  const [windowDimensions, setWindowDimensions] = useState<Dimensions>(() => getWindowDimensions());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowDimensions;
}
