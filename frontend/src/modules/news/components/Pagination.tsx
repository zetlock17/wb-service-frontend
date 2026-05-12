interface PaginationProps {
  currentPage: number;
  onChangePage: (updater: (prev: number) => number) => void;
  hasNext: boolean;
}

const Pagination = ({ currentPage, onChangePage, hasNext }: PaginationProps) => (
  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
    <button
      onClick={() => onChangePage((prev) => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      ← Предыдущая
    </button>
    <span className="text-sm text-gray-600">
      Страница <span className="font-semibold">{currentPage}</span>
    </span>
    <button
      onClick={() => onChangePage((prev) => prev + 1)}
      disabled={!hasNext}
      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Следующая →
    </button>
  </div>
);

export default Pagination;
