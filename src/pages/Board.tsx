import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
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
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 10;
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchTotalPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, "posts"),
          where("board", "==", boardName)
        );
        const querySnapshot = await getDocs(postsQuery);
        const totalPosts = querySnapshot.size;
        setTotalPages(Math.ceil(totalPosts / postsPerPage));
      } catch (error) {
        console.error("Error fetching total posts:", error);
      }
    };

    fetchTotalPosts();
  }, [boardName]);

  const fetchPosts = async (page: number) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * postsPerPage;
      const postsQuery = query(
        collection(db, "posts"),
        where("board", "==", boardName),
        orderBy("createdAt", "desc"),
        limit(postsPerPage),
        ...(offset > 0 ? [startAfter(lastVisible)] : [])
      );

      const querySnapshot = await getDocs(postsQuery);
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(newPosts);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [boardName, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page);
  };

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
    <div className="page-container">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{boardName}</h1>
        <button
          className="cursor-pointer mt-4 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md"
          onClick={handleCreatePostClick}
        >
          글 작성하기
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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

        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`cursor-pointer px-4 py-2 mx-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
