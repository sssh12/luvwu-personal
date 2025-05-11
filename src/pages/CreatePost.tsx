import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const CreatePost = () => {
  const { boardName } = useParams<{ boardName: string }>();
  const { user } = useAuthContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 게시판 존재 여부 확인
      const boardQuery = query(
        collection(db, "boards"),
        where("name", "==", boardName)
      );
      const boardSnapshot = await getDocs(boardQuery);

      if (boardSnapshot.empty) {
        alert("존재하지 않는 게시판입니다.");
        return;
      }

      // 게시글 추가
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author: user?.email,
        board: boardName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      navigate(`/board/${boardName}`);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("글 작성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">글 작성하기</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            제목
          </label>
          <input
            type="text"
            id="title"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            내용
          </label>
          <textarea
            id="content"
            className="w-full border border-gray-300 p-3 rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="cursor-pointer w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md"
        >
          작성하기
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
