import { useState } from "react";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import LightPillar from "./components/LightPillar/LightPillar";
import Navbar from "./components/Navbar/Navbar";
import CommandCarousel from "./components/CommandCarousel/CommandCarousel";
import Experience from "./components/Experience/Experience";
import FloatingAboutSection from "./components/FloatingAboutSection/FloatingAboutSection";
import CardModal from "./components/CardModal/CardModal";
import { ReactLenis } from "lenis/react";

function App() {
	const [modalOpen, setModalOpen] = useState(false);
	const [activeCard, setActiveCard] = useState(null);

	// Handler for floating topic clicks - opens modal with card
	const handleTopicClick = (topicId) => {
		// Only show modal for stat cards
		if (["spotify", "discord", "github", "wakatime"].includes(topicId)) {
			setActiveCard(topicId);
			setModalOpen(true);
		} else {
			// For other topics, scroll to section
			let targetId;
			switch (topicId) {
				case "about":
					targetId = "experience";
					break;
				case "skills":
					targetId = "commands";
					break;
				default:
					targetId = "home";
			}
			const element = document.getElementById(targetId);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	const closeModal = () => {
		setModalOpen(false);
		setActiveCard(null);
	};

	return (
		<ReactLenis root>
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
					<Navbar />
					<section id="home">
						<FloatingAboutSection onTopicClick={handleTopicClick} />
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
