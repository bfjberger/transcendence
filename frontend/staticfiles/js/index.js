/*
    POOR ATTEMPT TO SPA
    NOT WORKING
*/

// import { Main } from './views/Main.js';
// import { Four } from './games/pong4players.js';
// import { Two } from './games/pong2players.js';

// const navigateTo = url => {
// 	history.pushState(null, null, url);
// 	router();
// };

// const router = async () => {
// 	const routes = [
// 		{path: "file:///Users/kmorin/Desktop/transcendence/html/index.html", view: Main},
// 		{path: "file:///Users/kmorin/Desktop/transcendence/html/fourplayers.html", view: Four},
// 		{path: "file:///Users/kmorin/Desktop/transcendence/html/twoplayers.html", view: Two}
// 	];

// 	const view = new match.route.view();

// 	document.querySelector("#app").innerHTML = await view.getHtml();
// };

// document.addEventListener("DOMContentLoaded", () => {
// 	document.body.addEventListener("click", e => {
// 		if (e.target.matches("[data-link]")) {
// 			e.preventDefault();
// 			navigateTo(e.target.href);
// 		}
// 	});

// 	router();
// });

/*
loading for games on startup NOT WORKING on local

var eltwo = document.getElementById('link2');
eltwo.onclick = console.log('hello');
eltwo.onclick = loadScript('./games/pong2players.js');

var elfour = document.getElementById('link4');
eltwo.onclick = console.log('hellohello');
elfour.onclick = loadScript('./games/pong4players.js');

function loadScript(scriptName) {
    // Call the cleanup function of the existing game, if any
    // if (window.cleanup) {
    //     window.cleanup();
    // }

    // Check if the script is already loaded
    // const existingScript = document.querySelector(`script[src="${scriptName}"]`);
    // if (existingScript) {
    //     existingScript.remove();
    // }

    // Create a new script element
    const script = document.createElement('script');

    // Set the src attribute to the script to load
    // script.src = scriptName;

    // Append the script element to the body of the document
    // document.body.appendChild(script);

    // Call start4PlayerGame or start2PlayerGame after the script has been loaded
    script.onload = function() {
        if (scriptName === './games/pong4players.js') {
            start4PlayerGame();
        } else if (scriptName === './games/pong2players.js') {
            start2PlayerGame();
        }
    };
}

*/