import React from "react";
import Cross from "../../assets/cross.svg";
import { type Filter } from "../../types/filtersTypes";

interface ModalProps {
  filter: Filter;
  isOpen: boolean;
  onClose: () => void;
}

interface CompactProps {
  filter: Filter;
}

const withModal = <P extends CompactProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ModalComponent = ({ filter, isOpen, onClose }: ModalProps) => {
    const handleBackdropClick = () => {
      onClose();
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
            <h2 className="text-[19px] font-semibold p-3">
              {filter.title}{filter.measureUnit && (", " + filter.measureUnit)}
            </h2>
            <button onClick={onClose} className="h-12 w-12 flex justify-center items-center">
              <img src={Cross} alt="Close" />
            </button>
          </div>
           
          <div className="px-3">
            <WrappedComponent {...({ filter } as P)} />
          </div>
          
          <div className="px-3 pt-3 pb-4">
            <button
              onClick={onClose}
              className="px-5 py-3 bg-black text-white rounded-lg w-full"
            >
              Выбрать
            </button>
          </div>
        </div>
      </div>
    );
  };

  ModalComponent.displayName = `withModal(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ModalComponent;
};

export default withModal;
