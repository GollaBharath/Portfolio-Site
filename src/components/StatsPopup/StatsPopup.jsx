import { useEffect, useRef, useState, useCallback } from "react";
import "./StatsPopup.css";
import arrowRight from "../../assets/SVGs/toggle-arrow.svg";

const STATS_API_URL = "https://stats.gollabharath.me/stats";

// Toolchain data (static - these don't change frequently)
const toolchainData = {
	categories: [
		{
			name: "DEVELOPMENT ENVIRONMENT",
			tools: [
				{
					name: "Linux (Debian+KDE)",
					level: "DAILY DRIVER",
					color: "GREEN",
				},
				{
					name: "Linux (Ubuntu Server)",
					level: "WORK/HOME SERVER",
					color: "YELLOW",
				},
				{
					name: "VS Code",
					level: "PRIMARY CODE EDITOR",
					color: "GREEN",
				},
				{
					name: "GitHub / Gitea / Git Lab",
					level: "VERSION CONTROL",
					color: "RED",
				},
				{
					name: "Docker / Kubernetes",
					level: "CONTAINERIZATION",
					color: "BLUE",
				},
			],
		},
		{
			name: "LANGUAGES",
			tools: [
				{
					name: "JavaScript / TypeScript",
					level: "WEB DEV",
					color: "GREEN",
				},
				{ name: "Go", level: "SYSTEMS / LEARNING", color: "YELLOW" },
				{ name: "Bash / Python", level: "SCRIPTING", color: "BLUE" },
				{ name: "Java", level: "DSA", color: "RED" },
			],
		},
		{
			name: "TECH STACKS",
			tools: [
				{ name: "MERN Stack", level: "SMALL WEB APPS", color: "GREEN" },
				{ name: "T3 Stack", level: "SERIOUS WEB APPS", color: "BLUE" },
				{ name: "MORE", level: "EXPLORING", color: "YELLOW" },
			],
		},
	],
};

