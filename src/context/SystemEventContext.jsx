import { createContext, useContext, useCallback, useRef, useMemo } from "react";

/**
 * SystemEventContext
 *
 * Lightweight event bus for system-level communication between components.
 * Used primarily for terminal commands to trigger background reactions.
 *
 * Design decisions:
 * - Uses a pub/sub pattern for loose coupling
 * - No global state mutations - just event dispatch
 * - Callbacks are stable across renders
 * - Memory-safe: subscribers are cleaned up on unmount
 */

const SystemEventContext = createContext(null);

// Supported system events that trigger background reactions
export const SYSTEM_EVENTS = {
	COMMAND_EXECUTED: "command:executed",
	SYSTEM_SCAN: "system:scan",
	SYSTEM_STATUS: "system:status",
	ABOUT_OPEN: "about:open",
};

// Commands that trigger visual reactions in the background
export const REACTIVE_COMMANDS = ["help", "about", "status", "scan", "whoami"];

export function SystemEventProvider({ children }) {
	// Use ref to store subscribers - avoids re-renders when adding/removing
	const subscribersRef = useRef(new Map());

	/**
	 * Subscribe to a system event
	 * @param {string} eventType - Event type from SYSTEM_EVENTS
	 * @param {function} callback - Handler function
	 * @returns {function} Unsubscribe function
	 */
	const subscribe = useCallback((eventType, callback) => {
		if (!subscribersRef.current.has(eventType)) {
			subscribersRef.current.set(eventType, new Set());
		}
		subscribersRef.current.get(eventType).add(callback);

		// Return cleanup function
		return () => {
			const subs = subscribersRef.current.get(eventType);
			if (subs) {
				subs.delete(callback);
				if (subs.size === 0) {
					subscribersRef.current.delete(eventType);
				}
			}
		};
	}, []);

	/**
	 * Emit a system event
	 * @param {string} eventType - Event type from SYSTEM_EVENTS
	 * @param {object} payload - Event data
	 */
	const emit = useCallback((eventType, payload = {}) => {
		const subs = subscribersRef.current.get(eventType);
		if (subs) {
			subs.forEach((callback) => {
				try {
					callback(payload);
				} catch (error) {
					console.error(
						`[SystemEvent] Error in subscriber for ${eventType}:`,
						error
					);
				}
			});
		}
	}, []);

	/**
	 * Convenience method: emit a command executed event
	 * Called by Terminal when a command is run
	 * @param {string} command - The command that was executed
	 */
	const emitCommand = useCallback(
		(command) => {
			const isReactive = REACTIVE_COMMANDS.includes(command.toLowerCase());
			emit(SYSTEM_EVENTS.COMMAND_EXECUTED, {
				command: command.toLowerCase(),
				isReactive,
				timestamp: Date.now(),
			});
		},
		[emit]
	);

	/**
	 * Convenience method: request to open the about panel
	 * Called when user interacts with the SystemCore image
	 */
	const openAboutPanel = useCallback(() => {
		emit(SYSTEM_EVENTS.ABOUT_OPEN, { timestamp: Date.now() });
	}, [emit]);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			subscribe,
			emit,
			emitCommand,
			openAboutPanel,
			EVENTS: SYSTEM_EVENTS,
		}),
		[subscribe, emit, emitCommand, openAboutPanel]
	);

	return (
		<SystemEventContext.Provider value={value}>
			{children}
		</SystemEventContext.Provider>
	);
}

/**
 * Hook to access system event context
 * @returns {object} System event context value
 */
export function useSystemEvents() {
	const context = useContext(SystemEventContext);
	if (!context) {
		throw new Error(
			"useSystemEvents must be used within a SystemEventProvider"
		);
	}
	return context;
}

export default SystemEventContext;
