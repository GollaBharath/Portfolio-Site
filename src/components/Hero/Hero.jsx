import "./Hero.css";
import profileImage from "../../assets/Profile.jpg";

function Hero() {
	return (
		<section className="hero">
			<div className="hero-content">
				<div className="profile-image">
					<img src={profileImage} alt="Profile" className="profile-img" />
				</div>
				<h1 className="hero-title">
					I'm <span className="name">Bharath</span>, a guy who loves his laptop
				</h1>
				<p className="hero-subtitle">
					Software Development Intern | Open Source Enthusiast | Community
					Manager
				</p>
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
		</section>
	);
}

export default Hero;
