import { getInitials } from "../../utils/nameUtils";

interface AvatarProps {
  avatarUrl?: string;
  fullName: string;
  size?: number;

}

const Avatar = ({ avatarUrl, fullName, size = 16 }: AvatarProps) => {
  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className={`w-${size} h-${size} rounded-full object-cover`}
        />
      ) : (
        <div 
          style={{ fontSize: `${size/10}rem` }}
          className={`w-${size} h-${size} bg-linear-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold`}
        >
          {getInitials(fullName)}
        </div>
      )}
    </>
  )
}

export default Avatar;