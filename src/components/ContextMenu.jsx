import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
    FolderPlus,
    FileText,
    Image,
    Info,
    Settings,
    RefreshCw,
    Layout,
    ArrowUpDown,
    Eye,
    Trash2,
    Copy,
    Scissors,
    Clipboard,
} from "lucide-react";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";
import useTrashStore from "#store/trash.js";
import { locations } from "#constants";

const ContextMenu = ({ isOpen, position, onClose }) => {
    const menuRef = useRef(null);
    const { openWindow } = useWindowStore();
    const { setActiveLocation } = useLocationStore();
    const { emptyTrash, trashedItems, addToTrash } = useTrashStore();

    // Animation
    useGSAP(() => {
        if (!menuRef.current || !isOpen) return;

        gsap.fromTo(
            menuRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.15, ease: "power2.out" }
        );
    }, [isOpen]);

    // Close on click outside or escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleAction = (action) => {
        switch (action) {
            case "new-folder":
                // Open finder with work location
                setActiveLocation(locations.work);
                openWindow("finder");
                break;
            case "get-info":
                setActiveLocation(locations.about);
                openWindow("finder");
                break;
            case "change-wallpaper":
                openWindow("photos");
                break;
            case "open-terminal":
                openWindow("terminal");
                break;
            case "open-finder":
                openWindow("finder");
                break;
            case "empty-trash":
                if (trashedItems.length > 0) {
                    emptyTrash();
                }
                break;
            case "add-demo-trash":
                // Demo: Add item to trash
                addToTrash({
                    id: Date.now(),
                    name: `Deleted Item ${Date.now()}`,
                    type: "file",
                });
                break;
            default:
                break;
        }
        onClose();
    };

    if (!isOpen) return null;

    // Adjust position to keep menu within viewport
    const adjustedPosition = {
        x: Math.min(position.x, window.innerWidth - 220),
        y: Math.min(position.y, window.innerHeight - 350),
    };

    const menuItems = [
        { type: "item", label: "New Folder", icon: FolderPlus, action: "new-folder" },
        { type: "separator" },
        { type: "item", label: "Get Info", icon: Info, action: "get-info", shortcut: "⌘I" },
        { type: "item", label: "Change Wallpaper...", icon: Image, action: "change-wallpaper" },
        { type: "separator" },
        { type: "item", label: "Use Stacks", icon: Layout, action: "stacks", disabled: true },
        { type: "submenu", label: "Sort By", icon: ArrowUpDown, items: [
            { label: "Name", action: "sort-name" },
            { label: "Kind", action: "sort-kind" },
            { label: "Date Modified", action: "sort-date" },
            { label: "Size", action: "sort-size" },
        ]},
        { type: "item", label: "Show View Options", icon: Eye, action: "view-options", disabled: true },
        { type: "separator" },
        { type: "item", label: "Open Terminal", icon: FileText, action: "open-terminal" },
        { type: "item", label: "Open Finder", icon: FolderPlus, action: "open-finder" },
        { type: "separator" },
        { type: "item", label: "Move to Trash (Demo)", icon: Trash2, action: "add-demo-trash" },
        { type: "item", label: `Empty Trash (${trashedItems.length})`, icon: Trash2, action: "empty-trash", danger: true, disabled: trashedItems.length === 0 },
    ];

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                left: adjustedPosition.x,
                top: adjustedPosition.y,
            }}
        >
            {menuItems.map((item, index) => {
                if (item.type === "separator") {
                    return <div key={index} className="context-menu-separator" />;
                }

                if (item.type === "submenu") {
                    return (
                        <div key={index} className="context-menu-item has-submenu">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                            <span className="submenu-arrow">›</span>
                            <div className="context-submenu">
                                {item.items.map((subItem, subIndex) => (
                                    <div
                                        key={subIndex}
                                        className="context-menu-item"
                                        onClick={() => handleAction(subItem.action)}
                                    >
                                        <span>{subItem.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={index}
                        className={`context-menu-item ${item.disabled ? "disabled" : ""} ${item.danger ? "danger" : ""}`}
                        onClick={() => !item.disabled && handleAction(item.action)}
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                    </div>
                );
            })}
        </div>
    );
};

export default ContextMenu;
