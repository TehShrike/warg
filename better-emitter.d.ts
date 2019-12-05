declare module 'better-emitter' {
	type Unsubscribe = () => void
	type Listener = (argument?: any, argument2?: any) => void

	export interface Emitter {
		on(eventString: string, listener: Listener): Unsubscribe,
		once(eventString: string, listener: Listener): Unsubscribe,
		emit(eventString: string, argument?: any, argument2?: any): void,
		removeAllListeners(): void,
	}

	function createEmitter<T>(anything?: T): T & Emitter

	export default createEmitter
}
