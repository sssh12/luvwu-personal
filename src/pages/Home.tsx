import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useAuthContext } from "../context/AuthContext";
import { PlusIcon } from "@heroicons/react/24/outline"; // + 아이콘 추가

interface Post {
  id: string;
  title: string;
  author: string;
  board: string;
}

interface Board {
  id: string;
  name: string;
}

const Home = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user } = useAuthContext();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const boardsSnapshot = await getDocs(collection(db, "boards"));
        const boardsData = boardsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Board[];

        // 배열을 랜덤으로 섞기
        const shuffledBoards = boardsData.sort(() => Math.random() - 0.5);

        // 최대 4개의 게시판만 표시
        setBoards(shuffledBoards.slice(0, 4));
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    const fetchRecentPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"), // 최초 작성 시간 기준으로 오름차순 정렬
          limit(5) // 최대 5개의 글만 가져오기
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setRecentPosts(postsData);
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    };

    fetchBoards();
    fetchRecentPosts();
  }, []);

  return (
    <div className="page-container">
      {/* 헤더 섹션 */}
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {user ? `${user.email}님, 환영합니다!` : "환영합니다!"}
        </h1>
      </header>

      {/* 게시판 목록 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-600">게시판 목록</h2>
        </div>
        <ul className="grid grid-cols-2 gap-4">
          {boards.map((board) => (
            <li
              key={board.id}
              className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition duration-200 cursor-pointer"
              onClick={() => navigate(`/board/${board.name}`)}
            >
              <h3 className="text-lg font-bold text-gray-800">{board.name}</h3>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-3">
          <button
            onClick={toggleSidebar}
            className="cursor-pointer bg-gray-200 text-gray-500 p-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-200"
            title="게시판 더 보기"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* 최근 작성된 글 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-600 mb-4">최근 작성된 글</h2>
        {recentPosts.length === 0 ? (
          <p className="text-gray-500">최근 작성된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {recentPosts.map((post) => (
              <li
                key={post.id}
                className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition duration-200"
              >
                <h3
                  className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  작성자: {post.author} | 게시판: {post.board}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Home;
