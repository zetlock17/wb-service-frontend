import { X } from "lucide-react";
import type { ModuleConfig, ModuleId } from "../../types/portal";

interface MobileNavProps {
  isOpen: boolean;
  modules: ModuleConfig[];
  activeModule: ModuleId;
  onSelect: (moduleId: ModuleId) => void;
  onClose: () => void;
}

const MobileNav = ({ isOpen, modules, activeModule, onSelect, onClose }: MobileNavProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Меню</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                onSelect(module.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 ${
                activeModule === module.id
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <module.icon className="w-5 h-5" />
              {module.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
