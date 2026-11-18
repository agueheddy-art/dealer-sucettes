const shopWhatsAppNumber = "2290158243324";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	const revealItems = document.querySelectorAll(".hero-text, .product-stage, .promo-bar, .details-grid, .order-steps-heading, .order-steps .feature, .preview-order .order-card");
	const menuToggle = document.querySelector(".menu-toggle");
	const mainNavigation = document.querySelector("#main-navigation");

	document.querySelectorAll('a[href^="#"]').forEach((link) => {
		link.addEventListener("click", () => {
			const target = document.getElementById(link.hash.slice(1));
			target?.closest("details")?.setAttribute("open", "");
		});
	});

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
		const orderItemPlural = orderCard.dataset.orderItemPlural || orderItem;
		const quantityValue = orderCard.querySelector("[data-quantity-value]");
		const totalValue = orderCard.querySelector("[data-order-total]");
		const maxQuantity = Math.floor(Number.MAX_SAFE_INTEGER / unitPrice);
		let quantity = 1;

		const updateOrderSummary = (syncInput = true) => {
			const total = quantity * unitPrice;
			if (syncInput) quantityValue.value = quantity;
			totalValue.textContent = `${total.toLocaleString("fr-FR")} FCFA`;
			orderCard.querySelector('[data-quantity-action="increase"]').disabled = quantity >= maxQuantity;
			orderCard.querySelector('[data-quantity-action="decrease"]').disabled = quantity <= 1;
		};

		orderCard.querySelectorAll("[data-quantity-action]").forEach((button) => {
			button.addEventListener("click", () => {
				const action = button.dataset.quantityAction;
				quantity = action === "increase" ? Math.min(maxQuantity, quantity + 1) : Math.max(1, quantity - 1);
				updateOrderSummary();
			});
		});

		quantityValue.max = String(maxQuantity);
		quantityValue.addEventListener("input", () => {
			const enteredQuantity = Number(quantityValue.value);
			if (!quantityValue.value || !Number.isSafeInteger(enteredQuantity) || enteredQuantity < 1 || enteredQuantity > maxQuantity) return;
			quantity = enteredQuantity;
			updateOrderSummary(false);
		});
		quantityValue.addEventListener("change", () => {
			if (!quantityValue.validity.valid || !Number.isSafeInteger(Number(quantityValue.value))) {
				updateOrderSummary();
			}
		});

		orderCard.querySelector("[data-order-form]").addEventListener("submit", (event) => {
			event.preventDefault();
			if (!quantityValue.validity.valid || !Number.isSafeInteger(Number(quantityValue.value))) {
				quantityValue.reportValidity();
				updateOrderSummary();
				return;
			}
			const total = quantity * unitPrice;
			const whatsappMessage = [
				"Bonjour, je souhaite commander :",
				`${quantity} x ${quantity === 1 ? orderItem : orderItemPlural}`,
				`Total : ${total.toLocaleString("fr-FR")} FCFA`,
				orderCard.dataset.orderDelivery || "Livraison : modalités à confirmer avec la boutique.",
				"Merci de confirmer la disponibilité et le délai de livraison."
			].join("\n");
			const whatsappUrl = `https://wa.me/${shopWhatsAppNumber}?text=${encodeURIComponent(whatsappMessage)}`;
			window.open(whatsappUrl, "_blank", "noopener,noreferrer");
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

});
