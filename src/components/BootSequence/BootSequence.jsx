import { useState, useEffect, useCallback, useRef } from "react";
import "./BootSequence.css";

// Boot log content - structured for line-by-line reveal
const BOOT_LINES = [
	{ text: "[ OK ] Initializing interface", type: "log" },
	{ text: "[ OK ] Loading modules: ui, systems, automation", type: "log" },
	{ text: "[ OK ] Mounting workspace", type: "log" },
	{ text: "", type: "spacer" }, // Pause before user block
	{ text: "USER: bharath", type: "user" },
	{ text: "ROLE: Computer Science Engineer", type: "user" },
	{ text: "MODE: system builder", type: "user" },
	{ text: "", type: "spacer" },
	{ text: "> Press any key to continue", type: "prompt" },
];

// Timing configuration (in ms)
const TIMING = {
	initialDelay: 200, // Delay before first line
	charSpeed: 18, // Delay between each character
	lineGap: 80, // Pause after line completes before next line starts
	pauseAfterLogs: 400, // Extra pause before user block
	pauseBeforePrompt: 300, // Extra pause before final prompt
};

/**
 * TypewriterLine - Renders text character by character
 * Calls onComplete when all characters are revealed
 */
function TypewriterLine({ text, type, isActive, onComplete }) {
	const [charCount, setCharCount] = useState(0);
	const intervalRef = useRef(null);

	useEffect(() => {
		if (!isActive) {
			setCharCount(0);
			return;
		}

		// Start typing
		intervalRef.current = setInterval(() => {
			setCharCount((prev) => {
				const next = prev + 1;
				if (next >= text.length) {
					clearInterval(intervalRef.current);
					// Notify parent that line is complete
					setTimeout(() => onComplete?.(), TIMING.lineGap);
				}
				return next;
			});
		}, TIMING.charSpeed);

		return () => clearInterval(intervalRef.current);
	}, [isActive, text, onComplete]);

	if (!isActive && charCount === 0) return null;

	const visibleText = text.slice(0, charCount);

	// For log lines, style the [ OK ] prefix differently
	if (type === "log") {
		const okPrefix = "[ OK ]";
		if (charCount <= okPrefix.length) {
			return <span className="status-ok">{visibleText}</span>;
		}
		return (
			<>
				<span className="status-ok">{okPrefix}</span>
				{visibleText.slice(okPrefix.length)}
			</>
		);
	}

	return <>{visibleText}</>;
}

/**
 * BootSequence - System initialization overlay
 * Runs once per session, blocks interaction until complete or skipped.
 * Respects prefers-reduced-motion by not rendering at all.
 */
export default function BootSequence({ onComplete }) {
	const [isActive, setIsActive] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const [currentLine, setCurrentLine] = useState(-1); // -1 = not started
	const hasInitialized = useRef(false);

	// Check if we should show boot sequence
	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;

		// Respect reduced motion preference - skip entirely
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (prefersReducedMotion) {
			onComplete?.();
			return;
		}

		// Activate the boot sequence
		setIsActive(true);
	}, [onComplete]);

	// Complete the boot sequence with fade out
	const complete = useCallback(() => {
		if (isExiting) return;
		setIsExiting(true);

		// Wait for fade animation to finish before fully removing
		setTimeout(() => {
			setIsActive(false);
			onComplete?.();
		}, 400);
	}, [isExiting, onComplete]);

	// Handle line completion - advance to next line with appropriate delays
	const handleLineComplete = useCallback((lineIndex) => {
		// Calculate delay before next line
		let delay = 0;

		// Add extra pause after log block (before user info)
		if (lineIndex === 2) {
			delay = TIMING.pauseAfterLogs;
		}
		// Add pause before final prompt
		else if (lineIndex === BOOT_LINES.length - 2) {
			delay = TIMING.pauseBeforePrompt;
		}

		setTimeout(() => {
			setCurrentLine((prev) => prev + 1);
		}, delay);
	}, []);

	// Start the sequence
	useEffect(() => {
		if (!isActive || isExiting || currentLine >= 0) return;

		const timeoutId = setTimeout(() => {
			setCurrentLine(0);
		}, TIMING.initialDelay);

		return () => clearTimeout(timeoutId);
	}, [isActive, isExiting, currentLine]);

	// Skip handlers - any key or click completes the sequence
	useEffect(() => {
		if (!isActive || isExiting) return;

		const handleSkip = (e) => {
			// Prevent default for space/enter to avoid page scroll
			if (e.type === "keydown" && (e.key === " " || e.key === "Enter")) {
				e.preventDefault();
			}
			complete();
		};

		window.addEventListener("keydown", handleSkip);
		window.addEventListener("click", handleSkip);

		return () => {
			window.removeEventListener("keydown", handleSkip);
			window.removeEventListener("click", handleSkip);
		};
	}, [isActive, isExiting, complete]);

	// Don't render if not active
	if (!isActive) return null;

	return (
		<div
			className="boot-overlay"
			data-state={isExiting ? "exiting" : "active"}
			role="dialog"
			aria-modal="true"
			aria-label="System boot sequence">
			<div className="boot-log">
				{BOOT_LINES.map((line, index) => {
					if (line.type === "spacer") {
						// Show spacer only after previous lines are done
						const isVisible = index <= currentLine;
						return (
							<div
								key={index}
								className="boot-spacer"
								data-visible={isVisible}
								aria-hidden="true"
							/>
						);
					}

					const isLineActive = index === currentLine;
					const isLineComplete = index < currentLine;
					const lineClass =
						line.type === "user"
							? "boot-line user-info"
							: line.type === "prompt"
							? "boot-line prompt-line"
							: "boot-line";

					return (
						<div
							key={index}
							className={lineClass}
							data-visible={isLineActive || isLineComplete}
							aria-hidden={!isLineActive && !isLineComplete}>
							{isLineComplete ? (
								// Already typed - show full text
								line.type === "log" ? (
									<>
										<span className="status-ok">[ OK ]</span>
										{line.text.replace("[ OK ]", "")}
									</>
								) : (
									line.text
								)
							) : (
								// Currently typing
								<TypewriterLine
									text={line.text}
									type={line.type}
									isActive={isLineActive}
									onComplete={() => handleLineComplete(index)}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
