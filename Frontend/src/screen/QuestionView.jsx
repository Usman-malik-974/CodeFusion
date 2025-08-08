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
    const { id } = useParams();
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


    useEffect(() => {
        const savedLang = localStorage.getItem("language");
        if (savedLang) setLanguage(savedLang);

        const prevData = JSON.parse(localStorage.getItem(question.id));
        if (prevData && prevData.code) {
            setCode(prevData.code);
            if (prevData.language) setLanguage(prevData.language);
        }
    }, []);

    useEffect(() => {
        let prevCode = JSON.parse(localStorage.getItem(question.id));
        if (prevCode && prevCode.language && prevCode.language === language && prevCode.code != "") {
            setCode(prevCode.code);
        }
    }, [language])

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
        localStorage.setItem("language", lang);

        let template = "";
        if (lang === "c") {
            template = `#include <stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}`;
        } else if (lang === "cpp") {
            template = `#include <iostream>
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
        saveCodeToLocal(template, lang); // save change immediately
    };


    // Helper to save code + language for this question
    const saveCodeToLocal = (newCode = code, newLang = language) => {
        localStorage.setItem(
            question.id,
            JSON.stringify({ code: newCode, language: newLang })
        );
    };

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
                <div className="flex items-center gap-3 mb-3">
                    <h3
                        className={`font-bold text-3xl ${isDark ? "text-blue-400" : "text-blue-500"
                            }`}
                    >
                        {question?.title || "Untitled Question"}
                    </h3>

                </div>

                <div className="flex items-center gap-3 mb-4">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(
                            question?.difficulty
                        )}`}
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

                <div className="space-y-4">
                    <div>
                        <h3
                            className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"
                                }`}
                        >
                            Problem Statement:
                        </h3>
                        <pre
                            className={`whitespace-pre-wrap p-3 rounded-lg border transition-colors duration-300 ${isDark
                                ? "bg-neutral-700 border-neutral-600"
                                : "bg-blue-50 border-blue-100"
                                }`}
                        >
                            {question?.statement}
                        </pre>
                    </div>

                    <div>
                        <h3
                            className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"
                                }`}
                        >
                            Input Format:
                        </h3>
                        <p
                            className={`p-3 rounded-lg border transition-colors duration-300 ${isDark
                                ? "bg-neutral-700 border-neutral-600"
                                : "bg-blue-50 border-blue-100"
                                }`}
                        >
                            {question?.inputFormat}
                        </p>
                    </div>

                    <div>
                        <h3
                            className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"
                                }`}
                        >
                            Output Format:
                        </h3>
                        <p
                            className={`p-3 rounded-lg border transition-colors duration-300 ${isDark
                                ? "bg-neutral-700 border-neutral-600"
                                : "bg-blue-50 border-blue-100"
                                }`}
                        >
                            {question?.outputFormat}
                        </p>
                    </div>

                    <div>
                        <h3
                            className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"
                                }`}
                        >
                            Sample Input:
                        </h3>
                        <p className="bg-gray-900 text-white p-3 rounded-lg font-mono">
                            {question?.sampleInput}
                        </p>
                    </div>

                    <div>
                        <h3
                            className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-500"
                                }`}
                        >
                            Sample Output:
                        </h3>
                        <p className="bg-gray-900 text-white p-3 rounded-lg font-mono">
                            {question?.sampleOutput}
                        </p>
                    </div>
                </div>
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
                                <ClipLoader size={20} color="#fff" />
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
