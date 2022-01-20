const {initializeApp} = require('firebase/app');

const __FIREBASE__ = {
  apiKey: "AIzaSyAmXfXqaOigcD4EBnfERszV8vPnFuN19qU",
  authDomain: "money-stack.firebaseapp.com",
  projectId: "money-stack",
  storageBucket: "money-stack.appspot.com",
  messagingSenderId: "90059813572",
  appId: "1:90059813572:web:2e9f91acdb5c65c9bd0f91",
  measurementId: "G-C12QBQ6QVX"
};

const firebaseInit = initializeApp(__FIREBASE__);

module.exports = firebaseInit;