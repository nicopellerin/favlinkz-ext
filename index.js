/*global chrome*/
import { db } from "./firebase.js";
import { handleSignIn } from "./auth.js";
import { loggedInStyles, notLoggedInStyles } from "./styles.js";

let loggedInUser;

// Checks if user info is in storage
chrome.storage.sync.get("user", function (result) {
  if (result.user) {
    loggedInStyles();
  } else {
    notLoggedInStyles();
  }
});

// Watches firebase auth state changes
firebase.auth().onAuthStateChanged((firebaseUser) => {
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
      loggedInStyles();
      db.collection("users").doc(user.uid).set(user, { merge: true });
    } else {
      notLoggedInStyles();
    }
  });
});

// Get HTML from webpage and send it off to firebase
const sendLinkData = async () => {
  let img, desc, note;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    document.getElementById("addLink").textContent = "Saving link...";

    const url = new URL(tabs[0].url);
    const chromeUrl = url.href;
    const chromeTitle = tabs[0].title;

    const response = await fetch(chromeUrl);
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

    const data = {
      url: chromeUrl || null,
      title: chromeTitle || null,
      image: img || null,
      description: desc || null,
      note: note || "",
      created: Date.now(),
    };

    // Push dataUrl object to Firebase
    const usersRef = db.collection("users").doc(loggedInUser.uid);

    usersRef.get().then((doc) => {
      const previousLinks = doc.data().links || [];
      const updatedLinks = [data, ...previousLinks];

      usersRef.update({ links: updatedLinks });
    });

    document.getElementById("addLink").style.backgroundColor = "#48BEA2";
    document.getElementById("addLink").textContent = "Link saved!";
    document.getElementById("note").value = "";

    setTimeout(() => {
      document.getElementById("addLink").style.backgroundColor = "#ff5c5b";
      document.getElementById("addLink").textContent = "+ Add link";
    }, 1000);
  });
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
  notLoggedInStyles();
});
