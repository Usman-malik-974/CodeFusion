import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";
import { VscRunAll } from "react-icons/vsc";
import { ClipLoader } from "react-spinners";
import { runCode } from "../shared/networking/api/codeApi/runCode";
import TestCaseDock from "../components/TestCaseDock";
import { runTestCases } from "../shared/networking/api/codeApi/runTestCases";

const QuestionView = () => {
    // const { id } = useParams();
    const location = useLocation();

    const question = location.state?.questionData;
    // console.log(question);

    // const [testCaseOpen, setTestCaseOpen] = useState(true);
    const [language, setLanguage] = useState("c");
    const [code, setCode] = useState(`#include <stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}`);

    const [theme, setTheme] = useState("light");
    const [loader, showLoader] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [customInput, setCustomInput] = useState("");
    const [customOutput, setCustomOutput] = useState("");
    const [useCustomInput, setUseCustomInput] = useState(false);
    const [testCaseRunSuccess, setTestCaseRunSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("question");
    const [submissions, setSubmissions] = useState([
        {
            id: 1,
            user: "John Doe",
            problem: "Two Sum",
            language: "JavaScript",
            status: "Accepted",
            code: "sjakj",
            runtime: "120 ms",
            memory: "14 MB",
            submittedAt: "2025-08-12 14:35"
        },
        {
            id: 2,
            user: "Jane Smith",
            problem: "Reverse Linked List",
            language: "C++",
            status: "Wrong Answer",
            runtime: "—",
            memory: "—",
            submittedAt: "2025-08-12 14:40"
        },
        {
            id: 3,
            user: "Alex Johnson",
            problem: "Valid Parentheses",
            language: "Python",
            status: "Time Limit Exceeded",
            runtime: "—",
            memory: "—",
            submittedAt: "2025-08-12 14:50"
        }
    ]);

    const [viewingCode, setViewingCode] = useState(null);


    useEffect(() => {
        const prevData = JSON.parse(localStorage.getItem(question.id));
        if (prevData && prevData.code && language === prevData.language) {
            setCode(prevData.code);
        }
    }, [language]);

    // useEffect(() => {
    //     let prevCode = JSON.parse(localStorage.getItem(question.id));
    //     if (prevCode && prevCode.language && prevCode.language === language && prevCode.code != "") {
    //         setCode(prevCode.code);
    //     }
    // }, [language])

    const isDark = theme === "dark";

    const getDifficultyBadgeColor = (level) => {
        switch (level) {
            case "Easy":
                return "bg-green-100 text-green-700 border border-green-300";
            case "Medium":
                return "bg-amber-100 text-amber-700 border border-amber-300";
            case "Hard":
                return "bg-red-100 text-red-700 border border-red-300";
            default:
                return "bg-gray-100 text-gray-700 border border-gray-300";
        }
    };

    const handleRun = async () => {
        showLoader(true);

        // Reset states before running
        setErrorMessage(null);
        setTestResults(null);
        setCustomOutput(null);

        if (useCustomInput) {
            // Run with custom input
            const res = await runCode(code.trim(), language, customInput.trim());

            if (res.error) {
                setErrorMessage(res.error);
            } else {
                setCustomOutput(res.output); // ✅ triggers console tab
            }
        } else {
            setTestCaseRunSuccess(false);
            // Run with test cases
            const res = await runTestCases(code, language, question.id);

            if (res.status && (res.status >= 401 && res.status <= 404)) {
                toast.error("Unauthorized Access");
                navigate("/login");
                return;
            }

            if (res.error) {
                setErrorMessage(res.error);
            } else {
                setTestResults(res.results);
                setTestCaseRunSuccess(true); // ✅ triggers testcases tab
            }
        }

        showLoader(false);
    };


    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        // localStorage.setItem("language", lang);

        let template = "";
        if (lang === "c") {
            template = `#include <stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}`;
        } else if (lang === "cpp") {
            template = `#include <bits/stdc++.h>
using namespace std;
int main() {
    cout << "Hello, World!";
    return 0;
}`;
        } else if (lang === "java") {
            template = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
        } else if (lang === "python") {
            template = `print("Hello, World!")`;
        } else if (lang === "javascript") {
            template = `console.log("Hello, World!");`;
        }

        setCode(template);
        // saveCodeToLocal(template, lang); // save change immediately
    };


    // Helper to save code + language for this question
    const saveCodeToLocal = (newCode = code, newLang = language) => {
        localStorage.setItem(
            question.id,
            JSON.stringify({ code: newCode, language: newLang })
        );
    };

    const LoadSubmissionData = () => {
        //submission here
    }

    return (
        <div
            className={`flex flex-col lg:flex-row gap-4 p-6 transition-colors duration-300 ${isDark ? "bg-neutral-900 text-gray-100" : "bg-blue-50 text-gray-900"
                } lg:h-screen lg:overflow-hidden`}
        >

            {/* Left Question Panel */}
            <div
                className={`w-full lg:w-1/2 shadow-lg rounded-xl p-6 border transition-colors duration-300 no-scrollbar
        ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-blue-200 "}`}
                style={{ overflowY: "auto" }} // scroll only this if content overflows
            >
                <div className="flex">
                    <button
                        className={`flex-1 p-3 text-center rounded-md  ${activeTab === "question"
                            ? isDark
                                ? "bg-neutral-700"
                                : "bg-blue-100"
                            : ""
                            }`}
                        onClick={() => setActiveTab("question")}
                    >
                        Question
                    </button>
                    <button
                        className={`flex-1 p-3 text-center rounded-md ${activeTab === "submissions"
                            ? isDark
                                ? "bg-neutral-700"
                                : "bg-blue-100"
                            : ""
                            }`}
                        onClick={() => {
                            LoadSubmissionData();
                            setActiveTab("submissions")
                        }
                        }
                    >
                        Submissions
                    </button>
                </div>
                {activeTab === "question" ? (
                    <div className="p-6">
                        {/* Question Title */}
                        <div className="flex items-center gap-3 mb-3">
                            <h3
                                className={`font-bold text-3xl ${isDark ? "text-blue-400" : "text-blue-500"}`}
                            >
                                {question?.title || "Untitled Question"}
                            </h3>
                        </div>

                        {/* Difficulty & Tags */}
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(question?.difficulty)}`}
                            >
                                {question?.difficulty || "Unknown"}
                            </span>
                            {question?.tags?.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-300 ${isDark
                                            ? "bg-neutral-700 text-blue-300 border-neutral-600"
                                            : "bg-blue-100 text-blue-800 border-blue-200"
                                        }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Problem Sections */}
                        <div className="space-y-4">
                            {/* Problem Statement */}
                            <div>
                                <h3
                                    className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}
                                >
                                    Problem Statement:
                                </h3>
                                <pre
                                    className={`whitespace-pre-wrap p-3 rounded-lg border transition-colors duration-300 ${isDark
                                            ? "bg-neutral-700 border-neutral-600 text-white"
                                            : "bg-blue-50 border-blue-100 text-gray-800"
                                        }`}
                                >
                                    {question?.statement}
                                </pre>
                            </div>

                            {/* Input Format */}
                            <div>
                                <h3
                                    className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}
                                >
                                    Input Format:
                                </h3>
                                <pre
                                    className={`p-3 rounded-lg border transition-colors duration-300 ${isDark
                                            ? "bg-neutral-700 border-neutral-600 text-white"
                                            : "bg-blue-50 border-blue-100 text-gray-800"
                                        }`}
                                >
                                    {question?.inputFormat}
                                </pre>
                            </div>

                            {/* Output Format */}
                            <div>
                                <h3
                                    className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}
                                >
                                    Output Format:
                                </h3>
                                <pre
                                    className={`p-3 rounded-lg border transition-colors duration-300 ${isDark
                                            ? "bg-neutral-700 border-neutral-600 text-white"
                                            : "bg-blue-50 border-blue-100 text-gray-800"
                                        }`}
                                >
                                    {question?.outputFormat}
                                </pre>
                            </div>

                            {/* Sample Input */}
                            <div>
                                <h3
                                    className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}
                                >
                                    Sample Input:
                                </h3>
                                <pre
                                    className={`p-3 rounded-lg font-mono ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {question?.sampleInput}
                                </pre>
                            </div>

                            {/* Sample Output */}
                            <div>
                                <h3
                                    className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"}`}
                                >
                                    Sample Output:
                                </h3>
                                <pre
                                    className={`p-3 rounded-lg font-mono ${isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {question?.sampleOutput}
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Submissions Table */}
                        <table
                            className={`min-w-full border-collapse rounded-xl overflow-hidden shadow-md ${isDark ? "bg-neutral-800 text-white" : "bg-white text-gray-800"
                                }`}
                        >
                            <thead
                                className={`text-left text-sm font-semibold ${isDark ? "bg-neutral-700 text-blue-300" : "bg-blue-100 text-blue-600"
                                    }`}
                            >
                                <tr>
                                    <th className="px-4 py-3 border-b border-blue-200">Language</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Time</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Passed</th>
                                    <th className="px-4 py-3 border-b border-blue-200">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub, idx) => {
                                    const allPassed = sub.passed === sub.total;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover:bg-blue-50 transition ${isDark ? "even:bg-neutral-700 hover:bg-neutral-600" : "even:bg-gray-50"
                                                }`}
                                        >
                                            <td className="px-4 py-3 border-b border-gray-200">{sub.language}</td>
                                            <td className="px-4 py-3 border-b border-gray-200">
                                                {new Date(sub.submittedAt).toLocaleString()}
                                            </td>
                                            <td
                                                className={`border p-2 text-center font-bold ${allPassed ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {sub.passed}/{sub.total}
                                            </td>
                                            <td className="px-4 py-3 border-b border-gray-200">
                                                <button
                                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                                    onClick={() => setViewingCode(sub.code)}
                                                >
                                                    View Code
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* View Code Sidebar */}
                        {viewingCode && (
                            <div
                                className={`absolute top-0 left-0 h-full w-1/2 z-50 flex flex-col border-r ${isDark
                                        ? "bg-neutral-900 border-neutral-700"
                                        : "bg-white border-gray-300"
                                    }`}
                            >
                                <div
                                    className={`flex justify-between items-center p-4 border-b ${isDark
                                            ? "bg-neutral-800 border-neutral-700 text-white"
                                            : "bg-gray-100 border-gray-300 text-gray-800"
                                        }`}
                                >
                                    <h2 className="text-lg font-bold">Submitted Code</h2>
                                    <button
                                        className={`text-2xl font-bold hover:text-red-400 ${isDark ? "text-white" : "text-gray-800"
                                            }`}
                                        onClick={() => setViewingCode(null)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-6">
                                    <pre
                                        className={`whitespace-pre-wrap font-mono ${isDark ? "text-white" : "text-gray-800"
                                            }`}
                                    >
                                        {viewingCode}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}



            </div>

            {/* Right Editor Panel */}
            <div
                className={`w-full lg:flex-1 shadow-lg rounded-xl border overflow-hidden flex flex-col transition-colors duration-300 
        ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-blue-200"}`}
            >
                {/* Toolbar */}
                <div
                    className={`flex items-center justify-between px-4 py-2 border-b transition-colors duration-300 
          ${isDark ? "border-neutral-700" : "border-gray-300"}`}
                >
                    <select
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        value={language}
                        className={`rounded px-2 py-1 text-sm border ${isDark
                            ? "bg-neutral-900 text-white border-gray-600"
                            : "bg-white text-black border-gray-400"
                            }`}
                    >
                        <option value="c">C</option>
                        <option value="cpp">CPP</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">Javascript</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRun}
                            className="bg-blue-500 text-white flex items-center gap-1 px-3 py-1 rounded-md disabled:bg-gray-400"
                            disabled={loader}
                        >
                            {loader ? (
                                <ClipLoader size={24} color="#fff" />
                            ) : (
                                <>
                                    <VscRunAll />
                                    <span>Run</span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:scale-105 transition-transform"
                            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                        >
                            {isDark ? <MdOutlineDarkMode /> : <MdDarkMode />}
                            {isDark ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>

                {/* Editor + Testcase Dock Wrapper */}
                <div className="relative flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <Editor
                            language={language}
                            value={code}
                            onChange={(value) => {
                                setCode(value);
                                saveCodeToLocal(value);
                            }}
                            theme={isDark ? "vs-dark" : "vs-light"}
                            options={{
                                fontSize: 14,
                                lineNumbers: "on",
                                minimap: { enabled: false },
                                padding: { top: 8, bottom: 8 },
                                contextmenu: false,
                                scrollbar: {
                                    verticalScrollbarSize: 6,
                                    horizontalScrollbarSize: 6,
                                    handleMouseWheel: true,
                                    alwaysConsumeMouseWheel: false,
                                    useShadows: false,
                                },
                            }}
                            height="100%"
                        />
                    </div>
                    {/* TestCaseDock stays fixed to bottom of editor */}
                    <TestCaseDock
                        testCases={question.testCases}
                        isDark={isDark}
                        results={testResults}
                        errorMessage={errorMessage}
                        setErrorMessage={setErrorMessage}
                        customInput={customInput} // pass value
                        setCustomInput={setCustomInput} // pass setter
                        customOutput={customOutput}
                        useCustomInput={useCustomInput}
                        setUseCustomInput={setUseCustomInput}
                    />
                </div>
            </div>
        </div>
    );
};

export default QuestionView;
