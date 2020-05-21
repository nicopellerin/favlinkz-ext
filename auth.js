const startAuth = (interactive) => {
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
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
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
      console.log(credential);
    } else {
      console.error("The OAuth Token was null");
    }
  });
};

export const handleSignIn = () => {
  try {
    startAuth(true);
    return firebase.auth().currentUser;
  } catch (err) {
    console.error(err);
  }
};
