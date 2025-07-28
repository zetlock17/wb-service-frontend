import { Link } from "react-router-dom";
import { type Bulletin } from "../types/bulletinsTypes";
import Eye from "../assets/icCountView.svg";
import { memo } from "react";

const BulletinCard = memo((bulletin: Bulletin) => {
  return (
    <Link to="/stub" className="p-3 flex flex-col gap-3 border-b border-[#D5D5D5]">
        <div className="flex flex-row gap-1 overflow-x-auto scrollbar-hide -mx-3">
            {bulletin.images.length > 0 && (
                bulletin.images.map((image, index) => (
                    <img
                        key={index}
                        src={image.url}
                        alt={`Bulletin image ${index + 1}`}
                        className="w-auto h-[180px] object-cover first:ml-3 last:mr-3 first:rounded-l-xl last:rounded-r-xl"
                    />
                ))
            )}
        </div>

        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <span className="text-primary-blue text-[19px] leading-6">{bulletin.subject}</span>
                {bulletin.info && (
                    <span className="text-[14px] leading-5">{bulletin.info.replaceAll("&nbsp;", " ")}</span>
                )}
            </div>

            <div className="flex flex-col">
                <span className="text-[19px] leading-6">{Number(bulletin["sell.priceNum"]).toLocaleString("ru-RU")} ₽</span>
                {bulletin.delivery !== null && (
                    <span className="text-[14px] leading-5">доставка по городу {bulletin.delivery.toLocaleString("ru-RU")} ₽</span>
                )}
            </div>

            <div className="flex flex-row justify-start items-center gap-4 text-[14px] leading-5 text-[#8A8A8A]">
                {bulletin.companyName && (
                    <span>{String(bulletin.companyName).replaceAll("&quot;", "'")}</span>
                )}

                <div className="flex flex-row gap-1 items-center">
                    <img src={Eye} alt="Views" />
                    <span>{bulletin["bulletin.views"]}</span>
                </div>
            </div>
        </div>
    </Link>
  );
});

BulletinCard.displayName = "BulletinCard";

export default BulletinCard;