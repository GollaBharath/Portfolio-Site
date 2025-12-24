import { useState, useRef } from "react";
import "./Folder.css";

const darkenColor = (hex, percent) => {
	let color = hex.startsWith("#") ? hex.slice(1) : hex;
	if (color.length === 3) {
		color = color
			.split("")
			.map((c) => c + c)
			.join("");
	}
	const num = parseInt(color, 16);
	let r = (num >> 16) & 0xff;
	let g = (num >> 8) & 0xff;
	let b = num & 0xff;
	r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
	g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
	b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
	return (
		"#" +
		((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
	);
};

const DRAG_THRESHOLD = 5; // pixels of movement before considered a drag

const Folder = ({
	color = "#8B0000",
	size = 1.5,
	label,
	logoSrc,
	onClick,
	className = "",
}) => {
	const maxItems = 3;
	const papers = Array(maxItems).fill(null);

	const [open, setOpen] = useState(false);
	const [paperOffsets, setPaperOffsets] = useState(
		Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
	);

	// Drag detection refs
	const mouseDownPos = useRef(null);
	const isDragging = useRef(false);

	const folderBackColor = darkenColor(color, 0.15);

	const handleMouseDown = (e) => {
		mouseDownPos.current = { x: e.clientX, y: e.clientY };
		isDragging.current = false;
	};

	const handleMouseMove = (e) => {
		if (mouseDownPos.current && !isDragging.current) {
			const dx = e.clientX - mouseDownPos.current.x;
			const dy = e.clientY - mouseDownPos.current.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance > DRAG_THRESHOLD) {
				isDragging.current = true;
			}
		}
	};

	const handleMouseUp = (e) => {
		mouseDownPos.current = null;
	};

	const handleClick = (e) => {
		e.stopPropagation();

		// Only toggle open state if it wasn't a drag
		if (isDragging.current) {
			isDragging.current = false;
			return;
		}

		setOpen((prev) => !prev);
		if (open) {
			setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
		}
		if (onClick) onClick();
	};

	const handlePaperMouseMove = (e, index) => {
		if (!open) return;
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const offsetX = (e.clientX - centerX) * 0.15;
		const offsetY = (e.clientY - centerY) * 0.15;
		setPaperOffsets((prev) => {
			const newOffsets = [...prev];
			newOffsets[index] = { x: offsetX, y: offsetY };
			return newOffsets;
		});
	};

	const handlePaperMouseLeave = (e, index) => {
		setPaperOffsets((prev) => {
			const newOffsets = [...prev];
			newOffsets[index] = { x: 0, y: 0 };
			return newOffsets;
		});
	};

	const folderStyle = {
		"--folder-color": color,
		"--folder-back-color": folderBackColor,
	};

	const folderClassName = `folder ${open ? "open" : ""}`.trim();
	const scaleStyle = { transform: `scale(${size})` };

	return (
		<div style={scaleStyle} className={`folder-wrapper ${className}`}>
			<div
				className={folderClassName}
				style={folderStyle}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onClick={handleClick}>
				<div className="folder__back">
					{papers.map((item, i) => (
						<div
							key={i}
							className={`paper paper-${i + 1}`}
							onMouseMove={(e) => handlePaperMouseMove(e, i)}
							onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
							style={{
								transform: open
									? `translate(calc(-50% + ${
											paperOffsets[i]?.x || 0
									  }px), calc(10% + ${paperOffsets[i]?.y || 0}px))`
									: undefined,
							}}
						/>
					))}
					<div className="folder__front">
						{logoSrc && (
							<img src={logoSrc} alt={label} className="folder-icon" />
						)}
					</div>
					<div className="folder__front right"></div>
				</div>
			</div>
			{label && <div className="folder-label">{label}</div>}
		</div>
	);
};

export default Folder;
