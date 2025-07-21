import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { MdDarkMode, MdOutlineDarkMode } from "react-icons/md";
import { VscRunAll } from "react-icons/vsc";
import {runCode} from '../shared/networking/api/runCode';

const Playground = () => {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("c");
    const [theme, setTheme] = useState("light");
    const [stdin, setStdin] = useState("");
    const [output,setOutput]=useState("")

    const isDark = theme === 'dark';

    const handleRun = async() => {
        const res=await runCode(code.trim(),language,stdin.trim());
        console.log(res);
        if(res.error){
            setOutput(res.error);
        }
        else setOutput(res.output);
    }

    return (
        <div className={`w-full h-screen flex overflow-hidden ${isDark ? 'bg-neutral-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
            {/* Left Editor Panel */}
            <div className="w-1/2 flex flex-col">
                <header className="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                    <select
                        onChange={(e) => {
                            setCode("");
                            setLanguage(e.target.value);
                        }}
                        value={language}
                        className={`rounded px-2 py-1 text-sm border 
    ${isDark ? 'bg-neutral-900 text-white border-gray-600' : 'bg-white text-black border-gray-400'}`}
                    >
                        <option value="c">C</option>
                        <option value="cpp">CPP</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">Javascript</option>
                    </select>

                    <div className='flex items-center gap-2'>
                        <button onClick={handleRun} className="bg-blue-500 text-white flex items-center gap-1 px-3 py-1 rounded-md">
                            <VscRunAll />
                            Run
                        </button>
                        <button
                            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:scale-105 transition-transform"
                            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        >
                            {isDark ? <MdOutlineDarkMode /> : <MdDarkMode />}
                            {isDark ? 'Light' : 'Dark'}
                        </button>
                    </div>
                </header>

                <div className="flex-1">
                    <Editor
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme={isDark ? 'vs-dark' : 'vs-light'}
                        options={{
                            lineNumbers: 'on',
                            glyphMargin: false,
                            lineNumbersMinChars: 2,
                            minimap: { enabled: false },
                            padding: { top: 8, bottom: 8 },
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
            </div>

            {/* Right Output + STDIN Panel */}
            <div className={`w-1/2 flex flex-col border-l ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                {/* Output Area */}
                <div className="flex-1 overflow-auto p-2">
                    <p className="font-semibold mb-2">Output:</p>
                    <div className={`p-2 rounded ${isDark ? 'bg-neutral-800' : 'bg-white'} shadow-inner`}>
                        <pre>{output}</pre>
                    </div>
                </div>

                {/* STDIN Input */}
                <div className={`h-[40%] p-2 ${isDark ? 'bg-neutral-900' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                    <p className="font-semibold mb-1">STDIN:</p>
                    <textarea
                        className={`w-full h-full p-2 rounded border ${isDark ? 'bg-neutral-900 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-black'} resize-none`}
                        placeholder="Enter input here..."
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default Playground;
