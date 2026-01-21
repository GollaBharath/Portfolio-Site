import arrowRight from "../../assets/SVGs/toggle-arrow.svg";
import DiscordServers from "./DiscordServers";

function DiscordPresence({ liveStats, isCollapsed, onToggle }) {
	const getStatusClass = (status) => {
		const statusMap = {
			online: "status-online",
			idle: "status-idle",
			dnd: "status-dnd",
			offline: "status-offline",
		};
		return statusMap[status] || "status-offline";
	};

	const getPlatformInfo = (discord) => {
		const platforms = [];
		if (discord?.active_on_discord_desktop) platforms.push("Desktop");
		if (discord?.active_on_discord_web) platforms.push("Web");
		if (discord?.active_on_discord_mobile) platforms.push("Mobile");
		return platforms.length > 0 ? platforms.join(" / ") : "Offline";
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
				<span className="section-title">DISCORD PRESENCE</span>
				<span
					className={`live-indicator ${getStatusClass(
						liveStats.discord?.discord_status,
					)}`}>
					● {liveStats.discord?.discord_status?.toUpperCase() || "OFFLINE"}
				</span>
			</div>

			{!isCollapsed && (
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
								{liveStats.discord?.discord_user?.global_name || "Unknown"}
							</div>
							<div className="discord-username">
								@{liveStats.discord?.discord_user?.username || "unknown"}
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
					{liveStats.discord?.activities?.find((a) => a.type === 4) && (
						<div className="discord-status-message">
							<span className="status-label">STATUS:</span>
							<span className="status-text">
								"{liveStats.discord.activities.find((a) => a.type === 4).state}"
							</span>
						</div>
					)}

					{/* Current Activity (non-custom, non-Spotify) */}
					{liveStats.discord?.activities?.filter(
						(a) => a.type !== 4 && a.name !== "Spotify",
					).length > 0 && (
						<div className="discord-activities">
							{liveStats.discord.activities
								.filter((a) => a.type !== 4 && a.name !== "Spotify")
								.map((activity, idx) => (
									<div key={idx} className="activity-item">
										<span className="activity-name">{activity.name}</span>
										{activity.details && (
											<span className="activity-details">
												{activity.details}
											</span>
										)}
										{activity.state && (
											<span className="activity-state">{activity.state}</span>
										)}
									</div>
								))}
						</div>
					)}

					{/* Affiliate Discord Servers */}
					<DiscordServers />
				</div>
			)}
		</div>
	);
}

export default DiscordPresence;
