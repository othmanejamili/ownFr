import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_URL}`;
const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh =
    localStorage.getItem("refresh") ||
    sessionStorage.getItem("refresh");

    try {
      await axios.post(
        `${API_URL}/auth/logout/`,
        { refresh },
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("access") ||
              sessionStorage.getItem("access")
            }`,
          },
        }
      );
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear everything no matter what
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");

      delete axios.defaults.headers.common["Authorization"];

      navigate("/login");
    }

  };

  return ( <button
    onClick={handleLogout}
    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
  >
  Logout </button>
  );
};

export default LogoutButton;
