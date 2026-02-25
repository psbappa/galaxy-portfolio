/* eslint-disable prefer-const */
export function getExperienceContext() {
  const params = new URLSearchParams(window.location.search);

  const fromParam = params.get("from");
  const nameParam = params.get("name");

  const isWhatsApp =
    fromParam === "whatsapp" ||
    document.referrer.includes("whatsapp") ||
    navigator.userAgent.toLowerCase().includes("whatsapp");

  const savedName = localStorage.getItem("galaxy_user");
  const isReturning = localStorage.getItem("galaxy_visited");

  let userName = nameParam || savedName || null;

  if (nameParam) {
    localStorage.setItem("galaxy_user", nameParam);
  }

  localStorage.setItem("galaxy_visited", "true");

  let introText = "✨ Minakshi, Space Explorer";

  // if (isWhatsApp && userName && isReturning) {
  //   introText = `🪐 Welcome back, Commander ${userName}\nThe galaxy remembers you.`;
  // } else if (isWhatsApp && userName) {
  //   introText = `🌌 Welcome ${userName}\nYou entered through a WhatsApp wormhole ✨`;
  // } else if (isWhatsApp) {
  //   introText =
  //     "🌌 A traveler arrived from WhatsApp…\nSynchronizing cosmic coordinates 🚀";
  // } else if (isReturning && userName) {
  //   introText = `🪐 Welcome back, ${userName}`;
  // }

  return {
    isWhatsApp,
    isReturning,
    userName,
    introText,
  };
}
