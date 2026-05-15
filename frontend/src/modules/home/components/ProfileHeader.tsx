import { Camera, Share2 } from "lucide-react";
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
  <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-5">
        <div
          className={`relative w-24 h-24 rounded-3xl group ${canEditAvatar ? "cursor-pointer" : "cursor-default"}`}
          onClick={canEditAvatar ? onAvatarClick : undefined}
        >
          <Avatar avatarUrl={displayedAvatarUrl ?? undefined} fullName={user.full_name} size={24} />
          {canEditAvatar && (
            <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">{getCasualName(user.full_name)}</h2>
            {currentVacation && (
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-3xl ${
                  getVacationStatus(currentVacation) === "active"
                    ? "bg-wb-green-light text-wb-green-dark"
                    : "bg-wb-pink-light text-wb-pink"
                }`}
              >
                {getVacationStatus(currentVacation) === "active" ? "В отпуске" : "Отпуск запланирован"}
              </span>
            )}
            <button className="p-1.5 hover:bg-gray-100 rounded-3xl transition-colors" aria-label="Поделиться профилем">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-600">{user.position}</p>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{user.eid}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileHeader;
