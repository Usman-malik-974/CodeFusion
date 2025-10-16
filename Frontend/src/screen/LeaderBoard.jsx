import React, { useEffect, useState } from "react";
import { getContestLeaderboard } from "../shared/networking/api/contestApi/getContestLeaderboard";
import { toast } from "react-toastify";
import socket from "../shared/soket";
import { FaEye } from "react-icons/fa";
import { Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import PlayerAnalysis from "../components/PlayerAnalysis";

const LeaderBoard = React.memo(() => {
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [showPlayerAnalysis, setShowPlayerAnalysis] = useState(false);
  const [playerAnalysisData, setPlayerAnalysisData] = useState(null);

  const location = useLocation();
  const contestId = location?.state?.contestId;

  // ✅ Fetch leaderboard initially
  useEffect(() => {
    const getLeaderboard = async (id) => {
      if (!id) return;
      const res = await getContestLeaderboard(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setLeaderBoardData(res.leaderboard || []);
    };
    getLeaderboard(contestId);
  }, [contestId]);

  // ✅ Setup socket listener
  useEffect(() => {
    if (!contestId) return;
    socket.emit("joinContestRoom", { id: contestId });

    const handleLeaderboardChange = ({ leaderboard }) => {
      setLeaderBoardData(leaderboard);
    };

    socket.on("leaderboard-changed", handleLeaderboardChange);

    return () => {
      socket.off("leaderboard-changed", handleLeaderboardChange);
      socket.emit("leaveContestRoom", { id: contestId });
    };
  }, [contestId]);

  // ✅ Handle view button
  const handleView = async (userId) => {
    setShowPlayerAnalysis(true);
    setPlayerAnalysisData({ userId, contestId });
  };

  // ✅ Close player analysis
  const handleCloseAnalysis = () => {
    // console.log("cloes")
    setShowPlayerAnalysis(false);
    setPlayerAnalysisData(null);
  };

  // ✅ Download leaderboard
  const handleDownload = () => {
    console.log(leaderBoardData);
    const filename = prompt("Enter file name:", "leaderboard.xlsx");
    if (!filename) return;
    const downloadData = leaderBoardData.map((l) => ({
      ["Rank"]: l.rank,
      ["Name"]: l.name,
      ["Email"]: l.email,
      ["Solved Questions"]: l.solvedCount,
      ["Total Questions"]: l.totalQuestions,
      ["Obtained Marks"]: l.obtainedMarks,
      ["Total Marks"]: l.totalMarks,
      ["Time Taken"]: `${Math.floor(l.totalTime / 3600)
        .toString()
        .padStart(2, "0")} : ${Math.floor((l.totalTime % 3600) / 60)
          .toString()
          .padStart(2, "0")} : ${Math.round((l.totalTime % 60), 2).toString().padStart(2, "0")}`
    }))
    const worksheet = XLSX.utils.json_to_sheet(downloadData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center p-6">
      {/* Player Analysis Modal */}
      {showPlayerAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-4xl p-6">
            <button
              onClick={handleCloseAnalysis}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold transition"
            >
              ✖
            </button>
            <PlayerAnalysis playerAnalysisData={playerAnalysisData} />
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-blue-700 mb-8">🏆 LeaderBoard</h1>

      <button
        className="absolute right-5 top-6 flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-green-700 transition cursor-pointer"
        onClick={handleDownload}
      >
        <Download size={16} />
        Download
      </button>

      <div className="w-full bg-white shadow-xl rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Obtained Marks</th>
              <th className="px-4 py-3">Total Marks</th>
              <th className="px-4 py-3">Solved</th>
              <th className="px-4 py-3">Total Questions</th>
              <th className="px-4 py-3">Total Time</th>
              <th className="px-4 py-3">Submissions</th>
            </tr>
          </thead>

          <tbody>
            {leaderBoardData && leaderBoardData.length > 0 ? (
              leaderBoardData.map((player, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                    } hover:bg-blue-100 transition`}
                >
                  <td className="px-4 py-3 font-bold text-blue-700">
                    {player.rank}
                  </td>
                  <td className="px-4 py-3">{player.name}</td>
                  <td className="px-4 py-3">{player.email}</td>
                  <td className="px-4 py-3">{player.obtainedMarks}</td>
                  <td className="px-4 py-3">{player.totalMarks}</td>
                  <td className="px-4 py-3">{player.solvedCount}</td>
                  <td className="px-4 py-3">
                    {player.totalQuestions || "NA"}
                  </td>
                  <td className="px-4 py-3">
                    {player.totalTime === 0
                      ? "-"
                      : `${Math.floor(player.totalTime / 3600)
                        .toString()
                        .padStart(2, "0")} : ${Math.floor(
                          (player.totalTime % 3600) / 60
                        )
                          .toString()
                          .padStart(2, "0")} : ${Math.round(
                            player.totalTime % 60
                          )
                            .toString()
                            .padStart(2, "0")}`}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleView(player.userId)}
                      className="flex items-center py-2 px-3 rounded-lg gap-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <FaEye size={16} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-3 text-center text-gray-500 italic"
                >
                  No participants yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default LeaderBoard;
