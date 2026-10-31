import { db, firebaseConfigured } from "./firebase-config.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const orderCounts = {
	requests: 4,
	confirmed: 2
};
const shopWhatsAppNumber = "2290158243324";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("[data-order-count]").forEach((counter) => {
		counter.textContent = `Demandes reçues : ${orderCounts.requests} · Commandes confirmées : ${orderCounts.confirmed}`;
	});

	const revealItems = document.querySelectorAll(".m15-featured, .c12-featured, .hero-text, .product-stage, .promo-bar, .details-grid, .preview-order .order-card");
	const productStage = document.querySelector(".product-stage");
	const menuToggle = document.querySelector(".menu-toggle");
	const mainNavigation = document.querySelector("#main-navigation");

	menuToggle.addEventListener("click", () => {
		const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
		menuToggle.setAttribute("aria-expanded", String(!isExpanded));
		menuToggle.setAttribute("aria-label", isExpanded ? "Ouvrir le menu" : "Fermer le menu");
		mainNavigation.classList.toggle("is-open", !isExpanded);
	});

	mainNavigation.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			menuToggle.setAttribute("aria-expanded", "false");
			menuToggle.setAttribute("aria-label", "Ouvrir le menu");
			mainNavigation.classList.remove("is-open");
		});
	});

	document.querySelectorAll("[data-order-card]").forEach((orderCard) => {
		const unitPrice = Number(orderCard.dataset.unitPrice);
		const orderItem = orderCard.dataset.orderItem;
		const quantityValue = orderCard.querySelector("[data-quantity-value]");
		const totalValue = orderCard.querySelector("[data-order-total]");
		let quantity = 1;

		const updateOrderSummary = () => {
			const total = quantity * unitPrice;
			quantityValue.textContent = quantity;
			totalValue.textContent = `${total.toLocaleString("fr-FR")} FCFA`;
			orderCard.querySelector('[data-quantity-action="increase"]').disabled = quantity >= 100;
		};

		orderCard.querySelectorAll("[data-quantity-action]").forEach((button) => {
			button.addEventListener("click", () => {
				const action = button.dataset.quantityAction;
				quantity = action === "increase" ? Math.min(100, quantity + 1) : Math.max(1, quantity - 1);
				updateOrderSummary();
			});
		});

		orderCard.querySelector("[data-order-form]").addEventListener("submit", async (event) => {
			event.preventDefault();
			const customerForm = event.currentTarget;
			const submitButton = customerForm.querySelector("[data-order-submit]");
			const status = customerForm.querySelector("[data-order-status]");
			if (!firebaseConfigured) {
				status.textContent = "La prise de commande n’est pas encore configurée. Veuillez nous contacter par téléphone.";
				return;
			}

			const firstName = customerForm.querySelector('[name="firstName"]').value.trim();
			const lastName = customerForm.querySelector('[name="lastName"]').value.trim();
			const phone = customerForm.querySelector('[name="phone"]').value.trim();
			if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80 || phone.length < 6 || phone.length > 25) {
				status.textContent = "Vérifiez votre prénom, votre nom et votre numéro de téléphone.";
				return;
			}
			const total = quantity * unitPrice;
			const whatsappMessage = [
				"Bonjour Douceur Nomade,",
				"Je souhaite passer une commande :",
				`Produit : ${orderItem}`,
				`Quantité : ${quantity}`,
				`Total : ${total.toLocaleString("fr-FR")} FCFA`,
				"Merci de me confirmer la disponibilité et les modalités de livraison."
			].join("\n");
			const whatsappUrl = `https://wa.me/${shopWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;
			submitButton.disabled = true;
			status.textContent = "Envoi de votre demande…";

			try {
				await addDoc(collection(db, "orders"), {
					firstName,
					lastName,
					phone,
					item: orderItem,
					quantity,
					unitPrice,
					total,
					consent: customerForm.querySelector('[name="consent"]').checked,
					createdAt: serverTimestamp()
				});
				customerForm.reset();
				status.textContent = "Demande enregistrée. Ouverture de WhatsApp…";
				window.location.assign(whatsappUrl);
			} catch (error) {
				console.error("Impossible d’enregistrer la demande de commande.", error);
				status.textContent = "L’envoi a échoué. Vérifiez votre connexion ou contactez-nous par téléphone.";
			} finally {
				submitButton.disabled = false;
			}
		});
	});

	if (!prefersReducedMotion) {
		revealItems.forEach((item, index) => {
			item.classList.add("reveal-item");
			item.style.setProperty("--reveal-delay", `${index * 90}ms`);
		});

		const revealObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		}, { threshold: 0.15 });

		revealItems.forEach((item) => revealObserver.observe(item));
	}

	if (!productStage || prefersReducedMotion) return;

	productStage.addEventListener("pointermove", (event) => {
		const bounds = productStage.getBoundingClientRect();
		const x = (event.clientX - bounds.left) / bounds.width - 0.5;
		const y = (event.clientY - bounds.top) / bounds.height - 0.5;
		productStage.style.setProperty("--stage-rotate-x", `${y * -2}deg`);
		productStage.style.setProperty("--stage-rotate-y", `${x * 2}deg`);
	});

	productStage.addEventListener("pointerleave", () => {
		productStage.style.setProperty("--stage-rotate-x", "0deg");
		productStage.style.setProperty("--stage-rotate-y", "0deg");
	});
});
