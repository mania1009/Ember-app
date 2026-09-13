import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Mic, MicOff, ShoppingBag, Plus, Minus, Send,
  Volume2, VolumeX, MapPin, Clock, Star, ChevronLeft, Trash2, X, Pencil,
  Settings, Globe, Sun, Moon, Store, User, Mail, Phone, UtensilsCrossed, Camera, Tag, Palette
} from "lucide-react";

const BRAND_NAME = "Ember & Co";

// The AI assistant calls YOUR backend, not Anthropic directly — a browser/app
// can't safely hold an Anthropic API key. Point this at the small proxy
// server included in /server (see README.md), once you've deployed it.
const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "/api/chat";
const RTL_LANGS = ["ar", "he"];

/* ---------------------------------------------------------
   Theme palettes (light/dark) + accent color themes
--------------------------------------------------------- */
const LIGHT = { bg: "#FFF4DE", surface: "#FFFFFF", ink: "#1B2E22", line: "rgba(27,46,34,0.14)", cream: "#FFFBF3" };
const DARK = { bg: "#12201A", surface: "#1B2A22", ink: "#F3F7F0", line: "rgba(243,247,240,0.16)", cream: "#0F1B15" };

const ACCENT_THEMES = [
  { id: "citrus", name: "Citrus", accent: "#FF6B35", gold: "#E3B23C" },
  { id: "berry", name: "Berry", accent: "#E1306C", gold: "#F2A6C8" },
  { id: "ocean", name: "Ocean", accent: "#2563EB", gold: "#7DD3FC" },
  { id: "forest", name: "Forest", accent: "#2F9E44", gold: "#A9D977" },
  { id: "royal", name: "Royal", accent: "#7C3AED", gold: "#C4B5FD" },
];

const PAYMENT_METHODS = ["cod", "card", "jazzcash", "bank"];
function paymentLabel(id, t) {
  if (id === "cod") return t("cashOnDelivery");
  if (id === "card") return t("cardOnline");
  if (id === "jazzcash") return "JazzCash";
  if (id === "bank") return t("bankTransfer");
  return id;
}

const DEMO_COUPONS = {
  WELCOME10: { type: "percent", value: 10 },
  SAVE5: { type: "flat", value: 5 },
  FREESHIP: { type: "freeShipping" },
};

/* ---------------------------------------------------------
   Currencies (major world currencies — not exhaustive ISO 4217,
   but covers the large majority of markets)
--------------------------------------------------------- */
const CURRENCIES = [
  ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"], ["JPY", "Japanese Yen"],
  ["CNY", "Chinese Yuan"], ["INR", "Indian Rupee"], ["AUD", "Australian Dollar"], ["CAD", "Canadian Dollar"],
  ["CHF", "Swiss Franc"], ["SEK", "Swedish Krona"], ["NOK", "Norwegian Krone"], ["DKK", "Danish Krone"],
  ["NZD", "New Zealand Dollar"], ["SGD", "Singapore Dollar"], ["HKD", "Hong Kong Dollar"], ["KRW", "South Korean Won"],
  ["MXN", "Mexican Peso"], ["BRL", "Brazilian Real"], ["ZAR", "South African Rand"], ["AED", "UAE Dirham"],
  ["SAR", "Saudi Riyal"], ["TRY", "Turkish Lira"], ["RUB", "Russian Ruble"], ["PLN", "Polish Zloty"],
  ["THB", "Thai Baht"], ["IDR", "Indonesian Rupiah"], ["MYR", "Malaysian Ringgit"], ["PHP", "Philippine Peso"],
  ["VND", "Vietnamese Dong"], ["EGP", "Egyptian Pound"], ["NGN", "Nigerian Naira"], ["KES", "Kenyan Shilling"],
  ["PKR", "Pakistani Rupee"], ["BDT", "Bangladeshi Taka"], ["ARS", "Argentine Peso"], ["CLP", "Chilean Peso"],
  ["COP", "Colombian Peso"], ["ILS", "Israeli Shekel"],
];

function formatPrice(amount, code) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code || "USD" }).format(amount || 0);
  } catch {
    return `$${(amount || 0).toFixed(2)}`;
  }
}

/* ---------------------------------------------------------
   Speech recognition / synthesis locale mapping
--------------------------------------------------------- */
const SPEECH_LOCALES = {
  en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", pt: "pt-PT", zh: "zh-CN", ja: "ja-JP",
  ar: "ar-SA", hi: "hi-IN", ru: "ru-RU", ko: "ko-KR", vi: "vi-VN", th: "th-TH", id: "id-ID", tr: "tr-TR",
  pl: "pl-PL", nl: "nl-NL", sv: "sv-SE", da: "da-DK", nb: "nb-NO", fi: "fi-FI", el: "el-GR", he: "he-IL",
  uk: "uk-UA", ro: "ro-RO", cs: "cs-CZ", hu: "hu-HU", ms: "ms-MY", bn: "bn-BD",
};

