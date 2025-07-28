import { Link } from "react-router-dom";
import { useEffect } from "react";
import MainHeader from "./MainHeader";
// import { useCategoriesStore } from "../store/categoriesStore";
import { useDataStore } from "../store/dataStore";

const MainPage = () => {
    const { 
        isLoading,
        error,
        isInitialized,
        loadAllData, 
        getAllCategories
    } = useDataStore();
    
    useEffect(() => {
        if (!isInitialized) {
            loadAllData();
        }
    }, [isInitialized, loadAllData]);
    
    const categories = getAllCategories();

    const getPathForCategory = (title: string) => {
        switch (title) {
            case "Гидроциклы":
                return "/hydrocycles";
            case "Лодочные моторы":
                return "/boat-motors";
            default:
                return "/stub";
        }
    };

    return (
    <>
        <MainHeader />
        <main className="pt-3">
            <div className="pb-4 px-3">
                <h1 className="text-[19px] font-bold ">
                    Водная техника
                </h1>
                <Link to="/stub" className="text-[16px] font-normal text-primary-blue">
                    Во Владивостоке
                </Link>
            </div>
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="p-3 text-center">Загрузка...</div>
                ) : error ? (
                    <div className="p-3 text-center text-red-500">Ошибка: {error}</div>
                ) : (
                    categories.map((category) => (
                        <Link
                            key={category.id}
                            to={getPathForCategory(category.title)}
                            className="text-[16px] font-normal text-primary-blue border-b border-[#D5D5D5] p-3"
                        >
                            {category.title}
                        </Link>
                    ))
                )}
            </div>
        </main>
    </>
    );
};

export default MainPage;