/**
 * mysql2 (with dateStrings: true) returns DATETIME as "YYYY-MM-DD HH:MM:SS".
 * Convert to an ISO-like string the frontend's `new Date(...)` can parse consistently.
 */
function toIso(mysqlDateString) {
  if (!mysqlDateString) return null;
  return mysqlDateString.replace(' ', 'T');
}

module.exports = { toIso };
