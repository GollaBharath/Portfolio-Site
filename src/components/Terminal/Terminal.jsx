import { useState, useEffect, useRef } from "react";
import {
	REACTIVE_COMMANDS,
	useSystemEvents,
} from "../../context/SystemEventContext";
import {
	SYSTEM_STATES,
	useSystemState,
} from "../../context/SystemStateContext";
import "./Terminal.css";

function Terminal({ onHelpClick, onSocialsClick }) {
	const [input, setInput] = useState("");
	const [isShaking, setIsShaking] = useState(false);
	const [suggestion, setSuggestion] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [hintVisible, setHintVisible] = useState(false);
	const [hintExiting, setHintExiting] = useState(false);
	const inputRef = useRef(null);

	// Get system event emitter for background reactions
	const { emitCommand } = useSystemEvents();
	const { systemState, terminalHintShown, markTerminalHintShown, runCommand } =
		useSystemState();

	// Define available commands
	const commands = {
		help: () => {
			// Hide the hint when help is used
			setHintVisible(false);
			setHintExiting(false);
			if (onHelpClick) {
				onHelpClick();
			}
		},
		socials: () => {
			if (onSocialsClick) {
				onSocialsClick();
			}
		},
		about: () => {
			const element = document.getElementById("about");
			if (element)
				element.scrollIntoView({ behavior: "smooth", block: "center" });
		},
		home: () => {
			const element = document.getElementById("home");
			if (element)
				element.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		experience: () => {
			const element = document.getElementById("experience");
			if (element)
				element.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		projects: () => alert("Projects section coming soon!"),
		contact: () => alert("Contact section coming soon!"),
		reddit: () =>
			window.open("https://www.reddit.com/user/Dead-Indian/", "_blank"),
		spotify: () =>
			window.open(
				"https://open.spotify.com/user/31enxavrkyobb5lbp4phl33jgnwq",
				"_blank"
			),
		discord: () =>
			window.open("https://discordapp.com/users/972801524092776479", "_blank"),
		instagram: () =>
			window.open("https://www.instagram.com/gollabharath_/", "_blank"),
		whatsapp: () => window.open("https://wa.me/919059158791", "_blank"),
		youtube: () =>
			window.open(
				"https://www.youtube.com/channel/UCQn4-TWf2So7nvGOPesGoaQ",
				"_blank"
			),
		github: () => window.open("https://github.com/GollaBharath", "_blank"),
		linkedin: () =>
			window.open("https://linkedin.com/in/golla-bharath", "_blank"),
		resume: () =>
			window.open(
				"https://drive.google.com/file/d/1Cf13Is6J9zJmrMjZV74bdV34bLx_amtu/view?usp=sharing",
				"_blank"
			),
		clear: () => setInput(""),
	};

	// Check if device is mobile
	const isMobile = () => {
		return (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			) || window.innerWidth <= 768
		);
	};

	// Auto-focus on desktop
	useEffect(() => {
		if (!isMobile() && inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	// Minimal discoverability: show a one-time hint on the first idle state only.
	useEffect(() => {
		if (terminalHintShown) return;
		const isIdleLike =
			systemState === SYSTEM_STATES.IDLE ||
			systemState === SYSTEM_STATES.REDUCED_MOTION;
		if (!isIdleLike) return;

		setHintVisible(true);
		markTerminalHintShown();

		// Start exit animation after 4.6s, then fully hide after animation completes
		const exitTimer = setTimeout(() => {
			setHintExiting(true);
		}, 4600);

		const hideTimer = setTimeout(() => {
			setHintVisible(false);
			setHintExiting(false);
		}, 5000);

		return () => {
			clearTimeout(exitTimer);
			clearTimeout(hideTimer);
		};
	}, [systemState, terminalHintShown, markTerminalHintShown]);

	// Listen for "/" key globally to focus terminal
	useEffect(() => {
		const handleGlobalKeyPress = (e) => {
			// Check if "/" is pressed and not already focused on an input
			if (
				e.key === "/" &&
				document.activeElement !== inputRef.current &&
				document.activeElement.tagName !== "INPUT" &&
				document.activeElement.tagName !== "TEXTAREA"
			) {
				e.preventDefault();
				if (inputRef.current) {
					inputRef.current.focus();
				}
			}
		};

		window.addEventListener("keydown", handleGlobalKeyPress);
		return () => window.removeEventListener("keydown", handleGlobalKeyPress);
	}, []);

	// Handle input changes and suggest commands
	useEffect(() => {
		if (input) {
			// Remove leading slash for matching
			const cleanInput = input.toLowerCase().replace(/^\/+/, "");
			const matchingCommands = Object.keys(commands).filter((cmd) =>
				cmd.startsWith(cleanInput)
			);

			// Set first match for inline suggestion
			if (matchingCommands.length > 0 && matchingCommands[0] !== cleanInput) {
				setSuggestion(matchingCommands[0]);
			} else {
				setSuggestion("");
			}

			// Set all matches for dropdown
			if (matchingCommands.length > 0 && cleanInput !== matchingCommands[0]) {
				setSuggestions(matchingCommands);
				setSelectedIndex(0); // Reset selection when suggestions change
			} else {
				setSuggestions([]);
				setSelectedIndex(0);
			}
		} else {
			setSuggestion("");
			setSuggestions([]);
			setSelectedIndex(0);
		}
	}, [input]);

	const handleKeyDown = (e) => {
		// Arrow Up - navigate suggestions
		if (e.key === "ArrowUp" && suggestions.length > 0) {
			e.preventDefault();
			setSelectedIndex((prev) => {
				const newIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
				setSuggestion(suggestions[newIndex]);
				return newIndex;
			});
		}

		// Arrow Down - navigate suggestions
		if (e.key === "ArrowDown" && suggestions.length > 0) {
			e.preventDefault();
			setSelectedIndex((prev) => {
				const newIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
				setSuggestion(suggestions[newIndex]);
				return newIndex;
			});
		}

		// Escape to dismiss suggestions
		if (e.key === "Escape") {
			e.preventDefault();
			setSuggestion("");
			setSuggestions("");
			return;
		}

		// Ctrl+C to clear input immediately
		if (e.ctrlKey && e.key === "c") {
			e.preventDefault();
			setInput("");
			setSuggestion("");
			setSuggestions([]);
			return;
		}

		// Tab to autocomplete
		if (e.key === "Tab" && suggestion) {
			e.preventDefault();
			setInput(suggestion);
			setSuggestion("");
			setSuggestions([]);
		}

		// Enter to execute command
		if (e.key === "Enter") {
			e.preventDefault();
			// Remove leading slash if present and trim
			const command = input.toLowerCase().trim().replace(/^\/+/, "");
			const isReactive = REACTIVE_COMMANDS.includes(command);

			if (commands[command]) {
				// State transition is the primary driver for short-lived system reactions.
				runCommand(command, { isReactive });

				// Emit command event for background reactions
				emitCommand(command);

				commands[command]();
				setInput("");
				setSuggestion("");
				setSuggestions([]);
			} else if (input.trim()) {
				runCommand(command, { isReactive });
				// Invalid command - shake and clear
				setIsShaking(true);
				setTimeout(() => {
					setIsShaking(false);
					setInput("");
					setSuggestion("");
					setSuggestions([]);
				}, 500);
			}
		}
	};

	const handleChange = (e) => {
		if (!isShaking) {
			setInput(e.target.value);
		}
	};

	const handleSuggestionClick = (cmd) => {
		setInput(cmd);
		setSuggestion("");
		setSuggestions([]);
		// Refocus input after clicking suggestion
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	return (
		<div className="terminal-container">
			{hintVisible && (
				<div
					className="terminal-hint"
					data-state={hintExiting ? "exiting" : "visible"}>
					Try typing <span className="terminal-hint__kbd">help</span> to get
					started
				</div>
			)}
			{suggestions.length > 0 && (
				<div className="autocomplete-dropdown">
					{suggestions.map((cmd, index) => (
						<div
							key={cmd}
							className={`autocomplete-item ${
								index === selectedIndex ? "selected" : ""
							}`}
							onClick={() => handleSuggestionClick(cmd)}
							onTouchEnd={(e) => {
								e.preventDefault();
								handleSuggestionClick(cmd);
							}}>
							<span className="autocomplete-icon">
								{index === selectedIndex ? "⌘" : "›"}
							</span>
							<span className="autocomplete-text">{cmd}</span>
							{index === selectedIndex && (
								<span className="autocomplete-hint">Tab</span>
							)}
						</div>
					))}
				</div>
			)}
			<div
				className={`terminal-input-wrapper ${isShaking ? "shake error" : ""}`}>
				<span className="terminal-prompt">$</span>
				<div className="input-container">
					<input
						ref={inputRef}
						type="text"
						className="terminal-input"
						value={input}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						spellCheck="false"
						autoComplete="off"
						placeholder="Press / to use CLI..."
					/>
					{suggestion && (
						<span className="terminal-suggestion">
							{input}
							<span className="suggestion-text">
								{suggestion.slice(input.replace(/^\/+/, "").length)}
							</span>
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default Terminal;
