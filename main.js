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
 * @returns {Text} */
function empty() {
	return text('');
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

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
  }
}

/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @param {Date|Number} argument - the value to convert
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */
function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument);

  // Clone the date
  if (argument instanceof Date || _typeof(argument) === 'object' && argStr === '[object Date]') {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else {
    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
      // eslint-disable-next-line no-console
      console.warn(new Error().stack);
    }
    return new Date(NaN);
  }
}

/**
 * @name addDays
 * @category Day Helpers
 * @summary Add the specified number of days to the given date.
 *
 * @description
 * Add the specified number of days to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} - the new date with the days added
 * @throws {TypeError} - 2 arguments required
 *
 * @example
 * // Add 10 days to 1 September 2014:
 * const result = addDays(new Date(2014, 8, 1), 10)
 * //=> Thu Sep 11 2014 00:00:00
 */
function addDays(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return new Date(NaN);
  }
  if (!amount) {
    // If 0 days, no-op to avoid changing times in the hour before end of DST
    return date;
  }
  date.setDate(date.getDate() + amount);
  return date;
}

/**
 * @name addMilliseconds
 * @category Millisecond Helpers
 * @summary Add the specified number of milliseconds to the given date.
 *
 * @description
 * Add the specified number of milliseconds to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
 * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:30.750
 */
function addMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var timestamp = toDate(dirtyDate).getTime();
  var amount = toInteger(dirtyAmount);
  return new Date(timestamp + amount);
}

var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

/**
 * @name startOfWeek
 * @category Week Helpers
 * @summary Return the start of a week for the given date.
 *
 * @description
 * Return the start of a week for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @returns {Date} the start of a week
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 *
 * @example
 * // The start of a week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  var date = toDate(dirtyDate);
  var day = date.getDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

/**
 * @name startOfDay
 * @category Day Helpers
 * @summary Return the start of a day for the given date.
 *
 * @description
 * Return the start of a day for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @returns {Date} the start of a day
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // The start of a day for 2 September 2014 11:55:00:
 * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 00:00:00
 */
function startOfDay(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setHours(0, 0, 0, 0);
  return date;
}

var MILLISECONDS_IN_DAY$1 = 86400000;

/**
 * @name differenceInCalendarDays
 * @category Day Helpers
 * @summary Get the number of calendar days between the given dates.
 *
 * @description
 * Get the number of calendar days between the given dates. This means that the times are removed
 * from the dates and then the difference in days is calculated.
 *
 * @param {Date|Number} dateLeft - the later date
 * @param {Date|Number} dateRight - the earlier date
 * @returns {Number} the number of calendar days
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // How many calendar days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInCalendarDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 366
 * // How many calendar days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInCalendarDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 1
 */
function differenceInCalendarDays(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var startOfDayLeft = startOfDay(dirtyDateLeft);
  var startOfDayRight = startOfDay(dirtyDateRight);
  var timestampLeft = startOfDayLeft.getTime() - getTimezoneOffsetInMilliseconds(startOfDayLeft);
  var timestampRight = startOfDayRight.getTime() - getTimezoneOffsetInMilliseconds(startOfDayRight);

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a day is not constant
  // (e.g. it's different in the day of the daylight saving time clock shift)
  return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_DAY$1);
}

/**
 * @name addWeeks
 * @category Week Helpers
 * @summary Add the specified number of weeks to the given date.
 *
 * @description
 * Add the specified number of week to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of weeks to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the weeks added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 4 weeks to 1 September 2014:
 * const result = addWeeks(new Date(2014, 8, 1), 4)
 * //=> Mon Sep 29 2014 00:00:00
 */
function addWeeks(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  var days = amount * 7;
  return addDays(dirtyDate, days);
}

/**
 * @name compareAsc
 * @category Common Helpers
 * @summary Compare the two dates and return -1, 0 or 1.
 *
 * @description
 * Compare the two dates and return 1 if the first date is after the second,
 * -1 if the first date is before the second or 0 if dates are equal.
 *
 * @param {Date|Number} dateLeft - the first date to compare
 * @param {Date|Number} dateRight - the second date to compare
 * @returns {Number} the result of the comparison
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Compare 11 February 1987 and 10 July 1989:
 * const result = compareAsc(new Date(1987, 1, 11), new Date(1989, 6, 10))
 * //=> -1
 *
 * @example
 * // Sort the array of dates:
 * const result = [
 *   new Date(1995, 6, 2),
 *   new Date(1987, 1, 11),
 *   new Date(1989, 6, 10)
 * ].sort(compareAsc)
 * //=> [
 * //   Wed Feb 11 1987 00:00:00,
 * //   Mon Jul 10 1989 00:00:00,
 * //   Sun Jul 02 1995 00:00:00
 * // ]
 */
function compareAsc(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  var diff = dateLeft.getTime() - dateRight.getTime();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
    // Return 0 if diff is 0; return NaN if diff is NaN
  } else {
    return diff;
  }
}

/**
 * Days in 1 week.
 *
 * @name daysInWeek
 * @constant
 * @type {number}
 * @default
 */

/**
 * Milliseconds in 1 minute
 *
 * @name millisecondsInMinute
 * @constant
 * @type {number}
 * @default
 */
var millisecondsInMinute = 60000;

/**
 * Milliseconds in 1 hour
 *
 * @name millisecondsInHour
 * @constant
 * @type {number}
 * @default
 */
var millisecondsInHour = 3600000;

/**
 * Milliseconds in 1 second
 *
 * @name millisecondsInSecond
 * @constant
 * @type {number}
 * @default
 */
var millisecondsInSecond = 1000;

/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param {*} value - the value to check
 * @returns {boolean} true if the given value is a date
 * @throws {TypeError} 1 arguments required
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */
function isDate(value) {
  requiredArgs(1, arguments);
  return value instanceof Date || _typeof(value) === 'object' && Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {*} date - the date to check
 * @returns {Boolean} the date is valid
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertable into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */
function isValid(dirtyDate) {
  requiredArgs(1, arguments);
  if (!isDate(dirtyDate) && typeof dirtyDate !== 'number') {
    return false;
  }
  var date = toDate(dirtyDate);
  return !isNaN(Number(date));
}

/**
 * @name differenceInCalendarMonths
 * @category Month Helpers
 * @summary Get the number of calendar months between the given dates.
 *
 * @description
 * Get the number of calendar months between the given dates.
 *
 * @param {Date|Number} dateLeft - the later date
 * @param {Date|Number} dateRight - the earlier date
 * @returns {Number} the number of calendar months
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // How many calendar months are between 31 January 2014 and 1 September 2014?
 * const result = differenceInCalendarMonths(
 *   new Date(2014, 8, 1),
 *   new Date(2014, 0, 31)
 * )
 * //=> 8
 */
function differenceInCalendarMonths(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  var yearDiff = dateLeft.getFullYear() - dateRight.getFullYear();
  var monthDiff = dateLeft.getMonth() - dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}

// for accurate equality comparisons of UTC timestamps that end up
// having the same representation in local time, e.g. one hour before
// DST ends vs. the instant that DST ends.
function compareLocalAsc(dateLeft, dateRight) {
  var diff = dateLeft.getFullYear() - dateRight.getFullYear() || dateLeft.getMonth() - dateRight.getMonth() || dateLeft.getDate() - dateRight.getDate() || dateLeft.getHours() - dateRight.getHours() || dateLeft.getMinutes() - dateRight.getMinutes() || dateLeft.getSeconds() - dateRight.getSeconds() || dateLeft.getMilliseconds() - dateRight.getMilliseconds();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
    // Return 0 if diff is 0; return NaN if diff is NaN
  } else {
    return diff;
  }
}

/**
 * @name differenceInDays
 * @category Day Helpers
 * @summary Get the number of full days between the given dates.
 *
 * @description
 * Get the number of full day periods between two dates. Fractional days are
 * truncated towards zero.
 *
 * One "full day" is the distance between a local time in one day to the same
 * local time on the next or previous day. A full day can sometimes be less than
 * or more than 24 hours if a daylight savings change happens between two dates.
 *
 * To ignore DST and only measure exact 24-hour periods, use this instead:
 * `Math.floor(differenceInHours(dateLeft, dateRight)/24)|0`.
 *
 *
 * @param {Date|Number} dateLeft - the later date
 * @param {Date|Number} dateRight - the earlier date
 * @returns {Number} the number of full days according to the local timezone
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // How many full days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 365
 * // How many full days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 0
 * // How many full days are between
 * // 1 March 2020 0:00 and 1 June 2020 0:00 ?
 * // Note: because local time is used, the
 * // result will always be 92 days, even in
 * // time zones where DST starts and the
 * // period has only 92*24-1 hours.
 * const result = differenceInDays(
 *   new Date(2020, 5, 1),
 *   new Date(2020, 2, 1)
 * )
//=> 92
 */
function differenceInDays(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  var sign = compareLocalAsc(dateLeft, dateRight);
  var difference = Math.abs(differenceInCalendarDays(dateLeft, dateRight));
  dateLeft.setDate(dateLeft.getDate() - sign * difference);

  // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
  // If so, result must be decreased by 1 in absolute value
  var isLastDayNotFull = Number(compareLocalAsc(dateLeft, dateRight) === -sign);
  var result = sign * (difference - isLastDayNotFull);
  // Prevent negative zero
  return result === 0 ? 0 : result;
}

var roundingMap = {
  ceil: Math.ceil,
  round: Math.round,
  floor: Math.floor,
  trunc: function trunc(value) {
    return value < 0 ? Math.ceil(value) : Math.floor(value);
  } // Math.trunc is not supported by IE
};

var defaultRoundingMethod = 'trunc';
function getRoundingMethod(method) {
  return method ? roundingMap[method] : roundingMap[defaultRoundingMethod];
}

/**
 * @name endOfDay
 * @category Day Helpers
 * @summary Return the end of a day for the given date.
 *
 * @description
 * Return the end of a day for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @returns {Date} the end of a day
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // The end of a day for 2 September 2014 11:55:00:
 * const result = endOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 23:59:59.999
 */
function endOfDay(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * @name endOfMonth
 * @category Month Helpers
 * @summary Return the end of a month for the given date.
 *
 * @description
 * Return the end of a month for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @returns {Date} the end of a month
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // The end of a month for 2 September 2014 11:55:00:
 * const result = endOfMonth(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 30 2014 23:59:59.999
 */
function endOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var month = date.getMonth();
  date.setFullYear(date.getFullYear(), month + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * @name isLastDayOfMonth
 * @category Month Helpers
 * @summary Is the given date the last day of a month?
 *
 * @description
 * Is the given date the last day of a month?
 *
 * @param {Date|Number} date - the date to check
 * @returns {Boolean} the date is the last day of a month
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Is 28 February 2014 the last day of a month?
 * const result = isLastDayOfMonth(new Date(2014, 1, 28))
 * //=> true
 */
function isLastDayOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  return endOfDay(date).getTime() === endOfMonth(date).getTime();
}

/**
 * @name differenceInMonths
 * @category Month Helpers
 * @summary Get the number of full months between the given dates.
 *
 * @description
 * Get the number of full months between the given dates using trunc as a default rounding method.
 *
 * @param {Date|Number} dateLeft - the later date
 * @param {Date|Number} dateRight - the earlier date
 * @returns {Number} the number of full months
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // How many full months are between 31 January 2014 and 1 September 2014?
 * const result = differenceInMonths(new Date(2014, 8, 1), new Date(2014, 0, 31))
 * //=> 7
 */
function differenceInMonths(dirtyDateLeft, dirtyDateRight) {
  requiredArgs(2, arguments);
  var dateLeft = toDate(dirtyDateLeft);
  var dateRight = toDate(dirtyDateRight);
  var sign = compareAsc(dateLeft, dateRight);
  var difference = Math.abs(differenceInCalendarMonths(dateLeft, dateRight));
  var result;

  // Check for the difference of less than month
  if (difference < 1) {
    result = 0;
  } else {
    if (dateLeft.getMonth() === 1 && dateLeft.getDate() > 27) {
      // This will check if the date is end of Feb and assign a higher end of month date
      // to compare it with Jan
      dateLeft.setDate(30);
    }
    dateLeft.setMonth(dateLeft.getMonth() - sign * difference);

    // Math.abs(diff in full months - diff in calendar months) === 1 if last calendar month is not full
    // If so, result must be decreased by 1 in absolute value
    var isLastMonthNotFull = compareAsc(dateLeft, dateRight) === -sign;

    // Check for cases of one full calendar month
    if (isLastDayOfMonth(toDate(dirtyDateLeft)) && difference === 1 && compareAsc(dirtyDateLeft, dateRight) === 1) {
      isLastMonthNotFull = false;
    }
    result = sign * (difference - Number(isLastMonthNotFull));
  }

  // Prevent negative zero
  return result === 0 ? 0 : result;
}

/**
 * @name differenceInWeeks
 * @category Week Helpers
 * @summary Get the number of full weeks between the given dates.
 *
 * @description
 * Get the number of full weeks between two dates. Fractional weeks are
 * truncated towards zero by default.
 *
 * One "full week" is the distance between a local time in one day to the same
 * local time 7 days earlier or later. A full week can sometimes be less than
 * or more than 7*24 hours if a daylight savings change happens between two dates.
 *
 * To ignore DST and only measure exact 7*24-hour periods, use this instead:
 * `Math.floor(differenceInHours(dateLeft, dateRight)/(7*24))|0`.
 *
 *
 * @param {Date|Number} dateLeft - the later date
 * @param {Date|Number} dateRight - the earlier date
 * @param {Object} [options] - an object with options.
 * @param {String} [options.roundingMethod='trunc'] - a rounding method (`ceil`, `floor`, `round` or `trunc`)
 * @returns {Number} the number of full weeks
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // How many full weeks are between 5 July 2014 and 20 July 2014?
 * const result = differenceInWeeks(new Date(2014, 6, 20), new Date(2014, 6, 5))
 * //=> 2
 *
 * // How many full weeks are between
 * // 1 March 2020 0:00 and 6 June 2020 0:00 ?
 * // Note: because local time is used, the
 * // result will always be 8 weeks (54 days),
 * // even if DST starts and the period has
 * // only 54*24-1 hours.
 * const result = differenceInWeeks(
 *   new Date(2020, 5, 1),
 *   new Date(2020, 2, 6)
 * )
 * //=> 8
 */
function differenceInWeeks(dateLeft, dateRight, options) {
  requiredArgs(2, arguments);
  var diff = differenceInDays(dateLeft, dateRight) / 7;
  return getRoundingMethod(void 0 )(diff);
}

/**
 * @name eachMonthOfInterval
 * @category Interval Helpers
 * @summary Return the array of months within the specified time interval.
 *
 * @description
 * Return the array of months within the specified time interval.
 *
 * @param {Interval} interval - the interval. See [Interval]{@link https://date-fns.org/docs/Interval}
 * @returns {Date[]} the array with starts of months from the month of the interval start to the month of the interval end
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} The start of an interval cannot be after its end
 * @throws {RangeError} Date in interval cannot be `Invalid Date`
 *
 * @example
 * // Each month between 6 February 2014 and 10 August 2014:
 * const result = eachMonthOfInterval({
 *   start: new Date(2014, 1, 6),
 *   end: new Date(2014, 7, 10)
 * })
 * //=> [
 * //   Sat Feb 01 2014 00:00:00,
 * //   Sat Mar 01 2014 00:00:00,
 * //   Tue Apr 01 2014 00:00:00,
 * //   Thu May 01 2014 00:00:00,
 * //   Sun Jun 01 2014 00:00:00,
 * //   Tue Jul 01 2014 00:00:00,
 * //   Fri Aug 01 2014 00:00:00
 * // ]
 */
function eachMonthOfInterval(dirtyInterval) {
  requiredArgs(1, arguments);
  var interval = dirtyInterval || {};
  var startDate = toDate(interval.start);
  var endDate = toDate(interval.end);
  var endTime = endDate.getTime();
  var dates = [];

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError('Invalid interval');
  }
  var currentDate = startDate;
  currentDate.setHours(0, 0, 0, 0);
  currentDate.setDate(1);
  while (currentDate.getTime() <= endTime) {
    dates.push(toDate(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return dates;
}

/**
 * @name eachWeekOfInterval
 * @category Interval Helpers
 * @summary Return the array of weeks within the specified time interval.
 *
 * @description
 * Return the array of weeks within the specified time interval.
 *
 * @param {Interval} interval - the interval. See [Interval]{@link https://date-fns.org/docs/Interval}
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @returns {Date[]} the array with starts of weeks from the week of the interval start to the week of the interval end
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} `options.weekStartsOn` must be 0, 1, ..., 6
 * @throws {RangeError} The start of an interval cannot be after its end
 * @throws {RangeError} Date in interval cannot be `Invalid Date`
 *
 * @example
 * // Each week within interval 6 October 2014 - 23 November 2014:
 * const result = eachWeekOfInterval({
 *   start: new Date(2014, 9, 6),
 *   end: new Date(2014, 10, 23)
 * })
 * //=> [
 * //   Sun Oct 05 2014 00:00:00,
 * //   Sun Oct 12 2014 00:00:00,
 * //   Sun Oct 19 2014 00:00:00,
 * //   Sun Oct 26 2014 00:00:00,
 * //   Sun Nov 02 2014 00:00:00,
 * //   Sun Nov 09 2014 00:00:00,
 * //   Sun Nov 16 2014 00:00:00,
 * //   Sun Nov 23 2014 00:00:00
 * // ]
 */
function eachWeekOfInterval(dirtyInterval, options) {
  requiredArgs(1, arguments);
  var interval = dirtyInterval || {};
  var startDate = toDate(interval.start);
  var endDate = toDate(interval.end);
  var endTime = endDate.getTime();

  // Throw an exception if start date is after end date or if any date is `Invalid Date`
  if (!(startDate.getTime() <= endTime)) {
    throw new RangeError('Invalid interval');
  }
  var startDateWeek = startOfWeek(startDate, options);
  var endDateWeek = startOfWeek(endDate, options);

  // Some timezones switch DST at midnight, making start of day unreliable in these timezones, 3pm is a safe bet
  startDateWeek.setHours(15);
  endDateWeek.setHours(15);
  endTime = endDateWeek.getTime();
  var weeks = [];
  var currentWeek = startDateWeek;
  while (currentWeek.getTime() <= endTime) {
    currentWeek.setHours(0);
    weeks.push(toDate(currentWeek));
    currentWeek = addWeeks(currentWeek, 1);
    currentWeek.setHours(15);
  }
  return weeks;
}

/**
 * @name startOfMonth
 * @category Month Helpers
 * @summary Return the start of a month for the given date.
 *
 * @description
 * Return the start of a month for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @returns {Date} the start of a month
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // The start of a month for 2 September 2014 11:55:00:
 * const result = startOfMonth(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
function startOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * @name endOfWeek
 * @category Week Helpers
 * @summary Return the end of a week for the given date.
 *
 * @description
 * Return the end of a week for the given date.
 * The result will be in the local timezone.
 *
 * @param {Date|Number} date - the original date
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @returns {Date} the end of a week
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 *
 * @example
 * // The end of a week for 2 September 2014 11:55:00:
 * const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sat Sep 06 2014 23:59:59.999
 *
 * @example
 * // If the week starts on Monday, the end of the week for 2 September 2014 11:55:00:
 * const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Sun Sep 07 2014 23:59:59.999
 */
function endOfWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  var date = toDate(dirtyDate);
  var day = date.getDay();
  var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * @name subMilliseconds
 * @category Millisecond Helpers
 * @summary Subtract the specified number of milliseconds from the given date.
 *
 * @description
 * Subtract the specified number of milliseconds from the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds subtracted
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
 * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:29.250
 */
function subMilliseconds(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMilliseconds(dirtyDate, -amount);
}

var MILLISECONDS_IN_DAY = 86400000;
function getUTCDayOfYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

function startOfUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getUTCISOWeekYear(dirtyDate);
  var fourthOfJanuary = new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCISOWeek(fourthOfJanuary);
  return date;
}

var MILLISECONDS_IN_WEEK$1 = 604800000;
function getUTCISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime();

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)
  return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
}

function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);

  // Test if weekStartsOn is between 1 and 7 _and_ is not NaN
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }
  var firstWeekOfNextYear = new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, options);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getUTCWeekYear(dirtyDate, options);
  var firstWeek = new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = startOfUTCWeek(firstWeek, options);
  return date;
}

