import { useEffect, useRef, useState } from "react";
import "./StatsPopup.css";

// Stats data - structured as telemetry/observability metrics
const statsData = {
    overview: {
        metrics: [
            {
                label: "GITHUB STREAK",
                value: "127",
                unit: "days",
                status: "ACTIVE",
            },
            {
                label: "TOTAL COMMITS",
                value: "1,247",
                unit: "commits",
                status: "CONSISTENT",
            },
            {
                label: "CODING TIME",
                value: "840",
                unit: "hrs/month",
                status: "HIGH UTILIZATION",
            },
            {
                label: "PROBLEMS SOLVED",
                value: "156",
                unit: "leetcode",
                status: "ACTIVE",
            },
        ],
        primaryDomains: ["Full-Stack Development", "Systems Engineering", "DevOps/Infra"],
    },
    toolchain: {
        categories: [
            {
                name: "ENVIRONMENT",
                tools: [
                    { name: "Linux (Ubuntu/Arch)", level: "PRIMARY" },
                    { name: "VS Code / Neovim", level: "PRIMARY" },
                    { name: "Git / GitHub", level: "PRIMARY" },
                    { name: "Docker", level: "PRIMARY" },
                ],
            },
            {
                name: "LANGUAGES",
                tools: [
                    { name: "JavaScript / TypeScript", level: "PRIMARY" },
                    { name: "Python", level: "PRIMARY" },
                    { name: "Bash / Shell", level: "SECONDARY" },
                    { name: "Go", level: "EXPLORING" },
                ],
            },
            {
                name: "FRONTEND",
                tools: [
                    { name: "React / Next.js", level: "PRIMARY" },
                    { name: "HTML / CSS", level: "PRIMARY" },
                    { name: "Tailwind CSS", level: "SECONDARY" },
                    { name: "WebGL / Three.js", level: "EXPLORING" },
                ],
            },
            {
                name: "BACKEND / INFRA",
                tools: [
                    { name: "Node.js / Express", level: "PRIMARY" },
                    { name: "PostgreSQL / MongoDB", level: "SECONDARY" },
                    { name: "CI/CD Pipelines", level: "PRIMARY" },
                    { name: "Nginx / Apache", level: "SECONDARY" },
                ],
            },
            {
                name: "SYSTEMS / SECURITY",
                tools: [
                    { name: "Linux Server Admin", level: "PRIMARY" },
                    { name: "Container Orchestration", level: "SECONDARY" },
                    { name: "Network Security", level: "SECONDARY" },
                    { name: "Gitea / Self-hosted", level: "PRIMARY" },
                ],
            },
        ],
    },
    live: {
        embeds: [
            {
                id: "spotify",
                source: "Spotify",
                mode: "Live",
                enabled: true,
                url: "https://open.spotify.com/embed/user/31enxavrkyobb5lbp4phl33jgnwq",
            },
            {
                id: "discord",
                source: "Discord",
                mode: "Presence",
                enabled: false, // Placeholder - not yet implemented
                url: null,
            },
        ],
    },
};

function StatsPopup({ isOpen, onClose }) {
    const popupRef = useRef(null);
    const [expandedEmbeds, setExpandedEmbeds] = useState(new Set());

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
            const closeButton = popupRef.current.querySelector(".stats-close");
            closeButton?.focus();
        }
    }, [isOpen]);

    const toggleEmbed = (embedId) => {
        setExpandedEmbeds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(embedId)) {
                newSet.delete(embedId);
            } else {
                newSet.add(embedId);
            }
            return newSet;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="stats-overlay" onClick={onClose}>
            <div
                ref={popupRef}
                className="stats-popup"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="stats-header">
                    <div className="terminal-controls">
                        <span className="terminal-prompt">$</span>
                        <span className="terminal-title">cat /proc/stats</span>
                    </div>
                    <button className="stats-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="stats-content">
                    {/* Section 1: Overview */}
                    <div className="stats-section">
                        <div className="section-header">
                            <span className="section-marker">&gt;</span> TELEMETRY OVERVIEW
                        </div>

                        <div className="metrics-grid">
                            {statsData.overview.metrics.map((metric, index) => (
                                <div key={index} className="metric-block">
                                    <div className="metric-label">{metric.label}</div>
                                    <div className="metric-value">
                                        {metric.value}
                                        <span className="metric-unit">{metric.unit}</span>
                                    </div>
                                    <div className={`metric-status status-${metric.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                        {metric.status}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="primary-domains">
                            <div className="domains-label">PRIMARY DOMAINS:</div>
                            <div className="domains-list">
                                {statsData.overview.primaryDomains.map((domain, index) => (
                                    <span key={index} className="domain-item">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Toolchain */}
                    <div className="stats-section">
                        <div className="section-header">
                            <span className="section-marker">&gt;</span> TOOLCHAIN / CAPABILITIES
                        </div>

                        <div className="toolchain-grid">
                            {statsData.toolchain.categories.map((category, catIndex) => (
                                <div key={catIndex} className="toolchain-category">
                                    <div className="category-name">{category.name}</div>
                                    <div className="tools-list">
                                        {category.tools.map((tool, toolIndex) => (
                                            <div key={toolIndex} className="tool-item">
                                                <span className="tool-name">{tool.name}</span>
                                                <span className={`tool-level level-${tool.level.toLowerCase()}`}>
                                                    {tool.level}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 3: Live / Presence */}
                    <div className="stats-section">
                        <div className="section-header">
                            <span className="section-marker">&gt;</span> LIVE / PRESENCE
                        </div>

                        <div className="embeds-container">
                            {statsData.live.embeds.map((embed) => (
                                <div key={embed.id} className="embed-block">
                                    <div
                                        className="embed-header"
                                        onClick={() => embed.enabled && toggleEmbed(embed.id)}>
                                        <div className="embed-info">
                                            <span className="embed-label">SOURCE:</span>
                                            <span className="embed-value">{embed.source}</span>
                                            <span className="embed-separator">|</span>
                                            <span className="embed-label">MODE:</span>
                                            <span className="embed-value">{embed.mode}</span>
                                        </div>
                                        {embed.enabled && (
                                            <button
                                                className="embed-toggle"
                                                aria-label={`Toggle ${embed.source} embed`}>
                                                {expandedEmbeds.has(embed.id) ? "▼" : "▶"}
                                            </button>
                                        )}
                                        {!embed.enabled && (
                                            <span className="embed-disabled">[NOT CONFIGURED]</span>
                                        )}
                                    </div>

                                    {embed.enabled && expandedEmbeds.has(embed.id) && (
                                        <div className="embed-content">
                                            <iframe
                                                src={embed.url}
                                                width="100%"
                                                height="380"
                                                frameBorder="0"
                                                allow="encrypted-media"
                                                loading="lazy"
                                                title={`${embed.source} embed`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="embeds-note">
                            <span className="note-marker">NOTE:</span> Embeds are lazy-loaded and
                            collapsible. Max 1-2 visible at a time.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsPopup;
