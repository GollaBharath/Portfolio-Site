import { useEffect, useState, useRef } from "react";
import "./ExperiencePopup.css";

// Experience data structured as execution logs
const experienceData = [
	{
		id: "session-01",
		role: "Software Development Intern",
		stack: "Ubuntu, Gitea, Docker, CI/CD",
		duration: "Sep 2025 — Present",
		status: "ACTIVE",
		logs: [
			{ time: "09:15", action: "Set up and maintained secure Ubuntu server infrastructure" },
			{ time: "10:42", action: "Deployed local Gitea instance for version control" },
			{ time: "14:20", action: "Implemented CI/CD pipelines for automated deployments" },
			{ time: "16:33", action: "Co-designed lightweight container orchestration system" },
			{ time: "18:45", action: "Optimized cybersecurity lab deployment workflows" },
		],
	},
	{
		id: "session-02",
		role: "Project Admin",
		stack: "Open Source, Community Management, Git",
		duration: "Jul 2025 — Sep 2025",
		status: "COMPLETED",
		logs: [
			{ time: "08:30", action: "Initiated Gamify open source project administration" },
			{ time: "11:15", action: "Coordinated 30+ contributors across multiple timezones" },
			{ time: "13:45", action: "Reviewed and merged 150+ pull requests" },
			{ time: "15:20", action: "Facilitated community engagement via gamification features" },
			{ time: "17:50", action: "Successfully concluded event with full project delivery" },
		],
	},
];

function ExperiencePopup({ isOpen, onClose }) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [expandedSessions, setExpandedSessions] = useState(new Set([0])); // First session expanded by default
	const sessionRefs = useRef([]);
	const popupRef = useRef(null);

	// Reset state when popup opens
	useEffect(() => {
		if (isOpen) {
			setSelectedIndex(0);
			setExpandedSessions(new Set([0]));
		}
	}, [isOpen]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => (i + 1) % experienceData.length);
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => (i === 0 ? experienceData.length - 1 : i - 1));
			}

			if (e.key === "Enter") {
				e.preventDefault();
				setExpandedSessions((prev) => {
					const newSet = new Set(prev);
					if (newSet.has(selectedIndex)) {
						newSet.delete(selectedIndex);
					} else {
						newSet.add(selectedIndex);
					}
					return newSet;
				});
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, selectedIndex, onClose]);

	// Focus management
	useEffect(() => {
		if (isOpen && sessionRefs.current[selectedIndex]) {
			sessionRefs.current[selectedIndex]?.focus();
		}
	}, [selectedIndex, isOpen]);

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

	if (!isOpen) return null;

	return (
		<div className="experience-overlay" onClick={onClose}>
			<div
				ref={popupRef}
				className="experience-popup"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="experience-header">
					<div className="terminal-controls">
						<span className="terminal-prompt">$</span>
						<span className="terminal-title">cat experience.log</span>
					</div>
					<button className="experience-close" onClick={onClose} aria-label="Close">
						✕
					</button>
				</div>

				{/* Content */}
				<div className="experience-content">
					<div className="log-header">
						<span className="log-marker">&gt;</span> EXPERIENCE.LOG
					</div>

					<div className="sessions-container">
						{experienceData.map((session, index) => {
							const isSelected = selectedIndex === index;
							const isExpanded = expandedSessions.has(index);

							return (
								<div
									key={session.id}
									ref={(el) => (sessionRefs.current[index] = el)}
									className={`session-block ${isSelected ? "selected" : ""}`}
									tabIndex={0}
									onClick={() => {
										setSelectedIndex(index);
										setExpandedSessions((prev) => {
											const newSet = new Set(prev);
											if (newSet.has(index)) {
												newSet.delete(index);
											} else {
												newSet.add(index);
											}
											return newSet;
										});
									}}>
									{/* Session Header */}
									<div className="session-header">
										<div className="session-id">[ SESSION {String(index + 1).padStart(2, "0")} ]</div>
										<div className="session-expand-indicator">
											{isExpanded ? "▼" : "▶"}
										</div>
									</div>

									{/* Session Metadata */}
									<div className="session-metadata">
										<div className="metadata-line">
											<span className="metadata-key">ROLE</span>
											<span className="metadata-separator">:</span>
											<span className="metadata-value">{session.role}</span>
										</div>
										<div className="metadata-line">
											<span className="metadata-key">STACK</span>
											<span className="metadata-separator">:</span>
											<span className="metadata-value">{session.stack}</span>
										</div>
										<div className="metadata-line">
											<span className="metadata-key">DURATION</span>
											<span className="metadata-separator">:</span>
											<span className="metadata-value">{session.duration}</span>
										</div>
										<div className="metadata-line">
											<span className="metadata-key">STATUS</span>
											<span className="metadata-separator">:</span>
											<span className={`metadata-value status-${session.status.toLowerCase()}`}>
												{session.status}
											</span>
										</div>
									</div>

									{/* Session Logs (Collapsible) */}
									<div className={`session-logs ${isExpanded ? "expanded" : "collapsed"}`}>
										{session.logs.map((log, logIndex) => (
											<div key={logIndex} className="log-entry">
												<span className="log-time">[{log.time}]</span>
												<span className="log-action">{log.action}</span>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>

					{/* Footer */}
					<div className="experience-footer">
						<p className="experience-footer-text">
							Arrow keys to navigate • Enter to expand/collapse • ESC to close
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ExperiencePopup;
