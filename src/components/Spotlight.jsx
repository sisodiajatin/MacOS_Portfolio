import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Folder, FileText, Image, Globe, Mail, Terminal, FileImage } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";
import { locations, dockApps, navLinks } from "#constants";

const Spotlight = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const { openWindow } = useWindowStore();
    const { setActiveLocation } = useLocationStore();

    // Build searchable items
    const searchableItems = useMemo(() => {
        const items = [];

        // Add dock apps
        dockApps.forEach((app) => {
            if (app.canOpen) {
                items.push({
                    id: `app-${app.id}`,
                    name: app.name,
                    type: "Application",
                    icon: "app",
                    action: () => openWindow(app.id),
                });
            }
        });

        // Add nav links
        navLinks.forEach((link) => {
            items.push({
                id: `nav-${link.id}`,
                name: link.name,
                type: "Quick Action",
                icon: "action",
                action: () => openWindow(link.type),
            });
        });

        // Add locations and their children
        Object.values(locations).forEach((location) => {
            items.push({
                id: `loc-${location.id}`,
                name: location.name,
                type: "Folder",
                icon: "folder",
                action: () => {
                    setActiveLocation(location);
                    openWindow("finder");
                },
            });

            // Add children
            location.children?.forEach((child) => {
                if (child.kind === "folder") {
                    items.push({
                        id: `folder-${child.id}`,
                        name: child.name,
                        type: "Project",
                        icon: "folder",
                        action: () => {
                            setActiveLocation(child);
                            openWindow("finder");
                        },
                    });

                    // Add nested files
                    child.children?.forEach((file) => {
                        items.push({
                            id: `file-${child.id}-${file.id}`,
                            name: file.name,
                            type: file.fileType?.toUpperCase() || "File",
                            icon: file.fileType || "file",
                            parentName: child.name,
                            action: () => {
                                setActiveLocation(child);
                                openWindow("finder");
                            },
                        });
                    });
                } else {
                    items.push({
                        id: `file-${location.id}-${child.id}`,
                        name: child.name,
                        type: child.fileType?.toUpperCase() || "File",
                        icon: child.fileType || "file",
                        action: () => {
                            setActiveLocation(location);
                            openWindow("finder");
                        },
                    });
                }
            });
        });

        return items;
    }, [openWindow, setActiveLocation]);

    // Filter results based on query
    const results = useMemo(() => {
        if (!query.trim()) return searchableItems.slice(0, 8);
        
        const lowerQuery = query.toLowerCase();
        return searchableItems
            .filter((item) => 
                item.name.toLowerCase().includes(lowerQuery) ||
                item.type.toLowerCase().includes(lowerQuery) ||
                item.parentName?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 8);
    }, [query, searchableItems]);

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Animation
    useGSAP(() => {
        if (!containerRef.current) return;

        if (isOpen) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, scale: 0.95, y: -20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (results[selectedIndex]) {
                    results[selectedIndex].action();
                    onClose();
                }
                break;
            case "Escape":
                e.preventDefault();
                onClose();
                break;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "folder":
                return <Folder className="w-5 h-5 text-blue-500" />;
            case "txt":
                return <FileText className="w-5 h-5 text-gray-500" />;
            case "img":
                return <FileImage className="w-5 h-5 text-green-500" />;
            case "url":
                return <Globe className="w-5 h-5 text-blue-400" />;
            case "app":
                return <Terminal className="w-5 h-5 text-purple-500" />;
            case "action":
                return <Search className="w-5 h-5 text-orange-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="spotlight-overlay" onClick={onClose}>
            <div
                ref={containerRef}
                className="spotlight-container"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search input */}
                <div className="spotlight-search">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Spotlight Search"
                        className="spotlight-input"
                        autoComplete="off"
                        spellCheck="false"
                    />
                    {query && (
                        <kbd className="spotlight-kbd">ESC</kbd>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="spotlight-results">
                        {results.map((item, index) => (
                            <div
                                key={item.id}
                                className={`spotlight-result ${index === selectedIndex ? "selected" : ""}`}
                                onClick={() => {
                                    item.action();
                                    onClose();
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="spotlight-result-icon">
                                    {getIcon(item.icon)}
                                </div>
                                <div className="spotlight-result-content">
                                    <span className="spotlight-result-name">{item.name}</span>
                                    <span className="spotlight-result-type">
                                        {item.parentName ? `${item.parentName} • ` : ""}{item.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {query && results.length === 0 && (
                    <div className="spotlight-empty">
                        <p>No results for "{query}"</p>
                    </div>
                )}

                {/* Hint */}
                <div className="spotlight-hint">
                    <span>↑↓ Navigate</span>
                    <span>↵ Open</span>
                    <span>esc Close</span>
                </div>
            </div>
        </div>
    );
};

export default Spotlight;
