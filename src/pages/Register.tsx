import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 상태 추가
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("회원가입 성공!");
      navigate("/");
    } catch (error) {
      alert("회원가입 실패: " + (error as any).message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="text-xl font-bold mb-4">회원가입</h1>
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full border border-gray-300 p-2 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 active:bg-blue-700 transition duration-200 shadow-md"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Register;
