import arrowRight from "../../assets/SVGs/toggle-arrow.svg";

function LeetcodeStats({
	liveStats,
	leetcodeSubmissions,
	isCollapsed,
	onToggle,
}) {
	const formatDuration = (ms) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className={`stats-section ${isCollapsed ? "collapsed" : "expanded"}`}>
			<div className="section-header" onClick={onToggle}>
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

			{!isCollapsed && (
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
													liveStats.leetcode.progress_percentage?.easy || 0
												}%`,
											}}></div>
									</div>
								</div>

								<div className="problem-category medium">
									<div className="category-header">
										<span className="category-name">MEDIUM</span>
										<span className="category-count">
											{liveStats.leetcode.problems_solved?.medium || 0}/
											{liveStats.leetcode.total_problems?.medium || 0}
										</span>
									</div>
									<div className="category-bar">
										<div
											className="bar-fill"
											style={{
												width: `${
													liveStats.leetcode.progress_percentage?.medium || 0
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
													liveStats.leetcode.progress_percentage?.hard || 0
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
									<span className="stat-label">TOTAL SUBMISSIONS</span>
									<span className="stat-value">
										{liveStats.leetcode.total_submissions?.all || 0}
									</span>
								</div>
							</div>

							{/* Heatmap for 365 days - LeetCode Submissions */}
							{leetcodeSubmissions?.daily && (
								<div className="leetcode-heatmap leetcode-heatmap-year">
									<div className="heatmap-label">
										SUBMISSIONS HEATMAP ({leetcodeSubmissions.range_days} DAYS):
									</div>
									{(() => {
										const map = new Map(
											leetcodeSubmissions.daily.map((d) => [
												d.date,
												d.submissions,
											]),
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
										const weeksNeeded = Math.ceil((startDay + totalDays) / 7);

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
												const key = cellDate.toISOString().slice(0, 10);
												const val = map.get(key) || 0;
												const intensity = Math.min(1, val / maxSubmissions);
												const [year, month, day] = key.split("-");
												const formattedDate = `${day}-${month}-${year}`;

												let cellStyle;
												if (val === 0) {
													cellStyle = {
														gridColumn: w + 1,
														gridRow: r + 1,
														background: "transparent",
														border: "1px solid rgba(255, 80, 80, 0.15)",
													};
												} else {
													const alpha = 0.15 + intensity * 0.75;
													const bg = `rgba(255, 80, 80, ${alpha.toFixed(3)})`;
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
													/>,
												);
												dayIndex++;
											}
										}
										return (
											<div className="heatmap-wrapper-year">
												<div className="heatmap-grid-year">{cells}</div>
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
	);
}

export default LeetcodeStats;
