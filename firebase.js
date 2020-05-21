const firebaseConfig = {
  apiKey: "AIzaSyAr3FrhflOhTE8yPM-UGDXaF698DaYG6_8",
  authDomain: "favlinkz-9f6e8.firebaseapp.com",
  databaseURL: "https://favlinkz-9f6e8.firebaseio.com",
  projectId: "favlinkz-9f6e8",
  storageBucket: "favlinkz-9f6e8.appspot.com",
  messagingSenderId: "445807341018",
  appId: "1:445807341018:web:a56b492a802f78c0",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export { db };
