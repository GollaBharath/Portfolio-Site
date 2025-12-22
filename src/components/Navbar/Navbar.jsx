import { useState } from "react";
import "./Navbar.css";

function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	const navItems = ["Home", "About", "Projects", "Contact"];

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
						<li key={item} className="nav-item">
							<a
								href={`#${item.toLowerCase()}`}
								className="nav-link"
								onClick={() => setIsOpen(false)}>
								{item}
							</a>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}

export default Navbar;
