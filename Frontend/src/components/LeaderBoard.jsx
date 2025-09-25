import React, { useEffect, useState } from "react";

const LeaderBoard = React.memo(({ onClose, contestId }) => {
    // dummy data
    const [leaderBoardData,setLeaderBoardData]=useState( [
        { rank: 1, name: "Alice", time: "12m 45s" },
        { rank: 2, name: "Bob", time: "14m 20s" },
        { rank: 3, name: "Charlie", time: "15m 05s" },
        { rank: 4, name: "David", time: "16m 50s" },
        { rank: 5, name: "Eva", time: "18m 10s" },
    ]);
    console.log(contestId);
    console.log("re")
    useEffect(() => {
        console.log("id");
    }, [contestId])
    useEffect(() => {
        console.log("onclose");
    }, [onClose])
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center p-6">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
            >
                ✖
            </button>
            <h1 className="text-3xl font-bold text-blue-700 mb-8">🏆 LeaderBoard</h1>

            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold">Rank</th>
                            <th className="px-6 py-3 text-sm font-semibold">Name</th>
                            <th className="px-6 py-3 text-sm font-semibold">Total Time Taken</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderBoardData.map((player, idx) => (
                            <tr
                                key={idx}
                                className={`${idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                                    } hover:bg-blue-100 transition`}
                            >
                                <td className="px-6 py-3 font-bold text-blue-700">
                                    {player.rank}
                                </td>
                                <td className="px-6 py-3">{player.name}</td>
                                <td className="px-6 py-3">{player.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default LeaderBoard;
