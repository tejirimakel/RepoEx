// Shared display formatters used across Card and RepoDetail so values
// (dates, star counts) render consistently everywhere.

const starFormatter = new Intl.NumberFormat("en", { notation: "compact" })

export const formatDate = (date) => {
  if (!date) return "N/A"
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? "N/A" : parsed.toLocaleDateString()
}

export const formatStars = (num) =>
  typeof num === "number" ? starFormatter.format(num) : "0"
