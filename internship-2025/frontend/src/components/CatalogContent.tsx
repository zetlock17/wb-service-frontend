import { Link } from "react-router-dom";
import { useState } from "react";
import CategoryArrow from "../assets/category-arrow.svg";
import { type Category } from "../types/categoriesTypes";
import { type Filter } from "../types/filtersTypes";
import CategorySelectModal from "./CategorySelectModal";

interface CatalogContentProps {
  isSub: boolean;
  pathname: string;
  currentCategory: Category;
  filters: Filter[];
  onSubscribeClick: () => void;
  onCategoryChange?: (category: Category | null) => void;
  totalCount?: number;
  originalCount?: number;
}

const CatalogContent = ({ pathname, currentCategory, onCategoryChange, totalCount }: CatalogContentProps) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleCategoryButtonClick = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCategoryModalClose = () => {
    setIsCategoryModalOpen(false);
  };

  const handleCategorySelect = (category: Category | null) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="px-3">
      <button className="pt-3 gap-1 flex flex-row items-center" onClick={handleCategoryButtonClick}>
        <span className="text-[19px] font-bold">
          {pathname}
        </span>
        <div className="w-4 h-4 flex items-center justify-center">
          <img src={CategoryArrow} alt="Arrow" />
        </div>
      </button>

      <div className="pt-1 flex justify-between">
        <span className="text-[16px] font-normal text-primary-blue">
          Во Владивостоке
        </span>
        <span className="text-[14px] text-[#8A8A8A]">
          {totalCount ? `${totalCount.toLocaleString("ru-RU")} предложений` : ""}
        </span>
      </div>

      { currentCategory?.seeAlso && (
        <div className="pt-3 mb-0.5">
          <Link to="/stub" className="border border-[#D5D5D5] rounded-[20px] py-1 px-3 text-[14px] leading-[20px]">
            {currentCategory.seeAlso}
          </Link>
        </div>
      )}

      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={handleCategoryModalClose}
        currentCategory={currentCategory}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
};

export default CatalogContent;
