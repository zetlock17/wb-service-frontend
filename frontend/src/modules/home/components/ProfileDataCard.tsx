import { User } from "lucide-react";
import type { UserProfile } from "../../../types/portal";
import { formatDate } from "../utils/dateUtils";
import InfoCard from "./InfoCard";
import ProfileRow from "./ProfileRow";

interface ProfileDataCardProps {
  user: UserProfile;
  isHr: boolean;
  orgUnitIdByName: Map<string, number>;
  employeeIdByName: Map<string, string>;
  startEditing: (section: string, field?: string, currentValue?: unknown) => void;
}

const ProfileDataCard = ({
  user,
  isHr,
  orgUnitIdByName,
  employeeIdByName,
  startEditing,
}: ProfileDataCardProps) => (
  <InfoCard title="Данные профиля" icon={<User className="w-4 h-4 text-wb-green" />}>
    <div className="space-y-3">
      <ProfileRow label="EID" value={user.eid.toString()} editable={false} />
      <ProfileRow
        label="ФИО"
        value={user.full_name}
        editable={isHr}
        onEdit={() => startEditing("profile", "full_name", { full_name: user.full_name })}
      />
      <ProfileRow
        label="Должность"
        value={user.position}
        editable={isHr}
        onEdit={() => startEditing("profile", "position", { position: user.position })}
      />
      <ProfileRow
        label="Подразделение"
        value={user.org_unit}
        editable={isHr}
        onEdit={() =>
          startEditing("profile", "org_unit", {
            org_unit: user.org_unit,
            org_unit_id: orgUnitIdByName.get(user.org_unit) ?? null,
          })
        }
      />
      <ProfileRow
        label="Руководитель"
        value={user.manager_name || "Не указан"}
        editable={isHr}
        onEdit={() =>
          startEditing("profile", "manager_eid", {
            manager_name: user.manager_name || "",
            manager_eid: user.manager_name ? employeeIdByName.get(user.manager_name) ?? "" : "",
          })
        }
      />
      <ProfileRow
        label="HR BP"
        value={user.hr_name || "Не указан"}
        editable={isHr}
        onEdit={() =>
          startEditing("profile", "hrbp_eid", {
            hr_name: user.hr_name || "",
            hrbp_eid: user.hr_name ? employeeIdByName.get(user.hr_name) ?? "" : "",
          })
        }
      />
      <ProfileRow label="Дата рождения" value={formatDate(user.birth_date, "dm")} editable={false} />
      <ProfileRow label="Работает в компании" value={`с ${formatDate(user.hire_date)}`} editable={false} />
    </div>
  </InfoCard>
);

export default ProfileDataCard;
