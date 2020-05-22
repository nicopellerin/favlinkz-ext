const startAuthProcess = (interactive = true) => {
  document.getElementById("signIn").textContent = "Signing in...";
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({ interactive: !!interactive }, function (
    token
  ) {
    if (chrome.runtime.lastError && !interactive) {
      console.log("It was not possible to get a token programmatically.");
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authorize Firebase with the OAuth Access Token.
      const credential = firebase.auth.GoogleAuthProvider.credential(
        null,
        token
      );
      firebase
        .auth()
        .signInWithCredential(credential)
        .catch(function (error) {
          // The OAuth token might have been invalidated. Lets' remove it from cache.
          if (error.code === "auth/invalid-credential") {
            chrome.identity.removeCachedAuthToken(
              { token: token },
              function () {
                startAuth(interactive);
              }
            );
          }
        });
      chrome.storage.sync.set({ user: credential }, function () {
        console.log("Value is set to " + credential);
      });
    } else {
      document.getElementById("signIn").textContent = "Sign-in with Google";
      console.error("The OAuth Token was null");
    }
  });
};

export const handleSignIn = () => {
  try {
    startAuthProcess(true);
    return firebase.auth().currentUser;
  } catch (err) {
    console.error(err);
  }
};
