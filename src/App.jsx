import { useEffect, useState } from "react";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import Home from "./components/Home/Home";
import CardModal from "./components/CardModal/CardModal";
import CommandCarousel from "./components/CommandCarousel/CommandCarousel";
import SocialsPopup from "./components/SocialsPopup/SocialsPopup";
import ProjectsModal from "./components/Projects/Projects";
import ExperiencePopup from "./components/ExperiencePopup/ExperiencePopup";
import ProfilePopup from "./components/ProfilePopup/ProfilePopup";
import StatsPopup from "./components/StatsPopup/StatsPopup";
import BootSequence from "./components/BootSequence/BootSequence";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import SystemBackground from "./components/SystemBackground/SystemBackground";
import SystemCore from "./components/SystemCore/SystemCore";
import ReducedMotionIntro from "./components/ReducedMotionIntro/ReducedMotionIntro";
import { SystemEventProvider } from "./context/SystemEventContext";
import {
	SystemStateProvider,
	SYSTEM_STATES,
	useSystemState,
} from "./context/SystemStateContext";
import { ReactLenis } from "lenis/react";

function AppShell() {
	const [modalOpen, setModalOpen] = useState(false);
	const [activeCard, setActiveCard] = useState(null);
	const [helpPopupTrigger, setHelpPopupTrigger] = useState(0);
	const [helpPopupOpen, setHelpPopupOpen] = useState(false);
	const [socialsPopupTrigger, setSocialsPopupTrigger] = useState(0);
	const [socialsPopupOpen, setSocialsPopupOpen] = useState(false);
	const [projectsPopupTrigger, setProjectsPopupTrigger] = useState(0);
	const [projectsPopupOpen, setProjectsPopupOpen] = useState(false);
	const [experiencePopupTrigger, setExperiencePopupTrigger] = useState(0);
	const [experiencePopupOpen, setExperiencePopupOpen] = useState(false);
	const [profilePopupTrigger, setProfilePopupTrigger] = useState(0);
	const [profilePopupOpen, setProfilePopupOpen] = useState(false);
	const [statsPopupTrigger, setStatsPopupTrigger] = useState(0);
	const [statsPopupOpen, setStatsPopupOpen] = useState(false);

	const {
		systemState,
		bootPhase,
		isBootBlocking,
		prefersReducedMotion,
		completeBootToSplash,
		completeIntro,
		setModalOpenState,
	} = useSystemState();

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

	useEffect(() => {
		setModalOpenState(modalOpen);
	}, [modalOpen, setModalOpenState]);

	// Handler for opening help popup
	const handleOpenHelp = () => {
		setHelpPopupTrigger((prev) => prev + 1);
	};

	// Handler for opening socials popup
	const handleOpenSocials = () => {
		setSocialsPopupTrigger((prev) => prev + 1);
	};

	// Handler for opening projects popup
	const handleOpenProjects = () => {
		setProjectsPopupTrigger((prev) => prev + 1);
	};

	// Handler for opening experience popup
	const handleOpenExperience = () => {
		setExperiencePopupTrigger((prev) => prev + 1);
	};

	// Handler for opening profile popup
	const handleOpenProfile = () => {
		setProfilePopupOpen(true);
	};

	// Handler for opening stats popup
	const handleOpenStats = () => {
		setStatsPopupTrigger((prev) => prev + 1);
	};

	// Handler for SystemCore click - scrolls to about section
	const handleAboutClick = () => {
		const aboutElement = document.getElementById("about");
		if (aboutElement) {
			aboutElement.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	return (
		<SystemEventProvider>
			<ReactLenis root>
				{/* Prevent any blank frame between intro stages */}
				{isBootBlocking && (
					<div className="intro-underlay" aria-hidden="true" />
				)}

				{/* BOOTING: only intro UI may be mounted/visible */}
				{systemState === SYSTEM_STATES.BOOTING && bootPhase === "boot" && (
					<BootSequence onComplete={completeBootToSplash} />
				)}
				{systemState === SYSTEM_STATES.BOOTING && bootPhase === "splash" && (
					<SplashScreen onComplete={completeIntro} />
				)}

				{/* REDUCED_MOTION: no boot animations, brief identity only */}
				{systemState === SYSTEM_STATES.REDUCED_MOTION && isBootBlocking && (
					<ReducedMotionIntro onComplete={completeIntro} />
				)}

				{/* Main system UI mounts only once the intro path has cleared. */}
				{!isBootBlocking && (
					<div
						className="app-container"
						data-system-state={systemState}
						data-reduced-motion={prefersReducedMotion ? "true" : "false"}>
						<SystemBackground />
						<SystemCore onProfileClick={handleOpenProfile} />
						<div className="app-content">
							<section id="home">
								<Home
									onTopicClick={handleTopicClick}
									helpPopupTrigger={helpPopupTrigger}
									helpPopupOpen={helpPopupOpen}
									onHelpPopupChange={setHelpPopupOpen}
									socialsPopupTrigger={socialsPopupTrigger}
									socialsPopupOpen={socialsPopupOpen}
									onSocialsPopupChange={setSocialsPopupOpen}
									projectsPopupTrigger={projectsPopupTrigger}
									projectsPopupOpen={projectsPopupOpen}
									onProjectsPopupChange={setProjectsPopupOpen}
									experiencePopupTrigger={experiencePopupTrigger}
									experiencePopupOpen={experiencePopupOpen}
									onExperiencePopupChange={setExperiencePopupOpen}
									statsPopupTrigger={statsPopupTrigger}
									statsPopupOpen={statsPopupOpen}
									onStatsPopupChange={setStatsPopupOpen}
								/>
							</section>
						</div>
						<Terminal
							onHelpClick={handleOpenHelp}
							onSocialsClick={handleOpenSocials}
							onProjectsClick={handleOpenProjects}
						/>
						<CardModal
							isOpen={modalOpen}
							cardId={activeCard}
							onClose={closeModal}
						/>
						<CommandCarousel
							isOpen={helpPopupOpen}
							onClose={() => setHelpPopupOpen(false)}
						/>
						<SocialsPopup
							isOpen={socialsPopupOpen}
							onClose={() => setSocialsPopupOpen(false)}
						/>
						<ExperiencePopup
							isOpen={experiencePopupOpen}
							onClose={() => setExperiencePopupOpen(false)}
						/>
						<ProfilePopup
							isOpen={profilePopupOpen}
							onClose={() => setProfilePopupOpen(false)}
						/>
						<StatsPopup
							isOpen={statsPopupOpen}
							onClose={() => setStatsPopupOpen(false)}
						/>
						<ProjectsModal
							isOpen={projectsPopupOpen}
							onClose={() => setProjectsPopupOpen(false)}
							items={[
								{
									image: "https://picsum.photos/900/900?grayscale&random=1",
									link: "https://github.com/GollaBharath/Portfolio-Site",
									title: "Portfolio Site",
									description:
										"My personal portfolio website built with React and WebGL",
								},
								{
									image: "https://picsum.photos/900/900?grayscale&random=2",
									link: "https://github.com/GollaBharath/terminal-cli",
									title: "Terminal CLI",
									description:
										"Command-line interface simulator with autocomplete",
								},
								{
									image: "https://picsum.photos/900/900?grayscale&random=3",
									link: "https://github.com/GollaBharath/webgl-projects",
									title: "WebGL Projects",
									description: "Interactive 3D graphics and animations",
								},
								{
									image: "https://picsum.photos/900/900?grayscale&random=4",
									link: "https://github.com/GollaBharath/mobile-apps",
									title: "Mobile Apps",
									description: "React Native applications for iOS and Android",
								},
								{
									image: "https://picsum.photos/900/900?grayscale&random=5",
									link: "https://github.com/GollaBharath/api-services",
									title: "API Services",
									description: "RESTful APIs and microservices architecture",
								},
							]}
							scale={1.5}
						/>
					</div>
				)}
			</ReactLenis>
		</SystemEventProvider>
	);
}

function App() {
	return (
		<SystemStateProvider>
			<AppShell />
		</SystemStateProvider>
	);
}

export default App;
