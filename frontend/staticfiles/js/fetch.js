var userAvatarDefault = "../img/person-circle-Bootstrap.svg";

async function fetchTest() {

  fetch("")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    return response.json();
  })
  .then((result) => {
    console.log('test print result ' + result);

    var p = document.createElement("p");
    p.append(result);
    document.getElementById("testFetch").innerHTML = p;
  })
  .catch((e) => {
    console.error("fetch error catched: ", e);
  });
};

async function fetchAvatar() {

  // try {
  //   const response = await fetch("");
  //   if (!response.ok)
  //     throw new Error("fetch image failed");

  // const result = await response.blob();

  // const userAvatar = document.getElementById("user__avatar");
  // userAvatar.src = URL.createObjectURL(result);

  // } catch (e) {
  //   console.error("fetch image error catched: ", e);
  // }

  fetch("")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error, status = ${response.status}`);
    }
    return response.blob();
  })
  .then((blob) => {
    userAvatar.src = URL.createObjectURL(blob);
  })
  .catch((e) => {
    console.error("fetch image error catched: ", e);
    userAvatar.src = userAvatarDefault;
    // var p = document.createElement("p");
    // p.appendChild(document.createTextNode(`Error: ${error.message}`));
    // document.body.insertBefore(p, myImage);
  });
}

document.addEventListener("DOMContentLoaded", () => {

  fetchTest();
  // fetchAvatar();

});