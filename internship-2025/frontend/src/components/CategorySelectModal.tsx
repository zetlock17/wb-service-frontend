import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Category } from "../types/categoriesTypes";
// import { useCategoriesStore } from "../store/categoriesStore";
import { useDataStore } from "../store/dataStore";
import Checkmark from "../assets/checkmark.svg";
import Cross from "../assets/cross.svg";

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
  initialShowAllCategories?: boolean;
}

const CategorySelectModal = ({ isOpen, onClose, currentCategory, onCategorySelect, initialShowAllCategories = false }: CategorySelectModalProps) => {
  const [showAllCategories, setShowAllCategories] = useState(initialShowAllCategories);

  const { 
      isInitialized,
      loadAllData, 
      getAllCategories
  } = useDataStore();

  useEffect(() => {
      if (!isInitialized) {
          loadAllData();
      }
  }, [isInitialized, loadAllData]);

  useEffect(() => {
    if (isOpen) {
      setShowAllCategories(initialShowAllCategories);
    }
  }, [isOpen, initialShowAllCategories]);

  const allCategories = getAllCategories();

  const getPathForCategory = (category: Category) => {

    switch (category.title) {
      case "Гидроциклы":
        return "/371";
      case "Лодочные моторы":
        return "/373";
      default:
        return "/stub";
    }
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category);
    onClose();
  };

  const handleAllSectionsClick = () => {
    setShowAllCategories(!showAllCategories);
  };

  const handleAllSectionsSelect = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold p-3 text-[19px]">
          {showAllCategories ? "Разделы" : "Категории"}
        </h2>
        <button onClick={onClose} className="h-12 w-12 flex justify-center items-center">
            <img src={Cross} alt="Close" />
        </button>
      </div>

      <div className="flex flex-col overflow-y-auto px-3 flex-1">
        <button
          onClick={handleAllSectionsClick}
          className={`flex items-center justify-between px-2 rounded-lg ${showAllCategories ? "bg-[#F3F3F3]" : "bg-white"}`}
        >
          <span className="text-left py-3">Все разделы</span>
          {showAllCategories && (
            <div className="flex items-center justify-center w-6 h-6">
                <img src={Checkmark} alt="Expanded" />
            </div>
          )}
        </button>

        {showAllCategories ? (
          allCategories.map((category) => (
            <Link
              key={category.id}
              to={getPathForCategory(category)}
              onClick={() => handleCategoryClick(category)}
              className="flex items-center justify-between p-3"
            >
              <span className="text-left">{category.title}</span>
            </Link>
          ))
        ) : (
          currentCategory && (
            <Link
              key={currentCategory.id}
              to={getPathForCategory(currentCategory)}
              onClick={() => handleCategoryClick(currentCategory)}
              className="flex items-center justify-between px-2 rounded-lg bg-[#F3F3F3]"
            >
              <span className="text-left py-3">{currentCategory.title}</span>
              <div className="flex items-center justify-center w-6 h-6">
                <img src={Checkmark} alt="Expanded" />
              </div>
            </Link>
          )
        )}
      </div>

      {!showAllCategories && (
        <div className="px-3 pt-3 pb-4 mt-auto">
          <button
            onClick={handleAllSectionsSelect}
            className="px-5 py-3 bg-black text-white rounded-lg w-full"
          >
            Показать объявления
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySelectModal;
