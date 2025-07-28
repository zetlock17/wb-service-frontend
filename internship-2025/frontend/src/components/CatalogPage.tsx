import { useEffect, useState, useMemo } from "react";
import CatalogHeader from "./CatalogHeader";
import CatalogContent from "./CatalogContent";
import FlashNotification from "./FlashNotification";
import BulletinsList from "./BulletinsList";
import { useDataStore } from "../store/dataStore";
import { useLocation } from "react-router-dom";
import { useActiveFiltersStore } from "../store/activeFiltersStore";
import { useSortingStore } from "../store/sortingStore";
import { type Category } from "../types/categoriesTypes";
import { pathMap } from "../utils/pathMap";
import { processFilteredBulletins } from "../utils/bulletinFilters";
import Breadcrumbs from "./Breadcrumbs.tsx";
import FiltersHeader from "./FiltersHeader.tsx";


const CatalogPage = () => {
  const [isSub, setIsSub] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>("");
  const [notificationTimeout, setNotificationTimeout] = useState<number | null>(null);

  const navigate = useLocation();
  const pathname = navigate.pathname.split("/")[1];
  const russianPathname = pathMap(pathname);
  const categoryId = pathname === "hydrocycles" ? "371" : pathname === "boat-motors" ? "373" : "";

  const { 
      isLoading, 
      isInitialized,
      loadAllData, 
      getBulletinsByCategoryId,
      getFiltersByCategoryId,
      getCategoryByTitle
  } = useDataStore();

  useEffect(() => {
      if (!isInitialized) {
          loadAllData();
      }
  }, [isInitialized, loadAllData]);


  const rawBulletins = getBulletinsByCategoryId(categoryId);

  const handleButtonClick = () => {
    const newSubState = !isSub;
    setIsSub(newSubState);

    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    setNotificationMessage(newSubState ? "Подписка сохранена" : "Подписка отменена");
    setShowNotification(true);

    const newTimeout = setTimeout(() => {
      setShowNotification(false);
      setNotificationTimeout(null);
    }, 3000);

    setNotificationTimeout(newTimeout);
  };

  const handleCategoryChange = (category: Category | null) => {
    if (category) {
      setCurrentCategory(category);
      console.log("Selected category:", category);
    } else {
      setCurrentCategory({} as Category);
      console.log("Selected all categories");
    }
  };

  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notificationTimeout]);

  const [currentCategory, setCurrentCategory] = useState<Category>({} as Category);
  const { activeFilters } = useActiveFiltersStore();
  const { currentSort } = useSortingStore();

  useEffect(() => {
    if (isInitialized) {
      const category = getCategoryByTitle(pathname);
      setCurrentCategory(category || {} as Category);
    }
  }, [getCategoryByTitle, pathname, isInitialized]);

  useEffect(() => {
    console.log("currentCategory:", currentCategory);
  }, [currentCategory]);

  const filters = getFiltersByCategoryId(categoryId);

  const processedBulletins = useMemo(() => {
    return processFilteredBulletins(rawBulletins, activeFilters, currentSort);
  }, [rawBulletins, activeFilters, currentSort]);

  // логирование фильтров
  useEffect(() => {
    console.log("Active filters:", activeFilters);
  }, [activeFilters]);

  // логирование сортировки
  useEffect(() => {
    console.log("Current sort:", currentSort);
  }, [currentSort]);

  // логирование обработанных объявлений
  useEffect(() => {
    console.log(`Original bulletins: ${rawBulletins.length}, Filtered & sorted: ${processedBulletins.length}`);
  }, [rawBulletins.length, processedBulletins.length]);

  return (
    <>
      <CatalogHeader />
      <Breadcrumbs currentCategory={russianPathname} />
      <CatalogContent
          isSub={isSub}
          pathname={russianPathname}
          currentCategory={currentCategory}
          filters={filters}
          onSubscribeClick={handleButtonClick}
          onCategoryChange={handleCategoryChange}
          totalCount={processedBulletins.length}
      />
      <FiltersHeader
          isSub={isSub}
          // currentCategory={currentCategory}
          filters={filters}
          onSubscribeClick={handleButtonClick}
      />
      <BulletinsList 
        bulletins={processedBulletins} 
        isLoading={isLoading}
        // itemsPerPage={15}
      />
      { showNotification && (
        <FlashNotification message={notificationMessage} />
      )}
    </>
  );
};

export default CatalogPage;