/**
 * @typedef {Object} ActivitySearchRequest
 * @property {string} destination - Destination code/name (required)
 * @property {string} from - Start date in YYYY-MM-DD format (required)
 * @property {string} to - End date in YYYY-MM-DD format (required)
 * @property {Array<{age: number}>} paxes - Array of passenger ages (required)
 * @property {string} [language='en'] - Language code (optional)
 * @property {Object} [pagination] - Pagination options (optional)
 * @property {number} [pagination.itemsPerPage=20] - Items per page
 * @property {number} [pagination.page=1] - Page number
 */

/**
 * @typedef {Object} ActivityPricing
 * @property {number} amount - Price amount
 * @property {string} currency - Currency code (e.g., 'USD', 'EUR')
 */

/**
 * @typedef {Object} Activity
 * @property {string} code - Unique activity code
 * @property {string} name - Activity name
 * @property {string} description - Activity description
 * @property {string[]} images - Array of image URLs
 * @property {ActivityPricing} pricing - Pricing information
 * @property {string} [country] - Country name
 * @property {string} [destination] - Destination name
 */

/**
 * @typedef {Object} ActivitySearchResponse
 * @property {boolean} success - Request success status
 * @property {Object} data - Response data
 * @property {Activity[]} data.activities - Array of activities
 * @property {number} data.total - Total number of activities
 * @property {string} [error] - Error message if failed
 */

export {};
