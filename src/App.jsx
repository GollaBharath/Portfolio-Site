import { useState } from "react";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import LightPillar from "./components/LightPillar/LightPillar";
import Navbar from "./components/Navbar/Navbar";
import CommandCarousel from "./components/CommandCarousel/CommandCarousel";
import Experience from "./components/Experience/Experience";
import Home from "./components/Home/Home";
import CardModal from "./components/CardModal/CardModal";
import BootSequence from "./components/BootSequence/BootSequence";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import { ReactLenis } from "lenis/react";

const INTRO_STORAGE_KEY = "intro_sequence_shown";

function App() {
	const [modalOpen, setModalOpen] = useState(false);
	const [activeCard, setActiveCard] = useState(null);

	// Check if intro was already shown this session
	const introAlreadyShown =
		sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
	const [bootComplete, setBootComplete] = useState(introAlreadyShown);
	const [splashComplete, setSplashComplete] = useState(introAlreadyShown);

	// Handler for floating topic clicks - opens modal with card
	const handleTopicClick = (topicId) => {
		// Handle stats folder - show modal with card
		if (topicId === "stats") {
			// For now, keep the original behavior for stat cards
			// TODO: Update this when stats folder has its own popup
			return;
		}

		// Handle other folders
		switch (topicId) {
			case "socials":
			case "projects":
			case "help":
				// Future: Open folder-specific popups
				console.log(`Opening ${topicId} folder`);
				break;
			case "experience":
				// Scroll to experience section
				const experienceEl = document.getElementById("experience");
				if (experienceEl) {
					experienceEl.scrollIntoView({ behavior: "smooth", block: "center" });
				}
				break;
			default:
				break;
		}
	};

	const closeModal = () => {
		setModalOpen(false);
		setActiveCard(null);
	};

	// Mark intro as complete when splash finishes
	const handleSplashComplete = () => {
		sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
		setSplashComplete(true);
	};

	return (
		<ReactLenis root>
			{/* Boot sequence - runs once per session */}
			{!bootComplete && (
				<BootSequence onComplete={() => setBootComplete(true)} />
			)}

			{/* Splash screen - runs after boot sequence */}
			{bootComplete && !splashComplete && (
				<SplashScreen onComplete={handleSplashComplete} />
			)}

			<div className="app-container">
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: 0,
					}}>
					<LightPillar
						topColor="#970505"
						bottomColor="#FF5050"
						intensity={1.2}
						rotationSpeed={0.2}
						interactive={false}
						glowAmount={0.008}
						pillarWidth={4.0}
						pillarHeight={0.3}
						noiseIntensity={0.3}
						mixBlendMode="screen"
						pillarRotation={45}
					/>
				</div>
				<div className="app-content">
					<section id="home">
						<Home onTopicClick={handleTopicClick} />
					</section>

					<section id="experience">
						<Experience />
					</section>

					<section id="commands">
						<CommandCarousel />
					</section>

					<Terminal />
				</div>

				{/* Card Modal */}
				<CardModal
					isOpen={modalOpen}
					cardId={activeCard}
					onClose={closeModal}
				/>
			</div>
		</ReactLenis>
	);
}

export default App;
