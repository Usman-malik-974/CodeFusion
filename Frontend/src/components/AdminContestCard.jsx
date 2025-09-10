import { useState, useEffect } from "react";
import { Trash2, Edit, Edit2, Edit2Icon, EditIcon } from "lucide-react";

const AdminContestCard = ({ contest, type }) => {
  return (
    <div
      className="relative bg-gradient-to-b from-white to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-md 
      flex flex-col items-center text-center cursor-pointer
      transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-blue-400"
    >
      {/* {type === "upcoming" && (
        <div className="flex items-center justify-end gap-3 mt-3">
          <button
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            onClick={() => console.log("Edit contest:", contest.id)}
          >
            <EditIcon size={18} />
          </button>
          <button
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={() => console.log("Delete contest:", contest.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )} */}

      {/* Contest Name */}
      {/* <div className="relative flex items-center justify-center w-full mb-3"> */}
        {/* Contest Name (centered) */}
        <h4 className="text-xl font-bold text-gray-800 tracking-wide text-center mb-3">
          {contest.name}
        </h4>
      {/* </div> */}



      {/* Status Badge */}
      {type === "previous" && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-600 shadow-sm">
          🔴 Ended
        </span>
      )}

      {type === "live" && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-600 shadow-sm">
          🟢 Ends In: {contest.timeLeft || "Loading..."}
        </span>
      )}

      {type === "upcoming" && (
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600 shadow-sm">
          ⏳ Starts In: {contest.timeLeft || "Loading..."}
        </span>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

      {/* Duration */}
      <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 shadow-inner">
        ⏱ Duration: {contest.duration} mins
      </div>

      {type === "live" && (
        <div className="flex items-center gap-2 mt-3">
          <button
          title="Edit"
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            onClick={() => console.log("Edit contest:", contest.id)}
          >
            <EditIcon size={18} />
          </button>
          {/* <button
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={() => console.log("Delete contest:", contest.id)}
          >
            <Trash2 size={18} />
          </button> */}
        </div>
      )}

      {type === "upcoming" && (
        <div className="flex items-center gap-2 mt-3">
          <button
          title="Edit"
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            onClick={() => console.log("Edit contest:", contest.id)}
          >
            <EditIcon size={18} />
          </button>
          <button
            title="Delete"
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={() => console.log("Delete contest:", contest.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* Decorative 
      Glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent hover:border-blue-300 transition duration-500"></div>
    </div>
  );
};

export default AdminContestCard;
