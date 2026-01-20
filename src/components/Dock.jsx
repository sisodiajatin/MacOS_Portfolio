import { useRef, useState } from "react"
import {Tooltip} from "react-tooltip";
import {gsap} from "gsap";
import {dockApps} from "#constants";
import {useGSAP} from "@gsap/react";
import useWindowStore from "#store/window.js"
import useTrashStore from "#store/trash.js"

const Dock = () => {
    const { openWindow, closeWindow, windows } = useWindowStore();
    const { emptyTrash, trashedItems, addToTrash } = useTrashStore();
    const dockRef = useRef(null);
    const [showTrashMenu, setShowTrashMenu] = useState(false);
    const [isTrashDragOver, setIsTrashDragOver] = useState(false);

    useGSAP(() => {
        const dock = dockRef.current;
        if(!dock) return;

        const icons = dock.querySelectorAll(".dock-icon");

        const animateIcons = (mouseX) => {
            const { left: dockLeft } = dock.getBoundingClientRect();

            icons.forEach((icon) => {
                const { left: iconLeft, width } = icon.getBoundingClientRect();
                const center = iconLeft - dockLeft + width / 2;
                const distance = Math.abs(mouseX - center);
                const intensity = Math.exp(-(distance ** 2.5) / 20000);

                gsap.to(icon, {
                    scale: 1 + 0.25 * intensity,
                    y: -15 * intensity,
                    duration: 0.2,
                    ease: "power1.out",
                })
            })
        }

        const  handleMouseMove = (e) => {
            const { left } = dock.getBoundingClientRect();
            animateIcons(e.clientX - left);
        }

        const resetIcons  = () =>
            icons.forEach((icon) =>
            gsap.to(icon,{
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power1.out",
            })
            )
        dock.addEventListener("mousemove", handleMouseMove);
        dock.addEventListener("mouseleave", resetIcons);

        return() => {
            dock.removeEventListener("mousemove", handleMouseMove);
            dock.removeEventListener("mouseleave", resetIcons);
        }
    })

    const toggleApp = (app) =>{
        if (!app.canOpen && app.id !== "trash") return;

        // Special handling for trash
        if (app.id === "trash") {
            setShowTrashMenu(!showTrashMenu);
            return;
        }

        const window = windows[app.id];

        if (!window) {
            console.error(`Window not found for app: ${app.id}`);
            return;
        }

        if (window.isOpen) {
            closeWindow(app.id);
        } else {
            openWindow(app.id);
        }
    };

    const handleEmptyTrash = () => {
        if (trashedItems.length === 0) return;

        // Animate trash icon
        const trashIcon = dockRef.current?.querySelector('[aria-label="Archive"]');
        if (trashIcon) {
            gsap.to(trashIcon, {
                scale: 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 3,
                ease: "power2.inOut",
                onComplete: () => {
                    emptyTrash();
                    setShowTrashMenu(false);
                }
            });
        } else {
            emptyTrash();
            setShowTrashMenu(false);
        }
    };

    const handleDragOver = (e, appId) => {
        if (appId !== "trash") return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsTrashDragOver(true);
    };

    const handleDragLeave = (e, appId) => {
        if (appId !== "trash") return;
        setIsTrashDragOver(false);
    };

    const handleDrop = (e, appId) => {
        if (appId !== "trash") return;
        e.preventDefault();
        setIsTrashDragOver(false);

        try {
            const data = e.dataTransfer.getData("application/json");
            if (data) {
                const item = JSON.parse(data);
                addToTrash(item);

                // Animate trash icon on drop
                const trashIcon = dockRef.current?.querySelector('[aria-label="Archive"]');
                if (trashIcon) {
                    gsap.fromTo(trashIcon,
                        { scale: 1.3 },
                        {
                            scale: 1,
                            duration: 0.3,
                            ease: "elastic.out(1, 0.3)"
                        }
                    );
                }
            }
        } catch (error) {
            console.error("Error parsing dropped item:", error);
        }
    };

  return (
    <section id="dock">
        <div ref={dockRef} className="dock-container">
            {dockApps.map (({ id, name, icon, canOpen }) =>(
                <div key={id} className="relative flex justify-center">
                    <button
                        type="button"
                        className={`dock-icon ${id === "trash" && isTrashDragOver ? "scale-125 transition-transform" : ""}`}
                        aria-label={name}
                        data-tooltip-id="dock-tooltip"
                        data-tooltip-content={id === "trash" ? `${name} (${trashedItems.length} items)` : name}
                        data-tooltip-delay-show={150}
                        disabled={!canOpen && id !== "trash"}
                        onClick={() => toggleApp({id, canOpen})}
                        onDragOver={(e) => handleDragOver(e, id)}
                        onDragLeave={(e) => handleDragLeave(e, id)}
                        onDrop={(e) => handleDrop(e, id)}
                    >
                        <img
                            src={`/images/${icon}`}
                            alt={name}
                            loading="lazy"
                            className={canOpen || id === "trash" ? "" : "opacity-60"}
                        />
                        {id === "trash" && trashedItems.length > 0 && (
                            <span className="trash-badge">{trashedItems.length}</span>
                        )}
                    </button>

                    {/* Trash Context Menu */}
                    {id === "trash" && showTrashMenu && (
                        <div className="trash-menu">
                            <button 
                                onClick={handleEmptyTrash}
                                disabled={trashedItems.length === 0}
                                className={trashedItems.length === 0 ? "disabled" : ""}
                            >
                                Empty Trash ({trashedItems.length} items)
                            </button>
                        </div>
                    )}
                </div>
                )
            )}
            <Tooltip id="dock-tooltip" place="top" className="tooltip" />
        </div>

        {/* Click outside to close trash menu */}
        {showTrashMenu && (
            <div
                className="fixed inset-0 z-9989"
                onClick={() => setShowTrashMenu(false)}
            />
        )}
    </section>
  )
}

export default Dock