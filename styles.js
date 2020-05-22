export const notLoggedInStyles = () => {
  document.getElementById("addLink").style.display = "none";
  document.getElementById("logo").style.display = "block";
  document.getElementById("logo-loggedIn").style.display = "none";
  document.getElementById("signIn").style.display = "block";
  document.getElementById("signIn").innerText = "Sign-in with Google";
  document.getElementById("signOut").style.display = "none";
  document.getElementById("note").style.display = "none";
  document.querySelector(".app").style.background = "#5856d7";
  document.querySelector(".app").style.borderColor = "#615de0";
  document.querySelector(".app").style.borderRadius = "120px";
};

export const loggedInStyles = () => {
  document.getElementById("logo").style.display = "none";
  document.getElementById("logo-loggedIn").style.display = "block";
  document.getElementById("signIn").style.display = "none";
  document.getElementById("addLink").style.display = "block";
  document.getElementById("signOut").style.display = "block";
  document.getElementById("note").style.display = "block";
  document.querySelector(".app").style.background = "#fbf7ff";
  document.querySelector(".app").style.borderColor = "#FBF8FF";
  document.querySelector(".app").style.borderRadius = 0;
};
