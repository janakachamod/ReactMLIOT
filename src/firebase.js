// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAx8SgHY6Gy7n2YnBRt7pXzrIDmIeFZqIs",
    authDomain: "mlwithiot.firebaseapp.com",
    databaseURL: "https://mlwithiot-default-rtdb.firebaseio.com",
    projectId: "mlwithiot",
    storageBucket: "mlwithiot.appspot.com",
    messagingSenderId: "1039652168587",
    appId: "1:1039652168587:web:bb4954824e507f176dc58e"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
