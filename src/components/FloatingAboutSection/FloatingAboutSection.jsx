import { useState, useRef } from "react";
import "./FloatingAboutSection.css";
import profileImage from "../../assets/Profile.jpg";

/**
 * FloatingAboutSection Component
 *
 * Draggable floating elements with smooth collision avoidance.
 */

function FloatingAboutSection({ onTopicClick }) {
	const [hoveredId, setHoveredId] = useState(null);
	const [draggedId, setDraggedId] = useState(null);
	const [positions, setPositions] = useState({});
	const dragStart = useRef({ x: 0, y: 0 });
	const dragInitialPos = useRef({ x: 0, y: 0 });
	const elementsRef = useRef({});
	const containerRef = useRef(null);

	// Define floating topics - customize these based on your content
	const topics = [
		{
			id: "profile",
			isProfile: true,
			label: "Profile",
			color: "#970505",
		},
		{
			id: "spotify",
			label: "What I'm Listening To",
			icon: "🎵",
			color: "#1DB954",
		},
		{
			id: "discord",
			label: "My Discord Status",
			icon: "💬",
			color: "#5865F2",
		},
		{
			id: "github",
			label: "GitHub Activity",
			icon: "⚡",
			color: "#970505",
		},
		{
			id: "wakatime",
			label: "Coding Stats",
			icon: "⏱️",
			color: "#FF5050",
		},
		{
			id: "about",
			label: "About Me",
			icon: "👨‍💻",
			color: "#970505",
		},
		{
			id: "skills",
			label: "Tech Stack",
			icon: "🛠️",
			color: "#FF5050",
		},
	];

	// Check if two rectangles overlap
	const rectsOverlap = (rect1, rect2, padding = 20) => {
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
		e.preventDefault();
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

			// Check for collisions and push other elements (only once per frame)
			topics.forEach((topic) => {
				if (topic.id === draggedId) return;

				const otherElement = elementsRef.current[topic.id];
				if (!otherElement) return;

				const otherRect = otherElement.getBoundingClientRect();
				const prevOtherPos = prev[topic.id] || { x: 0, y: 0 };

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
					const draggedCenterX = newDraggedRect.left + newDraggedRect.width / 2;
					const draggedCenterY = newDraggedRect.top + newDraggedRect.height / 2;
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

					newPositions[topic.id] = { x: newOtherX, y: newOtherY };
				}
			});

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

		if (onTopicClick) {
			onTopicClick(topicId);
		}
	};

	return (
		<div
			ref={containerRef}
			className="floating-about-container"
			onMouseMove={handleDragMove}
			onMouseUp={() => draggedId && handleDragEnd(draggedId)}
			onTouchMove={handleDragMove}
			onTouchEnd={() => draggedId && handleDragEnd(draggedId)}>
			<div className="floating-about-content">
				<div className="floating-elements-wrapper">
					{topics.map((topic, index) => {
						const pos = positions[topic.id] || { x: 0, y: 0 };
						const isDragging = draggedId === topic.id;

						// Render profile image differently
						if (topic.isProfile) {
							return (
								<div
									key={topic.id}
									ref={(el) => (elementsRef.current[topic.id] = el)}
									className={`floating-element profile-element ${
										isDragging ? "dragging" : ""
									}`}
									style={{
										animationDelay: `${index * 0.5}s`,
										animationDuration: `${8 + index}s`,
										"--accent-color": topic.color,
										"--drag-x": `${pos.x}px`,
										"--drag-y": `${pos.y}px`,
										cursor: isDragging ? "grabbing" : "grab",
									}}
									onMouseDown={(e) => handleDragStart(e, topic.id)}
									onTouchStart={(e) => handleDragStart(e, topic.id)}
									onMouseEnter={() => !isDragging && setHoveredId(topic.id)}
									onMouseLeave={() => setHoveredId(null)}>
									<img
										src={profileImage}
										alt="Profile"
										className="profile-img-floating"
									/>
								</div>
							);
						}

						return (
							<button
								key={topic.id}
								ref={(el) => (elementsRef.current[topic.id] = el)}
								className={`floating-element ${
									hoveredId === topic.id ? "hovered" : ""
								} ${isDragging ? "dragging" : ""}`}
								// Each element gets unique animation timing for organic movement
								style={{
									animationDelay: `${index * 0.5}s`,
									animationDuration: `${8 + index}s`,
									"--accent-color": topic.color,
									"--drag-x": `${pos.x}px`,
									"--drag-y": `${pos.y}px`,
									cursor: isDragging ? "grabbing" : "grab",
								}}
								onMouseDown={(e) => handleDragStart(e, topic.id)}
								onTouchStart={(e) => handleDragStart(e, topic.id)}
								onMouseEnter={() => !isDragging && setHoveredId(topic.id)}
								onMouseLeave={() => setHoveredId(null)}
								aria-label={`Open ${topic.label}`}>
								<span className="floating-element-icon">{topic.icon}</span>
								<span className="floating-element-label">{topic.label}</span>
							</button>
						);
					})}
				</div>

				{/* Scroll indicator */}
				<div className="scroll-indicator">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>
			</div>
		</div>
	);
}

export default FloatingAboutSection;
