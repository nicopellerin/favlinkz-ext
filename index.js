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
  let img, desc, rss;

  const note = document.getElementById("note").value;

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

    if (parsedHtml.querySelector("link[type='application/rss+xml']")) {
      rss = parsedHtml
        .querySelector("link[type='application/rss+xml']")
        .getAttribute("href");
    }

    if (rss && !rss.startsWith("http")) {
      rss = chromeUrl + rss;
    }

    const newLink = {
      url: chromeUrl || null,
      rss: rss || null,
      title: chromeTitle || null,
      image: img || null,
      description: desc || null,
      note: note || "",
      created: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };

    // Push latestLinks object to Firebase
    const latestLinks = db
      .collection("users")
      .doc(loggedInUser.uid)
      .collection("latest")
      .doc(newLink.id);

    latestLinks.set(newLink);

    document.getElementById("addLink").style.backgroundColor = "#00C29F";
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
