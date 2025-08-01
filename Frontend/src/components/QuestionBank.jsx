import React, { useState } from 'react';

const QuestionBank = () => {
   const initialQuestions = [
      {
         id: 1,
         title: 'Two Sum Problem',
         tags: ['Array', 'HashMap'],
         difficulty: 'Easy',
      },
      {
         id: 2,
         title: 'Longest Substring Without Repeating Characters',
         tags: ['String', 'Sliding Window'],
         difficulty: 'Medium',
      },
      {
         id: 3,
         title: 'Median of Two Sorted Arrays',
         tags: ['Array', 'Divide and Conquer'],
         difficulty: 'Hard',
      },
   ];

   const [questions, setQuestions] = useState(initialQuestions);
   const [searchInput, setSearchInput] = useState('');

   const handleSearch = (e) => {
      setSearchInput(e.target.value.toLowerCase());
   };

   const handleView = (id) => {
      console.log('View question with ID:', id);
   };

   const getDifficultyBadgeColor = (level) => {
      switch (level) {
         case 'Easy':
            return 'bg-green-100 text-green-700';
         case 'Medium':
            return 'bg-amber-200 text-yellow-700';
         case 'Hard':
            return 'bg-red-100 text-red-700';
         default:
            return 'bg-gray-100 text-gray-700';
      }
   };

   const filteredQuestions = questions.filter((q) =>
      q.title.toLowerCase().includes(searchInput) ||
      q.tags.some((tag) => tag.toLowerCase().includes(searchInput))
   );

   return (
      <div className="p-4 relative">
         <h3 className="text-3xl text-blue-500 font-semibold text-center mb-6">Question Bank</h3>

         {/* Top Controls */}
         <div className="flex items-center justify-between mb-4">
            <input
               type="text"
               placeholder="Search questions"
               className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 w-1/3"
               value={searchInput}
               onChange={handleSearch}
            />
            <button
               className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-600 transition"
               onClick={() => alert('Open Add Question Modal')} // Replace with modal later
            >
               Add Question +
            </button>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            {filteredQuestions.length > 0 ? (
               <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-md">
                  <thead className="bg-blue-100 text-left text-sm font-semibold text-blue-600">
                     <tr>
                        <th className="px-4 py-3 border-b border-blue-200">#</th>
                        <th className="px-4 py-3 border-b border-blue-200">Title</th>
                        <th className="px-4 py-3 border-b border-blue-200">Tags</th>
                        <th className="px-4 py-3 border-b border-blue-200">Difficulty</th>
                        <th className="px-4 py-3 border-b border-blue-200">Action</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                     {filteredQuestions.map((question, index) => (
                        <tr key={question.id} className="even:bg-gray-50 hover:bg-blue-50 transition">
                           <td className="px-4 py-3 border-b border-gray-200">{index + 1}</td>
                           <td className="px-4 py-3 border-b border-gray-200">{question.title}</td>
                           <td className="px-4 py-3 border-b border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                 {question.tags.map((tag, tagIndex) => (
                                    <span
                                       key={tagIndex}
                                       className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                                    >
                                       {tag}
                                    </span>
                                 ))}
                              </div>
                           </td>
                           <td className="px-4 py-3 border-b border-gray-200">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(question.difficulty)}`}>
                                 {question.difficulty}
                              </span>
                           </td>
                           <td className="px-4 py-3 border-b border-gray-200">
                              <button
                                 onClick={() => handleView(question.id)}
                                 className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition"
                              >
                                 View
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <h3 className="text-center text-xl text-gray-400 mt-6">No questions found</h3>
            )}
         </div>
      </div>
   );
};

export default QuestionBank;
