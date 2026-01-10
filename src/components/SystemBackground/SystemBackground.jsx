import { useEffect, useState, useCallback, useRef } from "react";
import {
	SYSTEM_STATES,
	useSystemState,
} from "../../context/SystemStateContext";
import "./SystemBackground.css";

/**
 * SystemBackground Component
 *
 * Responsible for:
 * - Global background visuals (gradients, ambient glow, subtle motion)
 * - Listening to system events and triggering visual reactions
 * - Never interfering with interactive elements (pointer-events: none)
 *
 * Visual Language:
 * - Pure black base with neutral highlights
 * - Very slow ambient rotation (120s cycle) - barely noticeable
 * - Reactive effects are short (<800ms) and always return to idle
 *
 * Z-Index: 0 (bottom layer)
 */

function SystemBackground() {
	const { systemState, activeCommand, prefersReducedMotion } = useSystemState();

	// Effect states - each becomes active briefly then returns to idle
	const [scanActive, setScanActive] = useState(false);
	const [pulseActive, setPulseActive] = useState(false);
	const [arcActive, setArcActive] = useState(false);

	// Prevent effect stacking with debounce
	const effectTimeoutRef = useRef(null);

	/**
	 * Trigger a visual effect based on command type
	 * Effects are mutually exclusive and auto-resolve
	 */
	const triggerEffect = useCallback((command) => {
		// Clear any pending effect timeout
		if (effectTimeoutRef.current) {
			clearTimeout(effectTimeoutRef.current);
		}

		// Reset all effects first
		setScanActive(false);
		setPulseActive(false);
		setArcActive(false);

		// Small delay to allow CSS reset, then trigger appropriate effect
		requestAnimationFrame(() => {
			switch (command) {
				case "scan":
				case "status":
					// Scan sweep effect - vertical line sweep
					setScanActive(true);
					effectTimeoutRef.current = setTimeout(
						() => setScanActive(false),
						700
					);
					break;

				case "whoami":
				case "about":
					// Data arc effect - rotating arc from center
					setArcActive(true);
					effectTimeoutRef.current = setTimeout(() => setArcActive(false), 700);
					break;

				case "help":
				default:
					// Radial pulse - simple acknowledgment
					setPulseActive(true);
					effectTimeoutRef.current = setTimeout(
						() => setPulseActive(false),
						900
					);
					break;
			}
		});
	}, []);

	useEffect(() => {
		if (prefersReducedMotion) return;
		if (systemState !== SYSTEM_STATES.ACTIVE_COMMAND) return;
		if (!activeCommand?.isReactive) return;
		triggerEffect(activeCommand.command);
	}, [systemState, activeCommand, prefersReducedMotion, triggerEffect]);

	useEffect(() => {
		if (systemState === SYSTEM_STATES.ACTIVE_COMMAND) return;
		if (effectTimeoutRef.current) {
			clearTimeout(effectTimeoutRef.current);
			effectTimeoutRef.current = null;
		}
		setScanActive(false);
		setPulseActive(false);
		setArcActive(false);
	}, [systemState]);

	useEffect(() => {
		return () => {
			if (effectTimeoutRef.current) {
				clearTimeout(effectTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="system-background" aria-hidden="true">
			{/* Ambient gradient layer */}
			<div className="system-background__ambient" />

			{/* Slow rotating gradient flow */}
			<div className="system-background__flow" />

			{/* Subtle structural grid */}
			<div className="system-background__grid" />

			{/* Reactive effects - rendered but hidden until triggered */}
			<div
				className={`system-background__scanline ${
					scanActive ? "system-background__scanline--active" : ""
				}`}
			/>
			<div
				className={`system-background__pulse ${
					pulseActive ? "system-background__pulse--active" : ""
				}`}
			/>
			<div
				className={`system-background__arc ${
					arcActive ? "system-background__arc--active" : ""
				}`}
			/>
		</div>
	);
}

export default SystemBackground;
