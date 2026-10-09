"use strict";

// Keep bookmarks to the former source-guide index pointing to the same topic.
function restoreSourceBookmark() {
  const anchor = window.location.hash.slice(1);
  const sourceAnchors = ["chapters", "basics", "gameplay", "advanced", "finishing"];
  if (/^s(?:0\d|1\d|2[0-2])$/.test(anchor) || sourceAnchors.includes(anchor)) {
    const page = document.documentElement.lang === "en" ? "source.en.html" : "source.html";
    window.location.replace(page + window.location.hash);
  }
}
restoreSourceBookmark();
window.addEventListener("hashchange", restoreSourceBookmark);
