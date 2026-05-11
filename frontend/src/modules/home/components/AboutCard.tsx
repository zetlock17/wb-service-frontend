import { Edit2, User } from "lucide-react";
import type { UserProfile } from "../../../types/portal";
import Card from "./Card";

interface AboutCardProps {
  user: UserProfile;
  canEditPersonalFields: boolean;
  startEditing: (section: string, field?: string, currentValue?: unknown) => void;
}

const AboutCard = ({ user, canEditPersonalFields, startEditing }: AboutCardProps) => (
  <Card
    title="О себе"
    icon={<User className="w-5 h-5 text-purple-600" />}
    action={
      canEditPersonalFields ? (
        <button
          onClick={() => startEditing("profile", "about_me", { about_me: user.about_me || "" })}
          className="px-4 py-2 text-sm font-normal text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <Edit2 className="w-4 h-4" /> Редактировать
        </button>
      ) : null
    }
  >
    <p className="text-gray-700 leading-relaxed">{user.about_me || "Не указано"}</p>
  </Card>
);

export default AboutCard;
