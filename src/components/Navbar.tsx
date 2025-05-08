import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("정말 로그아웃 하시겠습니까?");
    if (!confirmLogout) return;

    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <nav className="bg-white text-gray-800 p-4 flex items-center justify-between h-16 shadow-md">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
          title="사이드바 열기/닫기"
        >
          <Bars3Icon className="h-6 w-6 text-gray-800" />
        </button>
        <Link
          to="/"
          className="text-2xl font-bold font-sans hover:text-blue-500 transition"
        >
          LUVWU
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="cursor-pointer bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 active:bg-red-700 transition duration-200"
          >
            로그아웃
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 active:bg-blue-700 transition duration-200"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 active:bg-green-700 transition duration-200"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
