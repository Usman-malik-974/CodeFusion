import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";
import { VscRunAll } from "react-icons/vsc";
import { ClipLoader } from "react-spinners";
import { runCode } from "../shared/networking/api/codeApi/runCode";
import TestCaseDock from "../components/TestCaseDock";
import { runTestCases } from "../shared/networking/api/codeApi/runTestCases";
import { getQuestionSubmissions } from "../shared/networking/api/codeApi/getQuestionSubmissions";
import { SiTicktick } from "react-icons/si";
import ContestTimer from "../components/ContestTimer";
import { useDispatch } from "react-redux";
import { markQuestionSolved } from "../app/slices/contestQuestionsSlice";
import socket from "../shared/soket"
import ContestHeader from "../components/ContestHeader";
import { MdFullscreen } from "react-icons/md";
import { toast } from 'react-toastify'
import { useCallback } from "react";
import useContestActivityTracker from "../hooks/useContestActivityTracker";


const QuestionView = () => {
    // const { id } = useParams();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const question = location.state?.questionData;
    const contestId = location?.state.contestId;
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
    const [submissions, setSubmissions] = useState([]);
    const [showFullScreenPopup, setShowFullScreenPopup] = useState(false);
    // const violations = useContestActivityTracker();

    const [viewingCode, setViewingCode] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        const prevData = JSON.parse(localStorage.getItem(question.id));
        if (prevData && prevData.code && language === prevData.language) {
            if (contestId) {
                if (prevData.contestId == contestId) {
                    setCode(prevData.code);
                }
                return;
            }
            setCode(prevData.code);
        }
    }, [language]);

    useEffect(() => {
        if (!contestId) return;
        console.log(contestId);
        socket.emit("joinContestRoom", { id: contestId });
        // socket.on("contest-time-increased", ({ contestId, addedSeconds }) => {
        //     console.log("Increase by", addedSeconds);
        //     console.log(contestId);
        // })
        // socket.on("contest-ended", ({ contestId }) => {
        //     console.log("Ended ", contestId);
        // })
        return () => {
            socket.emit("leaveContestRoom", { id: contestId });
        }
    }, [contestId]);

    // useEffect(() => {
    //     let prevCode = JSON.parse(localStorage.getItem(question.id));
    //     if (prevCode && prevCode.language && prevCode.language === language && prevCode.code != "") {
    //         setCode(prevCode.code);
    //     }
    // }, [language])

    const goFullScreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
        sessionStorage.setItem("fullscreen", "true");
    };

    // useEffect(() => {
    //     console.log("tabSwitchCount ",violations.tabSwitchCount);
    //     console.log("fullscreenExitCount ",violations.fullscreenExitCount);
    //     console.log("blurCount ",violations.blurCount);
    //     if (violations.totalViolations > 0) {
    //         toast.warning(`⚠️ ${violations.totalViolations} suspicious actions detected.`);
    //     }
    // }, [violations.totalViolations]);

    // const [fullscreenchange, setfullscreenchange] = useState(0);
    // const [tabswitch, settabswitch] = useState(0);
    // const [visibilitychange,setvisibilitychange]=useState(0);

    // useEffect(() => {
    //     console.log("Full screnn change ", fullscreenchange);
    //     console.log("Tab switch change ", tabswitch);
    // }, [fullscreenchange, tabswitch])

    useEffect(() => {

        const handleFullScreenChange = () => {
            // setfullscreenchange((prev) => prev + 1);

            socket.emit("fullScreenChange", { contestId, token })
        }
        const handleTabSwitch = () => {
            // settabswitch((prev) => prev + 1);
            socket.emit("tabSwitch", { contestId, token })
        }
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("visibilitychange", handleTabSwitch);
        window.addEventListener("blur", handleTabSwitch);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("visibilitychange", handleTabSwitch);
            window.removeEventListener("blur", handleTabSwitch);
        };
    }, [])

    // 2️⃣ Detect when user exits fullscreen (e.g., presses ESC)

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                console.log("🚨 User exited fullscreen");
                // toast.error("You exited fullscreen mode! Please return.");
                // Optionally re-enter fullscreen or end contest
                // document.documentElement.requestFullscreen().catch(() => { });
                sessionStorage.removeItem("fullscreen");
                setShowFullScreenPopup(true); // Show popup again if needed
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);






    // 3️⃣ Show popup or go fullscreen on mount/contest start
    useEffect(() => {
        const isFullscreen = sessionStorage.getItem("fullscreen");

        if (isFullscreen) {
            goFullScreen(); // Continue fullscreen if previously active
            return;
        }

        if (contestId) setShowFullScreenPopup(true); // Ask to go fullscreen
    }, [contestId]);

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
            let res;
            if (contestId) {
                res = await runTestCases(code, language, question.id, contestId);
            }
            else {
                res = await runTestCases(code, language, question.id);
            }

            if (res.status && (res.status >= 401 && res.status <= 404)) {
                toast.error("Unauthorized Access");
                navigate("/login");
                return;
            }
            // console.log(res,res.error);
            if (res.error) {
                setErrorMessage(res.error);
            } else {
                setTestResults(res.results);
                const allPassed = res.results.every(r => r.verdict === "Passed");
                if (contestId && allPassed) {
                    dispatch(markQuestionSolved({ contestId, questionId: question.id }));
                }
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
            JSON.stringify({ code: newCode, language: newLang, contestId: contestId ? contestId : null })
        );
    };

    const LoadSubmissionData = async () => {
        //submission here
        const res = await getQuestionSubmissions(question.id);
        console.log(res);
        setSubmissions(res.submissions);
    }

    return (
        <div
            className={`flex flex-col lg:flex-row lg:justify-center gap-4 p-6 transition-colors duration-300 relative
    ${isDark ? "bg-neutral-900 text-gray-100" : "bg-blue-50 text-gray-900"}
    min-h-screen overflow-y-auto ${contestId ? "pt-[50px]" : ""}`}
        >

            {showFullScreenPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-sm text-center">
                        <p className="text-gray-800 font-semibold text-lg">
                            You need to switch to Full Screen to continue
                        </p>
                        <button
                            onClick={() => {
                                setShowFullScreenPopup(false);
                                goFullScreen();
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700 transition-colors duration-200"
                        >
                            <MdFullscreen /> Full Screen
                        </button>
                    </div>
                </div>
            )}

            {/* <div className="flex flex-col items-center justify-center"> */}
            {contestId && (
                <>

                    <ContestTimer id={contestId} />
                </>

                // <ContestHeader
                //     contestId={contestId}
                //     contestName="Live Coding Contest"
                //     questionTitle={question?.title}
                // />
            )}



            {/* </div> */}
            {/* Left Question Panel */}
            <div
                className={`w-full lg:w-1/2 shadow-lg rounded-xl p-6 border transition-colors duration-300 no-scrollbar
        ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-blue-200 "}`}
                style={{ overflowY: "auto" }} // scroll only this if content overflows
            >

                {/* {contestId && (
                    <button
                        onClick={() => navigate("/test/questions", { state: { id: contestId } })}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg font-medium shadow-sm transition-colors duration-300
        ${isDark
                                ? "bg-neutral-700 hover:bg-neutral-600 text-gray-100 border border-neutral-600"
                                : "bg-white hover:bg-blue-100 text-blue-500 border border-blue-300"
                            }`}
                    >
                        ← Go Back
                    </button>

                )} */}

                {!contestId && (
                    <div className="flex">
                        <button
                            className={`flex-1 p-3 text-center rounded-t-2xl  ${activeTab === "question"
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
                            className={`flex-1 p-3 text-center rounded-t-2xl ${activeTab === "submissions"
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
                )}




                {activeTab === "question" ? (
                    <div className='p-6'>
                        {/* Question Title */}
                        <div className="flex items-center justify-between gap-3 mb-3">

                            <h3
                                className={`font-bold text-3xl ${isDark ? "text-blue-400" : "text-blue-500"} flex items-center gap-2`}
                            >
                                {question?.title || "Untitled Question"}
                                {question.done && (
                                    <SiTicktick className="text-green-500" />
                                )}
                            </h3>
                            {contestId && (
                                <button
                                    onClick={() => navigate("/test/questions", { state: { id: contestId } })}
                                    className={`flex items-center gap-2 px-1.5 py-1 rounded-lg font-medium shadow-sm transition-colors duration-300
        ${isDark
                                            ? "bg-neutral-700 hover:bg-neutral-600 text-gray-100 border border-neutral-600"
                                            : "bg-white hover:bg-blue-100 text-blue-500 border border-blue-300"
                                        }`}
                                >
                                    ←Back
                                </button>

                            )}
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
                            onPaste={(e) => {
                                if (!contestId) return
                                const pastedText = e.clipboardData.getData("text/plain");
                                if (!pastedText.includes("CONTEST_ALLOWED_COPY_TOKEN")) {
                                    e.preventDefault();
                                    alert("External paste is blocked!");
                                }
                            }}
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
                    {!showFullScreenPopup && (


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
                            testCaseRunSuccess={testCaseRunSuccess}
                        />
                    )
                    }
                </div>
            </div>
        </div>
    );
};

export default QuestionView;