// Map a tool's color flag to a CSS class so labels can stay custom
const getToolLevelClass = (tool) => {
	const color = (tool?.color || "NEUTRAL").toLowerCase();
	const allowed = new Set(["green", "yellow", "red", "blue"]);
	return allowed.has(color) ? `level-${color}` : "level-neutral";
};

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
						"https://stats.gollabharath.me/stats/github/contributions/daily"
					),
					fetch(
						"https://stats.gollabharath.me/stats/leetcode/submissions/daily"
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
							<div
								className={`stats-section ${
									collapsedSections.has("discord") ? "collapsed" : "expanded"
								}`}>
								<div
									className="section-header"
									onClick={() => toggleSection("discord")}>
									<span className="section-toggle">
										<img
											src={arrowRight}
											className="toggle-icon"
											alt=""
											aria-hidden="true"
										/>
									</span>
									<span className="section-title">DISCORD PRESENCE</span>
									<span
										className={`live-indicator ${getStatusClass(
											liveStats.discord?.discord_status
										)}`}>
										●{" "}
										{liveStats.discord?.discord_status?.toUpperCase() ||
											"OFFLINE"}
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
							<div
								className={`stats-section ${
									collapsedSections.has("spotify") ? "collapsed" : "expanded"
								}`}>
								<div
									className="section-header"
									onClick={() => toggleSection("spotify")}>
									<span className="section-toggle">
										<img
											src={arrowRight}
											className="toggle-icon"
											alt=""
											aria-hidden="true"
										/>
									</span>
									<span className="section-title">SPOTIFY</span>
									{liveStats.spotify?.is_playing && (
										<span className="live-indicator status-online">
											● NOW PLAYING
										</span>
									)}
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
							<div
								className={`stats-section ${
									collapsedSections.has("leetcode") ? "collapsed" : "expanded"
								}`}>
								<div
									className="section-header"
									onClick={() => toggleSection("leetcode")}>
									<span className="section-toggle">
										<img
											src={arrowRight}
											className="toggle-icon"
											alt=""
											aria-hidden="true"
										/>
									</span>
									<span className="section-title">LEETCODE METRICS</span>
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

												{/* Heatmap for 365 days - LeetCode Submissions */}
												{leetcodeSubmissions?.daily && (
													<div className="leetcode-heatmap leetcode-heatmap-year">
														<div className="heatmap-label">
															SUBMISSIONS HEATMAP (
															{leetcodeSubmissions.range_days} DAYS):
														</div>
														{(() => {
															const map = new Map(
																leetcodeSubmissions.daily.map((d) => [
																	d.date,
																	d.submissions,
																])
															);
															const today = new Date();
															today.setHours(0, 0, 0, 0);
															const start = new Date(today);
															start.setDate(today.getDate() - 364);

															// Find max for intensity calculation
															let maxSubmissions = 1;
															for (let i = 0; i <= 364; i++) {
																const d = new Date(start);
																d.setDate(start.getDate() + i);
																const key = d.toISOString().slice(0, 10);
																const v = map.get(key) || 0;
																if (v > maxSubmissions) maxSubmissions = v;
															}

															// Calculate weeks needed
															const startDay = start.getDay();
															const endDay = today.getDay();
															const totalDays = 365;
															const weeksNeeded = Math.ceil(
																(startDay + totalDays) / 7
															);

															const cells = [];
															let dayIndex = 0;

															for (let w = 0; w < weeksNeeded; w++) {
																for (let r = 0; r < 7; r++) {
																	// Skip cells before start date in first week
																	if (w === 0 && r < startDay) continue;

																	// Skip cells after today
																	if (dayIndex > totalDays) continue;

																	const cellDate = new Date(start);
																	cellDate.setDate(start.getDate() + dayIndex);
																	const key = cellDate
																		.toISOString()
																		.slice(0, 10);
																	const val = map.get(key) || 0;
																	const intensity = Math.min(
																		1,
																		val / maxSubmissions
																	);
																	const [year, month, day] = key.split("-");
																	const formattedDate = `${day}-${month}-${year}`;

																	let cellStyle;
																	if (val === 0) {
																		cellStyle = {
																			gridColumn: w + 1,
																			gridRow: r + 1,
																			background: "transparent",
																			border:
																				"1px solid rgba(255, 80, 80, 0.15)",
																		};
																	} else {
																		const alpha = 0.15 + intensity * 0.75;
																		const bg = `rgba(255, 80, 80, ${alpha.toFixed(
																			3
																		)})`;
																		cellStyle = {
																			gridColumn: w + 1,
																			gridRow: r + 1,
																			background: bg,
																		};
																	}

																	cells.push(
																		<div
																			key={`${w}-${r}`}
																			className="heatmap-cell-year"
																			style={cellStyle}
																			title={`${formattedDate}: ${val} submissions`}
																		/>
																	);
																	dayIndex++;
																}
															}
															return (
																<div className="heatmap-wrapper-year">
																	<div className="heatmap-grid-year">
																		{cells}
																	</div>
																</div>
															);
														})()}
													</div>
												)}
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
							<div
								className={`stats-section ${
									collapsedSections.has("github") ? "collapsed" : "expanded"
								}`}>
								<div
									className="section-header"
									onClick={() => toggleSection("github")}>
									<span className="section-toggle">
										<img
											src={arrowRight}
											className="toggle-icon"
											alt=""
											aria-hidden="true"
										/>
									</span>
									<span className="section-title">
										GITHUB ACTIVITY & CODING STATS
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

												{/* Time Distribution - Early Bird Section */}
												{githubDetailed?.commits_last_365_days
													?.time_distribution && (
													<div className="time-distribution">
														<div className="time-header">
															{(() => {
																const dist =
																	githubDetailed.commits_last_365_days
																		.time_distribution.distribution;
																const maxPeriod = Object.entries(dist).reduce(
																	(max, [key, value]) =>
																		value.count > (dist[max]?.count || 0)
																			? key
																			: max,
																	"morning"
																);
																const emoji = {
																	morning: "🌅",
																	daytime: "☀️",
																	evening: "🌆",
																	night: "🌙",
																};
																const labels = {
																	morning: "Early Bird",
																	daytime: "Day Coder",
																	evening: "Evening Warrior",
																	night: "Night Owl",
																};
																return (
																	<>
																		<span className="time-emoji">
																			{emoji[maxPeriod]}
																		</span>
																		<span className="time-label">
																			I'm {labels[maxPeriod]}
																		</span>
																	</>
																);
															})()}
														</div>
														<div className="time-bars">
															{Object.entries(
																githubDetailed.commits_last_365_days
																	.time_distribution.distribution
															).map(([period, data]) => {
																const emoji = {
																	morning: "🌅",
																	daytime: "☀️",
																	evening: "🌆",
																	night: "🌙",
																};
																const labels = {
																	morning: "Morning",
																	daytime: "Daytime",
																	evening: "Evening",
																	night: "Night",
																};
																return (
																	<div key={period} className="time-bar-item">
																		<div className="time-bar-header">
																			<span className="time-period">
																				{emoji[period]} {labels[period]}
																			</span>
																			<span className="time-commits">
																				{data.count} commits
																			</span>
																			<span className="time-percent">
																				{data.percent}%
																			</span>
																		</div>
																		<div className="time-bar-track">
																			<div
																				className="time-bar-fill"
																				style={{
																					width: `${data.percent}%`,
																				}}></div>
																		</div>
																		<div className="time-hours">
																			{data.hours}
																		</div>
																	</div>
																);
															})}
														</div>
													</div>
												)}

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

												{/* All-Time Stats + WakaTime Integration */}
												{(githubDetailed?.all_time_lines_of_code ||
													wakatimeDetailed?.all_time_stats) && (
													<div className="all-time-stats">
														<div className="all-time-header">
															ALL-TIME STATISTICS
														</div>
														<div className="all-time-grid">
															{githubDetailed?.all_time_lines_of_code && (
																<>
																	<div className="all-time-card">
																		<div className="all-time-value">
																			{(
																				githubDetailed.all_time_lines_of_code
																					.total_lines_added / 1000
																			).toFixed(1)}
																			K
																		</div>
																		<div className="all-time-label">
																			Lines Added
																		</div>
																	</div>
																	<div className="all-time-card">
																		<div className="all-time-value">
																			{(
																				githubDetailed.all_time_lines_of_code
																					.net_lines / 1000
																			).toFixed(1)}
																			K
																		</div>
																		<div className="all-time-label">
																			Net Lines
																		</div>
																	</div>
																	<div className="all-time-card">
																		<div className="all-time-value">
																			{githubDetailed.commits_last_365_days
																				?.total_commits || 0}
																		</div>
																		<div className="all-time-label">
																			Total Commits
																		</div>
																	</div>
																</>
															)}
															{wakatimeDetailed?.all_time_stats && (
																<div className="all-time-card highlight">
																	<div className="all-time-value">
																		{wakatimeDetailed.all_time_stats.text}
																	</div>
																	<div className="all-time-label">
																		Coding Time
																	</div>
																</div>
															)}
														</div>
													</div>
												)}

												{/* WakaTime Activity Overview */}
												{wakatimeDetailed?.stats_last_30_days && (
													<div className="wakatime-activity">
														<div className="activity-header">
															RECENT CODING ACTIVITY (30 DAYS)
														</div>
														<div className="activity-cards">
															<div className="activity-card">
																<div className="activity-value">
																	{wakatimeDetailed.stats_last_30_days
																		.human_readable_total || "0 hrs"}
																</div>
																<div className="activity-label">Total Time</div>
															</div>
															<div className="activity-card">
																<div className="activity-value">
																	{wakatimeDetailed.stats_last_30_days
																		.human_readable_daily_average || "0 hrs"}
																</div>
																<div className="activity-label">
																	Daily Average
																</div>
															</div>
															{wakatimeDetailed.stats_last_30_days.best_day && (
																<div className="activity-card">
																	<div className="activity-value">
																		{
																			wakatimeDetailed.stats_last_30_days
																				.best_day.text
																		}
																	</div>
																	<div className="activity-label">
																		Best Day (
																		{new Date(
																			wakatimeDetailed.stats_last_30_days.best_day.date
																		).toLocaleDateString("en-US", {
																			month: "short",
																			day: "numeric",
																		})}
																		)
																	</div>
																</div>
															)}
														</div>

														{/* Top Languages from WakaTime */}
														{wakatimeDetailed.stats_last_30_days.languages
															?.length > 0 && (
															<div className="waka-languages">
																<div className="waka-lang-label">
																	LANGUAGES (LAST 30 DAYS):
																</div>
																<div className="waka-lang-list">
																	{wakatimeDetailed.stats_last_30_days.languages
																		.slice(0, 5)
																		.map((lang, idx) => (
																			<div key={idx} className="waka-lang-item">
																				<div className="waka-lang-header">
																					<span className="waka-lang-name">
																						{lang.name}
																					</span>
																					<span className="waka-lang-time">
																						{lang.text}
																					</span>
																				</div>
																				<div className="waka-lang-bar">
																					<div
																						className="waka-lang-fill"
																						style={{
																							width: `${lang.percent}%`,
																						}}></div>
																				</div>
																			</div>
																		))}
																</div>
															</div>
														)}
													</div>
												)}

												<div className="github-languages">
													<div className="languages-label">TOP LANGUAGES:</div>
													{(() => {
														const langs = (
															liveStats.github.language_distribution || []
														).slice(0, 6);
														const colors = [
															"#ff5252",
															"#ff9f43",
															"#ffd166",
															"#06d6a0",
															"#1e90ff",
															"#c77dff",
														];
														let cumulative = 0;
														const segments = langs.map((l, i) => {
															const pct = parseFloat(l.percent);
															const start = cumulative;
															const end = cumulative + pct;
															cumulative = end;
															return `${
																colors[i % colors.length]
															} ${start}% ${end}%`;
														});
														const gradient = `conic-gradient(${segments.join(
															", "
														)})`;

														return (
															<div className="pie-row">
																<div
																	className="pie-chart"
																	style={{ background: gradient }}>
																	<div className="pie-hole"></div>
																</div>
																<div className="pie-legend">
																	{langs.map((l, i) => (
																		<div key={i} className="legend-item">
																			<span
																				className="legend-swatch"
																				style={{
																					background: colors[i % colors.length],
																				}}></span>
																			<span className="legend-name">
																				{l.name}
																			</span>
																			<span className="legend-percent">
																				{l.percent}%
																			</span>
																		</div>
																	))}
																</div>
															</div>
														);
													})()}
												</div>

												{/* Heatmap for 365 days - Contributions */}
												{contributions?.daily && (
													<div className="github-heatmap github-heatmap-year">
														<div className="heatmap-label">
															CONTRIBUTIONS HEATMAP ({contributions.range_days}{" "}
															DAYS):
														</div>
														{(() => {
															const map = new Map(
																contributions.daily.map((d) => [
																	d.date,
																	d.contributions,
																])
															);
															const today = new Date();
															today.setHours(0, 0, 0, 0);
															const start = new Date(today);
															start.setDate(today.getDate() - 364);

															// Find max for intensity calculation
															let maxContrib = 1;
															for (let i = 0; i <= 364; i++) {
																const d = new Date(start);
																d.setDate(start.getDate() + i);
																const key = d.toISOString().slice(0, 10);
																const v = map.get(key) || 0;
																if (v > maxContrib) maxContrib = v;
															}

															// Calculate weeks needed
															const startDay = start.getDay();
															const endDay = today.getDay();
															const totalDays = 365;
															const weeksNeeded = Math.ceil(
																(startDay + totalDays) / 7
															);

															const cells = [];
															let dayIndex = 0;

															for (let w = 0; w < weeksNeeded; w++) {
																for (let r = 0; r < 7; r++) {
																	// Skip cells before start date in first week
																	if (w === 0 && r < startDay) continue;

																	// Skip cells after today
																	if (dayIndex > totalDays) continue;

																	const cellDate = new Date(start);
																	cellDate.setDate(start.getDate() + dayIndex);
																	const key = cellDate
																		.toISOString()
																		.slice(0, 10);
																	const val = map.get(key) || 0;
																	const intensity = Math.min(
																		1,
																		val / maxContrib
																	);
																	const [year, month, day] = key.split("-");
																	const formattedDate = `${day}-${month}-${year}`;

																	let cellStyle;
																	if (val === 0) {
																		cellStyle = {
																			gridColumn: w + 1,
																			gridRow: r + 1,
																			background: "transparent",
																			border:
																				"1px solid rgba(255, 80, 80, 0.15)",
																		};
																	} else {
																		const alpha = 0.15 + intensity * 0.75;
																		const bg = `rgba(255, 80, 80, ${alpha.toFixed(
																			3
																		)})`;
																		cellStyle = {
																			gridColumn: w + 1,
																			gridRow: r + 1,
																			background: bg,
																		};
																	}

																	cells.push(
																		<div
																			key={`${w}-${r}`}
																			className="heatmap-cell-year"
																			style={cellStyle}
																			title={`${formattedDate}: ${val} contributions`}
																		/>
																	);
																	dayIndex++;
																}
															}
															return (
																<div className="heatmap-wrapper-year">
																	<div className="heatmap-grid-year">
																		{cells}
																	</div>
																</div>
															);
														})()}
													</div>
												)}

												{/* Top repositories with sorting */}
												{liveStats.github.top_repositories && (
													<div className="github-top-repos">
														<div className="repos-header">
															<div className="repos-label">
																TOP REPOSITORIES
															</div>
															<div className="repo-filters">
																{[
																	{ key: "stars", label: "Popularity" },
																	{ key: "recent", label: "Recent" },
																	{ key: "forks", label: "Forks" },
																	{ key: "name", label: "Name" },
																].map((opt) => (
																	<button
																		key={opt.key}
																		className={`filter-btn ${
																			repoSort === opt.key ? "active" : ""
																		}`}
																		onClick={() => setRepoSort(opt.key)}>
																		{opt.label}
																	</button>
																))}
															</div>
														</div>
														{(() => {
															const repos = [
																...(liveStats.github.top_repositories || []),
															];
															switch (repoSort) {
																case "stars":
																	repos.sort(
																		(a, b) => (b.stars || 0) - (a.stars || 0)
																	);
																	break;
																case "forks":
																	repos.sort(
																		(a, b) => (b.forks || 0) - (a.forks || 0)
																	);
																	break;
																case "name":
																	repos.sort((a, b) =>
																		(a.name || "").localeCompare(b.name || "")
																	);
																	break;
																default:
																	repos.sort(
																		(a, b) =>
																			new Date(
																				b.pushed_at || b.updated_at || 0
																			) -
																			new Date(a.pushed_at || a.updated_at || 0)
																	);
															}
															const top = repos.slice(0, 8);
															return (
																<div className="repo-grid">
																	{top.map((r, i) => (
																		<a
																			key={i}
																			className="repo-card"
																			href={r.url}
																			target="_blank"
																			rel="noopener noreferrer">
																			<div className="repo-name">{r.name}</div>
																			{r.description && (
																				<div className="repo-desc">
																					{r.description}
																				</div>
																			)}
																			<div className="repo-meta">
																				<span className="meta-item">
																					★ {r.stars || 0}
																				</span>
																				<span className="meta-item">
																					⑂ {r.forks || 0}
																				</span>
																				{r.language && (
																					<span className="meta-item lang">
																						{r.language}
																					</span>
																				)}
																				{(r.pushed_at || r.updated_at) && (
																					<span className="meta-item time">
																						{new Date(
																							r.pushed_at || r.updated_at
																						).toLocaleDateString()}
																					</span>
																				)}
																			</div>
																		</a>
																	))}
																</div>
															);
														})()}
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

							{/* Section 6: Toolchain (Static) */}
							<div
								className={`stats-section ${
									collapsedSections.has("toolchain") ? "collapsed" : "expanded"
								}`}>
								<div
									className="section-header"
									onClick={() => toggleSection("toolchain")}>
									<span className="section-toggle">
										<img
											src={arrowRight}
											className="toggle-icon"
											alt=""
											aria-hidden="true"
										/>
									</span>
									<span className="section-title">
										TOOLCHAIN / CAPABILITIES
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
																className={`tool-level ${getToolLevelClass(
																	tool
																)}`}>
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
