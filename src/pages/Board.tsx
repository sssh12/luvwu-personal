import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useAuthContext } from "../context/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
}

const Board = () => {
  const { boardName } = useParams<{ boardName: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          where("board", "==", boardName),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [boardName]);

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleCreatePostClick = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      navigate(`/board/${boardName}/create-post`);
    }
  };

  return (
    <div className="flex flex-col h-full shadow-xl/20">
      {/* 고정된 헤더 */}
      <div className="bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800">{boardName}</h1>
        <button
          className="cursor-pointer mt-4 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md"
          onClick={handleCreatePostClick}
        >
          글 작성하기
        </button>
      </div>

      {/* 스크롤 가능한 영역 */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <ul className="space-y-4">
          {posts.length === 0 ? (
            <li className="text-gray-500 text-center">작성된 글이 없습니다.</li>
          ) : (
            posts.map((post) => (
              <li
                key={post.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200"
              >
                <h2
                  className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => handlePostClick(post.id)}
                >
                  {post.title}
                </h2>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {post.content}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  작성자: {post.author}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Board;
