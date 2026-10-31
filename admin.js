import {
	adminUid,
	adminUidConfigured,
	auth,
	db,
	firebaseConfigured
} from "./firebase-config.js";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	orderBy,
	query
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const loginForm = document.querySelector("[data-admin-login]");
const authStatus = document.querySelector("[data-admin-auth-status]");
const dashboard = document.querySelector("[data-admin-dashboard]");
const ordersStatus = document.querySelector("[data-admin-orders-status]");
const ordersContainer = document.querySelector("[data-admin-orders]");
const logoutButton = document.querySelector("[data-admin-logout]");
let stopWatchingOrders = null;

const setAuthStatus = (message) => {
	authStatus.textContent = message;
};

const productName = (item, quantity) => {
	if (item === "console game M15") return quantity > 1 ? "consoles game M15" : item;
	if (item === "trépied C12") return quantity > 1 ? "trépieds C12" : item;
	return quantity > 1
		? "sachets de serviettes hygiéniques compressées"
		: item;
};

const renderOrders = (snapshot) => {
	ordersContainer.replaceChildren();
	if (snapshot.empty) {
		ordersStatus.textContent = "Aucune demande de commande pour le moment.";
		return;
	}

	ordersStatus.textContent = `${snapshot.size} demande${snapshot.size > 1 ? "s" : ""}`;
	snapshot.forEach((orderDocument) => {
		const order = orderDocument.data();
		const card = document.createElement("article");
		card.className = "admin-order-card";

		const heading = document.createElement("div");
		heading.className = "admin-order-heading";
		const customerName = document.createElement("h3");
		customerName.textContent = `${order.firstName} ${order.lastName}`;
		const orderDate = document.createElement("time");
		const date = order.createdAt?.toDate();
		orderDate.textContent = date ? date.toLocaleString("fr-FR") : "Date indisponible";
		heading.append(customerName, orderDate);

		const phone = document.createElement("a");
		phone.href = `tel:${encodeURIComponent(order.phone)}`;
		phone.textContent = order.phone;

		const item = document.createElement("p");
		item.textContent = `${order.quantity} ${productName(order.item, order.quantity)}`;

		const total = document.createElement("p");
		total.className = "admin-order-total";
		total.textContent = `${Number(order.total).toLocaleString("fr-FR")} FCFA`;

		const deleteButton = document.createElement("button");
		deleteButton.className = "button button-secondary admin-delete-button";
		deleteButton.type = "button";
		deleteButton.textContent = "Supprimer cette demande";
		deleteButton.addEventListener("click", async () => {
			if (!window.confirm("Supprimer définitivement cette demande ?")) return;
			deleteButton.disabled = true;
			try {
				await deleteDoc(doc(db, "orders", orderDocument.id));
			} catch (error) {
				console.error("Impossible de supprimer cette demande.", error);
				ordersStatus.textContent = "La suppression a échoué. Vérifiez votre connexion et réessayez.";
				deleteButton.disabled = false;
			}
		});

		card.append(heading, phone, item, total, deleteButton);
		ordersContainer.append(card);
	});
};

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!firebaseConfigured || !adminUidConfigured) {
		setAuthStatus("Firebase n’est pas encore configuré. Consultez le guide FIREBASE.md.");
		return;
	}

	const submitButton = loginForm.querySelector('button[type="submit"]');
	submitButton.disabled = true;
	setAuthStatus("Connexion en cours…");
	try {
		const email = loginForm.elements.email.value.trim();
		const password = loginForm.elements.password.value;
		await signInWithEmailAndPassword(auth, email, password);
	} catch (error) {
		console.error("Échec de la connexion à l’espace privé.", error);
		setAuthStatus("Connexion impossible. Vérifiez l’adresse e-mail, le mot de passe et la configuration Firebase.");
	} finally {
		submitButton.disabled = false;
	}
});

logoutButton.addEventListener("click", async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error("Impossible de fermer la session administrateur.", error);
		ordersStatus.textContent = "La déconnexion a échoué. Fermez aussi cette page sur cet appareil.";
	}
});

if (!firebaseConfigured || !adminUidConfigured) {
	loginForm.querySelector('button[type="submit"]').disabled = true;
	setAuthStatus("Configurez Firebase avant d’utiliser cet espace. Consultez le guide FIREBASE.md.");
} else {
	onAuthStateChanged(auth, async (user) => {
		if (stopWatchingOrders) {
			stopWatchingOrders();
			stopWatchingOrders = null;
		}

		if (!user) {
			loginForm.hidden = false;
			dashboard.hidden = true;
			ordersContainer.replaceChildren();
			return;
		}

		if (user.uid !== adminUid) {
			setAuthStatus("Ce compte n’est pas autorisé à consulter les commandes.");
			try {
				await signOut(auth);
			} catch (error) {
				console.error("Impossible de fermer la session non autorisée.", error);
			}
			return;
		}

		loginForm.hidden = true;
		dashboard.hidden = false;
		ordersStatus.textContent = "Chargement des demandes…";
		stopWatchingOrders = onSnapshot(
			query(collection(db, "orders"), orderBy("createdAt", "desc")),
			renderOrders,
			(error) => {
				console.error("Impossible de charger les demandes.", error);
				ordersStatus.textContent = "Impossible de charger les demandes. Vérifiez les règles Firestore et votre connexion.";
			}
		);
	});
}
