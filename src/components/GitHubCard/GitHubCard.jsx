import { useState, useEffect } from "react";
import "./GitHubCard.css";

function GitHubCard({ username }) {
	const [githubData, setGithubData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchGitHubData = async () => {
			if (!username) {
				setError("GitHub username not provided");
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`https://api.github.com/users/${username}`
				);
				const data = await response.json();

				if (response.ok) {
					setGithubData(data);
					setError(null);
				} else {
					setError("Failed to fetch GitHub data");
				}
			} catch (err) {
				setError("Failed to fetch GitHub data");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchGitHubData();
		// GitHub API has rate limits, so we update less frequently
		const interval = setInterval(fetchGitHubData, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [username]);

	if (loading) {
		return (
			<div className="stat-card github-card">
				<div className="card-header">
					<svg
						className="card-icon"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					<h3 className="card-title">GitHub</h3>
				</div>
				<div className="card-content">
					<div className="loading-pulse">Loading...</div>
				</div>
			</div>
		);
	}

	if (error || !githubData) {
		return (
			<div className="stat-card github-card">
				<div className="card-header">
					<svg
						className="card-icon"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					<h3 className="card-title">GitHub</h3>
				</div>
				<div className="card-content">
					<div className="not-available">
						<p className="status-text">Unable to fetch GitHub stats</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="stat-card github-card">
			<div className="card-header">
				<svg
					className="card-icon"
					viewBox="0 0 24 24"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
				</svg>
				<h3 className="card-title">GitHub</h3>
			</div>
			<div className="card-content">
				<div className="github-stats">
					<div className="stat-row">
						<div className="stat-item">
							<svg
								className="stat-icon"
								viewBox="0 0 16 16"
								fill="currentColor">
								<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
							</svg>
							<div className="stat-info">
								<span className="stat-value">{githubData.public_repos}</span>
								<span className="stat-label">Repositories</span>
							</div>
						</div>

						<div className="stat-divider"></div>

						<div className="stat-item">
							<svg
								className="stat-icon"
								viewBox="0 0 16 16"
								fill="currentColor">
								<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.75.75 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" />
							</svg>
							<div className="stat-info">
								<span className="stat-value">{githubData.followers}</span>
								<span className="stat-label">Followers</span>
							</div>
						</div>
					</div>

					<div className="stat-row">
						<div className="stat-item">
							<svg
								className="stat-icon"
								viewBox="0 0 16 16"
								fill="currentColor">
								<path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.507 5.507 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.49 3.49 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.75.75 0 0 1-1.442.386 3.51 3.51 0 0 0-5.676 0 .75.75 0 0 1-1.442-.386 5.01 5.01 0 0 1 2.56-3.012A3.001 3.001 0 0 1 11 4Z" />
							</svg>
							<div className="stat-info">
								<span className="stat-value">{githubData.following}</span>
								<span className="stat-label">Following</span>
							</div>
						</div>

						<div className="stat-divider"></div>

						<div className="stat-item">
							<svg
								className="stat-icon"
								viewBox="0 0 16 16"
								fill="currentColor">
								<path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
								<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
							</svg>
							<div className="stat-info">
								<span className="stat-value">{githubData.public_gists}</span>
								<span className="stat-label">Gists</span>
							</div>
						</div>
					</div>

					{githubData.bio && (
						<div className="github-bio">
							<p>{githubData.bio}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default GitHubCard;
