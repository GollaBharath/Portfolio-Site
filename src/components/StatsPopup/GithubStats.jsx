import { useState } from "react";
import arrowRight from "../../assets/SVGs/toggle-arrow.svg";

function GithubStats({
	liveStats,
	githubDetailed,
	contributions,
	isCollapsed,
	onToggle,
}) {
	const [repoSort, setRepoSort] = useState("stars");

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
				<span className="section-title">GITHUB ACTIVITY & CODING STATS</span>
			</div>

			{!isCollapsed && (
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
										return `${colors[i % colors.length]} ${start}% ${end}%`;
									});
									const gradient = `conic-gradient(${segments.join(", ")})`;

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
														<span className="legend-name">{l.name}</span>
														<span className="legend-percent">{l.percent}%</span>
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
										CONTRIBUTIONS HEATMAP ({contributions.range_days} DAYS):
									</div>
									{(() => {
										const map = new Map(
											contributions.daily.map((d) => [d.date, d.contributions]),
										);
										const today = new Date();
										today.setHours(0, 0, 0, 0);
										const start = new Date(today);
										start.setDate(today.getDate() - 364);

										let maxContrib = 1;
										for (let i = 0; i <= 364; i++) {
											const d = new Date(start);
											d.setDate(start.getDate() + i);
											const key = d.toISOString().slice(0, 10);
											const v = map.get(key) || 0;
											if (v > maxContrib) maxContrib = v;
										}

										const startDay = start.getDay();
										const totalDays = 365;
										const weeksNeeded = Math.ceil((startDay + totalDays) / 7);

										const cells = [];
										let dayIndex = 0;

										for (let w = 0; w < weeksNeeded; w++) {
											for (let r = 0; r < 7; r++) {
												if (w === 0 && r < startDay) continue;
												if (dayIndex > totalDays) continue;

												const cellDate = new Date(start);
												cellDate.setDate(start.getDate() + dayIndex);
												const key = cellDate.toISOString().slice(0, 10);
												const val = map.get(key) || 0;
												const intensity = Math.min(1, val / maxContrib);

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

							{/* Top repositories with sorting */}
							{liveStats.github.top_repositories && (
								<div className="github-top-repos">
									<div className="repos-header">
										<div className="repos-label">TOP REPOSITORIES</div>
										<div className="repo-filters">
											{[
												{ key: "stars", label: "Popularity" },
												{ key: "recent", label: "Recent" },
												{ key: "forks", label: "Forks" },
												{ key: "name", label: "Name" },
											].map((opt) => (
												<button
													key={opt.key}
													className={`filter-btn ${repoSort === opt.key ? "active" : ""}`}
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
												repos.sort((a, b) => (b.stars || 0) - (a.stars || 0));
												break;
											case "forks":
												repos.sort((a, b) => (b.forks || 0) - (a.forks || 0));
												break;
											case "name":
												repos.sort((a, b) =>
													(a.name || "").localeCompare(b.name || ""),
												);
												break;
											default:
												repos.sort(
													(a, b) =>
														new Date(b.pushed_at || b.updated_at || 0) -
														new Date(a.pushed_at || a.updated_at || 0),
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
															<div className="repo-desc">{r.description}</div>
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
																		r.pushed_at || r.updated_at,
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
	);
}

export default GithubStats;
