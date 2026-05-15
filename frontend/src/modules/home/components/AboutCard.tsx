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
    icon={<User className="w-4 h-4 text-wb-green" />}
    action={
      canEditPersonalFields ? (
        <button
          onClick={() => startEditing("profile", "about_me", { about_me: user.about_me || "" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-full hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" /> Редактировать
        </button>
      ) : null
    }
  >
    <p className="text-gray-700 leading-relaxed">{user.about_me || "Расскажите коллегам о себе"}</p>
  </Card>
);

export default AboutCard;
