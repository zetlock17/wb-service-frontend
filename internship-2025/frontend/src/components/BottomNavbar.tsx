import { Link, useLocation } from "react-router-dom";
import Search from "../assets/search-bottom-red.svg";
import Star from "../assets/star-bottom.svg";
import Plus from "../assets/plus-bottom.svg";
import Letter from "../assets/letter-bottom.svg";
import Account from "../assets/account-bottom.svg";
import Map from "../assets/map.svg";
import {useScrollContext} from "../contexts/ScrollContext.tsx";

const BottomNavbar = () => {
  const { hideStickyElements } = useScrollContext();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Search, alt: "Search" },
    { icon: Star, alt: "Star" },
    { icon: Plus, alt: "Plus" },
    { icon: Letter, alt: "Letter" },
    { icon: Account, alt: "Account" }
  ];

  return (
    <>
      {currentPath !== "/" && (
        <Link to="/stub" className={`fixed left-1/2 transform -translate-x-1/2 bg-black rounded-lg py-3 px-5 text-white flex flex-row gap-2 items-center transition-all duration-300 ease-in-out ${
            hideStickyElements ? "bottom-[48px]" : "bottom-[4px]"
        }`}>
          <div className="w-6 h-6 flex justify-center items-center">
            <img src={Map} alt="Map" />
          </div>
          <span>На карте</span>
        </Link>
      )}
      <nav className={`fixed bottom-0 w-full h-[44px] bg-white border border-[#D5D5D5] flex justify-between transition-transform duration-300 ease-in-out ${
          hideStickyElements ? "translate-y-0" : "translate-y-full"
      }`}>
        {navItems.map((item, index) => (
          <Link to="/stub" key={index} className="w-full flex justify-center items-center pt-1 pb-0.5 px-4">
            <div className="w-6 h-6 flex justify-center items-center">
              <img src={item.icon} alt={item.alt} />
            </div>
          </Link>
        ))}
      </nav> 
    </>
  );
};

export default BottomNavbar;