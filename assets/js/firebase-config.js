// 1. Import the scripts for side-effects (This loads them into the browser)
// We use a newer version (10.7.1) for better stability
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js";

// 2. Access the global 'firebase' object created by the imports above
const firebase = window.firebase;

// 3. Your Configuration (PASTE YOUR KEYS HERE)
const firebaseConfig = {
  apiKey: "AIzaSyAuDtyiRdZhroArnYsBeZ8oH25p1rZqTx8",
  authDomain: "industrial-4ef5e.firebaseapp.com",
  databaseURL: "https://industrial-4ef5e-default-rtdb.firebaseio.com",
  projectId: "industrial-4ef5e",
  storageBucket: "industrial-4ef5e.firebasestorage.app",
  messagingSenderId: "1014409359764",
  appId: "1:1014409359764:web:3a58c140e973497c2cdf81",
  measurementId: "G-81LE6JP8P4"
};

// 4. Initialize
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 5. Export for use in app.js
export { auth, db };