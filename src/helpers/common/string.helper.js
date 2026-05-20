/**
 * Common Helpers - Utilities
 * String manipulation, slugs, formatting, etc.
 */

class StringHelper {
  // ✅ Convert to slug
  static toSlug(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // ✅ Convert slug to title
  static slugToTitle(slug) {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // ✅ Capitalize first letter
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // ✅ Truncate string
  static truncate(str, length = 100, suffix = "...") {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  }

  // ✅ Remove HTML tags
  static stripHtml(html) {
    return html.replace(/<[^>]*>/g, "");
  }

  // ✅ Normalize whitespace
  static normalizeWhitespace(str) {
    return str.replace(/\s+/g, " ").trim();
  }

  // ✅ Generate random string
  static generateRandom(length = 10) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }

  // ✅ Check if valid URL
  static isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // ✅ Check if valid email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default StringHelper;
