'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @template {keyof SVGElementTagNameMap} K
 * @param {K} name
 * @returns {SVGElement}
 */
function svg_element(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_style(node, key, value, important) {
	if (value == null) {
		node.style.removeProperty(key);
	} else {
		node.style.setProperty(key, value, '');
	}
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
 *
 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs/svelte#onmount
 * @template T
 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
 * @returns {void}
 */
function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {Promise<void>} */
function tick() {
	schedule_update();
	return resolved_promise;
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

/* src/LoomView.svelte generated by Svelte v4.2.20 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[49] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[52] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[55] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[58] = list[i];
	child_ctx[60] = i;
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[61] = list[i];
	return child_ctx;
}

function get_each_context_5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[58] = list[i];
	return child_ctx;
}

function get_each_context_6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[66] = list[i];
	return child_ctx;
}

// (594:6) {#each zoomLevels as zoomLevel}
function create_each_block_6(ctx) {
	let button;
	let t0_value = getZoomLabel(/*zoomLevel*/ ctx[66]) + "";
	let t0;
	let t1;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[36](/*zoomLevel*/ ctx[66]);
	}

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			attr(button, "class", "svelte-dyk7sv");
			toggle_class(button, "active", /*resolution*/ ctx[1] === /*zoomLevel*/ ctx[66]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			append(button, t1);

			if (!mounted) {
				dispose = listen(button, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*zoomLevels*/ 128 && t0_value !== (t0_value = getZoomLabel(/*zoomLevel*/ ctx[66]) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*resolution, zoomLevels*/ 130) {
				toggle_class(button, "active", /*resolution*/ ctx[1] === /*zoomLevel*/ ctx[66]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (629:12) {#if showLaneFilter}
function create_if_block_1(ctx) {
	let div;
	let each_value_5 = ensure_array_like(/*lanes*/ ctx[3]);
	let each_blocks = [];

	for (let i = 0; i < each_value_5.length; i += 1) {
		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "lane-filter-dropdown svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*lanes, visibleLanes*/ 24) {
				each_value_5 = ensure_array_like(/*lanes*/ ctx[3]);
				let i;

				for (i = 0; i < each_value_5.length; i += 1) {
					const child_ctx = get_each_context_5(ctx, each_value_5, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_5(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_5.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (631:16) {#each lanes as lane}
function create_each_block_5(ctx) {
	let label_1;
	let input;
	let input_checked_value;
	let t0;
	let span;
	let t1_value = /*lane*/ ctx[58] + "";
	let t1;
	let t2;
	let mounted;
	let dispose;

	function change_handler(...args) {
		return /*change_handler*/ ctx[38](/*lane*/ ctx[58], ...args);
	}

	return {
		c() {
			label_1 = element("label");
			input = element("input");
			t0 = space();
			span = element("span");
			t1 = text(t1_value);
			t2 = space();
			attr(input, "type", "checkbox");
			input.checked = input_checked_value = /*visibleLanes*/ ctx[4].has(/*lane*/ ctx[58]);
			attr(input, "class", "svelte-dyk7sv");
			attr(span, "class", "svelte-dyk7sv");
			attr(label_1, "class", "lane-filter-item svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, label_1, anchor);
			append(label_1, input);
			append(label_1, t0);
			append(label_1, span);
			append(span, t1);
			append(label_1, t2);

			if (!mounted) {
				dispose = listen(input, "change", change_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*visibleLanes, lanes*/ 24 && input_checked_value !== (input_checked_value = /*visibleLanes*/ ctx[4].has(/*lane*/ ctx[58]))) {
				input.checked = input_checked_value;
			}

			if (dirty[0] & /*lanes*/ 8 && t1_value !== (t1_value = /*lane*/ ctx[58] + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(label_1);
			}

			mounted = false;
			dispose();
		}
	};
}

// (655:12) {#each timelineLabels as label}
function create_each_block_4(ctx) {
	let div;
	let t_1_value = /*label*/ ctx[61].display + "";
	let t_1;

	return {
		c() {
			div = element("div");
			t_1 = text(t_1_value);
			attr(div, "class", "timeline-label svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*timelineLabels*/ 1024 && t_1_value !== (t_1_value = /*label*/ ctx[61].display + "")) set_data(t_1, t_1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (662:10) {#each filteredLanes as lane, laneIndex}
function create_each_block_3(ctx) {
	let div;
	let t_1_value = /*lane*/ ctx[58] + "";
	let t_1;

	return {
		c() {
			div = element("div");
			t_1 = text(t_1_value);
			attr(div, "class", "region-label svelte-dyk7sv");
			set_style(div, "grid-column", "1");
			set_style(div, "grid-row", /*regionStartRow*/ ctx[14][/*laneIndex*/ ctx[60]] + " / span " + /*placements*/ ctx[5].regionLaneCounts[/*laneIndex*/ ctx[60]]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*filteredLanes*/ 64 && t_1_value !== (t_1_value = /*lane*/ ctx[58] + "")) set_data(t_1, t_1_value);

			if (dirty[0] & /*regionStartRow, placements*/ 16416) {
				set_style(div, "grid-row", /*regionStartRow*/ ctx[14][/*laneIndex*/ ctx[60]] + " / span " + /*placements*/ ctx[5].regionLaneCounts[/*laneIndex*/ ctx[60]]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (668:10) {#each placements.placements as p}
function create_each_block_2(ctx) {
	let div1;
	let button;
	let div0;
	let t0_value = /*p*/ ctx[55].note.title + "";
	let t0;
	let button_class_value;
	let button_style_value;
	let button_title_value;
	let t1;
	let div1_style_value;
	let div1_data_note_path_value;
	let mounted;
	let dispose;

	function click_handler_2() {
		return /*click_handler_2*/ ctx[39](/*p*/ ctx[55]);
	}

	function mouseenter_handler() {
		return /*mouseenter_handler*/ ctx[40](/*p*/ ctx[55]);
	}

	function focus_handler() {
		return /*focus_handler*/ ctx[41](/*p*/ ctx[55]);
	}

	return {
		c() {
			div1 = element("div");
			button = element("button");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div0, "class", "note-title svelte-dyk7sv");
			attr(button, "class", button_class_value = "note-block " + /*p*/ ctx[55].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[6][/*p*/ ctx[55].regionIndex]) + " svelte-dyk7sv");

			attr(button, "style", button_style_value = /*isHighlighted*/ ctx[23](/*p*/ ctx[55].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[6][/*p*/ ctx[55].regionIndex]))}`
			: '');

			attr(button, "title", button_title_value = "" + (/*p*/ ctx[55].note.title + " (" + /*p*/ ctx[55].note.yearStartDisplay + " to " + /*p*/ ctx[55].note.yearEndDisplay + ")"));
			toggle_class(button, "highlight", /*isHighlighted*/ ctx[23](/*p*/ ctx[55].note));
			attr(div1, "class", "note-block-wrapper svelte-dyk7sv");
			attr(div1, "style", div1_style_value = /*getNoteStyle*/ ctx[18](/*p*/ ctx[55]));
			attr(div1, "data-note-path", div1_data_note_path_value = /*p*/ ctx[55].note.path);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button);
			append(button, div0);
			append(div0, t0);
			append(div1, t1);

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler_2),
					listen(button, "mouseenter", mouseenter_handler),
					listen(button, "mouseleave", /*handleMouseOut*/ ctx[21]),
					listen(button, "focus", focus_handler),
					listen(button, "blur", /*handleMouseOut*/ ctx[21])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*placements*/ 32 && t0_value !== (t0_value = /*p*/ ctx[55].note.title + "")) set_data(t0, t0_value);

			if (dirty[0] & /*placements, filteredLanes*/ 96 && button_class_value !== (button_class_value = "note-block " + /*p*/ ctx[55].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[6][/*p*/ ctx[55].regionIndex]) + " svelte-dyk7sv")) {
				attr(button, "class", button_class_value);
			}

			if (dirty[0] & /*placements, filteredLanes*/ 96 && button_style_value !== (button_style_value = /*isHighlighted*/ ctx[23](/*p*/ ctx[55].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[6][/*p*/ ctx[55].regionIndex]))}`
			: '')) {
				attr(button, "style", button_style_value);
			}

			if (dirty[0] & /*placements*/ 32 && button_title_value !== (button_title_value = "" + (/*p*/ ctx[55].note.title + " (" + /*p*/ ctx[55].note.yearStartDisplay + " to " + /*p*/ ctx[55].note.yearEndDisplay + ")"))) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*placements, filteredLanes, isHighlighted, placements*/ 8388704) {
				toggle_class(button, "highlight", /*isHighlighted*/ ctx[23](/*p*/ ctx[55].note));
			}

			if (dirty[0] & /*placements*/ 32 && div1_style_value !== (div1_style_value = /*getNoteStyle*/ ctx[18](/*p*/ ctx[55]))) {
				attr(div1, "style", div1_style_value);
			}

			if (dirty[0] & /*placements*/ 32 && div1_data_note_path_value !== (div1_data_note_path_value = /*p*/ ctx[55].note.path)) {
				attr(div1, "data-note-path", div1_data_note_path_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (686:8) {#if threadLines && mainContentEl}
function create_if_block(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let each_value_1 = ensure_array_like(/*threadLines*/ ctx[8].to);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			svg = svg_element("svg");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(svg, "class", "thread-svg svelte-dyk7sv");
			attr(svg, "pointer-events", "none");
			attr(svg, "width", svg_width_value = /*mainContentEl*/ ctx[0].scrollWidth);
			attr(svg, "height", svg_height_value = /*mainContentEl*/ ctx[0].scrollHeight);
		},
		m(target, anchor) {
			insert(target, svg, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(svg, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*threadLines*/ 256) {
				each_value_1 = ensure_array_like(/*threadLines*/ ctx[8].to);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(svg, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty[0] & /*mainContentEl*/ 1 && svg_width_value !== (svg_width_value = /*mainContentEl*/ ctx[0].scrollWidth)) {
				attr(svg, "width", svg_width_value);
			}

			if (dirty[0] & /*mainContentEl*/ 1 && svg_height_value !== (svg_height_value = /*mainContentEl*/ ctx[0].scrollHeight)) {
				attr(svg, "height", svg_height_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(svg);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (688:12) {#each threadLines.to as t}
function create_each_block_1(ctx) {
	let line;
	let line_x__value;
	let line_y__value;
	let line_x__value_1;
	let line_y__value_1;

	return {
		c() {
			line = svg_element("line");
			attr(line, "x1", line_x__value = /*threadLines*/ ctx[8].from.x);
			attr(line, "y1", line_y__value = /*threadLines*/ ctx[8].from.y);
			attr(line, "x2", line_x__value_1 = /*t*/ ctx[52].x);
			attr(line, "y2", line_y__value_1 = /*t*/ ctx[52].y);
			attr(line, "class", "thread-line svelte-dyk7sv");
			attr(line, "stroke", "var(--text-accent)");
			attr(line, "stroke-width", "2.5");
			attr(line, "stroke-opacity", "0.9");
		},
		m(target, anchor) {
			insert(target, line, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*threadLines*/ 256 && line_x__value !== (line_x__value = /*threadLines*/ ctx[8].from.x)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*threadLines*/ 256 && line_y__value !== (line_y__value = /*threadLines*/ ctx[8].from.y)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*threadLines*/ 256 && line_x__value_1 !== (line_x__value_1 = /*t*/ ctx[52].x)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*threadLines*/ 256 && line_y__value_1 !== (line_y__value_1 = /*t*/ ctx[52].y)) {
				attr(line, "y2", line_y__value_1);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(line);
			}
		}
	};
}

// (613:4) {#key resolution}
function create_key_block(ctx) {
	let div6;
	let div1;
	let div0;
	let button;
	let t1;
	let t2;
	let div3;
	let div2;
	let t3;
	let div4;
	let t4;
	let div5;
	let t5;
	let mounted;
	let dispose;
	let if_block0 = /*showLaneFilter*/ ctx[9] && create_if_block_1(ctx);
	let each_value_4 = ensure_array_like(/*timelineLabels*/ ctx[10]);
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_4.length; i += 1) {
		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	let each_value_3 = ensure_array_like(/*filteredLanes*/ ctx[6]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	let each_value_2 = ensure_array_like(/*placements*/ ctx[5].placements);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let if_block1 = /*threadLines*/ ctx[8] && /*mainContentEl*/ ctx[0] && create_if_block(ctx);

	return {
		c() {
			div6 = element("div");
			div1 = element("div");
			div0 = element("div");
			button = element("button");
			button.textContent = "Filter";
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			div3 = element("div");
			div2 = element("div");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t3 = space();
			div4 = element("div");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();
			div5 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t5 = space();
			if (if_block1) if_block1.c();
			attr(button, "class", "filter-btn svelte-dyk7sv");
			attr(button, "title", "Filter lanes");
			attr(div0, "class", "lane-filter-container svelte-dyk7sv");
			attr(div1, "class", "timeline-corner svelte-dyk7sv");
			set_style(div1, "grid-column", "1");
			set_style(div1, "grid-row", "1");
			attr(div2, "class", "timeline-header svelte-dyk7sv");
			set_style(div2, "grid-template-columns", "repeat(" + /*timelineSpan*/ ctx[11] + ", minmax(" + /*columnMinWidthPx*/ ctx[12] + "px, 1fr))");
			attr(div3, "class", "timeline-header-row svelte-dyk7sv");
			set_style(div3, "grid-column", "2 / -1");
			set_style(div3, "grid-row", "1");
			attr(div4, "class", "region-labels svelte-dyk7sv");
			attr(div5, "class", "loom-grid svelte-dyk7sv");
			attr(div6, "class", "loom-inner-grid svelte-dyk7sv");
			set_style(div6, "grid-template-columns", "150px repeat(" + /*timelineSpan*/ ctx[11] + ", minmax(" + /*columnMinWidthPx*/ ctx[12] + "px, 1fr))");
			set_style(div6, "grid-template-rows", "auto repeat(" + /*totalContentRows*/ ctx[15] + ", minmax(60px, 1fr))");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div1);
			append(div1, div0);
			append(div0, button);
			append(div0, t1);
			if (if_block0) if_block0.m(div0, null);
			append(div6, t2);
			append(div6, div3);
			append(div3, div2);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				if (each_blocks_2[i]) {
					each_blocks_2[i].m(div2, null);
				}
			}

			append(div6, t3);
			append(div6, div4);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(div4, null);
				}
			}

			append(div6, t4);
			append(div6, div5);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div5, null);
				}
			}

			append(div6, t5);
			if (if_block1) if_block1.m(div6, null);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler_1*/ ctx[37]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*showLaneFilter*/ ctx[9]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1(ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*timelineLabels*/ 1024) {
				each_value_4 = ensure_array_like(/*timelineLabels*/ ctx[10]);
				let i;

				for (i = 0; i < each_value_4.length; i += 1) {
					const child_ctx = get_each_context_4(ctx, each_value_4, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_4(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(div2, null);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_4.length;
			}

			if (dirty[0] & /*timelineSpan, columnMinWidthPx*/ 6144) {
				set_style(div2, "grid-template-columns", "repeat(" + /*timelineSpan*/ ctx[11] + ", minmax(" + /*columnMinWidthPx*/ ctx[12] + "px, 1fr))");
			}

			if (dirty[0] & /*regionStartRow, placements, filteredLanes*/ 16480) {
				each_value_3 = ensure_array_like(/*filteredLanes*/ ctx[6]);
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_3(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div4, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_3.length;
			}

			if (dirty[0] & /*getNoteStyle, placements, filteredLanes, isHighlighted, handleNoteClick, handleMouseOver, handleMouseOut*/ 12320864) {
				each_value_2 = ensure_array_like(/*placements*/ ctx[5].placements);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div5, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (/*threadLines*/ ctx[8] && /*mainContentEl*/ ctx[0]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block(ctx);
					if_block1.c();
					if_block1.m(div6, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*timelineSpan, columnMinWidthPx*/ 6144) {
				set_style(div6, "grid-template-columns", "150px repeat(" + /*timelineSpan*/ ctx[11] + ", minmax(" + /*columnMinWidthPx*/ ctx[12] + "px, 1fr))");
			}

			if (dirty[0] & /*totalContentRows*/ 32768) {
				set_style(div6, "grid-template-rows", "auto repeat(" + /*totalContentRows*/ ctx[15] + ", minmax(60px, 1fr))");
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div6);
			}

			if (if_block0) if_block0.d();
			destroy_each(each_blocks_2, detaching);
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
			if (if_block1) if_block1.d();
			mounted = false;
			dispose();
		}
	};
}

// (698:4) {#each eraBookmarks as btn}
function create_each_block(ctx) {
	let button;
	let t0;

	let t1_value = (/*btn*/ ctx[49].year < 0
	? /*btn*/ ctx[49].year
	: '+' + /*btn*/ ctx[49].year) + "";

	let t1;
	let t2;
	let t3_value = /*btn*/ ctx[49].label + "";
	let t3;
	let t4;
	let button_title_value;
	let mounted;
	let dispose;

	function click_handler_3() {
		return /*click_handler_3*/ ctx[43](/*btn*/ ctx[49]);
	}

	return {
		c() {
			button = element("button");
			t0 = text("[");
			t1 = text(t1_value);
			t2 = text("] ");
			t3 = text(t3_value);
			t4 = space();
			attr(button, "type", "button");
			attr(button, "class", "era-snap-btn svelte-dyk7sv");

			attr(button, "title", button_title_value = "Scroll to " + (/*btn*/ ctx[49].year < 0
			? Math.abs(/*btn*/ ctx[49].year) + ' BCE'
			: /*btn*/ ctx[49].year + ' CE'));
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			append(button, t1);
			append(button, t2);
			append(button, t3);
			append(button, t4);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_3);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*eraBookmarks*/ 8192 && t1_value !== (t1_value = (/*btn*/ ctx[49].year < 0
			? /*btn*/ ctx[49].year
			: '+' + /*btn*/ ctx[49].year) + "")) set_data(t1, t1_value);

			if (dirty[0] & /*eraBookmarks*/ 8192 && t3_value !== (t3_value = /*btn*/ ctx[49].label + "")) set_data(t3, t3_value);

			if (dirty[0] & /*eraBookmarks*/ 8192 && button_title_value !== (button_title_value = "Scroll to " + (/*btn*/ ctx[49].year < 0
			? Math.abs(/*btn*/ ctx[49].year) + ' BCE'
			: /*btn*/ ctx[49].year + ' CE'))) {
				attr(button, "title", button_title_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

function create_fragment(ctx) {
	let div5;
	let div2;
	let div1;
	let div0;
	let t0;
	let t1_value = /*notes*/ ctx[2].length + "";
	let t1;
	let t2;
	let t3;
	let t4;
	let div3;
	let previous_key = /*resolution*/ ctx[1];
	let t5;
	let div4;
	let each_value_6 = ensure_array_like(/*zoomLevels*/ ctx[7]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_6.length; i += 1) {
		each_blocks_1[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
	}

	let key_block = create_key_block(ctx);
	let each_value = ensure_array_like(/*eraBookmarks*/ ctx[13]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div5 = element("div");
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			t0 = text("Woven ");
			t1 = text(t1_value);
			t2 = text(" notes");
			t3 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();
			div3 = element("div");
			key_block.c();
			t5 = space();
			div4 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "note-counter svelte-dyk7sv");
			attr(div1, "class", "loom-controls svelte-dyk7sv");
			attr(div2, "class", "loom-top-bar svelte-dyk7sv");
			attr(div3, "class", "loom-main-content svelte-dyk7sv");
			attr(div4, "class", "era-snap-rail svelte-dyk7sv");
			attr(div5, "class", "loom-view svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div5, anchor);
			append(div5, div2);
			append(div2, div1);
			append(div1, div0);
			append(div0, t0);
			append(div0, t1);
			append(div0, t2);
			append(div1, t3);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				if (each_blocks_1[i]) {
					each_blocks_1[i].m(div1, null);
				}
			}

			append(div5, t4);
			append(div5, div3);
			key_block.m(div3, null);
			/*div3_binding*/ ctx[42](div3);
			append(div5, t5);
			append(div5, div4);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div4, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*notes*/ 4 && t1_value !== (t1_value = /*notes*/ ctx[2].length + "")) set_data(t1, t1_value);

			if (dirty[0] & /*resolution, zoomLevels, scrollToCenturyEnd, scrollToDecadeOrYear*/ 196738) {
				each_value_6 = ensure_array_like(/*zoomLevels*/ ctx[7]);
				let i;

				for (i = 0; i < each_value_6.length; i += 1) {
					const child_ctx = get_each_context_6(ctx, each_value_6, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_6(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div1, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_6.length;
			}

			if (dirty[0] & /*resolution*/ 2 && safe_not_equal(previous_key, previous_key = /*resolution*/ ctx[1])) {
				key_block.d(1);
				key_block = create_key_block(ctx);
				key_block.c();
				key_block.m(div3, null);
			} else {
				key_block.p(ctx, dirty);
			}

			if (dirty[0] & /*eraBookmarks, scrollToYear*/ 4202496) {
				each_value = ensure_array_like(/*eraBookmarks*/ ctx[13]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div4, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div5);
			}

			destroy_each(each_blocks_1, detaching);
			key_block.d(detaching);
			/*div3_binding*/ ctx[42](null);
			destroy_each(each_blocks, detaching);
		}
	};
}

function getZoomLabel(level) {
	if (level === 1) return 'Year';
	if (level === 10) return 'Decade';
	if (level === 100) return 'Century';
	if (level === 1000) return 'Millennium';
	return `${level} Years`;
}

/** Region slug for CSS class (e.g. "South-Asia" -> "south-asia"). */
function getRegionSlug(region) {
	return region.toLowerCase().replace(/\s+/g, '-');
}

/** Generate consistent color from lane name using hash function. */
function getLaneColor(laneSlug) {
	// Simple hash function to generate consistent colors
	let hash = 0;

	for (let i = 0; i < laneSlug.length; i++) {
		hash = laneSlug.charCodeAt(i) + ((hash << 5) - hash);
	}

	// Generate HSL color with fixed saturation and lightness for good visibility
	const hue = Math.abs(hash) % 360;

	return `hsl(${hue}, 60%, 50%)`;
}

function cleanFigure(figure) {
	// [[Julius Caesar]] -> Julius Caesar
	return figure.replace(/\[\[|\]\]/g, '').trim();
}

/** Dual-track date parser: integers auto-format, strings preserve raw display */
function parseDateValue(value) {
	if (value === null || value === undefined) return null;

	// TRACK A: Pure integer input (number type)
	if (typeof value === 'number') {
		const display = value < 0 ? `${Math.abs(value)} BCE` : `${value} CE`;
		return { coordinate: value, display };
	}

	const str = String(value).trim();
	if (!str) return null;

	// TRACK A: Pure numeric string (e.g., "-500", "2024")
	if ((/^-?\d+$/).test(str)) {
		const num = parseInt(str, 10);
		const display = num < 0 ? `${Math.abs(num)} BCE` : `${num} CE`;
		return { coordinate: num, display };
	}

	// TRACK B: String with text - extract last integer, keep raw display
	// This handles formats like "Era 1: 450" (use 450) or "Year 2024" (use 2024)
	const matches = str.match(/-?\d+/g);

	if (!matches || matches.length === 0) return null;

	return {
		coordinate: parseInt(matches[matches.length - 1], 10), // Use LAST integer
		display: str, // Show raw string as-is in UI
		
	};
}

/** Two intervals [s1,e1] and [s2,e2] (inclusive) overlap iff s1 <= e2 && s2 <= e1. */
function intervalsOverlap(s1, e1, s2, e2) {
	return s1 <= e2 && s2 <= e1;
}

/** Assign subLane (0,1,2,...) per note so overlapping notes in the same region get different lanes. */
function assignSubLanes(regionNotes) {
	const sorted = [...regionNotes].sort((a, b) => a.startCol !== b.startCol
	? a.startCol - b.startCol
	: a.endCol - b.endCol);

	const lanes = [];
	const result = [];

	for (const { note, startCol, endCol } of sorted) {
		let laneIndex = 0;

		while (laneIndex < lanes.length) {
			const existing = lanes[laneIndex];
			if (!intervalsOverlap(startCol, endCol, existing.startCol, existing.endCol)) break;
			laneIndex++;
		}

		if (laneIndex === lanes.length) {
			lanes.push({ startCol, endCol });
		} else {
			const ex = lanes[laneIndex];

			lanes[laneIndex] = {
				startCol: Math.min(ex.startCol, startCol),
				endCol: Math.max(ex.endCol, endCol)
			};
		}

		result.push({
			note,
			startCol,
			endCol,
			subLane: laneIndex
		});
	}

	return result;
}

function getConnectionValues(note) {
	const allValues = [];

	for (const values of note.connectionValues.values()) {
		allValues.push(...values);
	}

	return allValues;
}

function instance($$self, $$props, $$invalidate) {
	let zoomLevels;
	let filteredLanes;
	let userOrderArray;
	let userOrderSet;
	let placements;
	let regionStartRow;
	let totalContentRows;
	let sortedYears;
	let connectionValuesMap;
	let eraBookmarks;
	let columnMinWidthPx;
	let timelineSpan;
	let timelineLabels;

	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
			? value
			: new P(function (resolve) {
						resolve(value);
					});
		}

		return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value));
					} catch(e) {
						reject(e);
					}
				}

				function rejected(value) {
					try {
						step(generator["throw"](value));
					} catch(e) {
						reject(e);
					}
				}

				function step(result) {
					result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
				}

				step((generator = generator.apply(thisArg, _arguments || [])).next());
			});
	};

	let { app } = $$props;
	let { settings } = $$props;
	let { saveVisibleLanes } = $$props;
	let mainContentEl;

	// State for temporal resolution (now a number representing years per unit)
	let resolution = 10; // Default to decade

	let notes = [];
	let lanes = [];
	let yearRange = { min: 0, max: 0 };
	let hoveredConnectionValues = [];
	let hoveredNotePath = null; /* source note for Entity Glow / Thread */
	let hasScrolledInitial = false;
	let threadLines = null;
	let isFictionalCalendar = false; // Track if we're using fictional dates (non-numeric strings)

	// Lane filter state
	let visibleLanes = new Set();

	let showLaneFilter = false;

	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
		// Helper function to check if a path matches a folder pattern (supports wildcards)
		function matchesFolder(filePath, pattern) {
			// Convert wildcard pattern to regex
			// "History/*" becomes /^History\/[^\/]+/
			// "History/Ancient" becomes exact match
			if (pattern.indexOf('*') !== -1) {
				// Escape special regex characters except *
				const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

				// Replace * with [^/]+ (match any characters except /)
				const regexPattern = '^' + escapedPattern.replace(/\*/g, '[^/]+');

				const regex = new RegExp(regexPattern);
				return regex.test(filePath);
			} else {
				// Exact folder match
				return filePath.startsWith(pattern + '/') || filePath.startsWith(pattern);
			}
		}

		// Helper function to check if a tag matches a pattern (Obsidian-style)
		function matchesTag(tag, pattern) {
			// Obsidian behavior: searching for "inbox" matches "#inbox" AND "#inbox/to-read" AND "#inbox/processing"
			// So "History" matches "History", "History/India", "History/Ancient", etc.
			// And "History/" matches only nested children like "History/India" (not "History" itself)
			if (pattern.endsWith('/')) {
				// Pattern ends with / - only match nested children
				return tag.startsWith(pattern);
			} else {
				// Pattern without trailing / - match exact OR nested children
				return tag === pattern || tag.startsWith(pattern + '/');
			}
		}

		const processNotes = () => {
			var _a;
			const allFiles = app.vault.getMarkdownFiles();

			// Parse scope settings
			const sourceFolders = settings.sourceFolders.split(',').map(s => s.trim()).filter(Boolean);

			const requiredTags = settings.requiredTags.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
			const scopeOperator = settings.scopeOperator;

			// Filter files based on scope settings
			const files = allFiles.filter(file => {
				var _a, _b;

				// If no filters specified, include all files
				if (sourceFolders.length === 0 && requiredTags.length === 0) {
					return true;
				}

				const cache = app.metadataCache.getFileCache(file);

				// Check folder match with wildcard support
				const folderMatch = sourceFolders.length === 0 || sourceFolders.some(folder => matchesFolder(file.path, folder));

				// Check tag match with wildcard support
				let tagMatch = requiredTags.length === 0;

				if (requiredTags.length > 0 && cache) {
					const fileTags = ((_a = cache.tags) === null || _a === void 0
					? void 0
					: _a.map(t => t.tag.replace(/^#/, ''))) || [];

					const frontmatterTags = (_b = cache.frontmatter) === null || _b === void 0
					? void 0
					: _b.tags;

					const allTags = [...fileTags];

					if (frontmatterTags) {
						if (Array.isArray(frontmatterTags)) {
							allTags.push(...frontmatterTags.map(t => String(t).replace(/^#/, '')));
						} else {
							allTags.push(String(frontmatterTags).replace(/^#/, ''));
						}
					}

					tagMatch = requiredTags.some(reqTag => allTags.some(fileTag => matchesTag(fileTag, reqTag)));
				}

				// Apply operator logic
				if (scopeOperator === 'AND') {
					return folderMatch && tagMatch;
				} else {
					// OR logic: if both filters are specified, at least one must match
					if (sourceFolders.length > 0 && requiredTags.length > 0) {
						return folderMatch || tagMatch;
					}

					return folderMatch && tagMatch;
				}
			});

			const loomNotes = [];
			let minYear = Infinity;
			let maxYear = -Infinity;
			let detectedFictionalCalendar = false;

			// Parse connection keys from settings
			const connKeys = settings.connectionKeys.split(',').map(s => s.trim()).filter(Boolean);

			for (const file of files) {
				const cache = app.metadataCache.getFileCache(file);

				const frontmatter = cache === null || cache === void 0
				? void 0
				: cache.frontmatter;

				if (frontmatter) {
					// Parse dates using dual-track parser
					const startDateValue = frontmatter[settings.startDateKey];

					const endDateValue = (_a = frontmatter[settings.endDateKey]) !== null && _a !== void 0
					? _a
					: startDateValue;

					// Detect fictional calendar during main loop (check first valid date)
					if (!detectedFictionalCalendar && startDateValue && typeof startDateValue === 'string') {
						detectedFictionalCalendar = !(/^-?\d+$/).test(startDateValue.trim());
					}

					const parsedStart = parseDateValue(startDateValue);
					const parsedEnd = parseDateValue(endDateValue);

					if (parsedStart && parsedEnd) {
						minYear = Math.min(minYear, parsedStart.coordinate);
						maxYear = Math.max(maxYear, parsedEnd.coordinate);

						// Get lane values from configured key
						const laneValue = frontmatter[settings.laneKey];

						const laneArray = Array.isArray(laneValue)
						? laneValue.map(String)
						: laneValue ? [String(laneValue)] : [];

						// Build connection values map from all configured keys
						const connectionValues = new Map();

						for (const key of connKeys) {
							const val = frontmatter[key];

							const cleaned = Array.isArray(val)
							? val.map(cleanFigure)
							: val ? [cleanFigure(String(val))] : [];

							connectionValues.set(key, cleaned);
						}

						const note = {
							path: file.path,
							fileName: file.basename,
							title: frontmatter.title || file.basename,
							lanes: laneArray,
							yearStart: parsedStart.coordinate,
							yearEnd: parsedEnd.coordinate,
							yearStartDisplay: parsedStart.display,
							yearEndDisplay: parsedEnd.display,
							connectionValues,
							noteStyle: frontmatter['note-style'] || 'event'
						};

						loomNotes.push(note);
					}
				}
			}

			isFictionalCalendar = detectedFictionalCalendar;
			$$invalidate(2, notes = loomNotes);

			// Dynamic lane discovery and sorting using Set for O(1) lookups
			const allLaneValuesSet = new Set();

			notes.forEach(n => {
				n.lanes.forEach(l => allLaneValuesSet.add(l));
			});

			const allLaneValues = Array.from(allLaneValuesSet);
			const userOrder = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);

			// Sort: user-ordered first, then alphabetical for discovered ones
			const orderedLanes = userOrder.filter(l => allLaneValues.indexOf(l) !== -1);

			const unorderedLanes = allLaneValues.filter(l => userOrder.indexOf(l) === -1).sort();

			// Build final lane list
			let finalLanes = [...orderedLanes, ...unorderedLanes];

			// Add "Others" lane if enabled and there are notes with lanes not in userOrder
			if (settings.showUncategorized) {
				const userOrderSet = new Set(userOrder);
				const hasUncategorized = notes.some(n => n.lanes.length > 0 && n.lanes.some(l => !userOrderSet.has(l)));

				if (hasUncategorized || notes.some(n => n.lanes.length === 0)) {
					finalLanes.push('Others');
				}
			}

			$$invalidate(3, lanes = finalLanes);
			$$invalidate(27, yearRange = { min: minYear, max: maxYear });
		};

		// Wait for the metadata cache to be resolved before processing notes
		app.metadataCache.on('resolved', processNotes);

		// Initial run
		processNotes();
	}));

	function formatYearLabel(year) {
		// For fictional calendars, just show the coordinate number
		if (isFictionalCalendar) {
			return String(year);
		}

		// For historical dates, use BCE/CE formatting
		if (year < 0) return `${Math.abs(year)} BCE`;

		return `${year} CE`;
	}

	/** Compute 0-based time column range for a note (for interval packing). */
	function getNoteColumnRange(note) {
		const resValue = resolution;
		const start = Math.floor(note.yearStart / resValue);
		const end = Math.floor(note.yearEnd / resValue);
		const min = Math.floor(yearRange.min / resValue);
		return { startCol: start - min, endCol: end - min };
	}

	// Initialize visible lanes when lanes change
	let lastSavedLanes = [];

	/** Scroll Decade/Year view to 80th percentile of note years. */
	function scrollToDecadeOrYear() {
		if (notes.length === 0 || !mainContentEl || sortedYears.length === 0) return;
		const targetYear = sortedYears[Math.min(Math.floor(sortedYears.length * 0.8), sortedYears.length - 1)];
		const resValue = resolution;
		const min = Math.floor(yearRange.min / resValue);
		const targetColumn = Math.floor(targetYear / resValue) - min;
		const targetScrollLeft = targetColumn * columnMinWidthPx;

		tick().then(() => {
			if (mainContentEl) {
				const centered = targetScrollLeft - mainContentEl.clientWidth / 2 + columnMinWidthPx / 2;
				$$invalidate(0, mainContentEl.scrollLeft = centered > 0 ? centered : 0, mainContentEl);
			}
		});
	}

	/** Century view only: scroll to the end of the timeline. Called after Century grid has re-mounted. */
	function scrollToCenturyEnd() {
		if (!mainContentEl) return;

		tick().then(() => {
			if (mainContentEl) {
				const maxScroll = mainContentEl.scrollWidth - mainContentEl.clientWidth;
				$$invalidate(0, mainContentEl.scrollLeft = maxScroll, mainContentEl);
			}
		});
	}

	function getNoteStyle(p) {
		const { startCol, endCol, regionIndex, subLane } = p;
		const gridRow = regionStartRow[regionIndex] + subLane;
		const gridColumnStart = startCol + 2; // +1 for 1-based, +1 for region column
		const gridColumnEnd = endCol + 3; // endCol inclusive -> span endCol - startCol + 1

		return `
      grid-column: ${gridColumnStart} / ${gridColumnEnd};
      grid-row: ${gridRow};
    `;
	}

	function handleNoteClick(path) {
		app.workspace.openLinkText(path, '/', false);
	}

	function handleMouseOver(note, sourcePath) {
		const connectionValues = getConnectionValues(note);
		$$invalidate(28, hoveredConnectionValues = connectionValues);
		$$invalidate(29, hoveredNotePath = sourcePath);
	}

	function handleMouseOut() {
		$$invalidate(28, hoveredConnectionValues = []);
		$$invalidate(29, hoveredNotePath = null);
		$$invalidate(8, threadLines = null);
	}

	// Build element map when placements change
	let elementMap = new Map();

	/** Era-Snap: scroll so the given year is visible (smooth). */
	function scrollToYear(year) {
		if (!mainContentEl) return;
		const resValue = resolution;
		const min = Math.floor(yearRange.min / resValue);
		const columnIndex = Math.floor(year / resValue) - min;
		const targetX = Math.max(0, columnIndex * columnMinWidthPx);
		mainContentEl.scrollTo({ left: targetX, behavior: 'smooth' });
	}

	function isHighlighted(note) {
		if (hoveredConnectionValues.length === 0) return false;
		const noteValues = connectionValuesMap.get(note.path) || [];
		const hoveredSet = new Set(hoveredConnectionValues);
		return noteValues.some(v => hoveredSet.has(v));
	}

	const click_handler = zoomLevel => {
		$$invalidate(1, resolution = zoomLevel);

		if (zoomLevel >= 100) {
			tick().then(() => scrollToCenturyEnd());
		} else {
			scrollToDecadeOrYear();
		}
	};

	const click_handler_1 = () => {
		$$invalidate(9, showLaneFilter = !showLaneFilter);
	};

	const change_handler = (lane, e) => {
		if (e.currentTarget.checked) {
			$$invalidate(4, visibleLanes = new Set([...visibleLanes, lane]));
		} else {
			const newSet = new Set(visibleLanes);
			newSet.delete(lane);
			$$invalidate(4, visibleLanes = newSet);
		}
	};

	const click_handler_2 = p => handleNoteClick(p.note.path);
	const mouseenter_handler = p => handleMouseOver(p.note, p.note.path);
	const focus_handler = p => handleMouseOver(p.note, p.note.path);

	function div3_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			mainContentEl = $$value;
			$$invalidate(0, mainContentEl);
		});
	}

	const click_handler_3 = btn => scrollToYear(btn.year);

	$$self.$$set = $$props => {
		if ('app' in $$props) $$invalidate(24, app = $$props.app);
		if ('settings' in $$props) $$invalidate(25, settings = $$props.settings);
		if ('saveVisibleLanes' in $$props) $$invalidate(26, saveVisibleLanes = $$props.saveVisibleLanes);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*settings*/ 33554432) {
			// Parse zoom levels from settings
			$$invalidate(7, zoomLevels = (() => {
				try {
					return settings.zoomLevels.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
				} catch(_a) {
					return [1, 10, 100]; // Fallback to defaults
				}
			})());
		}

		if ($$self.$$.dirty[0] & /*zoomLevels, resolution*/ 130) {
			// Ensure current resolution is valid when zoomLevels change
			if (zoomLevels.length > 0 && zoomLevels.indexOf(resolution) === -1) {
				$$invalidate(1, resolution = zoomLevels[0]); // Reset to first available zoom level
			}
		}

		if ($$self.$$.dirty[0] & /*lanes, visibleLanes, settings*/ 33554456) {
			if (lanes.length > 0 && visibleLanes.size === 0) {
				// Initialize from saved settings or show all lanes
				if (settings.visibleLanes && settings.visibleLanes.length > 0) {
					const filtered = settings.visibleLanes.filter(lane => lanes.indexOf(lane) !== -1);

					// If none of the saved lanes exist in current view, show all lanes instead
					if (filtered.length > 0) {
						$$invalidate(4, visibleLanes = new Set(filtered));
						$$invalidate(31, lastSavedLanes = filtered);
					} else {
						$$invalidate(4, visibleLanes = new Set(lanes));
						$$invalidate(31, lastSavedLanes = [...lanes]);
					}
				} else {
					$$invalidate(4, visibleLanes = new Set(lanes));
					$$invalidate(31, lastSavedLanes = [...lanes]);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*visibleLanes, saveVisibleLanes*/ 67108880 | $$self.$$.dirty[1] & /*lastSavedLanes*/ 1) {
			// Save visible lanes to settings when they change
			if (visibleLanes.size > 0) {
				const visibleLanesArray = Array.from(visibleLanes).sort();
				const lastSaved = lastSavedLanes.slice().sort();

				if (JSON.stringify(visibleLanesArray) !== JSON.stringify(lastSaved)) {
					$$invalidate(31, lastSavedLanes = visibleLanesArray);
					saveVisibleLanes(visibleLanesArray);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*lanes, visibleLanes*/ 24) {
			$$invalidate(6, filteredLanes = lanes.filter(lane => visibleLanes.has(lane)));
		}

		if ($$self.$$.dirty[0] & /*settings*/ 33554432) {
			// Memoize userOrderArray to avoid parsing on every placements recalculation
			$$invalidate(35, userOrderArray = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean));
		}

		if ($$self.$$.dirty[1] & /*userOrderArray*/ 16) {
			$$invalidate(34, userOrderSet = new Set(userOrderArray));
		}

		if ($$self.$$.dirty[0] & /*resolution, filteredLanes, notes*/ 70 | $$self.$$.dirty[1] & /*userOrderSet*/ 8) {
			$$invalidate(5, placements = (() => {
				const list = [];
				const regionLaneCounts = [];

				// Only process visible lanes
				for (let filteredIndex = 0; filteredIndex < filteredLanes.length; filteredIndex++) {
					const lane = filteredLanes[filteredIndex];

					const laneNotes = notes.filter(n => {
						if (lane === 'Others') {
							// "Others" lane: notes with lanes not in userOrder, or no lanes
							return n.lanes.length === 0 || n.lanes.some(l => !userOrderSet.has(l));
						} else {
							// Regular lane: notes with this lane value
							return n.lanes.indexOf(lane) !== -1;
						}
					}).map(n => {
						const { startCol, endCol } = getNoteColumnRange(n);
						return { note: n, startCol, endCol };
					});

					const withSubLanes = assignSubLanes(laneNotes);

					const numLanes = laneNotes.length === 0
					? 1
					: Math.max(...withSubLanes.map(p => p.subLane)) + 1;

					regionLaneCounts.push(numLanes);

					for (const p of withSubLanes) {
						list.push({
							note: p.note,
							startCol: p.startCol,
							endCol: p.endCol,
							regionIndex: filteredIndex,
							subLane: p.subLane
						});
					}
				}

				return { placements: list, regionLaneCounts };
			})());
		}

		if ($$self.$$.dirty[0] & /*filteredLanes, placements*/ 96) {
			$$invalidate(14, regionStartRow = (() => {
				var _a;
				const start = [];
				let row = 2; // row 1 = timeline

				for (let i = 0; i < filteredLanes.length; i++) {
					start.push(row);

					row += (_a = placements.regionLaneCounts[i]) !== null && _a !== void 0
					? _a
					: 1;
				}

				return start;
			})());
		}

		if ($$self.$$.dirty[0] & /*placements*/ 32) {
			$$invalidate(15, totalContentRows = placements.regionLaneCounts.reduce((a, b) => a + b, 0) || 1);
		}

		if ($$self.$$.dirty[0] & /*mainContentEl, notes, hasScrolledInitial, resolution*/ 1073741831) {
			/** One-time scroll when view opens with data (avoids reactive loop). */
			if (mainContentEl && notes.length > 0 && !hasScrolledInitial) {
				$$invalidate(30, hasScrolledInitial = true);

				tick().then(() => {
					if (resolution >= 100) scrollToCenturyEnd(); else scrollToDecadeOrYear();
				});
			}
		}

		if ($$self.$$.dirty[0] & /*notes*/ 4) {
			// Memoize sorted years to avoid sorting on every scroll call
			sortedYears = notes.length > 0
			? notes.map(n => n.yearStart).sort((a, b) => a - b)
			: [];
		}

		if ($$self.$$.dirty[0] & /*notes*/ 4) {
			// Pre-build connection values map for efficient lookup
			$$invalidate(33, connectionValuesMap = (() => {
				const map = new Map();

				notes.forEach(note => {
					map.set(note.path, getConnectionValues(note));
				});

				return map;
			})());
		}

		if ($$self.$$.dirty[0] & /*placements, mainContentEl*/ 33 | $$self.$$.dirty[1] & /*elementMap*/ 2) {
			if (placements.placements.length > 0 && mainContentEl) {
				tick().then(() => {
					requestAnimationFrame(() => {
						if (!mainContentEl) return;
						const wrappers = mainContentEl.querySelectorAll('[data-note-path]');
						$$invalidate(32, elementMap = new Map());

						wrappers.forEach(w => {
							const path = w.getAttribute('data-note-path');
							if (path) elementMap.set(path, w);
						});
					});
				});
			}
		}

		if ($$self.$$.dirty[0] & /*hoveredConnectionValues, hoveredNotePath, mainContentEl, notes*/ 805306373 | $$self.$$.dirty[1] & /*connectionValuesMap, elementMap*/ 6) {
			/** Update thread lines from hovered note to highlighted contemporaries (Entity Glow bonus). */
			/** Use data (notes + hoveredConnectionValues) to decide which notes are highlighted; find DOM by data-note-path so we don't rely on .highlight class timing. */
			if (hoveredConnectionValues.length > 0 && hoveredNotePath && mainContentEl) {
				const currentHoveredPath = hoveredNotePath;
				const hoveredSet = new Set(hoveredConnectionValues);

				const highlightedPaths = notes.filter(n => {
					const noteValues = connectionValuesMap.get(n.path) || [];
					return noteValues.some(v => hoveredSet.has(v));
				}).map(n => n.path);

				const otherPaths = highlightedPaths.filter(p => p !== currentHoveredPath);

				tick().then(() => {
					requestAnimationFrame(() => {
						if (!mainContentEl || !currentHoveredPath || otherPaths.length === 0) {
							$$invalidate(8, threadLines = null);
							return;
						}

						const sourceEl = elementMap.get(currentHoveredPath);

						if (!sourceEl) {
							$$invalidate(8, threadLines = null);
							return;
						}

						const containerRect = mainContentEl.getBoundingClientRect();

						const getCenter = el => {
							const r = el.getBoundingClientRect();

							return {
								x: r.left - containerRect.left + mainContentEl.scrollLeft + r.width / 2,
								y: r.top - containerRect.top + mainContentEl.scrollTop + r.height / 2
							};
						};

						const from = getCenter(sourceEl);
						const to = [];

						otherPaths.forEach(path => {
							const el = elementMap.get(path);
							if (el) to.push(getCenter(el));
						});

						$$invalidate(8, threadLines = to.length > 0 ? { from, to } : null);
					});
				});
			} else if (!hoveredConnectionValues.length) {
				$$invalidate(8, threadLines = null);
			}
		}

		if ($$self.$$.dirty[0] & /*settings*/ 33554432) {
			// Parse era bookmarks from settings
			$$invalidate(13, eraBookmarks = (() => {
				const bookmarks = [];
				const lines = settings.eraBookmarks.split('\n');

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed) continue;
					const match = trimmed.match(/^(.+?):\s*(-?\d+)$/);

					if (match) {
						const label = match[1].trim();
						const year = parseInt(match[2], 10);

						if (!isNaN(year)) {
							bookmarks.push({ label, year });
						}
					}
				}

				return bookmarks;
			})());
		}

		if ($$self.$$.dirty[0] & /*resolution*/ 2) {
			$$invalidate(12, columnMinWidthPx = resolution >= 100 ? 140 : 80); /* wider columns in Century+ so note titles are readable */
		}

		if ($$self.$$.dirty[0] & /*yearRange, resolution*/ 134217730) {
			$$invalidate(11, timelineSpan = (() => {
				if (yearRange.max === -Infinity) return 1;
				const resValue = resolution;
				const start = Math.floor(yearRange.min / resValue);
				const end = Math.ceil(yearRange.max / resValue); // include next period so notes near boundary aren't cut off (e.g. 2099 -> show 2100)
				return end - start + 1;
			})());
		}

		if ($$self.$$.dirty[0] & /*yearRange, resolution*/ 134217730) {
			$$invalidate(10, timelineLabels = (() => {
				if (yearRange.max === -Infinity) return [];
				const resValue = resolution;
				const start = Math.floor(yearRange.min / resValue);
				const end = Math.ceil(yearRange.max / resValue);
				const labels = [];

				for (let i = start; i <= end; i++) {
					const coordinate = i * resValue;

					labels.push({
						coordinate,
						display: formatYearLabel(coordinate)
					});
				}

				return labels;
			})());
		}
	};

	return [
		mainContentEl,
		resolution,
		notes,
		lanes,
		visibleLanes,
		placements,
		filteredLanes,
		zoomLevels,
		threadLines,
		showLaneFilter,
		timelineLabels,
		timelineSpan,
		columnMinWidthPx,
		eraBookmarks,
		regionStartRow,
		totalContentRows,
		scrollToDecadeOrYear,
		scrollToCenturyEnd,
		getNoteStyle,
		handleNoteClick,
		handleMouseOver,
		handleMouseOut,
		scrollToYear,
		isHighlighted,
		app,
		settings,
		saveVisibleLanes,
		yearRange,
		hoveredConnectionValues,
		hoveredNotePath,
		hasScrolledInitial,
		lastSavedLanes,
		elementMap,
		connectionValuesMap,
		userOrderSet,
		userOrderArray,
		click_handler,
		click_handler_1,
		change_handler,
		click_handler_2,
		mouseenter_handler,
		focus_handler,
		div3_binding,
		click_handler_3
	];
}

let LoomView$1 = class LoomView extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				app: 24,
				settings: 25,
				saveVisibleLanes: 26
			},
			null,
			[-1, -1, -1]
		);
	}
};

const LOOM_VIEW_TYPE = 'loom-view';
const DEFAULT_SETTINGS = {
    startDateKey: 'year-start',
    endDateKey: 'year-end',
    laneKey: 'region',
    laneOrder: 'Americas, Europe, Africa, Asia, South-Asia, East-Asia',
    showUncategorized: true,
    connectionKeys: 'key-figures',
    zoomLevels: '1, 10, 100',
    eraBookmarks: 'Bronze: -3000\nIron: -1200\nClassical: -500\nDiscovery: 1400\nModern: 1900',
    sourceFolders: '',
    requiredTags: '',
    scopeOperator: 'OR',
    visibleLanes: [],
};
class LoomView extends obsidian.ItemView {
    constructor(leaf, settings) {
        super(leaf);
        this.settings = settings;
    }
    getViewType() {
        return LOOM_VIEW_TYPE;
    }
    getDisplayText() {
        return 'Loom';
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.component = new LoomView$1({
                target: this.contentEl,
                props: {
                    app: this.app,
                    settings: this.settings,
                    saveVisibleLanes: (lanes) => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b;
                        const plugin = (_b = (_a = this.app.plugins) === null || _a === void 0 ? void 0 : _a.plugins) === null || _b === void 0 ? void 0 : _b['loom-view'];
                        if (plugin) {
                            plugin.settings.visibleLanes = lanes;
                            yield plugin.saveSettings();
                        }
                    })
                }
            });
        });
    }
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.component) {
                this.component.$destroy();
            }
        });
    }
}
class LoomViewPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new LoomViewSettingsTab(this.app, this));
            this.registerView(LOOM_VIEW_TYPE, (leaf) => new LoomView(leaf, this.settings));
            this.addRibbonIcon('git-branch-plus', 'Open Loom View', () => {
                this.activateView();
            });
            this.addCommand({
                id: 'open-loom-view',
                name: 'Open Loom View',
                callback: () => {
                    this.activateView();
                }
            });
        });
    }
    onunload() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            // Update settings in all open views
            const leaves = this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE);
            for (const leaf of leaves) {
                const view = leaf.view;
                if (view && view.component) {
                    view.settings = this.settings;
                    view.component.$set({ settings: this.settings });
                }
            }
        });
    }
    activateView() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.workspace.detachLeavesOfType(LOOM_VIEW_TYPE);
            const leaf = this.app.workspace.getLeaf(false);
            if (leaf) {
                yield leaf.setViewState({
                    type: LOOM_VIEW_TYPE,
                    active: true,
                });
                this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE)[0]);
            }
        });
    }
}
class LoomViewSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        // Add CSS to prevent textarea resizing
        containerEl.createEl('style', {
            text: '.setting-item textarea { resize: none; }'
        });
        containerEl.createEl('h2', { text: 'Loom View Settings' });
        containerEl.createEl('h3', { text: 'Data Scope' });
        new obsidian.Setting(containerEl)
            .setName('Source Folders')
            .setDesc('Comma-separated folder paths to include. Supports wildcards (e.g., "History/*" matches all History subfolders, "History/Ancient, Projects/*"). Leave empty to include all folders.')
            .addText(text => text
            .setPlaceholder('History/*, Projects/Timeline')
            .setValue(this.plugin.settings.sourceFolders)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.sourceFolders = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Required Tags')
            .setDesc('Comma-separated tags to filter by. Follows Obsidian tag search: "History" matches "#History" and all nested like "#History/India". Use "History/" to match only nested children. Examples: "#ancient, History, #empire". Leave empty to include all tags.')
            .addText(text => text
            .setPlaceholder('#ancient, History, #empire')
            .setValue(this.plugin.settings.requiredTags)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.requiredTags = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Scope Operator')
            .setDesc('How to combine folder and tag filters')
            .addDropdown(dropdown => dropdown
            .addOption('OR', 'Match Any (OR)')
            .addOption('AND', 'Match All (AND)')
            .setValue(this.plugin.settings.scopeOperator)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.scopeOperator = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl('h3', { text: 'View Settings' });
        new obsidian.Setting(containerEl)
            .setName('Start Date Key')
            .setDesc('Frontmatter key for the start date (e.g., "year-start")')
            .addText(text => text
            .setPlaceholder('year-start')
            .setValue(this.plugin.settings.startDateKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.startDateKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('End Date Key')
            .setDesc('Frontmatter key for the end date (e.g., "year-end")')
            .addText(text => text
            .setPlaceholder('year-end')
            .setValue(this.plugin.settings.endDateKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.endDateKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Lane Key')
            .setDesc('Frontmatter key used to group notes into lanes (e.g., "region")')
            .addText(text => text
            .setPlaceholder('region')
            .setValue(this.plugin.settings.laneKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.laneKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Lane Order')
            .setDesc('Comma-separated list defining the order of lanes (e.g., "Americas, Europe, South-Asia")')
            .addTextArea(text => text
            .setPlaceholder('Americas, Europe, South-Asia')
            .setValue(this.plugin.settings.laneOrder)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.laneOrder = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Show Uncategorized')
            .setDesc('Show an "Others" lane for notes with lane values not in the lane order list')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showUncategorized)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.showUncategorized = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Connection Keys')
            .setDesc('Comma-separated list of frontmatter keys to check for entity glow connections (e.g., "key-figures, mentors")')
            .addText(text => text
            .setPlaceholder('key-figures')
            .setValue(this.plugin.settings.connectionKeys)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.connectionKeys = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Zoom Levels')
            .setDesc('Comma-separated list of integers defining zoom granularities (e.g., "1, 10, 100" for Year, Decade, Century)')
            .addText(text => text
            .setPlaceholder('1, 10, 100')
            .setValue(this.plugin.settings.zoomLevels)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.zoomLevels = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Era Bookmarks')
            .setDesc('Bookmarks for quick navigation. Format: "Label: Year" (one per line). Example: "Bronze: -3000\\nIron: -1200"')
            .addTextArea(text => text
            .setPlaceholder('Bronze: -3000\nIron: -1200\nClassical: -500')
            .setValue(this.plugin.settings.eraBookmarks)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.eraBookmarks = value;
            yield this.plugin.saveSettings();
        })));
    }
}

exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
exports.LOOM_VIEW_TYPE = LOOM_VIEW_TYPE;
exports.default = LoomViewPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2RvbS5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvbGlmZWN5Y2xlLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9zY2hlZHVsZXIuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3RyYW5zaXRpb25zLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9lYWNoLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9Db21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9zaGFyZWQvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvZGlzY2xvc2UtdmVyc2lvbi9pbmRleC5qcyIsInNyYy9Mb29tVmlldy5zdmVsdGUiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6WyJJdGVtVmlldyIsIkxvb21WaWV3Q29tcG9uZW50IiwiUGx1Z2luIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0dBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTZNRDtBQUN1QixPQUFP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
