import { useContext } from "react";
import AuthContext from "../contexts/auth";
import AdminProfileView from "./AdminProfileView";
import UserProfileView from "./UserProfileView";

function ProfilePage() {
  const { user } = useContext(AuthContext);

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="profile">
      {user.role === "admin" || user.role === "manager" ? (
        <AdminProfileView />
      ) : (
        <UserProfileView />
      )}
    </div>
  );
}

export default ProfilePage;
