import type {AiRule} from '../types.js';

/**
 * Interface for components that can detect and return AI rules
 */
export type RuleDetector = {
	/**
	 * Get the detected AI rules from the implementation
	 * @returns List of detected AI rules
	 */
	getDetectedRules(): AiRule[];
};
