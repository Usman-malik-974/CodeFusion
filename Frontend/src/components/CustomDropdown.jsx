import { useState, useEffect } from "react";

const CustomDropdown = ({ questions, selectedQuestions, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState([]); // local state for multi-select

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

  // Sync tempSelected with selectedQuestions when dropdown opens
  useEffect(() => {
    if (open) {
      setTempSelected(selectedQuestions);
    }
  }, [open, selectedQuestions]);

  // Filter questions based on search query (case-insensitive)
  const filteredQuestions = questions.filter((q) => {
    const titleMatch = q.title.toLowerCase().includes(search.toLowerCase());
    const tagsMatch = q.tags.some((tag) =>
      tag.toLowerCase().includes(search.toLowerCase())
    );
    return titleMatch || tagsMatch;
  });

  const toggleSelect = (qId) => {
    if (tempSelected.includes(qId)) {
      setTempSelected(tempSelected.filter((id) => id !== qId));
    } else {
      setTempSelected([...tempSelected, qId]);
    }
  };

  const handleAddSelected = () => {
    if (tempSelected.length > 0) {
      // Merge new selections with parent, avoiding duplicates
      const unique = Array.from(new Set([...selectedQuestions, ...tempSelected]));
      onAdd(unique);
      setTempSelected([]);
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="relative w-full">
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center border border-gray-300 px-4 py-2 rounded-md bg-white shadow-sm hover:ring-2 hover:ring-blue-400"
      >
        {selectedQuestions.length > 0 ? (
          <span className="font-medium">
            {selectedQuestions.length} question(s) selected
          </span>
        ) : (
          "Select questions"
        )}
        <span className="ml-2">▼</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto flex flex-col">
          {/* Search bar + Add button */}
          <div className="p-2 border-b flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddSelected}
              disabled={tempSelected.length === 0}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Question list */}
          <div className="overflow-y-auto">
            {filteredQuestions.map((q) => {
              const isSelected = tempSelected.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`px-4 py-3 cursor-pointer border-b flex gap-2 items-center ${
                    isSelected ? "bg-blue-200" : "hover:bg-blue-50"
                  }`}
                >
                  <div className="font-semibold">{q.title}</div>
                  <div className="gap-2 mt-1">
                    {q.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="p-4 text-gray-500 text-center text-sm">
                No questions found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
