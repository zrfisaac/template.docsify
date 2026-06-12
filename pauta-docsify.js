// Docsify plugin: replace <pauta>1,2,-3</pauta> or ```pauta blocks with SVG images (e.g. clave-01.svg)
(function () {
	const PAUTA_MIN = 1;
	const PAUTA_MAX = 10;
	const DEFAULT_SVG_HEIGHT_PX = 120;
	const MIN_SVG_HEIGHT_PX_DESKTOP = 56;
	const DESKTOP_MEDIA_QUERY = '(min-width: 769px)';

	function ensurePautaStyles() {
		if (document.getElementById('pauta-docsify-styles')) return;
		const style = document.createElement('style');
		style.id = 'pauta-docsify-styles';
		style.textContent = `
			.pauta-strip {
				display: flex;
				gap: 0;
				align-items: flex-end;
				flex-wrap: nowrap;
				margin: 0;
				padding: 0;
				line-height: 0;
				overflow-x: auto;
				width: 100%;
			}
			.pauta-img {
				display: block;
				height: ${DEFAULT_SVG_HEIGHT_PX}px;
				width: auto;
				max-width: none;
				margin: 0;
				padding: 0;
			}
		`;
		document.head.appendChild(style);
	}

	function isDesktop() {
		return !!(window.matchMedia && window.matchMedia(DESKTOP_MEDIA_QUERY).matches);
	}

	function getImgAspectRatio(img) {
		const w = img.naturalWidth;
		const h = img.naturalHeight;
		if (w > 0 && h > 0) return w / h;
		return 0.7;
	}

	function layoutOneStrip(strip) {
		if (!isDesktop()) return;

		const imgs = Array.from(strip.querySelectorAll('img.pauta-img'));
		if (!imgs.length) return;

		const containerWidth = strip.clientWidth;
		if (!containerWidth) return;

		const sumRatios = imgs.reduce((acc, img) => acc + getImgAspectRatio(img), 0);
		if (!sumRatios) return;

		const widthAtDefault = sumRatios * DEFAULT_SVG_HEIGHT_PX;

		if (widthAtDefault <= containerWidth) {
			strip.style.overflowX = 'hidden';
			for (const img of imgs) img.style.height = '';
			return;
		}

		const fittedHeight = containerWidth / sumRatios;
		const targetHeight = Math.min(
			DEFAULT_SVG_HEIGHT_PX,
			Math.max(MIN_SVG_HEIGHT_PX_DESKTOP, Math.floor(fittedHeight))
		);

		for (const img of imgs) img.style.height = `${targetHeight}px`;

		// If it's too long to fit even at the minimum height, allow horizontal scroll.
		strip.style.overflowX = fittedHeight < MIN_SVG_HEIGHT_PX_DESKTOP ? 'auto' : 'hidden';
	}

	let pautaLayoutScheduled = false;
	function schedulePautaLayout() {
		if (pautaLayoutScheduled) return;
		pautaLayoutScheduled = true;

		window.requestAnimationFrame(() => {
			pautaLayoutScheduled = false;
			const strips = document.querySelectorAll('.pauta-strip');
			strips.forEach((strip) => layoutOneStrip(strip));
		});
	}

	let pautaGlobalListenersInstalled = false;
	function ensurePautaLayoutListeners() {
		if (pautaGlobalListenersInstalled) return;
		pautaGlobalListenersInstalled = true;

		window.addEventListener('resize', schedulePautaLayout, { passive: true });
		if (window.matchMedia) {
			const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
			if (mql && typeof mql.addEventListener === 'function') {
				mql.addEventListener('change', schedulePautaLayout);
			} else if (mql && typeof mql.addListener === 'function') {
				mql.addListener(schedulePautaLayout);
			}
		}
	}

	function pad2(n) {
		return String(n).padStart(2, '0');
	}

	function parseNumbers(raw) {
		return String(raw || '')
			.split(/[,\s]+/)
			.map((s) => s.trim())
			.filter(Boolean)
			.map((token) => {
				const t = token.toLowerCase();
				if (t === 'p') return 'p';
				const n = Number.parseInt(token, 10);
				return Number.isFinite(n) ? n : null;
			})
			.filter((v) => v !== null)
			.filter((v) => {
				if (v === 'p') return true;
				if (v === 0) return true;
				const abs = Math.abs(v);
				return abs >= PAUTA_MIN && abs <= PAUTA_MAX;
			});
	}

	function imgsHtml(nums) {
		if (!nums.length) return '';
		const imgs = nums
			.map((n) => {
				if (n === 'p') {
					const file = 'svg/pausa.svg';
					return `<img class="pauta-img" data-no-zoom src="${file}" alt="${file}">`;
				}
				if (n === 0) {
					const file = 'svg/clave.svg';
					return `<img class="pauta-img" data-no-zoom src="${file}" alt="${file}">`;
				}
				const abs = Math.abs(n);
				const file = n < 0 ? `svg/nota-n${pad2(abs)}.svg` : `svg/nota-p${pad2(abs)}.svg`;
				return `<img class="pauta-img" data-no-zoom src="${file}" alt="${file}">`;
			})
			.join('');
		return `<div class="pauta-strip">${imgs}</div>`;
	}

	function transform(html) {
		let out = html;

		// <pauta>1,2,-3</pauta>
		out = out.replace(/<pauta>([\s\S]*?)<\/pauta>/gi, (_m, inner) => {
			const nums = parseNumbers(inner);
			return imgsHtml(nums) || '<div class="pauta-strip pauta-empty"></div>';
		});

		// ```pauta\n1,2,3\n```
		out = out.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (m, codeInner) => {
			// detect if this code block is a pauta block by checking the first line
			const decoded = codeInner
				.replace(/&nbsp;/g, ' ')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&amp;/g, '&');

			const text = decoded.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
			const lines = text.split(/\r?\n/);
			const head = (lines[0] || '').trim().toLowerCase();
			if (head !== 'pauta') return m;

			const body = lines.slice(1).join(' ');
			const nums = parseNumbers(body);
			return imgsHtml(nums) || '<div class="pauta-strip pauta-empty"></div>';
		});

		return out;
	}

	window.$docsify = window.$docsify || {};
	window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
		hook.ready(function () {
			ensurePautaStyles();
			ensurePautaLayoutListeners();
		});
		hook.afterEach(function (html, next) {
			next(transform(html));
		});
		hook.doneEach(function () {
			// After Docsify renders the page, fit long pauta lines to the available width (desktop only).
			schedulePautaLayout();

			// If some SVGs haven't loaded yet, rerun once they finish loading.
			const pendingImgs = Array.from(document.querySelectorAll('.pauta-strip img.pauta-img')).filter(
				(img) => !img.complete
			);
			if (!pendingImgs.length) return;

			let rerunScheduled = false;
			const onLoadOnce = () => {
				if (rerunScheduled) return;
				rerunScheduled = true;
				schedulePautaLayout();
			};
			for (const img of pendingImgs) {
				img.addEventListener('load', onLoadOnce, { once: true });
				img.addEventListener('error', onLoadOnce, { once: true });
			}
		});
	});
})();

