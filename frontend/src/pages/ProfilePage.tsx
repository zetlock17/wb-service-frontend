import { Navigate, useNavigate, useParams } from "react-router-dom";
import HomeModule from "../modules/home/HomeModule";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { eid } = useParams<{ eid: string }>();

  if (!eid) {
    return <Navigate to="/home" replace />;
  }

  return (
    <HomeModule
      onNavigate={(moduleId) => navigate(`/${moduleId}`)}
      profileEid={eid}
    />
  );
};

export default ProfilePage;
