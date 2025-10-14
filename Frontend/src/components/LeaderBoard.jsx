import React, { useEffect, useState } from "react";
import { getContestLeaderboard } from "../shared/networking/api/contestApi/getContestLeaderBoard";
import { toast } from "react-toastify";
import socket from "../shared/soket";
import { FaEye } from "react-icons/fa";
import { getUserPerformance } from "../shared/networking/api/contestApi/getUserPerformance";
const LeaderBoard = React.memo(({ onClose, contestId }) => {
    // dummy data
    const [leaderBoardData, setLeaderBoardData] = useState([]);
    console.log(contestId);
    console.log("re")
    useEffect(() => {
        console.log("id");
        const getLeaderboard = async (id) => {
            const res = await getContestLeaderboard(id);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            // console.log(res);
            setLeaderBoardData(res.leaderboard);
        }
        getLeaderboard(contestId);
    }, [contestId])
    useEffect(() => {

        if (!contestId) return;
        socket.emit("joinContestRoom", { id: contestId });
        socket.on('leaderboard-changed', ({ contestId, leaderboard }) => {
            setLeaderBoardData(leaderboard);
            console.log(leaderboard);
            // console.log(contestId);
        })
        // return () => {
        //     socket.emit("leaveContestRoom", { id: contestId });
        // }
    }, [contestId]);
    useEffect(() => {
        console.log("onclose");
    }, [onClose])

    const handleView=async(userId)=>{
        try{
            const res=await getUserPerformance(contestId,userId);
            if(res.error){
                toast.error(res.error);
                return;
            }
            console.log(res);
        }
        catch(e){
            toast.error("Something Went Wrong");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center p-6">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
            >
                ✖
            </button>
            <h1 className="text-3xl font-bold text-blue-700 mb-8">🏆 LeaderBoard</h1>

            <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold">Rank</th>
                            <th className="px-6 py-3 text-sm font-semibold">Name</th>
                            <th className="px-6 py-3 text-sm font-semibold">Email</th>
                            <th className="px-6 py-3 text-sm font-semibold">Obtained Marks</th>
                            <th className="px-6 py-3 text-sm font-semibold">Total Marks</th>
                            <th className="px-6 py-3 text-sm font-semibold">Solved</th>
                            <th className="px-6 py-3 text-sm font-semibold">Total Time</th>
                            <th className="px-6 py-3 text-sm font-semibold">Submissions</th>
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
                                    <td className="px-6 py-3 font-bold text-blue-700">
                                        {player.rank}
                                    </td>
                                    <td className="px-6 py-3">{player.name}</td>
                                    <td className="px-6 py-3">{player.email}</td>
                                    <td className="px-6 py-3">{player.obtainedMarks}</td>
                                    <td className="px-6 py-3">{player.totalMarks}</td>
                                    <td className="px-6 py-3">{player.solvedCount}</td>
                                    <td className="px-6 py-3">
                                        {`${Math.floor(player.totalTime / 3600)
                                            .toString()
                                            .padStart(2, "0")} : ${Math.floor((player.totalTime % 3600) / 60)
                                                .toString()
                                                .padStart(2, "0")} : ${Math.round((player.totalTime % 60), 2).toString().padStart(2, "0")}`}
                                    </td>

                                    <td className="px-6 py-3">
                                        <button onClick={()=>handleView(player.userId)} className="flex items-center py-2 px-3 rounded-lg gap-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                                            <FaEye size={16} />
                                            <span>View</span>
                                        </button>
                                    </td>


                                    {/* <td className="px-6 py-3">{player.time}</td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="3"
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
