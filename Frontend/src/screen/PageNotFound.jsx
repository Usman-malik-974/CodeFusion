import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react"; // optional icons if you use lucide-react

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-300 to-blue-400 px-4">
      {/* Wrapper Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-10 flex flex-col items-center text-center max-w-md">
        {/* Illustration / Emoji */}
        <div className="text-7xl mb-6 animate-bounce">🚧</div>

        <h1 className="text-6xl font-extrabold text-blue-500 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 text-white font-medium shadow-md hover:bg-blue-600 hover:scale-105 transition"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-blue-500 text-blue-500 font-medium shadow-md hover:bg-blue-50 hover:scale-105 transition"
          >
            <Home size={18} /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
