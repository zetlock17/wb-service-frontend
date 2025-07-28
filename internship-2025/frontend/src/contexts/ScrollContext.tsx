import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ScrollContextType {
  hideStickyElements: boolean;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContext must be used within a ScrollProvider");
  }
  return context;
};

interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider = ({ children }: ScrollProviderProps) => {
  const [hideStickyElements, setHideStickyElements] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollThreshold, setScrollThreshold] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - scrollThreshold);
      
      // не скрываем элементы в первых 150px от начала страницы
      if (currentScrollY < 150) {
        setHideStickyElements(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // определяем видимость sticky элементов только если проскроллили больше 50px от точки изменения состояния
      if (scrollDifference > 50) {
        if (currentScrollY > lastScrollY) {
          // скролл вниз на 50px+ - скрываем хедер
          setHideStickyElements(false);
          setScrollThreshold(currentScrollY);
        } else if (currentScrollY < lastScrollY) {
          // скролл вверх на 50px+ - показываем хедер
          setHideStickyElements(true);
          setScrollThreshold(currentScrollY);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <ScrollContext.Provider value={{ hideStickyElements }}>
      {children}
    </ScrollContext.Provider>
  );
};
