import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthContext } from "../context/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: { seconds: number; nanoseconds: number }; // Firestore Timestamp
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: { seconds: number; nanoseconds: number }; // Firestore Timestamp
}

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuthContext(); // 로그인된 사용자 정보 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", postId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    const q = query(collection(db, "comments"), where("postId", "==", postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login"); // 로그인 페이지로 이동
      return;
    }

    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await addDoc(collection(db, "comments"), {
        postId,
        content: newComment,
        author: user.email, // 사용자 이메일 저장
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  if (!post) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  const createdAtDate = new Date(post.createdAt.seconds * 1000);
  const formattedDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAtDate);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
      <p className="text-gray-600 leading-relaxed mb-6">{post.content}</p>
      <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
        <span>작성자: {post.author}</span>
        <span>{formattedDate}</span>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-600 mb-4">댓글</h2>
        <div className="mb-4">
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            onClick={handleAddComment}
            className="cursor-pointer mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200"
          >
            댓글 작성
          </button>
        </div>

        {/* 댓글 목록에 스크롤 추가 */}
        <div className="max-h-96 overflow-y-auto space-y-4 border-t border-gray-200 pt-4">
          <ul>
            {comments.map((comment) => {
              const createdAtDate = new Date(comment.createdAt.seconds * 1000);
              const formattedDate = new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(createdAtDate);

              return (
                <li
                  key={comment.id}
                  className="p-4 bg-gray-100 rounded-lg shadow"
                >
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    작성자: {comment.author}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
