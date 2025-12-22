import { useEffect, useRef, useState } from "react";
import "./Experience.css";

function Experience() {
	const [visibleItems, setVisibleItems] = useState(new Set());
	const [itemProgress, setItemProgress] = useState({});
	const [lineHeight, setLineHeight] = useState(0);
	const timelineRef = useRef(null);
	const itemRefs = useRef([]);
	// Placeholder experience data - replace with your actual experience
	const experiences = [
		{
			title: "Software Development Intern",
			company: "Cyber Security based Startup",
			location: "Hyderabad, India",
			date: "Sep 2025 - Present",
			description: [
				"Set up and maintained a secure, reliable Ubuntu server to host the platform.",
				"Set up a local Gitea and implemented CI/CD pipelines to auto-deploy code.",
				"Co-designed a lightweight container orchestration system for cybersecurity labs.",
			],
			logo: "/src/assets/luh-new.jpg", // Add your logo here
			icon: "💼",
		},
		{
			title: "Project Admin",
			company: "OSCI",
			location: "Remote",
			date: "July 2025 - Sep 2025",
			description: [
				"Maintained a open source project Gamify, which had nearly 30 contributors.",
				"Gamify is a platform to help communities engage and interact via gamification.",
				"Collaborated with many contributors and reviewed PRs and finished the event as a successful Project Admin.",
			],
			logo: "/src/assets/osci.jpg", // Add your logo here
			icon: "🚀",
		},
	];

	useEffect(() => {
		const handleScroll = () => {
			if (!itemRefs.current.length) return;

			const newVisibleItems = new Set();
			const newItemProgress = {};
			let maxProgress = 0;

			itemRefs.current.forEach((item, index) => {
				if (!item) return;

				const rect = item.getBoundingClientRect();
				const windowHeight = window.innerHeight;
				const triggerPoint = windowHeight * 0.7;

				// Calculate progress (0 to 1) based on scroll position
				const itemCenter = rect.top + rect.height / 2;
				const progress = Math.max(
					0,
					Math.min(1, (windowHeight - itemCenter) / (windowHeight * 0.5))
				);

				newItemProgress[index] = progress;

				// Item is in view and should be visible
				if (rect.top < triggerPoint && rect.bottom > 0) {
					newVisibleItems.add(index);
				}
				// Item is above viewport
				else if (rect.bottom < 0) {
					newVisibleItems.add(index);
					newItemProgress[index] = 1;
				}

				// Track the furthest visible item for line height
				if (newVisibleItems.has(index)) {
					const iconCenter = item.querySelector(".timeline-icon");
					if (iconCenter) {
						const iconRect = iconCenter.getBoundingClientRect();
						const timelineTop =
							timelineRef.current?.getBoundingClientRect().top || 0;
						const relativePosition =
							iconRect.top - timelineTop + iconRect.height / 2;
						maxProgress = Math.max(maxProgress, relativePosition);
					}
				}
			});

			setVisibleItems(newVisibleItems);
			setItemProgress(newItemProgress);
			setLineHeight(maxProgress);
		};

		// Initial check
		handleScroll();

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, []);

	return (
		<section className="experience-section" id="experience">
			<div className="experience-container">
				<div className="experience-header">
					<h2 className="experience-title">
						<span className="title-prompt">&gt;</span> Work Experience
					</h2>
					<p className="experience-subtitle">
						My professional journey and career milestones
					</p>
				</div>

				<div className="timeline" ref={timelineRef}>
					<div
						className="timeline-line"
						style={{ height: `${lineHeight}px` }}></div>
					{experiences.map((exp, index) => {
						const isLeft = index % 2 === 0;
						const progress = itemProgress[index] || 0;
						return (
							<div
								key={index}
								ref={(el) => (itemRefs.current[index] = el)}
								data-progress={progress}
								className={`timeline-item ${isLeft ? "left" : "right"} ${
									visibleItems.has(index) ? "visible" : "hidden"
								}`}
								style={{
									"--progress": progress,
								}}>
								<div className="timeline-content">
									<div className="timeline-card">
										<h3 className="timeline-title">{exp.title}</h3>
										<h4 className="timeline-company">
											{exp.company} • {exp.location}
										</h4>
										<ul className="timeline-description">
											{exp.description.map((item, i) => (
												<li key={i}>{item}</li>
											))}
										</ul>
									</div>
								</div>
								<div className="timeline-icon">
									<img
										src={exp.logo}
										alt={`${exp.company} logo`}
										className="timeline-logo"
									/>
								</div>
								<div className="timeline-date">{exp.date}</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

export default Experience;
