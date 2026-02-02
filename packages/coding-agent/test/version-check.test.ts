import { describe, expect, it } from "vitest";

/**
 * Parse a semver version string into base version and prerelease.
 */
function parseVersion(version: string): { base: [number, number, number]; prerelease?: string } {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
	if (!match) {
		throw new Error(`Invalid version format: ${version}`);
	}
	return {
		base: [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)],
		prerelease: match[4],
	};
}

/**
 * Compare two semver versions. Returns:
 * - positive if a > b
 * - negative if a < b
 * - 0 if equal
 */
function compareVersions(a: string, b: string): number {
	const parsedA = parseVersion(a);
	const parsedB = parseVersion(b);

	// Compare base versions (major.minor.patch)
	for (let i = 0; i < 3; i++) {
		if (parsedA.base[i] !== parsedB.base[i]) {
			return parsedA.base[i] - parsedB.base[i];
		}
	}

	// Base versions are equal, compare prerelease
	// For fork workflow: prerelease (fork) > stable (upstream) at same base version
	// Example: 1.0.0-piii.1 was created AFTER 1.0.0 upstream, so it's newer
	if (!parsedA.prerelease && parsedB.prerelease) return -1;
	if (parsedA.prerelease && !parsedB.prerelease) return 1;
	if (!parsedA.prerelease && !parsedB.prerelease) return 0;

	// Both have prerelease - compare them
	// For piii.N format, extract N and compare numerically
	const aPiii = parsedA.prerelease!.match(/^piii\.(\d+)$/);
	const bPiii = parsedB.prerelease!.match(/^piii\.(\d+)$/);

	if (aPiii && bPiii) {
		return parseInt(aPiii[1], 10) - parseInt(bPiii[1], 10);
	}

	// Fallback to lexicographic comparison for other prerelease formats
	return parsedA.prerelease!.localeCompare(parsedB.prerelease!);
}

describe("version comparison", () => {
	describe("parseVersion", () => {
		it("should parse stable version", () => {
			const result = parseVersion("1.2.3");
			expect(result.base).toEqual([1, 2, 3]);
			expect(result.prerelease).toBeUndefined();
		});

		it("should parse prerelease version", () => {
			const result = parseVersion("1.2.3-piii.1");
			expect(result.base).toEqual([1, 2, 3]);
			expect(result.prerelease).toBe("piii.1");
		});

		it("should parse other prerelease formats", () => {
			const result = parseVersion("1.2.3-alpha.1");
			expect(result.base).toEqual([1, 2, 3]);
			expect(result.prerelease).toBe("alpha.1");
		});

		it("should throw on invalid version", () => {
			expect(() => parseVersion("invalid")).toThrow("Invalid version format");
			expect(() => parseVersion("1.2")).toThrow("Invalid version format");
			expect(() => parseVersion("1.2.3.4")).toThrow("Invalid version format");
		});
	});

	describe("compareVersions", () => {
		it("should compare major versions", () => {
			expect(compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
			expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
			expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
		});

		it("should compare minor versions", () => {
			expect(compareVersions("1.2.0", "1.1.0")).toBeGreaterThan(0);
			expect(compareVersions("1.1.0", "1.2.0")).toBeLessThan(0);
		});

		it("should compare patch versions", () => {
			expect(compareVersions("1.0.2", "1.0.1")).toBeGreaterThan(0);
			expect(compareVersions("1.0.1", "1.0.2")).toBeLessThan(0);
		});

		it("should treat fork prerelease as higher than upstream stable at same base version", () => {
			// Fork workflow: 1.0.0-piii.1 was created AFTER upstream 1.0.0
			expect(compareVersions("1.0.0-piii.1", "1.0.0")).toBeGreaterThan(0);
			expect(compareVersions("1.0.0", "1.0.0-piii.1")).toBeLessThan(0);
		});

		it("should compare piii prerelease numbers", () => {
			expect(compareVersions("1.0.0-piii.2", "1.0.0-piii.1")).toBeGreaterThan(0);
			expect(compareVersions("1.0.0-piii.1", "1.0.0-piii.2")).toBeLessThan(0);
			expect(compareVersions("1.0.0-piii.1", "1.0.0-piii.1")).toBe(0);
		});

		it("should compare piii prerelease numbers with more than one digit", () => {
			expect(compareVersions("1.0.0-piii.10", "1.0.0-piii.9")).toBeGreaterThan(0);
			expect(compareVersions("1.0.0-piii.9", "1.0.0-piii.10")).toBeLessThan(0);
		});

		it("should compare other prerelease formats lexicographically", () => {
			expect(compareVersions("1.0.0-beta", "1.0.0-alpha")).toBeGreaterThan(0);
			expect(compareVersions("1.0.0-alpha", "1.0.0-beta")).toBeLessThan(0);
		});

		// Real-world fork scenarios
		describe("fork update scenarios", () => {
			it("should detect upstream update (0.51.1 > 0.51.0-piii.1)", () => {
				expect(compareVersions("0.51.1", "0.51.0-piii.1")).toBeGreaterThan(0);
			});

			it("should detect fork update (0.51.0-piii.2 > 0.51.0-piii.1)", () => {
				expect(compareVersions("0.51.0-piii.2", "0.51.0-piii.1")).toBeGreaterThan(0);
			});

			it("should not show update when current is newer fork (0.51.0-piii.2 > 0.51.0-piii.1)", () => {
				// Current: 0.51.0-piii.2, Available: 0.51.0-piii.1
				expect(compareVersions("0.51.0-piii.1", "0.51.0-piii.2")).toBeLessThan(0);
			});

			it("should detect fork prerelease as newer than upstream stable (0.51.0-piii.1 > 0.51.0)", () => {
				// Fork was created after upstream, so it's newer
				expect(compareVersions("0.51.0-piii.1", "0.51.0")).toBeGreaterThan(0);
			});

			it("should not show update when versions are equal", () => {
				expect(compareVersions("0.51.0-piii.1", "0.51.0-piii.1")).toBe(0);
			});

			it("should handle major version bump from upstream", () => {
				expect(compareVersions("1.0.0", "0.51.0-piii.1")).toBeGreaterThan(0);
			});
		});
	});
});
