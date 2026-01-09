import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import WindowWrapper from "../hoc/WIndowWrapper.jsx";
import WindowControls from "#components/WindowControls.jsx";
import { Play, RotateCcw, Copy, Check, Trash2 } from "lucide-react";

const DEFAULT_CODE = `// Welcome to the Mini Code Editor! 🚀
// Write JavaScript code and click Run to execute it

function greet(name) {
    return \`Hello, \${name}! Welcome to my portfolio.\`;
}

// Try modifying this:
const message = greet("Visitor");
console.log(message);

// You can also try:
// - Math operations: console.log(2 + 2)
// - Arrays: [1, 2, 3].map(x => x * 2)
// - Objects: { name: "Dev", skills: ["React", "Node"] }
`;

const EXAMPLES = [
    {
        name: "Hello World",
        code: `console.log("Hello, World! 🌍");`
    },
    {
        name: "Array Methods",
        code: `const numbers = [1, 2, 3, 4, 5];

// Map - transform each element
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Filter - keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0);
console.log("Evens:", evens);

// Reduce - combine into single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log("Sum:", sum);`
    },
    {
        name: "Async/Await",
        code: `// Simulating an API call
async function fetchUser() {
    console.log("Fetching user...");
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 1000));
    
    return { 
        name: "John Doe", 
        role: "Developer" 
    };
}

// Run async function
fetchUser().then(user => {
    console.log("User:", user);
});`
    },
    {
        name: "Classes",
        code: `class Developer {
    constructor(name, skills) {
        this.name = name;
        this.skills = skills;
    }
    
    introduce() {
        return \`Hi, I'm \${this.name}!\`;
    }
    
    showSkills() {
        return \`Skills: \${this.skills.join(", ")}\`;
    }
}

const dev = new Developer("Alex", ["React", "Node", "Python"]);
console.log(dev.introduce());
console.log(dev.showSkills());`
    }
];

const CodeEditor = () => {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const editorRef = useRef(null);

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
    };

    const runCode = () => {
        setIsRunning(true);
        setOutput([]);
        
        const logs = [];
        const originalConsole = { ...console };
        
        // Override console methods
        console.log = (...args) => {
            logs.push({ type: "log", content: args.map(formatValue).join(" ") });
        };
        console.error = (...args) => {
            logs.push({ type: "error", content: args.map(formatValue).join(" ") });
        };
        console.warn = (...args) => {
            logs.push({ type: "warn", content: args.map(formatValue).join(" ") });
        };

        try {
            // Create a function from the code and execute it
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction(code);
            
            Promise.resolve(fn())
                .then((result) => {
                    if (result !== undefined) {
                        logs.push({ type: "return", content: formatValue(result) });
                    }
                    setOutput([...logs]);
                })
                .catch((error) => {
                    logs.push({ type: "error", content: `Error: ${error.message}` });
                    setOutput([...logs]);
                })
                .finally(() => {
                    // Restore console
                    Object.assign(console, originalConsole);
                    setIsRunning(false);
                });
        } catch (error) {
            logs.push({ type: "error", content: `Syntax Error: ${error.message}` });
            setOutput([...logs]);
            Object.assign(console, originalConsole);
            setIsRunning(false);
        }
    };

    const formatValue = (value) => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (typeof value === "object") {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return String(value);
            }
        }
        return String(value);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearOutput = () => {
        setOutput([]);
    };

    const loadExample = (example) => {
        setCode(example.code);
        setOutput([]);
    };

    return (
        <>
            <div id="window-header">
                <WindowControls target="codeeditor" />
                <h2>Code Editor</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">JavaScript</span>
                </div>
            </div>

            <div className="flex flex-col h-[600px]">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                        >
                            <Play size={14} />
                            {isRunning ? "Running..." : "Run"}
                        </button>
                        <button
                            onClick={() => setCode(DEFAULT_CODE)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 text-sm rounded-md transition-colors"
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>
                        <button
                            onClick={copyCode}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 text-sm rounded-md transition-colors"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    {/* Examples dropdown */}
                    <div className="relative group">
                        <button className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 text-sm rounded-md transition-colors">
                            Examples ▾
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#2d2d2d] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            {EXAMPLES.map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => loadExample(example)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#3d3d3d] first:rounded-t-lg last:rounded-b-lg transition-colors"
                                >
                                    {example.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor and Output */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 border-r border-[#333]">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: "on",
                                padding: { top: 16 }
                            }}
                        />
                    </div>

                    {/* Output Panel */}
                    <div className="w-[300px] flex flex-col bg-[#1a1a1a]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
                            <span className="text-sm text-gray-400">Console Output</span>
                            <button
                                onClick={clearOutput}
                                className="p-1 hover:bg-[#333] rounded transition-colors"
                                title="Clear output"
                            >
                                <Trash2 size={14} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
                            {output.length === 0 ? (
                                <div className="text-gray-500 italic">
                                    Output will appear here...
                                </div>
                            ) : (
                                output.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`${
                                            item.type === "error" 
                                                ? "text-red-400" 
                                                : item.type === "warn"
                                                ? "text-yellow-400"
                                                : item.type === "return"
                                                ? "text-purple-400"
                                                : "text-green-400"
                                        } whitespace-pre-wrap break-words`}
                                    >
                                        {item.type === "return" && "→ "}
                                        {item.content}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CodeEditorWindow = WindowWrapper(CodeEditor, "codeeditor");
export default CodeEditorWindow;
