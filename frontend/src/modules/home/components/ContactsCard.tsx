import { Mail } from "lucide-react";
import type { UserProfile } from "../../../types/portal";
import InfoCard from "./InfoCard";
import ProfileRow from "./ProfileRow";

interface ContactsCardProps {
  user: UserProfile;
  canEditPersonalFields: boolean;
  isHr: boolean;
  startEditing: (section: string, field?: string, currentValue?: unknown) => void;
}

const ContactsCard = ({ user, canEditPersonalFields, isHr, startEditing }: ContactsCardProps) => (
  <InfoCard title="Контакты" icon={<Mail className="w-4 h-4 text-wb-green" />}>
    <div className="space-y-3">
      <ProfileRow
        label="Личный телефон"
        value={user.personal_phone}
        editable={canEditPersonalFields}
        onEdit={() => startEditing("profile", "personal_phone", { personal_phone: user.personal_phone })}
      />
      <ProfileRow
        label="Рабочий телефон"
        value={user.work_phone}
        editable={canEditPersonalFields}
        onEdit={() => startEditing("profile", "work_phone", { work_phone: user.work_phone })}
      />
      <ProfileRow
        label="Рабочая почта"
        value={user.work_email}
        link={`mailto:${user.work_email}`}
        editable={isHr}
        onEdit={() => startEditing("profile", "work_email", { work_email: user.work_email })}
        isSmall
      />
      <ProfileRow label="Band" value={user.work_band} editable={false} />
      <ProfileRow
        label="Telegram"
        value={user.telegram || "Не указан"}
        editable={canEditPersonalFields}
        onEdit={() => startEditing("profile", "telegram", { telegram: user.telegram || "" })}
      />
    </div>
  </InfoCard>
);

export default ContactsCard;
