import React, { useState,useEffect } from 'react';
import AddQuestionForm from './AddQuestionForm';
import { X } from 'lucide-react';
import { addQuestion } from '../shared/networking/api/questionApi/addQuestion';
import { toast } from 'react-toastify';
import { getAllQuestions } from '../shared/networking/api/questionApi/getAllQuestions';

const QuestionBank = () => {
   const [questions, setQuestions] = useState([]);
   const [searchInput, setSearchInput] = useState('');
   const [showAddForm, setShowAddForm] = useState(false);

   useEffect(() => {
      const fetchQuestions = async () => {
          try {
              const res = await getAllQuestions();
              if (res.error) {
                  toast.error(res.error);
              } else {
                  setQuestions(res.questions);
              }
          } catch (err) {
              toast.error("Something went wrong");
          } 
      };
          fetchQuestions();
  }, []);

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
         {showAddForm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
               <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
                  <button
                     className="absolute top-2 right-0 text-gray-500 hover:text-red-500"
                     onClick={() => setShowAddForm(false)}
                  >
                    <X size={24}/>
                  </button>
                  <AddQuestionForm
                     onClose={() => setShowAddForm(false)}
                     onSubmit={async(newQuestion) => {
                        try{
                        const res=await addQuestion(newQuestion);
                        console.log(res);
                        if (res.error) {
                           toast.error(result.error);
                           return;
                       }
                       setShowAddForm(false);
                        setQuestions((prev) => [...prev, res.question]);
                        toast.success(res.message);
                     }
                     catch(e){
                        toast.error('Some Internal Error occured');
                     }
                     }}
                  />
               </div>
            </div>
         )}
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
               onClick={() => setShowAddForm(true)}
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
