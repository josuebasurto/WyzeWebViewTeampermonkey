// ==UserScript==
// @name         Wyze Portal Grid Enhancer
// @namespace    wyze-webkit
// @version      1.3.2
// @description  Configura la cuadrícula de cámaras del portal Wyze.
// @author       Josue Basurto
// @match        https://my.wyze.com/*
// @match        https://www.wyze.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/*
 * Creditos: Josue Basurto
 *
 * Deslinde de responsabilidades:
 * Este userscript es una herramienta independiente para personalizar la
 * interfaz local del WebPanel de Wyze. No es un producto oficial de Wyze,
 * no esta afiliado con Wyze Labs y no modifica la configuracion de la cuenta,
 * las camaras ni los servicios de Wyze. Se proporciona "tal cual" y su uso
 * es responsabilidad exclusiva del usuario. El usuario debe revisar los
 * permisos, politicas y terminos aplicables antes de utilizarlo.
 */

(function () {
	'use strict';

	const STORAGE_KEY = 'wyze-grid-enhancer-settings';
	const WHATS_NEW_KEY = 'wyze-grid-enhancer-whats-new';
	const STYLE_ID = 'wyze-grid-enhancer-style';
	const PANEL_ID = 'wyze-grid-enhancer-panel';
	const MODAL_ID = 'wyze-grid-enhancer-whats-new';
	const VERSION = '1.3.2';
	const SETTINGS_VERSION = 3;
	const RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000, 300000];
	const defaults = { columns: 2, gap: 1, hideChrome: false, autoRetry: false };
	let settings = loadSettings();
	let grid;
	let applying = false;
	const retryStates = new Map();

	function loadSettings() {
		try {
			const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
			const isLegacySettings = stored.settingsVersion !== SETTINGS_VERSION;
			return {
				columns: clamp(stored.columns ?? defaults.columns, 1, 8),
				gap: clamp(isLegacySettings && Number(stored.gap) === 0 ? defaults.gap : (stored.gap ?? defaults.gap), 0, 24),
				hideChrome: Boolean(stored.hideChrome ?? defaults.hideChrome),
				autoRetry: Boolean(stored.autoRetry ?? defaults.autoRetry),
			};
		} catch (error) {
			return { ...defaults };
		}
	}

	function saveSettings() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, settingsVersion: SETTINGS_VERSION }));
	}

	function addStyle() {
		if (document.getElementById(STYLE_ID)) return;
		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.textContent = `
			#${PANEL_ID} { position: fixed; z-index: 2147483646; right: 16px; bottom: 16px; width: 230px;
				padding: 14px; color: #17212b; background: rgba(255,255,255,.97); border: 1px solid #d8dee4;
				border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,.18); font: 13px/1.35 system-ui,sans-serif; }
			#${PANEL_ID}[data-collapsed="true"] .wge-body { display: none; }
			#${PANEL_ID} .wge-title { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-weight:700; }
			#${PANEL_ID} .wge-title button, #${PANEL_ID} .wge-actions button { border:0; border-radius:4px; padding:5px 8px; color:#fff; background:#2d6cdf; cursor:pointer; }
			#${PANEL_ID} .wge-title button { padding:2px 7px; background:#e9edf2; color:#17212b; }
			#${PANEL_ID} label { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:8px 0; }
			#${PANEL_ID} .wge-stepper { display:flex; align-items:center; gap:4px; }
			#${PANEL_ID} .wge-stepper button { width:27px; height:27px; padding:0; color:#17212b; background:#e9edf2; border:1px solid #c3ccd4; border-radius:4px; font-size:17px; line-height:1; cursor:pointer; }
			#${PANEL_ID} .wge-stepper button:hover { background:#dce5ec; }
			#${PANEL_ID} input[type="number"] { width:42px; padding:4px; text-align:center; border:1px solid #b8c1cb; border-radius:4px; }
			#${PANEL_ID} input[type="range"] { width:100%; }
			#${PANEL_ID} .wge-range { display:block; margin-top:10px; }
			#${PANEL_ID} .wge-range output { float:right; font-weight:600; }
			#${PANEL_ID} .wge-actions { display:flex; gap:7px; margin-top:12px; }
			#${PANEL_ID} .wge-actions button:last-child { background:#687482; }
			#${PANEL_ID} .wge-retry-note { margin:5px 0 0; color:#687681; font-size:11px; }
			#${MODAL_ID} { position:fixed; inset:0; z-index:2147483647; display:grid; place-items:center; padding:20px;
				background:rgba(17,22,28,.48); font:14px/1.45 system-ui,sans-serif; }
			#${MODAL_ID}[hidden] { display:none; }
			#${MODAL_ID} .wge-modal { width:min(440px,100%); overflow:hidden; color:#17212b; background:#fff;
				border:1px solid #d8dee4; border-radius:12px; box-shadow:0 24px 70px rgba(0,0,0,.28); }
			#${MODAL_ID} .wge-modal-head { padding:24px 25px 20px; color:#fff; background:linear-gradient(120deg,#252535,#4930b5); }
			#${MODAL_ID} .wge-modal-kicker { margin:0 0 7px; color:#72eee6; font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
			#${MODAL_ID} h2 { margin:0; font-size:25px; line-height:1.1; }
			#${MODAL_ID} .wge-modal-body { padding:22px 25px 25px; }
			#${MODAL_ID} ul { margin:0; padding:0; list-style:none; }
			#${MODAL_ID} li { display:flex; gap:10px; margin:11px 0; color:#53616c; }
			#${MODAL_ID} li::before { content:'+'; flex:none; color:#4930b5; font-size:19px; font-weight:700; line-height:20px; }
			#${MODAL_ID} .wge-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:22px; }
			#${MODAL_ID} button { padding:9px 15px; color:#fff; background:#4930b5; border:0; border-radius:5px; cursor:pointer; font-weight:700; }
			#${MODAL_ID} button.wge-secondary { color:#34414b; background:#e8edf1; }
			.wge-grid { display:grid !important; grid-template-columns:repeat(var(--wge-columns), minmax(0, 1fr)) !important;
				grid-auto-rows:auto !important; gap:var(--wge-gap) !important; padding:0 !important; margin:0 !important;
				width:100% !important; max-width:none !important; height:var(--wge-grid-height, auto) !important; overflow:auto !important; align-content:start !important;
				grid-auto-flow:row !important; column-count:initial !important; columns:initial !important; }
			.wge-grid > * { box-sizing:border-box !important; min-width:0 !important; width:100% !important; height:auto !important;
				position:static !important; inset:auto !important; transform:none !important; order:initial !important; margin:0 !important; padding:0 !important;
				grid-column:auto !important; grid-row:auto !important; break-inside:auto !important; }
			.wge-grid > * > *, .wge-grid > * > * > * { width:100% !important; max-width:none !important; height:100% !important; min-width:0 !important; }
			.wge-grid [data-video-controls], .wge-grid [data-video-controls] > *, .wge-grid [data-video-controls-content] { width:100% !important; max-width:none !important; height:auto !important; min-width:0 !important; }
			.wge-grid [data-video-controls] svg, .wge-grid [data-video-controls] button,
			.wge-grid [data-video-controls] [aria-label="Full screen"], .wge-grid [data-video-controls] [aria-label^="Exit full screen"] {
				width:auto !important; max-width:none !important; height:auto !important; min-width:0 !important; min-height:0 !important;
			}
			.wge-grid [data-header-video="true"] { width:100% !important; height:auto !important; min-width:0 !important; }
			.wge-grid video, .wge-grid iframe { display:block !important; width:100% !important; height:100% !important; max-width:100%; object-fit:cover; }
			.wge-grid :fullscreen { width:100vw !important; height:100vh !important; max-width:none !important; max-height:none !important; position:fixed !important; inset:0 !important; z-index:2147483646 !important; }
			.wge-retry-card { position:relative !important; }
			.wge-retry-dot { position:absolute !important; top:10px !important; right:10px !important; z-index:20; width:10px !important; height:10px !important; min-width:10px !important; min-height:10px !important; max-width:10px !important; max-height:10px !important; border:2px solid #fff;
				border-radius:50%; background:#f3c316; box-shadow:0 0 0 2px rgba(243,195,22,.25), 0 1px 5px rgba(0,0,0,.45); }
			.wge-retry-dot[data-active="true"] { animation:wge-retry-pulse 1s ease-in-out infinite; }
			@keyframes wge-retry-pulse { 50% { transform:scale(1.35); box-shadow:0 0 0 5px rgba(243,195,22,.18), 0 1px 7px rgba(0,0,0,.5); } }
			body.wge-hide-chrome nav, body.wge-hide-chrome header, body.wge-hide-chrome [role="navigation"] { display:none !important; }
		`;
		document.head.appendChild(style);
	}

	function mediaCount(element) {
		return element.querySelectorAll('video, iframe').length;
	}

	function findGrid() {
		const media = [...document.querySelectorAll('video, iframe')].filter((item) => item.offsetParent !== null);
		if (media.length < 2) return null;
		const masonry = [...document.querySelectorAll('.MuiMasonry-root')]
			.find((element) => mediaCount(element) >= 2 && [...element.children].filter((child) => mediaCount(child) > 0).length >= 2);
		if (masonry) return masonry;
		let best = null;
		media.forEach((item) => {
			let ancestor = item.parentElement;
			for (let depth = 0; ancestor && depth < 8; depth += 1, ancestor = ancestor.parentElement) {
				const count = mediaCount(ancestor);
				const directChildren = [...ancestor.children];
				const mediaChildren = directChildren.filter((child) => mediaCount(child) > 0).length;
				if (count >= 2 && mediaChildren >= 2 && (!best || count < best.count)) {
					best = { element: ancestor, count };
				}
			}
		});
		return best && best.element;
	}

	function applyGrid() {
		if (applying) return;
		applying = true;
		const nextGrid = findGrid();
		if (grid && grid !== nextGrid) grid.classList.remove('wge-grid');
		grid = nextGrid;
		if (grid) {
			grid.classList.add('wge-grid');
			grid.style.setProperty('--wge-columns', String(settings.columns));
			grid.style.setProperty('--wge-gap', `${settings.gap}px`);
			grid.style.setProperty('--wge-grid-height', 'calc(100vh - 136px)');
			grid.style.removeProperty('--wge-row-size');
		}
		document.body.classList.toggle('wge-hide-chrome', settings.hideChrome);
		syncOfflineRetries();
		applying = false;
	}

	function findRefreshButton(card) {
		return [...card.querySelectorAll('button')].find((button) => /^(refresh|retry)$/i.test(button.textContent.trim()) || /refresh|retry/i.test(button.getAttribute('aria-label') || ''));
	}

	function isOfflineCard(card) {
		return /device\s+is\s+offline/i.test(card.textContent) && Boolean(findRefreshButton(card));
	}

	function addRetryIndicator(card) {
		card.classList.add('wge-retry-card');
		let dot = card.querySelector('.wge-retry-dot');
		if (!dot) {
			dot = document.createElement('span');
			dot.className = 'wge-retry-dot';
			dot.setAttribute('role', 'status');
			dot.setAttribute('aria-label', 'Reintento automatico activado');
			card.appendChild(dot);
		}
		return dot;
	}

	function clearRetry(card) {
		const state = retryStates.get(card);
		if (state && state.timer) window.clearTimeout(state.timer);
		retryStates.delete(card);
		const dot = card.querySelector('.wge-retry-dot');
		if (dot) dot.remove();
		card.classList.remove('wge-retry-card');
	}

	function scheduleRetry(card, state) {
		if (!settings.autoRetry || !isOfflineCard(card) || retryStates.get(card) !== state) return;
		const delay = RETRY_DELAYS[Math.min(state.attempt, RETRY_DELAYS.length - 1)];
		state.timer = window.setTimeout(() => {
			state.timer = null;
			if (!settings.autoRetry || !isOfflineCard(card)) {
				clearRetry(card);
				return;
			}
			const dot = addRetryIndicator(card);
			dot.dataset.active = 'true';
			state.attempt += 1;
			const refreshButton = findRefreshButton(card);
			if (refreshButton) refreshButton.click();
			window.setTimeout(() => {
				if (dot.isConnected) dot.remove();
			}, 1500);
			scheduleRetry(card, state);
		}, delay);
	}

	function syncOfflineRetries() {
		if (!grid) return;
		const cards = new Set([...grid.children]);
		if (!settings.autoRetry) {
			retryStates.forEach((state, card) => clearRetry(card));
			return;
		}
		retryStates.forEach((state, card) => {
			if (!cards.has(card) || !isOfflineCard(card)) clearRetry(card);
		});
		cards.forEach((card) => {
			if (!isOfflineCard(card) || retryStates.has(card)) return;
			const state = { attempt: 0, timer: null };
			retryStates.set(card, state);
			scheduleRetry(card, state);
		});
	}

	function buildPanel() {
		if (document.getElementById(PANEL_ID)) return;
		const panel = document.createElement('aside');
		panel.id = PANEL_ID;
		panel.dataset.collapsed = 'true';
		panel.innerHTML = `<div class="wge-title"><span>Wyze Grid</span><button type="button" title="Minimizar">-</button></div>
			<div class="wge-body"><label>Columnas <span class="wge-stepper"><button type="button" data-columns-step="-1" aria-label="Reducir columnas">-</button><input name="columns" type="number" min="1" max="8" value="${settings.columns}"><button type="button" data-columns-step="1" aria-label="Aumentar columnas">+</button></span></label>
			<label>Separación <span class="wge-stepper"><button type="button" data-gap-step="-1" aria-label="Reducir separación">-</button><input name="gap" type="number" min="0" max="24" value="${settings.gap}"><button type="button" data-gap-step="1" aria-label="Aumentar separación">+</button></span></label>
			<label>Ocultar navegación <input name="hideChrome" type="checkbox" ${settings.hideChrome ? 'checked' : ''}></label>
			<label>Reintentar offline <input name="autoRetry" type="checkbox" ${settings.autoRetry ? 'checked' : ''}></label>
			<p class="wge-retry-note">Reintentos: 5 s, 15 s, 30 s, 1 min, 2 min y luego cada 5 min.</p>
			<div class="wge-actions"><button name="whatsNew" type="button">What's new</button><button name="reset" type="button">Restablecer</button></div></div>`;
		panel.querySelector('.wge-title button').addEventListener('click', () => {
			panel.dataset.collapsed = panel.dataset.collapsed === 'true' ? 'false' : 'true';
		});
		const updateSettings = () => {
			settings.columns = clamp(panel.querySelector('[name="columns"]').value, 1, 8);
			settings.gap = clamp(panel.querySelector('[name="gap"]').value, 0, 24);
			settings.hideChrome = panel.querySelector('[name="hideChrome"]').checked;
			settings.autoRetry = panel.querySelector('[name="autoRetry"]').checked;
			saveSettings();
			applyGrid();
		};
		panel.querySelectorAll('[name="columns"], [name="gap"]').forEach((input) => input.addEventListener('input', updateSettings));
		panel.querySelector('[name="hideChrome"]').addEventListener('change', updateSettings);
		panel.querySelector('[name="autoRetry"]').addEventListener('change', updateSettings);
		panel.querySelectorAll('[data-columns-step], [data-gap-step]').forEach((button) => {
			button.addEventListener('click', () => {
				const isGap = button.hasAttribute('data-gap-step');
				const input = panel.querySelector(isGap ? '[name="gap"]' : '[name="columns"]');
				const step = Number(button.dataset[isGap ? 'gapStep' : 'columnsStep']);
				const maximum = isGap ? 24 : 8;
				const minimum = isGap ? 0 : 1;
				input.value = clamp(Number.parseInt(input.value, 10) + step, minimum, maximum);
				updateSettings();
			});
		});
		panel.querySelector('[name="whatsNew"]').addEventListener('click', () => showWhatsNew(true));
		panel.querySelector('[name="reset"]').addEventListener('click', () => {
			settings = { ...defaults };
			saveSettings();
			panel.remove();
			buildPanel();
			applyGrid();
		});
		document.body.appendChild(panel);
	}

	function showWhatsNew(force = false) {
		if ((!force && localStorage.getItem(WHATS_NEW_KEY) === VERSION) || document.getElementById(MODAL_ID)) return;
		const modal = document.createElement('div');
		modal.id = MODAL_ID;
		modal.setAttribute('role', 'dialog');
		modal.setAttribute('aria-modal', 'true');
		modal.innerHTML = `<div class="wge-modal"><div class="wge-modal-head"><p class="wge-modal-kicker">Wyze Grid Enhancer</p><h2>What's new</h2></div>
			<div class="wge-modal-body"><ul><li>El panel de configuracion ahora inicia minimizado.</li>
			<li>La cuadrícula elimina los espacios blancos y respeta las columnas elegidas.</li>
			<li>Las columnas y la separacion se ajustan al momento con controles de menos y mas.</li>
			<li>El boton What's new permite volver a consultar estas novedades.</li>
			<li>Los dispositivos offline pueden reintentarse automaticamente con backoff hasta cada 5 minutos.</li></ul>
			<p style="margin:18px 0 0;color:#687681;font-size:12px">Creado por Josue Basurto<br>Script independiente, no afiliado con Wyze. Uso bajo responsabilidad del usuario.</p>
			<div class="wge-modal-actions"><button type="button" class="wge-secondary" data-wge-later>Ver despues</button><button type="button" data-wge-close>Entendido</button></div></div></div>`;
		document.body.appendChild(modal);
		const close = () => {
			localStorage.setItem(WHATS_NEW_KEY, VERSION);
			modal.remove();
		};
		modal.querySelector('[data-wge-close]').addEventListener('click', close);
		modal.querySelector('[data-wge-later]').addEventListener('click', () => modal.remove());
		modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
		document.addEventListener('keydown', function escape(event) {
			if (event.key === 'Escape' && document.getElementById(MODAL_ID)) {
				close();
				document.removeEventListener('keydown', escape);
			}
		});
	}

	function clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, Number.parseInt(value, 10) || minimum));
	}

	function start() {
		addStyle();
		buildPanel();
		applyGrid();
		showWhatsNew();
		new MutationObserver(() => window.requestAnimationFrame(applyGrid)).observe(document.body, { childList: true, subtree: true });
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
	else start();
})();
