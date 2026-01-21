import { useState } from "react";

function DiscordServers() {
	// Manual server data - update these with your actual server information
	// To get server icon: Right-click server icon → Copy Image Address
	const serverConfigs = [
		{
			id: "593285788414902277",
			name: "TH11 Clash Community",
			description: "Clash of Clans Town Hall Communities server",
			icon: "https://cdn.discordapp.com/icons/593285788414902277/8bbe729068a07bf295dcfe7ec019c0e4.webp?size=64", // Paste your server icon URL here
			inviteUrl: "https://discord.gg/th11-clash-community-593285788414902277",
		},
		{
			id: "1434054967747940366",
			name: "Let Us Hack",
			description: "A community for Cybersecurity Enthusiasts.",
			icon: "https://cdn.discordapp.com/icons/1434054967747940366/3c05cf8afa7dd9d79bbb3a0c62f27930.webp?size=80&quality=lossless", // Paste your server icon URL here
			inviteUrl: "https://discord.gg/CAKYpFKjsW",
		},
		{
			id: "593285788414902277",
			name: "The Imperials",
			description: "Largest Multi Server Empire in Minecraft Anarchy.",
			icon: "https://cdn.discordapp.com/icons/614275329879572501/7ffe6e6c17a20950b21e8d05fca469a7.webp?size=80&quality=lossless", // Paste your server icon URL here
			inviteUrl: "https://discord.gg/8Nvy7NGCq6",
		},
	];

	const [servers] = useState(serverConfigs);

	const formatNumber = (num) => {
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`;
		}
		return num.toString();
	};

	if (servers.length === 0) {
		return null;
	}

	return (
		<div className="discord-servers-container">
			<div className="discord-servers-header">
				<span className="subsection-title">AFFILIATE SERVERS</span>
			</div>
			<div className="servers-grid">
				{servers.map((server) => (
					<a
						key={server.id}
						href={server.inviteUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="server-card">
						<div className="server-card-header">
							<div className="server-icon-wrapper">
								<img
									src={
										server.icon ||
										"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ff5050' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='%23000'%3E%23%3C/text%3E%3C/svg%3E"
									}
									alt={`${server.name} icon`}
									className="server-icon"
									onError={(e) => {
										e.target.src =
											"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ff5050' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='48' text-anchor='middle' dominant-baseline='middle' fill='%23000'%3E%23%3C/text%3E%3C/svg%3E";
									}}
								/>
							</div>
							<div className="server-info">
								<h3 className="server-name">{server.name}</h3>
								<p className="server-description">{server.description}</p>
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

export default DiscordServers;
