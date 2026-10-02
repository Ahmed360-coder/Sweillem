/**
 * Runs as soon as the page's HTML is parsed, before the app's JavaScript: any
 * scroll-reveal element already on the first screen is shown straight away, so
 * the opening content doesn't wait for hydration (and appears at once rather than
 * fading, since the page itself already fades in). RevealObserver handles the rest.
 */
export const revealEarlyScript = `(()=>{var h=innerHeight*.92;document.querySelectorAll(".reveal:not([data-in])").forEach(function(e){if(e.getBoundingClientRect().top<h){e.style.transition="none";e.dataset.in=""}})})()`;
