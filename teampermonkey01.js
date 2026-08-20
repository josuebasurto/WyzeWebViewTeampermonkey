// ==UserScript==
// @name         Wyze Portal Grid Enhancer
// @namespace    wyze-webkit
// @version      1.0.0
// @description  Configura la cuadrícula de cámaras del portal Wyze.
// @match        https://my.wyze.com/*
// @match        https://www.wyze.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const STORAGE_KEY = 'wyze-grid-enhancer-settings';
	const STYLE_ID = 'wyze-grid-enhancer-style';
	const PANEL_ID = 'wyze-grid-enhancer-panel';
	const defaults = { columns: 2, rows: 0, gap: 0, hideChrome: false };
	let settings = loadSettings();
	let grid;
	let applying = false;

	function loadSettings() {
		try {
			return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
		} catch (error) {
			return { ...defaults };
		}
	}

	function saveSettings() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
			#${PANEL_ID} input[type="number"] { width:58px; padding:4px; border:1px solid #b8c1cb; border-radius:4px; }
			#${PANEL_ID} input[type="range"] { width:100%; }
			#${PANEL_ID} .wge-range { display:block; margin-top:10px; }
			#${PANEL_ID} .wge-range output { float:right; font-weight:600; }
			#${PANEL_ID} .wge-actions { display:flex; gap:7px; margin-top:12px; }
			#${PANEL_ID} .wge-actions button:last-child { background:#687482; }
			.wge-grid { display:grid !important; grid-template-columns:repeat(var(--wge-columns), minmax(0, 1fr)) !important;
				grid-auto-rows:var(--wge-row-size, auto) !important; gap:var(--wge-gap) !important; padding:0 !important; margin:0 !important;
				width:100% !important; max-width:none !important; height:var(--wge-grid-height, auto) !important; overflow:auto !important; align-content:start !important; }
			.wge-grid > * { box-sizing:border-box !important; min-width:0 !important; width:100% !important; height:var(--wge-row-size, auto) !important;
				position:static !important; margin:0 !important; padding:0 !important; }
			.wge-grid > * > *, .wge-grid > * > * > * { width:100% !important; max-width:none !important; height:100% !important; min-width:0 !important; }
			.wge-grid video, .wge-grid iframe { display:block !important; width:100% !important; height:100% !important; max-width:100%; object-fit:cover; }
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
			if (settings.rows > 0) grid.style.setProperty('--wge-row-size', `calc((100vh - 136px) / ${settings.rows})`);
			else grid.style.removeProperty('--wge-row-size');
		}
		document.body.classList.toggle('wge-hide-chrome', settings.hideChrome);
		applying = false;
	}

	function buildPanel() {
		if (document.getElementById(PANEL_ID)) return;
		const panel = document.createElement('aside');
		panel.id = PANEL_ID;
		panel.innerHTML = `<div class="wge-title"><span>Wyze Grid</span><button type="button" title="Minimizar">-</button></div>
			<div class="wge-body"><label>Columnas <input name="columns" type="number" min="1" max="8" value="${settings.columns}"></label>
			<label>Filas (0 = auto) <input name="rows" type="number" min="0" max="8" value="${settings.rows}"></label>
			<label class="wge-range">Separación <output>${settings.gap}px</output><input name="gap" type="range" min="0" max="24" value="${settings.gap}"></label>
			<label>Ocultar navegación <input name="hideChrome" type="checkbox" ${settings.hideChrome ? 'checked' : ''}></label>
			<div class="wge-actions"><button name="apply" type="button">Aplicar</button><button name="reset" type="button">Restablecer</button></div></div>`;
		panel.querySelector('.wge-title button').addEventListener('click', () => {
			panel.dataset.collapsed = panel.dataset.collapsed === 'true' ? 'false' : 'true';
		});
		panel.querySelector('[name="gap"]').addEventListener('input', (event) => {
			panel.querySelector('output').textContent = `${event.target.value}px`;
		});
		panel.querySelector('[name="apply"]').addEventListener('click', () => {
			settings.columns = clamp(panel.querySelector('[name="columns"]').value, 1, 8);
			settings.rows = clamp(panel.querySelector('[name="rows"]').value, 0, 8);
			settings.gap = clamp(panel.querySelector('[name="gap"]').value, 0, 24);
			settings.hideChrome = panel.querySelector('[name="hideChrome"]').checked;
			saveSettings();
			applyGrid();
		});
		panel.querySelector('[name="reset"]').addEventListener('click', () => {
			settings = { ...defaults };
			saveSettings();
			panel.remove();
			buildPanel();
			applyGrid();
		});
		document.body.appendChild(panel);
	}

	function clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, Number.parseInt(value, 10) || minimum));
	}

	function start() {
		addStyle();
		buildPanel();
		applyGrid();
		new MutationObserver(() => window.requestAnimationFrame(applyGrid)).observe(document.body, { childList: true, subtree: true });
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
	else start();
})();
