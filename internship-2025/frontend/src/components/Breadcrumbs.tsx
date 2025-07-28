import { Link } from "react-router-dom";
// import { translations } from "../utils/translations";
import BreadcrumbsArrow from "../assets/breadcrumbs-arrow.svg";

interface BreadcrumbsProps {
    currentCategory: string;
}

const Breadcrumbs = ({ currentCategory }: BreadcrumbsProps) => {

    return (
    <nav className="px-3 text-[14px]">
        <div className="flex items-center gap-1.5">
        <Link to="/" className="text-[#585858]">
            Водный транспорт
        </Link>

        <div className="flex items-center justify-center">
            <img src={BreadcrumbsArrow} alt="Arrow" />
        </div>

        <span className="text-[#8A8A8A]">
            {currentCategory}
        </span>
        
        {/* {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            
            return (
            <div key={name} className="flex items-center gap-1.5">
                {isLast ? (
                <span className="text-[#8A8A8A]">
                    {translations(decodeURIComponent(name))}
                </span>
                ) : (
                <Link 
                    to={routeTo} 
                    className="text-[#585858]"
                >
                    {translations(decodeURIComponent(name))}
                </Link>
                )}
            </div>
            );
        })} */}
        </div>
    </nav>
    );
};

export default Breadcrumbs;