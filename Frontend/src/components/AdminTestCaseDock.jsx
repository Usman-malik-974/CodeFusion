import { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FiCheck, FiX } from "react-icons/fi";

const AdminTestCaseDock = ({
    testCases,
    setTestCases,
    isDark,
    results,
    errorMessage,
    setErrorMessage,
    customInput,
    setCustomInput,
    customOutput,
    useCustomInput,
    setUseCustomInput,
    testCaseRunSuccess, // ✅ new prop
    isEditable,
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("testcases");

    useEffect(() => {
        if (errorMessage) {
            // ✅ Priority: Error → Console
            setActiveTab("console");
            setIsOpen(true);
        } else if (testCaseRunSuccess && results?.length) {
            // ✅ No error → TestCases
            setActiveTab("testcases");
            setIsOpen(true);
        } else if (customOutput) {
            // ✅ Optional: custom output without error
            setActiveTab("console");
            setIsOpen(true);
        }
    }, [errorMessage, testCaseRunSuccess, results, customOutput]);

    useEffect(() => {
        if (results && results[currentIndex]?.verdict === "Runtime Error" && results[currentIndex]?.error) {
            setActiveTab("console");
            setErrorMessage(results[currentIndex].error);
        }
    }, [results, currentIndex]);


    return (
        <div
            className={`absolute bottom-0 left-0 right-0 border-t shadow-lg transition-transform duration-300 ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-gray-300"
                }`}
            style={{ height: isOpen ? "250px" : "40px", zIndex: 50 }}
        >
            {/* Header with tabs */}
            <div
                className={`flex items-center justify-between px-4 h-10 ${isDark ? "bg-neutral-700 text-gray-200" : "bg-gray-100 text-gray-800"
                    }`}
            >
                <div className="flex h-full items-center">
                    {/* Test Cases Tab */}
                    <button
                        onClick={() => { setActiveTab("testcases") }}
                        className={`px-4 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === "testcases"
                            ? "border-blue-500 text-blue-500"
                            : "border-transparent hover:text-blue-400"
                            }`}
                    >
                        Test Cases
                    </button>

                    {/* Console Tab */}
                    <button
                        onClick={() => setActiveTab("console")}
                        className={`px-4 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === "console"
                            ? "border-blue-500 text-blue-500"
                            : "border-transparent hover:text-blue-400"
                            }`}
                    >
                        Console
                    </button>

                    {/* Custom Input Tab + Checkbox */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setActiveTab("custominput")}
                            className={`px-3 font-medium text-sm flex items-center border-b-2 transition-colors ${activeTab === "custominput"
                                ? "border-blue-500 text-blue-500"
                                : "border-transparent hover:text-blue-400"
                                }`}
                        >
                            Custom Input
                        </button>
                        <input
                            type="checkbox"
                            checked={useCustomInput}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setUseCustomInput(checked);
                                if (checked) setActiveTab("custominput"); // ✅ jump to Custom Input tab
                            }}
                        />

                    </div>
                </div>

                {/* Expand/Collapse */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-xs border px-2 py-1 rounded"
                >
                    {isOpen ? "▼" : "▲"}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Console View */}
                    {activeTab === "console" && (
                        <div
                            className={`p-4 font-mono text-sm overflow-auto ${isDark
                                ? "bg-neutral-900 text-gray-100"
                                : "bg-gray-50 text-gray-900"
                                }`}
                            style={{ height: "calc(100% - 40px)" }}
                        >
                            {errorMessage ? (
                                <pre className="text-red-500">Error: {errorMessage}</pre>
                            ) : customOutput ? (
                                <pre className="text-green-400">{customOutput}</pre>
                            ) : (
                                "Console output will appear here..."
                            )}
                        </div>
                    )}

                    {/* Test Cases View */}
                    {activeTab === "testcases" && (
                        <>
                            {/* Test case tabs */}
                            <div className={`flex border-b ${isDark ? "border-neutral-700" : "border-gray-300"}`}>
                                {testCases?.map((_, idx) => (
                                    <div key={idx} className="relative">
                                        <button
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${currentIndex === idx
                                                ? isDark
                                                    ? "bg-neutral-700 text-blue-400"
                                                    : "bg-gray-200 text-blue-600"
                                                : isDark
                                                    ? "hover:bg-neutral-700 text-gray-300"
                                                    : "hover:bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            <span>Case {idx + 1}</span>
                                            {results && results[idx]?.verdict && (
                                                results[idx].verdict === "Passed" ? (
                                                    <FiCheck className="text-green-500 font-bold text-lg" />
                                                ) : results[idx].verdict === "Failed" ? (
                                                    <FiX className="text-red-500 font-bold text-lg" />
                                                ) : results[idx].verdict === "Runtime Error" ? (
                                                    <span className="text-red-500 font-medium">
                                                        {results[idx].verdict}
                                                    </span>
                                                ) : null
                                            )}

                                            {/* Only show remove button in editable mode */}
                                            {isEditable && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent switching tab
                                                        if (window.confirm(`Are you sure you want to remove Test Case ${idx + 1}?`)) {
                                                            const updated = [...testCases];
                                                            updated.splice(idx, 1);
                                                            setTestCases(updated);
                                                            if (currentIndex >= updated.length) setCurrentIndex(updated.length - 1);
                                                        }
                                                    }}
                                                    className="ml-1 text-sm text-red-500 hover:text-red-700"
                                                    title="Remove Test Case"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </button>
                                    </div>
                                ))}

                                {/* Only show add button in editable mode */}
                                {isEditable && (
                                    <button
                                        onClick={() => {
                                            const updated = [...testCases, { input: "", output: "", hidden: false }];
                                            setTestCases(updated);
                                            setCurrentIndex(updated.length - 1); // switch to new test case
                                        }}
                                        className="px-3 ml-2 font-bold text-lg text-blue-500 hover:text-blue-600"
                                        title="Add Test Case"
                                    >
                                        +
                                    </button>
                                )}
                            </div>

                            {/* Test case content (Input/Output/Actual) */}
                            <div className="p-4 flex gap-6">
                                {/* Input */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sm">Input</span>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-sm font-semibold">Visibility</span>
                                            <div
                                                onClick={() => {
                                                    if (isEditable) {
                                                        const updated = [...testCases];
                                                        updated[currentIndex].hidden = !updated[currentIndex].hidden;
                                                        setTestCases(updated);
                                                    }
                                                }}
                                                className={`cursor-pointer ${isEditable ? "" : "opacity-50 pointer-events-none"}`}
                                            >
                                                {testCases[currentIndex]?.hidden ? (
                                                    <FiEyeOff className="text-red-400" title="Hidden Test Case" />
                                                ) : (
                                                    <FiEye className="text-green-500" title="Public Test Case" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <textarea
                                        readOnly={!isEditable}
                                        value={testCases[currentIndex]?.input || ""}
                                        onChange={(e) => {
                                            const updated = [...testCases];
                                            updated[currentIndex].input = e.target.value;
                                            setTestCases(updated);
                                        }}
                                        className={`w-full h-20 p-2 rounded border resize-none text-sm ${isDark
                                            ? "bg-neutral-900 border-neutral-700 text-gray-100"
                                            : "bg-gray-50 border-gray-300 text-gray-900"
                                            }`}
                                    />
                                </div>

                                {/* Expected Output */}
                                <div className="flex-1">
                                    <span className="font-semibold text-sm">Expected Output</span>
                                    <textarea
                                        readOnly={!isEditable}
                                        value={testCases[currentIndex]?.output || ""}
                                        onChange={(e) => {
                                            const updated = [...testCases];
                                            updated[currentIndex].output = e.target.value;
                                            setTestCases(updated);
                                        }}
                                        className={`w-full h-20 p-2 rounded border resize-none text-sm ${isDark
                                            ? "bg-neutral-900 border-neutral-700 text-gray-100"
                                            : "bg-gray-50 border-gray-300 text-gray-900"
                                            }`}
                                    />
                                </div>

                                {/* Actual Output */}
                                <div className="flex-1">
                                    <span className="font-semibold text-sm">Your Output</span>
                                    <textarea
                                        readOnly
                                        value={results && results[currentIndex]?.actual ? results[currentIndex]?.actual : ""}
                                        className={`w-full h-20 p-2 rounded border resize-none text-sm ${results && results[currentIndex]?.actual === testCases[currentIndex]?.output
                                            ? "border-green-500 text-green-600"
                                            : results && results[currentIndex]?.actual
                                                ? "border-red-500 text-red-600"
                                                : isDark
                                                    ? "bg-neutral-900 border-neutral-700 text-gray-100"
                                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                            }`}
                                    />
                                </div>
                            </div>
                        </>
                    )}



                    {/* Custom Input View */}
                    {activeTab === "custominput" && (
                        <div
                            className={`p-4 ${isDark
                                ? "bg-neutral-900 text-gray-100"
                                : "bg-gray-50 text-gray-900"
                                }`}
                            style={{ height: "calc(100% - 40px)" }}
                        >
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter custom input here..."
                                className={`w-full h-full p-2 rounded border resize-none text-sm ${isDark
                                    ? "bg-neutral-800 border-neutral-700 text-gray-100"
                                    : "bg-white border-gray-300 text-gray-900"
                                    }`}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminTestCaseDock;
