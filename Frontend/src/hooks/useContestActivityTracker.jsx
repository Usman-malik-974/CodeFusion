import { useEffect, useState } from "react";

const useContestActivityTracker = () => {
    const [violations, setViolations] = useState({
        fullscreenExitCount: 0,
        tabSwitchCount: 0,
        blurCount: 0,
        totalViolations: 0,
    });

    useEffect(() => {
        const updateViolation = (type) => {
            setViolations((prev) => {
                const newData = {
                    ...prev,
                    [type]: prev[type] + 1,
                    totalViolations: prev.totalViolations + 1,
                };
                console.log("⚠️ Violation detected:", type, newData);
                return newData;
            });
        };

        // Detect fullscreen exit
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                updateViolation("fullscreenExitCount");
                console.warn("🚨 User exited fullscreen");
            }
        };

        // Detect tab switching or losing focus
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updateViolation("tabSwitchCount");
                console.warn("🚨 User switched tab or minimized window");
            }
        };

        // Detect focus loss (e.g., clicking outside window)
        const handleBlur = () => {
            updateViolation("blurCount");
            console.warn("🚨 User lost window focus");
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, []);

    return violations;
};

export default useContestActivityTracker;
