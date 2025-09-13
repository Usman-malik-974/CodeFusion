import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllQuestions } from "../shared/networking/api/questionApi/getAllQuestions";
import CreateContestForm from "./CreateContestForm";
import { Clock, PlayCircle, History } from "lucide-react"; // Icons
import { setQuestionsList } from '../app/slices/questionsSlice';
import { getUpcomingContests } from '../shared/networking/api/contestApi/getUpcomingContests'
import { getRecentContests } from '../shared/networking/api/contestApi/getRecentContests'
import { getLiveContests } from '../shared/networking/api/contestApi/getLiveContests'
import AdminContestCard from "./AdminContestCard";
import UpdateContestForm from "./updateContestForm";

const Contests = () => {
  const [activeTab, setActiveTab] = useState("live");
  const [previousContests, setPreviousContests] = useState([]);
  const [liveContests, setLiveContests] = useState([]);
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [showCreateContestForm, setShowCreateContestForm] = useState(false);
  const [showUpdateContestForm, setShowUpdateContestForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const questionsList = useSelector((state) => state.questions.questionsList);
  const [editContestData, setEditContestData] = useState(null);

  // When clicking edit

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

  // useEffect(() => {
  //   async function getContests() {
  //     if (activeTab == "upcoming") {
  //       const res = await getUpcomingContests();
  //       setUpcomingContests(res.contests);
  //     }
  //     else if (activeTab == "live") {
  //       const res = await getLiveContests();
  //       setLiveContests(res.contests);
  //     }
  //     else if (activeTab == "previous") {
  //       const res = await getRecentContests();
  //       setPreviousContests(res.contests);
  //     }
  //   }
  //   getContests();
  // }, [activeTab]);

  useEffect(() => {
    async function getContests() {
      const now = Date.now();

      if (activeTab === "upcoming") {
        const res = await getUpcomingContests();
        setUpcomingContests(
          res.contests.map((contest) => {
            const diff = new Date(contest.startTime).getTime() - now;
            return { ...contest, timeLeft: diff > 0 ? formatDiff(diff) : "" };
          })
        );
      } else if (activeTab === "live") {
        const res = await getLiveContests();
        setLiveContests(
          res.contests.map((contest) => {
            const diff = new Date(contest.endTime).getTime() - now;
            return { ...contest, timeLeft: diff > 0 ? formatDiff(diff) : "" };
          })
        );
      } else if (activeTab === "previous") {
        const res = await getRecentContests();
        setPreviousContests(res.contests);
      }
    }
    getContests();
  }, [activeTab]);


  useEffect(() => {


    const updateTimers = () => {
      const now = Date.now();

      // Handle upcoming contests
      setUpcomingContests((prev) =>
        prev
          .map((contest) => {
            const startMs = new Date(contest.startTime).getTime();
            const diff = startMs - now;

            if (diff <= 0) {
              // move contest to live
              setLiveContests((live) => [
                ...live,
                { ...contest, timeLeft: "" },
              ]);
              return null; // remove from upcoming
            }

            return {
              ...contest,
              timeLeft: formatDiff(diff),
            };
          })
          .filter(Boolean)
      );

      // Handle live contests
      setLiveContests((prev) =>
        prev
          .map((contest) => {
            const endMs = new Date(contest.endTime).getTime();
            const diff = endMs - now;

            if (diff <= 0) {
              setPreviousContests((prevPrev) => [contest, ...prevPrev]);
              return null; // remove from live
            }

            return {
              ...contest,
              timeLeft: formatDiff(diff),
            };
          })
          .filter(Boolean)
      );
    };

    // 🔹 Run once immediately (so no flicker)
    updateTimers();

    // 🔹 Then keep updating every second
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDiff = (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${days > 0 ? days + "d " : ""}${hours}h ${minutes}m ${seconds}s`;
  };
  const handleEditClick = (contest) => {
    // console.log(contest);
    setEditContestData(contest); // pass to form
    setShowUpdateContestForm(true);
  };

  const handleUpdateFormClose = useCallback(() => {
    setShowUpdateContestForm(false);
  }, []);


  return (
    <div className="p-4 relative">
      {showCreateContestForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative no-scrollbar animate-fadeIn">
            <CreateContestForm
              onClose={() => setShowCreateContestForm(false)}
              onCreate={(contest) => {
                setUpcomingContests([...upcomingContests, contest]);
              }}
              questions={questions}
            />
          </div>
        </div>
      )}
      {showUpdateContestForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative no-scrollbar animate-fadeIn">
            <UpdateContestForm
              onClose={handleUpdateFormClose}
              // onCreate={(contest) => {
              //   setUpcomingContests([...upcomingContests, contest]);
              // }}
              prevData={editContestData}
              questions={questions}
            />
          </div>
        </div>
      )}
      {/* Heading */}
      <h3 className="text-3xl text-blue-500 font-bold text-center mb-8 tracking-wide">
        Contest Management
      </h3>

      {/* Create button */}
      <div className="flex items-center justify-end mb-6">
        <button
          className="bg-blue-500 text-white text-sm px-5 py-2.5 rounded-lg shadow hover:bg-blue-600 hover:scale-105 transition-all"
          onClick={() => setShowCreateContestForm(true)}
        >
          + Create Contest
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { key: "previous", label: "Previous", icon: History, color: "red" },
            { key: "live", label: "Live", icon: PlayCircle, color: "green" },
            { key: "upcoming", label: "Upcoming", icon: Clock, color: "blue" },
          ].map(({ key, label, icon: Icon, color }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer
              ${active
                    ? `bg-${color}-100 text-${color}-600 shadow-sm border border-${color}-200`
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={16} className={active ? "text-blue-500" : "text-gray-400"} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "previous" &&
          (previousContests.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {previousContests.map((contest) => (
                <AdminContestCard key={contest.id} contest={contest} type="previous" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No previous contests</p>
          ))}

        {activeTab === "live" &&
          (liveContests.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveContests.map((contest) => (
                <AdminContestCard key={contest.id} contest={contest} type="live" />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No Live contests</p>
          ))}

        {activeTab === "upcoming" &&
          (upcomingContests.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingContests.map((contest) => (
                <AdminContestCard key={contest.id}
                  contest={contest}
                  onEditClick={() => handleEditClick(contest)} // okay
                  type="upcoming"
                // timeLeft={contest.timeLeft}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No upcoming contests</p>
          ))}
      </div>
    </div>

  );
};

export default Contests;
