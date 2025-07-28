import Check from "../assets/check.svg";

interface FlashNotificationProps {
    message: string;
}

const FlashNotification = ({ message }: FlashNotificationProps) => {
  return (
    <div className="fixed top-1.5 left-1/2 transform -translate-x-1/2 w-[336px] h-[54px] rounded-xl p-4 gap-2 bg-[#EDF9E8] flex flex-row justify-start items-center z-50 text-[16px]">
        <img src={Check} alt="Check Icon" />
        <span>{message}</span>
    </div>
  );
};

export default FlashNotification;