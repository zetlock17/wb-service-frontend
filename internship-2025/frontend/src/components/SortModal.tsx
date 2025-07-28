import { useState, useEffect } from "react";
import { type SortOption } from "../types/sortingTypes";
import { useSortingStore } from "../store/sortingStore";
import Cross from "../assets/cross.svg";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SortModal = ({ isOpen, onClose }: SortModalProps) => {
  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);
  
  const { currentSort, availableSorts, setSort } = useSortingStore();

  useEffect(() => {
    if (isOpen) {
      setSelectedSort(currentSort);
    }
  }, [isOpen, currentSort]);

  const handleSortSelect = (sortOption: SortOption) => {
    setSelectedSort(sortOption);
  };

  const handleApply = () => {
    if (selectedSort) {
      setSort(selectedSort);
    }
    onClose();
  };

  const handleBackdropClick = () => {
    handleApply();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-end justify-center z-50 modal-background" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-t-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[19px] font-semibold p-3">Сначала показать</h2>
          <button onClick={handleApply} className="h-12 w-12 flex justify-center items-center">
            <img src={Cross} alt="Close" />
          </button>
        </div>
        
        <div className="px-3">
          {availableSorts.map((sortOption) => (
            <div 
              key={sortOption.id} 
              className="flex items-center rounded-lg cursor-pointer justify-between px-3"
              onClick={() => handleSortSelect(sortOption)}
            >
              <span className="text-[16px] py-2">{sortOption.title}</span>
              <input
                type="radio"
                name="sort"
                checked={selectedSort?.id === sortOption.id}
                onChange={() => handleSortSelect(sortOption)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
              />
            </div>
          ))}
        </div>
        
        <div className="px-3 pt-3 pb-4">
          <button
            onClick={handleApply}
            className="px-5 py-3 bg-black text-white rounded-lg w-full"
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortModal;