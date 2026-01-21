import { useState, useEffect } from "react";
import arrowRight from "../../assets/SVGs/toggle-arrow.svg";

function SpotifyNowPlaying({
	liveStats,
	wakatimeDetailed,
	isCollapsed,
	onToggle,
}) {
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		if (!liveStats.spotify?.is_playing || !liveStats.spotify?.current_track) {
			setElapsedTime(0);
			return;
		}

		// Initialize with current progress
		setElapsedTime(liveStats.spotify.current_track.progress_ms);

		// Increment every second
		const interval = setInterval(() => {
			setElapsedTime((prev) => {
				const maxDuration = liveStats.spotify?.current_track?.duration_ms || 0;
				const newTime = prev + 1000;
				// Don't exceed track duration
				return Math.min(newTime, maxDuration);
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [liveStats.spotify?.is_playing, liveStats.spotify?.current_track]);

	const formatDuration = (ms) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const getProgressPercentage = (progress, duration) => {
		if (!progress || !duration) return 0;
		return Math.min((progress / duration) * 100, 100);
	};

	return (
		<>
			{/* Spotify Section */}
			<div
				className={`stats-section ${isCollapsed ? "collapsed" : "expanded"}`}>
				<div className="section-header" onClick={onToggle}>
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
						<span className="live-indicator status-online">● NOW PLAYING</span>
					)}
				</div>

				{!isCollapsed && (
					<>
						{liveStats.spotify?.is_playing &&
						liveStats.spotify?.current_track ? (
							<div className="spotify-card">
								<div className="spotify-album-art">
									{liveStats.spotify.current_track.album?.album_art_url && (
										<img
											src={liveStats.spotify.current_track.album.album_art_url}
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
													elapsedTime,
													liveStats.spotify.current_track.duration_ms,
												)}%`,
											}}>
											<div className="progress-fill"></div>
										</div>
										<div className="progress-time">
											<span>{formatDuration(elapsedTime)}</span>
											<span>
												{formatDuration(
													liveStats.spotify.current_track.duration_ms,
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

			{/* WakaTime coding activity intentionally removed */}
		</>
	);
}

export default SpotifyNowPlaying;
