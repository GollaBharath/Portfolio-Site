import { useState, useEffect, useRef } from "react";
import GlobeIcon from "@/assets/SVGs/globe-svgrepo-com.svg?react";
import PinIcon from "@/assets/SVGs/pin-rounded-circle-620-svgrepo-com.svg?react";
import KeyboardIcon from "@/assets/SVGs/keyboard-alt-1-svgrepo-com.svg?react";
import "./CommandCarousel.css";

function CommandCarousel({ isOpen, onClose }) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [currentX, setCurrentX] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);
	const trackRef = useRef(null);
	const viewportRef = useRef(null);
	const startYRef = useRef(0);

	// All commands grouped by category
	const commandSlides = [
		{
			category: "Navigation",
			icon: <PinIcon />,
			color: "#ff5050",
			commands: [
				{ name: "home", desc: "Scroll to the beginning.", action: "home" },
				{
					name: "experience",
					desc: "Scroll to experience section",
					action: "experience",
				},
				{
					name: "projects",
					desc: "Scroll to projects section",
					action: "projects",
				},
				{
					name: "socials",
					desc: "Scroll to socials section",
					action: "socials",
				},
				{ name: "help", desc: "View this command reference", action: "help" },
				{ name: "clear", desc: "Clear the terminal input", action: "clear" },
			],
		},
		{
			category: "Socials",
			icon: <GlobeIcon />,
			color: "#ff6b6b",
			commands: [
				{
					name: "github",
					desc: "Check out my GitHub profile",
					action: "github",
				},
				{
					name: "linkedin",
					desc: "Visit my LinkedIn profile",
					action: "linkedin",
				},
				{ name: "resume", desc: "View my resume online", action: "resume" },
				{
					name: "instagram",
					desc: "Follow me on Instagram",
					action: "instagram",
				},
				{
					name: "reddit",
					desc: "Check out my Reddit profile",
					action: "reddit",
				},
				{
					name: "spotify",
					desc: "Listen to my Spotify playlists",
					action: "spotify",
				},
				{
					name: "discord",
					desc: "Connect with me on Discord",
					action: "discord",
				},
				{
					name: "youtube",
					desc: "Subscribe to my YouTube channel",
					action: "youtube",
				},
			],
		},
		{
			category: "Keyboard Shortcuts",
			icon: <KeyboardIcon />,
			color: "#ff9999",
			commands: [
				{ name: "Tab", desc: "Autocomplete command", action: "autocomplete" },
				{
					name: "↑/↓",
					desc: "Navigate through suggestions",
					action: "navigate",
				},
				{ name: "Enter", desc: "Execute the typed command", action: "execute" },
				{ name: "Esc", desc: "Close suggestions dropdown", action: "dismiss" },
				{ name: "Ctrl+C", desc: "Clear input immediately", action: "clear" },
			],
		},
	];

	const totalSlides = commandSlides.length;

	const goToSlide = (index) => {
		setCurrentSlide(index);
	};

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % totalSlides);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
	};

	// Drag/Swipe handlers
	const handleDragStart = (e) => {
		// Don't start dragging if clicking on scrollable content
		if (e.target.closest(".commands-grid")) {
			return;
		}

		setIsDragging(true);
		const x = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
		const y = e.type.includes("mouse") ? e.pageY : e.touches[0].pageY;
		setStartX(x);
		setCurrentX(x);
		startYRef.current = y;
	};

	const handleDragMove = (e) => {
		if (!isDragging) return;
		// Don't interfere with scrollable content
		if (e.target.closest(".commands-grid")) {
			return;
		}
		// Only handle mouse events here (touch is handled separately)
		if (e.type.includes("mouse")) {
			e.preventDefault(); // Prevent text selection during drag
			const x = e.pageX;
			setCurrentX(x);
			const diff = x - startX;
			setDragOffset(diff);
		}
	};

	const handleDragEnd = () => {
		if (!isDragging) return;

		const diff = currentX - startX;
		const threshold = 50; // minimum drag distance to trigger slide change

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				// Dragged right - go to previous
				prevSlide();
			} else {
				// Dragged left - go to next
				nextSlide();
			}
		}

		// Reset all drag state
		setIsDragging(false);
		setDragOffset(0);
		setStartX(0);
		setCurrentX(0);
	};

	// Prevent text selection during drag
	useEffect(() => {
		if (isDragging) {
			document.body.style.userSelect = "none";
		} else {
			document.body.style.userSelect = "";
		}
		return () => {
			document.body.style.userSelect = "";
		};
	}, [isDragging]);

	// Handle escape key to close modal and arrow keys for navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				prevSlide();
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				nextSlide();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, prevSlide, nextSlide]);

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

	// Add touch event listeners with passive: false to allow preventDefault
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;

		const handleTouchMove = (e) => {
			if (isDragging) {
				// Don't interfere with scrolling on commands grid
				if (e.target.closest(".commands-grid")) {
					return;
				}

				const currentY = e.touches[0].pageY;
				const x = e.touches[0].pageX;
				const diffX = Math.abs(x - startX);
				const diffY = Math.abs(currentY - startYRef.current);

				// Only prevent default and update carousel if horizontal movement is greater
				if (diffX > diffY && diffX > 10) {
					// Only prevent default if the event is cancelable
					if (e.cancelable) {
						e.preventDefault();
					}
					setCurrentX(x);
					const diff = x - startX;
					setDragOffset(diff);
				}
			}
		};

		const handleWheel = (e) => {
			// Allow wheel scrolling on commands grid
			const commandsGrid = e.target.closest(".commands-grid");
			if (commandsGrid) {
				// Let the browser handle scrolling within the commands grid
				e.stopPropagation();
				return;
			}
		};

		viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
		viewport.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			viewport.removeEventListener("touchmove", handleTouchMove);
			viewport.removeEventListener("wheel", handleWheel);
		};
	}, [isDragging, startX]);

	if (!isOpen) return null;

	return (
		<>
			<div className="carousel-overlay" onClick={onClose} />
			<div className="command-carousel-modal">
				<div className="carousel-container">
					{/* Terminal Header */}
					<div className="carousel-header">
						<div className="terminal-controls">
							<span className="terminal-prompt">&gt;</span>
							<span className="terminal-title">help --usage</span>
						</div>

						<div className="carousel-header-right">
							<div className="carousel-counter">
								<span className="current-slide">{currentSlide + 1}</span>
								<span className="slide-separator">/</span>
								<span className="total-slides">{totalSlides}</span>
							</div>
							<button
								className="carousel-close-btn"
								onClick={onClose}
								aria-label="Close">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
					</div>

					{/* Carousel Viewport */}
					<div
						ref={viewportRef}
						className="carousel-viewport"
						onMouseDown={handleDragStart}
						onMouseMove={handleDragMove}
						onMouseUp={handleDragEnd}
						onMouseLeave={handleDragEnd}
						onTouchStart={handleDragStart}
						onTouchEnd={handleDragEnd}>
						<div
							ref={trackRef}
							className={`carousel-track ${isDragging ? "dragging" : ""}`}
							style={{
								transform: `translateX(calc(-${currentSlide * 100
									}% + ${dragOffset}px))`,
								transition: isDragging
									? "none"
									: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
							}}>
							{commandSlides.map((slide, slideIndex) => (
								<div key={slideIndex} className="carousel-slide">
									{/* Slide Header */}
									<div className="slide-header">
										<span className="slide-icon">{slide.icon}</span>
										<h3 className="slide-category">{slide.category}</h3>
									</div>

									{/* Commands Grid */}
									<div className="commands-grid">
										{slide.commands.map((cmd, cmdIndex) => (
											<div
												key={cmdIndex}
												className="command-item"
												style={{
													animationDelay: `${cmdIndex * 0.1}s`,
												}}>
												<div className="command-line">
													<span className="cmd-prompt">$</span>
													<span className="cmd-name">{cmd.name}</span>
												</div>
												<div className="command-desc">
													<span className="desc-arrow">&gt;</span>
													<span className="desc-text">{cmd.desc}</span>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
						<button
							onClick={prevSlide}
							className="carousel-nav floating prev"
							aria-label="Previous slide">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>

						<button
							onClick={nextSlide}
							className="carousel-nav floating next"
							aria-label="Next slide">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</div>

					{/* Navigation Controls */}
					{/* <div className="carousel-controls">
						<button
							onClick={prevSlide}
							className="carousel-nav prev"
							aria-label="Previous slide">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3">
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>

						<div className="carousel-dots">
							{commandSlides.map((_, index) => (
								<button
									key={index}
									onClick={() => goToSlide(index)}
									className={`carousel-dot ${
										index === currentSlide ? "active" : ""
									}`}
									aria-label={`Go to slide ${index + 1}`}>
									<span className="dot-inner"></span>
								</button>
							))}
						</div>

						<button
							onClick={nextSlide}
							className="carousel-nav next"
							aria-label="Next slide">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</div> */}

					{/* Footer Hint */}
					<div className="carousel-footer">
						<span className="footer-text">
							Try these commands in the terminal below ↓
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default CommandCarousel;
