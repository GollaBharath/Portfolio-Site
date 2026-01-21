import { useEffect } from "react";
import profileImage from "../../assets/Profile.jpg";
import "./ProfilePopup.css";

const focusAreas = [
	{
		title: "Full-Stack Development",
		sublabel: "Took on The Odin Project",
		description:
			"Web dev is one of the most basic skills everyone has. There is not much to it.",
	},
	{
		title: "Linux Expert",
		sublabel: "I use Debian btw",
		description:
			"I am constantly trying to improve my knowledge of Linux by operating, breaking, and fixing real systems.",
	},
	{
		title: "Automation & Tooling",
		sublabel: "I am too lazy to do things again.",
		description:
			"I take a task that takes 10 minutes and spend 10 hours trying to do it in 1 minute",
	},
	{
		title: "Open Source",
		sublabel: "Giving back to society",
		description:
			"I have a lot of open source projects that need contributors. Check out my github help out :)",
	},
];

const navHooks = [
	{
		label: "explore projects",
		detail: "My shipped builds and experiments.",
		targetId: "projects",
	},
	{
		label: "inspect activity",
		detail: "My work experience until today.",
		targetId: "experience",
	},
	{
		label: "links",
		detail: "Check out my socials.",
		targetId: "socials",
	},
	{
		label: "open CLI",
		detail: "Return to the terminal interface.",
		targetId: "terminal",
	},
];

function ProfilePopup({ isOpen, onClose }) {
	useEffect(() => {
		if (!isOpen) return undefined;

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const activateNav = (targetId) => {
		if (!targetId) return;

		const targetElement =
			document.querySelector(`[data-system-section="${targetId}"]`) ||
			document.getElementById(targetId);

		if (targetElement) {
			targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
		}

		window.dispatchEvent(
			new CustomEvent("system:navigate", { detail: { target: targetId } }),
		);

		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="profile-overlay" onClick={onClose}>
			<div
				className="profile-popup"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label="Identity handshake">
				<header className="profile-topbar">
					<div className="profile-topbar__status">
						<span className="status-led" aria-hidden="true" />
						<div className="status-text">
							<span className="status-label">ACCESS GRANTED</span>
							<div className="status-meta">
								<span className="status-meta__label">session</span>
								<span className="status-pill" aria-label="Session live">
									LIVE
								</span>
							</div>
						</div>
					</div>
					<button className="profile-close" type="button" onClick={onClose}>
						✕
					</button>
				</header>

				<div className="profile-body">
					<section className="identity-section" aria-label="Identity">
						<div className="avatar-stack" aria-hidden="true">
							<span className="avatar-ring" />
							<span className="avatar-halo" />
							<img
								src={profileImage}
								alt="Golla Bharath"
								className="profile-avatar"
							/>
						</div>
						<div className="identity-text">
							<h2 className="identity-name">Golla Bharath</h2>
							<p className="identity-alias">A.K.A: Dead Indian</p>
							<p className="identity-role">
								CSE Student · Dev-Ops · Full-Stack · Open Source
							</p>
						</div>
					</section>

					<section className="intent-section" aria-label="Intent">
						<p className="section-label">INTENT</p>
						<p className="intent-copy">
							I am a Linux developer obsessed with control, automation, and
							code.
						</p>
					</section>

					<section className="focus-section" aria-label="Focus areas">
						<p className="section-label">FOCUS AREAS</p>
						<div className="focus-grid">
							{focusAreas.map((area) => (
								<div key={area.title} className="focus-tile">
									<div className="tile-accent" aria-hidden="true" />
									<h3 className="focus-title">{area.title}</h3>
									<p className="focus-sublabel">{area.sublabel}</p>
									<p className="focus-description">{area.description}</p>
								</div>
							))}
						</div>
					</section>

					<section className="nav-section" aria-label="Navigation hooks">
						<p className="section-label">ACTION POINTS</p>
						<div className="nav-grid">
							{navHooks.map((hook) => (
								<button
									key={hook.label}
									type="button"
									className="nav-hook"
									onClick={() => activateNav(hook.targetId)}>
									<span className="nav-hook__prompt">{hook.label}</span>
									<span className="nav-hook__detail">{hook.detail}</span>
								</button>
							))}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default ProfilePopup;
