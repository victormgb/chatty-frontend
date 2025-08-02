/**
 * @fileoverview A script to generate random dark colors from a predefined palette.
 * This is useful for creating a color scheme with sufficient contrast for white text.
 */

/**
 * An array of 7 predefined vibrant hex colors to choose from.
 * These colors are chosen for their visual distinctiveness.
 */
const baseColors = [
  '#FF6347', // Tomato Red
  '#4682B4', // Steel Blue
  '#32CD32', // Lime Green
  '#FFD700', // Gold
  '#9932CC', // Dark Orchid
  '#1E90FF', // Dodger Blue
  '#FF4500'  // Orange Red
];

/**
 * Takes a hex color code and returns a new, darker hex color.
 * The function works by reducing each RGB component.
 *
 * @param {string} hex - The original hex color string (e.g., '#FF5733').
 * @returns {string} The new, darker hex color string.
 */
function getDarkColor(hex: string) {
  // Remove the '#' if it exists.
  const fullHex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Convert the hex color to RGB values.
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // Reduce the RGB values by a fixed factor to make the color darker.
  // The Math.max(0, ...) ensures the value doesn't drop below 0.
  const newR = Math.max(0, Math.round(r * 0.5));
  const newG = Math.max(0, Math.round(g * 0.5));
  const newB = Math.max(0, Math.round(b * 0.5));

  // Convert the new RGB values back to a hex string.
  const toHex = (c: any) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const newHex = `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;

  return newHex;
}

/**
 * Picks a random color from a predefined list and returns a darker version of it.
 *
 * @returns {string} A randomly selected darker hex color.
 */
export function getRandomDarkColor() {
  // Get a random index from the array of base colors.
  const randomIndex = Math.floor(Math.random() * baseColors.length);

  // Get the base color using the random index.
  const randomBaseColor = baseColors[randomIndex];

  // Return the darker version of the randomly selected color.
  return getDarkColor(randomBaseColor);
}