var MILLISECONDS_IN_WEEK = 604800000;
function getUTCWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime();

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? '-' : '';
  var output = Math.abs(number).toString();
  while (output.length < targetLength) {
    output = '0' + output;
  }
  return sign + output;
}

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */
var formatters$1 = {
  // Year
  y: function y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

    var signedYear = date.getUTCFullYear();
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return addLeadingZeros(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';
    switch (token) {
      case 'a':
      case 'aa':
        return dayPeriodEnumValue.toUpperCase();
      case 'aaa':
        return dayPeriodEnumValue;
      case 'aaaaa':
        return dayPeriodEnumValue[0];
      case 'aaaa':
      default:
        return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
    }
  },
  // Hour [1-12]
  h: function h(date, token) {
    return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return addLeadingZeros(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return addLeadingZeros(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return addLeadingZeros(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

var dayPeriodEnum = {
  midnight: 'midnight',
  noon: 'noon',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night'
};
/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */

var formatters = {
  // Era
  G: function G(date, token, localize) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case 'G':
      case 'GG':
      case 'GGG':
        return localize.era(era, {
          width: 'abbreviated'
        });
      // A, B
      case 'GGGGG':
        return localize.era(era, {
          width: 'narrow'
        });
      // Anno Domini, Before Christ
      case 'GGGG':
      default:
        return localize.era(era, {
          width: 'wide'
        });
    }
  },
  // Year
  y: function y(date, token, localize) {
    // Ordinal number
    if (token === 'yo') {
      var signedYear = date.getUTCFullYear();
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, {
        unit: 'year'
      });
    }
    return formatters$1.y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize, options) {
    var signedWeekYear = getUTCWeekYear(date, options);
    // Returns 1 for 1 BC (which is year 0 in JavaScript)
    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

    // Two digit year
    if (token === 'YY') {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }

    // Ordinal number
    if (token === 'Yo') {
      return localize.ordinalNumber(weekYear, {
        unit: 'year'
      });
    }

    // Padding
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = getUTCISOWeekYear(date);

    // Padding
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case 'Q':
        return String(quarter);
      // 01, 02, 03, 04
      case 'QQ':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case 'Qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4
      case 'QQQ':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case 'QQQQQ':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'formatting'
        });
      // 1st quarter, 2nd quarter, ...
      case 'QQQQ':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone quarter
  q: function q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case 'q':
        return String(quarter);
      // 01, 02, 03, 04
      case 'qq':
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case 'qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4
      case 'qqq':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case 'qqqqq':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'standalone'
        });
      // 1st quarter, 2nd quarter, ...
      case 'qqqq':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Month
  M: function M(date, token, localize) {
    var month = date.getUTCMonth();
    switch (token) {
      case 'M':
      case 'MM':
        return formatters$1.M(date, token);
      // 1st, 2nd, ..., 12th
      case 'Mo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec
      case 'MMM':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // J, F, ..., D
      case 'MMMMM':
        return localize.month(month, {
          width: 'narrow',
          context: 'formatting'
        });
      // January, February, ..., December
      case 'MMMM':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize) {
    var month = date.getUTCMonth();
    switch (token) {
      // 1, 2, ..., 12
      case 'L':
        return String(month + 1);
      // 01, 02, ..., 12
      case 'LL':
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case 'Lo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec
      case 'LLL':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // J, F, ..., D
      case 'LLLLL':
        return localize.month(month, {
          width: 'narrow',
          context: 'standalone'
        });
      // January, February, ..., December
      case 'LLLL':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize, options) {
    var week = getUTCWeek(date, options);
    if (token === 'wo') {
      return localize.ordinalNumber(week, {
        unit: 'week'
      });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize) {
    var isoWeek = getUTCISOWeek(date);
    if (token === 'Io') {
      return localize.ordinalNumber(isoWeek, {
        unit: 'week'
      });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function d(date, token, localize) {
    if (token === 'do') {
      return localize.ordinalNumber(date.getUTCDate(), {
        unit: 'date'
      });
    }
    return formatters$1.d(date, token);
  },
  // Day of year
  D: function D(date, token, localize) {
    var dayOfYear = getUTCDayOfYear(date);
    if (token === 'Do') {
      return localize.ordinalNumber(dayOfYear, {
        unit: 'dayOfYear'
      });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize) {
    var dayOfWeek = date.getUTCDay();
    switch (token) {
      // Tue
      case 'E':
      case 'EE':
      case 'EEE':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T
      case 'EEEEE':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu
      case 'EEEEEE':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday
      case 'EEEE':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Local day of week
  e: function e(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case 'e':
        return String(localDayOfWeek);
      // Padded numerical value
      case 'ee':
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case 'eo':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });
      case 'eee':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T
      case 'eeeee':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu
      case 'eeeeee':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday
      case 'eeee':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone local day of week
  c: function c(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case 'c':
        return String(localDayOfWeek);
      // Padded numerical value
      case 'cc':
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case 'co':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });
      case 'ccc':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // T
      case 'ccccc':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'standalone'
        });
      // Tu
      case 'cccccc':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'standalone'
        });
      // Tuesday
      case 'cccc':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // ISO day of week
  i: function i(date, token, localize) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case 'i':
        return String(isoDayOfWeek);
      // 02
      case 'ii':
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case 'io':
        return localize.ordinalNumber(isoDayOfWeek, {
          unit: 'day'
        });
      // Tue
      case 'iii':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T
      case 'iiiii':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu
      case 'iiiiii':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday
      case 'iiii':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM or PM
  a: function a(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
    switch (token) {
      case 'a':
      case 'aa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });
      case 'aaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();
      case 'aaaaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });
      case 'aaaa':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM, PM, midnight, noon
  b: function b(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
    }
    switch (token) {
      case 'b':
      case 'bb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });
      case 'bbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();
      case 'bbbbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });
      case 'bbbb':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function B(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case 'B':
      case 'BB':
      case 'BBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });
      case 'BBBBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });
      case 'BBBB':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Hour [1-12]
  h: function h(date, token, localize) {
    if (token === 'ho') {
      var hours = date.getUTCHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }
    return formatters$1.h(date, token);
  },
  // Hour [0-23]
  H: function H(date, token, localize) {
    if (token === 'Ho') {
      return localize.ordinalNumber(date.getUTCHours(), {
        unit: 'hour'
      });
    }
    return formatters$1.H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize) {
    var hours = date.getUTCHours() % 12;
    if (token === 'Ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize) {
    var hours = date.getUTCHours();
    if (hours === 0) hours = 24;
    if (token === 'ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function m(date, token, localize) {
    if (token === 'mo') {
      return localize.ordinalNumber(date.getUTCMinutes(), {
        unit: 'minute'
      });
    }
    return formatters$1.m(date, token);
  },
  // Second
  s: function s(date, token, localize) {
    if (token === 'so') {
      return localize.ordinalNumber(date.getUTCSeconds(), {
        unit: 'second'
      });
    }
    return formatters$1.s(date, token);
  },
  // Fraction of second
  S: function S(date, token) {
    return formatters$1.S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return 'Z';
    }
    switch (token) {
      // Hours and optional minutes
      case 'X':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case 'XXXX':
      case 'XX':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case 'XXXXX':
      case 'XXX': // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      // Hours and optional minutes
      case 'x':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);

      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case 'xxxx':
      case 'xx':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);

      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case 'xxxxx':
      case 'xxx': // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (GMT)
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      // Short
      case 'O':
      case 'OO':
      case 'OOO':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long
      case 'OOOO':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (specific non-location)
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      // Short
      case 'z':
      case 'zz':
      case 'zzz':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long
      case 'zzzz':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Seconds timestamp
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1000);
    return addLeadingZeros(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};
function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  var delimiter = dirtyDelimiter;
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? '-' : '+';
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, dirtyDelimiter);
}
function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || '';
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

var dateLongFormatter = function dateLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'P':
      return formatLong.date({
        width: 'short'
      });
    case 'PP':
      return formatLong.date({
        width: 'medium'
      });
    case 'PPP':
      return formatLong.date({
        width: 'long'
      });
    case 'PPPP':
    default:
      return formatLong.date({
        width: 'full'
      });
  }
};
var timeLongFormatter = function timeLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'p':
      return formatLong.time({
        width: 'short'
      });
    case 'pp':
      return formatLong.time({
        width: 'medium'
      });
    case 'ppp':
      return formatLong.time({
        width: 'long'
      });
    case 'pppp':
    default:
      return formatLong.time({
        width: 'full'
      });
  }
};
var dateTimeLongFormatter = function dateTimeLongFormatter(pattern, formatLong) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }
  var dateTimeFormat;
  switch (datePattern) {
    case 'P':
      dateTimeFormat = formatLong.dateTime({
        width: 'short'
      });
      break;
    case 'PP':
      dateTimeFormat = formatLong.dateTime({
        width: 'medium'
      });
      break;
    case 'PPP':
      dateTimeFormat = formatLong.dateTime({
        width: 'long'
      });
      break;
    case 'PPPP':
    default:
      dateTimeFormat = formatLong.dateTime({
        width: 'full'
      });
      break;
  }
  return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

var protectedDayOfYearTokens = ['D', 'DD'];
var protectedWeekYearTokens = ['YY', 'YYYY'];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format, input) {
  if (token === 'YYYY') {
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'YY') {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'D') {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'DD') {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}

var formatDistanceLocale = {
  lessThanXSeconds: {
    one: 'less than a second',
    other: 'less than {{count}} seconds'
  },
  xSeconds: {
    one: '1 second',
    other: '{{count}} seconds'
  },
  halfAMinute: 'half a minute',
  lessThanXMinutes: {
    one: 'less than a minute',
    other: 'less than {{count}} minutes'
  },
  xMinutes: {
    one: '1 minute',
    other: '{{count}} minutes'
  },
  aboutXHours: {
    one: 'about 1 hour',
    other: 'about {{count}} hours'
  },
  xHours: {
    one: '1 hour',
    other: '{{count}} hours'
  },
  xDays: {
    one: '1 day',
    other: '{{count}} days'
  },
  aboutXWeeks: {
    one: 'about 1 week',
    other: 'about {{count}} weeks'
  },
  xWeeks: {
    one: '1 week',
    other: '{{count}} weeks'
  },
  aboutXMonths: {
    one: 'about 1 month',
    other: 'about {{count}} months'
  },
  xMonths: {
    one: '1 month',
    other: '{{count}} months'
  },
  aboutXYears: {
    one: 'about 1 year',
    other: 'about {{count}} years'
  },
  xYears: {
    one: '1 year',
    other: '{{count}} years'
  },
  overXYears: {
    one: 'over 1 year',
    other: 'over {{count}} years'
  },
  almostXYears: {
    one: 'almost 1 year',
    other: 'almost {{count}} years'
  }
};
var formatDistance = function formatDistance(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === 'string') {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace('{{count}}', count.toString());
  }
  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return 'in ' + result;
    } else {
      return result + ' ago';
    }
  }
  return result;
};

function buildFormatLongFn(args) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // TODO: Remove String()
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

var dateFormats = {
  full: 'EEEE, MMMM do, y',
  long: 'MMMM do, y',
  medium: 'MMM d, y',
  short: 'MM/dd/yyyy'
};
var timeFormats = {
  full: 'h:mm:ss a zzzz',
  long: 'h:mm:ss a z',
  medium: 'h:mm:ss a',
  short: 'h:mm a'
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: '{{date}}, {{time}}',
  short: '{{date}}, {{time}}'
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: 'full'
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: 'full'
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: 'full'
  })
};

var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'P'
};
var formatRelative = function formatRelative(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};

function buildLocalizeFn(args) {
  return function (dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : 'standalone';
    var valuesArray;
    if (context === 'formatting' && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;
      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }
    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
    // @ts-ignore: For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
    return valuesArray[index];
  };
}

var eraValues = {
  narrow: ['B', 'A'],
  abbreviated: ['BC', 'AD'],
  wide: ['Before Christ', 'Anno Domini']
};
var quarterValues = {
  narrow: ['1', '2', '3', '4'],
  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
  wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
};

// Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.
var monthValues = {
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
var dayValues = {
  narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};
var dayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  }
};
var ordinalNumber = function ordinalNumber(dirtyNumber, _options) {
  var number = Number(dirtyNumber);

  // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  var rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + 'st';
      case 2:
        return number + 'nd';
      case 3:
        return number + 'rd';
    }
  }
  return number + 'th';
};
var localize = {
  ordinalNumber: ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: 'wide'
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: 'wide',
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: 'wide'
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: 'wide'
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: 'wide',
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: 'wide'
  })
};

function buildMatchFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}
function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }
  return undefined;
}
function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return undefined;
}

function buildMatchPatternFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseEraPatterns,
    defaultParseWidth: 'any'
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: 'any',
    valueCallback: function valueCallback(index) {
      return index + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: 'any'
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseDayPatterns,
    defaultParseWidth: 'any'
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: 'any',
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: 'any'
  })
};

/**
 * @type {Locale}
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
 */
var locale = {
  code: 'en-US',
  formatDistance: formatDistance,
  formatLong: formatLong,
  formatRelative: formatRelative,
  localize: localize,
  match: match,
  options: {
    weekStartsOn: 0 /* Sunday */,
    firstWeekContainsDate: 1
  }
};

// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
var formattingTokensRegExp$1 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp$1 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp$1 = /^'([^]*?)'?$/;
var doubleQuoteRegExp$1 = /''/g;
var unescapedLatinCharacterRegExp$1 = /[a-zA-Z]/;

/**
 * @name format
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param {Date|Number} date - the original date
 * @param {String} format - the string of tokens
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {String} the formatted date string
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `date` must not be Invalid Date
 * @throws {RangeError} `options.locale` must contain `localize` property
 * @throws {RangeError} `options.locale` must contain `formatLong` property
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */

function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _defaultOptions$local3, _defaultOptions$local4;
  requiredArgs(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions = getDefaultOptions();
  var locale$1 = (_ref = (_options$locale = void 0 ) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions.locale) !== null && _ref !== void 0 ? _ref : locale;
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = void 0 ) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : void 0 ) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1);

  // Test if weekStartsOn is between 1 and 7 _and_ is not NaN
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }
  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = void 0 ) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : void 0 ) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  if (!locale$1.localize) {
    throw new RangeError('locale must contain localize property');
  }
  if (!locale$1.formatLong) {
    throw new RangeError('locale must contain formatLong property');
  }
  var originalDate = toDate(dirtyDate);
  if (!isValid(originalDate)) {
    throw new RangeError('Invalid time value');
  }

  // Convert the date in system timezone to the same date in UTC+00:00 timezone.
  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376
  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate: firstWeekContainsDate,
    weekStartsOn: weekStartsOn,
    locale: locale$1,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp$1).map(function (substring) {
    var firstCharacter = substring[0];
    if (firstCharacter === 'p' || firstCharacter === 'P') {
      var longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale$1.formatLong);
    }
    return substring;
  }).join('').match(formattingTokensRegExp$1).map(function (substring) {
    // Replace two single quote characters with one single quote character
    if (substring === "''") {
      return "'";
    }
    var firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return cleanEscapedString$1(substring);
    }
    var formatter = formatters[firstCharacter];
    if (formatter) {
      if (isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      if (isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring, dirtyFormatStr, String(dirtyDate));
      }
      return formatter(utcDate, substring, locale$1.localize, formatterOptions);
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp$1)) {
      throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
    }
    return substring;
  }).join('');
  return result;
}
function cleanEscapedString$1(input) {
  var matched = input.match(escapedStringRegExp$1);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp$1, "'");
}

function assign(target, object) {
  if (target == null) {
    throw new TypeError('assign requires that input parameter not be null or undefined');
  }
  for (var property in object) {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      target[property] = object[property];
    }
  }
  return target;
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var _n = 0,
        F = function F() {};
      return {
        s: F,
        n: function n() {
          return _n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[_n++]
          };
        },
        e: function e(r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function s() {
      t = t.call(r);
    },
    n: function n() {
      var r = t.next();
      return a = r.done, r;
    },
    e: function e(r) {
      u = true, o = r;
    },
    f: function f() {
      try {
        a || null == t["return"] || t["return"]();
      } finally {
        if (u) throw o;
      }
    }
  };
}

function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}

function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}

function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: true,
      configurable: true
    }
  }), Object.defineProperty(t, "prototype", {
    writable: false
  }), e && _setPrototypeOf(t, e);
}

function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}

function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
  } catch (t) {}
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
    return !!t;
  })();
}

function _possibleConstructorReturn(t, e) {
  if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}

function _createSuper(t) {
  var r = _isNativeReflectConstruct();
  return function () {
    var e,
      o = _getPrototypeOf(t);
    if (r) {
      var s = _getPrototypeOf(this).constructor;
      e = Reflect.construct(o, arguments, s);
    } else e = o.apply(this, arguments);
    return _possibleConstructorReturn(this, e);
  };
}

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}

function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}

function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}

var TIMEZONE_UNIT_PRIORITY = 10;
var Setter = /*#__PURE__*/function () {
  function Setter() {
    _classCallCheck(this, Setter);
    _defineProperty(this, "priority", void 0);
    _defineProperty(this, "subPriority", 0);
  }
  _createClass(Setter, [{
    key: "validate",
    value: function validate(_utcDate, _options) {
      return true;
    }
  }]);
  return Setter;
}();
var ValueSetter = /*#__PURE__*/function (_Setter) {
  _inherits(ValueSetter, _Setter);
  var _super = _createSuper(ValueSetter);
  function ValueSetter(value, validateValue, setValue, priority, subPriority) {
    var _this;
    _classCallCheck(this, ValueSetter);
    _this = _super.call(this);
    _this.value = value;
    _this.validateValue = validateValue;
    _this.setValue = setValue;
    _this.priority = priority;
    if (subPriority) {
      _this.subPriority = subPriority;
    }
    return _this;
  }
  _createClass(ValueSetter, [{
    key: "validate",
    value: function validate(utcDate, options) {
      return this.validateValue(utcDate, this.value, options);
    }
  }, {
    key: "set",
    value: function set(utcDate, flags, options) {
      return this.setValue(utcDate, flags, this.value, options);
    }
  }]);
  return ValueSetter;
}(Setter);
var DateToSystemTimezoneSetter = /*#__PURE__*/function (_Setter2) {
  _inherits(DateToSystemTimezoneSetter, _Setter2);
  var _super2 = _createSuper(DateToSystemTimezoneSetter);
  function DateToSystemTimezoneSetter() {
    var _this2;
    _classCallCheck(this, DateToSystemTimezoneSetter);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this2 = _super2.call.apply(_super2, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this2), "priority", TIMEZONE_UNIT_PRIORITY);
    _defineProperty(_assertThisInitialized(_this2), "subPriority", -1);
    return _this2;
  }
  _createClass(DateToSystemTimezoneSetter, [{
    key: "set",
    value: function set(date, flags) {
      if (flags.timestampIsSet) {
        return date;
      }
      var convertedDate = new Date(0);
      convertedDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      convertedDate.setHours(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
      return convertedDate;
    }
  }]);
  return DateToSystemTimezoneSetter;
}(Setter);

var Parser = /*#__PURE__*/function () {
  function Parser() {
    _classCallCheck(this, Parser);
    _defineProperty(this, "incompatibleTokens", void 0);
    _defineProperty(this, "priority", void 0);
    _defineProperty(this, "subPriority", void 0);
  }
  _createClass(Parser, [{
    key: "run",
    value: function run(dateString, token, match, options) {
      var result = this.parse(dateString, token, match, options);
      if (!result) {
        return null;
      }
      return {
        setter: new ValueSetter(result.value, this.validate, this.set, this.priority, this.subPriority),
        rest: result.rest
      };
    }
  }, {
    key: "validate",
    value: function validate(_utcDate, _value, _options) {
      return true;
    }
  }]);
  return Parser;
}();

