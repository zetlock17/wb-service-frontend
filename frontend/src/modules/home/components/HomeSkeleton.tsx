const HomeSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-36"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-64"></div>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-48"></div>
  </div>
);

export default HomeSkeleton;
