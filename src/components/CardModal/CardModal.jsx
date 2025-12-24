import { useState, useEffect } from "react";
import "./CardModal.css";
import SpotifyCard from "../SpotifyCard/SpotifyCard";
import DiscordCard from "../DiscordCard/DiscordCard";
import GitHubCard from "../GitHubCard/GitHubCard";
import WakaTimeCard from "../WakaTimeCard/WakaTimeCard";

/**
 * CardModal Component
 *
 * Full-page modal that displays stat cards.
 * Press ESC or click backdrop to close.
 */

function CardModal({ isOpen, cardId, onClose }) {
	// Close on ESC key
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const renderCard = () => {
		switch (cardId) {
			case "spotify":
				return <SpotifyCard discordId="972801524092776479" />;
			case "discord":
				return <DiscordCard discordId="972801524092776479" />;
			case "github":
				return <GitHubCard username="GollaBharath" />;
			case "wakatime":
				return (
					<WakaTimeCard embedUrl="https://wakatime.com/share/@gollabharath/394a6d6e-5264-4dfa-a9d7-4feeec9768b5.svg" />
				);
			default:
				return null;
		}
	};

	return (
		<div className="card-modal-overlay" onClick={onClose}>
			<div className="card-modal-content" onClick={(e) => e.stopPropagation()}>
				<button
					className="card-modal-close"
					onClick={onClose}
					aria-label="Close">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
						<line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
					</svg>
				</button>
				<div className="card-modal-inner">{renderCard()}</div>
			</div>
		</div>
	);
}

export default CardModal;
