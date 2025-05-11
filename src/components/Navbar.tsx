import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar = ({
  toggleSidebar,
  isSidebarOpen,
}: {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}) => {
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
          className="mr-4 p-2 rounded-full hover:bg-gray-100 cursor-pointer transition duration-300"
          title={isSidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
        >
          <div className="transition-transform duration-300">
            {isSidebarOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-800" /> // 닫기 아이콘
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-800" /> // 햄버거 아이콘
            )}
          </div>
        </button>
        <Link
          to="/"
          className="text-2xl font-bold font-sans hover:text-blue-500 transition"
        >
          LUVWU
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <Link
            to="/profile"
            className="cursor-pointer bg-gray-200 text-gray-500 p-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-200"
            title="프로필"
          >
            <UserCircleIcon className="h-6 w-6" />
          </Link>
        )}
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