/* ---------------------------------------------------------
   Language strings — 10 fully localized languages, plus 20 more
   with core UI strings (anything missing falls back to English).
--------------------------------------------------------- */
const LANGS = {
  en: { langName: "English", welcomeHeadline: "Welcome to " + BRAND_NAME, welcomeSub: "Tell us who you are so we can set things up right.", customerCard: "I'm a customer", customerCardDesc: "Order food from local restaurants", sellerCard: "I'm a restaurant owner", sellerCardDesc: "List your restaurant and manage your menu", emailLabel: "Email address", phoneLabel: "Phone number", continueBtn: "Continue", languageLabel: "Language", backBtn: "Back", heroTitle: "What are you hungry for?", heroSub: "Say it, type it, or browse below — I'll build the order for you.", chatPlaceholder: "Or type what you're craving…", cuisineAll: "All", cartEmptyTitle: "Your cart is empty.", cartEmptySub: "Tell the assistant what you're craving, or browse a restaurant.", fromLabel: "From", subtotal: "Subtotal", delivery: "Delivery", total: "Total", checkoutBtn: "Checkout", clearCart: "Clear cart", yourOrder: "Your order", confirmOrderTitle: "Confirm order", placeOrderBtn: "Place order", cancelBtn: "Cancel", orderPlacedTitle: "Order placed 🎉", doneBtn: "Done", settingsTitle: "Settings", themeLabel: "Theme", lightLabel: "Light", darkLabel: "Dark", switchRoleBtn: "Switch account type", manageTitle: "Manage your restaurant", createRestaurantTitle: "Set up your restaurant", restaurantNameLabel: "Restaurant name", cuisineLabel: "Cuisine", tagLabel: "Short tagline", emojiLabel: "Icon (emoji)", createBtn: "Create restaurant", saveBtn: "Save", addMenuItemBtn: "Add menu item", editBtn: "Edit", deleteBtn: "Delete", itemNameLabel: "Item name", itemDescLabel: "Description", itemPriceLabel: "Price", spicyLabel: "Mark as spicy", previewStorefront: "Preview as customer", backToManage: "Back to dashboard", editRestaurantInfo: "Edit restaurant info", menuEmptyTitle: "No menu items yet.", menuEmptySub: "Add your first dish to get started.", editItemTitle: "Edit item", newItemTitle: "New menu item", customizeSize: "Size", customizeSpice: "Spice level", customizeAddOns: "Add-ons", customizeNotes: "Special instructions", customizeNotesPlaceholder: "e.g. no cilantro, sauce on the side…", quantityLabel: "Quantity", addToCartBtn: "Add to cart", reviewsTitle: "Reviews", writeReviewBtn: "Write a review", yourNameLabel: "Your name", ratingLabel: "Rating", commentLabel: "Comment", submitReviewBtn: "Submit review", noReviewsYet: "No reviews yet — be the first!", currencyLabel: "Currency", deliveryFeeLabel: "Delivery fee", uploadImageLabel: "Photo", notificationEmailSent: "Confirmation emailed to", notificationSmsSent: "Text sent to", listeningLabel: "Listening…", voiceErrorMic: "Microphone access was blocked. Allow it in your browser settings and try again.", voiceErrorUnsupported: "Voice input isn't supported in this browser — try Chrome or Edge.", voiceErrorHttps: "Voice input needs a secure (https) connection.", contactSectionTitle: "Contact info", noPhotoLabel: "No photo", removeLabel: "Remove", callBtn: "Call restaurant", restaurantPhoneLabel: "Restaurant phone number", acceptedPaymentsLabel: "Accepted payment methods", paymentMethodLabel: "Payment method", cashOnDelivery: "Cash on Delivery", cardOnline: "Card / Online Payment", bankTransfer: "Bank Transfer", bankTransferNote: "Bank transfer details will be shared after you confirm.", jazzCashNote: "You'll receive a JazzCash payment request after you confirm.", couponLabel: "Coupon code", applyCouponBtn: "Apply", discountLabel: "Discount", couponInvalid: "Invalid or expired coupon code", couponApplied: "Coupon applied!", colorThemeLabel: "Accent color", attachPhotoLabel: "Add a photo (optional)" },
  es: { langName: "Español", welcomeHeadline: "Bienvenido a " + BRAND_NAME, welcomeSub: "Cuéntanos quién eres para configurar todo bien.", customerCard: "Soy cliente", customerCardDesc: "Pide comida de restaurantes locales", sellerCard: "Soy dueño de un restaurante", sellerCardDesc: "Publica tu restaurante y gestiona tu menú", emailLabel: "Correo electrónico", phoneLabel: "Número de teléfono", continueBtn: "Continuar", languageLabel: "Idioma", backBtn: "Atrás", heroTitle: "¿Qué se te antoja?", heroSub: "Dilo, escríbelo o explora abajo — yo armo tu pedido.", chatPlaceholder: "O escribe lo que se te antoja…", cuisineAll: "Todos", cartEmptyTitle: "Tu carrito está vacío.", cartEmptySub: "Dile al asistente qué se te antoja, o explora un restaurante.", fromLabel: "De", subtotal: "Subtotal", delivery: "Envío", total: "Total", checkoutBtn: "Pagar", clearCart: "Vaciar carrito", yourOrder: "Tu pedido", confirmOrderTitle: "Confirmar pedido", placeOrderBtn: "Realizar pedido", cancelBtn: "Cancelar", orderPlacedTitle: "¡Pedido realizado! 🎉", doneBtn: "Listo", settingsTitle: "Configuración", themeLabel: "Tema", lightLabel: "Claro", darkLabel: "Oscuro", switchRoleBtn: "Cambiar tipo de cuenta", manageTitle: "Gestiona tu restaurante", createRestaurantTitle: "Configura tu restaurante", restaurantNameLabel: "Nombre del restaurante", cuisineLabel: "Cocina", tagLabel: "Eslogan corto", emojiLabel: "Ícono (emoji)", createBtn: "Crear restaurante", saveBtn: "Guardar", addMenuItemBtn: "Añadir platillo", editBtn: "Editar", deleteBtn: "Eliminar", itemNameLabel: "Nombre del platillo", itemDescLabel: "Descripción", itemPriceLabel: "Precio", spicyLabel: "Marcar como picante", previewStorefront: "Vista como cliente", backToManage: "Volver al panel", editRestaurantInfo: "Editar información", menuEmptyTitle: "Aún no hay platillos.", menuEmptySub: "Añade tu primer platillo para comenzar.", editItemTitle: "Editar platillo", newItemTitle: "Nuevo platillo", customizeSize: "Tamaño", customizeSpice: "Nivel de picante", customizeAddOns: "Extras", customizeNotes: "Instrucciones especiales", customizeNotesPlaceholder: "ej. sin cilantro, salsa aparte…", quantityLabel: "Cantidad", addToCartBtn: "Añadir al carrito", reviewsTitle: "Reseñas", writeReviewBtn: "Escribir una reseña", yourNameLabel: "Tu nombre", ratingLabel: "Calificación", commentLabel: "Comentario", submitReviewBtn: "Enviar reseña", noReviewsYet: "Aún no hay reseñas — ¡sé el primero!", currencyLabel: "Moneda", deliveryFeeLabel: "Costo de envío", uploadImageLabel: "Foto", notificationEmailSent: "Confirmación enviada por correo a", notificationSmsSent: "SMS enviado a", listeningLabel: "Escuchando…", voiceErrorMic: "Se bloqueó el acceso al micrófono. Permítelo en la configuración del navegador e intenta de nuevo.", voiceErrorUnsupported: "La entrada por voz no es compatible con este navegador — prueba con Chrome o Edge.", voiceErrorHttps: "La entrada por voz necesita una conexión segura (https).", contactSectionTitle: "Información de contacto", noPhotoLabel: "Sin foto", removeLabel: "Quitar", callBtn: "Llamar al restaurante", restaurantPhoneLabel: "Teléfono del restaurante", acceptedPaymentsLabel: "Métodos de pago aceptados", paymentMethodLabel: "Método de pago", cashOnDelivery: "Pago contra entrega", cardOnline: "Tarjeta / Pago en línea", bankTransfer: "Transferencia bancaria", bankTransferNote: "Los datos de la transferencia se compartirán después de confirmar.", jazzCashNote: "Recibirás una solicitud de pago de JazzCash después de confirmar.", couponLabel: "Código de cupón", applyCouponBtn: "Aplicar", discountLabel: "Descuento", couponInvalid: "Código de cupón inválido o vencido", couponApplied: "¡Cupón aplicado!", colorThemeLabel: "Color de acento", attachPhotoLabel: "Agregar una foto (opcional)" },
  fr: { langName: "Français", welcomeHeadline: "Bienvenue chez " + BRAND_NAME, welcomeSub: "Dites-nous qui vous êtes pour bien configurer les choses.", customerCard: "Je suis client", customerCardDesc: "Commandez auprès de restaurants locaux", sellerCard: "Je suis restaurateur", sellerCardDesc: "Publiez votre restaurant et gérez votre menu", emailLabel: "Adresse e-mail", phoneLabel: "Numéro de téléphone", continueBtn: "Continuer", languageLabel: "Langue", backBtn: "Retour", heroTitle: "Qu'est-ce qui vous ferait envie ?", heroSub: "Dites-le, tapez-le, ou parcourez ci-dessous — je prépare votre commande.", chatPlaceholder: "Ou tapez votre envie…", cuisineAll: "Tous", cartEmptyTitle: "Votre panier est vide.", cartEmptySub: "Dites à l'assistant ce qui vous ferait envie, ou parcourez un restaurant.", fromLabel: "De", subtotal: "Sous-total", delivery: "Livraison", total: "Total", checkoutBtn: "Commander", clearCart: "Vider le panier", yourOrder: "Votre commande", confirmOrderTitle: "Confirmer la commande", placeOrderBtn: "Passer la commande", cancelBtn: "Annuler", orderPlacedTitle: "Commande passée 🎉", doneBtn: "Terminé", settingsTitle: "Paramètres", themeLabel: "Thème", lightLabel: "Clair", darkLabel: "Sombre", switchRoleBtn: "Changer de type de compte", manageTitle: "Gérez votre restaurant", createRestaurantTitle: "Configurez votre restaurant", restaurantNameLabel: "Nom du restaurant", cuisineLabel: "Cuisine", tagLabel: "Court slogan", emojiLabel: "Icône (emoji)", createBtn: "Créer le restaurant", saveBtn: "Enregistrer", addMenuItemBtn: "Ajouter un plat", editBtn: "Modifier", deleteBtn: "Supprimer", itemNameLabel: "Nom du plat", itemDescLabel: "Description", itemPriceLabel: "Prix", spicyLabel: "Marquer comme épicé", previewStorefront: "Aperçu client", backToManage: "Retour au tableau de bord", editRestaurantInfo: "Modifier les infos", menuEmptyTitle: "Aucun plat pour l'instant.", menuEmptySub: "Ajoutez votre premier plat pour commencer.", editItemTitle: "Modifier le plat", newItemTitle: "Nouveau plat", customizeSize: "Taille", customizeSpice: "Niveau d'épice", customizeAddOns: "Suppléments", customizeNotes: "Instructions spéciales", customizeNotesPlaceholder: "ex. sans coriandre, sauce à part…", quantityLabel: "Quantité", addToCartBtn: "Ajouter au panier", reviewsTitle: "Avis", writeReviewBtn: "Écrire un avis", yourNameLabel: "Votre nom", ratingLabel: "Note", commentLabel: "Commentaire", submitReviewBtn: "Envoyer l'avis", noReviewsYet: "Pas encore d'avis — soyez le premier !", currencyLabel: "Devise", deliveryFeeLabel: "Frais de livraison", uploadImageLabel: "Photo", notificationEmailSent: "Confirmation envoyée par e-mail à", notificationSmsSent: "SMS envoyé à", listeningLabel: "Écoute…", voiceErrorMic: "L'accès au microphone a été bloqué. Autorisez-le dans les paramètres du navigateur et réessayez.", voiceErrorUnsupported: "La saisie vocale n'est pas prise en charge par ce navigateur — essayez Chrome ou Edge.", voiceErrorHttps: "La saisie vocale nécessite une connexion sécurisée (https).", contactSectionTitle: "Coordonnées", noPhotoLabel: "Pas de photo", removeLabel: "Retirer", callBtn: "Appeler le restaurant", restaurantPhoneLabel: "Numéro de téléphone du restaurant", acceptedPaymentsLabel: "Moyens de paiement acceptés", paymentMethodLabel: "Moyen de paiement", cashOnDelivery: "Paiement à la livraison", cardOnline: "Carte / Paiement en ligne", bankTransfer: "Virement bancaire", bankTransferNote: "Les coordonnées bancaires seront communiquées après confirmation.", jazzCashNote: "Vous recevrez une demande de paiement JazzCash après confirmation.", couponLabel: "Code promo", applyCouponBtn: "Appliquer", discountLabel: "Réduction", couponInvalid: "Code promo invalide ou expiré", couponApplied: "Code promo appliqué !", colorThemeLabel: "Couleur d'accent", attachPhotoLabel: "Ajouter une photo (facultatif)" },
  de: { langName: "Deutsch", welcomeHeadline: "Willkommen bei " + BRAND_NAME, welcomeSub: "Sag uns, wer du bist, damit wir alles richtig einrichten.", customerCard: "Ich bin Kunde", customerCardDesc: "Bestelle Essen von lokalen Restaurants", sellerCard: "Ich bin Restaurantbesitzer", sellerCardDesc: "Liste dein Restaurant und verwalte deine Speisekarte", emailLabel: "E-Mail-Adresse", phoneLabel: "Telefonnummer", continueBtn: "Weiter", languageLabel: "Sprache", backBtn: "Zurück", heroTitle: "Worauf hast du Appetit?", heroSub: "Sag es, tippe es, oder stöbere unten — ich stelle die Bestellung zusammen.", chatPlaceholder: "Oder tippe, worauf du Lust hast…", cuisineAll: "Alle", cartEmptyTitle: "Dein Warenkorb ist leer.", cartEmptySub: "Sag dem Assistenten, worauf du Lust hast, oder stöbere in einem Restaurant.", fromLabel: "Von", subtotal: "Zwischensumme", delivery: "Lieferung", total: "Gesamt", checkoutBtn: "Zur Kasse", clearCart: "Warenkorb leeren", yourOrder: "Deine Bestellung", confirmOrderTitle: "Bestellung bestätigen", placeOrderBtn: "Bestellung aufgeben", cancelBtn: "Abbrechen", orderPlacedTitle: "Bestellung aufgegeben 🎉", doneBtn: "Fertig", settingsTitle: "Einstellungen", themeLabel: "Design", lightLabel: "Hell", darkLabel: "Dunkel", switchRoleBtn: "Kontotyp wechseln", manageTitle: "Verwalte dein Restaurant", createRestaurantTitle: "Richte dein Restaurant ein", restaurantNameLabel: "Restaurantname", cuisineLabel: "Küche", tagLabel: "Kurzer Slogan", emojiLabel: "Symbol (Emoji)", createBtn: "Restaurant erstellen", saveBtn: "Speichern", addMenuItemBtn: "Gericht hinzufügen", editBtn: "Bearbeiten", deleteBtn: "Löschen", itemNameLabel: "Gerichtname", itemDescLabel: "Beschreibung", itemPriceLabel: "Preis", spicyLabel: "Als scharf markieren", previewStorefront: "Als Kunde ansehen", backToManage: "Zurück zum Dashboard", editRestaurantInfo: "Restaurantinfo bearbeiten", menuEmptyTitle: "Noch keine Gerichte.", menuEmptySub: "Füge dein erstes Gericht hinzu, um loszulegen.", editItemTitle: "Gericht bearbeiten", newItemTitle: "Neues Gericht", customizeSize: "Größe", customizeSpice: "Schärfegrad", customizeAddOns: "Extras", customizeNotes: "Besondere Wünsche", customizeNotesPlaceholder: "z. B. ohne Koriander, Soße separat…", quantityLabel: "Menge", addToCartBtn: "In den Warenkorb", reviewsTitle: "Bewertungen", writeReviewBtn: "Bewertung schreiben", yourNameLabel: "Dein Name", ratingLabel: "Bewertung", commentLabel: "Kommentar", submitReviewBtn: "Bewertung senden", noReviewsYet: "Noch keine Bewertungen — sei der Erste!", currencyLabel: "Währung", deliveryFeeLabel: "Liefergebühr", uploadImageLabel: "Foto", notificationEmailSent: "Bestätigung per E-Mail gesendet an", notificationSmsSent: "SMS gesendet an", listeningLabel: "Hört zu…", voiceErrorMic: "Mikrofonzugriff wurde blockiert. Erlaube ihn in den Browsereinstellungen und versuche es erneut.", voiceErrorUnsupported: "Spracheingabe wird in diesem Browser nicht unterstützt — probiere Chrome oder Edge.", voiceErrorHttps: "Spracheingabe erfordert eine sichere (https) Verbindung.", contactSectionTitle: "Kontaktinformationen", noPhotoLabel: "Kein Foto", removeLabel: "Entfernen", callBtn: "Restaurant anrufen", restaurantPhoneLabel: "Telefonnummer des Restaurants", acceptedPaymentsLabel: "Akzeptierte Zahlungsmethoden", paymentMethodLabel: "Zahlungsmethode", cashOnDelivery: "Barzahlung bei Lieferung", cardOnline: "Karte / Online-Zahlung", bankTransfer: "Banküberweisung", bankTransferNote: "Die Bankdaten werden nach der Bestätigung mitgeteilt.", jazzCashNote: "Du erhältst nach der Bestätigung eine JazzCash-Zahlungsanfrage.", couponLabel: "Gutscheincode", applyCouponBtn: "Anwenden", discountLabel: "Rabatt", couponInvalid: "Ungültiger oder abgelaufener Gutscheincode", couponApplied: "Gutschein angewendet!", colorThemeLabel: "Akzentfarbe", attachPhotoLabel: "Foto hinzufügen (optional)" },
  it: { langName: "Italiano", welcomeHeadline: "Benvenuto su " + BRAND_NAME, welcomeSub: "Dicci chi sei per impostare tutto correttamente.", customerCard: "Sono un cliente", customerCardDesc: "Ordina cibo dai ristoranti locali", sellerCard: "Sono un ristoratore", sellerCardDesc: "Pubblica il tuo ristorante e gestisci il tuo menù", emailLabel: "Indirizzo email", phoneLabel: "Numero di telefono", continueBtn: "Continua", languageLabel: "Lingua", backBtn: "Indietro", heroTitle: "Cosa ti va di mangiare?", heroSub: "Dillo, scrivilo, o sfoglia qui sotto — preparo io l'ordine.", chatPlaceholder: "O scrivi cosa ti va…", cuisineAll: "Tutti", cartEmptyTitle: "Il tuo carrello è vuoto.", cartEmptySub: "Di' all'assistente cosa ti va, oppure sfoglia un ristorante.", fromLabel: "Da", subtotal: "Subtotale", delivery: "Consegna", total: "Totale", checkoutBtn: "Cassa", clearCart: "Svuota carrello", yourOrder: "Il tuo ordine", confirmOrderTitle: "Conferma ordine", placeOrderBtn: "Effettua ordine", cancelBtn: "Annulla", orderPlacedTitle: "Ordine effettuato 🎉", doneBtn: "Fatto", settingsTitle: "Impostazioni", themeLabel: "Tema", lightLabel: "Chiaro", darkLabel: "Scuro", switchRoleBtn: "Cambia tipo di account", manageTitle: "Gestisci il tuo ristorante", createRestaurantTitle: "Configura il tuo ristorante", restaurantNameLabel: "Nome del ristorante", cuisineLabel: "Cucina", tagLabel: "Slogan breve", emojiLabel: "Icona (emoji)", createBtn: "Crea ristorante", saveBtn: "Salva", addMenuItemBtn: "Aggiungi piatto", editBtn: "Modifica", deleteBtn: "Elimina", itemNameLabel: "Nome del piatto", itemDescLabel: "Descrizione", itemPriceLabel: "Prezzo", spicyLabel: "Segna come piccante", previewStorefront: "Anteprima cliente", backToManage: "Torna alla dashboard", editRestaurantInfo: "Modifica info ristorante", menuEmptyTitle: "Ancora nessun piatto.", menuEmptySub: "Aggiungi il tuo primo piatto per iniziare.", editItemTitle: "Modifica piatto", newItemTitle: "Nuovo piatto", customizeSize: "Taglia", customizeSpice: "Livello di piccantezza", customizeAddOns: "Extra", customizeNotes: "Istruzioni speciali", customizeNotesPlaceholder: "es. senza coriandolo, salsa a parte…", quantityLabel: "Quantità", addToCartBtn: "Aggiungi al carrello", reviewsTitle: "Recensioni", writeReviewBtn: "Scrivi una recensione", yourNameLabel: "Il tuo nome", ratingLabel: "Valutazione", commentLabel: "Commento", submitReviewBtn: "Invia recensione", noReviewsYet: "Ancora nessuna recensione — sii il primo!", currencyLabel: "Valuta", deliveryFeeLabel: "Costo di consegna", uploadImageLabel: "Foto", notificationEmailSent: "Conferma inviata via email a", notificationSmsSent: "SMS inviato a", listeningLabel: "In ascolto…", voiceErrorMic: "Accesso al microfono bloccato. Consentilo nelle impostazioni del browser e riprova.", voiceErrorUnsupported: "L'input vocale non è supportato in questo browser — prova Chrome o Edge.", voiceErrorHttps: "L'input vocale richiede una connessione sicura (https).", contactSectionTitle: "Informazioni di contatto", noPhotoLabel: "Nessuna foto", removeLabel: "Rimuovi", callBtn: "Chiama il ristorante", restaurantPhoneLabel: "Numero di telefono del ristorante", acceptedPaymentsLabel: "Metodi di pagamento accettati", paymentMethodLabel: "Metodo di pagamento", cashOnDelivery: "Contrassegno", cardOnline: "Carta / Pagamento online", bankTransfer: "Bonifico bancario", bankTransferNote: "I dati per il bonifico saranno condivisi dopo la conferma.", jazzCashNote: "Riceverai una richiesta di pagamento JazzCash dopo la conferma.", couponLabel: "Codice sconto", applyCouponBtn: "Applica", discountLabel: "Sconto", couponInvalid: "Codice sconto non valido o scaduto", couponApplied: "Codice sconto applicato!", colorThemeLabel: "Colore accento", attachPhotoLabel: "Aggiungi una foto (facoltativo)" },
  pt: { langName: "Português", welcomeHeadline: "Bem-vindo ao " + BRAND_NAME, welcomeSub: "Conte-nos quem você é para configurarmos tudo direitinho.", customerCard: "Sou cliente", customerCardDesc: "Peça comida de restaurantes locais", sellerCard: "Sou dono de restaurante", sellerCardDesc: "Cadastre seu restaurante e gerencie seu cardápio", emailLabel: "Endereço de e-mail", phoneLabel: "Número de telefone", continueBtn: "Continuar", languageLabel: "Idioma", backBtn: "Voltar", heroTitle: "Com vontade de comer o quê?", heroSub: "Diga, digite, ou explore abaixo — eu monto o pedido pra você.", chatPlaceholder: "Ou digite o que você quer…", cuisineAll: "Todos", cartEmptyTitle: "Seu carrinho está vazio.", cartEmptySub: "Diga ao assistente o que você quer, ou explore um restaurante.", fromLabel: "De", subtotal: "Subtotal", delivery: "Entrega", total: "Total", checkoutBtn: "Finalizar pedido", clearCart: "Esvaziar carrinho", yourOrder: "Seu pedido", confirmOrderTitle: "Confirmar pedido", placeOrderBtn: "Fazer pedido", cancelBtn: "Cancelar", orderPlacedTitle: "Pedido realizado 🎉", doneBtn: "Concluído", settingsTitle: "Configurações", themeLabel: "Tema", lightLabel: "Claro", darkLabel: "Escuro", switchRoleBtn: "Trocar tipo de conta", manageTitle: "Gerencie seu restaurante", createRestaurantTitle: "Configure seu restaurante", restaurantNameLabel: "Nome do restaurante", cuisineLabel: "Culinária", tagLabel: "Slogan curto", emojiLabel: "Ícone (emoji)", createBtn: "Criar restaurante", saveBtn: "Salvar", addMenuItemBtn: "Adicionar prato", editBtn: "Editar", deleteBtn: "Excluir", itemNameLabel: "Nome do prato", itemDescLabel: "Descrição", itemPriceLabel: "Preço", spicyLabel: "Marcar como picante", previewStorefront: "Visualizar como cliente", backToManage: "Voltar ao painel", editRestaurantInfo: "Editar informações", menuEmptyTitle: "Nenhum prato ainda.", menuEmptySub: "Adicione seu primeiro prato para começar.", editItemTitle: "Editar prato", newItemTitle: "Novo prato", customizeSize: "Tamanho", customizeSpice: "Nível de picância", customizeAddOns: "Adicionais", customizeNotes: "Instruções especiais", customizeNotesPlaceholder: "ex. sem coentro, molho à parte…", quantityLabel: "Quantidade", addToCartBtn: "Adicionar ao carrinho", reviewsTitle: "Avaliações", writeReviewBtn: "Escrever avaliação", yourNameLabel: "Seu nome", ratingLabel: "Nota", commentLabel: "Comentário", submitReviewBtn: "Enviar avaliação", noReviewsYet: "Ainda sem avaliações — seja o primeiro!", currencyLabel: "Moeda", deliveryFeeLabel: "Taxa de entrega", uploadImageLabel: "Foto", notificationEmailSent: "Confirmação enviada por e-mail para", notificationSmsSent: "SMS enviado para", listeningLabel: "Ouvindo…", voiceErrorMic: "O acesso ao microfone foi bloqueado. Permita nas configurações do navegador e tente novamente.", voiceErrorUnsupported: "Entrada por voz não é compatível com este navegador — tente Chrome ou Edge.", voiceErrorHttps: "A entrada por voz precisa de uma conexão segura (https).", contactSectionTitle: "Informações de contato", noPhotoLabel: "Sem foto", removeLabel: "Remover", callBtn: "Ligar para o restaurante", restaurantPhoneLabel: "Telefone do restaurante", acceptedPaymentsLabel: "Formas de pagamento aceitas", paymentMethodLabel: "Forma de pagamento", cashOnDelivery: "Pagamento na entrega", cardOnline: "Cartão / Pagamento online", bankTransfer: "Transferência bancária", bankTransferNote: "Os dados bancários serão enviados após a confirmação.", jazzCashNote: "Você receberá uma solicitação de pagamento JazzCash após confirmar.", couponLabel: "Código do cupom", applyCouponBtn: "Aplicar", discountLabel: "Desconto", couponInvalid: "Código de cupom inválido ou expirado", couponApplied: "Cupom aplicado!", colorThemeLabel: "Cor de destaque", attachPhotoLabel: "Adicionar uma foto (opcional)" },
  zh: { langName: "中文", welcomeHeadline: "欢迎来到 " + BRAND_NAME, welcomeSub: "告诉我们您的身份，以便我们正确设置。", customerCard: "我是顾客", customerCardDesc: "从本地餐厅订餐", sellerCard: "我是餐厅老板", sellerCardDesc: "发布您的餐厅并管理菜单", emailLabel: "电子邮箱", phoneLabel: "电话号码", continueBtn: "继续", languageLabel: "语言", backBtn: "返回", heroTitle: "您想吃点什么？", heroSub: "说出来、打出来，或在下方浏览——我来帮您下单。", chatPlaceholder: "或输入您想吃的…", cuisineAll: "全部", cartEmptyTitle: "您的购物车是空的。", cartEmptySub: "告诉助手您想吃什么，或浏览餐厅。", fromLabel: "来自", subtotal: "小计", delivery: "配送费", total: "总计", checkoutBtn: "结账", clearCart: "清空购物车", yourOrder: "您的订单", confirmOrderTitle: "确认订单", placeOrderBtn: "下单", cancelBtn: "取消", orderPlacedTitle: "订单已提交 🎉", doneBtn: "完成", settingsTitle: "设置", themeLabel: "主题", lightLabel: "浅色", darkLabel: "深色", switchRoleBtn: "切换账户类型", manageTitle: "管理您的餐厅", createRestaurantTitle: "设置您的餐厅", restaurantNameLabel: "餐厅名称", cuisineLabel: "菜系", tagLabel: "简短标语", emojiLabel: "图标（表情符号）", createBtn: "创建餐厅", saveBtn: "保存", addMenuItemBtn: "添加菜品", editBtn: "编辑", deleteBtn: "删除", itemNameLabel: "菜品名称", itemDescLabel: "描述", itemPriceLabel: "价格", spicyLabel: "标记为辣", previewStorefront: "以顾客身份预览", backToManage: "返回仪表盘", editRestaurantInfo: "编辑餐厅信息", menuEmptyTitle: "暂无菜品。", menuEmptySub: "添加您的第一道菜开始吧。", editItemTitle: "编辑菜品", newItemTitle: "新菜品", customizeSize: "份量", customizeSpice: "辣度", customizeAddOns: "加料", customizeNotes: "特别要求", customizeNotesPlaceholder: "例如：不要香菜，酱料另放…", quantityLabel: "数量", addToCartBtn: "加入购物车", reviewsTitle: "评价", writeReviewBtn: "写评价", yourNameLabel: "您的姓名", ratingLabel: "评分", commentLabel: "评论", submitReviewBtn: "提交评价", noReviewsYet: "暂无评价——成为第一个吧！", currencyLabel: "货币", deliveryFeeLabel: "配送费", uploadImageLabel: "照片", notificationEmailSent: "确认邮件已发送至", notificationSmsSent: "短信已发送至", listeningLabel: "正在聆听…", voiceErrorMic: "麦克风访问被阻止。请在浏览器设置中允许，然后重试。", voiceErrorUnsupported: "此浏览器不支持语音输入——请尝试 Chrome 或 Edge。", voiceErrorHttps: "语音输入需要安全（https）连接。", contactSectionTitle: "联系方式", noPhotoLabel: "暂无照片", removeLabel: "移除", callBtn: "致电餐厅", restaurantPhoneLabel: "餐厅电话号码", acceptedPaymentsLabel: "接受的付款方式", paymentMethodLabel: "付款方式", cashOnDelivery: "货到付款", cardOnline: "银行卡/在线支付", bankTransfer: "银行转账", bankTransferNote: "确认后将提供银行转账详情。", jazzCashNote: "确认后您将收到 JazzCash 付款请求。", couponLabel: "优惠券代码", applyCouponBtn: "应用", discountLabel: "折扣", couponInvalid: "优惠券代码无效或已过期", couponApplied: "优惠券已应用！", colorThemeLabel: "强调色", attachPhotoLabel: "添加照片（可选）" },
  ja: { langName: "日本語", welcomeHeadline: BRAND_NAME + " へようこそ", welcomeSub: "正しく設定するために、あなたについて教えてください。", customerCard: "お客様として利用する", customerCardDesc: "地元のレストランから注文する", sellerCard: "レストランのオーナーです", sellerCardDesc: "レストランを登録し、メニューを管理する", emailLabel: "メールアドレス", phoneLabel: "電話番号", continueBtn: "続ける", languageLabel: "言語", backBtn: "戻る", heroTitle: "何を食べたい気分ですか？", heroSub: "話す、入力する、または下から選ぶ — 注文をお手伝いします。", chatPlaceholder: "または食べたいものを入力…", cuisineAll: "すべて", cartEmptyTitle: "カートは空です。", cartEmptySub: "アシスタントに希望を伝えるか、レストランを閲覧してください。", fromLabel: "注文元", subtotal: "小計", delivery: "配送料", total: "合計", checkoutBtn: "注文手続きへ", clearCart: "カートを空にする", yourOrder: "ご注文", confirmOrderTitle: "注文を確認", placeOrderBtn: "注文する", cancelBtn: "キャンセル", orderPlacedTitle: "注文が完了しました 🎉", doneBtn: "完了", settingsTitle: "設定", themeLabel: "テーマ", lightLabel: "ライト", darkLabel: "ダーク", switchRoleBtn: "アカウント種別を変更", manageTitle: "レストランを管理", createRestaurantTitle: "レストランを設定", restaurantNameLabel: "レストラン名", cuisineLabel: "ジャンル", tagLabel: "短いキャッチコピー", emojiLabel: "アイコン（絵文字）", createBtn: "レストランを作成", saveBtn: "保存", addMenuItemBtn: "メニューを追加", editBtn: "編集", deleteBtn: "削除", itemNameLabel: "料理名", itemDescLabel: "説明", itemPriceLabel: "価格", spicyLabel: "辛いとしてマーク", previewStorefront: "顧客としてプレビュー", backToManage: "ダッシュボードへ戻る", editRestaurantInfo: "レストラン情報を編集", menuEmptyTitle: "まだメニューがありません。", menuEmptySub: "最初の料理を追加して始めましょう。", editItemTitle: "料理を編集", newItemTitle: "新しい料理", customizeSize: "サイズ", customizeSpice: "辛さのレベル", customizeAddOns: "トッピング", customizeNotes: "特別な要望", customizeNotesPlaceholder: "例：パクチー抜き、ソース別添え…", quantityLabel: "数量", addToCartBtn: "カートに追加", reviewsTitle: "レビュー", writeReviewBtn: "レビューを書く", yourNameLabel: "お名前", ratingLabel: "評価", commentLabel: "コメント", submitReviewBtn: "レビューを送信", noReviewsYet: "まだレビューがありません — 最初のレビューを書きましょう！", currencyLabel: "通貨", deliveryFeeLabel: "配送料", uploadImageLabel: "写真", notificationEmailSent: "確認メールを送信しました:", notificationSmsSent: "SMSを送信しました:", listeningLabel: "聞き取り中…", voiceErrorMic: "マイクへのアクセスがブロックされました。ブラウザの設定で許可してから再試行してください。", voiceErrorUnsupported: "このブラウザでは音声入力がサポートされていません — Chrome または Edge をお試しください。", voiceErrorHttps: "音声入力には安全な(https)接続が必要です。", contactSectionTitle: "連絡先情報", noPhotoLabel: "写真なし", removeLabel: "削除", callBtn: "レストランに電話する", restaurantPhoneLabel: "レストランの電話番号", acceptedPaymentsLabel: "利用可能な支払い方法", paymentMethodLabel: "支払い方法", cashOnDelivery: "代金引換", cardOnline: "カード／オンライン決済", bankTransfer: "銀行振込", bankTransferNote: "確認後に振込先の詳細をお知らせします。", jazzCashNote: "確認後にJazzCashの支払いリクエストが届きます。", couponLabel: "クーポンコード", applyCouponBtn: "適用", discountLabel: "割引", couponInvalid: "無効または期限切れのクーポンコードです", couponApplied: "クーポンが適用されました！", colorThemeLabel: "アクセントカラー", attachPhotoLabel: "写真を追加（任意）" },
  ar: { langName: "العربية", welcomeHeadline: "مرحبًا بك في " + BRAND_NAME, welcomeSub: "أخبرنا من أنت لنقوم بالإعداد بشكل صحيح.", customerCard: "أنا زبون", customerCardDesc: "اطلب الطعام من المطاعم المحلية", sellerCard: "أنا صاحب مطعم", sellerCardDesc: "أضف مطعمك وأدر قائمة الطعام", emailLabel: "البريد الإلكتروني", phoneLabel: "رقم الهاتف", continueBtn: "متابعة", languageLabel: "اللغة", backBtn: "رجوع", heroTitle: "ما الذي تشتهيه؟", heroSub: "قله، اكتبه، أو تصفح أدناه — سأجهز الطلب من أجلك.", chatPlaceholder: "أو اكتب ما تشتهيه…", cuisineAll: "الكل", cartEmptyTitle: "سلتك فارغة.", cartEmptySub: "أخبر المساعد بما تشتهيه، أو تصفح مطعمًا.", fromLabel: "من", subtotal: "المجموع الفرعي", delivery: "التوصيل", total: "الإجمالي", checkoutBtn: "إتمام الطلب", clearCart: "إفراغ السلة", yourOrder: "طلبك", confirmOrderTitle: "تأكيد الطلب", placeOrderBtn: "إرسال الطلب", cancelBtn: "إلغاء", orderPlacedTitle: "تم إرسال الطلب 🎉", doneBtn: "تم", settingsTitle: "الإعدادات", themeLabel: "المظهر", lightLabel: "فاتح", darkLabel: "داكن", switchRoleBtn: "تغيير نوع الحساب", manageTitle: "إدارة مطعمك", createRestaurantTitle: "أنشئ مطعمك", restaurantNameLabel: "اسم المطعم", cuisineLabel: "نوع المطبخ", tagLabel: "شعار قصير", emojiLabel: "أيقونة (إيموجي)", createBtn: "إنشاء المطعم", saveBtn: "حفظ", addMenuItemBtn: "إضافة طبق", editBtn: "تعديل", deleteBtn: "حذف", itemNameLabel: "اسم الطبق", itemDescLabel: "الوصف", itemPriceLabel: "السعر", spicyLabel: "وضع علامة حار", previewStorefront: "معاينة كزبون", backToManage: "العودة إلى لوحة التحكم", editRestaurantInfo: "تعديل معلومات المطعم", menuEmptyTitle: "لا توجد أطباق بعد.", menuEmptySub: "أضف أول طبق للبدء.", editItemTitle: "تعديل الطبق", newItemTitle: "طبق جديد", customizeSize: "الحجم", customizeSpice: "مستوى الحرارة", customizeAddOns: "إضافات", customizeNotes: "تعليمات خاصة", customizeNotesPlaceholder: "مثال: بدون كزبرة، الصلصة جانبًا…", quantityLabel: "الكمية", addToCartBtn: "أضف إلى السلة", reviewsTitle: "التقييمات", writeReviewBtn: "اكتب تقييمًا", yourNameLabel: "اسمك", ratingLabel: "التقييم", commentLabel: "التعليق", submitReviewBtn: "إرسال التقييم", noReviewsYet: "لا توجد تقييمات بعد — كن أول من يقيّم!", currencyLabel: "العملة", deliveryFeeLabel: "رسوم التوصيل", uploadImageLabel: "صورة", notificationEmailSent: "تم إرسال التأكيد عبر البريد الإلكتروني إلى", notificationSmsSent: "تم إرسال رسالة نصية إلى", listeningLabel: "جارٍ الاستماع…", voiceErrorMic: "تم حظر الوصول إلى الميكروفون. اسمح به من إعدادات المتصفح وحاول مرة أخرى.", voiceErrorUnsupported: "الإدخال الصوتي غير مدعوم في هذا المتصفح — جرّب Chrome أو Edge.", voiceErrorHttps: "يتطلب الإدخال الصوتي اتصالاً آمنًا (https).", contactSectionTitle: "معلومات التواصل", noPhotoLabel: "لا توجد صورة", removeLabel: "إزالة", callBtn: "اتصل بالمطعم", restaurantPhoneLabel: "رقم هاتف المطعم", acceptedPaymentsLabel: "طرق الدفع المقبولة", paymentMethodLabel: "طريقة الدفع", cashOnDelivery: "الدفع عند الاستلام", cardOnline: "بطاقة / دفع إلكتروني", bankTransfer: "تحويل بنكي", bankTransferNote: "سيتم مشاركة تفاصيل التحويل البنكي بعد التأكيد.", jazzCashNote: "ستتلقى طلب دفع عبر JazzCash بعد التأكيد.", couponLabel: "رمز الكوبون", applyCouponBtn: "تطبيق", discountLabel: "الخصم", couponInvalid: "رمز الكوبون غير صالح أو منتهي الصلاحية", couponApplied: "تم تطبيق الكوبون!", colorThemeLabel: "لون التمييز", attachPhotoLabel: "إضافة صورة (اختياري)" },
  hi: { langName: "हिन्दी", welcomeHeadline: BRAND_NAME + " में आपका स्वागत है", welcomeSub: "हमें बताएं कि आप कौन हैं ताकि हम सब कुछ सही तरीके से सेट कर सकें।", customerCard: "मैं एक ग्राहक हूं", customerCardDesc: "स्थानीय रेस्तरां से खाना ऑर्डर करें", sellerCard: "मैं रेस्तरां मालिक हूं", sellerCardDesc: "अपना रेस्तरां लिस्ट करें और मेनू प्रबंधित करें", emailLabel: "ईमेल पता", phoneLabel: "फ़ोन नंबर", continueBtn: "जारी रखें", languageLabel: "भाषा", backBtn: "वापस", heroTitle: "आपको क्या खाने का मन है?", heroSub: "बोलें, टाइप करें, या नीचे ब्राउज़ करें — मैं आपका ऑर्डर तैयार करूंगा।", chatPlaceholder: "या टाइप करें कि आपका मन क्या खाने का है…", cuisineAll: "सभी", cartEmptyTitle: "आपकी कार्ट खाली है।", cartEmptySub: "सहायक को बताएं कि आपका मन क्या है, या किसी रेस्तरां को ब्राउज़ करें।", fromLabel: "से", subtotal: "उप-योग", delivery: "डिलीवरी", total: "कुल", checkoutBtn: "चेकआउट", clearCart: "कार्ट खाली करें", yourOrder: "आपका ऑर्डर", confirmOrderTitle: "ऑर्डर की पुष्टि करें", placeOrderBtn: "ऑर्डर करें", cancelBtn: "रद्द करें", orderPlacedTitle: "ऑर्डर हो गया 🎉", doneBtn: "हो गया", settingsTitle: "सेटिंग्स", themeLabel: "थीम", lightLabel: "लाइट", darkLabel: "डार्क", switchRoleBtn: "खाता प्रकार बदलें", manageTitle: "अपना रेस्तरां प्रबंधित करें", createRestaurantTitle: "अपना रेस्तरां सेट करें", restaurantNameLabel: "रेस्तरां का नाम", cuisineLabel: "व्यंजन प्रकार", tagLabel: "संक्षिप्त टैगलाइन", emojiLabel: "आइकन (इमोजी)", createBtn: "रेस्तरां बनाएं", saveBtn: "सहेजें", addMenuItemBtn: "मेनू आइटम जोड़ें", editBtn: "संपादित करें", deleteBtn: "हटाएं", itemNameLabel: "आइटम का नाम", itemDescLabel: "विवरण", itemPriceLabel: "कीमत", spicyLabel: "तीखा के रूप में चिह्नित करें", previewStorefront: "ग्राहक के रूप में देखें", backToManage: "डैशबोर्ड पर वापस जाएं", editRestaurantInfo: "रेस्तरां जानकारी संपादित करें", menuEmptyTitle: "अभी तक कोई मेनू आइटम नहीं।", menuEmptySub: "शुरू करने के लिए अपना पहला व्यंजन जोड़ें।", editItemTitle: "आइटम संपादित करें", newItemTitle: "नया मेनू आइटम", customizeSize: "आकार", customizeSpice: "तीखेपन का स्तर", customizeAddOns: "अतिरिक्त सामग्री", customizeNotes: "विशेष निर्देश", customizeNotesPlaceholder: "जैसे धनिया नहीं, सॉस अलग से…", quantityLabel: "मात्रा", addToCartBtn: "कार्ट में जोड़ें", reviewsTitle: "समीक्षाएं", writeReviewBtn: "समीक्षा लिखें", yourNameLabel: "आपका नाम", ratingLabel: "रेटिंग", commentLabel: "टिप्पणी", submitReviewBtn: "समीक्षा सबमिट करें", noReviewsYet: "अभी तक कोई समीक्षा नहीं — पहले बनें!", currencyLabel: "मुद्रा", deliveryFeeLabel: "डिलीवरी शुल्क", uploadImageLabel: "फ़ोटो", notificationEmailSent: "पुष्टिकरण ईमेल भेजा गया:", notificationSmsSent: "एसएमएस भेजा गया:", listeningLabel: "सुन रहा है…", voiceErrorMic: "माइक्रोफ़ोन का एक्सेस अवरुद्ध कर दिया गया। ब्राउज़र सेटिंग्स में इसे अनुमति दें और फिर से प्रयास करें।", voiceErrorUnsupported: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है — Chrome या Edge आज़माएं।", voiceErrorHttps: "वॉइस इनपुट के लिए सुरक्षित (https) कनेक्शन आवश्यक है।", contactSectionTitle: "संपर्क जानकारी", noPhotoLabel: "कोई फ़ोटो नहीं", removeLabel: "हटाएं", callBtn: "रेस्तरां को कॉल करें", restaurantPhoneLabel: "रेस्तरां का फ़ोन नंबर", acceptedPaymentsLabel: "स्वीकृत भुगतान विधियाँ", paymentMethodLabel: "भुगतान विधि", cashOnDelivery: "डिलीवरी पर नकद भुगतान", cardOnline: "कार्ड / ऑनलाइन भुगतान", bankTransfer: "बैंक ट्रांसफर", bankTransferNote: "पुष्टि के बाद बैंक विवरण साझा किए जाएंगे।", jazzCashNote: "पुष्टि के बाद आपको JazzCash भुगतान अनुरोध प्राप्त होगा।", couponLabel: "कूपन कोड", applyCouponBtn: "लागू करें", discountLabel: "छूट", couponInvalid: "अमान्य या समाप्त कूपन कोड", couponApplied: "कूपन लागू हो गया!", colorThemeLabel: "एक्सेंट रंग", attachPhotoLabel: "फ़ोटो जोड़ें (वैकल्पिक)" },

  ru: { langName: "Русский", welcomeHeadline: "Добро пожаловать в " + BRAND_NAME, welcomeSub: "Расскажите нам, кто вы, чтобы мы всё настроили правильно.", customerCard: "Я покупатель", customerCardDesc: "Заказывайте еду из местных ресторанов", sellerCard: "Я владелец ресторана", sellerCardDesc: "Разместите свой ресторан и управляйте меню", emailLabel: "Электронная почта", phoneLabel: "Номер телефона", continueBtn: "Продолжить", languageLabel: "Язык", backBtn: "Назад", heroTitle: "Что бы вы хотели съесть?", heroSub: "Скажите, напишите или просмотрите ниже — я оформлю заказ за вас.", cuisineAll: "Все", yourOrder: "Ваш заказ", cartEmptyTitle: "Ваша корзина пуста.", subtotal: "Промежуточный итог", delivery: "Доставка", total: "Итого", checkoutBtn: "Оформить заказ", orderPlacedTitle: "Заказ оформлен 🎉", doneBtn: "Готово", settingsTitle: "Настройки", themeLabel: "Тема", lightLabel: "Светлая", darkLabel: "Тёмная", addToCartBtn: "Добавить в корзину", reviewsTitle: "Отзывы", writeReviewBtn: "Написать отзыв" },
  ko: { langName: "한국어", welcomeHeadline: BRAND_NAME + "에 오신 것을 환영합니다", welcomeSub: "올바르게 설정할 수 있도록 당신에 대해 알려주세요.", customerCard: "저는 고객이에요", customerCardDesc: "지역 레스토랑에서 음식을 주문하세요", sellerCard: "저는 레스토랑 사장이에요", sellerCardDesc: "레스토랑을 등록하고 메뉴를 관리하세요", emailLabel: "이메일 주소", phoneLabel: "전화번호", continueBtn: "계속", languageLabel: "언어", backBtn: "뒤로", heroTitle: "무엇을 드시고 싶으세요?", heroSub: "말하거나 입력하거나 아래에서 둘러보세요 — 주문을 도와드릴게요.", cuisineAll: "전체", yourOrder: "주문 내역", cartEmptyTitle: "장바구니가 비어 있어요.", subtotal: "소계", delivery: "배달료", total: "합계", checkoutBtn: "결제하기", orderPlacedTitle: "주문이 완료되었습니다 🎉", doneBtn: "완료", settingsTitle: "설정", themeLabel: "테마", lightLabel: "라이트", darkLabel: "다크", addToCartBtn: "장바구니에 담기", reviewsTitle: "리뷰", writeReviewBtn: "리뷰 작성" },
  vi: { langName: "Tiếng Việt", welcomeHeadline: "Chào mừng đến với " + BRAND_NAME, welcomeSub: "Hãy cho chúng tôi biết bạn là ai để thiết lập mọi thứ chính xác.", customerCard: "Tôi là khách hàng", customerCardDesc: "Đặt món từ các nhà hàng địa phương", sellerCard: "Tôi là chủ nhà hàng", sellerCardDesc: "Đăng nhà hàng của bạn và quản lý thực đơn", emailLabel: "Địa chỉ email", phoneLabel: "Số điện thoại", continueBtn: "Tiếp tục", languageLabel: "Ngôn ngữ", backBtn: "Quay lại", heroTitle: "Bạn muốn ăn gì?", heroSub: "Nói ra, gõ vào, hoặc duyệt bên dưới — tôi sẽ giúp bạn lên đơn.", cuisineAll: "Tất cả", yourOrder: "Đơn hàng của bạn", cartEmptyTitle: "Giỏ hàng của bạn đang trống.", subtotal: "Tạm tính", delivery: "Phí giao hàng", total: "Tổng cộng", checkoutBtn: "Thanh toán", orderPlacedTitle: "Đã đặt hàng 🎉", doneBtn: "Xong", settingsTitle: "Cài đặt", themeLabel: "Giao diện", lightLabel: "Sáng", darkLabel: "Tối", addToCartBtn: "Thêm vào giỏ", reviewsTitle: "Đánh giá", writeReviewBtn: "Viết đánh giá" },
  th: { langName: "ไทย", welcomeHeadline: "ยินดีต้อนรับสู่ " + BRAND_NAME, welcomeSub: "บอกเราว่าคุณเป็นใครเพื่อให้เราตั้งค่าได้ถูกต้อง", customerCard: "ฉันเป็นลูกค้า", customerCardDesc: "สั่งอาหารจากร้านอาหารในพื้นที่", sellerCard: "ฉันเป็นเจ้าของร้านอาหาร", sellerCardDesc: "ลงทะเบียนร้านของคุณและจัดการเมนู", emailLabel: "อีเมล", phoneLabel: "หมายเลขโทรศัพท์", continueBtn: "ดำเนินการต่อ", languageLabel: "ภาษา", backBtn: "ย้อนกลับ", heroTitle: "วันนี้อยากกินอะไร?", heroSub: "พูด พิมพ์ หรือเลื่อนดูด้านล่าง — ฉันจะจัดออเดอร์ให้คุณ", cuisineAll: "ทั้งหมด", yourOrder: "คำสั่งซื้อของคุณ", cartEmptyTitle: "ตะกร้าของคุณว่างเปล่า", subtotal: "ยอดรวมย่อย", delivery: "ค่าจัดส่ง", total: "ยอดรวม", checkoutBtn: "ชำระเงิน", orderPlacedTitle: "สั่งซื้อสำเร็จ 🎉", doneBtn: "เสร็จสิ้น", settingsTitle: "การตั้งค่า", themeLabel: "ธีม", lightLabel: "สว่าง", darkLabel: "มืด", addToCartBtn: "เพิ่มลงตะกร้า", reviewsTitle: "รีวิว", writeReviewBtn: "เขียนรีวิว" },
  id: { langName: "Bahasa Indonesia", welcomeHeadline: "Selamat datang di " + BRAND_NAME, welcomeSub: "Beri tahu kami siapa Anda agar kami bisa mengatur semuanya dengan tepat.", customerCard: "Saya pelanggan", customerCardDesc: "Pesan makanan dari restoran lokal", sellerCard: "Saya pemilik restoran", sellerCardDesc: "Daftarkan restoran Anda dan kelola menu", emailLabel: "Alamat email", phoneLabel: "Nomor telepon", continueBtn: "Lanjutkan", languageLabel: "Bahasa", backBtn: "Kembali", heroTitle: "Lagi pengen makan apa?", heroSub: "Ucapkan, ketik, atau jelajahi di bawah — saya akan menyiapkan pesanan Anda.", cuisineAll: "Semua", yourOrder: "Pesanan Anda", cartEmptyTitle: "Keranjang Anda kosong.", subtotal: "Subtotal", delivery: "Ongkos kirim", total: "Total", checkoutBtn: "Checkout", orderPlacedTitle: "Pesanan berhasil dibuat 🎉", doneBtn: "Selesai", settingsTitle: "Pengaturan", themeLabel: "Tema", lightLabel: "Terang", darkLabel: "Gelap", addToCartBtn: "Tambah ke keranjang", reviewsTitle: "Ulasan", writeReviewBtn: "Tulis ulasan" },
  tr: { langName: "Türkçe", welcomeHeadline: BRAND_NAME + "'ya hoş geldiniz", welcomeSub: "Her şeyi doğru ayarlayabilmemiz için kim olduğunuzu bize söyleyin.", customerCard: "Bir müşteriyim", customerCardDesc: "Yerel restoranlardan yemek sipariş edin", sellerCard: "Bir restoran sahibiyim", sellerCardDesc: "Restoranınızı listeleyin ve menünüzü yönetin", emailLabel: "E-posta adresi", phoneLabel: "Telefon numarası", continueBtn: "Devam et", languageLabel: "Dil", backBtn: "Geri", heroTitle: "Ne yemek istersiniz?", heroSub: "Söyleyin, yazın veya aşağıdan göz atın — siparişinizi ben hazırlayayım.", cuisineAll: "Tümü", yourOrder: "Siparişiniz", cartEmptyTitle: "Sepetiniz boş.", subtotal: "Ara toplam", delivery: "Teslimat", total: "Toplam", checkoutBtn: "Ödeme", orderPlacedTitle: "Sipariş verildi 🎉", doneBtn: "Bitti", settingsTitle: "Ayarlar", themeLabel: "Tema", lightLabel: "Açık", darkLabel: "Koyu", addToCartBtn: "Sepete ekle", reviewsTitle: "Değerlendirmeler", writeReviewBtn: "Değerlendirme yaz" },
  pl: { langName: "Polski", welcomeHeadline: "Witamy w " + BRAND_NAME, welcomeSub: "Powiedz nam, kim jesteś, abyśmy mogli wszystko poprawnie skonfigurować.", customerCard: "Jestem klientem", customerCardDesc: "Zamawiaj jedzenie z lokalnych restauracji", sellerCard: "Jestem właścicielem restauracji", sellerCardDesc: "Dodaj swoją restaurację i zarządzaj menu", emailLabel: "Adres e-mail", phoneLabel: "Numer telefonu", continueBtn: "Kontynuuj", languageLabel: "Język", backBtn: "Wstecz", heroTitle: "Na co masz ochotę?", heroSub: "Powiedz, napisz lub przeglądaj poniżej — przygotuję za Ciebie zamówienie.", cuisineAll: "Wszystkie", yourOrder: "Twoje zamówienie", cartEmptyTitle: "Twój koszyk jest pusty.", subtotal: "Suma częściowa", delivery: "Dostawa", total: "Razem", checkoutBtn: "Zamów", orderPlacedTitle: "Zamówienie złożone 🎉", doneBtn: "Gotowe", settingsTitle: "Ustawienia", themeLabel: "Motyw", lightLabel: "Jasny", darkLabel: "Ciemny", addToCartBtn: "Dodaj do koszyka", reviewsTitle: "Opinie", writeReviewBtn: "Napisz opinię" },
  nl: { langName: "Nederlands", welcomeHeadline: "Welkom bij " + BRAND_NAME, welcomeSub: "Vertel ons wie je bent, zodat we alles goed kunnen instellen.", customerCard: "Ik ben een klant", customerCardDesc: "Bestel eten bij lokale restaurants", sellerCard: "Ik ben een restauranteigenaar", sellerCardDesc: "Plaats je restaurant en beheer je menu", emailLabel: "E-mailadres", phoneLabel: "Telefoonnummer", continueBtn: "Doorgaan", languageLabel: "Taal", backBtn: "Terug", heroTitle: "Waar heb je zin in?", heroSub: "Zeg het, typ het, of blader hieronder — ik stel de bestelling voor je samen.", cuisineAll: "Alle", yourOrder: "Jouw bestelling", cartEmptyTitle: "Je winkelwagen is leeg.", subtotal: "Subtotaal", delivery: "Bezorging", total: "Totaal", checkoutBtn: "Afrekenen", orderPlacedTitle: "Bestelling geplaatst 🎉", doneBtn: "Klaar", settingsTitle: "Instellingen", themeLabel: "Thema", lightLabel: "Licht", darkLabel: "Donker", addToCartBtn: "Toevoegen aan winkelwagen", reviewsTitle: "Recensies", writeReviewBtn: "Schrijf een recensie" },
  sv: { langName: "Svenska", welcomeHeadline: "Välkommen till " + BRAND_NAME, welcomeSub: "Berätta vem du är så att vi kan ställa in allt rätt.", customerCard: "Jag är en kund", customerCardDesc: "Beställ mat från lokala restauranger", sellerCard: "Jag är en restaurangägare", sellerCardDesc: "Lista din restaurang och hantera din meny", emailLabel: "E-postadress", phoneLabel: "Telefonnummer", continueBtn: "Fortsätt", languageLabel: "Språk", backBtn: "Tillbaka", heroTitle: "Vad har du sug på?", heroSub: "Säg det, skriv det, eller bläddra nedan — jag ordnar beställningen åt dig.", cuisineAll: "Alla", yourOrder: "Din beställning", cartEmptyTitle: "Din varukorg är tom.", subtotal: "Delsumma", delivery: "Leverans", total: "Totalt", checkoutBtn: "Till kassan", orderPlacedTitle: "Beställning skickad 🎉", doneBtn: "Klar", settingsTitle: "Inställningar", themeLabel: "Tema", lightLabel: "Ljust", darkLabel: "Mörkt", addToCartBtn: "Lägg i varukorgen", reviewsTitle: "Recensioner", writeReviewBtn: "Skriv en recension" },
  da: { langName: "Dansk", welcomeHeadline: "Velkommen til " + BRAND_NAME, welcomeSub: "Fortæl os hvem du er, så vi kan indstille alt korrekt.", customerCard: "Jeg er en kunde", customerCardDesc: "Bestil mad fra lokale restauranter", sellerCard: "Jeg er restaurantejer", sellerCardDesc: "Registrer din restaurant og administrer din menu", emailLabel: "E-mailadresse", phoneLabel: "Telefonnummer", continueBtn: "Fortsæt", languageLabel: "Sprog", backBtn: "Tilbage", heroTitle: "Hvad har du lyst til at spise?", heroSub: "Sig det, skriv det, eller browse nedenfor — jeg klarer bestillingen for dig.", cuisineAll: "Alle", yourOrder: "Din bestilling", cartEmptyTitle: "Din kurv er tom.", subtotal: "Subtotal", delivery: "Levering", total: "I alt", checkoutBtn: "Til kassen", orderPlacedTitle: "Bestilling afgivet 🎉", doneBtn: "Færdig", settingsTitle: "Indstillinger", themeLabel: "Tema", lightLabel: "Lyst", darkLabel: "Mørkt", addToCartBtn: "Læg i kurv", reviewsTitle: "Anmeldelser", writeReviewBtn: "Skriv en anmeldelse" },
  nb: { langName: "Norsk", welcomeHeadline: "Velkommen til " + BRAND_NAME, welcomeSub: "Fortell oss hvem du er, så vi kan sette opp alt riktig.", customerCard: "Jeg er en kunde", customerCardDesc: "Bestill mat fra lokale restauranter", sellerCard: "Jeg er en restauranteier", sellerCardDesc: "Registrer restauranten din og administrer menyen", emailLabel: "E-postadresse", phoneLabel: "Telefonnummer", continueBtn: "Fortsett", languageLabel: "Språk", backBtn: "Tilbake", heroTitle: "Hva har du lyst på?", heroSub: "Si det, skriv det, eller bla nedenfor — jeg fikser bestillingen for deg.", cuisineAll: "Alle", yourOrder: "Din bestilling", cartEmptyTitle: "Handlekurven din er tom.", subtotal: "Delsum", delivery: "Levering", total: "Totalt", checkoutBtn: "Til kassen", orderPlacedTitle: "Bestilling sendt 🎉", doneBtn: "Ferdig", settingsTitle: "Innstillinger", themeLabel: "Tema", lightLabel: "Lyst", darkLabel: "Mørkt", addToCartBtn: "Legg i handlekurv", reviewsTitle: "Anmeldelser", writeReviewBtn: "Skriv en anmeldelse" },
  fi: { langName: "Suomi", welcomeHeadline: "Tervetuloa " + BRAND_NAME + ":hon", welcomeSub: "Kerro meille, kuka olet, jotta voimme asettaa kaiken oikein.", customerCard: "Olen asiakas", customerCardDesc: "Tilaa ruokaa paikallisista ravintoloista", sellerCard: "Olen ravintolan omistaja", sellerCardDesc: "Listaa ravintolasi ja hallinnoi menuasi", emailLabel: "Sähköpostiosoite", phoneLabel: "Puhelinnumero", continueBtn: "Jatka", languageLabel: "Kieli", backBtn: "Takaisin", heroTitle: "Mitä sinulla on nälkä?", heroSub: "Sano se, kirjoita se, tai selaa alta — kokoan tilauksen puolestasi.", cuisineAll: "Kaikki", yourOrder: "Tilauksesi", cartEmptyTitle: "Ostoskorisi on tyhjä.", subtotal: "Välisumma", delivery: "Toimitus", total: "Yhteensä", checkoutBtn: "Kassalle", orderPlacedTitle: "Tilaus lähetetty 🎉", doneBtn: "Valmis", settingsTitle: "Asetukset", themeLabel: "Teema", lightLabel: "Vaalea", darkLabel: "Tumma", addToCartBtn: "Lisää koriin", reviewsTitle: "Arvostelut", writeReviewBtn: "Kirjoita arvostelu" },
  el: { langName: "Ελληνικά", welcomeHeadline: "Καλώς ήρθατε στο " + BRAND_NAME, welcomeSub: "Πείτε μας ποιοι είστε ώστε να ρυθμίσουμε τα πάντα σωστά.", customerCard: "Είμαι πελάτης", customerCardDesc: "Παραγγείλτε φαγητό από τοπικά εστιατόρια", sellerCard: "Είμαι ιδιοκτήτης εστιατορίου", sellerCardDesc: "Καταχωρίστε το εστιατόριό σας και διαχειριστείτε το μενού", emailLabel: "Διεύθυνση email", phoneLabel: "Αριθμός τηλεφώνου", continueBtn: "Συνέχεια", languageLabel: "Γλώσσα", backBtn: "Πίσω", heroTitle: "Τι σας αρέσει να φάτε;", heroSub: "Πείτε το, γράψτε το, ή περιηγηθείτε παρακάτω — θα ετοιμάσω την παραγγελία για εσάς.", cuisineAll: "Όλα", yourOrder: "Η παραγγελία σας", cartEmptyTitle: "Το καλάθι σας είναι άδειο.", subtotal: "Μερικό σύνολο", delivery: "Παράδοση", total: "Σύνολο", checkoutBtn: "Ολοκλήρωση παραγγελίας", orderPlacedTitle: "Η παραγγελία καταχωρήθηκε 🎉", doneBtn: "Τέλος", settingsTitle: "Ρυθμίσεις", themeLabel: "Θέμα", lightLabel: "Ανοιχτόχρωμο", darkLabel: "Σκούρο", addToCartBtn: "Προσθήκη στο καλάθι", reviewsTitle: "Κριτικές", writeReviewBtn: "Γράψτε μια κριτική" },
  he: { langName: "עברית", welcomeHeadline: "ברוכים הבאים ל-" + BRAND_NAME, welcomeSub: "ספרו לנו מי אתם כדי שנוכל להגדיר הכול נכון.", customerCard: "אני לקוח", customerCardDesc: "הזמינו אוכל ממסעדות מקומיות", sellerCard: "אני בעל מסעדה", sellerCardDesc: "פרסמו את המסעדה שלכם ונהלו את התפריט", emailLabel: "כתובת אימייל", phoneLabel: "מספר טלפון", continueBtn: "המשך", languageLabel: "שפה", backBtn: "חזרה", heroTitle: "למה מתחשק לכם?", heroSub: "תגידו את זה, תקלידו את זה, או דפדפו למטה — אני אבנה את ההזמנה עבורכם.", cuisineAll: "הכול", yourOrder: "ההזמנה שלך", cartEmptyTitle: "העגלה שלך ריקה.", subtotal: "סכום ביניים", delivery: "משלוח", total: "סה״כ", checkoutBtn: "לתשלום", orderPlacedTitle: "ההזמנה בוצעה 🎉", doneBtn: "סיום", settingsTitle: "הגדרות", themeLabel: "ערכת נושא", lightLabel: "בהיר", darkLabel: "כהה", addToCartBtn: "הוספה לעגלה", reviewsTitle: "ביקורות", writeReviewBtn: "כתיבת ביקורת" },
  uk: { langName: "Українська", welcomeHeadline: "Ласкаво просимо до " + BRAND_NAME, welcomeSub: "Розкажіть нам, хто ви, щоб ми все налаштували правильно.", customerCard: "Я покупець", customerCardDesc: "Замовляйте їжу з місцевих ресторанів", sellerCard: "Я власник ресторану", sellerCardDesc: "Додайте свій ресторан і керуйте меню", emailLabel: "Електронна пошта", phoneLabel: "Номер телефону", continueBtn: "Продовжити", languageLabel: "Мова", backBtn: "Назад", heroTitle: "Чого б вам хотілося поїсти?", heroSub: "Скажіть, напишіть або перегляньте нижче — я підготую замовлення за вас.", cuisineAll: "Усі", yourOrder: "Ваше замовлення", cartEmptyTitle: "Ваш кошик порожній.", subtotal: "Проміжний підсумок", delivery: "Доставка", total: "Разом", checkoutBtn: "Оформити замовлення", orderPlacedTitle: "Замовлення оформлено 🎉", doneBtn: "Готово", settingsTitle: "Налаштування", themeLabel: "Тема", lightLabel: "Світла", darkLabel: "Темна", addToCartBtn: "Додати в кошик", reviewsTitle: "Відгуки", writeReviewBtn: "Написати відгук" },
  ro: { langName: "Română", welcomeHeadline: "Bun venit la " + BRAND_NAME, welcomeSub: "Spuneți-ne cine sunteți pentru a configura totul corect.", customerCard: "Sunt client", customerCardDesc: "Comandă mâncare de la restaurante locale", sellerCard: "Sunt proprietar de restaurant", sellerCardDesc: "Listați restaurantul dvs. și gestionați meniul", emailLabel: "Adresă de email", phoneLabel: "Număr de telefon", continueBtn: "Continuă", languageLabel: "Limbă", backBtn: "Înapoi", heroTitle: "Ce v-ar plăcea să mâncați?", heroSub: "Spuneți, scrieți, sau răsfoiți mai jos — vă pregătesc comanda.", cuisineAll: "Toate", yourOrder: "Comanda dvs.", cartEmptyTitle: "Coșul dvs. este gol.", subtotal: "Subtotal", delivery: "Livrare", total: "Total", checkoutBtn: "Finalizează comanda", orderPlacedTitle: "Comandă plasată 🎉", doneBtn: "Gata", settingsTitle: "Setări", themeLabel: "Temă", lightLabel: "Luminoasă", darkLabel: "Întunecată", addToCartBtn: "Adaugă în coș", reviewsTitle: "Recenzii", writeReviewBtn: "Scrie o recenzie" },
  cs: { langName: "Čeština", welcomeHeadline: "Vítejte v " + BRAND_NAME, welcomeSub: "Řekněte nám, kdo jste, abychom vše správně nastavili.", customerCard: "Jsem zákazník", customerCardDesc: "Objednejte si jídlo z místních restaurací", sellerCard: "Jsem majitel restaurace", sellerCardDesc: "Zaregistrujte svou restauraci a spravujte jídelní lístek", emailLabel: "E-mailová adresa", phoneLabel: "Telefonní číslo", continueBtn: "Pokračovat", languageLabel: "Jazyk", backBtn: "Zpět", heroTitle: "Na co máte chuť?", heroSub: "Řekněte to, napište to, nebo procházejte níže — objednávku připravím za vás.", cuisineAll: "Vše", yourOrder: "Vaše objednávka", cartEmptyTitle: "Váš košík je prázdný.", subtotal: "Mezisoučet", delivery: "Doprava", total: "Celkem", checkoutBtn: "K pokladně", orderPlacedTitle: "Objednávka odeslána 🎉", doneBtn: "Hotovo", settingsTitle: "Nastavení", themeLabel: "Motiv", lightLabel: "Světlý", darkLabel: "Tmavý", addToCartBtn: "Přidat do košíku", reviewsTitle: "Recenze", writeReviewBtn: "Napsat recenzi" },
  hu: { langName: "Magyar", welcomeHeadline: "Üdvözlünk a(z) " + BRAND_NAME + "-nál", welcomeSub: "Mondd el, ki vagy, hogy mindent jól tudjunk beállítani.", customerCard: "Vendég vagyok", customerCardDesc: "Rendelj ételt helyi éttermekből", sellerCard: "Étterem tulajdonos vagyok", sellerCardDesc: "Regisztráld éttermedet és kezeld az étlapot", emailLabel: "E-mail cím", phoneLabel: "Telefonszám", continueBtn: "Tovább", languageLabel: "Nyelv", backBtn: "Vissza", heroTitle: "Mire van kedved?", heroSub: "Mondd el, írd le, vagy nézz körül lent — összeállítom a rendelésed.", cuisineAll: "Összes", yourOrder: "A rendelésed", cartEmptyTitle: "A kosarad üres.", subtotal: "Részösszeg", delivery: "Kiszállítás", total: "Összesen", checkoutBtn: "Fizetés", orderPlacedTitle: "Rendelés leadva 🎉", doneBtn: "Kész", settingsTitle: "Beállítások", themeLabel: "Téma", lightLabel: "Világos", darkLabel: "Sötét", addToCartBtn: "Kosárba", reviewsTitle: "Vélemények", writeReviewBtn: "Vélemény írása" },
  ms: { langName: "Bahasa Melayu", welcomeHeadline: "Selamat datang ke " + BRAND_NAME, welcomeSub: "Beritahu kami siapa anda supaya kami boleh menyediakan semuanya dengan betul.", customerCard: "Saya pelanggan", customerCardDesc: "Pesan makanan daripada restoran tempatan", sellerCard: "Saya pemilik restoran", sellerCardDesc: "Senaraikan restoran anda dan urus menu", emailLabel: "Alamat e-mel", phoneLabel: "Nombor telefon", continueBtn: "Teruskan", languageLabel: "Bahasa", backBtn: "Kembali", heroTitle: "Apa yang anda ingin makan?", heroSub: "Sebutkan, taipkan, atau layari di bawah — saya akan sediakan pesanan anda.", cuisineAll: "Semua", yourOrder: "Pesanan anda", cartEmptyTitle: "Troli anda kosong.", subtotal: "Jumlah kecil", delivery: "Penghantaran", total: "Jumlah", checkoutBtn: "Daftar keluar", orderPlacedTitle: "Pesanan dibuat 🎉", doneBtn: "Selesai", settingsTitle: "Tetapan", themeLabel: "Tema", lightLabel: "Terang", darkLabel: "Gelap", addToCartBtn: "Tambah ke troli", reviewsTitle: "Ulasan", writeReviewBtn: "Tulis ulasan" },
  bn: { langName: "বাংলা", welcomeHeadline: BRAND_NAME + "-তে স্বাগতম", welcomeSub: "আপনি কে তা আমাদের বলুন যাতে আমরা সবকিছু সঠিকভাবে সেট করতে পারি।", customerCard: "আমি একজন গ্রাহক", customerCardDesc: "স্থানীয় রেস্তোরাঁ থেকে খাবার অর্ডার করুন", sellerCard: "আমি একজন রেস্তোরাঁ মালিক", sellerCardDesc: "আপনার রেস্তোরাঁ তালিকাভুক্ত করুন এবং মেনু পরিচালনা করুন", emailLabel: "ইমেইল ঠিকানা", phoneLabel: "ফোন নম্বর", continueBtn: "চালিয়ে যান", languageLabel: "ভাষা", backBtn: "ফিরে যান", heroTitle: "আপনার কী খেতে ইচ্ছে করছে?", heroSub: "বলুন, টাইপ করুন, অথবা নিচে ব্রাউজ করুন — আমি আপনার অর্ডার তৈরি করে দেব।", cuisineAll: "সব", yourOrder: "আপনার অর্ডার", cartEmptyTitle: "আপনার কার্ট খালি।", subtotal: "উপ-মোট", delivery: "ডেলিভারি", total: "মোট", checkoutBtn: "চেকআউট", orderPlacedTitle: "অর্ডার সম্পন্ন হয়েছে 🎉", doneBtn: "সম্পন্ন", settingsTitle: "সেটিংস", themeLabel: "থিম", lightLabel: "লাইট", darkLabel: "ডার্ক", addToCartBtn: "কার্টে যোগ করুন", reviewsTitle: "রিভিউ", writeReviewBtn: "রিভিউ লিখুন" },
};

const LANG_NAMES_FOR_AI = {
  en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian", pt: "Portuguese", zh: "Chinese",
  ja: "Japanese", ar: "Arabic", hi: "Hindi", ru: "Russian", ko: "Korean", vi: "Vietnamese", th: "Thai",
  id: "Indonesian", tr: "Turkish", pl: "Polish", nl: "Dutch", sv: "Swedish", da: "Danish", nb: "Norwegian",
  fi: "Finnish", el: "Greek", he: "Hebrew", uk: "Ukrainian", ro: "Romanian", cs: "Czech", hu: "Hungarian",
  ms: "Malay", bn: "Bengali",
};

const SEED_RESTAURANTS = [
  {
    id: "r1", name: "Maren's Noodle House", cuisine: "Vietnamese", rating: 4.8, time: "20-30 min", emoji: "🍜", tag: "Broth & noodles",
    currency: "USD", deliveryFee: 2.99, phone: "+1 415 555 0132", paymentMethods: ["cod", "card"],
    reviews: [
      { id: "sr1", name: "Alicia", rating: 5, comment: "Best pho in town, broth is incredible.", date: "2 weeks ago" },
      { id: "sr2", name: "Marcus", rating: 4, comment: "Great flavor, delivery took a bit longer than expected.", date: "1 month ago" },
    ],
    menu: [
      { id: "m1", name: "Pho Bo", desc: "Slow beef broth, rice noodles, herbs", price: 13.5, emoji: "🍜", spicy: true, sizes: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 3 }], addOns: [{ label: "Extra beef", price: 3 }, { label: "Extra noodles", price: 1.5 }, { label: "Bean sprouts", price: 0 }] },
      { id: "m2", name: "Bun Cha", desc: "Grilled pork, vermicelli, nuoc cham", price: 14, emoji: "🥢", addOns: [{ label: "Extra pork", price: 3 }, { label: "Extra herbs", price: 0 }] },
      { id: "m3", name: "Fresh Spring Rolls", desc: "Shrimp, herbs, rice paper", price: 8, emoji: "🌯", addOns: [{ label: "Peanut sauce", price: 0.5 }] },
      { id: "m4", name: "Vietnamese Iced Coffee", desc: "Condensed milk, dark roast", price: 4.5, emoji: "☕", sizes: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 1 }] },
    ],
  },
  {
    id: "r2", name: "Corner Slice", cuisine: "Pizza", rating: 4.6, time: "25-35 min", emoji: "🍕", tag: "Wood-fired",
    currency: "EUR", deliveryFee: 2.5, phone: "+39 06 5555 0142", paymentMethods: ["card", "bank"],
    reviews: [{ id: "sr3", name: "Giulia", rating: 5, comment: "Margherita tastes like Naples. So good.", date: "3 days ago" }],
    menu: [
      { id: "m5", name: "Margherita", desc: "San Marzano, fior di latte, basil", price: 16, emoji: "🍕", sizes: [{ label: "10\"", delta: 0 }, { label: "14\"", delta: 5 }], addOns: [{ label: "Extra cheese", price: 2 }, { label: "Fresh basil", price: 1 }] },
      { id: "m6", name: "Spicy Soppressata", desc: "Chili honey, calabrian peppers", price: 19, emoji: "🌶️", spicy: true, sizes: [{ label: "10\"", delta: 0 }, { label: "14\"", delta: 5 }], addOns: [{ label: "Extra chili honey", price: 1 }] },
      { id: "m7", name: "Garlic Knots", desc: "Six knots, parmesan, herb oil", price: 7, emoji: "🥖", addOns: [{ label: "Extra marinara", price: 1 }] },
      { id: "m8", name: "Caesar Salad", desc: "Little gem, anchovy, sourdough croutons", price: 10, emoji: "🥗", addOns: [{ label: "Add chicken", price: 4 }, { label: "No anchovy", price: 0 }] },
    ],
  },
  {
    id: "r3", name: "Basil & Bone", cuisine: "Thai", rating: 4.7, time: "20-30 min", emoji: "🌶️", tag: "Curry & spice",
    currency: "THB", deliveryFee: 40, phone: "+66 2 555 0198", paymentMethods: ["cod", "card"],
    menu: [
      { id: "m9", name: "Green Curry", desc: "Chicken, eggplant, thai basil", price: 15, emoji: "🍛", spicy: true, addOns: [{ label: "Extra rice", price: 2 }, { label: "Extra chicken", price: 3 }] },
      { id: "m10", name: "Pad Thai", desc: "Shrimp, tamarind, peanuts", price: 14, emoji: "🍤", spicy: true, addOns: [{ label: "Extra shrimp", price: 3 }, { label: "Crushed peanuts", price: 0.5 }] },
      { id: "m11", name: "Mango Sticky Rice", desc: "Coconut cream, toasted sesame", price: 8, emoji: "🥭" },
      { id: "m12", name: "Tom Yum Soup", desc: "Lemongrass, chili, mushrooms", price: 9, emoji: "🍲", spicy: true },
    ],
  },
  {
    id: "r4", name: "Field & Flame", cuisine: "American", rating: 4.5, time: "15-25 min", emoji: "🍔", tag: "Smokehouse",
    currency: "USD", deliveryFee: 3.5, phone: "+1 312 555 0110", paymentMethods: ["cod", "card"],
    menu: [
      { id: "m13", name: "Smash Burger", desc: "Double patty, american cheese, pickles", price: 13, emoji: "🍔", addOns: [{ label: "Extra patty", price: 3.5 }, { label: "Bacon", price: 2 }, { label: "No pickles", price: 0 }] },
      { id: "m14", name: "Brisket Sandwich", desc: "12hr smoked, slaw, brioche", price: 15, emoji: "🥪", addOns: [{ label: "Extra brisket", price: 4 }] },
      { id: "m15", name: "Loaded Fries", desc: "Cheese curds, gravy, scallion", price: 8, emoji: "🍟", sizes: [{ label: "Regular", delta: 0 }, { label: "Sharing", delta: 4 }] },
      { id: "m16", name: "Milkshake", desc: "Vanilla bean, whipped cream", price: 6, emoji: "🥤", sizes: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 2 }] },
    ],
  },
  {
    id: "r5", name: "Ochre Table", cuisine: "Indian", rating: 4.9, time: "25-35 min", emoji: "🍛", tag: "Slow-cooked",
    currency: "INR", deliveryFee: 49, phone: "+92 21 555 0176", paymentMethods: ["cod", "jazzcash", "bank"],
    reviews: [{ id: "sr4", name: "Priya", rating: 5, comment: "Butter chicken is unbeatable, always fresh and hot.", date: "5 days ago" }],
    menu: [
      { id: "m17", name: "Butter Chicken", desc: "Tomato cream, fenugreek, rice", price: 16, emoji: "🍛", spicy: true, addOns: [{ label: "Extra rice", price: 2 }, { label: "Extra sauce", price: 1.5 }] },
      { id: "m18", name: "Saag Paneer", desc: "Spinach, garlic, cottage cheese", price: 13, emoji: "🥬", spicy: true },
      { id: "m19", name: "Garlic Naan", desc: "Tandoor-baked, ghee brushed", price: 4, emoji: "🫓", addOns: [{ label: "Extra ghee", price: 0.5 }] },
      { id: "m20", name: "Mango Lassi", desc: "Yogurt, cardamom", price: 5, emoji: "🥭", sizes: [{ label: "Regular", delta: 0 }, { label: "Large", delta: 1.5 }] },
    ],
  },
  {
    id: "r6", name: "Salt & Citron", cuisine: "Mediterranean", rating: 4.7, time: "20-30 min", emoji: "🥙", tag: "Grill & mezze",
    currency: "USD", deliveryFee: 2.99, phone: "+1 646 555 0155", paymentMethods: ["cod", "card"],
    menu: [
      { id: "m21", name: "Lamb Kebab Plate", desc: "Charred lamb, tahini, pickles", price: 17, emoji: "🍖", spicy: true, addOns: [{ label: "Extra tahini", price: 1 }, { label: "Extra lamb", price: 4 }] },
      { id: "m22", name: "Falafel Wrap", desc: "Crispy falafel, herb yogurt", price: 11, emoji: "🥙", addOns: [{ label: "Extra falafel", price: 2 }] },
      { id: "m23", name: "Hummus & Pita", desc: "Olive oil, za'atar, warm pita", price: 8, emoji: "🫓", addOns: [{ label: "Extra pita", price: 1.5 }] },
      { id: "m24", name: "Baklava", desc: "Pistachio, honey syrup", price: 6, emoji: "🍯" },
    ],
  },
];

