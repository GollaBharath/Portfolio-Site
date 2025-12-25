import { useCallback, useEffect, useRef, useState } from "react";
import { useSystemEvents } from "../../context/SystemEventContext";
import profileImage from "../../assets/Profile.jpg";
import "./SystemCore.css";

/**
 * SystemCore Component
 *
 * The center-fixed image representing the system core / identity.
 * This is the visual anchor of the portfolio - always visible, always centered.
 *
 * Responsibilities:
 * - Render the profile image at viewport center
 * - Handle hover, focus, and click interactions
 * - Emit openAboutPanel event when activated
 * - Remain fully accessible via keyboard navigation
 *
 * Positioning:
 * - position: fixed, centered via transform
 * - Z-index: 5 (above background, below draggable folders)
 *
 * Accessibility:
 * - Focusable via Tab
 * - Enter/Space triggers click
 * - Respects prefers-reduced-motion
 */

function SystemCore({ onAboutClick }) {
	const { openAboutPanel, subscribe, EVENTS } = useSystemEvents();
	const imageWrapperRef = useRef(null);
	const [clickPulse, setClickPulse] = useState(false);

	/**
	 * Subscribe to command execution events to trigger pulse effect
	 */
	useEffect(() => {
		const unsubscribe = subscribe(EVENTS.COMMAND_EXECUTED, () => {
			setClickPulse(true);
			setTimeout(() => setClickPulse(false), 1200);
		});

		return unsubscribe;
	}, [subscribe, EVENTS.COMMAND_EXECUTED]);

	/**
	 * Handle click/activation of the system core
	 * Emits event for any listeners and calls optional callback
	 */
	const handleActivate = useCallback(
		(event) => {
			// Trigger click pulse effect
			setClickPulse(true);
			setTimeout(() => setClickPulse(false), 800);

			// Emit system event for any listeners
			openAboutPanel();

			// Call optional callback prop if provided
			if (onAboutClick) {
				onAboutClick();
			}
		},
		[openAboutPanel, onAboutClick]
	);

	/**
	 * Handle keyboard activation
	 * Enter or Space triggers the same action as click
	 */
	const handleKeyDown = useCallback(
		(event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleActivate();
			}
		},
		[handleActivate]
	);

	/**
	 * Prevent the image from being dragged
	 * This avoids accidental drag interactions
	 */
	const handleDragStart = useCallback((event) => {
		event.preventDefault();
	}, []);

	return (
		<div className="system-core" role="region" aria-label="System Core">
			{/* Idle pulse rings - multiple layers for wave effect */}
			<div
				className="system-core__pulse-ring system-core__pulse-ring--1"
				aria-hidden="true"
			/>
			<div
				className="system-core__pulse-ring system-core__pulse-ring--2"
				aria-hidden="true"
			/>
			<div
				className="system-core__pulse-ring system-core__pulse-ring--3"
				aria-hidden="true"
			/>

			{/* Click pulse rings - multiple layers for wave effect */}
			{clickPulse && (
				<>
					<div
						className="system-core__click-pulse system-core__click-pulse--1"
						aria-hidden="true"
					/>
					<div
						className="system-core__click-pulse system-core__click-pulse--2"
						aria-hidden="true"
					/>
					<div
						className="system-core__click-pulse system-core__click-pulse--3"
						aria-hidden="true"
					/>
				</>
			)}

			{/* Interactive image wrapper */}
			<div
				ref={imageWrapperRef}
				className="system-core__image-wrapper"
				onClick={handleActivate}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="button"
				aria-label="Open about panel">
				<img
					src={profileImage}
					alt="Profile"
					className="system-core__image"
					draggable={false}
					onDragStart={handleDragStart}
				/>
			</div>

			{/* Tooltip */}
			<div className="system-core__tooltip" aria-hidden="true">
				CLICK ME
			</div>

			{/* Screen reader instruction */}
			<span className="system-core__sr-only">
				Press Enter or Space to learn more about the system owner
			</span>
		</div>
	);
}

export default SystemCore;
