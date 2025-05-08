import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Board from "./pages/Board";
import CreatePost from "./pages/CreatePost";
import CreateBoard from "./pages/CreateBoard";
import PostDetail from "./pages/PostDetail";

const App = () => (
  <AuthProvider>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/board/:boardName" element={<Board />} />
          <Route
            path="/board/:boardName/create-post"
            element={<CreatePost />}
          />
          <Route path="/create-board" element={<CreateBoard />} />
          <Route path="/post/:postId" element={<PostDetail />} />
        </Routes>
      </Layout>
    </Router>
  </AuthProvider>
);

export default App;
