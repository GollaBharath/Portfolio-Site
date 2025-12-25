import { useState, useEffect } from "react";
import "./SplashScreen.css";
import profileImage from "../../assets/Profile.jpg";

// Timing configuration (in ms)
const TIMING = {
	imageDelay: 200, // Delay before image appears
	textDelay: 400, // Delay before "Logging in..." appears
	holdDuration: 1800, // How long to show the splash before centering
	centerDuration: 800, // Duration of center animation
	fadeOutDuration: 600, // Duration of final fade
};

/**
 * SplashScreen - Login-style splash with profile image
 * Sequence: Image appears → "Logging in..." → Image centers → Fade out
 */
export default function SplashScreen({ onComplete }) {
	const [isActive, setIsActive] = useState(true); // Start active since App controls mounting
	const [imageVisible, setImageVisible] = useState(false);
	const [textVisible, setTextVisible] = useState(false);
	const [isCentering, setIsCentering] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	// Start the splash sequence
	useEffect(() => {
		// Respect reduced motion preference
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (prefersReducedMotion) {
			onComplete?.();
			return;
		}

		// Show image after initial delay
		const imageTimer = setTimeout(() => {
			setImageVisible(true);
		}, TIMING.imageDelay);

		// Show text after image
		const textTimer = setTimeout(() => {
			setTextVisible(true);
		}, TIMING.imageDelay + TIMING.textDelay);

		// Start centering animation
		const centerTimer = setTimeout(() => {
			setIsCentering(true);
		}, TIMING.imageDelay + TIMING.textDelay + TIMING.holdDuration);

		// Start fade out after centering
		const fadeTimer = setTimeout(() => {
			setIsExiting(true);
		}, TIMING.imageDelay + TIMING.textDelay + TIMING.holdDuration + TIMING.centerDuration);

		// Complete after fade
		const completeTimer = setTimeout(() => {
			setIsActive(false);
			onComplete?.();
		}, TIMING.imageDelay + TIMING.textDelay + TIMING.holdDuration + TIMING.centerDuration + TIMING.fadeOutDuration);

		return () => {
			clearTimeout(imageTimer);
			clearTimeout(textTimer);
			clearTimeout(centerTimer);
			clearTimeout(fadeTimer);
			clearTimeout(completeTimer);
		};
	}, [onComplete]);

	if (!isActive) return null;

	return (
		<div
			className="splash-overlay"
			data-state={isExiting ? "exiting" : "active"}
			role="dialog"
			aria-modal="true"
			aria-label="System login splash">
			<div className="splash-content">
				<div
					className="splash-profile"
					data-visible={imageVisible}
					data-state={isCentering ? "centering" : "idle"}>
					<img src={profileImage} alt="Bharath" draggable={false} />
				</div>

				<div
					className="splash-login-text"
					data-visible={textVisible}
					data-state={isCentering ? "centering" : "idle"}>
					Logging in<span className="splash-dots"></span>
				</div>
			</div>
		</div>
	);
}
