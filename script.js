const whatsappNumber = "2290158243324";
const unitPrice = 200;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	const revealItems = document.querySelectorAll(".hero-text, .product-stage, .promo-bar, .details-grid, .preview-order .order-card");
	const productStage = document.querySelector(".product-stage");
	const quantityValue = document.querySelector("#quantity-value");
	const totalValue = document.querySelector("#order-total");
	const orderButton = document.querySelector("#order-button");
	const menuToggle = document.querySelector(".menu-toggle");
	const mainNavigation = document.querySelector("#main-navigation");
	let quantity = 1;

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

	const updateOrderSummary = () => {
		const total = quantity * unitPrice;
		quantityValue.textContent = quantity;
		totalValue.textContent = `${total.toLocaleString("fr-FR")} FCFA`;
	};

	document.querySelectorAll("[data-quantity-action]").forEach((button) => {
		button.addEventListener("click", () => {
			const action = button.dataset.quantityAction;
			quantity = action === "increase" ? quantity + 1 : Math.max(1, quantity - 1);
			updateOrderSummary();
		});
	});

	orderButton.addEventListener("click", () => {
		const total = quantity * unitPrice;
		const message = [
			"Bonjour, je souhaite passer une commande.",
			`Je voudrais ${quantity} sachet${quantity > 1 ? "s" : ""} de serviettes hygiéniques compressées.`,
			`Total : ${total} FCFA.`,
			"Merci !"
		].join("\n");
		window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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
