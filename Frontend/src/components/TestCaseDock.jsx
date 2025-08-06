import { useState } from "react";
import { FiChevronUp, FiChevronDown, FiEye, FiEyeOff } from "react-icons/fi";

const TestCaseDock = ({ testCases, isDark }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 border-t shadow-lg transition-transform duration-300 ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-300"
                }`}
            style={{
                height: isOpen ? "250px" : "40px",
                zIndex: 50
            }}
        >

            {/* Header bar */}
            <div
                className={`flex items-center justify-between px-4 h-10 cursor-pointer ${isDark ? "bg-neutral-700 text-gray-200" : "bg-gray-100 text-gray-800"
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-sm text-blue-500">Test Cases</span>
                {isOpen ? <FiChevronDown /> : <FiChevronUp />}
            </div>

            {/* Show only if open */}
            {isOpen && (
                <>
                    {/* Case Tabs */}
                    <div
                        className={`flex border-b ${isDark ? "border-neutral-700" : "border-gray-300"}`}
                    >
                        {testCases.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`px-4 py-2 text-sm font-medium ${currentIndex === idx
                                    ? isDark
                                        ? "bg-neutral-700 text-blue-400"
                                        : "bg-gray-200 text-blue-600"
                                    : isDark
                                        ? "hover:bg-neutral-700 text-gray-300"
                                        : "hover:bg-gray-100 text-gray-800"
                                    }`}
                            >
                                Case {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex gap-6">
                        {/* Input */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm">Input</span>
                                {testCases[currentIndex].hidden ? (
                                    <FiEyeOff className="text-red-400" title="Hidden Test Case" />
                                ) : (
                                    <FiEye className="text-green-500" title="Public Test Case" />
                                )}
                            </div>
                            <textarea
                                readOnly
                                value={
                                    testCases[currentIndex].hidden
                                        ? "Hidden for this case"
                                        : testCases[currentIndex].input
                                }
                                className={`w-full h-20 p-2 rounded border resize-none text-sm ${isDark
                                        ? "bg-neutral-900 border-neutral-700 text-gray-100"
                                        : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                            />
                        </div>

                        {/* Output */}
                        <div className="flex-1">
                            <span className="font-semibold text-sm">Expected Output</span>
                            <textarea
                                readOnly
                                value={
                                    testCases[currentIndex].hidden
                                        ? "Hidden for this case"
                                        : testCases[currentIndex].output
                                }
                                className={`w-full h-20 p-2 rounded border resize-none text-sm ${isDark
                                        ? "bg-neutral-900 border-neutral-700 text-gray-100"
                                        : "bg-gray-50 border-gray-300 text-gray-900"
                                    }`}
                            />
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default TestCaseDock;
