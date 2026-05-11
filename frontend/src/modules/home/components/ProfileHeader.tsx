import { Camera, Edit2, Share2 } from "lucide-react";
import Avatar from "../../../components/common/Avatar";
import type { ProfileVacation, UserProfile } from "../../../types/portal";
import { getCasualName } from "../../../utils/nameUtils";
import { getVacationStatus } from "../utils/dateUtils";

interface ProfileHeaderProps {
  user: UserProfile;
  displayedAvatarUrl: string | null;
  canEditAvatar: boolean;
  currentVacation: ProfileVacation | null;
  onAvatarClick: () => void;
}

const ProfileHeader = ({
  user,
  displayedAvatarUrl,
  canEditAvatar,
  currentVacation,
  onAvatarClick,
}: ProfileHeaderProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div
          className={`relative w-20 h-20 rounded-full group ${canEditAvatar ? "cursor-pointer" : "cursor-default"}`}
          onClick={canEditAvatar ? onAvatarClick : undefined}
        >
          <Avatar avatarUrl={displayedAvatarUrl ?? undefined} fullName={user.full_name} size={20} />
          {canEditAvatar && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{getCasualName(user.full_name)}</h2>
            {currentVacation && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  getVacationStatus(currentVacation) === "active"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-purple-600 text-white"
                }`}
              >
                {getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Отпуск запланирован"}
              </span>
            )}
            <button className="p-1 hover:bg-gray-100 rounded" aria-label="Поделиться профилем">
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600">{user.position}</p>
          <p className="text-sm text-gray-500">{user.eid}</p>
        </div>
      </div>
      <button className="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
        <Edit2 className="w-4 h-4" />
        Редактировать профиль
      </button>
    </div>
  </div>
);

export default ProfileHeader;
