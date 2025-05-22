/**
 * Example file for XO with config in package.json
 * Note: Uses tabs and no semicolons as per config
 */

/**
 * A simple calculator class
 */
export class Calculator {
	/**
	 * Add two numbers
	 * @param a - First number
	 * @param b - Second number
	 * @returns The sum
	 */
	add(a: number, b: number): number {
		return a + b
	}

	/**
	 * Subtract two numbers
	 * @param a - First number
	 * @param b - Second number
	 * @returns The difference
	 */
	subtract(a: number, b: number): number {
		return a - b
	}

	/**
	 * Multiply two numbers
	 * @param a - First number
	 * @param b - Second number
	 * @returns The product
	 */
	multiply(a: number, b: number): number {
		return a * b
	}

	/**
	 * Divide two numbers
	 * @param a - Dividend
	 * @param b - Divisor
	 * @returns The quotient
	 */
	divide(a: number, b: number): number {
		if (b === 0) {
			throw new Error("Division by zero")
		}
		return a / b
	}
}
