import { useEffect, useState } from "react";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import Home from "./components/Home/Home";
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

// projects
import GamifyImg from "../src/assets/projects/Gamify.png";
import ADBImg from "../src/assets/projects/ADB.png";
import TTTImg from "../src/assets/projects/TicTacToe.png";
import CalcImg from "../src/assets/projects/Calc.png";

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
						{/* <CardModal
							isOpen={modalOpen}
							cardId={activeCard}
							onClose={closeModal}
						/> */}
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
									image: ADBImg,
									links: {
										github:
											"https://github.com/harshendram/Advanced-Discord-Bot",
										live: "https://harshendram.github.io/Advanced-Discord-Bot/",
									},

									title: "FOSS Discord Bot",
									subtitle: "Open Source Project | Top Contributor",
									meta: {
										problem:
											"All the available discord bots were private and pay to use for large servers.",
										solution:
											"A open source bot which can be hosted with a few clicks and has all the features of paid bots.",
										stack: ["Nodejs", "Mongodb", "DiscordJS"],
										outcome: "Open Source Alternative for Paid Features.",
									},
								},
								{
									image: CalcImg,
									links: {
										github: "https://github.com/GollaBharath/Calculator-Odin-",
										live: "https://gollabharath.me/Calculator-Odin-/",
									},

									title: "Calculator",
									subtitle: 'Part of "The Odin Project".',
									meta: {
										problem:
											"The Odin Project had this challenge of making a Calculator from scratch.",
										solution: "I built a Calculator.",
										stack: ["HTML", "CSS", "JavaScript"],
										outcome:
											"I was able to build a Calculator without using any AI.",
									},
								},
								{
									image: GamifyImg,
									links: {
										github: "https://github.com/GollaBharath/Gamify",
										live: "https://github.com/GollaBharath/Gamify",
									},

									title: "Gamify",
									subtitle: "Open Source Project | Maintainer.",
									meta: {
										problem:
											"Communities often lose engagement after a few days. People get bored and move on to other things.",
										solution:
											"A platform where organizers can host events, give fun tasks, maintain a digital economy of points, and keep the community engaged for a long time.",
										stack: ["DiscordJS", "MERN Stack"],
										outcome:
											"We are still building the platform - it is not public yet.",
									},
								},

								{
									image: TTTImg,
									links: {
										github: "https://github.com/GollaBharath/Tic-Tac-Toe",
										live: "https://gollabharath.me/Tic-Tac-Toe/",
									},

									title: "TicTacToe",
									subtitle: 'Part of "The Odin Project".',
									meta: {
										problem:
											"The Odin Project had this challenge of making a tic tac toe game from scratch.",
										solution: "I built a Tic Tac Toe game.",
										stack: ["HTML", "CSS", "JavaScript"],
										outcome:
											"I was able to build a Tic Tac Toe game without using any AI.",
									},
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
