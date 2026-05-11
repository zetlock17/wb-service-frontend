import { useEffect, useState } from "react";
import { fetchStatic } from "../../../api/filesApi";
import { getProfileByEid } from "../../../api/profileApi";
import type { UserProfile } from "../../../types/portal";

interface UseExternalProfileResult {
  externalProfile: UserProfile | null;
  setExternalProfile: (profile: UserProfile | null) => void;
  externalProfileLoading: boolean;
  externalProfileError: string | null;
  externalAvatarUrl: string | null;
}

export const useExternalProfile = (
  profileEid: string | undefined,
  isForeignProfile: boolean,
  currentUserReady: boolean,
): UseExternalProfileResult => {
  const [externalProfile, setExternalProfile] = useState<UserProfile | null>(null);
  const [externalProfileLoading, setExternalProfileLoading] = useState(false);
  const [externalProfileError, setExternalProfileError] = useState<string | null>(null);
  const [externalAvatarUrl, setExternalAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadExternalProfile = async () => {
      if (!profileEid || !currentUserReady || !isForeignProfile) {
        setExternalProfile(null);
        setExternalProfileError(null);
        return;
      }

      setExternalProfileLoading(true);
      setExternalProfileError(null);

      try {
        const response = await getProfileByEid(profileEid);
        if (response.status >= 200 && response.status < 300 && response.data) {
          setExternalProfile(response.data);
        } else {
          setExternalProfile(null);
          setExternalProfileError(response.message || "Не удалось загрузить профиль сотрудника");
        }
      } catch (error) {
        console.error("Failed to load external profile:", error);
        setExternalProfile(null);
        setExternalProfileError("Не удалось загрузить профиль сотрудника");
      } finally {
        setExternalProfileLoading(false);
      }
    };

    loadExternalProfile();
  }, [profileEid, currentUserReady, isForeignProfile]);

  useEffect(() => {
    const loadExternalAvatar = async () => {
      if (!isForeignProfile || !externalProfile?.avatar_id) {
        setExternalAvatarUrl(null);
        return;
      }

      const response = await fetchStatic(externalProfile.avatar_id);
      if (response.status === 200 && response.data) {
        setExternalAvatarUrl(response.data);
      } else {
        setExternalAvatarUrl(null);
      }
    };

    loadExternalAvatar();
  }, [isForeignProfile, externalProfile?.avatar_id]);

  return {
    externalProfile,
    setExternalProfile,
    externalProfileLoading,
    externalProfileError,
    externalAvatarUrl,
  };
};
