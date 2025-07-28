import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import CatalogPage from "./components/CatalogPage";
import BottomNavbar from "./components/BottomNavbar";
import StubPage from "./components/StubPage";
import { usePreloadData } from "./hooks/usePreloadData";
import {ScrollProvider} from "./contexts/ScrollContext.tsx";

function App() {
  // предварительно загружаем все данные
  usePreloadData();

  return (
    <BrowserRouter>
      <ScrollProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/:categoryId" element={<CatalogPage />} />
          <Route path="/stub" element={<StubPage />} />
        </Routes>
        <BottomNavbar />
      </ScrollProvider>
    </BrowserRouter>
  );
};

export default App;
