import { useEffect, useRef } from "react";
import "./ScrollPause.css";

function ScrollPause() {
	const pauseRef = useRef(null);
	const isLocked = useRef(false);
	const hasTriggered = useRef(false);
	const lastScrollY = useRef(0);

	useEffect(() => {
		const unlock = () => {
			if (!isLocked.current) return;

			isLocked.current = false;

			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.documentElement.style.overflow = "";
			document.body.style.overflow = "";

			window.scrollTo(0, lastScrollY.current);
		};

		const lock = () => {
			if (isLocked.current || hasTriggered.current) return;

			isLocked.current = true;
			hasTriggered.current = true;
			lastScrollY.current = window.scrollY;

			// Stop momentum scrolling
			document.documentElement.style.overflow = "hidden";
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.top = `-${lastScrollY.current}px`;
			document.body.style.width = "100%";
		};

		const handleScroll = () => {
			if (!pauseRef.current) return;

			const rect = pauseRef.current.getBoundingClientRect();
			const navbarHeight = 80; // Approximate navbar height, adjust if needed

			// Reset trigger when marker is far from top
			if (hasTriggered.current && !isLocked.current) {
				if (rect.top < navbarHeight - 100 || rect.top > navbarHeight + 100) {
					hasTriggered.current = false;
				}
			}

			// Don't lock if already locked or triggered
			if (isLocked.current || hasTriggered.current) return;

			// Trigger when marker reaches just below the navbar (top of screen)
			if (rect.top <= navbarHeight && rect.top >= navbarHeight - 50) {
				lock();
			}
		};

		const handleTouchStart = () => {
			if (isLocked.current) {
				unlock();
			}
		};

		const handleTouchMove = (e) => {
			if (isLocked.current) {
				if (e.cancelable) {
					e.preventDefault();
				}
				unlock();
			}
		};

		const handleWheel = (e) => {
			if (isLocked.current) {
				if (e.cancelable) {
					e.preventDefault();
				}
				unlock();
			}
		};

		const handleKeyDown = (e) => {
			if (
				isLocked.current &&
				(e.key === "ArrowDown" ||
					e.key === "ArrowUp" ||
					e.key === "PageDown" ||
					e.key === "PageUp" ||
					e.key === " ")
			) {
				e.preventDefault();
				unlock();
			}
		};

		// Scroll listener
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Touch listeners for mobile
		document.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		document.addEventListener("touchmove", handleTouchMove, { passive: false });

		// Mouse wheel for desktop
		window.addEventListener("wheel", handleWheel, { passive: false });

		// Keyboard
		window.addEventListener("keydown", handleKeyDown);

		// Initial check
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("wheel", handleWheel);
			window.removeEventListener("keydown", handleKeyDown);

			// Cleanup
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.documentElement.style.overflow = "";
			document.body.style.overflow = "";
		};
	}, []);

	return <div ref={pauseRef} className="scroll-pause-marker" />;
}

export default ScrollPause;
