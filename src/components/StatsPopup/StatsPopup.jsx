import { useEffect, useRef, useState, useCallback } from "react";
import "./StatsPopup.css";

const STATS_API_URL = "https://stats.gollabharath.me/stats";

// Toolchain data (static - these don't change frequently)
const toolchainData = {
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
	],
};

function StatsPopup({ isOpen, onClose }) {
	const popupRef = useRef(null);
	const [liveStats, setLiveStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastFetched, setLastFetched] = useState(null);
	const [collapsedSections, setCollapsedSections] = useState(new Set());

	// Fetch live stats from API
	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(STATS_API_URL);
			if (!response.ok) throw new Error("Failed to fetch stats");
			const data = await response.json();
			setLiveStats(data.data);
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

	// Format time for display
	const formatDuration = (ms) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	// Get status color class
	const getStatusClass = (status) => {
		const statusMap = {
			online: "status-online",
			idle: "status-idle",
			dnd: "status-dnd",
			offline: "status-offline",
		};
		return statusMap[status] || "status-offline";
	};

	// Get platform icons
	const getPlatformInfo = (discord) => {
		const platforms = [];
		if (discord?.active_on_discord_desktop) platforms.push("Desktop");
		if (discord?.active_on_discord_web) platforms.push("Web");
		if (discord?.active_on_discord_mobile) platforms.push("Mobile");
		return platforms.length > 0 ? platforms.join(" / ") : "Offline";
	};

	// Calculate progress percentage
	const getProgressPercentage = (progress, duration) => {
		if (!progress || !duration) return 0;
		return Math.min((progress / duration) * 100, 100);
	};

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
							{/* Section 1: Discord Presence */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("discord")}>
									<span className="section-marker">&gt;</span> DISCORD PRESENCE
									<span
										className={`live-indicator ${getStatusClass(
											liveStats.discord?.discord_status
										)}`}>
										●{" "}
										{liveStats.discord?.discord_status?.toUpperCase() ||
											"OFFLINE"}
									</span>
									<span className="collapse-indicator">
										{collapsedSections.has("discord") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("discord") && (
									<div className="discord-card">
										<div className="discord-user">
											{liveStats.discord?.discord_user?.avatar && (
												<img
													src={`https://cdn.discordapp.com/avatars/${liveStats.discord.discord_user.id}/${liveStats.discord.discord_user.avatar}.png?size=128`}
													alt="Discord avatar"
													className="discord-avatar"
												/>
											)}
											<div className="discord-info">
												<div className="discord-name">
													{liveStats.discord?.discord_user?.global_name ||
														"Unknown"}
												</div>
												<div className="discord-username">
													@
													{liveStats.discord?.discord_user?.username ||
														"unknown"}
												</div>
												<div className="discord-platform">
													<span className="platform-label">PLATFORM:</span>
													<span className="platform-value">
														{getPlatformInfo(liveStats.discord)}
													</span>
												</div>
											</div>
										</div>

										{/* Custom Status */}
										{liveStats.discord?.activities?.find(
											(a) => a.type === 4
										) && (
											<div className="discord-status-message">
												<span className="status-label">STATUS:</span>
												<span className="status-text">
													"
													{
														liveStats.discord.activities.find(
															(a) => a.type === 4
														).state
													}
													"
												</span>
											</div>
										)}

										{/* Current Activity (non-custom) */}
										{liveStats.discord?.activities?.filter((a) => a.type !== 4)
											.length > 0 && (
											<div className="discord-activities">
												{liveStats.discord.activities
													.filter((a) => a.type !== 4)
													.map((activity, idx) => (
														<div key={idx} className="activity-item">
															<span className="activity-name">
																{activity.name}
															</span>
															{activity.details && (
																<span className="activity-details">
																	{activity.details}
																</span>
															)}
															{activity.state && (
																<span className="activity-state">
																	{activity.state}
																</span>
															)}
														</div>
													))}
											</div>
										)}
									</div>
								)}
							</div>

							{/* Section 2: Spotify - Now Playing */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("spotify")}>
									<span className="section-marker">&gt;</span> SPOTIFY
									{liveStats.spotify?.is_playing && (
										<span className="live-indicator status-online">
											● NOW PLAYING
										</span>
									)}
									<span className="collapse-indicator">
										{collapsedSections.has("spotify") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("spotify") && (
									<>
										{liveStats.spotify?.is_playing &&
										liveStats.spotify?.current_track ? (
											<div className="spotify-card">
												<div className="spotify-album-art">
													{liveStats.spotify.current_track.album
														?.album_art_url && (
														<img
															src={
																liveStats.spotify.current_track.album
																	.album_art_url
															}
															alt={liveStats.spotify.current_track.album.name}
														/>
													)}
													<div className="playing-animation">
														<span></span>
														<span></span>
														<span></span>
													</div>
												</div>
												<div className="spotify-info">
													<div className="spotify-track">
														{liveStats.spotify.current_track.name}
													</div>
													<div className="spotify-artist">
														{liveStats.spotify.current_track.artist_names}
													</div>
													<div className="spotify-album">
														{liveStats.spotify.current_track.album?.name}
													</div>
													<div className="spotify-progress">
														<div
															className="progress-bar"
															style={{
																"--progress": `${getProgressPercentage(
																	liveStats.spotify.current_track.progress_ms,
																	liveStats.spotify.current_track.duration_ms
																)}%`,
															}}>
															<div className="progress-fill"></div>
														</div>
														<div className="progress-time">
															<span>
																{formatDuration(
																	liveStats.spotify.current_track.progress_ms
																)}
															</span>
															<span>
																{formatDuration(
																	liveStats.spotify.current_track.duration_ms
																)}
															</span>
														</div>
													</div>
												</div>
												<a
													href={liveStats.spotify.current_track.url}
													target="_blank"
													rel="noopener noreferrer"
													className="spotify-link"
													aria-label="Open in Spotify">
													↗
												</a>
											</div>
										) : (
											<div className="spotify-idle">
												<span className="idle-icon">🎵</span>
												<span className="idle-text">
													Not currently playing anything
												</span>
											</div>
										)}
									</>
								)}
							</div>

							{/* Section 3: LeetCode Stats */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("leetcode")}>
									<span className="section-marker">&gt;</span> LEETCODE METRICS
									<span className="collapse-indicator">
										{collapsedSections.has("leetcode") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("leetcode") && (
									<>
										{liveStats.leetcode ? (
											<div className="leetcode-container">
												<div className="leetcode-header">
													<div className="leetcode-user">
														{liveStats.leetcode.profile?.avatar && (
															<img
																src={liveStats.leetcode.profile.avatar}
																alt="LeetCode avatar"
																className="leetcode-avatar"
															/>
														)}
														<div className="leetcode-info">
															<div className="leetcode-name">
																{liveStats.leetcode.profile?.real_name ||
																	liveStats.leetcode.username}
															</div>
															<div className="leetcode-ranking">
																RANK #
																{liveStats.leetcode.profile?.ranking?.toLocaleString() ||
																	"N/A"}
															</div>
														</div>
													</div>
													<div className="leetcode-total">
														<div className="total-value">
															{liveStats.leetcode.problems_solved?.all || 0}
														</div>
														<div className="total-label">SOLVED</div>
													</div>
												</div>

												<div className="leetcode-problems">
													<div className="problem-category easy">
														<div className="category-header">
															<span className="category-name">EASY</span>
															<span className="category-count">
																{liveStats.leetcode.problems_solved?.easy || 0}/
																{liveStats.leetcode.total_problems?.easy || 0}
															</span>
														</div>
														<div className="category-bar">
															<div
																className="bar-fill"
																style={{
																	width: `${
																		liveStats.leetcode.progress_percentage
																			?.easy || 0
																	}%`,
																}}></div>
														</div>
													</div>

													<div className="problem-category medium">
														<div className="category-header">
															<span className="category-name">MEDIUM</span>
															<span className="category-count">
																{liveStats.leetcode.problems_solved?.medium ||
																	0}
																/
																{liveStats.leetcode.total_problems?.medium || 0}
															</span>
														</div>
														<div className="category-bar">
															<div
																className="bar-fill"
																style={{
																	width: `${
																		liveStats.leetcode.progress_percentage
																			?.medium || 0
																	}%`,
																}}></div>
														</div>
													</div>

													<div className="problem-category hard">
														<div className="category-header">
															<span className="category-name">HARD</span>
															<span className="category-count">
																{liveStats.leetcode.problems_solved?.hard || 0}/
																{liveStats.leetcode.total_problems?.hard || 0}
															</span>
														</div>
														<div className="category-bar">
															<div
																className="bar-fill"
																style={{
																	width: `${
																		liveStats.leetcode.progress_percentage
																			?.hard || 0
																	}%`,
																}}></div>
														</div>
													</div>
												</div>

												<div className="leetcode-stats-row">
													<div className="stat-item">
														<span className="stat-label">ACCEPTANCE RATE</span>
														<span className="stat-value">
															{liveStats.leetcode.acceptance_rate || 0}%
														</span>
													</div>
													<div className="stat-item">
														<span className="stat-label">
															TOTAL SUBMISSIONS
														</span>
														<span className="stat-value">
															{liveStats.leetcode.total_submissions?.all || 0}
														</span>
													</div>
												</div>
											</div>
										) : (
											<div className="stats-unavailable">
												<span>LeetCode data unavailable</span>
											</div>
										)}
									</>
								)}
							</div>

							{/* Section 4: GitHub Stats */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("github")}>
									<span className="section-marker">&gt;</span> GITHUB ACTIVITY
									<span className="collapse-indicator">
										{collapsedSections.has("github") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("github") && (
									<>
										{liveStats.github ? (
											<div className="github-container">
												<div className="github-header">
													<div className="github-user">
														{liveStats.github.user?.avatar_url && (
															<img
																src={liveStats.github.user.avatar_url}
																alt="GitHub avatar"
																className="github-avatar"
															/>
														)}
														<div className="github-info">
															<div className="github-name">
																{liveStats.github.user?.name ||
																	liveStats.github.user?.username}
															</div>
															<div className="github-username">
																@{liveStats.github.user?.username}
															</div>
														</div>
													</div>
													<a
														href={liveStats.github.user?.profile_url}
														target="_blank"
														rel="noopener noreferrer"
														className="github-link"
														aria-label="Open GitHub profile">
														↗
													</a>
												</div>

												<div className="github-metrics">
													<div className="metric-item">
														<div className="metric-value">
															{liveStats.github.user?.public_repos || 0}
														</div>
														<div className="metric-label">PUBLIC REPOS</div>
													</div>
													<div className="metric-item">
														<div className="metric-value">
															{liveStats.github.repository_metrics
																?.total_stars || 0}
														</div>
														<div className="metric-label">STARS EARNED</div>
													</div>
													<div className="metric-item">
														<div className="metric-value">
															{liveStats.github.user?.followers || 0}
														</div>
														<div className="metric-label">FOLLOWERS</div>
													</div>
													<div className="metric-item">
														<div className="metric-value">
															{liveStats.github.contribution_signals
																?.current_streak || 0}
														</div>
														<div className="metric-label">DAY STREAK</div>
													</div>
												</div>

												<div className="github-languages">
													<div className="languages-label">TOP LANGUAGES:</div>
													<div className="languages-list">
														{liveStats.github.language_distribution
															?.slice(0, 5)
															.map((lang, idx) => (
																<div key={idx} className="language-item">
																	<span className="language-name">
																		{lang.name}
																	</span>
																	<span className="language-percent">
																		{lang.percent}%
																	</span>
																	<div className="language-bar">
																		<div
																			className="bar-fill"
																			style={{
																				width: `${lang.percent}%`,
																			}}></div>
																	</div>
																</div>
															))}
													</div>
												</div>

												<div className="github-activity">
													<div className="activity-label">LAST 30 DAYS:</div>
													<div className="activity-stats">
														<div className="activity-item">
															<span className="activity-value">
																{liveStats.github.activity_last_30_days
																	?.push_events || 0}
															</span>
															<span className="activity-label-sm">PUSHES</span>
														</div>
														<div className="activity-item">
															<span className="activity-value">
																{liveStats.github.activity_last_30_days
																	?.total_events || 0}
															</span>
															<span className="activity-label-sm">EVENTS</span>
														</div>
														<div className="activity-item">
															<span className="activity-value">
																{liveStats.github.contribution_signals
																	?.active_days_in_period || 0}
															</span>
															<span className="activity-label-sm">
																ACTIVE DAYS
															</span>
														</div>
													</div>
												</div>

												{/* Visual contribution graph */}
												{liveStats.github.contribution_signals
													?.active_days_in_period > 0 && (
													<div className="contribution-graph">
														<div className="graph-label">
															CONTRIBUTION ACTIVITY:
														</div>
														<div className="graph-bars">
															{Array.from({ length: 30 }, (_, i) => {
																const pushes =
																	liveStats.github.activity_last_30_days
																		?.push_events || 0;
																const totalDays = 30;
																const avgPerDay = pushes / totalDays;
																// Generate semi-random heights based on actual data
																const variance = (Math.sin(i * 0.5) + 1) / 2;
																const height = Math.min(
																	100,
																	avgPerDay * variance * 100 +
																		Math.random() * 20
																);
																return (
																	<div
																		key={i}
																		className="graph-bar"
																		style={{
																			height: `${height}%`,
																			animationDelay: `${i * 0.02}s`,
																		}}
																		title={`Day ${i + 1}`}
																	/>
																);
															})}
														</div>
													</div>
												)}
											</div>
										) : (
											<div className="stats-unavailable">
												<span>GitHub data unavailable</span>
											</div>
										)}
									</>
								)}
							</div>

							{/* Section 5: WakaTime Stats */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("wakatime")}>
									<span className="section-marker">&gt;</span> WAKATIME CODING
									ACTIVITY
									<span className="collapse-indicator">
										{collapsedSections.has("wakatime") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("wakatime") && (
									<>
										{liveStats.wakatime ? (
											<div className="wakatime-container">
												<div className="wakatime-overview">
													<div className="overview-card">
														<div className="card-label">TODAY</div>
														<div className="card-value">
															{liveStats.wakatime.today_hours || 0}h{" "}
															{liveStats.wakatime.today_minutes || 0}m
														</div>
													</div>
													<div className="overview-card">
														<div className="card-label">THIS WEEK</div>
														<div className="card-value">
															{liveStats.wakatime.week_hours || 0}h{" "}
															{liveStats.wakatime.week_minutes || 0}m
														</div>
													</div>
													<div className="overview-card">
														<div className="card-label">THIS MONTH</div>
														<div className="card-value">
															{liveStats.wakatime.month_hours || 0}h{" "}
															{liveStats.wakatime.month_minutes || 0}m
														</div>
													</div>
												</div>

												{liveStats.wakatime.languages &&
													liveStats.wakatime.languages.length > 0 && (
														<div className="wakatime-languages">
															<div className="languages-label">
																LANGUAGES (7 DAYS):
															</div>
															<div className="languages-list">
																{liveStats.wakatime.languages.map(
																	(lang, idx) => (
																		<div key={idx} className="language-item">
																			<div className="language-header">
																				<span className="language-name">
																					{lang.name}
																				</span>
																				<span className="language-time">
																					{lang.text}
																				</span>
																			</div>
																			<div className="language-bar">
																				<div
																					className="bar-fill"
																					style={{
																						width: `${lang.percent}%`,
																					}}></div>
																			</div>
																		</div>
																	)
																)}
															</div>
														</div>
													)}

												{liveStats.wakatime.editors &&
													liveStats.wakatime.editors.length > 0 && (
														<div className="wakatime-editors">
															<div className="editors-label">EDITORS:</div>
															<div className="editors-list">
																{liveStats.wakatime.editors.map(
																	(editor, idx) => (
																		<div key={idx} className="editor-item">
																			<span className="editor-name">
																				{editor.name}
																			</span>
																			<span className="editor-time">
																				{editor.text}
																			</span>
																		</div>
																	)
																)}
															</div>
														</div>
													)}
											</div>
										) : (
											<div className="stats-unavailable">
												<span>WakaTime data unavailable</span>
											</div>
										)}
									</>
								)}
							</div>

							{/* Section 6: Toolchain (Static) */}
							<div className="stats-section">
								<div
									className="section-header"
									onClick={() => toggleSection("toolchain")}>
									<span className="section-marker">&gt;</span> TOOLCHAIN /
									CAPABILITIES
									<span className="collapse-indicator">
										{collapsedSections.has("toolchain") ? "▼" : "▲"}
									</span>
								</div>

								{!collapsedSections.has("toolchain") && (
									<div className="toolchain-grid">
										{toolchainData.categories.map((category, catIndex) => (
											<div key={catIndex} className="toolchain-category">
												<div className="category-name">{category.name}</div>
												<div className="tools-list">
													{category.tools.map((tool, toolIndex) => (
														<div key={toolIndex} className="tool-item">
															<span className="tool-name">{tool.name}</span>
															<span
																className={`tool-level level-${tool.level.toLowerCase()}`}>
																{tool.level}
															</span>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								)}
							</div>

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
