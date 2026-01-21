import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "./BootSequence.css";

// Boot log content - structured for line-by-line reveal
const BASE_BOOT_LINES = [
	{
		text: "[  OK  ] Started - Impress.Visitor - initialized BIOS",
		type: "log",
		status: "ok",
	},
	{
		text: "[  OK  ] Finished - Loading.Assets - Display Server (Xorg) active.",
		type: "log",
		status: "ok",
	},
	{
		text: "[FAILED] Error - Read.Everything - Don't ignore my hard work.",
		type: "log",
		status: "failed",
	},
];

// Timing configuration (in ms)
const TIMING = {
	initialDelay: 200, // Delay before first line
	charSpeed: 18, // Delay between each character
	lineGap: 80, // Pause after line completes before next line starts
	pauseAfterLogs: 400, // Extra pause before user block
	pauseBeforePrompt: 300, // Extra pause before final prompt
};

// Parse a status line into segments for coloring and smooth typing
function parseStatusLine(text, status) {
	const statusMatch = text.match(/^(\[\s*(?:OK|FAILED|info)\s*\])(.*)$/);
	if (!statusMatch) return null;

	const statusBracket = statusMatch[1];
	const restText = statusMatch[2];
	const dashMatch = restText.match(/^(.+?)-(.+?)-(.+)$/);

	if (!dashMatch) {
		return [
			{ text: statusBracket, className: `status-${status}` },
			{ text: restText, className: undefined },
		];
	}

	const [, beforeDash, serviceName, afterDash] = dashMatch;

	return [
		{ text: statusBracket, className: `status-${status}` },
		{ text: `${beforeDash}-`, className: "service-text" },
		{ text: `${serviceName}-`, className: undefined },
		{ text: afterDash, className: "service-text" },
	];
}

// Render any portion of the parsed segments up to visibleChars
function renderSegmentSlice(segments, visibleChars) {
	let remaining = visibleChars;
	const parts = [];

	for (let i = 0; i < segments.length && remaining > 0; i += 1) {
		const { text, className } = segments[i];
		const slice = text.slice(0, remaining);
		if (slice.length === 0) continue;
		parts.push(
			className ? (
				<span key={i} className={className}>
					{slice}
				</span>
			) : (
				slice
			),
		);
		remaining -= slice.length;
	}

	return parts;
}

/**
 * TypewriterLine - Renders text character by character
 * Calls onComplete when all characters are revealed
 */
function TypewriterLine({ text, type, status, isActive, onComplete }) {
	const [charCount, setCharCount] = useState(0);
	const intervalRef = useRef(null);
	const parsedSegments =
		(type === "log" || type === "prompt") && status
			? parseStatusLine(text, status)
			: null;
	const totalLength = text.length;

	useEffect(() => {
		if (!isActive) {
			setCharCount(0);
			return;
		}

		intervalRef.current = setInterval(() => {
			setCharCount((prev) => {
				const next = prev + 1;
				if (next >= totalLength) {
					clearInterval(intervalRef.current);
					setTimeout(() => onComplete?.(), TIMING.lineGap);
				}
				return next;
			});
		}, TIMING.charSpeed);

		return () => clearInterval(intervalRef.current);
	}, [isActive, onComplete, totalLength]);

	if (!isActive && charCount === 0) return null;

	if (parsedSegments) {
		return <>{renderSegmentSlice(parsedSegments, charCount)}</>;
	}

	return <>{text.slice(0, charCount)}</>;
}

// Render full status lines once typing is complete
function renderStatusLine(text, status) {
	const statusMatch = text.match(/^(\[\s*(?:OK|FAILED|info)\s*\])(.*)$/);
	if (!statusMatch) return text;
	const [, bracket, restText] = statusMatch;

	// For prompt on desktop, bold Enter
	if (status === "info" && restText.includes("Enter")) {
		const [before, after] = restText.split("Enter");
		return (
			<>
				<span className={`status-${status}`}>{bracket}</span>
				{before}
				<strong>Enter</strong>
				{after}
			</>
		);
	}

	const segments = parseStatusLine(text, status);
	if (!segments) return text;
	return <>{renderSegmentSlice(segments, Number.POSITIVE_INFINITY)}</>;
}

/**
 * BootSequence - System initialization overlay
 * Runs once per session, blocks interaction until complete or skipped.
 * Reduced-motion handling is managed by the system state model (parent).
 */
export default function BootSequence({ onComplete }) {
	const [isExiting, setIsExiting] = useState(false);
	const [currentLine, setCurrentLine] = useState(-1); // -1 = not started
	const [isMobile, setIsMobile] = useState(false);

	// Detect coarse pointers to switch copy for mobile/tablet
	useEffect(() => {
		if (typeof window === "undefined") return undefined;
		const mq = window.matchMedia("(pointer: coarse)");
		setIsMobile(mq.matches);
		const handler = (e) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const promptText = isMobile
		? "[  info  ] Click anywhere to continue."
		: "[  info  ] press Enter to continue.";

	const bootLines = useMemo(
		() => [
			...BASE_BOOT_LINES,
			{ text: promptText, type: "prompt", status: "info" },
		],
		[promptText],
	);

	// Complete the boot sequence with fade out
	const complete = useCallback(() => {
		if (isExiting) return;
		setIsExiting(true);

		// Wait for fade animation to finish before fully removing
		setTimeout(() => {
			onComplete?.();
		}, 400);
	}, [isExiting, onComplete]);

	// Handle line completion - advance to next line with appropriate delays
	const handleLineComplete = useCallback(
		(lineIndex) => {
			// Calculate delay before next line
			let delay = 0;

			// Add extra pause after log block (before prompt)
			if (lineIndex === 2) {
				delay = TIMING.pauseAfterLogs;
			}
			// Add pause before final prompt
			else if (lineIndex === bootLines.length - 2) {
				delay = TIMING.pauseBeforePrompt;
			}

			setTimeout(() => {
				setCurrentLine((prev) => prev + 1);
			}, delay);
		},
		[bootLines.length],
	);

	// Start the sequence
	useEffect(() => {
		if (isExiting || currentLine >= 0) return;

		const timeoutId = setTimeout(() => {
			setCurrentLine(0);
		}, TIMING.initialDelay);

		return () => clearTimeout(timeoutId);
	}, [isExiting, currentLine]);

	// Skip handlers - only Enter (desktop) or click/tap completes the sequence
	useEffect(() => {
		if (isExiting) return;

		const handleSkip = (e) => {
			if (e.type === "keydown") {
				if (e.key !== "Enter") return;
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
	}, [isExiting, complete]);

	return (
		<div
			className="boot-overlay"
			data-state={isExiting ? "exiting" : "active"}
			role="dialog"
			aria-modal="true"
			aria-label="System boot sequence">
			<div className="boot-log">
				{bootLines.map((line, index) => {
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
								(line.type === "log" || line.type === "prompt") &&
								line.status ? (
									renderStatusLine(line.text, line.status)
								) : (
									line.text
								)
							) : (
								// Currently typing
								<TypewriterLine
									text={line.text}
									type={line.type}
									status={line.status}
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