var EraParser = /*#__PURE__*/function (_Parser) {
  _inherits(EraParser, _Parser);
  var _super = _createSuper(EraParser);
  function EraParser() {
    var _this;
    _classCallCheck(this, EraParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 140);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['R', 'u', 't', 'T']);
    return _this;
  }
  _createClass(EraParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        // AD, BC
        case 'G':
        case 'GG':
        case 'GGG':
          return match.era(dateString, {
            width: 'abbreviated'
          }) || match.era(dateString, {
            width: 'narrow'
          });
        // A, B
        case 'GGGGG':
          return match.era(dateString, {
            width: 'narrow'
          });
        // Anno Domini, Before Christ
        case 'GGGG':
        default:
          return match.era(dateString, {
            width: 'wide'
          }) || match.era(dateString, {
            width: 'abbreviated'
          }) || match.era(dateString, {
            width: 'narrow'
          });
      }
    }
  }, {
    key: "set",
    value: function set(date, flags, value) {
      flags.era = value;
      date.setUTCFullYear(value, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return EraParser;
}(Parser);

var numericPatterns = {
  month: /^(1[0-2]|0?\d)/,
  // 0 to 12
  date: /^(3[0-1]|[0-2]?\d)/,
  // 0 to 31
  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  // 0 to 366
  week: /^(5[0-3]|[0-4]?\d)/,
  // 0 to 53
  hour23h: /^(2[0-3]|[0-1]?\d)/,
  // 0 to 23
  hour24h: /^(2[0-4]|[0-1]?\d)/,
  // 0 to 24
  hour11h: /^(1[0-1]|0?\d)/,
  // 0 to 11
  hour12h: /^(1[0-2]|0?\d)/,
  // 0 to 12
  minute: /^[0-5]?\d/,
  // 0 to 59
  second: /^[0-5]?\d/,
  // 0 to 59

  singleDigit: /^\d/,
  // 0 to 9
  twoDigits: /^\d{1,2}/,
  // 0 to 99
  threeDigits: /^\d{1,3}/,
  // 0 to 999
  fourDigits: /^\d{1,4}/,
  // 0 to 9999

  anyDigitsSigned: /^-?\d+/,
  singleDigitSigned: /^-?\d/,
  // 0 to 9, -0 to -9
  twoDigitsSigned: /^-?\d{1,2}/,
  // 0 to 99, -0 to -99
  threeDigitsSigned: /^-?\d{1,3}/,
  // 0 to 999, -0 to -999
  fourDigitsSigned: /^-?\d{1,4}/ // 0 to 9999, -0 to -9999
};

var timezonePatterns = {
  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
  basic: /^([+-])(\d{2})(\d{2})|Z/,
  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  extended: /^([+-])(\d{2}):(\d{2})|Z/,
  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
};

function mapValue(parseFnResult, mapFn) {
  if (!parseFnResult) {
    return parseFnResult;
  }
  return {
    value: mapFn(parseFnResult.value),
    rest: parseFnResult.rest
  };
}
function parseNumericPattern(pattern, dateString) {
  var matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }
  return {
    value: parseInt(matchResult[0], 10),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseTimezonePattern(pattern, dateString) {
  var matchResult = dateString.match(pattern);
  if (!matchResult) {
    return null;
  }

  // Input is 'Z'
  if (matchResult[0] === 'Z') {
    return {
      value: 0,
      rest: dateString.slice(1)
    };
  }
  var sign = matchResult[1] === '+' ? 1 : -1;
  var hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
  var minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
  var seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
  return {
    value: sign * (hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond),
    rest: dateString.slice(matchResult[0].length)
  };
}
function parseAnyDigitsSigned(dateString) {
  return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
}
function parseNDigits(n, dateString) {
  switch (n) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigit, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigits, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigits, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigits, dateString);
    default:
      return parseNumericPattern(new RegExp('^\\d{1,' + n + '}'), dateString);
  }
}
function parseNDigitsSigned(n, dateString) {
  switch (n) {
    case 1:
      return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
    case 2:
      return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
    case 3:
      return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
    case 4:
      return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
    default:
      return parseNumericPattern(new RegExp('^-?\\d{1,' + n + '}'), dateString);
  }
}
function dayPeriodEnumToHours(dayPeriod) {
  switch (dayPeriod) {
    case 'morning':
      return 4;
    case 'evening':
      return 17;
    case 'pm':
    case 'noon':
    case 'afternoon':
      return 12;
    case 'am':
    case 'midnight':
    case 'night':
    default:
      return 0;
  }
}
function normalizeTwoDigitYear(twoDigitYear, currentYear) {
  var isCommonEra = currentYear > 0;
  // Absolute number of the current year:
  // 1 -> 1 AC
  // 0 -> 1 BC
  // -1 -> 2 BC
  var absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
  var result;
  if (absCurrentYear <= 50) {
    result = twoDigitYear || 100;
  } else {
    var rangeEnd = absCurrentYear + 50;
    var rangeEndCentury = Math.floor(rangeEnd / 100) * 100;
    var isPreviousCentury = twoDigitYear >= rangeEnd % 100;
    result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
  }
  return isCommonEra ? result : 1 - result;
}
function isLeapYearIndex$1(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}

// From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
// | Year     |     y | yy |   yyy |  yyyy | yyyyy |
// |----------|-------|----|-------|-------|-------|
// | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
// | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
// | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
// | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
// | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
var YearParser = /*#__PURE__*/function (_Parser) {
  _inherits(YearParser, _Parser);
  var _super = _createSuper(YearParser);
  function YearParser() {
    var _this;
    _classCallCheck(this, YearParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'u', 'w', 'I', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(YearParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      var valueCallback = function valueCallback(year) {
        return {
          year: year,
          isTwoDigitYear: token === 'yy'
        };
      };
      switch (token) {
        case 'y':
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case 'yo':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'year'
          }), valueCallback);
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
  }, {
    key: "set",
    value: function set(date, flags, value) {
      var currentYear = date.getUTCFullYear();
      if (value.isTwoDigitYear) {
        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
        date.setUTCFullYear(normalizedTwoDigitYear, 0, 1);
        date.setUTCHours(0, 0, 0, 0);
        return date;
      }
      var year = !('era' in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setUTCFullYear(year, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return YearParser;
}(Parser);

// Local week-numbering year
var LocalWeekYearParser = /*#__PURE__*/function (_Parser) {
  _inherits(LocalWeekYearParser, _Parser);
  var _super = _createSuper(LocalWeekYearParser);
  function LocalWeekYearParser() {
    var _this;
    _classCallCheck(this, LocalWeekYearParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'R', 'u', 'Q', 'q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']);
    return _this;
  }
  _createClass(LocalWeekYearParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      var valueCallback = function valueCallback(year) {
        return {
          year: year,
          isTwoDigitYear: token === 'YY'
        };
      };
      switch (token) {
        case 'Y':
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case 'Yo':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'year'
          }), valueCallback);
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
  }, {
    key: "set",
    value: function set(date, flags, value, options) {
      var currentYear = getUTCWeekYear(date, options);
      if (value.isTwoDigitYear) {
        var normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
        date.setUTCFullYear(normalizedTwoDigitYear, 0, options.firstWeekContainsDate);
        date.setUTCHours(0, 0, 0, 0);
        return startOfUTCWeek(date, options);
      }
      var year = !('era' in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setUTCFullYear(year, 0, options.firstWeekContainsDate);
      date.setUTCHours(0, 0, 0, 0);
      return startOfUTCWeek(date, options);
    }
  }]);
  return LocalWeekYearParser;
}(Parser);

var ISOWeekYearParser = /*#__PURE__*/function (_Parser) {
  _inherits(ISOWeekYearParser, _Parser);
  var _super = _createSuper(ISOWeekYearParser);
  function ISOWeekYearParser() {
    var _this;
    _classCallCheck(this, ISOWeekYearParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['G', 'y', 'Y', 'u', 'Q', 'q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(ISOWeekYearParser, [{
    key: "parse",
    value: function parse(dateString, token) {
      if (token === 'R') {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
  }, {
    key: "set",
    value: function set(_date, _flags, value) {
      var firstWeekOfYear = new Date(0);
      firstWeekOfYear.setUTCFullYear(value, 0, 4);
      firstWeekOfYear.setUTCHours(0, 0, 0, 0);
      return startOfUTCISOWeek(firstWeekOfYear);
    }
  }]);
  return ISOWeekYearParser;
}(Parser);

var ExtendedYearParser = /*#__PURE__*/function (_Parser) {
  _inherits(ExtendedYearParser, _Parser);
  var _super = _createSuper(ExtendedYearParser);
  function ExtendedYearParser() {
    var _this;
    _classCallCheck(this, ExtendedYearParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 130);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['G', 'y', 'Y', 'R', 'w', 'I', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(ExtendedYearParser, [{
    key: "parse",
    value: function parse(dateString, token) {
      if (token === 'u') {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCFullYear(value, 0, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return ExtendedYearParser;
}(Parser);

var QuarterParser = /*#__PURE__*/function (_Parser) {
  _inherits(QuarterParser, _Parser);
  var _super = _createSuper(QuarterParser);
  function QuarterParser() {
    var _this;
    _classCallCheck(this, QuarterParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 120);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(QuarterParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        // 1, 2, 3, 4
        case 'Q':
        case 'QQ':
          // 01, 02, 03, 04
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case 'Qo':
          return match.ordinalNumber(dateString, {
            unit: 'quarter'
          });
        // Q1, Q2, Q3, Q4
        case 'QQQ':
          return match.quarter(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.quarter(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case 'QQQQQ':
          return match.quarter(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // 1st quarter, 2nd quarter, ...
        case 'QQQQ':
        default:
          return match.quarter(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.quarter(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.quarter(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 4;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMonth((value - 1) * 3, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return QuarterParser;
}(Parser);

var StandAloneQuarterParser = /*#__PURE__*/function (_Parser) {
  _inherits(StandAloneQuarterParser, _Parser);
  var _super = _createSuper(StandAloneQuarterParser);
  function StandAloneQuarterParser() {
    var _this;
    _classCallCheck(this, StandAloneQuarterParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 120);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'Q', 'M', 'L', 'w', 'I', 'd', 'D', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(StandAloneQuarterParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        // 1, 2, 3, 4
        case 'q':
        case 'qq':
          // 01, 02, 03, 04
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case 'qo':
          return match.ordinalNumber(dateString, {
            unit: 'quarter'
          });
        // Q1, Q2, Q3, Q4
        case 'qqq':
          return match.quarter(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.quarter(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case 'qqqqq':
          return match.quarter(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // 1st quarter, 2nd quarter, ...
        case 'qqqq':
        default:
          return match.quarter(dateString, {
            width: 'wide',
            context: 'standalone'
          }) || match.quarter(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.quarter(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 4;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMonth((value - 1) * 3, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneQuarterParser;
}(Parser);

var MonthParser = /*#__PURE__*/function (_Parser) {
  _inherits(MonthParser, _Parser);
  var _super = _createSuper(MonthParser);
  function MonthParser() {
    var _this;
    _classCallCheck(this, MonthParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'q', 'Q', 'L', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']);
    _defineProperty(_assertThisInitialized(_this), "priority", 110);
    return _this;
  }
  _createClass(MonthParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      var valueCallback = function valueCallback(value) {
        return value - 1;
      };
      switch (token) {
        // 1, 2, ..., 12
        case 'M':
          return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback);
        // 01, 02, ..., 12
        case 'MM':
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case 'Mo':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'month'
          }), valueCallback);
        // Jan, Feb, ..., Dec
        case 'MMM':
          return match.month(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.month(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // J, F, ..., D
        case 'MMMMM':
          return match.month(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // January, February, ..., December
        case 'MMMM':
        default:
          return match.month(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.month(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.month(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMonth(value, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return MonthParser;
}(Parser);

var StandAloneMonthParser = /*#__PURE__*/function (_Parser) {
  _inherits(StandAloneMonthParser, _Parser);
  var _super = _createSuper(StandAloneMonthParser);
  function StandAloneMonthParser() {
    var _this;
    _classCallCheck(this, StandAloneMonthParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 110);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'q', 'Q', 'M', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(StandAloneMonthParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      var valueCallback = function valueCallback(value) {
        return value - 1;
      };
      switch (token) {
        // 1, 2, ..., 12
        case 'L':
          return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback);
        // 01, 02, ..., 12
        case 'LL':
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case 'Lo':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'month'
          }), valueCallback);
        // Jan, Feb, ..., Dec
        case 'LLL':
          return match.month(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.month(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // J, F, ..., D
        case 'LLLLL':
          return match.month(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // January, February, ..., December
        case 'LLLL':
        default:
          return match.month(dateString, {
            width: 'wide',
            context: 'standalone'
          }) || match.month(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.month(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMonth(value, 1);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneMonthParser;
}(Parser);

function setUTCWeek(dirtyDate, dirtyWeek, options) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var week = toInteger(dirtyWeek);
  var diff = getUTCWeek(date, options) - week;
  date.setUTCDate(date.getUTCDate() - diff * 7);
  return date;
}

var LocalWeekParser = /*#__PURE__*/function (_Parser) {
  _inherits(LocalWeekParser, _Parser);
  var _super = _createSuper(LocalWeekParser);
  function LocalWeekParser() {
    var _this;
    _classCallCheck(this, LocalWeekParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 100);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'i', 't', 'T']);
    return _this;
  }
  _createClass(LocalWeekParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'w':
          return parseNumericPattern(numericPatterns.week, dateString);
        case 'wo':
          return match.ordinalNumber(dateString, {
            unit: 'week'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 53;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value, options) {
      return startOfUTCWeek(setUTCWeek(date, value, options), options);
    }
  }]);
  return LocalWeekParser;
}(Parser);

function setUTCISOWeek(dirtyDate, dirtyISOWeek) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var isoWeek = toInteger(dirtyISOWeek);
  var diff = getUTCISOWeek(date) - isoWeek;
  date.setUTCDate(date.getUTCDate() - diff * 7);
  return date;
}

var ISOWeekParser = /*#__PURE__*/function (_Parser) {
  _inherits(ISOWeekParser, _Parser);
  var _super = _createSuper(ISOWeekParser);
  function ISOWeekParser() {
    var _this;
    _classCallCheck(this, ISOWeekParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 100);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(ISOWeekParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'I':
          return parseNumericPattern(numericPatterns.week, dateString);
        case 'Io':
          return match.ordinalNumber(dateString, {
            unit: 'week'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 53;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      return startOfUTCISOWeek(setUTCISOWeek(date, value));
    }
  }]);
  return ISOWeekParser;
}(Parser);

var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Day of the month
var DateParser = /*#__PURE__*/function (_Parser) {
  _inherits(DateParser, _Parser);
  var _super = _createSuper(DateParser);
  function DateParser() {
    var _this;
    _classCallCheck(this, DateParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "subPriority", 1);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'q', 'Q', 'w', 'I', 'D', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(DateParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'd':
          return parseNumericPattern(numericPatterns.date, dateString);
        case 'do':
          return match.ordinalNumber(dateString, {
            unit: 'date'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(date, value) {
      var year = date.getUTCFullYear();
      var isLeapYear = isLeapYearIndex$1(year);
      var month = date.getUTCMonth();
      if (isLeapYear) {
        return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
      } else {
        return value >= 1 && value <= DAYS_IN_MONTH[month];
      }
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCDate(value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DateParser;
}(Parser);

var DayOfYearParser = /*#__PURE__*/function (_Parser) {
  _inherits(DayOfYearParser, _Parser);
  var _super = _createSuper(DayOfYearParser);
  function DayOfYearParser() {
    var _this;
    _classCallCheck(this, DayOfYearParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "subpriority", 1);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['Y', 'R', 'q', 'Q', 'M', 'L', 'w', 'I', 'd', 'E', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(DayOfYearParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'D':
        case 'DD':
          return parseNumericPattern(numericPatterns.dayOfYear, dateString);
        case 'Do':
          return match.ordinalNumber(dateString, {
            unit: 'date'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(date, value) {
      var year = date.getUTCFullYear();
      var isLeapYear = isLeapYearIndex$1(year);
      if (isLeapYear) {
        return value >= 1 && value <= 366;
      } else {
        return value >= 1 && value <= 365;
      }
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMonth(0, value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DayOfYearParser;
}(Parser);

function setUTCDay(dirtyDate, dirtyDay, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(2, arguments);
  var defaultOptions = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  var date = toDate(dirtyDate);
  var day = toInteger(dirtyDay);
  var currentDay = date.getUTCDay();
  var remainder = day % 7;
  var dayIndex = (remainder + 7) % 7;
  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

var DayParser = /*#__PURE__*/function (_Parser) {
  _inherits(DayParser, _Parser);
  var _super = _createSuper(DayParser);
  function DayParser() {
    var _this;
    _classCallCheck(this, DayParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['D', 'i', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(DayParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        // Tue
        case 'E':
        case 'EE':
        case 'EEE':
          return match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // T
        case 'EEEEE':
          return match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // Tu
        case 'EEEEEE':
          return match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // Tuesday
        case 'EEEE':
        default:
          return match.day(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return DayParser;
}(Parser);

var LocalDayParser = /*#__PURE__*/function (_Parser) {
  _inherits(LocalDayParser, _Parser);
  var _super = _createSuper(LocalDayParser);
  function LocalDayParser() {
    var _this;
    _classCallCheck(this, LocalDayParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'c', 't', 'T']);
    return _this;
  }
  _createClass(LocalDayParser, [{
    key: "parse",
    value: function parse(dateString, token, match, options) {
      var valueCallback = function valueCallback(value) {
        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        // 3
        case 'e':
        case 'ee':
          // 03
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case 'eo':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'day'
          }), valueCallback);
        // Tue
        case 'eee':
          return match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // T
        case 'eeeee':
          return match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // Tu
        case 'eeeeee':
          return match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        // Tuesday
        case 'eeee':
        default:
          return match.day(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return LocalDayParser;
}(Parser);

var StandAloneLocalDayParser = /*#__PURE__*/function (_Parser) {
  _inherits(StandAloneLocalDayParser, _Parser);
  var _super = _createSuper(StandAloneLocalDayParser);
  function StandAloneLocalDayParser() {
    var _this;
    _classCallCheck(this, StandAloneLocalDayParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'R', 'u', 'q', 'Q', 'M', 'L', 'I', 'd', 'D', 'E', 'i', 'e', 't', 'T']);
    return _this;
  }
  _createClass(StandAloneLocalDayParser, [{
    key: "parse",
    value: function parse(dateString, token, match, options) {
      var valueCallback = function valueCallback(value) {
        var wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        // 3
        case 'c':
        case 'cc':
          // 03
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case 'co':
          return mapValue(match.ordinalNumber(dateString, {
            unit: 'day'
          }), valueCallback);
        // Tue
        case 'ccc':
          return match.day(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'short',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // T
        case 'ccccc':
          return match.day(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // Tu
        case 'cccccc':
          return match.day(dateString, {
            width: 'short',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
        // Tuesday
        case 'cccc':
        default:
          return match.day(dateString, {
            width: 'wide',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'abbreviated',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'short',
            context: 'standalone'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'standalone'
          });
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 6;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value, options) {
      date = setUTCDay(date, value, options);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return StandAloneLocalDayParser;
}(Parser);

function setUTCISODay(dirtyDate, dirtyDay) {
  requiredArgs(2, arguments);
  var day = toInteger(dirtyDay);
  if (day % 7 === 0) {
    day = day - 7;
  }
  var weekStartsOn = 1;
  var date = toDate(dirtyDate);
  var currentDay = date.getUTCDay();
  var remainder = day % 7;
  var dayIndex = (remainder + 7) % 7;
  var diff = (dayIndex < weekStartsOn ? 7 : 0) + day - currentDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

var ISODayParser = /*#__PURE__*/function (_Parser) {
  _inherits(ISODayParser, _Parser);
  var _super = _createSuper(ISODayParser);
  function ISODayParser() {
    var _this;
    _classCallCheck(this, ISODayParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 90);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['y', 'Y', 'u', 'q', 'Q', 'M', 'L', 'w', 'd', 'D', 'E', 'e', 'c', 't', 'T']);
    return _this;
  }
  _createClass(ISODayParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      var valueCallback = function valueCallback(value) {
        if (value === 0) {
          return 7;
        }
        return value;
      };
      switch (token) {
        // 2
        case 'i':
        case 'ii':
          // 02
          return parseNDigits(token.length, dateString);
        // 2nd
        case 'io':
          return match.ordinalNumber(dateString, {
            unit: 'day'
          });
        // Tue
        case 'iii':
          return mapValue(match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          }), valueCallback);
        // T
        case 'iiiii':
          return mapValue(match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          }), valueCallback);
        // Tu
        case 'iiiiii':
          return mapValue(match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          }), valueCallback);
        // Tuesday
        case 'iiii':
        default:
          return mapValue(match.day(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'short',
            context: 'formatting'
          }) || match.day(dateString, {
            width: 'narrow',
            context: 'formatting'
          }), valueCallback);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 7;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date = setUTCISODay(date, value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  }]);
  return ISODayParser;
}(Parser);

var AMPMParser = /*#__PURE__*/function (_Parser) {
  _inherits(AMPMParser, _Parser);
  var _super = _createSuper(AMPMParser);
  function AMPMParser() {
    var _this;
    _classCallCheck(this, AMPMParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['b', 'B', 'H', 'k', 't', 'T']);
    return _this;
  }
  _createClass(AMPMParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'a':
        case 'aa':
        case 'aaa':
          return match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'aaaaa':
          return match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'aaaa':
        default:
          return match.dayPeriod(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return AMPMParser;
}(Parser);

var AMPMMidnightParser = /*#__PURE__*/function (_Parser) {
  _inherits(AMPMMidnightParser, _Parser);
  var _super = _createSuper(AMPMMidnightParser);
  function AMPMMidnightParser() {
    var _this;
    _classCallCheck(this, AMPMMidnightParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['a', 'B', 'H', 'k', 't', 'T']);
    return _this;
  }
  _createClass(AMPMMidnightParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'b':
        case 'bb':
        case 'bbb':
          return match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'bbbbb':
          return match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'bbbb':
        default:
          return match.dayPeriod(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return AMPMMidnightParser;
}(Parser);

var DayPeriodParser = /*#__PURE__*/function (_Parser) {
  _inherits(DayPeriodParser, _Parser);
  var _super = _createSuper(DayPeriodParser);
  function DayPeriodParser() {
    var _this;
    _classCallCheck(this, DayPeriodParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 80);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['a', 'b', 't', 'T']);
    return _this;
  }
  _createClass(DayPeriodParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'B':
        case 'BB':
        case 'BBB':
          return match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'BBBBB':
          return match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
        case 'BBBB':
        default:
          return match.dayPeriod(dateString, {
            width: 'wide',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'abbreviated',
            context: 'formatting'
          }) || match.dayPeriod(dateString, {
            width: 'narrow',
            context: 'formatting'
          });
      }
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
  }]);
  return DayPeriodParser;
}(Parser);

var Hour1to12Parser = /*#__PURE__*/function (_Parser) {
  _inherits(Hour1to12Parser, _Parser);
  var _super = _createSuper(Hour1to12Parser);
  function Hour1to12Parser() {
    var _this;
    _classCallCheck(this, Hour1to12Parser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['H', 'K', 'k', 't', 'T']);
    return _this;
  }
  _createClass(Hour1to12Parser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'h':
          return parseNumericPattern(numericPatterns.hour12h, dateString);
        case 'ho':
          return match.ordinalNumber(dateString, {
            unit: 'hour'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 12;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      var isPM = date.getUTCHours() >= 12;
      if (isPM && value < 12) {
        date.setUTCHours(value + 12, 0, 0, 0);
      } else if (!isPM && value === 12) {
        date.setUTCHours(0, 0, 0, 0);
      } else {
        date.setUTCHours(value, 0, 0, 0);
      }
      return date;
    }
  }]);
  return Hour1to12Parser;
}(Parser);

var Hour0to23Parser = /*#__PURE__*/function (_Parser) {
  _inherits(Hour0to23Parser, _Parser);
  var _super = _createSuper(Hour0to23Parser);
  function Hour0to23Parser() {
    var _this;
    _classCallCheck(this, Hour0to23Parser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['a', 'b', 'h', 'K', 'k', 't', 'T']);
    return _this;
  }
  _createClass(Hour0to23Parser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'H':
          return parseNumericPattern(numericPatterns.hour23h, dateString);
        case 'Ho':
          return match.ordinalNumber(dateString, {
            unit: 'hour'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 23;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCHours(value, 0, 0, 0);
      return date;
    }
  }]);
  return Hour0to23Parser;
}(Parser);

var Hour0To11Parser = /*#__PURE__*/function (_Parser) {
  _inherits(Hour0To11Parser, _Parser);
  var _super = _createSuper(Hour0To11Parser);
  function Hour0To11Parser() {
    var _this;
    _classCallCheck(this, Hour0To11Parser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['h', 'H', 'k', 't', 'T']);
    return _this;
  }
  _createClass(Hour0To11Parser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'K':
          return parseNumericPattern(numericPatterns.hour11h, dateString);
        case 'Ko':
          return match.ordinalNumber(dateString, {
            unit: 'hour'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 11;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      var isPM = date.getUTCHours() >= 12;
      if (isPM && value < 12) {
        date.setUTCHours(value + 12, 0, 0, 0);
      } else {
        date.setUTCHours(value, 0, 0, 0);
      }
      return date;
    }
  }]);
  return Hour0To11Parser;
}(Parser);

var Hour1To24Parser = /*#__PURE__*/function (_Parser) {
  _inherits(Hour1To24Parser, _Parser);
  var _super = _createSuper(Hour1To24Parser);
  function Hour1To24Parser() {
    var _this;
    _classCallCheck(this, Hour1To24Parser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 70);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['a', 'b', 'h', 'H', 'K', 't', 'T']);
    return _this;
  }
  _createClass(Hour1To24Parser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'k':
          return parseNumericPattern(numericPatterns.hour24h, dateString);
        case 'ko':
          return match.ordinalNumber(dateString, {
            unit: 'hour'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 1 && value <= 24;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      var hours = value <= 24 ? value % 24 : value;
      date.setUTCHours(hours, 0, 0, 0);
      return date;
    }
  }]);
  return Hour1To24Parser;
}(Parser);

var MinuteParser = /*#__PURE__*/function (_Parser) {
  _inherits(MinuteParser, _Parser);
  var _super = _createSuper(MinuteParser);
  function MinuteParser() {
    var _this;
    _classCallCheck(this, MinuteParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 60);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['t', 'T']);
    return _this;
  }
  _createClass(MinuteParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 'm':
          return parseNumericPattern(numericPatterns.minute, dateString);
        case 'mo':
          return match.ordinalNumber(dateString, {
            unit: 'minute'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 59;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMinutes(value, 0, 0);
      return date;
    }
  }]);
  return MinuteParser;
}(Parser);

var SecondParser = /*#__PURE__*/function (_Parser) {
  _inherits(SecondParser, _Parser);
  var _super = _createSuper(SecondParser);
  function SecondParser() {
    var _this;
    _classCallCheck(this, SecondParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 50);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['t', 'T']);
    return _this;
  }
  _createClass(SecondParser, [{
    key: "parse",
    value: function parse(dateString, token, match) {
      switch (token) {
        case 's':
          return parseNumericPattern(numericPatterns.second, dateString);
        case 'so':
          return match.ordinalNumber(dateString, {
            unit: 'second'
          });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
  }, {
    key: "validate",
    value: function validate(_date, value) {
      return value >= 0 && value <= 59;
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCSeconds(value, 0);
      return date;
    }
  }]);
  return SecondParser;
}(Parser);

var FractionOfSecondParser = /*#__PURE__*/function (_Parser) {
  _inherits(FractionOfSecondParser, _Parser);
  var _super = _createSuper(FractionOfSecondParser);
  function FractionOfSecondParser() {
    var _this;
    _classCallCheck(this, FractionOfSecondParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 30);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['t', 'T']);
    return _this;
  }
  _createClass(FractionOfSecondParser, [{
    key: "parse",
    value: function parse(dateString, token) {
      var valueCallback = function valueCallback(value) {
        return Math.floor(value * Math.pow(10, -token.length + 3));
      };
      return mapValue(parseNDigits(token.length, dateString), valueCallback);
    }
  }, {
    key: "set",
    value: function set(date, _flags, value) {
      date.setUTCMilliseconds(value);
      return date;
    }
  }]);
  return FractionOfSecondParser;
}(Parser);

var ISOTimezoneWithZParser = /*#__PURE__*/function (_Parser) {
  _inherits(ISOTimezoneWithZParser, _Parser);
  var _super = _createSuper(ISOTimezoneWithZParser);
  function ISOTimezoneWithZParser() {
    var _this;
    _classCallCheck(this, ISOTimezoneWithZParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 10);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['t', 'T', 'x']);
    return _this;
  }
  _createClass(ISOTimezoneWithZParser, [{
    key: "parse",
    value: function parse(dateString, token) {
      switch (token) {
        case 'X':
          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
        case 'XX':
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case 'XXXX':
          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
        case 'XXXXX':
          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
        case 'XXX':
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
  }, {
    key: "set",
    value: function set(date, flags, value) {
      if (flags.timestampIsSet) {
        return date;
      }
      return new Date(date.getTime() - value);
    }
  }]);
  return ISOTimezoneWithZParser;
}(Parser);

var ISOTimezoneParser = /*#__PURE__*/function (_Parser) {
  _inherits(ISOTimezoneParser, _Parser);
  var _super = _createSuper(ISOTimezoneParser);
  function ISOTimezoneParser() {
    var _this;
    _classCallCheck(this, ISOTimezoneParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 10);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", ['t', 'T', 'X']);
    return _this;
  }
  _createClass(ISOTimezoneParser, [{
    key: "parse",
    value: function parse(dateString, token) {
      switch (token) {
        case 'x':
          return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
        case 'xx':
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case 'xxxx':
          return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
        case 'xxxxx':
          return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
        case 'xxx':
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
  }, {
    key: "set",
    value: function set(date, flags, value) {
      if (flags.timestampIsSet) {
        return date;
      }
      return new Date(date.getTime() - value);
    }
  }]);
  return ISOTimezoneParser;
}(Parser);

var TimestampSecondsParser = /*#__PURE__*/function (_Parser) {
  _inherits(TimestampSecondsParser, _Parser);
  var _super = _createSuper(TimestampSecondsParser);
  function TimestampSecondsParser() {
    var _this;
    _classCallCheck(this, TimestampSecondsParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 40);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", '*');
    return _this;
  }
  _createClass(TimestampSecondsParser, [{
    key: "parse",
    value: function parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
  }, {
    key: "set",
    value: function set(_date, _flags, value) {
      return [new Date(value * 1000), {
        timestampIsSet: true
      }];
    }
  }]);
  return TimestampSecondsParser;
}(Parser);

var TimestampMillisecondsParser = /*#__PURE__*/function (_Parser) {
  _inherits(TimestampMillisecondsParser, _Parser);
  var _super = _createSuper(TimestampMillisecondsParser);
  function TimestampMillisecondsParser() {
    var _this;
    _classCallCheck(this, TimestampMillisecondsParser);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "priority", 20);
    _defineProperty(_assertThisInitialized(_this), "incompatibleTokens", '*');
    return _this;
  }
  _createClass(TimestampMillisecondsParser, [{
    key: "parse",
    value: function parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
  }, {
    key: "set",
    value: function set(_date, _flags, value) {
      return [new Date(value), {
        timestampIsSet: true
      }];
    }
  }]);
  return TimestampMillisecondsParser;
}(Parser);

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)                 |
 * |  p  |                                |  P  |                                |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `parse` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 */
var parsers = {
  G: new EraParser(),
  y: new YearParser(),
  Y: new LocalWeekYearParser(),
  R: new ISOWeekYearParser(),
  u: new ExtendedYearParser(),
  Q: new QuarterParser(),
  q: new StandAloneQuarterParser(),
  M: new MonthParser(),
  L: new StandAloneMonthParser(),
  w: new LocalWeekParser(),
  I: new ISOWeekParser(),
  d: new DateParser(),
  D: new DayOfYearParser(),
  E: new DayParser(),
  e: new LocalDayParser(),
  c: new StandAloneLocalDayParser(),
  i: new ISODayParser(),
  a: new AMPMParser(),
  b: new AMPMMidnightParser(),
  B: new DayPeriodParser(),
  h: new Hour1to12Parser(),
  H: new Hour0to23Parser(),
  K: new Hour0To11Parser(),
  k: new Hour1To24Parser(),
  m: new MinuteParser(),
  s: new SecondParser(),
  S: new FractionOfSecondParser(),
  X: new ISOTimezoneWithZParser(),
  x: new ISOTimezoneParser(),
  t: new TimestampSecondsParser(),
  T: new TimestampMillisecondsParser()
};

// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var notWhitespaceRegExp = /\S/;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;

/**
 * @name parse
 * @category Common Helpers
 * @summary Parse the date.
 *
 * @description
 * Return the date parsed from string using the given format string.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters in the format string wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 *
 * Format of the format string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 5 below the table).
 *
 * Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
 * and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
 *
 * ```javascript
 * parse('23 AM', 'HH a', new Date())
 * //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
 * ```
 *
 * See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
 *
 * Accepted format string patterns:
 * | Unit                            |Prior| Pattern | Result examples                   | Notes |
 * |---------------------------------|-----|---------|-----------------------------------|-------|
 * | Era                             | 140 | G..GGG  | AD, BC                            |       |
 * |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 |     | GGGGG   | A, B                              |       |
 * | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
 * |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
 * |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
 * |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
 * |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
 * |                                 |     | yyyyy   | ...                               | 2,4   |
 * | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
 * |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
 * |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
 * |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
 * |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
 * |                                 |     | YYYYY   | ...                               | 2,4   |
 * | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
 * |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
 * |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
 * |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
 * |                                 |     | RRRRR   | ...                               | 2,4,5 |
 * | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
 * |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
 * |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
 * |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
 * |                                 |     | uuuuu   | ...                               | 2,4   |
 * | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
 * |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
 * |                                 |     | QQ      | 01, 02, 03, 04                    |       |
 * |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
 * |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
 * |                                 |     | qq      | 01, 02, 03, 04                    |       |
 * |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
 * | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
 * |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
 * |                                 |     | MM      | 01, 02, ..., 12                   |       |
 * |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 |     | MMMM    | January, February, ..., December  | 2     |
 * |                                 |     | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
 * |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
 * |                                 |     | LL      | 01, 02, ..., 12                   |       |
 * |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 |     | LLLL    | January, February, ..., December  | 2     |
 * |                                 |     | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
 * |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
 * |                                 |     | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
 * |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
 * |                                 |     | II      | 01, 02, ..., 53                   | 5     |
 * | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
 * |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
 * |                                 |     | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
 * |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
 * |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
 * |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 |     | DDDD    | ...                               | 2     |
 * | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
 * |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
 * |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
 * |                                 |     | iii     | Mon, Tue, Wed, ..., Sun           | 5     |
 * |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
 * |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
 * |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 5     |
 * | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
 * |                                 |     | ee      | 02, 03, ..., 01                   |       |
 * |                                 |     | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
 * |                                 |     | cc      | 02, 03, ..., 01                   |       |
 * |                                 |     | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
 * |                                 |     | aaaa    | a.m., p.m.                        | 2     |
 * |                                 |     | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
 * |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 |     | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
 * |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 |     | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
 * |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
 * |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
 * |                                 |     | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
 * |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
 * |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
 * |                                 |     | mm      | 00, 01, ..., 59                   |       |
 * | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
 * |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
 * |                                 |     | ss      | 00, 01, ..., 59                   |       |
 * | Seconds timestamp               |  40 | t       | 512969520                         |       |
 * |                                 |     | tt      | ...                               | 2     |
 * | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
 * |                                 |     | SS      | 00, 01, ..., 99                   |       |
 * |                                 |     | SSS     | 000, 001, ..., 999                |       |
 * |                                 |     | SSSS    | ...                               | 2     |
 * | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
 * |                                 |     | TT      | ...                               | 2     |
 * | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
 * |                                 |     | XX      | -0800, +0530, Z                   |       |
 * |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
 * |                                 |     | xx      | -0800, +0530, +0000               |       |
 * |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
 * |                                 |     | PP      | May 29, 1453                      |       |
 * |                                 |     | PPP     | May 29th, 1453                    |       |
 * |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
 * | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
 * |                                 |     | pp      | 12:00:00 AM                       |       |
 * | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
 * |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
 * |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
 * |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular.
 *    In `format` function, they will produce different result:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 *    `parse` will try to match both formatting and stand-alone units interchangably.
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table:
 *    - for numerical units (`yyyyyyyy`) `parse` will try to match a number
 *      as wide as the sequence
 *    - for text units (`MMMMMMMM`) `parse` will try to match the widest variation of the unit.
 *      These variations are marked with "2" in the last column of the table.
 *
 * 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 4. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` will try to guess the century of two digit year by proximity with `referenceDate`:
 *
 *    `parse('50', 'yy', new Date(2018, 0, 1)) //=> Sat Jan 01 2050 00:00:00`
 *
 *    `parse('75', 'yy', new Date(2018, 0, 1)) //=> Wed Jan 01 1975 00:00:00`
 *
 *    while `uu` will just assign the year as is:
 *
 *    `parse('50', 'uu', new Date(2018, 0, 1)) //=> Sat Jan 01 0050 00:00:00`
 *
 *    `parse('75', 'uu', new Date(2018, 0, 1)) //=> Tue Jan 01 0075 00:00:00`
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [setISOWeekYear]{@link https://date-fns.org/docs/setISOWeekYear}
 *    and [setWeekYear]{@link https://date-fns.org/docs/setWeekYear}).
 *
 * 5. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 7. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
 *    on the given locale.
 *
 *    using `en-US` locale: `P` => `MM/dd/yyyy`
 *    using `en-US` locale: `p` => `hh:mm a`
 *    using `pt-BR` locale: `P` => `dd/MM/yyyy`
 *    using `pt-BR` locale: `p` => `HH:mm`
 *
 * Values will be assigned to the date in the descending order of its unit's priority.
 * Units of an equal priority overwrite each other in the order of appearance.
 *
 * If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
 * the values will be taken from 3rd argument `referenceDate` which works as a context of parsing.
 *
 * `referenceDate` must be passed for correct work of the function.
 * If you're not sure which `referenceDate` to supply, create a new instance of Date:
 * `parse('02/11/2014', 'MM/dd/yyyy', new Date())`
 * In this case parsing will be done in the context of the current date.
 * If `referenceDate` is `Invalid Date` or a value not convertible to valid `Date`,
 * then `Invalid Date` will be returned.
 *
 * The result may vary by locale.
 *
 * If `formatString` matches with `dateString` but does not provides tokens, `referenceDate` will be returned.
 *
 * If parsing failed, `Invalid Date` will be returned.
 * Invalid Date is a Date, whose time value is NaN.
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {String} dateString - the string to parse
 * @param {String} formatString - the string of tokens
 * @param {Date|Number} referenceDate - defines values missing from the parsed dateString
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {1|2|3|4|5|6|7} [options.firstWeekContainsDate=1] - the day of January, which is always in the first week of the year
 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {Date} the parsed date
 * @throws {TypeError} 3 arguments required
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} `options.locale` must contain `match` property
 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} format string contains an unescaped latin alphabet character
 *
 * @example
 * // Parse 11 February 2014 from middle-endian format:
 * var result = parse('02/11/2014', 'MM/dd/yyyy', new Date())
 * //=> Tue Feb 11 2014 00:00:00
 *
 * @example
 * // Parse 28th of February in Esperanto locale in the context of 2010 year:
 * import eo from 'date-fns/locale/eo'
 * var result = parse('28-a de februaro', "do 'de' MMMM", new Date(2010, 0, 1), {
 *   locale: eo
 * })
 * //=> Sun Feb 28 2010 00:00:00
 */
function parse(dirtyDateString, dirtyFormatString, dirtyReferenceDate, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _defaultOptions$local3, _defaultOptions$local4;
  requiredArgs(3, arguments);
  var dateString = String(dirtyDateString);
  var formatString = String(dirtyFormatString);
  var defaultOptions = getDefaultOptions();
  var locale$1 = (_ref = (_options$locale = void 0 ) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions.locale) !== null && _ref !== void 0 ? _ref : locale;
  if (!locale$1.match) {
    throw new RangeError('locale must contain match property');
  }
  var firstWeekContainsDate = toInteger((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = void 0 ) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : void 0 ) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1);

  // Test if weekStartsOn is between 1 and 7 _and_ is not NaN
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }
  var weekStartsOn = toInteger((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = void 0 ) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : void 0 ) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0);

  // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }
  if (formatString === '') {
    if (dateString === '') {
      return toDate(dirtyReferenceDate);
    } else {
      return new Date(NaN);
    }
  }
  var subFnOptions = {
    firstWeekContainsDate: firstWeekContainsDate,
    weekStartsOn: weekStartsOn,
    locale: locale$1
  };

  // If timezone isn't specified, it will be set to the system timezone
  var setters = [new DateToSystemTimezoneSetter()];
  var tokens = formatString.match(longFormattingTokensRegExp).map(function (substring) {
    var firstCharacter = substring[0];
    if (firstCharacter in longFormatters) {
      var longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale$1.formatLong);
    }
    return substring;
  }).join('').match(formattingTokensRegExp);
  var usedTokens = [];
  var _iterator = _createForOfIteratorHelper(tokens),
    _step;
  try {
    var _loop = function _loop() {
      var token = _step.value;
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && isProtectedWeekYearToken(token)) {
        throwProtectedError(token, formatString, dirtyDateString);
      }
      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && isProtectedDayOfYearToken(token)) {
        throwProtectedError(token, formatString, dirtyDateString);
      }
      var firstCharacter = token[0];
      var parser = parsers[firstCharacter];
      if (parser) {
        var incompatibleTokens = parser.incompatibleTokens;
        if (Array.isArray(incompatibleTokens)) {
          var incompatibleToken = usedTokens.find(function (usedToken) {
            return incompatibleTokens.includes(usedToken.token) || usedToken.token === firstCharacter;
          });
          if (incompatibleToken) {
            throw new RangeError("The format string mustn't contain `".concat(incompatibleToken.fullToken, "` and `").concat(token, "` at the same time"));
          }
        } else if (parser.incompatibleTokens === '*' && usedTokens.length > 0) {
          throw new RangeError("The format string mustn't contain `".concat(token, "` and any other token at the same time"));
        }
        usedTokens.push({
          token: firstCharacter,
          fullToken: token
        });
        var parseResult = parser.run(dateString, token, locale$1.match, subFnOptions);
        if (!parseResult) {
          return {
            v: new Date(NaN)
          };
        }
        setters.push(parseResult.setter);
        dateString = parseResult.rest;
      } else {
        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        // Replace two single quote characters with one single quote character
        if (token === "''") {
          token = "'";
        } else if (firstCharacter === "'") {
          token = cleanEscapedString(token);
        }

        // Cut token from string, or, if string doesn't match the token, return Invalid Date
        if (dateString.indexOf(token) === 0) {
          dateString = dateString.slice(token.length);
        } else {
          return {
            v: new Date(NaN)
          };
        }
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();
      if (_typeof(_ret) === "object") return _ret.v;
    }

    // Check if the remaining input contains something other than whitespace
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (dateString.length > 0 && notWhitespaceRegExp.test(dateString)) {
    return new Date(NaN);
  }
  var uniquePrioritySetters = setters.map(function (setter) {
    return setter.priority;
  }).sort(function (a, b) {
    return b - a;
  }).filter(function (priority, index, array) {
    return array.indexOf(priority) === index;
  }).map(function (priority) {
    return setters.filter(function (setter) {
      return setter.priority === priority;
    }).sort(function (a, b) {
      return b.subPriority - a.subPriority;
    });
  }).map(function (setterArray) {
    return setterArray[0];
  });
  var date = toDate(dirtyReferenceDate);
  if (isNaN(date.getTime())) {
    return new Date(NaN);
  }

  // Convert the date in system timezone to the same date in UTC+00:00 timezone.
  var utcDate = subMilliseconds(date, getTimezoneOffsetInMilliseconds(date));
  var flags = {};
  var _iterator2 = _createForOfIteratorHelper(uniquePrioritySetters),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var setter = _step2.value;
      if (!setter.validate(utcDate, subFnOptions)) {
        return new Date(NaN);
      }
      var result = setter.set(utcDate, flags, subFnOptions);
      // Result is tuple (date, flags)
      if (Array.isArray(result)) {
        utcDate = result[0];
        assign(flags, result[1]);
        // Result is date
      } else {
        utcDate = result;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return utcDate;
}
function cleanEscapedString(input) {
  return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
}

/**
 * @name parseISO
 * @category Common Helpers
 * @summary Parse ISO string
 *
 * @description
 * Parse the given string in ISO 8601 format and return an instance of Date.
 *
 * Function accepts complete ISO 8601 formats as well as partial implementations.
 * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
 *
 * If the argument isn't a string, the function cannot parse the string or
 * the values are invalid, it returns Invalid Date.
 *
 * @param {String} argument - the value to convert
 * @param {Object} [options] - an object with options.
 * @param {0|1|2} [options.additionalDigits=2] - the additional number of digits in the extended year format
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 * @throws {RangeError} `options.additionalDigits` must be 0, 1 or 2
 *
 * @example
 * // Convert string '2014-02-11T11:30:30' to date:
 * const result = parseISO('2014-02-11T11:30:30')
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert string '+02014101' to date,
 * // if the additional number of digits in the extended year format is 1:
 * const result = parseISO('+02014101', { additionalDigits: 1 })
 * //=> Fri Apr 11 2014 00:00:00
 */
function parseISO(argument, options) {
  var _options$additionalDi;
  requiredArgs(1, arguments);
  var additionalDigits = toInteger((_options$additionalDi = void 0 ) !== null && _options$additionalDi !== void 0 ? _options$additionalDi : 2);
  if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
    throw new RangeError('additionalDigits must be 0, 1 or 2');
  }
  if (!(typeof argument === 'string' || Object.prototype.toString.call(argument) === '[object String]')) {
    return new Date(NaN);
  }
  var dateStrings = splitDateString(argument);
  var date;
  if (dateStrings.date) {
    var parseYearResult = parseYear(dateStrings.date, additionalDigits);
    date = parseDate(parseYearResult.restDateString, parseYearResult.year);
  }
  if (!date || isNaN(date.getTime())) {
    return new Date(NaN);
  }
  var timestamp = date.getTime();
  var time = 0;
  var offset;
  if (dateStrings.time) {
    time = parseTime(dateStrings.time);
    if (isNaN(time)) {
      return new Date(NaN);
    }
  }
  if (dateStrings.timezone) {
    offset = parseTimezone(dateStrings.timezone);
    if (isNaN(offset)) {
      return new Date(NaN);
    }
  } else {
    var dirtyDate = new Date(timestamp + time);
    // js parsed string assuming it's in UTC timezone
    // but we need it to be parsed in our timezone
    // so we use utc values to build date in our timezone.
    // Year values from 0 to 99 map to the years 1900 to 1999
    // so set year explicitly with setFullYear.
    var result = new Date(0);
    result.setFullYear(dirtyDate.getUTCFullYear(), dirtyDate.getUTCMonth(), dirtyDate.getUTCDate());
    result.setHours(dirtyDate.getUTCHours(), dirtyDate.getUTCMinutes(), dirtyDate.getUTCSeconds(), dirtyDate.getUTCMilliseconds());
    return result;
  }
  return new Date(timestamp + time + offset);
}
var patterns = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/
};
var dateRegex = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
var timeRegex = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
var timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function splitDateString(dateString) {
  var dateStrings = {};
  var array = dateString.split(patterns.dateTimeDelimiter);
  var timeString;

  // The regex match should only return at maximum two array elements.
  // [date], [time], or [date, time].
  if (array.length > 2) {
    return dateStrings;
  }
  if (/:/.test(array[0])) {
    timeString = array[0];
  } else {
    dateStrings.date = array[0];
    timeString = array[1];
    if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
      dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
      timeString = dateString.substr(dateStrings.date.length, dateString.length);
    }
  }
  if (timeString) {
    var token = patterns.timezone.exec(timeString);
    if (token) {
      dateStrings.time = timeString.replace(token[1], '');
      dateStrings.timezone = token[1];
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  var regex = new RegExp('^(?:(\\d{4}|[+-]\\d{' + (4 + additionalDigits) + '})|(\\d{2}|[+-]\\d{' + (2 + additionalDigits) + '})$)');
  var captures = dateString.match(regex);
  // Invalid ISO-formatted year
  if (!captures) return {
    year: NaN,
    restDateString: ''
  };
  var year = captures[1] ? parseInt(captures[1]) : null;
  var century = captures[2] ? parseInt(captures[2]) : null;

  // either year or century is null, not both
  return {
    year: century === null ? year : century * 100,
    restDateString: dateString.slice((captures[1] || captures[2]).length)
  };
}
function parseDate(dateString, year) {
  // Invalid ISO-formatted year
  if (year === null) return new Date(NaN);
  var captures = dateString.match(dateRegex);
  // Invalid ISO-formatted string
  if (!captures) return new Date(NaN);
  var isWeekDate = !!captures[4];
  var dayOfYear = parseDateUnit(captures[1]);
  var month = parseDateUnit(captures[2]) - 1;
  var day = parseDateUnit(captures[3]);
  var week = parseDateUnit(captures[4]);
  var dayOfWeek = parseDateUnit(captures[5]) - 1;
  if (isWeekDate) {
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  } else {
    var date = new Date(0);
    if (!validateDate(year, month, day) || !validateDayOfYearDate(year, dayOfYear)) {
      return new Date(NaN);
    }
    date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
    return date;
  }
}
function parseDateUnit(value) {
  return value ? parseInt(value) : 1;
}
function parseTime(timeString) {
  var captures = timeString.match(timeRegex);
  if (!captures) return NaN; // Invalid ISO-formatted time

  var hours = parseTimeUnit(captures[1]);
  var minutes = parseTimeUnit(captures[2]);
  var seconds = parseTimeUnit(captures[3]);
  if (!validateTime(hours, minutes, seconds)) {
    return NaN;
  }
  return hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1000;
}
function parseTimeUnit(value) {
  return value && parseFloat(value.replace(',', '.')) || 0;
}
function parseTimezone(timezoneString) {
  if (timezoneString === 'Z') return 0;
  var captures = timezoneString.match(timezoneRegex);
  if (!captures) return 0;
  var sign = captures[1] === '+' ? -1 : 1;
  var hours = parseInt(captures[2]);
  var minutes = captures[3] && parseInt(captures[3]) || 0;
  if (!validateTimezone(hours, minutes)) {
    return NaN;
  }
  return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  var date = new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  var fourthOfJanuaryDay = date.getUTCDay() || 7;
  var diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

// Validation functions

// February is null to handle the leap year (using ||)
var daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
  return month >= 0 && month <= 11 && date >= 1 && date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28));
}
function validateDayOfYearDate(year, dayOfYear) {
  return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365);
}
function validateWeekDate(_year, week, day) {
  return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}
function validateTime(hours, minutes, seconds) {
  if (hours === 24) {
    return minutes === 0 && seconds === 0;
  }
  return seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 25;
}
function validateTimezone(_hours, minutes) {
  return minutes >= 0 && minutes <= 59;
}

/* src/LoomView.svelte generated by Svelte v4.2.20 */

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[74] = list[i];
	return child_ctx;
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[74] = list[i];
	return child_ctx;
}

function get_each_context_7(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[79] = list[i];
	return child_ctx;
}

function get_each_context_8(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[82] = list[i];
	return child_ctx;
}

function get_each_context_9(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[85] = list[i];
	child_ctx[87] = i;
	return child_ctx;
}

function get_each_context_10(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[88] = list[i];
	return child_ctx;
}

function get_each_context_11(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[85] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[79] = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[82] = list[i];
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[85] = list[i];
	child_ctx[87] = i;
	return child_ctx;
}

function get_each_context_5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[88] = list[i];
	return child_ctx;
}

function get_each_context_6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[85] = list[i];
	return child_ctx;
}

function get_each_context_12(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[102] = list[i];
	return child_ctx;
}

// (881:6) {:else}
function create_else_block_1(ctx) {
	let button0;
	let t1;
	let button1;
	let t3;
	let button2;
	let mounted;
	let dispose;

	return {
		c() {
			button0 = element("button");
			button0.textContent = "Month";
			t1 = space();
			button1 = element("button");
			button1.textContent = "Week";
			t3 = space();
			button2 = element("button");
			button2.textContent = "Day";
			attr(button0, "class", "svelte-dyk7sv");
			toggle_class(button0, "active", /*dateResolution*/ ctx[7] === 'Month');
			attr(button1, "class", "svelte-dyk7sv");
			toggle_class(button1, "active", /*dateResolution*/ ctx[7] === 'Week');
			attr(button2, "class", "svelte-dyk7sv");
			toggle_class(button2, "active", /*dateResolution*/ ctx[7] === 'Day');
		},
		m(target, anchor) {
			insert(target, button0, anchor);
			insert(target, t1, anchor);
			insert(target, button1, anchor);
			insert(target, t3, anchor);
			insert(target, button2, anchor);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler_1*/ ctx[50]),
					listen(button1, "click", /*click_handler_2*/ ctx[51]),
					listen(button2, "click", /*click_handler_3*/ ctx[52])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dateResolution*/ 128) {
				toggle_class(button0, "active", /*dateResolution*/ ctx[7] === 'Month');
			}

			if (dirty[0] & /*dateResolution*/ 128) {
				toggle_class(button1, "active", /*dateResolution*/ ctx[7] === 'Week');
			}

			if (dirty[0] & /*dateResolution*/ 128) {
				toggle_class(button2, "active", /*dateResolution*/ ctx[7] === 'Day');
			}
		},
		d(detaching) {
			if (detaching) {
				detach(button0);
				detach(t1);
				detach(button1);
				detach(t3);
				detach(button2);
			}

			mounted = false;
			run_all(dispose);
		}
	};
}

// (865:6) {#if viewMode === 'years'}
function create_if_block_7(ctx) {
	let each_1_anchor;
	let each_value_12 = ensure_array_like(/*zoomLevels*/ ctx[12]);
	let each_blocks = [];

	for (let i = 0; i < each_value_12.length; i += 1) {
		each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_12, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*resolution, zoomLevels, scrollToCenturyEnd, scrollToDecadeOrYear*/ 201330692) {
				each_value_12 = ensure_array_like(/*zoomLevels*/ ctx[12]);
				let i;

				for (i = 0; i < each_value_12.length; i += 1) {
					const child_ctx = get_each_context_12(ctx, each_value_12, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_12(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_12.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (866:8) {#each zoomLevels as zoomLevel}
function create_each_block_12(ctx) {
	let button;
	let t0_value = getZoomLabel(/*zoomLevel*/ ctx[102]) + "";
	let t0;
	let t1;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[49](/*zoomLevel*/ ctx[102]);
	}

	return {
		c() {
			button = element("button");
			t0 = text(t0_value);
			t1 = space();
			attr(button, "class", "svelte-dyk7sv");
			toggle_class(button, "active", /*resolution*/ ctx[2] === /*zoomLevel*/ ctx[102]);
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
			if (dirty[0] & /*zoomLevels*/ 4096 && t0_value !== (t0_value = getZoomLabel(/*zoomLevel*/ ctx[102]) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*resolution, zoomLevels*/ 4100) {
				toggle_class(button, "active", /*resolution*/ ctx[2] === /*zoomLevel*/ ctx[102]);
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

// (974:33) 
function create_if_block_4(ctx) {
	let div;
	let previous_key = /*dateResolution*/ ctx[7];
	let key_block = create_key_block_1(ctx);

	return {
		c() {
			div = element("div");
			key_block.c();
			attr(div, "class", "loom-main-content svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			key_block.m(div, null);
			/*div_binding_1*/ ctx[64](div);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*dateResolution*/ 128 && safe_not_equal(previous_key, previous_key = /*dateResolution*/ ctx[7])) {
				key_block.d(1);
				key_block = create_key_block_1(ctx);
				key_block.c();
				key_block.m(div, null);
			} else {
				key_block.p(ctx, dirty);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			key_block.d(detaching);
			/*div_binding_1*/ ctx[64](null);
		}
	};
}

// (889:2) {#if viewMode === 'years'}
function create_if_block_1(ctx) {
	let div;
	let previous_key = /*resolution*/ ctx[2];
	let key_block = create_key_block(ctx);

	return {
		c() {
			div = element("div");
			key_block.c();
			attr(div, "class", "loom-main-content svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			key_block.m(div, null);
			/*div_binding*/ ctx[58](div);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*resolution*/ 4 && safe_not_equal(previous_key, previous_key = /*resolution*/ ctx[2])) {
				key_block.d(1);
				key_block = create_key_block(ctx);
				key_block.c();
				key_block.m(div, null);
			} else {
				key_block.p(ctx, dirty);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			key_block.d(detaching);
			/*div_binding*/ ctx[58](null);
		}
	};
}

// (990:14) {#if showLaneFilter}
function create_if_block_6(ctx) {
	let div;
	let each_value_11 = ensure_array_like(/*lanes*/ ctx[5]);
	let each_blocks = [];

	for (let i = 0; i < each_value_11.length; i += 1) {
		each_blocks[i] = create_each_block_11(get_each_context_11(ctx, each_value_11, i));
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
			if (dirty[0] & /*lanes, visibleLanes*/ 288) {
				each_value_11 = ensure_array_like(/*lanes*/ ctx[5]);
				let i;

				for (i = 0; i < each_value_11.length; i += 1) {
					const child_ctx = get_each_context_11(ctx, each_value_11, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_11(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_11.length;
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

// (992:18) {#each lanes as lane}
function create_each_block_11(ctx) {
	let label_1;
	let input;
	let input_checked_value;
	let t0;
	let span;
	let t1_value = /*lane*/ ctx[85] + "";
	let t1;
	let t2;
	let mounted;
	let dispose;

	function change_handler_1(...args) {
		return /*change_handler_1*/ ctx[60](/*lane*/ ctx[85], ...args);
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
			input.checked = input_checked_value = /*visibleLanes*/ ctx[8].has(/*lane*/ ctx[85]);
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
				dispose = listen(input, "change", change_handler_1);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*visibleLanes, lanes*/ 288 && input_checked_value !== (input_checked_value = /*visibleLanes*/ ctx[8].has(/*lane*/ ctx[85]))) {
				input.checked = input_checked_value;
			}

			if (dirty[0] & /*lanes*/ 32 && t1_value !== (t1_value = /*lane*/ ctx[85] + "")) set_data(t1, t1_value);
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

// (1016:14) {#each dateTimelineLabels as label}
function create_each_block_10(ctx) {
	let div;
	let t_1_value = /*label*/ ctx[88].display + "";
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
			if (dirty[0] & /*dateTimelineLabels*/ 4194304 && t_1_value !== (t_1_value = /*label*/ ctx[88].display + "")) set_data(t_1, t_1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (1023:12) {#each filteredLanes as lane, laneIndex}
function create_each_block_9(ctx) {
	let div;
	let t_1_value = /*lane*/ ctx[85] + "";
	let t_1;

	return {
		c() {
			div = element("div");
			t_1 = text(t_1_value);
			attr(div, "class", "region-label svelte-dyk7sv");
			set_style(div, "grid-column", "1");
			set_style(div, "grid-row", /*dateRegionStartRow*/ ctx[20][/*laneIndex*/ ctx[87]] + " / span " + /*datePlacements*/ ctx[9].regionLaneCounts[/*laneIndex*/ ctx[87]]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*filteredLanes*/ 2048 && t_1_value !== (t_1_value = /*lane*/ ctx[85] + "")) set_data(t_1, t_1_value);

			if (dirty[0] & /*dateRegionStartRow, datePlacements*/ 1049088) {
				set_style(div, "grid-row", /*dateRegionStartRow*/ ctx[20][/*laneIndex*/ ctx[87]] + " / span " + /*datePlacements*/ ctx[9].regionLaneCounts[/*laneIndex*/ ctx[87]]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (1029:12) {#each datePlacements.placements as p}
function create_each_block_8(ctx) {
	let div1;
	let button;
	let div0;
	let t0_value = /*p*/ ctx[82].note.title + "";
	let t0;
	let button_class_value;
	let button_style_value;
	let button_title_value;
	let t1;
	let div1_style_value;
	let div1_data_note_path_value;
	let mounted;
	let dispose;

	function click_handler_7() {
		return /*click_handler_7*/ ctx[61](/*p*/ ctx[82]);
	}

	function mouseenter_handler_1() {
		return /*mouseenter_handler_1*/ ctx[62](/*p*/ ctx[82]);
	}

	function focus_handler_1() {
		return /*focus_handler_1*/ ctx[63](/*p*/ ctx[82]);
	}

	return {
		c() {
			div1 = element("div");
			button = element("button");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div0, "class", "note-title svelte-dyk7sv");
			attr(button, "class", button_class_value = "note-block " + /*p*/ ctx[82].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]) + " svelte-dyk7sv");

			attr(button, "style", button_style_value = /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]))}`
			: '');

			attr(button, "title", button_title_value = "" + (/*p*/ ctx[82].note.title + " (" + format(/*p*/ ctx[82].note.dateStart, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + " to " + format(/*p*/ ctx[82].note.dateEnd, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + ")"));
			toggle_class(button, "highlight", /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note));
			attr(div1, "class", "note-block-wrapper svelte-dyk7sv");
			attr(div1, "style", div1_style_value = /*getDateNoteStyle*/ ctx[29](/*p*/ ctx[82]));
			attr(div1, "data-note-path", div1_data_note_path_value = /*p*/ ctx[82].note.path);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button);
			append(button, div0);
			append(div0, t0);
			append(div1, t1);

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler_7),
					listen(button, "mouseenter", mouseenter_handler_1),
					listen(button, "mouseleave", /*handleMouseOut*/ ctx[32]),
					listen(button, "focus", focus_handler_1),
					listen(button, "blur", /*handleMouseOut*/ ctx[32])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*datePlacements*/ 512 && t0_value !== (t0_value = /*p*/ ctx[82].note.title + "")) set_data(t0, t0_value);

			if (dirty[0] & /*datePlacements, filteredLanes*/ 2560 && button_class_value !== (button_class_value = "note-block " + /*p*/ ctx[82].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]) + " svelte-dyk7sv")) {
				attr(button, "class", button_class_value);
			}

			if (dirty[0] & /*datePlacements, filteredLanes*/ 2560 && button_style_value !== (button_style_value = /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]))}`
			: '')) {
				attr(button, "style", button_style_value);
			}

			if (dirty[0] & /*datePlacements, settings*/ 513 && button_title_value !== (button_title_value = "" + (/*p*/ ctx[82].note.title + " (" + format(/*p*/ ctx[82].note.dateStart, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + " to " + format(/*p*/ ctx[82].note.dateEnd, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + ")"))) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*datePlacements, filteredLanes, datePlacements*/ 2560 | dirty[1] & /*isHighlighted*/ 16) {
				toggle_class(button, "highlight", /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note));
			}

			if (dirty[0] & /*datePlacements*/ 512 && div1_style_value !== (div1_style_value = /*getDateNoteStyle*/ ctx[29](/*p*/ ctx[82]))) {
				attr(div1, "style", div1_style_value);
			}

			if (dirty[0] & /*datePlacements*/ 512 && div1_data_note_path_value !== (div1_data_note_path_value = /*p*/ ctx[82].note.path)) {
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

// (1047:10) {#if threadLines && mainContentEl}
function create_if_block_5(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let each_value_7 = ensure_array_like(/*threadLines*/ ctx[13].to);
	let each_blocks = [];

	for (let i = 0; i < each_value_7.length; i += 1) {
		each_blocks[i] = create_each_block_7(get_each_context_7(ctx, each_value_7, i));
	}

	return {
		c() {
			svg = svg_element("svg");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(svg, "class", "thread-svg svelte-dyk7sv");
			attr(svg, "pointer-events", "none");
			attr(svg, "width", svg_width_value = /*mainContentEl*/ ctx[1].scrollWidth);
			attr(svg, "height", svg_height_value = /*mainContentEl*/ ctx[1].scrollHeight);
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
			if (dirty[0] & /*threadLines*/ 8192) {
				each_value_7 = ensure_array_like(/*threadLines*/ ctx[13].to);
				let i;

				for (i = 0; i < each_value_7.length; i += 1) {
					const child_ctx = get_each_context_7(ctx, each_value_7, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_7(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(svg, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_7.length;
			}

			if (dirty[0] & /*mainContentEl*/ 2 && svg_width_value !== (svg_width_value = /*mainContentEl*/ ctx[1].scrollWidth)) {
				attr(svg, "width", svg_width_value);
			}

			if (dirty[0] & /*mainContentEl*/ 2 && svg_height_value !== (svg_height_value = /*mainContentEl*/ ctx[1].scrollHeight)) {
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

// (1049:14) {#each threadLines.to as t}
function create_each_block_7(ctx) {
	let line;
	let line_x__value;
	let line_y__value;
	let line_x__value_1;
	let line_y__value_1;

	return {
		c() {
			line = svg_element("line");
			attr(line, "x1", line_x__value = /*threadLines*/ ctx[13].from.x);
			attr(line, "y1", line_y__value = /*threadLines*/ ctx[13].from.y);
			attr(line, "x2", line_x__value_1 = /*t*/ ctx[79].x);
			attr(line, "y2", line_y__value_1 = /*t*/ ctx[79].y);
			attr(line, "class", "thread-line svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, line, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*threadLines*/ 8192 && line_x__value !== (line_x__value = /*threadLines*/ ctx[13].from.x)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_y__value !== (line_y__value = /*threadLines*/ ctx[13].from.y)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_x__value_1 !== (line_x__value_1 = /*t*/ ctx[79].x)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_y__value_1 !== (line_y__value_1 = /*t*/ ctx[79].y)) {
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

// (976:6) {#key dateResolution}
function create_key_block_1(ctx) {
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
	let if_block0 = /*showLaneFilter*/ ctx[14] && create_if_block_6(ctx);
	let each_value_10 = ensure_array_like(/*dateTimelineLabels*/ ctx[22]);
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_10.length; i += 1) {
		each_blocks_2[i] = create_each_block_10(get_each_context_10(ctx, each_value_10, i));
	}

	let each_value_9 = ensure_array_like(/*filteredLanes*/ ctx[11]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_9.length; i += 1) {
		each_blocks_1[i] = create_each_block_9(get_each_context_9(ctx, each_value_9, i));
	}

	let each_value_8 = ensure_array_like(/*datePlacements*/ ctx[9].placements);
	let each_blocks = [];

	for (let i = 0; i < each_value_8.length; i += 1) {
		each_blocks[i] = create_each_block_8(get_each_context_8(ctx, each_value_8, i));
	}

	let if_block1 = /*threadLines*/ ctx[13] && /*mainContentEl*/ ctx[1] && create_if_block_5(ctx);

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
			set_style(div2, "grid-template-columns", "repeat(" + /*dateTimelineSpan*/ ctx[23] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			attr(div3, "class", "timeline-header-row svelte-dyk7sv");
			set_style(div3, "grid-column", "2 / -1");
			set_style(div3, "grid-row", "1");
			attr(div4, "class", "region-labels svelte-dyk7sv");
			attr(div5, "class", "loom-grid svelte-dyk7sv");
			attr(div6, "class", "loom-inner-grid svelte-dyk7sv");
			set_style(div6, "grid-template-columns", "150px repeat(" + /*dateTimelineSpan*/ ctx[23] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			set_style(div6, "grid-template-rows", "auto repeat(" + /*totalDateContentRows*/ ctx[24] + ", minmax(60px, 1fr))");
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
				dispose = listen(button, "click", /*click_handler_6*/ ctx[59]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*showLaneFilter*/ ctx[14]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_6(ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*dateTimelineLabels*/ 4194304) {
				each_value_10 = ensure_array_like(/*dateTimelineLabels*/ ctx[22]);
				let i;

				for (i = 0; i < each_value_10.length; i += 1) {
					const child_ctx = get_each_context_10(ctx, each_value_10, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_10(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(div2, null);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_10.length;
			}

			if (dirty[0] & /*dateTimelineSpan, columnMinWidthPx*/ 8519680) {
				set_style(div2, "grid-template-columns", "repeat(" + /*dateTimelineSpan*/ ctx[23] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			}

			if (dirty[0] & /*dateRegionStartRow, datePlacements, filteredLanes*/ 1051136) {
				each_value_9 = ensure_array_like(/*filteredLanes*/ ctx[11]);
				let i;

				for (i = 0; i < each_value_9.length; i += 1) {
					const child_ctx = get_each_context_9(ctx, each_value_9, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_9(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div4, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_9.length;
			}

			if (dirty[0] & /*getDateNoteStyle, datePlacements, filteredLanes, settings, handleNoteClick*/ 1610615297 | dirty[1] & /*isHighlighted, handleMouseOver, handleMouseOut*/ 19) {
				each_value_8 = ensure_array_like(/*datePlacements*/ ctx[9].placements);
				let i;

				for (i = 0; i < each_value_8.length; i += 1) {
					const child_ctx = get_each_context_8(ctx, each_value_8, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_8(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div5, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_8.length;
			}

			if (/*threadLines*/ ctx[13] && /*mainContentEl*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_5(ctx);
					if_block1.c();
					if_block1.m(div6, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*dateTimelineSpan, columnMinWidthPx*/ 8519680) {
				set_style(div6, "grid-template-columns", "150px repeat(" + /*dateTimelineSpan*/ ctx[23] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			}

			if (dirty[0] & /*totalDateContentRows*/ 16777216) {
				set_style(div6, "grid-template-rows", "auto repeat(" + /*totalDateContentRows*/ ctx[24] + ", minmax(60px, 1fr))");
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

// (907:14) {#if showLaneFilter}
function create_if_block_3(ctx) {
	let div;
	let each_value_6 = ensure_array_like(/*lanes*/ ctx[5]);
	let each_blocks = [];

	for (let i = 0; i < each_value_6.length; i += 1) {
		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
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
			if (dirty[0] & /*lanes, visibleLanes*/ 288) {
				each_value_6 = ensure_array_like(/*lanes*/ ctx[5]);
				let i;

				for (i = 0; i < each_value_6.length; i += 1) {
					const child_ctx = get_each_context_6(ctx, each_value_6, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_6(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_6.length;
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

// (909:18) {#each lanes as lane}
function create_each_block_6(ctx) {
	let label_1;
	let input;
	let input_checked_value;
	let t0;
	let span;
	let t1_value = /*lane*/ ctx[85] + "";
	let t1;
	let t2;
	let mounted;
	let dispose;

	function change_handler(...args) {
		return /*change_handler*/ ctx[54](/*lane*/ ctx[85], ...args);
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
			input.checked = input_checked_value = /*visibleLanes*/ ctx[8].has(/*lane*/ ctx[85]);
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

			if (dirty[0] & /*visibleLanes, lanes*/ 288 && input_checked_value !== (input_checked_value = /*visibleLanes*/ ctx[8].has(/*lane*/ ctx[85]))) {
				input.checked = input_checked_value;
			}

			if (dirty[0] & /*lanes*/ 32 && t1_value !== (t1_value = /*lane*/ ctx[85] + "")) set_data(t1, t1_value);
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

// (933:14) {#each timelineLabels as label}
function create_each_block_5(ctx) {
	let div;
	let t_1_value = /*label*/ ctx[88].display + "";
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
			if (dirty[0] & /*timelineLabels*/ 32768 && t_1_value !== (t_1_value = /*label*/ ctx[88].display + "")) set_data(t_1, t_1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (940:12) {#each filteredLanes as lane, laneIndex}
function create_each_block_4(ctx) {
	let div;
	let t_1_value = /*lane*/ ctx[85] + "";
	let t_1;

	return {
		c() {
			div = element("div");
			t_1 = text(t_1_value);
			attr(div, "class", "region-label svelte-dyk7sv");
			set_style(div, "grid-column", "1");
			set_style(div, "grid-row", /*regionStartRow*/ ctx[21][/*laneIndex*/ ctx[87]] + " / span " + /*placements*/ ctx[10].regionLaneCounts[/*laneIndex*/ ctx[87]]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*filteredLanes*/ 2048 && t_1_value !== (t_1_value = /*lane*/ ctx[85] + "")) set_data(t_1, t_1_value);

			if (dirty[0] & /*regionStartRow, placements*/ 2098176) {
				set_style(div, "grid-row", /*regionStartRow*/ ctx[21][/*laneIndex*/ ctx[87]] + " / span " + /*placements*/ ctx[10].regionLaneCounts[/*laneIndex*/ ctx[87]]);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (946:12) {#each placements.placements as p}
function create_each_block_3(ctx) {
	let div1;
	let button;
	let div0;
	let t0_value = /*p*/ ctx[82].note.title + "";
	let t0;
	let button_class_value;
	let button_style_value;
	let button_title_value;
	let t1;
	let div1_style_value;
	let div1_data_note_path_value;
	let mounted;
	let dispose;

	function click_handler_5() {
		return /*click_handler_5*/ ctx[55](/*p*/ ctx[82]);
	}

	function mouseenter_handler() {
		return /*mouseenter_handler*/ ctx[56](/*p*/ ctx[82]);
	}

	function focus_handler() {
		return /*focus_handler*/ ctx[57](/*p*/ ctx[82]);
	}

	return {
		c() {
			div1 = element("div");
			button = element("button");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div0, "class", "note-title svelte-dyk7sv");
			attr(button, "class", button_class_value = "note-block " + /*p*/ ctx[82].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]) + " svelte-dyk7sv");

			attr(button, "style", button_style_value = /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]))}`
			: '');

			attr(button, "title", button_title_value = "" + (/*p*/ ctx[82].note.title + " (" + /*p*/ ctx[82].note.yearStartDisplay + " to " + /*p*/ ctx[82].note.yearEndDisplay + ")"));
			toggle_class(button, "highlight", /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note));
			attr(div1, "class", "note-block-wrapper svelte-dyk7sv");
			attr(div1, "style", div1_style_value = /*getNoteStyle*/ ctx[28](/*p*/ ctx[82]));
			attr(div1, "data-note-path", div1_data_note_path_value = /*p*/ ctx[82].note.path);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button);
			append(button, div0);
			append(div0, t0);
			append(div1, t1);

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler_5),
					listen(button, "mouseenter", mouseenter_handler),
					listen(button, "mouseleave", /*handleMouseOut*/ ctx[32]),
					listen(button, "focus", focus_handler),
					listen(button, "blur", /*handleMouseOut*/ ctx[32])
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*placements*/ 1024 && t0_value !== (t0_value = /*p*/ ctx[82].note.title + "")) set_data(t0, t0_value);

			if (dirty[0] & /*placements, filteredLanes*/ 3072 && button_class_value !== (button_class_value = "note-block " + /*p*/ ctx[82].note.noteStyle + " region-" + getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]) + " svelte-dyk7sv")) {
				attr(button, "class", button_class_value);
			}

			if (dirty[0] & /*placements, filteredLanes*/ 3072 && button_style_value !== (button_style_value = /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note)
			? `--glow-color: ${getLaneColor(getRegionSlug(/*filteredLanes*/ ctx[11][/*p*/ ctx[82].regionIndex]))}`
			: '')) {
				attr(button, "style", button_style_value);
			}

			if (dirty[0] & /*placements*/ 1024 && button_title_value !== (button_title_value = "" + (/*p*/ ctx[82].note.title + " (" + /*p*/ ctx[82].note.yearStartDisplay + " to " + /*p*/ ctx[82].note.yearEndDisplay + ")"))) {
				attr(button, "title", button_title_value);
			}

			if (dirty[0] & /*placements, filteredLanes, placements*/ 3072 | dirty[1] & /*isHighlighted*/ 16) {
				toggle_class(button, "highlight", /*isHighlighted*/ ctx[35](/*p*/ ctx[82].note));
			}

			if (dirty[0] & /*placements*/ 1024 && div1_style_value !== (div1_style_value = /*getNoteStyle*/ ctx[28](/*p*/ ctx[82]))) {
				attr(div1, "style", div1_style_value);
			}

			if (dirty[0] & /*placements*/ 1024 && div1_data_note_path_value !== (div1_data_note_path_value = /*p*/ ctx[82].note.path)) {
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

// (964:10) {#if threadLines && mainContentEl}
function create_if_block_2(ctx) {
	let svg;
	let svg_width_value;
	let svg_height_value;
	let each_value_2 = ensure_array_like(/*threadLines*/ ctx[13].to);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			svg = svg_element("svg");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(svg, "class", "thread-svg svelte-dyk7sv");
			attr(svg, "pointer-events", "none");
			attr(svg, "width", svg_width_value = /*mainContentEl*/ ctx[1].scrollWidth);
			attr(svg, "height", svg_height_value = /*mainContentEl*/ ctx[1].scrollHeight);
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
			if (dirty[0] & /*threadLines*/ 8192) {
				each_value_2 = ensure_array_like(/*threadLines*/ ctx[13].to);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(svg, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}

			if (dirty[0] & /*mainContentEl*/ 2 && svg_width_value !== (svg_width_value = /*mainContentEl*/ ctx[1].scrollWidth)) {
				attr(svg, "width", svg_width_value);
			}

			if (dirty[0] & /*mainContentEl*/ 2 && svg_height_value !== (svg_height_value = /*mainContentEl*/ ctx[1].scrollHeight)) {
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

// (966:14) {#each threadLines.to as t}
function create_each_block_2(ctx) {
	let line;
	let line_x__value;
	let line_y__value;
	let line_x__value_1;
	let line_y__value_1;

	return {
		c() {
			line = svg_element("line");
			attr(line, "x1", line_x__value = /*threadLines*/ ctx[13].from.x);
			attr(line, "y1", line_y__value = /*threadLines*/ ctx[13].from.y);
			attr(line, "x2", line_x__value_1 = /*t*/ ctx[79].x);
			attr(line, "y2", line_y__value_1 = /*t*/ ctx[79].y);
			attr(line, "class", "thread-line svelte-dyk7sv");
			attr(line, "stroke", "var(--text-accent)");
			attr(line, "stroke-width", "2.5");
			attr(line, "stroke-opacity", "0.9");
		},
		m(target, anchor) {
			insert(target, line, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*threadLines*/ 8192 && line_x__value !== (line_x__value = /*threadLines*/ ctx[13].from.x)) {
				attr(line, "x1", line_x__value);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_y__value !== (line_y__value = /*threadLines*/ ctx[13].from.y)) {
				attr(line, "y1", line_y__value);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_x__value_1 !== (line_x__value_1 = /*t*/ ctx[79].x)) {
				attr(line, "x2", line_x__value_1);
			}

			if (dirty[0] & /*threadLines*/ 8192 && line_y__value_1 !== (line_y__value_1 = /*t*/ ctx[79].y)) {
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

// (891:6) {#key resolution}
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
	let if_block0 = /*showLaneFilter*/ ctx[14] && create_if_block_3(ctx);
	let each_value_5 = ensure_array_like(/*timelineLabels*/ ctx[15]);
	let each_blocks_2 = [];

	for (let i = 0; i < each_value_5.length; i += 1) {
		each_blocks_2[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
	}

	let each_value_4 = ensure_array_like(/*filteredLanes*/ ctx[11]);
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_4.length; i += 1) {
		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	let each_value_3 = ensure_array_like(/*placements*/ ctx[10].placements);
	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	let if_block1 = /*threadLines*/ ctx[13] && /*mainContentEl*/ ctx[1] && create_if_block_2(ctx);

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
			set_style(div2, "grid-template-columns", "repeat(" + /*timelineSpan*/ ctx[16] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			attr(div3, "class", "timeline-header-row svelte-dyk7sv");
			set_style(div3, "grid-column", "2 / -1");
			set_style(div3, "grid-row", "1");
			attr(div4, "class", "region-labels svelte-dyk7sv");
			attr(div5, "class", "loom-grid svelte-dyk7sv");
			attr(div6, "class", "loom-inner-grid svelte-dyk7sv");
			set_style(div6, "grid-template-columns", "150px repeat(" + /*timelineSpan*/ ctx[16] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			set_style(div6, "grid-template-rows", "auto repeat(" + /*totalContentRows*/ ctx[25] + ", minmax(60px, 1fr))");
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
				dispose = listen(button, "click", /*click_handler_4*/ ctx[53]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*showLaneFilter*/ ctx[14]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					if_block0.m(div0, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*timelineLabels*/ 32768) {
				each_value_5 = ensure_array_like(/*timelineLabels*/ ctx[15]);
				let i;

				for (i = 0; i < each_value_5.length; i += 1) {
					const child_ctx = get_each_context_5(ctx, each_value_5, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(child_ctx, dirty);
					} else {
						each_blocks_2[i] = create_each_block_5(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(div2, null);
					}
				}

				for (; i < each_blocks_2.length; i += 1) {
					each_blocks_2[i].d(1);
				}

				each_blocks_2.length = each_value_5.length;
			}

			if (dirty[0] & /*timelineSpan, columnMinWidthPx*/ 196608) {
				set_style(div2, "grid-template-columns", "repeat(" + /*timelineSpan*/ ctx[16] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			}

			if (dirty[0] & /*regionStartRow, placements, filteredLanes*/ 2100224) {
				each_value_4 = ensure_array_like(/*filteredLanes*/ ctx[11]);
				let i;

				for (i = 0; i < each_value_4.length; i += 1) {
					const child_ctx = get_each_context_4(ctx, each_value_4, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_4(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div4, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_4.length;
			}

			if (dirty[0] & /*getNoteStyle, placements, filteredLanes, handleNoteClick*/ 1342180352 | dirty[1] & /*isHighlighted, handleMouseOver, handleMouseOut*/ 19) {
				each_value_3 = ensure_array_like(/*placements*/ ctx[10].placements);
				let i;

				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div5, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_3.length;
			}

			if (/*threadLines*/ ctx[13] && /*mainContentEl*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					if_block1.m(div6, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*timelineSpan, columnMinWidthPx*/ 196608) {
				set_style(div6, "grid-template-columns", "150px repeat(" + /*timelineSpan*/ ctx[16] + ", minmax(" + /*columnMinWidthPx*/ ctx[17] + "px, 1fr))");
			}

			if (dirty[0] & /*totalContentRows*/ 33554432) {
				set_style(div6, "grid-template-rows", "auto repeat(" + /*totalContentRows*/ ctx[25] + ", minmax(60px, 1fr))");
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

// (1071:4) {:else}
function create_else_block(ctx) {
	let each_1_anchor;
	let each_value_1 = ensure_array_like(/*eraBookmarksDate*/ ctx[18]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*eraBookmarksDate, settings*/ 262145 | dirty[1] & /*scrollToDate*/ 8) {
				each_value_1 = ensure_array_like(/*eraBookmarksDate*/ ctx[18]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (1060:4) {#if viewMode === 'years'}
function create_if_block(ctx) {
	let each_1_anchor;
	let each_value = ensure_array_like(/*eraBookmarksYear*/ ctx[19]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*eraBookmarksYear*/ 524288 | dirty[1] & /*scrollToYear*/ 4) {
				each_value = ensure_array_like(/*eraBookmarksYear*/ ctx[19]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (1072:6) {#each eraBookmarksDate as btn}
function create_each_block_1(ctx) {
	let button;
	let t0;
	let t1_value = format(/*btn*/ ctx[74].date, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + "";
	let t1;
	let t2;
	let t3_value = /*btn*/ ctx[74].label + "";
	let t3;
	let t4;
	let button_title_value;
	let mounted;
	let dispose;

	function click_handler_9() {
		return /*click_handler_9*/ ctx[66](/*btn*/ ctx[74]);
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
			attr(button, "title", button_title_value = "Scroll to " + format(/*btn*/ ctx[74].date, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd'));
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			append(button, t1);
			append(button, t2);
			append(button, t3);
			append(button, t4);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_9);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*eraBookmarksDate, settings*/ 262145 && t1_value !== (t1_value = format(/*btn*/ ctx[74].date, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd') + "")) set_data(t1, t1_value);
			if (dirty[0] & /*eraBookmarksDate*/ 262144 && t3_value !== (t3_value = /*btn*/ ctx[74].label + "")) set_data(t3, t3_value);

			if (dirty[0] & /*eraBookmarksDate, settings*/ 262145 && button_title_value !== (button_title_value = "Scroll to " + format(/*btn*/ ctx[74].date, /*settings*/ ctx[0].dateFormat || 'yyyy-MM-dd'))) {
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

// (1061:6) {#each eraBookmarksYear as btn}
function create_each_block(ctx) {
	let button;
	let t0;

	let t1_value = (/*btn*/ ctx[74].year < 0
	? /*btn*/ ctx[74].year
	: '+' + /*btn*/ ctx[74].year) + "";

	let t1;
	let t2;
	let t3_value = /*btn*/ ctx[74].label + "";
	let t3;
	let t4;
	let button_title_value;
	let mounted;
	let dispose;

	function click_handler_8() {
		return /*click_handler_8*/ ctx[65](/*btn*/ ctx[74]);
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

			attr(button, "title", button_title_value = "Scroll to " + (/*btn*/ ctx[74].year < 0
			? Math.abs(/*btn*/ ctx[74].year) + ' BCE'
			: /*btn*/ ctx[74].year + ' CE'));
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t0);
			append(button, t1);
			append(button, t2);
			append(button, t3);
			append(button, t4);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_8);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*eraBookmarksYear*/ 524288 && t1_value !== (t1_value = (/*btn*/ ctx[74].year < 0
			? /*btn*/ ctx[74].year
			: '+' + /*btn*/ ctx[74].year) + "")) set_data(t1, t1_value);

			if (dirty[0] & /*eraBookmarksYear*/ 524288 && t3_value !== (t3_value = /*btn*/ ctx[74].label + "")) set_data(t3, t3_value);

			if (dirty[0] & /*eraBookmarksYear*/ 524288 && button_title_value !== (button_title_value = "Scroll to " + (/*btn*/ ctx[74].year < 0
			? Math.abs(/*btn*/ ctx[74].year) + ' BCE'
			: /*btn*/ ctx[74].year + ' CE'))) {
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
	let div4;
	let div2;
	let div1;
	let div0;
	let t0;

	let t1_value = (/*viewMode*/ ctx[6] === 'years'
	? /*notes*/ ctx[3].length
	: /*dateNotes*/ ctx[4].length) + "";

	let t1;
	let t2;
	let t3;
	let t4;
	let t5;
	let div3;

	function select_block_type(ctx, dirty) {
		if (/*viewMode*/ ctx[6] === 'years') return create_if_block_7;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);

	function select_block_type_1(ctx, dirty) {
		if (/*viewMode*/ ctx[6] === 'years') return create_if_block_1;
		if (/*viewMode*/ ctx[6] === 'dates') return create_if_block_4;
	}

	let current_block_type_1 = select_block_type_1(ctx);
	let if_block1 = current_block_type_1 && current_block_type_1(ctx);

	function select_block_type_2(ctx, dirty) {
		if (/*viewMode*/ ctx[6] === 'years') return create_if_block;
		return create_else_block;
	}

	let current_block_type_2 = select_block_type_2(ctx);
	let if_block2 = current_block_type_2(ctx);

	return {
		c() {
			div4 = element("div");
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			t0 = text("Woven ");
			t1 = text(t1_value);
			t2 = text(" notes");
			t3 = space();
			if_block0.c();
			t4 = space();
			if (if_block1) if_block1.c();
			t5 = space();
			div3 = element("div");
			if_block2.c();
			attr(div0, "class", "note-counter svelte-dyk7sv");
			attr(div1, "class", "loom-controls svelte-dyk7sv");
			attr(div2, "class", "loom-top-bar svelte-dyk7sv");
			attr(div3, "class", "era-snap-rail svelte-dyk7sv");
			attr(div4, "class", "loom-view svelte-dyk7sv");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div2);
			append(div2, div1);
			append(div1, div0);
			append(div0, t0);
			append(div0, t1);
			append(div0, t2);
			append(div1, t3);
			if_block0.m(div1, null);
			append(div4, t4);
			if (if_block1) if_block1.m(div4, null);
			append(div4, t5);
			append(div4, div3);
			if_block2.m(div3, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*viewMode, notes, dateNotes*/ 88 && t1_value !== (t1_value = (/*viewMode*/ ctx[6] === 'years'
			? /*notes*/ ctx[3].length
			: /*dateNotes*/ ctx[4].length) + "")) set_data(t1, t1_value);

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div1, null);
				}
			}

			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type_1 && current_block_type_1(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div4, t5);
				}
			}

			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type_2(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(div3, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div4);
			}

			if_block0.d();

			if (if_block1) {
				if_block1.d();
			}

			if_block2.d();
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
	let datePlacements;
	let dateRegionStartRow;
	let totalDateContentRows;
	let dateTimelineSpan;
	let dateTimelineLabels;
	let sortedYears;
	let connectionValuesMap;
	let eraBookmarksParsed;
	let eraBookmarksYear;
	let eraBookmarksDate;
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
	let dateNotes = [];
	let lanes = [];
	let yearRange = { min: 0, max: 0 };
	let dateRange = { min: new Date(), max: new Date() };
	let hoveredConnectionValues = [];
	let hoveredNotePath = null; /* source note for Entity Glow / Thread */
	let hasScrolledInitial = false;
	let threadLines = null;
	let isFictionalCalendar = false; // Track if we're using fictional dates (non-numeric strings)
	let viewMode = 'years';
	let dateResolution = 'Month';

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

		/**
 * Takes an array of notes (year or date based) and returns a sorted list of lanes.
 */
		function discoverLanes(notes) {
			const allLaneValuesSet = new Set();

			notes.forEach(n => {
				n.lanes.forEach(l => allLaneValuesSet.add(l));
			});

			const allLaneValues = Array.from(allLaneValuesSet);
			const userOrder = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);
			const orderedLanes = userOrder.filter(l => allLaneValues.indexOf(l) !== -1);
			const unorderedLanes = allLaneValues.filter(l => userOrder.indexOf(l) === -1).sort();
			let finalLanes = [...orderedLanes, ...unorderedLanes];

			if (settings.showUncategorized) {
				const userOrderSet = new Set(userOrder);
				const hasUncategorized = notes.some(n => n.lanes.length > 0 && n.lanes.some(l => !userOrderSet.has(l)));

				if (hasUncategorized || notes.some(n => n.lanes.length === 0)) {
					finalLanes.push('Others');
				}
			}

			return finalLanes;
		}

		const processNotes = () => {
			var _a, _b, _c, _d;
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

					// If only one filter type is present, it's an AND (or effectively, just that filter)
					return folderMatch && tagMatch;
				}
			});

			// --- View Mode Auto-Detection ---
			// Find the first file with a date to determine the mode
			const firstFileWithDate = files.find(file => {
				const cache = app.metadataCache.getFileCache(file);

				return (cache === null || cache === void 0
				? void 0
				: cache.frontmatter) && cache.frontmatter[settings.startDateKey];
			});

			let detectedViewMode = 'years';

			if (firstFileWithDate) {
				const firstValue = (_b = (_a = app.metadataCache.getFileCache(firstFileWithDate)) === null || _a === void 0
				? void 0
				: _a.frontmatter) === null || _b === void 0
				? void 0
				: _b[settings.startDateKey];

				if (typeof firstValue === 'string') {
					const trimmed = firstValue.trim();

					// A value is a date if it is NOT a simple integer, but CAN be parsed as a valid date by our enhanced parser.
					if (!(/^-?\d+$/).test(trimmed) && parseDate(trimmed)) {
						detectedViewMode = 'dates';
					}
				}
			}

			$$invalidate(6, viewMode = detectedViewMode);

			if (viewMode === 'years') {
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

						const endDateValue = (_c = frontmatter[settings.endDateKey]) !== null && _c !== void 0
						? _c
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
				$$invalidate(3, notes = loomNotes);
				$$invalidate(5, lanes = discoverLanes(notes));
				$$invalidate(38, yearRange = { min: minYear, max: maxYear });
			} else {
				// --- DATES MODE ---
				const loomDateNotes = [];

				let minDate = null;
				let maxDate = null;
				const connKeys = settings.connectionKeys.split(',').map(s => s.trim()).filter(Boolean);

				for (const file of files) {
					const cache = app.metadataCache.getFileCache(file);

					const frontmatter = cache === null || cache === void 0
					? void 0
					: cache.frontmatter;

					if (frontmatter) {
						const startDateValue = frontmatter[settings.startDateKey];

						const endDateValue = (_d = frontmatter[settings.endDateKey]) !== null && _d !== void 0
						? _d
						: startDateValue;

						const parsedStart = parseDate(startDateValue);
						const parsedEnd = parseDate(endDateValue);

						if (parsedStart && parsedEnd) {
							if (!minDate || parsedStart < minDate) minDate = parsedStart;
							if (!maxDate || parsedEnd > maxDate) maxDate = parsedEnd;
							const laneValue = frontmatter[settings.laneKey];

							const laneArray = Array.isArray(laneValue)
							? laneValue.map(String)
							: laneValue ? [String(laneValue)] : [];

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
								dateStart: parsedStart,
								dateEnd: parsedEnd,
								connectionValues,
								noteStyle: frontmatter['note-style'] || 'event'
							};

							loomDateNotes.push(note);
						}
					}
				}

				$$invalidate(4, dateNotes = loomDateNotes);
				$$invalidate(5, lanes = discoverLanes(dateNotes));
				const finalMinDate = minDate ? startOfDay(minDate) : startOfDay(new Date());
				const finalMaxDate = maxDate ? startOfDay(maxDate) : startOfDay(new Date());
				$$invalidate(39, dateRange = { min: finalMinDate, max: finalMaxDate });

				// Clear year-based data
				$$invalidate(3, notes = []);

				$$invalidate(38, yearRange = { min: 0, max: 0 });
			}
		};

		// Wait for the metadata cache to be resolved before processing notes
		app.metadataCache.on('resolved', processNotes);

		// Initial run
		processNotes();

		// Deferred re-run: metadata cache may not be fully populated on plugin reload.
		// Running again after a tick + delay catches late resolution and fixes "all notes at Jan 1" on first load.
		tick().then(() => {
			setTimeout(processNotes, 150);
		});
	}));

	/** Parses a date string or Date into a Date object, using user-defined format or common fallbacks. */
	function parseDate(value) {
		if (!value) return null;

		// Handle Date objects (e.g. from YAML parsing)
		if (value instanceof Date && isValid(value)) return startOfDay(value);

		const str = String(value).trim();
		if (!str) return null;
		let parsedDate;

		// 1. Try user-defined format from settings
		if (settings.dateFormat && settings.dateFormat !== 'auto') {
			parsedDate = parse(str, settings.dateFormat, new Date());
			if (isValid(parsedDate)) return startOfDay(parsedDate);
		}

		// 2. Try ISO 8601 (yyyy-MM-dd)
		parsedDate = parseISO(str);

		if (isValid(parsedDate)) return startOfDay(parsedDate);

		// 3. Fallback to common formats (dash and slash variants)
		const formats = ['dd-MM-yyyy', 'MM-dd-yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy'];

		for (const fmt of formats) {
			parsedDate = parse(str, fmt, new Date());
			if (isValid(parsedDate)) return startOfDay(parsedDate);
		}

		return null;
	}

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

	function getDateNoteColumnRange(note) {
		let startCol;
		let endCol;

		if (dateResolution === 'Day') {
			const rangeMin = startOfDay(dateRange.min);
			startCol = differenceInCalendarDays(startOfDay(note.dateStart), rangeMin);
			endCol = differenceInCalendarDays(startOfDay(note.dateEnd), rangeMin);
		} else if (dateResolution === 'Week') {
			const rangeMinStartOfWeek = startOfWeek(dateRange.min, { weekStartsOn: 1 });
			startCol = differenceInWeeks(startOfWeek(note.dateStart, { weekStartsOn: 1 }), rangeMinStartOfWeek);
			endCol = differenceInWeeks(startOfWeek(note.dateEnd, { weekStartsOn: 1 }), rangeMinStartOfWeek);
		} else {
			// Month
			// Ensure dateRange.min is the start of its month for consistent calculation
			const rangeMinStartOfMonth = startOfMonth(dateRange.min);

			startCol = differenceInMonths(note.dateStart, rangeMinStartOfMonth);
			endCol = differenceInMonths(note.dateEnd, rangeMinStartOfMonth);
		}

		return { startCol, endCol };
	}

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
				$$invalidate(1, mainContentEl.scrollLeft = centered > 0 ? centered : 0, mainContentEl);
			}
		});
	}

	/** Century view only: scroll to the end of the timeline. Called after Century grid has re-mounted. */
	function scrollToCenturyEnd() {
		if (!mainContentEl) return;

		tick().then(() => {
			if (mainContentEl) {
				const maxScroll = mainContentEl.scrollWidth - mainContentEl.clientWidth;
				$$invalidate(1, mainContentEl.scrollLeft = maxScroll, mainContentEl);
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

	function getDateNoteStyle(p) {
		const { startCol, endCol, regionIndex, subLane } = p;
		const gridRow = dateRegionStartRow[regionIndex] + subLane;
		const gridColumnStart = startCol + 2;
		const gridColumnEnd = endCol + 3;

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
		$$invalidate(40, hoveredConnectionValues = connectionValues);
		$$invalidate(41, hoveredNotePath = sourcePath);
	}

	function handleMouseOut() {
		$$invalidate(40, hoveredConnectionValues = []);
		$$invalidate(41, hoveredNotePath = null);
		$$invalidate(13, threadLines = null);
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

	/** Era-Snap (date mode): scroll so the given date is visible. */
	function scrollToDate(targetDate) {
		if (!mainContentEl || viewMode !== 'dates') return;
		let columnIndex;

		if (dateResolution === 'Day') {
			const rangeMin = startOfDay(dateRange.min);
			columnIndex = differenceInCalendarDays(startOfDay(targetDate), rangeMin);
		} else if (dateResolution === 'Week') {
			const rangeMinStartOfWeek = startOfWeek(dateRange.min, { weekStartsOn: 1 });
			columnIndex = differenceInWeeks(startOfWeek(targetDate, { weekStartsOn: 1 }), rangeMinStartOfWeek);
		} else {
			const rangeMinStartOfMonth = startOfMonth(dateRange.min);
			columnIndex = differenceInMonths(targetDate, rangeMinStartOfMonth);
		}

		const targetX = Math.max(0, columnIndex * columnMinWidthPx);
		const centered = targetX - mainContentEl.clientWidth / 2 + columnMinWidthPx / 2;

		mainContentEl.scrollTo({
			left: Math.max(0, centered),
			behavior: 'smooth'
		});
	}

	function isHighlighted(note) {
		if (hoveredConnectionValues.length === 0) return false;
		const noteValues = connectionValuesMap.get(note.path) || [];
		const hoveredSet = new Set(hoveredConnectionValues);
		return noteValues.some(v => hoveredSet.has(v));
	}

	const click_handler = zoomLevel => {
		$$invalidate(2, resolution = zoomLevel);

		if (zoomLevel >= 100) {
			tick().then(() => scrollToCenturyEnd());
		} else {
			scrollToDecadeOrYear();
		}
	};

	const click_handler_1 = () => $$invalidate(7, dateResolution = 'Month');
	const click_handler_2 = () => $$invalidate(7, dateResolution = 'Week');
	const click_handler_3 = () => $$invalidate(7, dateResolution = 'Day');

	const click_handler_4 = () => {
		$$invalidate(14, showLaneFilter = !showLaneFilter);
	};

	const change_handler = (lane, e) => {
		if (e.currentTarget.checked) {
			$$invalidate(8, visibleLanes = new Set([...visibleLanes, lane]));
		} else {
			const newSet = new Set(visibleLanes);
			newSet.delete(lane);
			$$invalidate(8, visibleLanes = newSet);
		}
	};

	const click_handler_5 = p => handleNoteClick(p.note.path);
	const mouseenter_handler = p => handleMouseOver(p.note, p.note.path);
	const focus_handler = p => handleMouseOver(p.note, p.note.path);

	function div_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			mainContentEl = $$value;
			$$invalidate(1, mainContentEl);
		});
	}

	const click_handler_6 = () => {
		$$invalidate(14, showLaneFilter = !showLaneFilter);
	};

	const change_handler_1 = (lane, e) => {
		if (e.currentTarget.checked) {
			$$invalidate(8, visibleLanes = new Set([...visibleLanes, lane]));
		} else {
			const newSet = new Set(visibleLanes);
			newSet.delete(lane);
			$$invalidate(8, visibleLanes = newSet);
		}
	};

	const click_handler_7 = p => handleNoteClick(p.note.path);
	const mouseenter_handler_1 = p => handleMouseOver(p.note, p.note.path);
	const focus_handler_1 = p => handleMouseOver(p.note, p.note.path);

	function div_binding_1($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			mainContentEl = $$value;
			$$invalidate(1, mainContentEl);
		});
	}

	const click_handler_8 = btn => scrollToYear(btn.year);
	const click_handler_9 = btn => scrollToDate(btn.date);

	$$self.$$set = $$props => {
		if ('app' in $$props) $$invalidate(36, app = $$props.app);
		if ('settings' in $$props) $$invalidate(0, settings = $$props.settings);
		if ('saveVisibleLanes' in $$props) $$invalidate(37, saveVisibleLanes = $$props.saveVisibleLanes);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*settings*/ 1) {
			// Parse zoom levels from settings
			$$invalidate(12, zoomLevels = (() => {
				try {
					return settings.zoomLevels.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
				} catch(_a) {
					return [1, 10, 100]; // Fallback to defaults
				}
			})());
		}

		if ($$self.$$.dirty[0] & /*zoomLevels, resolution*/ 4100) {
			// Ensure current resolution is valid when zoomLevels change
			if (zoomLevels.length > 0 && zoomLevels.indexOf(resolution) === -1) {
				$$invalidate(2, resolution = zoomLevels[0]); // Reset to first available zoom level
			}
		}

		if ($$self.$$.dirty[0] & /*lanes, visibleLanes, settings*/ 289) {
			if (lanes.length > 0 && visibleLanes.size === 0) {
				// Initialize from saved settings or show all lanes
				if (settings.visibleLanes && settings.visibleLanes.length > 0) {
					const filtered = settings.visibleLanes.filter(lane => lanes.indexOf(lane) !== -1);

					// If none of the saved lanes exist in current view, show all lanes instead
					if (filtered.length > 0) {
						$$invalidate(8, visibleLanes = new Set(filtered));
						$$invalidate(43, lastSavedLanes = filtered);
					} else {
						$$invalidate(8, visibleLanes = new Set(lanes));
						$$invalidate(43, lastSavedLanes = [...lanes]);
					}
				} else {
					$$invalidate(8, visibleLanes = new Set(lanes));
					$$invalidate(43, lastSavedLanes = [...lanes]);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*visibleLanes*/ 256 | $$self.$$.dirty[1] & /*lastSavedLanes, saveVisibleLanes*/ 4160) {
			// Save visible lanes to settings when they change
			if (visibleLanes.size > 0) {
				const visibleLanesArray = Array.from(visibleLanes).sort();
				const lastSaved = lastSavedLanes.slice().sort();

				if (JSON.stringify(visibleLanesArray) !== JSON.stringify(lastSaved)) {
					$$invalidate(43, lastSavedLanes = visibleLanesArray);
					saveVisibleLanes(visibleLanesArray);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*lanes, visibleLanes*/ 288) {
			$$invalidate(11, filteredLanes = lanes.filter(lane => visibleLanes.has(lane)));
		}

		if ($$self.$$.dirty[0] & /*settings*/ 1) {
			// Memoize userOrderArray to avoid parsing on every placements recalculation
			$$invalidate(48, userOrderArray = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean));
		}

		if ($$self.$$.dirty[1] & /*userOrderArray*/ 131072) {
			$$invalidate(47, userOrderSet = new Set(userOrderArray));
		}

		if ($$self.$$.dirty[0] & /*viewMode, resolution, filteredLanes, notes*/ 2124 | $$self.$$.dirty[1] & /*userOrderSet*/ 65536) {
			$$invalidate(10, placements = (() => {
				if (viewMode !== 'years') return { placements: [], regionLaneCounts: [] };
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

		if ($$self.$$.dirty[0] & /*filteredLanes, placements*/ 3072) {
			$$invalidate(21, regionStartRow = (() => {
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

		if ($$self.$$.dirty[0] & /*placements*/ 1024) {
			$$invalidate(25, totalContentRows = placements.regionLaneCounts.reduce((a, b) => a + b, 0) || 1);
		}

		if ($$self.$$.dirty[0] & /*viewMode, dateResolution, filteredLanes, dateNotes*/ 2256 | $$self.$$.dirty[1] & /*dateRange, userOrderSet*/ 65792) {
			// --- Date Mode Computations ---
			$$invalidate(9, datePlacements = (() => {
				if (viewMode !== 'dates') return { placements: [], regionLaneCounts: [] };
				const list = [];
				const regionLaneCounts = [];

				for (let filteredIndex = 0; filteredIndex < filteredLanes.length; filteredIndex++) {
					const lane = filteredLanes[filteredIndex];

					const laneNotes = dateNotes.filter(n => {
						if (lane === 'Others') {
							return n.lanes.length === 0 || n.lanes.some(l => !userOrderSet.has(l));
						} else {
							return n.lanes.indexOf(lane) !== -1;
						}
					}).map(n => {
						const { startCol, endCol } = getDateNoteColumnRange(n);
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

		if ($$self.$$.dirty[0] & /*filteredLanes, datePlacements*/ 2560) {
			$$invalidate(20, dateRegionStartRow = (() => {
				var _a;
				const start = [];
				let row = 2; // row 1 = timeline

				for (let i = 0; i < filteredLanes.length; i++) {
					start.push(row);

					row += (_a = datePlacements.regionLaneCounts[i]) !== null && _a !== void 0
					? _a
					: 1;
				}

				return start;
			})());
		}

		if ($$self.$$.dirty[0] & /*datePlacements*/ 512) {
			$$invalidate(24, totalDateContentRows = datePlacements.regionLaneCounts.reduce((a, b) => a + b, 0) || 1);
		}

		if ($$self.$$.dirty[0] & /*viewMode, dateNotes, dateResolution*/ 208 | $$self.$$.dirty[1] & /*dateRange*/ 256) {
			$$invalidate(23, dateTimelineSpan = (() => {
				if (viewMode !== 'dates' || !dateNotes.length) return 1;

				if (dateResolution === 'Day') {
					return differenceInCalendarDays(dateRange.max, dateRange.min) + 1;
				} else if (dateResolution === 'Week') {
					const rangeMinStart = startOfWeek(dateRange.min, { weekStartsOn: 1 });
					const rangeMaxStart = startOfWeek(dateRange.max, { weekStartsOn: 1 });
					return differenceInWeeks(rangeMaxStart, rangeMinStart) + 1;
				} else {
					// Month
					return differenceInMonths(dateRange.max, dateRange.min) + 1;
				}
			})());
		}

		if ($$self.$$.dirty[0] & /*viewMode, dateNotes, dateResolution*/ 208 | $$self.$$.dirty[1] & /*dateRange*/ 256) {
			$$invalidate(22, dateTimelineLabels = (() => {
				if (viewMode !== 'dates' || !dateNotes.length) return [];

				if (dateResolution === 'Day') {
					const labels = [];
					let currentDate = startOfDay(dateRange.min);
					const rangeMax = startOfDay(dateRange.max);

					while (currentDate <= rangeMax) {
						labels.push({
							date: currentDate,
							display: format(currentDate, 'MMM d')
						});

						currentDate = addDays(currentDate, 1);
					}

					return labels;
				} else if (dateResolution === 'Week') {
					const weeks = eachWeekOfInterval({ start: dateRange.min, end: dateRange.max }, { weekStartsOn: 1 });

					return weeks.map(week => ({
						date: week,
						display: `${format(startOfWeek(week, { weekStartsOn: 1 }), 'MMM d')}-${format(endOfWeek(week, { weekStartsOn: 1 }), 'MMM d')}`
					}));
				} else {
					// Month
					const months = eachMonthOfInterval({ start: dateRange.min, end: dateRange.max });

					return months.map(month => ({
						date: month,
						display: format(month, 'MMM yyyy')
					}));
				}
			})());
		}

		if ($$self.$$.dirty[0] & /*mainContentEl, notes, dateNotes, viewMode, resolution*/ 94 | $$self.$$.dirty[1] & /*hasScrolledInitial*/ 2048) {
			/** One-time scroll when view opens with data (avoids reactive loop). */
			if (mainContentEl && (notes.length > 0 || dateNotes.length > 0) && !hasScrolledInitial) {
				$$invalidate(42, hasScrolledInitial = true);

				tick().then(() => {
					if (viewMode === 'years') {
						if (resolution >= 100) scrollToCenturyEnd(); else scrollToDecadeOrYear();
					}
				}); // No initial scroll for date view for now
			}
		}

		if ($$self.$$.dirty[0] & /*notes*/ 8) {
			// Memoize sorted years to avoid sorting on every scroll call
			sortedYears = notes.length > 0
			? notes.map(n => n.yearStart).sort((a, b) => a - b)
			: [];
		}

		if ($$self.$$.dirty[0] & /*viewMode, notes, dateNotes*/ 88) {
			// Pre-build connection values map for efficient lookup
			$$invalidate(45, connectionValuesMap = (() => {
				const map = new Map();
				const notesToProcess = viewMode === 'years' ? notes : dateNotes;

				notesToProcess.forEach(note => {
					map.set(note.path, getConnectionValues(note));
				});

				return map;
			})());
		}

		if ($$self.$$.dirty[0] & /*placements, datePlacements, mainContentEl*/ 1538 | $$self.$$.dirty[1] & /*elementMap*/ 8192) {
			if ((placements.placements.length > 0 || datePlacements.placements.length > 0) && mainContentEl) {
				tick().then(() => {
					requestAnimationFrame(() => {
						if (!mainContentEl) return;
						const wrappers = mainContentEl.querySelectorAll('[data-note-path]');
						$$invalidate(44, elementMap = new Map());

						wrappers.forEach(w => {
							const path = w.getAttribute('data-note-path');
							if (path) elementMap.set(path, w);
						});
					});
				});
			}
		}

		if ($$self.$$.dirty[0] & /*mainContentEl, viewMode, notes, dateNotes*/ 90 | $$self.$$.dirty[1] & /*hoveredConnectionValues, hoveredNotePath, connectionValuesMap, elementMap*/ 26112) {
			/** Update thread lines from hovered note to highlighted contemporaries (Entity Glow bonus). */
			/** Use data (notes + hoveredConnectionValues) to decide which notes are highlighted; find DOM by data-note-path so we don't rely on .highlight class timing. */
			if (hoveredConnectionValues.length > 0 && hoveredNotePath && mainContentEl) {
				const currentHoveredPath = hoveredNotePath;
				const hoveredSet = new Set(hoveredConnectionValues);
				const notesToProcess = viewMode === 'years' ? notes : dateNotes;

				const highlightedPaths = notesToProcess.filter(n => {
					const noteValues = connectionValuesMap.get(n.path) || [];
					return noteValues.some(v => hoveredSet.has(v));
				}).map(n => n.path);

				const otherPaths = highlightedPaths.filter(p => p !== currentHoveredPath);

				tick().then(() => {
					requestAnimationFrame(() => {
						if (!mainContentEl || !currentHoveredPath || otherPaths.length === 0) {
							$$invalidate(13, threadLines = null);
							return;
						}

						const sourceEl = elementMap.get(currentHoveredPath);

						if (!sourceEl) {
							$$invalidate(13, threadLines = null);
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

						$$invalidate(13, threadLines = to.length > 0 ? { from, to } : null);
					});
				});
			} else if (!hoveredConnectionValues.length) {
				$$invalidate(13, threadLines = null);
			}
		}

		if ($$self.$$.dirty[0] & /*settings*/ 1) {
			$$invalidate(46, eraBookmarksParsed = (() => {
				const yearBms = [];
				const dateBms = [];
				const lines = settings.eraBookmarks.split('\n');

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed) continue;
					const match = trimmed.match(/^(.+?):\s*(.+)$/);
					if (!match) continue;
					const label = match[1].trim();
					const value = match[2].trim();

					if ((/^-?\d+$/).test(value)) {
						const year = parseInt(value, 10);
						if (!isNaN(year)) yearBms.push({ type: 'year', label, year });
					} else {
						const d = parseDate(value);
						if (d) dateBms.push({ type: 'date', label, date: d });
					}
				}

				return { year: yearBms, date: dateBms };
			})());
		}

		if ($$self.$$.dirty[1] & /*eraBookmarksParsed*/ 32768) {
			$$invalidate(19, eraBookmarksYear = eraBookmarksParsed.year);
		}

		if ($$self.$$.dirty[1] & /*eraBookmarksParsed*/ 32768) {
			$$invalidate(18, eraBookmarksDate = eraBookmarksParsed.date);
		}

		if ($$self.$$.dirty[0] & /*resolution*/ 4) {
			$$invalidate(17, columnMinWidthPx = resolution >= 100 ? 140 : 80); /* wider columns in Century+ so note titles are readable */
		}

		if ($$self.$$.dirty[0] & /*resolution*/ 4 | $$self.$$.dirty[1] & /*yearRange*/ 128) {
			$$invalidate(16, timelineSpan = (() => {
				if (yearRange.max === -Infinity) return 1;
				const resValue = resolution;
				const start = Math.floor(yearRange.min / resValue);
				const end = Math.ceil(yearRange.max / resValue); // include next period so notes near boundary aren't cut off (e.g. 2099 -> show 2100)
				return end - start + 1;
			})());
		}

		if ($$self.$$.dirty[0] & /*resolution*/ 4 | $$self.$$.dirty[1] & /*yearRange*/ 128) {
			$$invalidate(15, timelineLabels = (() => {
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
		settings,
		mainContentEl,
		resolution,
		notes,
		dateNotes,
		lanes,
		viewMode,
		dateResolution,
		visibleLanes,
		datePlacements,
		placements,
		filteredLanes,
		zoomLevels,
		threadLines,
		showLaneFilter,
		timelineLabels,
		timelineSpan,
		columnMinWidthPx,
		eraBookmarksDate,
		eraBookmarksYear,
		dateRegionStartRow,
		regionStartRow,
		dateTimelineLabels,
		dateTimelineSpan,
		totalDateContentRows,
		totalContentRows,
		scrollToDecadeOrYear,
		scrollToCenturyEnd,
		getNoteStyle,
		getDateNoteStyle,
		handleNoteClick,
		handleMouseOver,
		handleMouseOut,
		scrollToYear,
		scrollToDate,
		isHighlighted,
		app,
		saveVisibleLanes,
		yearRange,
		dateRange,
		hoveredConnectionValues,
		hoveredNotePath,
		hasScrolledInitial,
		lastSavedLanes,
		elementMap,
		connectionValuesMap,
		eraBookmarksParsed,
		userOrderSet,
		userOrderArray,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		change_handler,
		click_handler_5,
		mouseenter_handler,
		focus_handler,
		div_binding,
		click_handler_6,
		change_handler_1,
		click_handler_7,
		mouseenter_handler_1,
		focus_handler_1,
		div_binding_1,
		click_handler_8,
		click_handler_9
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
				app: 36,
				settings: 0,
				saveVisibleLanes: 37
			},
			null,
			[-1, -1, -1, -1]
		);
	}
};

const LOOM_VIEW_TYPE = 'loom-view';
const DEFAULT_SETTINGS = {
    startDateKey: 'year-start',
    endDateKey: 'year-end',
    dateFormat: 'yyyy-MM-dd',
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
            .setName('Date Format')
            .setDesc('Specify the format for parsing dates (e.g., "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy"). Uses date-fns format tokens.')
            .addText(text => text
            .setPlaceholder('yyyy-MM-dd')
            .setValue(this.plugin.settings.dateFormat)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.dateFormat = value;
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
            .setDesc('Bookmarks for quick navigation (one per line). Year mode: "Label: Year" (e.g. Bronze: -3000). Date mode: "Label: Date" (e.g. Week 1: 2026-01-01). Uses Date Format setting for parsing dates.')
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2RvbS5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvbGlmZWN5Y2xlLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9zY2hlZHVsZXIuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3RyYW5zaXRpb25zLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9lYWNoLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9Db21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9zaGFyZWQvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvZGlzY2xvc2UtdmVyc2lvbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vdG9EYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9hZGREYXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9hZGRNaWxsaXNlY29uZHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZGVmYXVsdE9wdGlvbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3N0YXJ0T2ZXZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3N0YXJ0T2ZEYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2RpZmZlcmVuY2VJbkNhbGVuZGFyRGF5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vYWRkV2Vla3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2NvbXBhcmVBc2MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2NvbnN0YW50cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vaXNEYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9pc1ZhbGlkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9kaWZmZXJlbmNlSW5DYWxlbmRhck1vbnRocy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vZGlmZmVyZW5jZUluRGF5cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9yb3VuZGluZ01ldGhvZHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2VuZE9mRGF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9lbmRPZk1vbnRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9pc0xhc3REYXlPZk1vbnRoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9kaWZmZXJlbmNlSW5Nb250aHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2RpZmZlcmVuY2VJbldlZWtzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9lYWNoTW9udGhPZkludGVydmFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9lYWNoV2Vla09mSW50ZXJ2YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3N0YXJ0T2ZNb250aC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vZW5kT2ZXZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9zdWJNaWxsaXNlY29uZHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZ2V0VVRDRGF5T2ZZZWFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENJU09XZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ0lTT1dlZWtZZWFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENJU09XZWVrWWVhci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9nZXRVVENJU09XZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENXZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ1dlZWtZZWFyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENXZWVrWWVhci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9nZXRVVENXZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2FkZExlYWRpbmdaZXJvcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9mb3JtYXQvbGlnaHRGb3JtYXR0ZXJzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2Zvcm1hdC9mb3JtYXR0ZXJzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2Zvcm1hdC9sb25nRm9ybWF0dGVycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9wcm90ZWN0ZWRUb2tlbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9fbGliL2Zvcm1hdERpc3RhbmNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9sb2NhbGUvX2xpYi9idWlsZEZvcm1hdExvbmdGbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvZm9ybWF0TG9uZy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvZm9ybWF0UmVsYXRpdmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9fbGliL2J1aWxkTG9jYWxpemVGbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvbG9jYWxpemUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9fbGliL2J1aWxkTWF0Y2hGbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRNYXRjaFBhdHRlcm5Gbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvbWF0Y2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vZm9ybWF0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2Fzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9hcnJheUxpa2VUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vYXNzZXJ0VGhpc0luaXRpYWxpemVkLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2luaGVyaXRzLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2NyZWF0ZVN1cGVyLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2NsYXNzQ2FsbENoZWNrLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3RvUHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3RvUHJvcGVydHlLZXkuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vY3JlYXRlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vZGVmaW5lUHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvU2V0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL1BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0VyYVBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9jb25zdGFudHMuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9ZZWFyUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvTG9jYWxXZWVrWWVhclBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0lTT1dlZWtZZWFyUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvRXh0ZW5kZWRZZWFyUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvUXVhcnRlclBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL1N0YW5kQWxvbmVRdWFydGVyUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvTW9udGhQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9TdGFuZEFsb25lTW9udGhQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc2V0VVRDV2Vlay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0xvY2FsV2Vla1BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9zZXRVVENJU09XZWVrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvSVNPV2Vla1BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0RhdGVQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9EYXlPZlllYXJQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc2V0VVRDRGF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvRGF5UGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvTG9jYWxEYXlQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9TdGFuZEFsb25lTG9jYWxEYXlQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc2V0VVRDSVNPRGF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvSVNPRGF5UGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvQU1QTVBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0FNUE1NaWRuaWdodFBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0RheVBlcmlvZFBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0hvdXIxdG8xMlBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0hvdXIwdG8yM1BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0hvdXIwVG8xMVBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0hvdXIxVG8yNFBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL01pbnV0ZVBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL1NlY29uZFBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vcGFyc2UvX2xpYi9wYXJzZXJzL0ZyYWN0aW9uT2ZTZWNvbmRQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9JU09UaW1lem9uZVdpdGhaUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvSVNPVGltZXpvbmVQYXJzZXIuanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL19saWIvcGFyc2Vycy9UaW1lc3RhbXBTZWNvbmRzUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvVGltZXN0YW1wTWlsbGlzZWNvbmRzUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZS9fbGliL3BhcnNlcnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3BhcnNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9wYXJzZUlTTy9pbmRleC5qcyIsInNyYy9Mb29tVmlldy5zdmVsdGUiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6WyJNSUxMSVNFQ09ORFNfSU5fREFZIiwiTUlMTElTRUNPTkRTX0lOX1dFRUsiLCJmb3JtYXR0ZXJzIiwibGlnaHRGb3JtYXR0ZXJzIiwiZm9ybWF0dGluZ1Rva2Vuc1JlZ0V4cCIsImxvbmdGb3JtYXR0aW5nVG9rZW5zUmVnRXhwIiwiZXNjYXBlZFN0cmluZ1JlZ0V4cCIsImRvdWJsZVF1b3RlUmVnRXhwIiwidW5lc2NhcGVkTGF0aW5DaGFyYWN0ZXJSZWdFeHAiLCJsb2NhbGUiLCJkZWZhdWx0TG9jYWxlIiwiY2xlYW5Fc2NhcGVkU3RyaW5nIiwiYXJyYXlMaWtlVG9BcnJheSIsInVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5Iiwic2V0UHJvdG90eXBlT2YiLCJhc3NlcnRUaGlzSW5pdGlhbGl6ZWQiLCJpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QiLCJnZXRQcm90b3R5cGVPZiIsInBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4iLCJpc0xlYXBZZWFySW5kZXgiLCJJdGVtVmlldyIsIkxvb21WaWV3Q29tcG9uZW50IiwiUGx1Z2luIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0dBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNo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LE9BQU8sS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzNELEVBQUUsQ0FBQztBQUNILENBQUM7O0FBRUQsSUFBSSxxQkFBcUIsR0FBRyxPQUFPO0FBQzVCLFNBQVMsaUJBQWlCLENBQUMsTUFBTSxFQUFFO0FBQzFDLEVBQUUsT0FBTyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztBQUMxRTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxTQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQUU7QUFDNUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUM1QixFQUFFLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztBQUNoQyxFQUFFLE9BQU8sSUFBSTtBQUNiOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxTQUFTLFVBQVUsQ0FBQyxTQUFTLEVBQUU7QUFDOUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQztBQUM1QixFQUFFLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDOUIsRUFBRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzdCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENB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QUFxQixHQUFHLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxLQUFLLE1BQU0sR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixNQUFNLElBQUksSUFBSSxxQkFBcUIsS0FBSyxNQUFNLEdBQUcscUJBQXFCLEdBQUcsT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxlQUFlLEtBQUssTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLHFCQUFxQixHQUFHLGVBQWUsQ0FBQyxPQUFPLE1BQU0sSUFBSSxJQUFJLHFCQUFxQixLQUFLLE1BQU0sR0FBRyxNQUFNLEdBQUcscUJBQXFCLENBQUMscUJBQXFCLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxNQUFNLEdBQUcsS0FBSyxHQUFHLGNBQWMsQ0FBQyxxQkFBcUIsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxjQUFjLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxxQkFBcUIsS0FBSyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsc0JBQXNCLEdBQUcscUJBQXFCLENBQUMsT0FBTyxNQUFNLElBQUksSUFBSSxzQkFBc0IsS0FBSyxNQUFNLEdBQUcsTUFBTSxHQUFHLHNCQUFzQixDQUFDLHFCQUFxQixNQUFNLElBQUksSUFBSSxJQUFJLEtBQUssTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDcDdCLEVBQUUsSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7QUFDL0MsRUFBRSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0IsRUFBRSxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUscUJBQXFCLENBQUM7QUFDMUQsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsRUFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsU0FBUyxLQUFLLENBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRTtBQUMvRixFQUFLLElBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLENB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QTZDO2FBQzVELFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZO0FBQzFDLGFBQUEsUUFBUSxDQUFDLENBQU8sS0FBSyxLQUFJLFNBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxLQUFLO0FBQ3pDLFlBQUEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtRQUNwQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ2Y7QUFDSDs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDUwLDUxLDUyLDUzLDU0LDU1LDU2LDU3LDU4LDU5LDYwLDYxLDYyLDYzLDY0LDY1LDY2LDY3LDY4LDY5LDcwLDcxLDcyLDczLDc0LDc1LDc2LDc3LDc4LDc5LDgwLDgxLDgyLDgzLDg0LDg1LDg2LDg3LDg4LDg5LDkwLDkxLDkyLDkzLDk0LDk1LDk2LDk3LDk4LDk5LDEwMCwxMDEsMTAyLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE0LDExNSwxMTYsMTE3LDExOCwxMTksMTIwLDEyMV19
