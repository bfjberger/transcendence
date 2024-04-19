window.addEventListener("DOMContentLoaded", async e => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:7890/api/call_back/');
        
        const data = await response.text();
        console.log(data);
        sessionStorage.setItem("username", data.username);

        document.getElementById("navbar__btn--text").innerHTML = sessionStorage.getItem("username") ? sessionStorage.getItem("username") : "user";
    } catch (e) {
        console.error(e);
    }
});