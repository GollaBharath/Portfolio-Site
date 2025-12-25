import { useEffect, useState, useRef } from "react";
import "./SocialsPopup.css";
import spotifyIcon from "../../assets/SVGs/spotify.svg";
import githubIcon from "../../assets/SVGs/github.svg";
import linkedinIcon from "../../assets/SVGs/linkedin-linked-in-svgrepo-com.svg";
import youtubeIcon from "../../assets/SVGs/youtube-168-svgrepo-com.svg";
import instagramIcon from "../../assets/SVGs/insta-svgrepo-com.svg";
import redditIcon from "../../assets/SVGs/reddit-svgrepo-com.svg";
import whatsappIcon from "../../assets/SVGs/whatsapp-svgrepo-com.svg";
import discordIcon from "../../assets/SVGs/discord.svg";
import mailIcon from "../../assets/SVGs/mail-plus-svgrepo-com.svg";

const socialLinks = [
	{
		name: "LinkedIn",
		icon: linkedinIcon,
		url: "https://linkedin.com/in/golla-bharath",
		color: "#0A66C2",
		hoverColor: "#0077b5",
	},
	{
		name: "GitHub",
		icon: githubIcon,
		url: "https://github.com/GollaBharath",
		color: "#ffffff",
		hoverColor: "#e0e0e0",
	},
	{
		name: "Spotify",
		icon: spotifyIcon,
		url: "https://open.spotify.com/user/31enxavrkyobb5lbp4phl33jgnwq",
		color: "#1DB954",
		hoverColor: "#1ed760",
	},
	{
		name: "Discord",
		icon: discordIcon,
		url: "https://discordapp.com/users/972801524092776479",
		color: "#5865F2",
		hoverColor: "#6d78ff",
	},
	{
		name: "WhatsApp",
		icon: whatsappIcon,
		url: "https://wa.me/919059158791",
		color: "#25D366",
		hoverColor: "#2ce072",
	},
	{
		name: "YouTube",
		icon: youtubeIcon,
		url: "https://www.youtube.com/channel/UCQn4-TWf2So7nvGOPesGoaQ",
		color: "#FF0000",
		hoverColor: "#ff1a1a",
	},
	{
		name: "Instagram",
		icon: instagramIcon,
		url: "https://www.instagram.com/gollabharath_/",
		color: "#a259ff",
		hoverColor: "#b47aff",
	},
	{
		name: "Reddit",
		icon: redditIcon,
		url: "https://www.reddit.com/user/Dead-Indian/",
		color: "#FF4500",
		hoverColor: "#ff5722",
	},
	{
		name: "Mail",
		icon: mailIcon,
		color: "#e0e0e0",
		hoverColor: "#fff",
		url: "mailto:gollabharath2007@gmail.com",
		clipboard: "gollabharath2007@gmail.com",
	},
];

function SocialsPopup({ isOpen, onClose }) {
	const [selectedIndex, setSelectedIndex] = useState(0); // keyboard selection
	const [hoverIndex, setHoverIndex] = useState(null); // mouse hover
	const linkRefs = useRef([]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key >= "1" && e.key <= String(socialLinks.length)) {
				const index = Number(e.key) - 1;
				const social = socialLinks[index];
				setSelectedIndex(index);

				if (social.clipboard) {
					navigator.clipboard.writeText(social.clipboard);
				} else {
					window.open(social.url, "_blank");
				}
				return;
			}

			const grid = document.querySelector(".socials-grid");
			let numCols = 4;
			if (grid) {
				numCols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
			}

			if (e.key === "ArrowRight") {
				e.preventDefault();
				setSelectedIndex((i) => (i + 1) % socialLinks.length);
			}

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				setSelectedIndex((i) => (i === 0 ? socialLinks.length - 1 : i - 1));
			}

			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => {
					const next = i + numCols;
					return next < socialLinks.length ? next : i % numCols;
				});
			}

			if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => {
					const next = i - numCols;
					if (next >= 0) return next;

					const lastRowStart =
						Math.floor((socialLinks.length - 1) / numCols) * numCols;
					const candidate = lastRowStart + (i % numCols);
					return candidate < socialLinks.length
						? candidate
						: socialLinks.length - 1;
				});
			}

			if (e.key === "Enter") {
				e.preventDefault();
				linkRefs.current[selectedIndex]?.click();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, selectedIndex, onClose]);

	useEffect(() => {
		if (isOpen) linkRefs.current[selectedIndex]?.focus();
	}, [selectedIndex, isOpen]);

	if (!isOpen) return null;

	return (
		<div className="socials-overlay" onClick={onClose}>
			<div className="socials-popup" onClick={(e) => e.stopPropagation()}>
				<div className="socials-header">
					<div className="terminal-controls">
						<span className="terminal-prompt">$</span>
						<span className="terminal-title">CONNECT WITH ME</span>
					</div>
					<button className="socials-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="socials-content">
					<div className="socials-grid">
						{socialLinks.map((social, index) => {
							const isMail = !!social.clipboard;
							const isActive = selectedIndex === index || hoverIndex === index;

							return (
								<a
									key={social.name}
									ref={(el) => (linkRefs.current[index] = el)}
									href={isMail ? undefined : social.url}
									target={isMail ? undefined : "_blank"}
									rel="noopener noreferrer"
									tabIndex={0}
									className={`social-item ${isActive ? "selected" : ""}
									}`}
									style={{
										"--social-color": social.color,
										"--social-hover-color": social.hoverColor,
									}}
									onMouseEnter={() => setHoverIndex(index)}
									onMouseLeave={() => setHoverIndex(null)}
									onClick={
										isMail
											? (e) => {
													e.preventDefault();
													navigator.clipboard.writeText(social.clipboard);
											  }
											: undefined
									}>
									<span className="social-key-badge">{index + 1}</span>
									<div className="social-icon-wrapper">
										<img
											src={social.icon}
											className={`social-icon ${
												social.name === "Instagram" ? "instagram-icon" : ""
											}`}
											alt=""
										/>
									</div>
									<span className="social-name">{social.name}</span>
								</a>
							);
						})}
					</div>

					<div className="socials-footer">
						<p className="socials-footer-text">
							Use number keys (1–9) or arrow keys • Enter to open • ESC to close
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SocialsPopup;
