import { Link } from "react-router-dom";
import { useScrollContext } from "../contexts/ScrollContext";
import Arrow from "../assets/arrow-catalog.svg";
import Search from "../assets/search-catalog.svg";
import ShoppingCart from "../assets/shopping-cart-catalog.svg";

const CatalogHeader = () => {
  const { hideStickyElements } = useScrollContext();
  return (
    <header className={`sticky top-0 z-50 px-3 py-2 flex flex-row gap-2 bg-white transition-transform duration-300 ease-in-out ${
        hideStickyElements ? "translate-y-0" : "-translate-y-full"
    }`}>
      <Link to="/" className="py-2 pr-2.5 pl-1">
        <div className="w-6 h-6 flex items-center justify-center">
          <img src={Arrow} alt="Back" />
        </div>
      </Link>
      <div className="bg-[#F3F3F3] rounded-lg w-full h-11 ">
        <div className="py-2.5 pl-2.5 pr-2 flex flex-row gap-1">
          <div className="w-6 h-6 flex items-center justify-center">
            <img src={Search} alt="Search" />
          </div>
          <input
            type="text"
            placeholder="Текст"
            className="w-full outline-none text-[16px]"
          />
        </div>
      </div>
      <Link to="/stub" className="p-2">
        <div className="w-6 h-6 flex items-center justify-center">
          <img src={ShoppingCart} alt="Cart" />
        </div>
      </Link>
    </header>
  );
};

export default CatalogHeader;