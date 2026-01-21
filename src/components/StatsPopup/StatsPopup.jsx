import { useEffect, useRef, useState, useCallback } from "react";
import "./StatsPopup.css";
import LeetcodeStats from "./LeetcodeStats";
import GithubStats from "./GithubStats";
import DiscordPresence from "./DiscordPresence";
import SpotifyNowPlaying from "./SpotifyNowPlaying";

const STATS_API_URL = "https://stats.gollabharath.me/stats";

function StatsPopup({ isOpen, onClose }) {
	const popupRef = useRef(null);
	const [liveStats, setLiveStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastFetched, setLastFetched] = useState(null);
	const [collapsedSections, setCollapsedSections] = useState(new Set());
	const [repoSort, setRepoSort] = useState("stars");
	const [contributions, setContributions] = useState(null);
	const [leetcodeSubmissions, setLeetcodeSubmissions] = useState(null);
	const [githubDetailed, setGithubDetailed] = useState(null);
	const [wakatimeDetailed, setWakatimeDetailed] = useState(null);

	// Fetch live stats from API
	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const [statsRes, contribRes, leetcodeRes, githubRes, wakatimeRes] =
				await Promise.all([
					fetch(STATS_API_URL),
					fetch(
						"https://stats.gollabharath.me/stats/github/contributions/daily",
					),
					fetch(
						"https://stats.gollabharath.me/stats/leetcode/submissions/daily",
					),
					fetch("https://stats.gollabharath.me/stats/github"),
					fetch("https://stats.gollabharath.me/stats/wakatime"),
				]);
			if (!statsRes.ok) throw new Error("Failed to fetch stats");
			const statsData = await statsRes.json();
			setLiveStats(statsData.data);
			if (contribRes.ok) {
				const contribData = await contribRes.json();
				setContributions(contribData.data);
			}
			if (leetcodeRes.ok) {
				const leetcodeData = await leetcodeRes.json();
				setLeetcodeSubmissions(leetcodeData.data);
			}
			if (githubRes.ok) {
				const githubData = await githubRes.json();
				setGithubDetailed(githubData.data);
			}
			if (wakatimeRes.ok) {
				const wakatimeData = await wakatimeRes.json();
				setWakatimeDetailed(wakatimeData.data);
			}
			setLastFetched(new Date());
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	// Fetch stats when popup opens
	useEffect(() => {
		if (isOpen) {
			fetchStats();
			// Refresh every 30 seconds while popup is open
			const interval = setInterval(fetchStats, 30000);
			return () => clearInterval(interval);
		}
	}, [isOpen, fetchStats]);

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
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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

	// Toggle section collapse
	const toggleSection = (sectionId) => {
		setCollapsedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(sectionId)) {
				newSet.delete(sectionId);
			} else {
				newSet.add(sectionId);
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
						<span className="terminal-title">
							curl stats.gollabharath.me/stats
						</span>
					</div>
					<div className="header-actions">
						<button
							className="stats-refresh"
							onClick={fetchStats}
							disabled={loading}
							aria-label="Refresh stats">
							{loading ? "⟳" : "↻"}
						</button>
						<button
							className="stats-close"
							onClick={onClose}
							aria-label="Close">
							✕
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="stats-content" onWheel={(e) => e.stopPropagation()}>
					{/* Loading State */}
					{loading && !liveStats && (
						<div className="stats-loading">
							<div className="loading-spinner"></div>
							<span>Fetching live telemetry...</span>
						</div>
					)}

					{/* Error State */}
					{error && !liveStats && (
						<div className="stats-error">
							<span className="error-icon">⚠</span>
							<span>Failed to fetch stats: {error}</span>
							<button onClick={fetchStats} className="retry-btn">
								Retry
							</button>
						</div>
					)}

					{/* Live Stats Content */}
					{liveStats && (
						<>
							<LeetcodeStats
								liveStats={liveStats}
								leetcodeSubmissions={leetcodeSubmissions}
								isCollapsed={collapsedSections.has("leetcode")}
								onToggle={() => toggleSection("leetcode")}
							/>

							<GithubStats
								liveStats={liveStats}
								githubDetailed={githubDetailed}
								contributions={contributions}
								isCollapsed={collapsedSections.has("github")}
								onToggle={() => toggleSection("github")}
							/>

							<DiscordPresence
								liveStats={liveStats}
								isCollapsed={collapsedSections.has("discord")}
								onToggle={() => toggleSection("discord")}
							/>

							{/* Footer with last updated */}
							<div className="stats-footer">
								<span className="footer-note">
									<span className="note-marker">#</span> Auto-refreshes every
									30s
								</span>
								{lastFetched && (
									<span className="last-updated">
										Last updated: {lastFetched.toLocaleTimeString()}
									</span>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default StatsPopup;
