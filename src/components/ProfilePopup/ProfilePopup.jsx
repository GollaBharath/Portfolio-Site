import { useEffect, useRef } from "react";
import "./ProfilePopup.css";

// Profile identity data - structured as system metadata
const profileData = {
    identity: {
        command: "> whoami",
        name: "Bharath Golla",
    },
    roles: [
        "Software Engineer",
        "Systems Enthusiast",
        "Frontend + Infra Hybrid",
        "Open Source Contributor",
    ],
    principles: [
        "Keyboard > Mouse",
        "Systems over frameworks",
        "UX is a performance problem",
        "Prefer simple tools, deeply understood",
        "Build for reliability, not just features",
        "Documentation is code",
    ],
    currentState: {
        building: "Terminal-first portfolio interfaces",
        learning: "Container orchestration & CI/CD pipelines",
        exploring: "WebGL graphics and system-level optimizations",
    },
    interests: [
        "Custom Linux workflows",
        "CLI-first interfaces",
        "Automating infrastructure",
        "Understanding system failure modes",
        "Performance profiling and optimization",
    ],
    status: {
        state: "ACTIVE",
        lastUpdated: "2025-12-26",
    },
};

function ProfilePopup({ isOpen, onClose }) {
    const popupRef = useRef(null);

    // Keyboard navigation - ESC to close
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (!isOpen || !popupRef.current) return;

        const focusableElements = popupRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener("keydown", handleTabKey);
        return () => document.removeEventListener("keydown", handleTabKey);
    }, [isOpen]);

    // Focus close button when popup opens
    useEffect(() => {
        if (isOpen && popupRef.current) {
            const closeButton = popupRef.current.querySelector(".profile-close");
            closeButton?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div
                ref={popupRef}
                className="profile-popup"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="profile-header">
                    <div className="terminal-controls">
                        <span className="terminal-prompt">$</span>
                        <span className="terminal-title">{profileData.identity.command}</span>
                    </div>
                    <button className="profile-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="profile-content">
                    {/* Identity */}
                    <div className="profile-section">
                        <div className="profile-name">{profileData.identity.name}</div>
                    </div>

                    {/* Roles */}
                    <div className="profile-section">
                        <div className="section-header">ROLESET:</div>
                        <ul className="profile-list">
                            {profileData.roles.map((role, index) => (
                                <li key={index} className="profile-list-item">
                                    <span className="list-bullet">•</span>
                                    <span className="list-text">{role}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Operating Principles */}
                    <div className="profile-section">
                        <div className="section-header">OPERATING PRINCIPLES:</div>
                        <ul className="profile-list">
                            {profileData.principles.map((principle, index) => (
                                <li key={index} className="profile-list-item">
                                    <span className="list-bullet">•</span>
                                    <span className="list-text">{principle}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Current State */}
                    <div className="profile-section">
                        <div className="section-header">CURRENT STATE:</div>
                        <div className="profile-metadata">
                            <div className="metadata-line">
                                <span className="metadata-key">BUILDING</span>
                                <span className="metadata-separator">:</span>
                                <span className="metadata-value">{profileData.currentState.building}</span>
                            </div>
                            <div className="metadata-line">
                                <span className="metadata-key">LEARNING</span>
                                <span className="metadata-separator">:</span>
                                <span className="metadata-value">{profileData.currentState.learning}</span>
                            </div>
                            <div className="metadata-line">
                                <span className="metadata-key">EXPLORING</span>
                                <span className="metadata-separator">:</span>
                                <span className="metadata-value">{profileData.currentState.exploring}</span>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="profile-section">
                        <div className="section-header">TECHNICAL INTERESTS:</div>
                        <ul className="profile-list">
                            {profileData.interests.map((interest, index) => (
                                <li key={index} className="profile-list-item">
                                    <span className="list-bullet">•</span>
                                    <span className="list-text">{interest}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Status Footer */}
                    <div className="profile-footer">
                        <div className="status-line">
                            <span className="status-key">STATUS</span>
                            <span className="status-separator">:</span>
                            <span className="status-value status-active">{profileData.status.state}</span>
                        </div>
                        <div className="status-line">
                            <span className="status-key">LAST UPDATED</span>
                            <span className="status-separator">:</span>
                            <span className="status-value">{profileData.status.lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePopup;
