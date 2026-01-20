import { useState, useRef, lazy, Suspense, useCallback, useLayoutEffect } from "react";
import WindowWrapper from "../hoc/WIndowWrapper.jsx";
import WindowControls from "#components/WindowControls.jsx";
import { Play, RotateCcw, Copy, Check, Trash2, Loader2, ChevronDown } from "lucide-react";

// Lazy load Monaco Editor - only downloads when Code Editor is opened
const Editor = lazy(() => import("@monaco-editor/react"));

// Language configurations
const LANGUAGES = [
    { 
        id: "javascript", 
        name: "JavaScript", 
        extension: ".js",
        runnable: true,
        defaultCode: `// Welcome to the Mini Code Editor! 🚀
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
`
    },
    { 
        id: "typescript", 
        name: "TypeScript", 
        extension: ".ts",
        runnable: true,
        defaultCode: `// TypeScript - JavaScript with types! 💪

interface User {
    name: string;
    age: number;
    skills: string[];
}

const user: User = {
    name: "Developer",
    age: 25,
    skills: ["TypeScript", "React", "Node.js"]
};

function introduce(user: User): string {
    return \`Hi, I'm \${user.name}, \${user.age} years old!\`;
}

console.log(introduce(user));
console.log("Skills:", user.skills.join(", "));
`
    },
    { 
        id: "python", 
        name: "Python", 
        extension: ".py",
        runnable: false,
        defaultCode: `# Python code example 🐍
# Note: Python execution requires a backend server

def greet(name):
    return f"Hello, {name}! Welcome to my portfolio."

# Variables and data types
message = greet("Visitor")
numbers = [1, 2, 3, 4, 5]
squared = [x ** 2 for x in numbers]

print(message)
print(f"Squared numbers: {squared}")

# Classes
class Developer:
    def __init__(self, name, skills):
        self.name = name
        self.skills = skills
    
    def introduce(self):
        return f"Hi, I'm {self.name}!"

dev = Developer("Alex", ["Python", "Django", "FastAPI"])
print(dev.introduce())
`
    },
    { 
        id: "html", 
        name: "HTML", 
        extension: ".html",
        runnable: "preview",
        defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .card {
            background: white;
            padding: 2rem 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        h1 { color: #333; margin-bottom: 0.5rem; }
        p { color: #666; }
    </style>
</head>
<body>
    <div class="card">
        <h1>👋 Hello World!</h1>
        <p>Edit this HTML and click Preview to see changes.</p>
    </div>
</body>
</html>
`
    },
    { 
        id: "css", 
        name: "CSS", 
        extension: ".css",
        runnable: false,
        defaultCode: `/* CSS Stylesheet Example 🎨 */

/* Modern CSS Variables */
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --text: #333;
    --background: #f5f5f5;
}

/* Base styles */
body {
    font-family: 'Inter', -apple-system, sans-serif;
    background-color: var(--background);
    color: var(--text);
    line-height: 1.6;
}

/* Flexbox container */
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
}

/* Button with gradient */
.button {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* Grid layout */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}
`
    },
    { 
        id: "json", 
        name: "JSON", 
        extension: ".json",
        runnable: false,
        defaultCode: `{
    "name": "My Portfolio",
    "version": "1.0.0",
    "author": {
        "name": "Developer",
        "email": "dev@example.com",
        "skills": ["React", "Node.js", "TypeScript", "Python"]
    },
    "projects": [
        {
            "title": "Portfolio Website",
            "description": "A macOS-style portfolio built with React",
            "technologies": ["React", "Tailwind CSS", "GSAP"],
            "status": "completed"
        },
        {
            "title": "E-commerce App",
            "description": "Full-stack shopping application",
            "technologies": ["Next.js", "Prisma", "PostgreSQL"],
            "status": "in-progress"
        }
    ],
    "settings": {
        "theme": "dark",
        "notifications": true,
        "language": "en"
    }
}
`
    }
];

// Examples per language
const EXAMPLES = {
    javascript: [
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
    ],
    typescript: [
        {
            name: "Generics",
            code: `// Generic function
function identity<T>(arg: T): T {
    return arg;
}

console.log(identity<string>("Hello TypeScript!"));
console.log(identity<number>(42));

// Generic interface
interface Container<T> {
    value: T;
    getValue(): T;
}

const numContainer: Container<number> = {
    value: 100,
    getValue() { return this.value; }
};

console.log("Container value:", numContainer.getValue());`
        },
        {
            name: "Interfaces & Types",
            code: `// Interface
interface Person {
    name: string;
    age: number;
    greet(): string;
}

// Type alias
type Status = "active" | "inactive" | "pending";

// Implementation
const user: Person = {
    name: "Alice",
    age: 30,
    greet() {
        return \`Hello, I'm \${this.name}!\`;
    }
};

const status: Status = "active";

console.log(user.greet());
console.log("Status:", status);`
        }
    ],
    html: [
        {
            name: "Form Example",
            code: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; padding: 2rem; background: #f0f0f0; }
        form { background: white; padding: 2rem; border-radius: 8px; max-width: 400px; }
        input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 4px; }
        input { border: 1px solid #ddd; }
        button { background: #4CAF50; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <form>
        <h2>Contact Form</h2>
        <input type="text" placeholder="Your Name">
        <input type="email" placeholder="Email Address">
        <textarea style="width:100%;padding:10px" rows="4" placeholder="Message"></textarea>
        <button type="submit">Send Message</button>
    </form>
</body>
</html>`
        }
    ]
};

// Loading fallback for the editor
const EditorLoader = () => (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading editor...</span>
        </div>
    </div>
);

const CodeEditor = () => {
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [previewHtml, setPreviewHtml] = useState(null);
    const editorRef = useRef(null);
    const runCodeRef = useRef(null);

    const formatValue = useCallback((value) => {
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
    }, []);

    const runCode = useCallback(() => {
        // Handle HTML preview
        if (language.runnable === "preview") {
            setPreviewHtml(code);
            setOutput([{ type: "log", content: "Preview updated! See the preview panel below." }]);
            return;
        }

        // Only JS/TS can be executed
        if (!language.runnable) {
            setOutput([{ 
                type: "warn", 
                content: `${language.name} execution is not supported in the browser.\nThis is a code editor for syntax highlighting and editing.` 
            }]);
            return;
        }

        setIsRunning(true);
        setOutput([]);
        setPreviewHtml(null);
        
        const logs = [];
        
        // Create custom console for sandbox
        const sandboxConsole = {
            log: (...args) => {
                logs.push({ type: "log", content: args.map(formatValue).join(" ") });
            },
            error: (...args) => {
                logs.push({ type: "error", content: args.map(formatValue).join(" ") });
            },
            warn: (...args) => {
                logs.push({ type: "warn", content: args.map(formatValue).join(" ") });
            }
        };

        try {
            // For TypeScript, we just run it as JavaScript (basic transpilation)
            let codeToRun = code;
            if (language.id === "typescript") {
                // Remove type annotations for basic execution
                codeToRun = code
                    .replace(/:\s*\w+(\[\])?(\s*[=,)])/g, '$2') // Remove type annotations
                    .replace(/:\s*\w+(\[\])?\s*{/g, ' {') // Remove return types
                    .replace(/<\w+>/g, '') // Remove generics
                    .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
                    .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Remove type aliases
            }

            // Create a function from the code with console injected
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction('console', codeToRun);
            
            Promise.resolve(fn(sandboxConsole))
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
                    setIsRunning(false);
                });
        } catch (error) {
            logs.push({ type: "error", content: `Syntax Error: ${error.message}` });
            setOutput([...logs]);
            setIsRunning(false);
        }
    }, [code, formatValue, language]);

    // Store runCode in ref so we can access it in editor mount
    useLayoutEffect(() => {
        runCodeRef.current = runCode;
    }, [runCode]);

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        
        // Add Ctrl+Enter / Cmd+Enter keyboard shortcut to run code
        editor.addCommand(
            2048 | 3, // CtrlCmd = 2048, Enter = 3
            () => {
                runCodeRef.current?.();
            }
        );
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(lang.defaultCode);
        setOutput([]);
        setPreviewHtml(null);
        setShowLangMenu(false);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearOutput = () => {
        setOutput([]);
        setPreviewHtml(null);
    };

    const loadExample = (example) => {
        setCode(example.code);
        setOutput([]);
        setPreviewHtml(null);
    };

    const currentExamples = EXAMPLES[language.id] || [];

    return (
        <>
            <div id="window-header">
                <WindowControls target="codeeditor" />
                <h2>Code Editor</h2>
                <div className="flex items-center gap-2">
                    {/* Language selector */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 bg-[#333] hover:bg-[#444] rounded transition-colors"
                        >
                            {language.name}
                            <ChevronDown size={12} />
                        </button>
                        {showLangMenu && (
                            <>
                                <div
                                    className="fixed inset-0"
                                    style={{ zIndex: -1 }}
                                    onClick={() => setShowLangMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-[#2d2d2d] rounded-lg shadow-xl z-50 py-1">
                                    {LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.id}
                                            onClick={() => handleLanguageChange(lang)}
                                            className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                                                language.id === lang.id 
                                                    ? "bg-blue-600 text-white" 
                                                    : "text-gray-300 hover:bg-[#3d3d3d]"
                                            }`}
                                        >
                                            {lang.name}
                                            {!lang.runnable && <span className="text-gray-500 text-xs ml-1">(view)</span>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col h-[600px]">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-sm rounded-md transition-colors disabled:opacity-50 ${
                                language.runnable === "preview" 
                                    ? "bg-blue-600 hover:bg-blue-500" 
                                    : language.runnable 
                                        ? "bg-green-600 hover:bg-green-500" 
                                        : "bg-gray-600 hover:bg-gray-500"
                            }`}
                            title={language.runnable ? "Run code (Ctrl+Enter)" : "Not executable"}
                        >
                            <Play size={14} />
                            {isRunning ? "Running..." : language.runnable === "preview" ? "Preview" : language.runnable ? "Run" : "View Only"}
                            {language.runnable && <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-black/20 rounded">⌘↵</kbd>}
                        </button>
                        <button
                            onClick={() => setCode(language.defaultCode)}
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
                    {currentExamples.length > 0 && (
                        <div className="relative group">
                            <button className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-gray-300 text-sm rounded-md transition-colors">
                                Examples ▾
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#2d2d2d] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                {currentExamples.map((example, i) => (
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
                    )}
                </div>

                {/* Editor and Output */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Editor with Suspense for lazy loading */}
                    <div className="flex-1 border-r border-[#333]">
                        <Suspense fallback={<EditorLoader />}>
                            <Editor
                                height="100%"
                                language={language.id}
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
                        </Suspense>
                    </div>

                    {/* Output Panel */}
                    <div className="w-[300px] flex flex-col bg-[#1a1a1a]">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
                            <span className="text-sm text-gray-400">
                                {previewHtml ? "HTML Preview" : "Console Output"}
                            </span>
                            <button
                                onClick={clearOutput}
                                className="p-1 hover:bg-[#333] rounded transition-colors"
                                title="Clear output"
                            >
                                <Trash2 size={14} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {previewHtml ? (
                                <iframe
                                    srcDoc={previewHtml}
                                    title="HTML Preview"
                                    className="w-full h-full bg-white"
                                    sandbox="allow-scripts"
                                />
                            ) : output.length === 0 ? (
                                <div className="p-4 text-gray-500 italic text-sm">
                                    {language.runnable 
                                        ? "Output will appear here..." 
                                        : `${language.name} is view-only. Use this editor for syntax highlighting and editing.`
                                    }
                                </div>
                            ) : (
                                <div className="p-4 font-mono text-sm space-y-1">
                                    {output.map((item, i) => (
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
                                    ))}
                                </div>
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
