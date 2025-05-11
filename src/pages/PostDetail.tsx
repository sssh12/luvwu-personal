import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useAuthContext } from "../context/AuthContext";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  board: string;
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
}

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | null;
}

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post?.title || "");
  const [editedContentPost, setEditedContentPost] = useState(
    post?.content || ""
  );

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastVisibleComments, setLastVisibleComments] = useState<any[]>([]);
  const commentsPerPage = 5;

  useEffect(() => {
    const unsubscribePost = onSnapshot(doc(db, "posts", postId!), (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as Post);
      } else {
        console.error("No such document!");
      }
    });

    return () => unsubscribePost();
  }, [postId]);

  useEffect(() => {
    const unsubscribeComments = onSnapshot(
      query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const allComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[];

        // 페이지네이션 상태 업데이트
        const totalComments = allComments.length;
        setTotalPages(Math.ceil(totalComments / commentsPerPage));

        // 현재 페이지에 해당하는 댓글만 표시
        const offset = (currentPage - 1) * commentsPerPage;
        const paginatedComments = allComments.slice(
          offset,
          offset + commentsPerPage
        );
        setComments(paginatedComments);

        // 마지막 문서 업데이트
        if (snapshot.docs.length > 0) {
          setLastVisibleComments((prev) => {
            const updated = [...prev];
            updated[currentPage - 1] = snapshot.docs[snapshot.docs.length - 1];
            return updated;
          });
        }
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );

    return () => unsubscribeComments();
  }, [postId, currentPage]);

  const handleAddComment = async () => {
    if (!postId || !newComment.trim()) return;

    try {
      const commentRef = collection(db, "comments");
      const timestamp = serverTimestamp();
      await addDoc(commentRef, {
        postId,
        content: newComment,
        author: user?.email || "익명",
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("댓글 추가 중 오류가 발생했습니다.");
    }
  };

  const handleEditPost = () => {
    setIsEditingPost(true);
    setEditedTitle(post?.title || "");
    setEditedContentPost(post?.content || "");
  };

  const handleEditPostSubmit = async () => {
    if (!postId || !editedTitle.trim() || !editedContentPost.trim()) return;

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        title: editedTitle,
        content: editedContentPost,
        updatedAt: serverTimestamp(),
      });
      setIsEditingPost(false);
    } catch (error) {
      console.error("Error editing post:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;

    try {
      // 댓글 삭제
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const deleteCommentsPromises = commentsSnapshot.docs.map((commentDoc) =>
        deleteDoc(commentDoc.ref)
      );
      await Promise.all(deleteCommentsPromises);

      // 게시글 삭제
      const postRef = doc(db, "posts", postId!);
      const postSnapshot = await getDocs(
        query(collection(db, "posts"), where("id", "==", postId))
      );
      const boardName = postSnapshot.docs[0]?.data()?.board; // 게시판 이름 가져오기

      await deleteDoc(postRef);

      // 게시판으로 이동
      if (boardName) {
        navigate(`/board/${boardName}`);
      } else {
        navigate("/"); // 게시판 이름이 없으면 홈으로 이동
      }
    } catch (error) {
      console.error("Error deleting post and comments:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEditClick = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editedContent.trim()) return;

    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        content: editedContent,
        updatedAt: serverTimestamp(),
      });
      setEditingCommentId(null);
      setEditedContent("");
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!post) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  const createdAtDate = new Date(post.createdAt.seconds * 1000);
  const updatedAtDate = post.updatedAt
    ? new Date(post.updatedAt.seconds * 1000)
    : null;

  const formattedCreatedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAtDate);

  const isEdited =
    updatedAtDate && updatedAtDate.getTime() !== createdAtDate.getTime();

  return (
    <div className="page-container">
      {isEditingPost ? (
        <div>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={editedContentPost}
            onChange={(e) => setEditedContentPost(e.target.value)}
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleEditPostSubmit}
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditingPost(false)}
              className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition duration-200"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {post.title}
          </h1>
          <p className="text-gray-600 leading-relaxed mb-6">{post.content}</p>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
            <span>작성자: {post.author}</span>
            <span>
              {formattedCreatedAt} {isEdited && "(수정된 게시글)"}
            </span>
          </div>
          {user?.email === post.author && (
            <div className="flex justify-end space-x-2 mb-6">
              <button
                onClick={handleEditPost}
                className="cursor-pointer text-blue-500 hover:underline"
              >
                수정
              </button>
              <button
                onClick={handleDeletePost}
                className="cursor-pointer text-red-500 hover:underline"
              >
                삭제
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-600 mb-4">Comments</h2>
        <div className="mb-4 flex justify-end">
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="댓글을 입력하세요"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button
            onClick={handleAddComment}
            className="cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200 ml-4 flex items-center justify-center"
            style={{ width: "60px", height: "80px" }}
            title="댓글 저장"
          >
            <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
          </button>
        </div>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">댓글이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => {
              const createdAtDate = comment.createdAt
                ? new Date(comment.createdAt.seconds * 1000)
                : new Date(); // 기본값: 현재 시간
              const updatedAtDate = comment.updatedAt
                ? new Date(comment.updatedAt.seconds * 1000)
                : null;

              const formattedCreatedAt = new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(createdAtDate);

              const isEdited =
                updatedAtDate &&
                updatedAtDate.getTime() !== createdAtDate.getTime();

              return (
                <li
                  key={comment.id}
                  className="p-4 bg-gray-100 rounded-lg shadow"
                >
                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => handleEditSubmit(comment.id)}
                          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition duration-200"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800">{comment.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        작성자: {comment.author}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formattedCreatedAt} {isEdited && "(수정된 댓글)"}
                      </p>
                      {user?.email === comment.author && (
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={() =>
                              handleEditClick(comment.id, comment.content)
                            }
                            className="cursor-pointer text-blue-500 hover:underline"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="cursor-pointer text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* 페이지네이션 UI */}
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

export default PostDetail;
