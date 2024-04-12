export default function handleTwoPlayersOnline() {

    document.querySelector("#startGame2Online").addEventListener("click", e => {
        e.preventDefault();

        // hide the start button
        document.querySelector("#startGame2Online").classList.add("d-none");

    });
};