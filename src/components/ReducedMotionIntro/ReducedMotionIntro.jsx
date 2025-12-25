import { useEffect } from "react";
import "./ReducedMotionIntro.css";

/**
 * ReducedMotionIntro
 *
 * First-class reduced-motion boot path:
 * - No animations
 * - No layout shift
 * - Brief identity text, then clears
 */
export default function ReducedMotionIntro({ onComplete }) {
	useEffect(() => {
		const t = setTimeout(() => {
			onComplete?.();
		}, 650);
		return () => clearTimeout(t);
	}, [onComplete]);

	return (
		<div
			className="reduced-intro"
			role="dialog"
			aria-modal="true"
			aria-label="System initialization">
			<div className="reduced-intro__content">
				<div className="reduced-intro__title">bharath</div>
				<div className="reduced-intro__subtitle">system builder</div>
			</div>
		</div>
	);
}
