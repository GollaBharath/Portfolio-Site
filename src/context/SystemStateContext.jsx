import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

/**
 * SystemStateContext
 *
 * Single source of truth for the app's "OS"-like interaction state.
 *
 * Contract (per spec):
 * - Exactly one primary system state is active at a time
 * - Visuals derive from state (components subscribe to state)
 * - Transitions are intentional and traceable
 *
 * NOTE: Reduced motion is treated as a first-class state path.
 */

export const SYSTEM_STATES = {
	BOOTING: "BOOTING",
	IDLE: "IDLE",
	ACTIVE_COMMAND: "ACTIVE_COMMAND",
	MODAL_OPEN: "MODAL_OPEN",
	REDUCED_MOTION: "REDUCED_MOTION",
};

// Store intro and hint state in sessionStorage (per browser tab)
const INTRO_STORAGE_KEY = "intro_sequence_shown";
const TERMINAL_HINT_STORAGE_KEY = "terminal_hint_shown";

const getIntroAlreadyShown = () => {
	if (typeof window === "undefined") return false;
	try {
		return sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
};

const SystemStateContext = createContext(null);

const getPrefersReducedMotion = () => {
	if (typeof window === "undefined" || !window.matchMedia) return false;
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const getTerminalHintAlreadyShown = () => {
	if (typeof window === "undefined") return true;
	try {
		return sessionStorage.getItem(TERMINAL_HINT_STORAGE_KEY) === "true";
	} catch {
		return true;
	}
};

export function SystemStateProvider({ children }) {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
		getPrefersReducedMotion()
	);

	// Boot phase is intentionally NOT a primary state; it is internal detail of BOOTING.
	const [bootPhase, setBootPhase] = useState(() => {
		const introShown = getIntroAlreadyShown();
		return introShown ? "done" : "boot"; // boot -> splash -> done
	});

	const [systemState, setSystemState] = useState(() => {
		const reduced = getPrefersReducedMotion();
		const introShown = getIntroAlreadyShown();

		// If intro already shown this session, start at IDLE/REDUCED_MOTION
		if (introShown) {
			return reduced ? SYSTEM_STATES.REDUCED_MOTION : SYSTEM_STATES.IDLE;
		}

		// First-class UX path: no boot animations, but still controlled initialization.
		return reduced ? SYSTEM_STATES.REDUCED_MOTION : SYSTEM_STATES.BOOTING;
	});

	const [activeCommand, setActiveCommand] = useState(null);
	const activeCommandTimeoutRef = useRef(null);
	const prevNonCommandStateRef = useRef(SYSTEM_STATES.IDLE);
	const prevNonModalStateRef = useRef(SYSTEM_STATES.IDLE);

	const [reducedIntroDone, setReducedIntroDone] = useState(false);

	const [terminalHintShown, setTerminalHintShown] = useState(() =>
		getTerminalHintAlreadyShown()
	);

	const transitionTo = useCallback((nextState, meta = {}) => {
		setSystemState((prev) => {
			if (prev === nextState) return prev;
			// Keep a trace in dev without spamming production UX.
			if (import.meta?.env?.DEV) {
				// eslint-disable-next-line no-console
				console.debug("[SystemState]", prev, "→", nextState, meta);
			}
			return nextState;
		});
	}, []);

	const completeBootToSplash = useCallback(() => {
		setBootPhase("splash");
	}, []);

	const completeIntro = useCallback(() => {
		setBootPhase("done");
		setReducedIntroDone(true);

		// Mark intro as shown in session storage
		try {
			sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
		} catch {
			// Ignore storage errors
		}

		transitionTo(
			prefersReducedMotion ? SYSTEM_STATES.REDUCED_MOTION : SYSTEM_STATES.IDLE,
			{
				reason: "intro_complete",
			}
		);
	}, [prefersReducedMotion, transitionTo]);

	const runCommand = useCallback(
		(command, { isReactive = false, durationMs = 750 } = {}) => {
			if (!command) return;

			// In modal state, we do not visually compete; modal stays the primary state.
			// We still record the command for potential side-effects.
			setActiveCommand({
				command: String(command).toLowerCase(),
				isReactive: Boolean(isReactive),
				timestamp: Date.now(),
			});

			setSystemState((prev) => {
				if (prev === SYSTEM_STATES.MODAL_OPEN) return prev;
				prevNonCommandStateRef.current = prev;
				return SYSTEM_STATES.ACTIVE_COMMAND;
			});

			if (activeCommandTimeoutRef.current) {
				clearTimeout(activeCommandTimeoutRef.current);
			}

			activeCommandTimeoutRef.current = setTimeout(() => {
				setSystemState((prev) => {
					if (prev !== SYSTEM_STATES.ACTIVE_COMMAND) return prev;
					return prevNonCommandStateRef.current ?? SYSTEM_STATES.IDLE;
				});
			}, durationMs);
		},
		[]
	);

	const setModalOpenState = useCallback(
		(isOpen) => {
			if (isOpen) {
				setSystemState((prev) => {
					if (prev !== SYSTEM_STATES.MODAL_OPEN) {
						prevNonModalStateRef.current = prev;
					}
					return SYSTEM_STATES.MODAL_OPEN;
				});
				return;
			}
			// Only close if we're actually in MODAL_OPEN.
			// This prevents BOOTING from being accidentally overridden on initial mount.
			setSystemState((prev) => {
				if (prev !== SYSTEM_STATES.MODAL_OPEN) return prev;
				return (
					prevNonModalStateRef.current ??
					(prefersReducedMotion
						? SYSTEM_STATES.REDUCED_MOTION
						: SYSTEM_STATES.IDLE)
				);
			});
		},
		[prefersReducedMotion]
	);

	const markTerminalHintShown = useCallback(() => {
		try {
			sessionStorage.setItem(TERMINAL_HINT_STORAGE_KEY, "true");
		} catch {
			// ignore
		}
		setTerminalHintShown(true);
	}, []);

	// Keep prefers-reduced-motion in sync with OS changes.
	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => {
			const reduced = mql.matches;
			setPrefersReducedMotion(reduced);
			// Enter the reduced-motion state path if the user enables it.
			if (reduced) {
				transitionTo(SYSTEM_STATES.REDUCED_MOTION, {
					reason: "prefers_reduced_motion",
				});
			}
		};

		// Safari: addEventListener may not exist.
		if (mql.addEventListener) mql.addEventListener("change", onChange);
		else mql.addListener(onChange);

		return () => {
			if (mql.removeEventListener) mql.removeEventListener("change", onChange);
			else mql.removeListener(onChange);
		};
	}, [transitionTo]);

	useEffect(() => {
		return () => {
			if (activeCommandTimeoutRef.current) {
				clearTimeout(activeCommandTimeoutRef.current);
			}
		};
	}, []);

	const isBootBlocking =
		systemState === SYSTEM_STATES.BOOTING ||
		(systemState === SYSTEM_STATES.REDUCED_MOTION && !reducedIntroDone);

	const value = useMemo(
		() => ({
			systemState,
			bootPhase,
			prefersReducedMotion,
			activeCommand,
			isBootBlocking,
			terminalHintShown,

			transitionTo,
			completeBootToSplash,
			completeIntro,
			runCommand,
			setModalOpenState,
			setReducedIntroDone,
			markTerminalHintShown,
		}),
		[
			systemState,
			bootPhase,
			prefersReducedMotion,
			activeCommand,
			isBootBlocking,
			terminalHintShown,
			transitionTo,
			completeBootToSplash,
			completeIntro,
			runCommand,
			setModalOpenState,
			markTerminalHintShown,
		]
	);

	return (
		<SystemStateContext.Provider value={value}>
			{children}
		</SystemStateContext.Provider>
	);
}

export function useSystemState() {
	const ctx = useContext(SystemStateContext);
	if (!ctx) {
		throw new Error("useSystemState must be used within a SystemStateProvider");
	}
	return ctx;
}
