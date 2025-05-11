import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  deleteDoc,
  doc,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuthContext } from "../context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Board {
  id: string;
  name: string;
  createdBy: string;
}

const Sidebar = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "boards"), orderBy("createdAt", "asc")),
      (snapshot) => {
        const boardList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Board[];
        setBoards(boardList);
      },
      (error) => {
        console.error("Error fetching boards:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDeleteBoard = async (boardName: string) => {
    const confirmDelete = window.confirm("게시판을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      // 게시판에 속한 글들 가져오기
      const postsQuery = query(
        collection(db, "posts"),
        where("board", "==", boardName)
      );
      const postsSnapshot = await getDocs(postsQuery);

      // 글에 달린 댓글 삭제
      const deleteCommentsPromises = postsSnapshot.docs.map(async (postDoc) => {
        const postId = postDoc.id; // 글의 ID
        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", postId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);

        const deleteComments = commentsSnapshot.docs.map((commentDoc) =>
          deleteDoc(commentDoc.ref)
        );
        await Promise.all(deleteComments);
      });

      await Promise.all(deleteCommentsPromises);

      // 글 삭제
      const deletePostsPromises = postsSnapshot.docs.map((postDoc) =>
        deleteDoc(postDoc.ref)
      );
      await Promise.all(deletePostsPromises);

      // 게시판 삭제
      const boardQuery = query(
        collection(db, "boards"),
        where("name", "==", boardName)
      );
      const boardSnapshot = await getDocs(boardQuery);

      const deleteBoardPromises = boardSnapshot.docs.map((boardDoc) =>
        deleteDoc(boardDoc.ref)
      );
      await Promise.all(deleteBoardPromises);
    } catch (error) {
      console.error("Error deleting board, posts, and comments:", error);
      alert("게시판 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <aside className="w-64 bg-gray-50 h-full p-4 shadow-lg flex flex-col">
      {/* 고정된 헤더 */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">게시판 목록</h2>
      </div>

      {/* 스크롤 가능한 영역 */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {boards.map((board) => (
            <li
              key={board.id}
              className="cursor-pointer hover:bg-gray-100 p-3 rounded-lg transition flex justify-between items-center"
            >
              <div onClick={() => navigate(`/board/${board.name}`)}>
                <span className="font-medium text-gray-800">{board.name}</span>
                <p className="text-sm text-gray-500">
                  생성자: {board.createdBy}
                </p>
              </div>
              {user?.email === board.createdBy && (
                <button
                  onClick={() => handleDeleteBoard(board.name)}
                  className="cursor-pointer bg-gray-200 text-gray-500 px-3 py-2 rounded-full hover:bg-red-500 hover:text-white transition duration-200"
                  title="게시판 삭제"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 고정된 하단 버튼 */}
      {user && (
        <button
          className="cursor-pointer mt-4 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md w-full"
          onClick={() => navigate("/create-board")}
        >
          게시판 생성
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
