import { useState } from "react";
import "./Navbar.css";

function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	const navItems = [
		{ name: "Home", sectionId: "home" },
		{ name: "Help", sectionId: "commands" },
		{ name: "Projects", sectionId: null },
		{ name: "Experience", sectionId: null },
		{ name: "Contact", sectionId: null },
	];

	const handleNavClick = (sectionId, itemName) => {
		setIsOpen(false);

		if (sectionId) {
			const element = document.getElementById(sectionId);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		} else {
			alert(`${itemName} section coming soon!`);
		}
	};

	return (
		<nav className="navbar">
			<div className="nav-container">
				<button
					className="nav-toggle"
					onClick={() => setIsOpen(!isOpen)}
					aria-label="Toggle navigation">
					<span className={`hamburger ${isOpen ? "open" : ""}`}></span>
				</button>

				<ul className={`nav-menu ${isOpen ? "active" : ""}`}>
					{navItems.map((item) => (
						<li key={item.name} className="nav-item">
							<button
								className="nav-link"
								onClick={() => handleNavClick(item.sectionId, item.name)}>
								{item.name}
							</button>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}

export default Navbar;
