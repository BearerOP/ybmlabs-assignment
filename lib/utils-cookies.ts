/**
 * Utility functions for managing cookies and sessions
 */

/**
 * Clears all cookies for the current domain
 * Useful for clearing invalid sessions
 */
export function clearAllCookies() {
  if (typeof window === "undefined") return

  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=")
    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
    // Clear cookie by setting it to expire in the past
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
  })
}

/**
 * Clears session and redirects to login
 */
export function clearSessionAndRedirect() {
  if (typeof window === "undefined") return

  clearAllCookies()
  localStorage.clear()
  sessionStorage.clear()

  // Redirect to login
  window.location.href = "/login"
}

