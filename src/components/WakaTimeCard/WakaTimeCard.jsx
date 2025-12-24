import "./WakaTimeCard.css";

function WakaTimeCard({ embedUrl }) {
	if (!embedUrl) {
		return (
			<div className="stat-card wakatime-card">
				<div className="card-header">
					<svg
						className="card-icon"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm.5-17h-1v7.5l6.25 3.75.75-1.23-6-3.6V5z" />
					</svg>
					<h3 className="card-title">WakaTime</h3>
				</div>
				<div className="card-content">
					<div className="not-available">
						<p className="status-text">Unable to fetch coding stats</p>
						<p className="status-subtext">Add your WakaTime embed URL</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="stat-card wakatime-card">
			<div className="card-header">
				<svg
					className="card-icon"
					viewBox="0 0 24 24"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg">
					<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm.5-17h-1v7.5l6.25 3.75.75-1.23-6-3.6V5z" />
				</svg>
				<h3 className="card-title">WakaTime</h3>
				<span className="time-period">Last 7 Days</span>
			</div>
			<div className="card-content">
				<div className="wakatime-embed">
					<img src={embedUrl} alt="WakaTime Stats" className="wakatime-svg" />
				</div>
			</div>
		</div>
	);
}

export default WakaTimeCard;
