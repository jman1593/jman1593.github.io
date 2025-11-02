const firebaseConfig = {
    apiKey: "AIzaSyBh-VnGiP4qZD0r14gfn9dr77GwtslpTqU",
    authDomain: "strongdog-auth.firebaseapp.com",
    projectId: "strongdog-auth",
    storageBucket: "strongdog-auth.appspot.com",
    messagingSenderId: "936276282572",
    appId: "1:936276282572:web:a802b7f609381ff9428669",
    measurementId: "G-0YLTCV2MMS",
};
firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.firestore();
window.rtdb = firebase.database();