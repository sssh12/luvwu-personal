import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CreateBoard = () => {
  const { user } = useAuthContext();
  const [boardName, setBoardName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await addDoc(collection(db, "boards"), {
        name: boardName,
        createdBy: user.email,
        createdAt: serverTimestamp(),
      });
      setBoardName("");
      navigate("/");
    } catch (error) {
      console.error("Error creating board: ", error);
      alert("게시판 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">게시판 생성하기</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="boardName"
            className="block text-sm font-medium text-gray-700"
          >
            게시판 이름
          </label>
          <input
            type="text"
            id="boardName"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="게시판 이름을 입력하세요"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md"
        >
          생성하기
        </button>
      </form>
    </div>
  );
};

export default CreateBoard;
