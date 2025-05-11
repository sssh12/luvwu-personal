import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: (props: { toggleSidebar: () => void }) => React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 기본적으로 닫힌 상태

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "16rem" }} // 사이드바 너비 설정
      >
        <Sidebar />
      </aside>

      {/* 메인 콘텐츠 */}
      <div
        className="flex-1 flex flex-col ml-0 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "0" }}
      >
        {/* 상단 네비게이션 바 */}
        <header className="bg-gray-900 text-white shadow-md z-10">
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </header>
        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-auto p-6">
          {children({ toggleSidebar })}
        </main>
      </div>
    </div>
  );
};

export default Layout;
