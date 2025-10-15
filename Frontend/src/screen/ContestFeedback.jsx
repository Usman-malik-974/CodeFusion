import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContestFeedback = () => {
  const navigate=useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-40"></div>

        {/* Success Icon */}
        <CheckCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 drop-shadow-md" />

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Contest Submitted 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Your submission was successful.  
          Stay tuned — results will be announced shortly!
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ContestFeedback;
