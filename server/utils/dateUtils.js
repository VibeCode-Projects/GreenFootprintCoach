/**
 * Date utility for consistent YYYY-MM-DD formatting regardless of timezone
 */
function getLocalDateString(dateInput = new Date()) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStartOfDay(dateInput = new Date()) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(dateInput = new Date()) {
  const d = new Date(dateInput);
  d.setHours(23, 59, 59, 999);
  return d;
}

module.exports = {
  getLocalDateString,
  getStartOfDay,
  getEndOfDay
};
