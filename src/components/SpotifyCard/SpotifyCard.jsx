import { useState, useEffect } from "react";
import "./SpotifyCard.css";

function SpotifyCard({ discordId }) {
	const [spotifyData, setSpotifyData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchSpotifyData = async () => {
			if (!discordId) {
				setError("Discord ID not provided");
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`https://api.lanyard.rest/v1/users/${discordId}`
				);
				const data = await response.json();

				if (data.success && data.data.spotify) {
					setSpotifyData(data.data.spotify);
					setError(null);
				} else {
					setSpotifyData(null);
				}
			} catch (err) {
				setError("Failed to fetch Spotify data");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchSpotifyData();
		const interval = setInterval(fetchSpotifyData, 5000); // Update every 5 seconds

		return () => clearInterval(interval);
	}, [discordId]);

	if (loading) {
		return (
			<div className="stat-card spotify-card">
				<div className="card-header">
					<svg
						className="card-icon"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
					</svg>
					<h3 className="card-title">Spotify</h3>
				</div>
				<div className="card-content">
					<div className="loading-pulse">Loading...</div>
				</div>
			</div>
		);
	}

	if (!spotifyData) {
		return (
			<div className="stat-card spotify-card">
				<div className="card-header">
					<svg
						className="card-icon"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
					</svg>
					<h3 className="card-title">Spotify</h3>
				</div>
				<div className="card-content">
					<div className="not-playing">
						<p className="status-text">Not listening to anything</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="stat-card spotify-card active">
			<div className="card-header">
				<svg
					className="card-icon"
					viewBox="0 0 24 24"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg">
					<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
				</svg>
				<h3 className="card-title">Spotify</h3>
				<div className="live-indicator"></div>
			</div>
			<div className="card-content">
				<div className="spotify-info">
					{spotifyData.album_art_url && (
						<img
							src={spotifyData.album_art_url}
							alt="Album Art"
							className="album-art"
						/>
					)}
					<div className="track-info">
						<div className="track-name">{spotifyData.song}</div>
						<div className="track-artist">{spotifyData.artist}</div>
						{spotifyData.album && (
							<div className="track-album">{spotifyData.album}</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default SpotifyCard;
