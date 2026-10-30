const whatsappNumber = "2290158243324";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	const revealItems = document.querySelectorAll(".c12-featured, .hero-text, .product-stage, .promo-bar, .details-grid, .preview-order .order-card");
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
		};

		orderCard.querySelectorAll("[data-quantity-action]").forEach((button) => {
			button.addEventListener("click", () => {
				const action = button.dataset.quantityAction;
				quantity = action === "increase" ? quantity + 1 : Math.max(1, quantity - 1);
				updateOrderSummary();
			});
		});

		orderCard.querySelector("[data-order-submit]").addEventListener("click", () => {
			const total = quantity * unitPrice;
			const message = [
				"Bonjour, je souhaite passer une commande.",
				`Je voudrais ${quantity} ${orderItem}${quantity > 1 ? "s" : ""}.`,
				`Total : ${total.toLocaleString("fr-FR")} FCFA.`,
				"Merci !"
			].join("\n");
			window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
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
