import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyDRdOfP4fddrPh1sayFPY7MYZZ52bRDCJA",
	authDomain: "recense-eddy.firebaseapp.com",
	projectId: "recense-eddy",
	appId: "1:1072189649204:web:e72f7ad16d2db879f7f561"
};

export const adminUid = "CNusVmq4PsMC59DVuUzzmqf8aE02";
export const firebaseConfigured = Object.values(firebaseConfig).every(
	(value) => value && !value.startsWith("REMPLACER")
);
export const adminUidConfigured = adminUid && !adminUid.startsWith("REMPLACER");

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
