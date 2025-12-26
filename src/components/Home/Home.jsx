import { useState, useRef, useEffect } from "react";
import "./Home.css";
import Folder from "../Folder/Folder";
import ProjectsModal from "../Projects/Projects";
import globeIcon from "../../assets/SVGs/globe-svgrepo-com.svg";
import projectIcon from "../../assets/SVGs/project-14px-fill-arrow-svgrepo-com.svg";
import chartIcon from "../../assets/SVGs/chart-line-svgrepo-com.svg";
import helpIcon from "../../assets/SVGs/help-circle-svgrepo-com.svg";
import timeSandIcon from "../../assets/SVGs/time-sand-svgrepo-com.svg";
import pinIcon from "../../assets/SVGs/pin-rounded-circle-620-svgrepo-com.svg";

/**
 * Home Component
 *
 * Draggable floating folder elements with smooth collision avoidance.
 */

function Home({
	onTopicClick,
	helpPopupTrigger,
	helpPopupOpen,
	onHelpPopupChange,
	socialsPopupTrigger,
	socialsPopupOpen,
	onSocialsPopupChange,
	projectsPopupTrigger,
	projectsPopupOpen,
	onProjectsPopupChange,
	experiencePopupTrigger,
	experiencePopupOpen,
	onExperiencePopupChange,
	statsPopupTrigger,
	statsPopupOpen,
	onStatsPopupChange,
}) {
	const [hoveredId, setHoveredId] = useState(null);
	const [draggedId, setDraggedId] = useState(null);
	const [positions, setPositions] = useState({});
	const [helpFolderOpen, setHelpFolderOpen] = useState(false);
	const [socialsFolderOpen, setSocialsFolderOpen] = useState(false);
	const [projectsFolderOpen, setProjectsFolderOpen] = useState(false);
	const [experienceFolderOpen, setExperienceFolderOpen] = useState(false);
	const [statsFolderOpen, setStatsFolderOpen] = useState(false);
	const isUpdatingFromParent = useRef(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const dragInitialPos = useRef({ x: 0, y: 0 });
	const elementsRef = useRef({});
	const containerRef = useRef(null);

	// Watch for help popup trigger from Terminal
	useEffect(() => {
		if (helpPopupTrigger > 0 && onHelpPopupChange) {
			isUpdatingFromParent.current = true;
			onHelpPopupChange(true);
			setHelpFolderOpen(true);
			isUpdatingFromParent.current = false;
		}
	}, [helpPopupTrigger, onHelpPopupChange]);

	// Watch for socials popup trigger from Terminal
	useEffect(() => {
		if (socialsPopupTrigger > 0 && onSocialsPopupChange) {
			isUpdatingFromParent.current = true;
			onSocialsPopupChange(true);
			setSocialsFolderOpen(true);
			isUpdatingFromParent.current = false;
		}
	}, [socialsPopupTrigger, onSocialsPopupChange]);

	// Watch for projects popup trigger from Terminal
	useEffect(() => {
		console.log("Projects popup trigger:", projectsPopupTrigger);
		if (projectsPopupTrigger > 0 && onProjectsPopupChange) {
			console.log("Opening projects popup");
			isUpdatingFromParent.current = true;
			onProjectsPopupChange(true);
			setProjectsFolderOpen(true);
			isUpdatingFromParent.current = false;
		}
	}, [projectsPopupTrigger, onProjectsPopupChange]);

	// Watch helpPopupOpen state and sync folder state
	useEffect(() => {
		if (helpPopupOpen !== undefined) {
			isUpdatingFromParent.current = true;
			if (!helpPopupOpen) {
				// Close folder immediately when popup closes
				setHelpFolderOpen(false);
				isUpdatingFromParent.current = false;
			} else {
				setHelpFolderOpen(true);
				isUpdatingFromParent.current = false;
			}
		}
	}, [helpPopupOpen]);

	// Watch socialsPopupOpen state and sync folder state
	useEffect(() => {
		if (socialsPopupOpen !== undefined) {
			isUpdatingFromParent.current = true;
			if (!socialsPopupOpen) {
				// Close folder immediately when popup closes
				setSocialsFolderOpen(false);
				isUpdatingFromParent.current = false;
			} else {
				setSocialsFolderOpen(true);
				isUpdatingFromParent.current = false;
			}
		}
	}, [socialsPopupOpen]);

	// Watch projectsPopupOpen state and sync folder state
	useEffect(() => {
		if (projectsPopupOpen !== undefined) {
			isUpdatingFromParent.current = true;
			if (!projectsPopupOpen) {
				// Close folder immediately when popup closes
				setProjectsFolderOpen(false);
				isUpdatingFromParent.current = false;
			} else {
				setProjectsFolderOpen(true);
				isUpdatingFromParent.current = false;
			}
		}
	}, [projectsPopupOpen]);

	// Watch for folder being manually closed and close popup too
	useEffect(() => {
		if (!helpFolderOpen && onHelpPopupChange && !isUpdatingFromParent.current) {
			onHelpPopupChange(false);
		}
	}, [helpFolderOpen, onHelpPopupChange]);

	// Watch for socials folder being manually closed and close popup too
	useEffect(() => {
		if (
			!socialsFolderOpen &&
			onSocialsPopupChange &&
			!isUpdatingFromParent.current
		) {
			onSocialsPopupChange(false);
		}
	}, [socialsFolderOpen, onSocialsPopupChange]);

	// Watch for projects folder being manually closed and close popup too
	useEffect(() => {
		if (
			!projectsFolderOpen &&
			onProjectsPopupChange &&
			!isUpdatingFromParent.current
		) {
			onProjectsPopupChange(false);
		}
	}, [projectsFolderOpen, onProjectsPopupChange]);

	// Watch for experience popup trigger from Terminal
	useEffect(() => {
		if (experiencePopupTrigger > 0 && onExperiencePopupChange) {
			isUpdatingFromParent.current = true;
			onExperiencePopupChange(true);
			setExperienceFolderOpen(true);
			isUpdatingFromParent.current = false;
		}
	}, [experiencePopupTrigger, onExperiencePopupChange]);

	// Watch experiencePopupOpen state and sync folder state
	useEffect(() => {
		if (experiencePopupOpen !== undefined) {
			isUpdatingFromParent.current = true;
			if (!experiencePopupOpen) {
				// Close folder immediately when popup closes
				setExperienceFolderOpen(false);
				isUpdatingFromParent.current = false;
			} else {
				setExperienceFolderOpen(true);
				isUpdatingFromParent.current = false;
			}
		}
	}, [experiencePopupOpen]);

	// Watch for experience folder being manually closed and close popup too
	useEffect(() => {
		if (
			!experienceFolderOpen &&
			onExperiencePopupChange &&
			!isUpdatingFromParent.current
		) {
			onExperiencePopupChange(false);
		}
	}, [experienceFolderOpen, onExperiencePopupChange]);

	// Watch for stats popup trigger from Terminal
	useEffect(() => {
		if (statsPopupTrigger > 0 && onStatsPopupChange) {
			isUpdatingFromParent.current = true;
			onStatsPopupChange(true);
			setStatsFolderOpen(true);
			isUpdatingFromParent.current = false;
		}
	}, [statsPopupTrigger, onStatsPopupChange]);

	// Watch statsPopupOpen state and sync folder state
	useEffect(() => {
		if (statsPopupOpen !== undefined) {
			isUpdatingFromParent.current = true;
			if (!statsPopupOpen) {
				// Close folder immediately when popup closes
				setStatsFolderOpen(false);
				isUpdatingFromParent.current = false;
			} else {
				setStatsFolderOpen(true);
				isUpdatingFromParent.current = false;
			}
		}
	}, [statsPopupOpen]);

	// Watch for stats folder being manually closed and close popup too
	useEffect(() => {
		if (
			!statsFolderOpen &&
			onStatsPopupChange &&
			!isUpdatingFromParent.current
		) {
			onStatsPopupChange(false);
		}
	}, [statsFolderOpen, onStatsPopupChange]);

	// Define floating folders - customize these based on your content
	// Note: Profile image is now handled by SystemCore component
	const folders = [
		{
			id: "help",
			label: "help --usage",
			logoSrc: helpIcon,
			color: "#991414",
			isOpen: helpFolderOpen,
			onOpenChange: setHelpFolderOpen,
			onPopup: () => {
				if (onHelpPopupChange) {
					onHelpPopupChange(true);
					setHelpFolderOpen(true);
				}
			},
		},
		{
			id: "projects",
			label: "projects --list",
			logoSrc: projectIcon,
			color: "#991414",
			isOpen: projectsFolderOpen,
			onOpenChange: setProjectsFolderOpen,
			onPopup: () => {
				if (onProjectsPopupChange) {
					onProjectsPopupChange(true);
					setProjectsFolderOpen(true);
				}
			},
		},
		{
			id: "stats",
			label: "stats --summary",
			logoSrc: chartIcon,
			color: "#991414",
			isOpen: statsFolderOpen,
			onOpenChange: setStatsFolderOpen,
			onPopup: () => {
				if (onStatsPopupChange) {
					onStatsPopupChange(true);
					setStatsFolderOpen(true);
				}
			},
		},
		{
			id: "experience",
			label: "experience --log",
			logoSrc: timeSandIcon,
			color: "#991414",
			isOpen: experienceFolderOpen,
			onOpenChange: setExperienceFolderOpen,
			onPopup: () => {
				if (onExperiencePopupChange) {
					onExperiencePopupChange(true);
					setExperienceFolderOpen(true);
				}
			},
		},
		{
			id: "socials",
			label: "connect",
			logoSrc: globeIcon,
			color: "#991414",
			isOpen: socialsFolderOpen,
			onOpenChange: setSocialsFolderOpen,
			onPopup: () => {
				if (onSocialsPopupChange) {
					onSocialsPopupChange(true);
					setSocialsFolderOpen(true);
				}
			},
		},
	];

	// Check if two rectangles overlap
	const rectsOverlap = (rect1, rect2, padding = 35) => {
		return (
			rect1.left - padding < rect2.right + padding &&
			rect1.right + padding > rect2.left - padding &&
			rect1.top - padding < rect2.bottom + padding &&
			rect1.bottom + padding > rect2.top - padding
		);
	};

	// Clamp position to container bounds
	const clampToContainer = (rect, containerRect) => {
		const offset = { x: 0, y: 0 };

		if (rect.left < containerRect.left) {
			offset.x = containerRect.left - rect.left;
		} else if (rect.right > containerRect.right) {
			offset.x = containerRect.right - rect.right;
		}

		if (rect.top < containerRect.top) {
			offset.y = containerRect.top - rect.top;
		} else if (rect.bottom > containerRect.bottom) {
			offset.y = containerRect.bottom - rect.bottom;
		}

		return offset;
	};

	const handleDragStart = (e, topicId) => {
		// Only preventDefault on mouse events - touch events are passive by default
		if (e.type === "mousedown") {
			e.preventDefault();
		}
		setDraggedId(topicId);

		const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
		const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

		dragStart.current = { x: clientX, y: clientY };
		dragInitialPos.current = positions[topicId] || { x: 0, y: 0 };
	};

	const handleDragMove = (e) => {
		if (!draggedId) return;

		const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
		const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

		const deltaX = clientX - dragStart.current.x;
		const deltaY = clientY - dragStart.current.y;

		const container = containerRef.current;
		const draggedElement = elementsRef.current[draggedId];

		if (!container || !draggedElement) return;

		const containerRect = container.getBoundingClientRect();

		setPositions((prev) => {
			const newPositions = { ...prev };

			// Calculate new position for dragged element
			let newX = dragInitialPos.current.x + deltaX;
			let newY = dragInitialPos.current.y + deltaY;

			// Get the rect of the dragged element at its current position
			const draggedRect = draggedElement.getBoundingClientRect();

			// Calculate what the new rect would be after applying delta
			const newDraggedRect = {
				left: draggedRect.left + (newX - (prev[draggedId]?.x || 0)),
				right: draggedRect.right + (newX - (prev[draggedId]?.x || 0)),
				top: draggedRect.top + (newY - (prev[draggedId]?.y || 0)),
				bottom: draggedRect.bottom + (newY - (prev[draggedId]?.y || 0)),
				width: draggedRect.width,
				height: draggedRect.height,
			};

			// Clamp dragged element to container
			const clampOffset = clampToContainer(newDraggedRect, containerRect);
			newX += clampOffset.x;
			newY += clampOffset.y;

			newPositions[draggedId] = { x: newX, y: newY };

			// Update the rect after clamping
			newDraggedRect.left += clampOffset.x;
			newDraggedRect.right += clampOffset.x;
			newDraggedRect.top += clampOffset.y;
			newDraggedRect.bottom += clampOffset.y;

			// Check for collisions and push other elements (desktop only)
			// Skip collision detection on mobile for better UX
			const isMobile = window.innerWidth <= 768;
			if (!isMobile) {
				folders.forEach((folder) => {
					if (folder.id === draggedId) return;

					const otherElement = elementsRef.current[folder.id];
					if (!otherElement) return;

					const otherRect = otherElement.getBoundingClientRect();
					const prevOtherPos = prev[folder.id] || { x: 0, y: 0 };

					// Use previous frame's position for collision detection to avoid accumulation
					const otherAdjustedRect = {
						left: otherRect.left,
						right: otherRect.right,
						top: otherRect.top,
						bottom: otherRect.bottom,
						width: otherRect.width,
						height: otherRect.height,
					};

					// Check if dragged element overlaps with this element
					if (rectsOverlap(newDraggedRect, otherAdjustedRect)) {
						// Calculate push direction (away from dragged element center)
						const draggedCenterX =
							newDraggedRect.left + newDraggedRect.width / 2;
						const draggedCenterY =
							newDraggedRect.top + newDraggedRect.height / 2;
						const otherCenterX =
							otherAdjustedRect.left + otherAdjustedRect.width / 2;
						const otherCenterY =
							otherAdjustedRect.top + otherAdjustedRect.height / 2;

						const dx = otherCenterX - draggedCenterX;
						const dy = otherCenterY - draggedCenterY;
						const distance = Math.sqrt(dx * dx + dy * dy) || 1;

						// Push the other element away with a smaller force
						const pushDistance = 15;
						const pushX = (dx / distance) * pushDistance;
						const pushY = (dy / distance) * pushDistance;

						let newOtherX = prevOtherPos.x + pushX;
						let newOtherY = prevOtherPos.y + pushY;

						// Calculate what the new rect would be
						const newOtherRect = {
							left: otherRect.left + pushX,
							right: otherRect.right + pushX,
							top: otherRect.top + pushY,
							bottom: otherRect.bottom + pushY,
						};

						// Always clamp to container to prevent going off-screen
						const otherClampOffset = clampToContainer(
							newOtherRect,
							containerRect
						);

						newOtherX += otherClampOffset.x;
						newOtherY += otherClampOffset.y;

						newPositions[folder.id] = { x: newOtherX, y: newOtherY };
					}
				});
			} // Close the desktop-only collision detection

			return newPositions;
		});
	};

	const handleDragEnd = (topicId) => {
		if (!draggedId) return;

		// Check if it was a click (small movement) vs drag
		const currentPos = positions[draggedId] || { x: 0, y: 0 };
		const dragDistance = Math.sqrt(
			Math.pow(currentPos.x - dragInitialPos.current.x, 2) +
			Math.pow(currentPos.y - dragInitialPos.current.y, 2)
		);

		if (dragDistance < 5) {
			// It was a click
			handleTopicClick(topicId);
		}

		setDraggedId(null);
	};

	const handleTopicClick = (topicId) => {
		if (topicId === "profile") return;

		// Future: Handle popup opening here if onPopup is defined
		const folder = folders.find((f) => f.id === topicId);
		if (folder?.onPopup) {
			folder.onPopup();
			return;
		}

		if (onTopicClick) {
			onTopicClick(topicId);
		}
	};

	return (
		<div className="home-container">
			<div
				ref={containerRef}
				className="drag-region"
				onMouseMove={handleDragMove}
				onMouseUp={() => draggedId && handleDragEnd(draggedId)}
				onTouchMove={handleDragMove}
				onTouchEnd={() => draggedId && handleDragEnd(draggedId)}>
				<div className="floating-elements-wrapper">
					{folders.map((folder, index) => {
						const pos = positions[folder.id] || { x: 0, y: 0 };
						const isDragging = draggedId === folder.id;

						// Render folder components
						return (
							<div
								key={folder.id}
								ref={(el) => (elementsRef.current[folder.id] = el)}
								className={`floating-element folder-element ${hoveredId === folder.id ? "hovered" : ""
									} ${isDragging ? "dragging" : ""}`}
								style={{
									animationDelay: `${index * 0.5}s`,
									animationDuration: `${8 + index}s`,
									"--accent-color": folder.color,
									"--drag-x": `${pos.x}px`,
									"--drag-y": `${pos.y}px`,
									cursor: isDragging ? "grabbing" : "grab",
								}}
								onMouseDown={(e) => handleDragStart(e, folder.id)}
								onTouchStart={(e) => handleDragStart(e, folder.id)}
								onMouseEnter={() => !isDragging && setHoveredId(folder.id)}
								onMouseLeave={() => setHoveredId(null)}>
								<div className="floating-element-inner">
									<Folder
										label={folder.label}
										logoSrc={folder.logoSrc}
										color={folder.color}
										isOpen={folder.isOpen}
										onOpenChange={folder.onOpenChange}
										onClick={() => handleTopicClick(folder.id)}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default Home;
