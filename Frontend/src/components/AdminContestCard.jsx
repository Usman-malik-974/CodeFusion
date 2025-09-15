import { useState, useEffect, useCallback } from "react";
import { Trash2, Edit, Edit2, Edit2Icon, EditIcon } from "lucide-react";
import React from "react";
import { MdContentCopy, MdDone } from "react-icons/md";

const AdminContestCard = React.memo(({ contest, type, onEditClick, onDeleteClick }) => {
  // useEffect(()=>{
  //    console.log("Admin card re rebderd");
  // },[contest])

  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((id) => {
    const text = `${import.meta.env.VITE_FRONTEND_URL}/test/${id}`; // get clicked element’s text
    navigator.clipboard.writeText(text).then(() => {
      // console.log("Copied:", text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000)
    });
  }, []);

  return (
    <div
      className="relative bg-gradient-to-b from-white to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-md 
      flex flex-col items-center text-center cursor-pointer
      transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:border-blue-400"
    >

      <h4 className="text-xl font-bold text-gray-800 tracking-wide text-center mb-3">
        {contest.name}
      </h4>

      {(type == "upcoming" || type == "live") && (
        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(contest.id) }} className="absolute top-7 right-5 hover:text-blue-500" title="Copy Contest Link">
          {copied ? <MdDone size={22} /> : <MdContentCopy size={22} />}
        </button>
      )}


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
        </div>
      )}

      {type === "upcoming" && (
        <div className="flex items-center gap-2 mt-3">
          <button
            title="Edit"
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            onClick={() => onEditClick(contest)}
          >
            <EditIcon size={18} />
          </button>
          <button
            title="Delete"
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            onClick={() => onDeleteClick(contest.id)}
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
});

export default AdminContestCard;
