import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllQuestions } from "../shared/networking/api/questionApi/getAllQuestions";
import CreateContestForm from "./CreateContestForm";
import { Clock, PlayCircle, History } from "lucide-react"; // Icons
import { setQuestionsList } from '../app/slices/questionsSlice';

const Contests = () => {
  const [activeTab, setActiveTab] = useState("live");
  const [previousContests, setPreviousContests] = useState([]);
  const [liveContests, setLiveContests] = useState([]);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [showCreateContestForm, setShowCreateContestForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const questionsList = useSelector((state) => state.questions.questionsList);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getAllQuestions();
        if (res.error) {
          console.error(res.error);
        } else {
          setQuestions(res.questions);
          dispatch(setQuestionsList(res.questions));
        }
      } catch (err) {
        console.error("Something went wrong");
      }
    };

    if (questionsList.length === 0) {
      fetchQuestions();
    } else {
      setQuestions(questionsList);
    }
  }, []);

  return (
    <div className="p-4 relative">
      {/* Modal Overlay for Create Contest */}
      {showCreateContestForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative no-scrollbar animate-fadeIn">
            <CreateContestForm
              onClose={() => setShowCreateContestForm(false)}
              questions={questions}
            />
          </div>
        </div>
      )}

      {/* Heading */}
      <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6 tracking-wide">
        Contest Management
      </h3>

      {/* Create button */}
      <div className="flex items-center justify-end mb-4">
        <button
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 hover:scale-105 transition transform"
          onClick={() => setShowCreateContestForm(true)}
        >
          Create Contest +
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-8 pb-2 border-b border-gray-200">
        {[
          { key: "previous", label: "Previous", color: "rose", icon: History },
          { key: "live", label: "Live", color: "green", icon: PlayCircle },
          { key: "upcoming", label: "Upcoming", color: "blue", icon: Clock },
        ].map(({ key, label, color, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center gap-2 font-semibold pb-2 transition-all ${
              activeTab === key
                ? `text-${color}-500 border-b-2 border-${color}-500`
                : `text-${color}-400 hover:text-${color}-500`
            }`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 space-y-3">
        {activeTab === "previous" &&
          (previousContests.length > 0 ? (
            previousContests.map((contest, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition cursor-pointer"
              >
                <h1 className="font-semibold text-gray-700">{contest.name}</h1>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No previous contests</p>
          ))}

        {activeTab === "live" &&
          (liveContests.length > 0 ? (
            liveContests.map((contest, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm bg-green-50 hover:shadow-md transition cursor-pointer flex justify-between items-center"
              >
                <h1 className="font-semibold text-green-700">{contest.name}</h1>
                <span className="text-xs px-2 py-1 bg-green-200 text-green-700 rounded-full animate-pulse">
                  🔴 Live
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No live contests</p>
          ))}

        {activeTab === "upcoming" &&
          (upcomingContests.length > 0 ? (
            upcomingContests.map((contest, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg shadow-sm bg-blue-50 hover:shadow-md transition cursor-pointer flex justify-between items-center"
              >
                <h1 className="font-semibold text-blue-700">{contest.name}</h1>
                <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">
                  ⏳ Starts Soon
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No upcoming contests</p>
          ))}
      </div>
    </div>
  );
};

export default Contests;
