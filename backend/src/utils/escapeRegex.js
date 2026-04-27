/** Escape user-supplied strings before embedding them in `RegExp` (avoids injection / broken patterns). */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { escapeRegex };
