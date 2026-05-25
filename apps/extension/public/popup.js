const DASHBOARD_URL = "https://verisight-trust-engine.vercel.app/dashboard";

const openDashboardButton = document.getElementById("openDashboard");

openDashboardButton?.addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});
