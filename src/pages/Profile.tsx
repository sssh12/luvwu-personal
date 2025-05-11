import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  board: string;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
}

const Profile = () => {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);
  const postsPerPage = 5;
  const commentsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const unsubscribePosts = onSnapshot(
      query(
        collection(db, "posts"),
        where("author", "==", user.email),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        // 페이지네이션 상태 업데이트
        const totalPosts = allPosts.length;
        setPostTotalPages(Math.ceil(totalPosts / postsPerPage));

        // 현재 페이지에 해당하는 글만 표시
        const offset = (postPage - 1) * postsPerPage;
        const paginatedPosts = allPosts.slice(offset, offset + postsPerPage);
        setPosts(paginatedPosts);
      },
      (error) => {
        console.error("Error fetching posts:", error);
      }
    );

    return () => unsubscribePosts();
  }, [user, postPage]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeComments = onSnapshot(
      query(
        collection(db, "comments"),
        where("author", "==", user.email),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const allComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];

        // 페이지네이션 상태 업데이트
        const totalComments = allComments.length;
        setCommentTotalPages(Math.ceil(totalComments / commentsPerPage));

        // 현재 페이지에 해당하는 댓글만 표시
        const offset = (commentPage - 1) * commentsPerPage;
        const paginatedComments = allComments.slice(
          offset,
          offset + commentsPerPage
        );
        setComments(paginatedComments);
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );

    return () => unsubscribeComments();
  }, [user, commentPage]);

  const handlePostPageChange = (page: number) => {
    setPostPage(page);
  };

  const handleCommentPageChange = (page: number) => {
    setCommentPage(page);
  };

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{user?.email}</h1>

      {/* 내가 쓴 글 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-600 mb-4">내가 쓴 글</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">작성한 글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
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
                  게시판: {post.board}
                </p>
              </li>
            ))}
          </ul>
        )}
        {/* 페이지네이션 */}
        <div className="flex justify-center mt-6">
          {Array.from({ length: postTotalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePostPageChange(index + 1)}
              className={`cursor-pointer px-4 py-2 mx-1 rounded ${
                postPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      {/* 내가 단 댓글 */}
      <section>
        <h2 className="text-xl font-bold text-gray-600 mb-4">내가 단 댓글</h2>
        {comments.length === 0 ? (
          <p className="text-gray-500">작성한 댓글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition duration-200"
              >
                <p className="text-gray-800">{comment.content}</p>
                <p
                  className="text-sm text-gray-500 mt-2 cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => navigate(`/post/${comment.postId}`)}
                >
                  글로 이동
                </p>
              </li>
            ))}
          </ul>
        )}
        {/* 페이지네이션 */}
        <div className="flex justify-center mt-6">
          {Array.from({ length: commentTotalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handleCommentPageChange(index + 1)}
              className={`cursor-pointer px-4 py-2 mx-1 rounded ${
                commentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Profile;
