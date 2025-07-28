import { Link } from "react-router-dom";
import MainLogo from "../assets/main-logo.svg";
import Search from "../assets/search.svg";
import ShoppingCart from "../assets/shopping-cart.svg";

const MainHeader = () => {
  return (
    <header className="bg-black py-2 px-3 justify-between flex flex-row items-center sticky top-0">
        <Link to="/stub">
            <div className="py-1">
                <img src={MainLogo} alt="Main Logo" />
            </div>
        </Link>
        <div className="flex flex-row gap-2.5 items-center">
            <Link to="/stub" className="w-10 h-10 p-2">
                <div className="w-full h-full flex items-center justify-center">
                    <img src={Search} alt="Search" className="h-[17px] w-[17px]" />
                </div>
            </Link>
            <Link to="/stub" className="w-10 h-10 p-2">
                <div className="w-full h-full flex items-center justify-center">
                    <img src={ShoppingCart} alt="Shopping Cart" className="h-[18px] w-[20px]" />
                </div>
            </Link>
        </div>
    </header>
  );
};

export default MainHeader;