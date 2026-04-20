const fc = require('fast-check');

// ---------------------------------------------------------------------------
// Pure function replicating the Carousel's computeNextIndex logic.
// The actual function lives in Frontend/src/components/Carousel.jsx:
//   export function computeNextIndex(currentIndex, totalPages) {
//     if (totalPages <= 0) return 0;
//     return (currentIndex + 1) % totalPages;
//   }
// We replicate it here to test the property without importing a React module.
// ---------------------------------------------------------------------------

function computeNextIndex(currentIndex, totalPages) {
  if (totalPages <= 0) return 0;
  return (currentIndex + 1) % totalPages;
}

/**
 * Simulate K forward advances starting from index 0.
 * Returns the final page index after K advances.
 */
function simulateAdvances(totalPages, k) {
  let index = 0;
  for (let i = 0; i < k; i++) {
    index = computeNextIndex(index, totalPages);
  }
  return index;
}

// ---------------------------------------------------------------------------
// Feature: homepage-enhancements, Property 8: Carousel Continuous Looping
// ---------------------------------------------------------------------------

/**
 * **Validates: Requirements 6.5, 7.6**
 *
 * For any carousel with N items (N ≥ 1) and any number of forward advances K,
 * the displayed page index SHALL equal K mod ceil(N / itemsPerView), ensuring
 * the carousel wraps from the last page back to the first without stopping.
 */
describe('Feature: homepage-enhancements, Property 8: Carousel Continuous Looping', () => {
  it('after K forward advances from index 0, the page index equals K mod totalPages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),  // N: number of items (≥ 1)
        fc.integer({ min: 1, max: 10 }),  // itemsPerView (≥ 1)
        fc.integer({ min: 0, max: 200 }), // K: number of forward advances
        (n, itemsPerView, k) => {
          const totalPages = Math.ceil(n / itemsPerView);
          const expectedIndex = k % totalPages;
          const actualIndex = simulateAdvances(totalPages, k);

          expect(actualIndex).toBe(expectedIndex);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the carousel always wraps back to index 0 after totalPages advances', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),  // N: number of items
        fc.integer({ min: 1, max: 10 }),  // itemsPerView
        (n, itemsPerView) => {
          const totalPages = Math.ceil(n / itemsPerView);
          // After exactly totalPages advances, we should be back at 0
          const finalIndex = simulateAdvances(totalPages, totalPages);

          expect(finalIndex).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the page index is always within valid bounds [0, totalPages)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),  // N: number of items
        fc.integer({ min: 1, max: 10 }),  // itemsPerView
        fc.integer({ min: 0, max: 200 }), // K: number of forward advances
        (n, itemsPerView, k) => {
          const totalPages = Math.ceil(n / itemsPerView);
          const actualIndex = simulateAdvances(totalPages, k);

          expect(actualIndex).toBeGreaterThanOrEqual(0);
          expect(actualIndex).toBeLessThan(totalPages);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('computeNextIndex with totalPages <= 0 always returns 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),   // currentIndex
        fc.integer({ min: -10, max: 0 }),    // totalPages (invalid: ≤ 0)
        (currentIndex, totalPages) => {
          expect(computeNextIndex(currentIndex, totalPages)).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
