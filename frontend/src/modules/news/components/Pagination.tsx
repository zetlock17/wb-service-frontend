interface PaginationProps {
  currentPage: number;
  onChangePage: (updater: (prev: number) => number) => void;
  hasNext: boolean;
}

const Pagination = ({ currentPage, onChangePage, hasNext }: PaginationProps) => (
  <div className="flex items-center justify-between pt-2">
    <button
      type="button"
      onClick={() => onChangePage((prev) => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      style={{ paddingLeft: 18, paddingRight: 18 }}
      className="rounded-full bg-white py-3 text-[14.5px] font-bold text-gray-700 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      ← Предыдущая
    </button>
    <span className="rounded-full bg-white px-5 py-3 text-[14.5px] font-bold text-gray-700">
      Стр. <span className="text-wb-green">{currentPage}</span>
    </span>
    <button
      type="button"
      onClick={() => onChangePage((prev) => prev + 1)}
      disabled={!hasNext}
      style={{ paddingLeft: 18, paddingRight: 18 }}
      className="rounded-full bg-white py-3 text-[14.5px] font-bold text-gray-700 transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      Следующая →
    </button>
  </div>
);

export default Pagination;
