import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 사이드바 상태 관리

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      {isSidebarOpen && (
        <aside className="w-64 bg-gray-100 h-full shadow-lg">
          <Sidebar />
        </aside>
      )}
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 네비게이션 바 */}
        <header className="bg-gray-900 text-white shadow-md z-10">
          <Navbar toggleSidebar={toggleSidebar} />
        </header>
        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
