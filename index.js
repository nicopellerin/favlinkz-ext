/*global chrome*/
import { db } from "./firebase.js";
import { handleSignIn } from "./auth.js";

let chromeUrl, chromeTitle, img, desc, note, fetchingData, loggedInUser;

// Checks if user info is in storage
chrome.storage.sync.get("user", function (result) {
  if (result.user !== "undefined") {
    document.getElementById("signIn").style.display = "none";
    document.getElementById("logo").style.display = "none";
    document.getElementById("logo-loggedIn").style.display = "block";
    document.getElementById("addLink").style.display = "block";
    document.getElementById("signOut").style.display = "block";
    document.getElementById("note").style.display = "block";
    document.querySelector(".app").style.background = "#fbf7ff";
    document.querySelector(".app").style.borderColor = "#FBF8FF";
    document.querySelector(".app").style.borderRadius = 0;
  }
});

// Watches firebase auth state changes
firebase.auth().onAuthStateChanged((firebaseUser) => {
  if (!firebaseUser) {
    document.getElementById("addLink").style.display = "none";
    document.getElementById("logo").style.display = "block";
    document.getElementById("logo-loggedIn").style.display = "none";
    document.getElementById("signIn").style.display = "block";
    document.getElementById("signOut").style.display = "none";
    document.getElementById("note").style.display = "none";
    document.querySelector(".app").style.background = "#5856d7";
    document.querySelector(".app").style.borderColor = "#615de0";
    document.querySelector(".app").style.borderRadius = "120px";

    return;
  }
  const usersRef = db.collection("users").doc(firebaseUser.uid);
  usersRef.get().then(() => {
    const user = {
      displayName: firebaseUser.displayName,
      photoUrl: firebaseUser.photoURL,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
    };
    loggedInUser = user;
    if (firebaseUser) {
      document.getElementById("logo").style.display = "none";
      document.getElementById("logo-loggedIn").style.display = "block";
      document.getElementById("signIn").style.display = "none";
      document.getElementById("addLink").style.display = "block";
      document.getElementById("signOut").style.display = "block";
      document.getElementById("note").style.display = "block";
      document.querySelector(".app").style.background = "#fbf7ff";
      document.querySelector(".app").style.borderColor = "#FBF8FF";
      document.querySelector(".app").style.borderRadius = 0;

      db.collection("users").doc(user.uid).set(user, { merge: true });
    } else {
      document.getElementById("logo").style.display = "block";
      document.getElementById("signIn").style.display = "block";
      document.getElementById("addLink").style.display = "none";
      document.getElementById("signOut").style.display = "none";
      document.getElementById("note").style.display = "none";
      document.querySelector(".app").style.background = "#5856d7";
      document.querySelector(".app").style.borderColor = "#615de0";
      document.querySelector(".app").style.borderRadius = "120px";
    }
  });
});

// Get HTML from webpage and parse it
const getHtml = async () => {
  fetchingData = true;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    chromeUrl = url.href;
    chromeTitle = tabs[0].title;
  });

  const response = await fetch("https://nicopellerin.io");
  const html = await response.text();
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(html, "text/html");

  if (parsedHtml.querySelector("meta[property='og:image']")) {
    img = parsedHtml
      .querySelector("meta[property='og:image']")
      .getAttribute("content");
  }

  if (parsedHtml.querySelector("meta[property='og:description']")) {
    desc = parsedHtml
      .querySelector("meta[property='og:description']")
      .getAttribute("content");
  }
};

const sendLinkData = async () => {
  await getHtml();

  const dataUrl = {
    url: chromeUrl || null,
    title: chromeTitle || null,
    image: img || null,
    description: desc || null,
    note: note,
    created: Date.now(),
  };

  // Push dataUrl object to Firebase
  const usersRef = db.collection("users").doc(loggedInUser.uid);

  // *** TODO *** - Fix structure

  // usersRef.get().then((doc) => {
  //   console.log(doc.data().links);
  //   const previousLinks = doc.data().links || [];
  //   const updatedLinks = [...previousLinks, dataUrl];

  //   usersRef.update({ links: updatedLinks });
  // });
  // fetchingData = false;
  // setLinkPosted(true);
  // setTimeout(() => {
  //   setLinkPosted(false);
  // }, 1000);
};

document.getElementById("signIn").addEventListener("click", () => {
  const user = handleSignIn();
  loggedInUser = user;
});

document.getElementById("addLink").addEventListener("click", sendLinkData);

document.getElementById("signOut").addEventListener("click", () => {
  firebase.auth().signOut();
  chrome.storage.sync.remove("user", function () {
    console.log("User info removed");
  });
  document.getElementById("logo").style.display = "block";
  document.getElementById("signIn").style.display = "block";
  document.getElementById("addLink").style.display = "none";
  document.getElementById("signOut").style.display = "none";
  document.getElementById("note").style.display = "none";
  document.querySelector(".app").style.background = "#5856d7";
  document.querySelector(".app").style.borderColor = "#615de0";
  document.getElementById("signIn").textContent = "Sign-in with Google";
  document.querySelector(".app").style.borderRadius = "120px";
});
