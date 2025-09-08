import { useState } from "react";

const CustomDropdown = ({ questions, selectedQuestions, onAdd }) => {
  const [open, setOpen] = useState(false);

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative w-full">
      {/* Dropdown button */}
      <button
       type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border px-4 py-2 rounded-md bg-white shadow-sm hover:ring-2 hover:ring-blue-400"
      >
        {selectedQuestions.length > 0 ? (
          <span className="font-medium">
            {selectedQuestions.length} question(s) selected
          </span>
        ) : (
          "Select a question"
        )}
        <span className="ml-2">▼</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => {
                onAdd(q.id);
                setOpen(false);
              }}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex gap-4 border-b"
            >
              <div className="font-semibold">{q.title}</div>
              <div className="flex flex-wrap gap-2">
                {q.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                  q.difficulty
                )}`}
              >
                {q.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