const SPICE_LEVELS = ["Mild", "Medium", "Hot"];

function findItem(itemId, restaurantList) {
  for (const r of restaurantList) {
    const item = r.menu.find((m) => m.id === itemId);
    if (item) return { restaurant: r, item };
  }
  return null;
}

function lineUnitPrice(item, options) {
  let price = item.price;
  if (options.size) {
    const sizeDef = (item.sizes || []).find((s) => s.label === options.size);
    if (sizeDef) price += sizeDef.delta;
  }
  (options.addOns || []).forEach((label) => {
    const addOnDef = (item.addOns || []).find((a) => a.label === label);
    if (addOnDef) price += addOnDef.price;
  });
  return price;
}

function summarizeOptions(options) {
  const parts = [];
  if (options.size) parts.push(options.size);
  if (options.spice) parts.push(`${options.spice} spice`);
  if (options.addOns && options.addOns.length) parts.push(options.addOns.join(", "));
  if (options.notes) parts.push(`"${options.notes}"`);
  return parts.join(" · ");
}

function Thumb({ item, size = 48, colors }) {
  return (
    <div className="rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden" style={{ width: size, height: size, background: colors.bg }}>
      {item.image ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : item.emoji}
    </div>
  );
}

function StarPicker({ value, onChange, size = 18 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={size} style={{ color: "#E3B23C", fill: n <= value ? "#E3B23C" : "none" }} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Customize modal (customer side) ---------- */
function CustomizeModal({ item, restaurantId, currency, onClose, onConfirm, colors, t }) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(item.sizes ? item.sizes[0].label : null);
  const [spice, setSpice] = useState(item.spicy ? "Medium" : null);
  const [addOns, setAddOns] = useState([]);
  const [notes, setNotes] = useState("");

  const options = { size, spice, addOns, notes: notes.trim() };
  const unit = lineUnitPrice(item, options);

  const toggleAddOn = (label) => {
    setAddOns((prev) => (prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" style={{ background: colors.surface, color: colors.ink }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Thumb item={item} colors={colors} />
            <div>
              <div className="fraunces text-xl">{item.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(127,127,127,0.9)" }}>{item.desc}</div>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 p-1"><X size={20} /></button>
        </div>

        {item.sizes && (
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">{t("customizeSize")}</div>
            <div className="flex gap-2 flex-wrap">
              {item.sizes.map((s) => (
                <button key={s.label} onClick={() => setSize(s.label)} className="px-3 py-1.5 rounded-full text-sm"
                  style={{ background: size === s.label ? colors.ink : "transparent", color: size === s.label ? colors.cream : colors.ink, border: `1px solid ${colors.line}` }}>
                  {s.label}{s.delta > 0 ? ` (+${formatPrice(s.delta, currency)})` : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.spicy && (
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">{t("customizeSpice")}</div>
            <div className="flex gap-2 flex-wrap">
              {SPICE_LEVELS.map((lvl) => (
                <button key={lvl} onClick={() => setSpice(lvl)} className="px-3 py-1.5 rounded-full text-sm"
                  style={{ background: spice === lvl ? colors.accent : "transparent", color: spice === lvl ? "white" : colors.ink, border: `1px solid ${colors.line}` }}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.addOns && item.addOns.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">{t("customizeAddOns")}</div>
            <div className="grid gap-2">
              {item.addOns.map((a) => (
                <label key={a.label} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ border: `1px solid ${colors.line}` }}>
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={addOns.includes(a.label)} onChange={() => toggleAddOn(a.label)} />
                    {a.label}
                  </span>
                  <span style={{ opacity: 0.6 }}>{a.price > 0 ? `+${formatPrice(a.price, currency)}` : "free"}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">{t("customizeNotes")}</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("customizeNotesPlaceholder")} rows={2}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${colors.line}`, resize: "none", background: "transparent", color: colors.ink }} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">{t("quantityLabel")}</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${colors.line}` }}><Minus size={14} /></button>
            <span className="w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.accent, color: "white" }}><Plus size={14} /></button>
          </div>
        </div>

        <button onClick={() => onConfirm({ itemId: item.id, restaurantId, quantity, options, unitPrice: unit })}
          className="w-full py-3 rounded-xl font-semibold" style={{ background: colors.ink, color: colors.cream }}>
          {t("addToCartBtn")} · {formatPrice(unit * quantity, currency)}
        </button>
      </div>
    </div>
  );
}

/* ---------- Review modal (with optional camera/photo) ---------- */
function ReviewModal({ onClose, onSubmit, colors, t }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const field = "w-full rounded-lg px-3 py-2 text-sm outline-none mb-3";
  const fieldStyle = { border: `1px solid ${colors.line}`, background: "transparent", color: colors.ink };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" style={{ background: colors.surface, color: colors.ink }}>
        <div className="flex items-center justify-between mb-3">
          <div className="fraunces text-xl">{t("writeReviewBtn")}</div>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <label className="text-xs font-semibold mb-1 block">{t("yourNameLabel")}</label>
        <input className={field} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} />
        <label className="text-xs font-semibold mb-1 block">{t("ratingLabel")}</label>
        <div className="mb-3"><StarPicker value={rating} onChange={setRating} /></div>
        <label className="text-xs font-semibold mb-1 block">{t("commentLabel")}</label>
        <textarea className={field} style={fieldStyle} rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />

        <label className="text-xs font-semibold mb-1 block">{t("attachPhotoLabel")}</label>
        <div className="flex items-center gap-3 mb-4">
          {photo && <img src={photo} alt="" className="w-14 h-14 rounded-lg object-cover" />}
          <label className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer" style={{ border: `1px solid ${colors.line}` }}>
            <Camera size={14} /> {t("attachPhotoLabel")}
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          </label>
          {photo && <button onClick={() => setPhoto(null)} className="text-xs" style={{ opacity: 0.6 }}>{t("removeLabel")}</button>}
        </div>

        <button
          disabled={!name.trim() || !comment.trim()}
          onClick={() => onSubmit({ id: `rv-${Date.now()}`, name: name.trim(), rating, comment: comment.trim(), photo, date: "Just now" })}
          className="w-full py-3 rounded-xl font-semibold" style={{ background: colors.accent, color: "white", opacity: name.trim() && comment.trim() ? 1 : 0.5 }}
        >
          {t("submitReviewBtn")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Restaurant profile form (seller) ---------- */
function RestaurantFormModal({ initial, onClose, onSave, colors, t }) {
  const [name, setName] = useState(initial?.name || "");
  const [cuisine, setCuisine] = useState(initial?.cuisine || "");
  const [tag, setTag] = useState(initial?.tag || "");
  const [emoji, setEmoji] = useState(initial?.emoji || "🍽️");
  const [currency, setCurrency] = useState(initial?.currency || "USD");
  const [deliveryFee, setDeliveryFee] = useState(initial ? String(initial.deliveryFee ?? 2.99) : "2.99");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [paymentMethods, setPaymentMethods] = useState(initial?.paymentMethods || ["cod", "card"]);

  const field = "w-full rounded-lg px-3 py-2 text-sm outline-none mb-3";
  const fieldStyle = { border: `1px solid ${colors.line}`, background: "transparent", color: colors.ink };

  const togglePayment = (id) => {
    setPaymentMethods((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" style={{ background: colors.surface, color: colors.ink }}>
        <div className="flex items-start justify-between mb-3">
          <div className="fraunces text-xl">{initial ? t("editRestaurantInfo") : t("createRestaurantTitle")}</div>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <label className="text-xs font-semibold mb-1 block">{t("restaurantNameLabel")}</label>
        <input className={field} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bella Bites" />
        <label className="text-xs font-semibold mb-1 block">{t("cuisineLabel")}</label>
        <input className={field} style={fieldStyle} value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Italian" />
        <label className="text-xs font-semibold mb-1 block">{t("tagLabel")}</label>
        <input className={field} style={fieldStyle} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Fresh & fast" />
        <label className="text-xs font-semibold mb-1 block">{t("emojiLabel")}</label>
        <input className={field} style={fieldStyle} value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🍽️" maxLength={4} />
        <label className="text-xs font-semibold mb-1 block">{t("restaurantPhoneLabel")}</label>
        <input className={field} style={fieldStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" type="tel" />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold mb-1 block">{t("currencyLabel")}</label>
            <select className={field} style={fieldStyle} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map(([code, label]) => <option key={code} value={code} style={{ color: "black" }}>{code} — {label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold mb-1 block">{t("deliveryFeeLabel")}</label>
            <input className={field} style={fieldStyle} value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} inputMode="decimal" />
          </div>
        </div>

        <label className="text-xs font-semibold mb-1 block">{t("acceptedPaymentsLabel")}</label>
        <div className="grid gap-2 mb-3">
          {PAYMENT_METHODS.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ border: `1px solid ${colors.line}` }}>
              <input type="checkbox" checked={paymentMethods.includes(id)} onChange={() => togglePayment(id)} />
              {paymentLabel(id, t)}
            </label>
          ))}
        </div>

        <button
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), cuisine: cuisine.trim() || "Other", tag: tag.trim() || "", emoji: emoji.trim() || "🍽️", currency, deliveryFee: parseFloat(deliveryFee) || 0, phone: phone.trim(), paymentMethods: paymentMethods.length ? paymentMethods : ["cod"] })}
          className="w-full py-3 rounded-xl font-semibold mt-2" style={{ background: colors.accent, color: "white", opacity: name.trim() ? 1 : 0.5 }}
        >
          {initial ? t("saveBtn") : t("createBtn")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Menu item form (seller) ---------- */
function MenuItemFormModal({ initial, onClose, onSave, colors, t }) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [emoji, setEmoji] = useState(initial?.emoji || "🍽️");
  const [spicy, setSpicy] = useState(initial?.spicy || false);
  const [image, setImage] = useState(initial?.image || null);

  const field = "w-full rounded-lg px-3 py-2 text-sm outline-none mb-3";
  const fieldStyle = { border: `1px solid ${colors.line}`, background: "transparent", color: colors.ink };
  const priceNum = parseFloat(price);
  const valid = name.trim() && !isNaN(priceNum) && priceNum >= 0;

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" style={{ background: colors.surface, color: colors.ink }}>
        <div className="flex items-start justify-between mb-3">
          <div className="fraunces text-xl">{initial ? t("editItemTitle") : t("newItemTitle")}</div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <label className="text-xs font-semibold mb-1 block">{t("uploadImageLabel")}</label>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center text-2xl shrink-0" style={{ background: colors.bg }}>
            {image ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (emoji || "🍽️")}
          </div>
          <label className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer" style={{ border: `1px solid ${colors.line}` }}>
            <Camera size={14} /> {t("uploadImageLabel")}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {image && <button onClick={() => setImage(null)} className="text-xs" style={{ opacity: 0.6 }}>{t("removeLabel")}</button>}
        </div>

        <label className="text-xs font-semibold mb-1 block">{t("itemNameLabel")}</label>
        <input className={field} style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Margherita Pizza" />
        <label className="text-xs font-semibold mb-1 block">{t("itemDescLabel")}</label>
        <input className={field} style={fieldStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Tomato, mozzarella, basil" />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold mb-1 block">{t("itemPriceLabel")}</label>
            <input className={field} style={fieldStyle} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12.00" inputMode="decimal" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold mb-1 block">{t("emojiLabel")}</label>
            <input className={field} style={fieldStyle} value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🍕" maxLength={4} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm mb-4">
          <input type="checkbox" checked={spicy} onChange={(e) => setSpicy(e.target.checked)} />
          {t("spicyLabel")}
        </label>
        <button
          disabled={!valid}
          onClick={() => onSave({ name: name.trim(), desc: desc.trim(), price: priceNum, emoji: emoji.trim() || "🍽️", spicy, image })}
          className="w-full py-3 rounded-xl font-semibold" style={{ background: colors.accent, color: "white", opacity: valid ? 1 : 0.5 }}
        >
          {t("saveBtn")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Welcome / role screen ---------- */
function WelcomeScreen({ colors, lang, setLang, onContinue }) {
  const t = (k) => LANGS[lang][k] || LANGS.en[k];
  const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div dir={dir} className="min-h-screen flex flex-col justify-center px-6 py-10" style={{ background: colors.ink, color: colors.cream }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Work+Sans:wght@400;500;600;700&display=swap'); .fraunces{font-family:'Fraunces',serif;}`}</style>
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Globe size={16} />
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-sm outline-none" style={{ color: colors.cream }}>
            {Object.entries(LANGS).map(([code, l]) => (
              <option key={code} value={code} style={{ color: "black" }}>{l.langName}</option>
            ))}
          </select>
        </div>
      </div>

      <h1 className="fraunces text-3xl mb-2">{t("welcomeHeadline")}</h1>
      <p className="text-sm mb-8" style={{ color: "rgba(255,251,243,0.65)" }}>{t("welcomeSub")}</p>

      <div className="grid gap-3 mb-6">
        <button onClick={() => setRole("customer")} className="text-left rounded-2xl p-4 flex items-center gap-4"
          style={{ background: role === "customer" ? colors.ink : "rgba(255,251,243,0.08)", border: `1px solid rgba(255,251,243,0.15)`, outline: role === "customer" ? "2px solid rgba(255,251,243,0.5)" : "none" }}>
          <User size={22} />
          <div>
            <div className="font-semibold text-sm">{t("customerCard")}</div>
            <div className="text-xs" style={{ color: "rgba(255,251,243,0.7)" }}>{t("customerCardDesc")}</div>
          </div>
        </button>
        <button onClick={() => setRole("seller")} className="text-left rounded-2xl p-4 flex items-center gap-4"
          style={{ background: role === "seller" ? colors.ink : "rgba(255,251,243,0.08)", border: `1px solid rgba(255,251,243,0.15)`, outline: role === "seller" ? "2px solid rgba(255,251,243,0.5)" : "none" }}>
          <Store size={22} />
          <div>
            <div className="font-semibold text-sm">{t("sellerCard")}</div>
            <div className="text-xs" style={{ color: "rgba(255,251,243,0.7)" }}>{t("sellerCardDesc")}</div>
          </div>
        </button>
      </div>

      <div className="grid gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,251,243,0.08)" }}>
          <Mail size={16} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailLabel")} type="email"
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: colors.cream }} />
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,251,243,0.08)" }}>
          <Phone size={16} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phoneLabel")} type="tel"
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: colors.cream }} />
        </div>
      </div>

      <button
        disabled={!role}
        onClick={() => onContinue({ role, email: email.trim(), phone: phone.trim() })}
        className="w-full py-3 rounded-xl font-semibold"
        style={{ background: role ? "#FF6B35" : "rgba(255,251,243,0.15)", color: "white", opacity: role ? 1 : 0.6 }}
      >
        {t("continueBtn")}
      </button>
    </div>
  );
}

/* ---------- Settings modal ---------- */
function SettingsModal({ colors, lang, setLang, theme, setTheme, accentTheme, setAccentTheme, contact, setContact, onClose, onSwitchRole, t }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
      <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" style={{ background: colors.surface, color: colors.ink }}>
        <div className="flex items-center justify-between mb-4">
          <div className="fraunces text-xl">{t("settingsTitle")}</div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1"><Globe size={14} /> {t("languageLabel")}</div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm" style={{ border: `1px solid ${colors.line}`, background: "transparent", color: colors.ink }}>
            {Object.entries(LANGS).map(([code, l]) => (
              <option key={code} value={code} style={{ color: "black" }}>{l.langName}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold mb-2">{t("themeLabel")}</div>
          <div className="flex gap-2">
            <button onClick={() => setTheme("light")} className="flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              style={{ background: theme === "light" ? colors.ink : "transparent", color: theme === "light" ? colors.cream : colors.ink, border: `1px solid ${colors.line}` }}>
              <Sun size={14} /> {t("lightLabel")}
            </button>
            <button onClick={() => setTheme("dark")} className="flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              style={{ background: theme === "dark" ? colors.ink : "transparent", color: theme === "dark" ? colors.cream : colors.ink, border: `1px solid ${colors.line}` }}>
              <Moon size={14} /> {t("darkLabel")}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1"><Palette size={14} /> {t("colorThemeLabel")}</div>
          <div className="flex gap-2">
            {ACCENT_THEMES.map((a) => (
              <button key={a.id} onClick={() => setAccentTheme(a.id)} title={a.name}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: a.accent, outline: accentTheme === a.id ? `2px solid ${colors.ink}` : "none", outlineOffset: "2px" }}
              />
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="text-xs font-semibold mb-2">{t("contactSectionTitle")}</div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2" style={{ border: `1px solid ${colors.line}` }}>
            <Mail size={14} style={{ opacity: 0.6 }} />
            <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder={t("emailLabel")} type="email"
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: colors.ink }} />
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: `1px solid ${colors.line}` }}>
            <Phone size={14} style={{ opacity: 0.6 }} />
            <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder={t("phoneLabel")} type="tel"
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: colors.ink }} />
          </div>
        </div>

        <button onClick={onSwitchRole} className="w-full py-2.5 rounded-xl text-sm font-medium" style={{ border: `1px solid ${colors.line}` }}>
          {t("switchRoleBtn")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Seller dashboard ---------- */
function ManageDashboard({ myRestaurant, setMyRestaurant, colors, t, onPreview }) {
  const [showProfileForm, setShowProfileForm] = useState(!myRestaurant);
  const [itemModal, setItemModal] = useState(null);

  const saveProfile = (data) => {
    setMyRestaurant((prev) => ({
      id: "own", rating: prev?.rating || 5.0, time: prev?.time || "20-30 min",
      menu: prev?.menu || [], reviews: prev?.reviews || [], ...data,
    }));
    setShowProfileForm(false);
  };

  const saveItem = (data) => {
    setMyRestaurant((prev) => {
      const menu = [...prev.menu];
      if (itemModal.mode === "edit") {
        const idx = menu.findIndex((m) => m.id === itemModal.item.id);
        menu[idx] = { ...menu[idx], ...data };
      } else {
        menu.push({ id: `own-${Date.now()}`, ...data });
      }
      return { ...prev, menu };
    });
    setItemModal(null);
  };

  const deleteItem = (id) => {
    setMyRestaurant((prev) => ({ ...prev, menu: prev.menu.filter((m) => m.id !== id) }));
  };

  if (!myRestaurant) {
    return (
      <div className="px-5 py-10 text-center">
        <UtensilsCrossed size={32} className="mx-auto mb-3" style={{ color: colors.accent }} />
        <p className="text-sm mb-4" style={{ opacity: 0.7 }}>{t("createRestaurantTitle")}</p>
        <button onClick={() => setShowProfileForm(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: colors.accent, color: "white" }}>
          {t("createBtn")}
        </button>
        {showProfileForm && <RestaurantFormModal initial={null} onClose={() => setShowProfileForm(false)} onSave={saveProfile} colors={colors} t={t} />}
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <div className="rounded-2xl p-4 flex items-center gap-4 mb-5" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: colors.bg }}>{myRestaurant.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="fraunces text-lg">{myRestaurant.name}</div>
          <div className="text-xs" style={{ opacity: 0.6 }}>{myRestaurant.tag} · {myRestaurant.cuisine} · {myRestaurant.currency || "USD"}</div>
          {myRestaurant.phone && <div className="text-xs flex items-center gap-1 mt-0.5" style={{ opacity: 0.6 }}><Phone size={11} /> {myRestaurant.phone}</div>}
        </div>
        <button onClick={() => setShowProfileForm(true)}><Pencil size={16} /></button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="fraunces text-lg">Menu</div>
        <button onClick={() => setItemModal({ mode: "new" })} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1" style={{ background: colors.ink, color: colors.cream }}>
          <Plus size={14} /> {t("addMenuItemBtn")}
        </button>
      </div>

      {myRestaurant.menu.length === 0 ? (
        <div className="text-center py-10" style={{ opacity: 0.6 }}>
          <p className="mb-1 text-sm">{t("menuEmptyTitle")}</p>
          <p className="text-xs">{t("menuEmptySub")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {myRestaurant.menu.map((item) => (
            <div key={item.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
              <Thumb item={item} colors={colors} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{item.name}{item.spicy ? " 🌶️" : ""}</div>
                <div className="text-xs mt-0.5" style={{ opacity: 0.6 }}>{item.desc}</div>
                <div className="text-sm mt-1 font-semibold" style={{ color: colors.accent }}>{formatPrice(item.price, myRestaurant.currency)}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 items-end">
                <button onClick={() => setItemModal({ mode: "edit", item })} className="text-xs flex items-center gap-1" style={{ opacity: 0.7 }}><Pencil size={12} /> {t("editBtn")}</button>
                <button onClick={() => deleteItem(item.id)} className="text-xs flex items-center gap-1" style={{ color: "#c0392b" }}><Trash2 size={12} /> {t("deleteBtn")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onPreview} className="w-full mt-6 py-3 rounded-xl font-semibold" style={{ border: `1px solid ${colors.line}` }}>
        {t("previewStorefront")}
      </button>

      {showProfileForm && <RestaurantFormModal initial={myRestaurant} onClose={() => setShowProfileForm(false)} onSave={saveProfile} colors={colors} t={t} />}
      {itemModal && <MenuItemFormModal initial={itemModal.item} onClose={() => setItemModal(null)} onSave={saveItem} colors={colors} t={t} />}
    </div>
  );
}

/* ---------- Main app ---------- */
export default function App() {
  const [booted, setBooted] = useState(false);
  const [role, setRole] = useState(null);
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("light");
  const [accentTheme, setAccentTheme] = useState("citrus");
  const [showSettings, setShowSettings] = useState(false);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [reviewsByRestaurant, setReviewsByRestaurant] = useState(() => {
    const init = {};
    SEED_RESTAURANTS.forEach((r) => { if (r.reviews) init[r.id] = r.reviews; });
    return init;
  });
  const [showReviewFor, setShowReviewFor] = useState(null);

  const [view, setView] = useState("home");
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [cart, setCart] = useState({ restaurantId: null, lines: [] });
  const [customizeItem, setCustomizeItem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [micSupported, setMicSupported] = useState(true);
  const [voiceError, setVoiceError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const baseTheme = theme === "dark" ? DARK : LIGHT;
  const activeAccent = ACCENT_THEMES.find((a) => a.id === accentTheme) || ACCENT_THEMES[0];
  const colors = { ...baseTheme, accent: activeAccent.accent, gold: activeAccent.gold };
  const t = (k) => LANGS[lang][k] || LANGS.en[k];
  const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

  const allRestaurants = useMemo(
    () => (myRestaurant ? [myRestaurant, ...SEED_RESTAURANTS] : SEED_RESTAURANTS),
    [myRestaurant]
  );
  const CUISINES = useMemo(() => ["All", ...Array.from(new Set(allRestaurants.map((r) => r.cuisine)))], [allRestaurants]);

  useEffect(() => {
    if (messages.length === 0 && role === "customer") {
      setMessages([{ role: "assistant", text: "Hungry? Tell me what you're craving, or tap the mic and just say it out loud." }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setMicSupported(!!SR);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const getReviews = (id) => reviewsByRestaurant[id] || [];
  const addReview = (restaurantId, review) => {
    setReviewsByRestaurant((prev) => ({ ...prev, [restaurantId]: [review, ...(prev[restaurantId] || [])] }));
    setShowReviewFor(null);
  };

  /* ---------- Voice: rebuilt to be robust ----------
     - fresh recognition instance every time (avoids stuck/duplicate-start errors)
     - explicit mic permission probe with clear, localized error messages
     - checks for HTTPS/secure context and browser support before attempting
     Note: real speech-to-text quality/availability depends on the browser —
     Chrome and Edge have the best support; Safari and Firefox are limited. */
  const startListening = async () => {
    setVoiceError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMicSupported(false); setVoiceError(t("voiceErrorUnsupported")); return; }
    if (window.isSecureContext === false) { setVoiceError(t("voiceErrorHttps")); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
    } catch {
      setVoiceError(t("voiceErrorMic"));
      return;
    }

    try {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = SPEECH_LOCALES[lang] || "en-US";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") setVoiceError(t("voiceErrorMic"));
        else if (event.error !== "no-speech" && event.error !== "aborted") setVoiceError(t("voiceErrorUnsupported"));
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError(t("voiceErrorUnsupported"));
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  const toggleListening = () => { isListening ? stopListening() : startListening(); };

  const speak = (text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALES[lang] || "en-US";
    utterance.rate = 1.02;
    window.speechSynthesis.speak(utterance);
  };

  const addLineToCart = ({ itemId, restaurantId, quantity, options, unitPrice }) => {
    setCart((prev) => {
      const base = prev.restaurantId && prev.restaurantId !== restaurantId ? [] : prev.lines;
      return { restaurantId, lines: [...base, { lineId: `${itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, itemId, quantity, options, unitPrice }] };
    });
    setCustomizeItem(null);
  };

  const addSimpleToCart = (restaurantId, itemId, quantity) => {
    const found = findItem(itemId, allRestaurants);
    if (!found) return;
    addLineToCart({ itemId, restaurantId, quantity, options: {}, unitPrice: found.item.price });
  };

  const changeLineQty = (lineId, delta) => {
    setCart((prev) => {
      const nextLines = prev.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + delta } : l)).filter((l) => l.quantity > 0);
      return { restaurantId: nextLines.length ? prev.restaurantId : null, lines: nextLines };
    });
  };

  const removeLine = (lineId) => {
    setCart((prev) => {
      const nextLines = prev.lines.filter((l) => l.lineId !== lineId);
      return { restaurantId: nextLines.length ? prev.restaurantId : null, lines: nextLines };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, lines: [] });
    setAppliedCoupon(null); setCouponInput(""); setCouponMsg(null);
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = DEMO_COUPONS[code];
    if (!found) { setAppliedCoupon(null); setCouponMsg({ type: "error", text: t("couponInvalid") }); return; }
    setAppliedCoupon({ code, ...found });
    setCouponMsg({ type: "success", text: t("couponApplied") });
  };

  const cartCount = cart.lines.reduce((a, l) => a + l.quantity, 0);
  const cartTotal = cart.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const cartRestaurant = allRestaurants.find((r) => r.id === cart.restaurantId);
  const cartCurrency = cartRestaurant?.currency || "USD";
  const baseDeliveryFee = cartRestaurant?.deliveryFee ?? 2.99;

  let discountAmount = 0;
  let effectiveDeliveryFee = baseDeliveryFee;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") discountAmount = cartTotal * (appliedCoupon.value / 100);
    else if (appliedCoupon.type === "flat") discountAmount = Math.min(appliedCoupon.value, cartTotal);
    else if (appliedCoupon.type === "freeShipping") effectiveDeliveryFee = 0;
  }
  const grandTotal = Math.max(0, cartTotal - discountAmount) + effectiveDeliveryFee;
  const restaurantPayments = cartRestaurant?.paymentMethods || ["cod", "card"];

  const handleSend = async (rawText) => {
    const text = (rawText ?? textInput).trim();
    if (!text) return;
    setTextInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsThinking(true);

    const menuSummary = allRestaurants.map(
      (r) => `Restaurant ${r.id} "${r.name}" (${r.cuisine}, currency ${r.currency || "USD"}): ` + r.menu.map((m) => `[${m.id}] ${m.name} ${m.price} - ${m.desc}`).join("; ")
    ).join("\n");

    const cartSummary = cartCount > 0
      ? `Current cart (restaurant ${cart.restaurantId}): ` + cart.lines.map((l) => `${l.quantity}x ${findItem(l.itemId, allRestaurants)?.item.name}`).join(", ")
      : "Cart is empty.";

    const systemPrompt = `You are a friendly voice-ordering assistant for a food delivery app called ${BRAND_NAME}. You help the person decide what to eat and add items to their cart. Orders can only come from one restaurant at a time - if the person wants something from a different restaurant than what's already in their cart, mention that adding it will clear the current cart, and only do so if they confirm or if the cart is empty.

Menu data:
${menuSummary}

${cartSummary}

Respond in ${LANG_NAMES_FOR_AI[lang] || "English"}. Respond ONLY with valid JSON, no markdown fences, no other text, in this exact shape:
{"reply": "a short, warm, spoken-style response (1-3 sentences)", "add_items": [{"restaurant_id": "r1", "item_id": "m1", "quantity": 1}]}

If you're just chatting or asking a clarifying question, use an empty add_items array. Keep "reply" conversational since it will be read aloud.`;

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: systemPrompt, messages: [{ role: "user", content: text }] }),
      });
      const data = await response.json();
      const raw = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      let parsed;
      try { parsed = JSON.parse(clean); } catch { parsed = { reply: raw || "I didn't quite catch that — could you say it again?", add_items: [] }; }

      (parsed.add_items || []).forEach((a) => {
        if (a.restaurant_id && a.item_id) addSimpleToCart(a.restaurant_id, a.item_id, a.quantity || 1);
      });

      setMessages((prev) => [...prev, { role: "assistant", text: parsed.reply }]);
      speak(parsed.reply);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble hearing the kitchen right now. Try again in a moment?" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const activeRestaurant = allRestaurants.find((r) => r.id === activeRestaurantId);
  const visibleRestaurants = cuisineFilter === "All" ? allRestaurants : allRestaurants.filter((r) => r.cuisine === cuisineFilter);

  if (!booted) {
    return (
      <WelcomeScreen
        colors={colors} lang={lang} setLang={setLang}
        onContinue={({ role: r, email, phone }) => {
          setRole(r);
          setContact({ email, phone });
          setView(r === "seller" ? "manage" : "home");
          setBooted(true);
        }}
      />
    );
  }

  return (
    <div dir={dir} style={{ background: colors.bg, minHeight: "100vh", fontFamily: "'Work Sans', sans-serif", color: colors.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Work+Sans:wght@400;500;600;700&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }
        .mic-pulse { animation: micpulse 1.4s ease-out infinite; }
        @keyframes micpulse { 0% { box-shadow: 0 0 0 0 rgba(255,107,53,0.45); } 70% { box-shadow: 0 0 0 22px rgba(255,107,53,0); } 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0); } }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(127,127,127,0.3); border-radius: 4px; }
      `}</style>

      <header className="flex items-center justify-between px-5 py-4 sticky top-0 z-20" style={{ background: colors.ink, color: colors.cream }}>
        {view !== "home" && view !== "manage" ? (
          <button onClick={() => { setView(role === "seller" ? "manage" : "home"); setActiveRestaurantId(null); }} className="flex items-center gap-1 text-sm">
            <ChevronLeft size={18} /> {t("backBtn")}
          </button>
        ) : (
          <div className="fraunces text-xl">{BRAND_NAME}</div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(true)}><Settings size={20} /></button>
          {role === "customer" && (
            <button onClick={() => setView("cart")} className="relative">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold" style={{ background: colors.accent, color: "white" }}>{cartCount}</span>
              )}
            </button>
          )}
        </div>
      </header>

      {role === "seller" && view === "manage" && (
        <ManageDashboard myRestaurant={myRestaurant} setMyRestaurant={setMyRestaurant} colors={colors} t={t} onPreview={() => setView("home")} />
      )}

      {view === "home" && (
        <>
          {role === "seller" && (
            <div className="px-5 pt-4">
              <button onClick={() => setView("manage")} className="text-sm flex items-center gap-1" style={{ color: colors.accent }}>
                <ChevronLeft size={14} /> {t("backToManage")}
              </button>
            </div>
          )}
          <section className="px-5 pt-8 pb-6" style={{ background: colors.ink, color: colors.cream }}>
            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
              <div>
                <h1 className="fraunces" style={{ fontSize: "1.9rem", lineHeight: 1.15, maxWidth: "16ch" }}>{t("heroTitle")}</h1>
                <p className="mt-2 text-sm" style={{ color: "rgba(255,251,243,0.7)", maxWidth: "34ch" }}>{t("heroSub")}</p>
              </div>
              <button onClick={toggleListening} disabled={!micSupported}
                className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${isListening ? "mic-pulse" : ""}`}
                style={{ background: micSupported ? colors.accent : "rgba(255,255,255,0.15)", color: "white", opacity: micSupported ? 1 : 0.6 }}>
                {isListening ? <MicOff size={26} /> : <Mic size={26} />}
              </button>
            </div>
            {isListening && <p className="mt-2 text-xs font-medium" style={{ color: colors.gold }}>{t("listeningLabel")}</p>}
            {voiceError && <p className="mt-2 text-xs" style={{ color: "#ff9d8a" }}>{voiceError}</p>}

            <div className="mt-5 rounded-2xl p-4 max-h-64 overflow-y-auto scrollbar-thin" style={{ background: "rgba(255,251,243,0.06)" }}>
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="px-3 py-2 rounded-xl text-sm max-w-[80%]" style={{ background: m.role === "user" ? colors.accent : "rgba(255,251,243,0.12)", color: "white" }}>{m.text}</div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(255,251,243,0.12)", color: "rgba(255,251,243,0.7)" }}>thinking…</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("chatPlaceholder")} className="flex-1 rounded-xl px-3 py-2 text-sm outline-none" style={{ background: "rgba(255,251,243,0.1)", color: "white" }} />
              <button onClick={() => handleSend()} className="rounded-xl px-3 py-2" style={{ background: colors.gold, color: colors.ink }}><Send size={18} /></button>
              <button onClick={() => setVoiceOn((v) => !v)} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,251,243,0.1)", color: "white" }}>
                {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </section>

          <div className="px-5 pt-5 flex gap-2 overflow-x-auto scrollbar-thin">
            {CUISINES.map((c) => (
              <button key={c} onClick={() => setCuisineFilter(c)} className="shrink-0 px-3 py-1.5 rounded-full text-sm"
                style={{ background: cuisineFilter === c ? colors.ink : "transparent", color: cuisineFilter === c ? colors.cream : colors.ink, border: `1px solid ${colors.line}` }}>
                {c === "All" ? t("cuisineAll") : c}
              </button>
            ))}
          </div>

          <div className="px-5 py-5 grid gap-4">
            {visibleRestaurants.map((r) => (
              <button key={r.id} onClick={() => { setActiveRestaurantId(r.id); setView("restaurant"); }} className="text-left rounded-2xl p-4 flex items-center gap-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: colors.bg }}>{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="fraunces text-lg">{r.name}</div>
                  <div className="text-sm" style={{ opacity: 0.65 }}>{r.tag} · {r.cuisine}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ opacity: 0.6 }}>
                    <span className="flex items-center gap-1"><Star size={12} style={{ color: colors.gold, fill: colors.gold }} /> {r.rating}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {r.time}</span>
                    <span>{getReviews(r.id).length} {t("reviewsTitle").toLowerCase()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {view === "restaurant" && activeRestaurant && (
        <div className="px-5 py-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>{activeRestaurant.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="fraunces text-2xl">{activeRestaurant.name}</div>
              <div className="text-sm flex items-center gap-3 mt-1" style={{ opacity: 0.65 }}>
                <span className="flex items-center gap-1"><Star size={12} style={{ color: colors.gold, fill: colors.gold }} /> {activeRestaurant.rating}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {activeRestaurant.time}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> 1.2 mi</span>
              </div>
            </div>
            {activeRestaurant.phone && (
              <a href={`tel:${activeRestaurant.phone}`} className="shrink-0 flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${colors.line}` }}>
                <Phone size={14} /> {t("callBtn")}
              </a>
            )}
          </div>

          <div className="grid gap-3">
            {activeRestaurant.menu.map((item) => {
              const canCustomize = item.sizes || item.spicy || (item.addOns && item.addOns.length);
              return (
                <div key={item.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
                  <Thumb item={item} colors={colors} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs mt-0.5" style={{ opacity: 0.6 }}>{item.desc}</div>
                    <div className="text-sm mt-1 font-semibold" style={{ color: colors.accent }}>{formatPrice(item.price, activeRestaurant.currency)}</div>
                  </div>
                  <button onClick={() => (canCustomize ? setCustomizeItem({ item, restaurantId: activeRestaurant.id, currency: activeRestaurant.currency }) : addSimpleToCart(activeRestaurant.id, item.id, 1))}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium shrink-0" style={{ background: colors.ink, color: colors.cream }}>
                    {canCustomize ? "Customize" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="fraunces text-lg">{t("reviewsTitle")} ({getReviews(activeRestaurant.id).length})</div>
              <button onClick={() => setShowReviewFor(activeRestaurant.id)} className="text-sm font-medium" style={{ color: colors.accent }}>{t("writeReviewBtn")}</button>
            </div>
            {getReviews(activeRestaurant.id).length === 0 ? (
              <p className="text-sm" style={{ opacity: 0.6 }}>{t("noReviewsYet")}</p>
            ) : (
              <div className="grid gap-3">
                {getReviews(activeRestaurant.id).map((rv) => (
                  <div key={rv.id} className="rounded-xl p-3" style={{ border: `1px solid ${colors.line}` }}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{rv.name}</div>
                      <div className="text-xs">{"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}</div>
                    </div>
                    {rv.photo && <img src={rv.photo} alt="" className="w-full max-w-[160px] rounded-lg mt-2 object-cover" />}
                    <div className="text-xs mt-1" style={{ opacity: 0.75 }}>{rv.comment}</div>
                    <div className="text-[10px] mt-1" style={{ opacity: 0.45 }}>{rv.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === "cart" && (
        <div className="px-5 py-5">
          <h2 className="fraunces text-2xl mb-4">{t("yourOrder")}</h2>
          {cartCount === 0 ? (
            <div className="text-center py-16" style={{ opacity: 0.6 }}>
              <p className="mb-1">{t("cartEmptyTitle")}</p>
              <p className="text-sm">{t("cartEmptySub")}</p>
            </div>
          ) : (
            <>
              <div className="text-sm mb-3" style={{ opacity: 0.6 }}>{t("fromLabel")} {cartRestaurant?.name}</div>
              <div className="grid gap-3">
                {cart.lines.map((line) => {
                  const found = findItem(line.itemId, allRestaurants);
                  if (!found) return null;
                  const summary = summarizeOptions(line.options);
                  return (
                    <div key={line.lineId} className="rounded-2xl p-4 flex items-start gap-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
                      <Thumb item={found.item} colors={colors} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{found.item.name}</div>
                        {summary && <div className="text-xs mt-0.5" style={{ opacity: 0.55 }}>{summary}</div>}
                        <div className="text-sm mt-1 font-semibold" style={{ color: colors.accent }}>{formatPrice(line.unitPrice * line.quantity, cartCurrency)}</div>
                        <button onClick={() => setCustomizeItem({ item: found.item, restaurantId: cart.restaurantId, currency: cartCurrency, editingLineId: line.lineId })} className="text-xs mt-1 flex items-center gap-1" style={{ opacity: 0.55 }}>
                          <Pencil size={11} /> {t("editBtn")}
                        </button>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeLineQty(line.lineId, -1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: `1px solid ${colors.line}` }}><Minus size={14} /></button>
                          <span className="text-sm w-4 text-center">{line.quantity}</span>
                          <button onClick={() => changeLineQty(line.lineId, 1)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: colors.accent, color: "white" }}><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeLine(line.lineId)} style={{ opacity: 0.45 }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
                <div className="text-xs font-semibold mb-2 flex items-center gap-1"><Tag size={13} /> {t("couponLabel")}</div>
                <div className="flex gap-2">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="WELCOME10"
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={{ border: `1px solid ${colors.line}`, background: "transparent", color: colors.ink }} />
                  <button onClick={applyCoupon} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: colors.ink, color: colors.cream }}>{t("applyCouponBtn")}</button>
                </div>
                {couponMsg && <p className="text-xs mt-2" style={{ color: couponMsg.type === "error" ? "#c0392b" : "#2F9E44" }}>{couponMsg.text}</p>}
              </div>

              <div className="mt-3 rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.line}` }}>
                <div className="flex justify-between text-sm mb-1"><span style={{ opacity: 0.65 }}>{t("subtotal")}</span><span>{formatPrice(cartTotal, cartCurrency)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-sm mb-1" style={{ color: "#2F9E44" }}><span>{t("discountLabel")}</span><span>-{formatPrice(discountAmount, cartCurrency)}</span></div>}
                <div className="flex justify-between text-sm mb-1"><span style={{ opacity: 0.65 }}>{t("delivery")}</span><span>{effectiveDeliveryFee === 0 && baseDeliveryFee > 0 ? <s style={{ opacity: 0.5 }}>{formatPrice(baseDeliveryFee, cartCurrency)}</s> : formatPrice(effectiveDeliveryFee, cartCurrency)}</span></div>
                <div className="flex justify-between font-semibold mt-2 pt-2" style={{ borderTop: `1px solid ${colors.line}` }}><span>{t("total")}</span><span>{formatPrice(grandTotal, cartCurrency)}</span></div>
              </div>

              <button onClick={() => { setSelectedPayment(restaurantPayments[0]); setShowCheckout(true); }} className="w-full mt-4 py-3 rounded-xl font-semibold" style={{ background: colors.accent, color: "white" }}>
                {t("checkoutBtn")} · {formatPrice(grandTotal, cartCurrency)}
              </button>
              <button onClick={clearCart} className="w-full mt-2 py-2 rounded-xl text-sm flex items-center justify-center gap-1" style={{ opacity: 0.6 }}>
                <Trash2 size={14} /> {t("clearCart")}
              </button>
            </>
          )}
        </div>
      )}

      {customizeItem && (
        <CustomizeModal
          item={customizeItem.item} restaurantId={customizeItem.restaurantId} currency={customizeItem.currency} colors={colors} t={t}
          onClose={() => setCustomizeItem(null)}
          onConfirm={(payload) => { if (customizeItem.editingLineId) removeLine(customizeItem.editingLineId); addLineToCart(payload); }}
        />
      )}

      {showReviewFor && (
        <ReviewModal colors={colors} t={t} onClose={() => setShowReviewFor(null)} onSubmit={(review) => addReview(showReviewFor, review)} />
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center" style={{ background: "rgba(27,46,34,0.55)" }}>
          <div className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6" style={{ background: colors.surface, color: colors.ink }}>
            {!orderPlaced ? (
              <>
                <h3 className="fraunces text-xl mb-3">{t("confirmOrderTitle")}</h3>

                <div className="text-xs font-semibold mb-2">{t("paymentMethodLabel")}</div>
                <div className="grid gap-2 mb-4">
                  {restaurantPayments.map((id) => (
                    <label key={id} className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ border: `1px solid ${selectedPayment === id ? colors.accent : colors.line}` }}>
                      <input type="radio" name="paymethod" checked={selectedPayment === id} onChange={() => setSelectedPayment(id)} />
                      {paymentLabel(id, t)}
                    </label>
                  ))}
                </div>
                {selectedPayment === "bank" && <p className="text-xs mb-3" style={{ opacity: 0.65 }}>{t("bankTransferNote")}</p>}
                {selectedPayment === "jazzcash" && <p className="text-xs mb-3" style={{ opacity: 0.65 }}>{t("jazzCashNote")}</p>}

                <p className="text-sm mb-4" style={{ opacity: 0.65 }}>{t("total")}: <strong>{formatPrice(grandTotal, cartCurrency)}</strong></p>
                <button onClick={() => setOrderPlaced(true)} className="w-full py-3 rounded-xl font-semibold mb-2" style={{ background: colors.accent, color: "white" }}>{t("placeOrderBtn")}</button>
                <button onClick={() => setShowCheckout(false)} className="w-full py-2 rounded-xl text-sm" style={{ opacity: 0.6 }}>{t("cancelBtn")}</button>
              </>
            ) : (
              <>
                <h3 className="fraunces text-xl mb-2">{t("orderPlacedTitle")}</h3>
                <p className="text-sm mb-3" style={{ opacity: 0.65 }}>{cartRestaurant?.name} · {cartRestaurant?.time || "25-35 min"} · {paymentLabel(selectedPayment, t)}</p>
                <div className="rounded-xl p-3 mb-4 text-xs" style={{ background: colors.bg }}>
                  {contact.email && <div>✉️ {t("notificationEmailSent")} {contact.email}</div>}
                  {contact.phone && <div className="mt-1">📱 {t("notificationSmsSent")} {contact.phone}</div>}
                  {!contact.email && !contact.phone && <div style={{ opacity: 0.6 }}>Add an email or phone number in Settings to receive order notifications.</div>}
                </div>
                <button onClick={() => { setShowCheckout(false); setOrderPlaced(false); clearCart(); setView("home"); }} className="w-full py-3 rounded-xl font-semibold" style={{ background: colors.ink, color: colors.cream }}>{t("doneBtn")}</button>
              </>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          colors={colors} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
          accentTheme={accentTheme} setAccentTheme={setAccentTheme} contact={contact} setContact={setContact} t={t}
          onClose={() => setShowSettings(false)}
          onSwitchRole={() => { setShowSettings(false); setBooted(false); setRole(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   IMPORTANT NOTES for a real deployment:

   1. Email/SMS notifications: this is a front-end-only file,
      so it can only *simulate* sending notifications (shown on
      the order-confirmation screen). Real delivery requires a
      backend — e.g. SendGrid/Postmark for email or Twilio for
      SMS — because those services need a secret API key that
      must never live in client-side code.

   2. Payments: Cash on Delivery needs no integration, but Card,
      JazzCash, and Bank Transfer are shown here as selectable
      options with placeholder confirmation text only — no money
      actually moves. Wiring up real online/JazzCash payments
      requires their respective merchant APIs from a backend.

   3. Camera/photo uploads (menu photos, review photos) are
      stored as base64 data URLs in memory for this demo. In
      production you'd upload to real file storage (e.g. S3)
      and store a URL instead, so the data survives reloads and
      doesn't bloat app state.
--------------------------------------------------------- */
