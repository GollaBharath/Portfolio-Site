import { useState, useEffect, useRef } from "react";
import "./Terminal.css";

function Terminal() {
	const [input, setInput] = useState("");
	const [isShaking, setIsShaking] = useState(false);
	const [suggestion, setSuggestion] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef(null);

	// Define available commands
	const commands = {
		help: () =>
			alert(`Available commands:\n${Object.keys(commands).join("\n")}`),
		home: () => (window.location.hash = "/"),
		about: () => (window.location.hash = "/about"),
		projects: () => (window.location.hash = "/projects"),
		contact: () => (window.location.hash = "/contact"),
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

	// Handle input changes and suggest commands
	useEffect(() => {
		if (input) {
			const matchingCommands = Object.keys(commands).filter((cmd) =>
				cmd.startsWith(input.toLowerCase())
			);

			// Set first match for inline suggestion
			if (
				matchingCommands.length > 0 &&
				matchingCommands[0] !== input.toLowerCase()
			) {
				setSuggestion(matchingCommands[0]);
			} else {
				setSuggestion("");
			}

			// Set all matches for dropdown
			if (
				matchingCommands.length > 0 &&
				input.toLowerCase() !== matchingCommands[0]
			) {
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
			const command = input.toLowerCase().trim();

			if (commands[command]) {
				commands[command]();
				setInput("");
				setSuggestion("");
				setSuggestions([]);
			} else if (input.trim()) {
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

	return (
		<div className="terminal-container">
			{suggestions.length > 0 && (
				<div className="autocomplete-dropdown">
					{suggestions.map((cmd, index) => (
						<div
							key={cmd}
							className={`autocomplete-item ${
								index === selectedIndex ? "selected" : ""
							}`}>
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
						placeholder="Type help to see list of commands..."
					/>
					{suggestion && (
						<span className="terminal-suggestion">
							{input}
							<span className="suggestion-text">
								{suggestion.slice(input.length)}
							</span>
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default Terminal;
