
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /**
     * Click Outside
     * @param {Node} node
     */
    var ClickOutside = (node, _options = {}) => {
      const options = { include: [], ..._options };

      function detect({ target }) {
        if (!node.contains(target) || options.include.some((i) => target.isSameNode(i))) {
          node.dispatchEvent(new CustomEvent('clickOutside'));
        }
      }
      document.addEventListener('click', detect, { passive: true });
      return {
        destroy() {
          document.removeEventListener('click', detect);
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialApp.svelte generated by Svelte v3.29.7 */

    const file = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialApp.svelte";

    function create_fragment(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file, 12, 0, 202938);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialApp", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Icon\Icon.svelte generated by Svelte v3.29.7 */
    const file$1 = "node_modules\\svelte-materialify\\dist\\components\\Icon\\Icon.svelte";

    // (26:2) {#if path}
    function create_if_block(ctx) {
    	let svg;
    	let path_1;
    	let if_block = /*label*/ ctx[6] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[5]);
    			add_location(path_1, file$1, 31, 6, 1372);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*size*/ ctx[1]);
    			attr_dev(svg, "height", /*size*/ ctx[1]);
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$1, 26, 4, 1254);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 32) {
    				attr_dev(path_1, "d", /*path*/ ctx[5]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "width", /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) {
    				attr_dev(svg, "height", /*size*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(26:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if label}
    function create_if_block_1(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[6]);
    			add_location(title, file$1, 33, 10, 1418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 64) set_data_dev(t, /*label*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(33:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[5] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[0]);
    			attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			attr_dev(i, "style", /*style*/ ctx[7]);
    			toggle_class(i, "spin", /*spin*/ ctx[3]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			add_location(i, file$1, 16, 0, 1032);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[1],
    					"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[0])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 64) {
    				attr_dev(i, "aria-label", /*label*/ ctx[6]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(i, "style", /*style*/ ctx[7]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 6) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[1],
    				"icon-rotate": `${/*rotate*/ ctx[2]}deg`
    			});

    			if (dirty & /*klass, spin*/ 9) {
    				toggle_class(i, "spin", /*spin*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "size", "rotate", "spin", "disabled", "path", "label", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rotate" in $$props) $$invalidate(2, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(3, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(5, path = $$props.path);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, size, rotate, spin, disabled, path, label, style, $$scope, slots];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 0,
    			size: 1,
    			rotate: 2,
    			spin: 3,
    			disabled: 4,
    			path: 5,
    			label: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format$1 = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format$1(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format$1(klass));
            else if (classes[i]) node.classList.remove(...format$1(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.29.7 */
    const file$2 = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], null);

    	let button_levels = [
    		{
    			class: button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0]
    		},
    		{ type: /*type*/ ctx[13] },
    		{ style: /*style*/ ctx[15] },
    		{ disabled: /*disabled*/ ctx[10] },
    		{ "aria-disabled": /*disabled*/ ctx[10] },
    		/*$$restProps*/ ctx[16]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$2, 44, 2, 5013);
    			set_attributes(button, button_data);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    			add_location(button, file$2, 25, 0, 4617);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button, /*ripple*/ ctx[14])),
    					listen_dev(button, "click", /*click_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 131072) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty & /*size, klass*/ 17 && button_class_value !== (button_class_value = "s-btn size-" + /*size*/ ctx[4] + " " + /*klass*/ ctx[0])) && { class: button_class_value },
    				(!current || dirty & /*type*/ 8192) && { type: /*type*/ ctx[13] },
    				(!current || dirty & /*style*/ 32768) && { style: /*style*/ ctx[15] },
    				(!current || dirty & /*disabled*/ 1024) && { disabled: /*disabled*/ ctx[10] },
    				(!current || dirty & /*disabled*/ 1024) && { "aria-disabled": /*disabled*/ ctx[10] },
    				dirty & /*$$restProps*/ 65536 && /*$$restProps*/ ctx[16]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 6144) Class_action.update.call(null, [/*active*/ ctx[11] && /*activeClass*/ ctx[12]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 16384) Ripple_action.update.call(null, /*ripple*/ ctx[14]);
    			toggle_class(button, "fab", /*fab*/ ctx[1]);
    			toggle_class(button, "icon", /*icon*/ ctx[2]);
    			toggle_class(button, "block", /*block*/ ctx[3]);
    			toggle_class(button, "tile", /*tile*/ ctx[5]);
    			toggle_class(button, "text", /*text*/ ctx[6] || /*icon*/ ctx[2]);
    			toggle_class(button, "depressed", /*depressed*/ ctx[7] || /*text*/ ctx[6] || /*disabled*/ ctx[10] || /*outlined*/ ctx[8] || /*icon*/ ctx[2]);
    			toggle_class(button, "outlined", /*outlined*/ ctx[8]);
    			toggle_class(button, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(button, "disabled", /*disabled*/ ctx[10]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(16, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(0, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(15, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(1, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(2, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(3, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(4, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(5, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(6, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(7, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(8, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(11, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(12, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(13, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(14, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(15, style = $$new_props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			fab: 1,
    			icon: 2,
    			block: 3,
    			size: 4,
    			tile: 5,
    			text: 6,
    			depressed: 7,
    			outlined: 8,
    			rounded: 9,
    			disabled: 10,
    			active: 11,
    			activeClass: 12,
    			type: 13,
    			ripple: 14,
    			style: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\svelte-materialify\dist\components\ItemGroup\ItemGroup.svelte generated by Svelte v3.29.7 */
    const file$3 = "node_modules\\svelte-materialify\\dist\\components\\ItemGroup\\ItemGroup.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$3, 58, 0, 1549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemGroup", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);

    	const unsub = valueStore.subscribe(val => {
    		dispatch("change", multiple ? val : val[0]);
    	});

    	onDestroy(unsub);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!(mandatory && value === 1)) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(val);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max",
    		"role",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		unsub,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*multiple, value*/ 40) {
    			 valueStore.set(multiple ? value : [value]);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (/^(lighten|darken|accent)-/.test(i)) {
          return `text-${i}`;
        }
        return `${i}-text`;
      });
    }

    function setTextColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.color = text;
        return false;
      }
      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.color = `var(${text})`;
        return false;
      }
      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var TextColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setTextColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.color = null;
          }

          if (typeof newText === 'string') {
            klass = setTextColor(node, newText);
          }
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Input\Input.svelte generated by Svelte v3.29.7 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\Input\\Input.svelte";
    const get_append_outer_slot_changes = dirty => ({});
    const get_append_outer_slot_context = ctx => ({});
    const get_messages_slot_changes = dirty => ({});
    const get_messages_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes = dirty => ({});
    const get_prepend_outer_slot_context = ctx => ({});

    function create_fragment$4(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let TextColor_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_outer_slot_template = /*#slots*/ ctx[9]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_prepend_outer_slot_context);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);
    	const messages_slot_template = /*#slots*/ ctx[9].messages;
    	const messages_slot = create_slot(messages_slot_template, ctx, /*$$scope*/ ctx[8], get_messages_slot_context);
    	const append_outer_slot_template = /*#slots*/ ctx[9]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[8], get_append_outer_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_outer_slot) prepend_outer_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (messages_slot) messages_slot.c();
    			t2 = space();
    			if (append_outer_slot) append_outer_slot.c();
    			attr_dev(div0, "class", "s-input__slot");
    			add_location(div0, file$4, 27, 4, 8632);
    			attr_dev(div1, "class", "s-input__details");
    			add_location(div1, file$4, 30, 4, 8690);
    			attr_dev(div2, "class", "s-input__control");
    			add_location(div2, file$4, 26, 2, 8597);
    			attr_dev(div3, "class", div3_class_value = "s-input " + /*klass*/ ctx[0]);
    			attr_dev(div3, "style", /*style*/ ctx[7]);
    			toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			toggle_class(div3, "error", /*error*/ ctx[5]);
    			toggle_class(div3, "success", /*success*/ ctx[6]);
    			toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			add_location(div3, file$4, 16, 0, 8379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (messages_slot) {
    				messages_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_outer_slot) {
    				append_outer_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(TextColor_action = TextColor.call(null, div3, /*success*/ ctx[6]
    				? "success"
    				: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_prepend_outer_slot_changes, get_prepend_outer_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (messages_slot) {
    				if (messages_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(messages_slot, messages_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_messages_slot_changes, get_messages_slot_context);
    				}
    			}

    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_append_outer_slot_changes, get_append_outer_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div3_class_value !== (div3_class_value = "s-input " + /*klass*/ ctx[0])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div3, "style", /*style*/ ctx[7]);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*success, error, color*/ 98) TextColor_action.update.call(null, /*success*/ ctx[6]
    			? "success"
    			: /*error*/ ctx[5] ? "error" : /*color*/ ctx[1]);

    			if (dirty & /*klass, dense*/ 5) {
    				toggle_class(div3, "dense", /*dense*/ ctx[2]);
    			}

    			if (dirty & /*klass, error*/ 33) {
    				toggle_class(div3, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*klass, success*/ 65) {
    				toggle_class(div3, "success", /*success*/ ctx[6]);
    			}

    			if (dirty & /*klass, readonly*/ 9) {
    				toggle_class(div3, "readonly", /*readonly*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 17) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			transition_in(default_slot, local);
    			transition_in(messages_slot, local);
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			transition_out(default_slot, local);
    			transition_out(messages_slot, local);
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (messages_slot) messages_slot.d(detaching);
    			if (append_outer_slot) append_outer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, ['prepend-outer','default','messages','append-outer']);
    	let { class: klass = "" } = $$props;
    	let { color = null } = $$props;
    	let { dense = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "color", "dense", "readonly", "disabled", "error", "success", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextColor,
    		klass,
    		color,
    		dense,
    		readonly,
    		disabled,
    		error,
    		success,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("dense" in $$props) $$invalidate(2, dense = $$props.dense);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    		if ("success" in $$props) $$invalidate(6, success = $$props.success);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, color, dense, readonly, disabled, error, success, style, $$scope, slots];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 0,
    			color: 1,
    			dense: 2,
    			readonly: 3,
    			disabled: 4,
    			error: 5,
    			success: 6,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    var uid = (len) => {
      let str = '';
      let num = len || 11;
      while (num--) str += HEX[(Math.random() * 36) | 0];
      return str;
    };

    var closeIcon = 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';

    /* node_modules\svelte-materialify\dist\components\TextField\TextField.svelte generated by Svelte v3.29.7 */
    const file$5 = "node_modules\\svelte-materialify\\dist\\components\\TextField\\TextField.svelte";
    const get_append_outer_slot_changes$1 = dirty => ({});
    const get_append_outer_slot_context$1 = ctx => ({ slot: "append-outer" });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[40] = list[i];
    	return child_ctx;
    }

    const get_append_slot_changes = dirty => ({});
    const get_append_slot_context = ctx => ({});
    const get_clear_icon_slot_changes = dirty => ({});
    const get_clear_icon_slot_context = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});
    const get_prepend_outer_slot_changes$1 = dirty => ({});
    const get_prepend_outer_slot_context$1 = ctx => ({ slot: "prepend-outer" });

    // (72:2) <slot slot="prepend-outer" name="prepend-outer" />   <div     class="s-text-field__wrapper"     class:filled     class:solo     class:outlined     class:flat     class:rounded>     <!-- Slot for prepend inside the input. -->     <slot name="prepend" />      <div class="s-text-field__input">       <label for={id}
    function create_prepend_outer_slot(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[30]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[37], get_prepend_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_prepend_outer_slot_changes$1, get_prepend_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot.name,
    		type: "slot",
    		source: "(72:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <div     class=\\\"s-text-field__wrapper\\\"     class:filled     class:solo     class:outlined     class:flat     class:rounded>     <!-- Slot for prepend inside the input. -->     <slot name=\\\"prepend\\\" />      <div class=\\\"s-text-field__input\\\">       <label for={id}",
    		ctx
    	});

    	return block;
    }

    // (106:4) {#if clearable && value !== ''}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const clear_icon_slot_template = /*#slots*/ ctx[30]["clear-icon"];
    	const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[37], get_clear_icon_slot_context);
    	const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
    			set_style(div, "cursor", "pointer");
    			add_location(div, file$5, 106, 6, 2366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (clear_icon_slot_or_fallback) {
    				clear_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*clear*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (clear_icon_slot) {
    				if (clear_icon_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(clear_icon_slot, clear_icon_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_clear_icon_slot_changes, get_clear_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clear_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clear_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(106:4) {#if clearable && value !== ''}",
    		ctx
    	});

    	return block;
    }

    // (109:32)            
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(109:32)            ",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#each messages as message}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[40] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$5, 121, 33, 2759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*messages*/ 65536 && t_value !== (t_value = /*message*/ ctx[40] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(122:6) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    // (123:6) {#each errorMessages.slice(0, errorCount) as message}
    function create_each_block(ctx) {
    	let span;
    	let t_value = /*message*/ ctx[40] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$5, 122, 59, 2848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*errorMessages, errorCount*/ 2228224 && t_value !== (t_value = /*message*/ ctx[40] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(123:6) {#each errorMessages.slice(0, errorCount) as message}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#if counter}
    function create_if_block$1(ctx) {
    	let span;
    	let t0_value = /*value*/ ctx[0].length + "";
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(/*counter*/ ctx[15]);
    			add_location(span, file$5, 124, 17, 2906);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 1 && t0_value !== (t0_value = /*value*/ ctx[0].length + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*counter*/ 32768) set_data_dev(t2, /*counter*/ ctx[15]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(125:4) {#if counter}",
    		ctx
    	});

    	return block;
    }

    // (119:2) <div slot="messages">
    function create_messages_slot(ctx) {
    	let div0;
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_1 = /*messages*/ ctx[16];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*errorMessages*/ ctx[21].slice(0, /*errorCount*/ ctx[17]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*counter*/ ctx[15] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div1 = element("div");
    			span = element("span");
    			t0 = text(/*hint*/ ctx[14]);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(span, file$5, 120, 6, 2706);
    			add_location(div1, file$5, 119, 4, 2694);
    			attr_dev(div0, "slot", "messages");
    			add_location(div0, file$5, 118, 2, 2668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div1);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div0, t3);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hint*/ 16384) set_data_dev(t0, /*hint*/ ctx[14]);

    			if (dirty[0] & /*messages*/ 65536) {
    				each_value_1 = /*messages*/ ctx[16];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*errorMessages, errorCount*/ 2228224) {
    				each_value = /*errorMessages*/ ctx[21].slice(0, /*errorCount*/ ctx[17]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*counter*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_messages_slot.name,
    		type: "slot",
    		source: "(119:2) <div slot=\\\"messages\\\">",
    		ctx
    	});

    	return block;
    }

    // (129:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[30]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[37], get_append_outer_slot_context$1);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_append_outer_slot_changes$1, get_append_outer_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot.name,
    		type: "slot",
    		source: "(129:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (62:0) <Input   class="s-text-field {klass}"   {color}   {dense}   {readonly}   {disabled}   {error}   {success}   {style}>
    function create_default_slot(ctx) {
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let label;
    	let t2;
    	let t3;
    	let input;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[30].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[37], get_prepend_slot_context);
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[37], null);
    	const content_slot_template = /*#slots*/ ctx[30].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[37], get_content_slot_context);

    	let input_levels = [
    		{ type: "text" },
    		{ placeholder: /*placeholder*/ ctx[13] },
    		{ id: /*id*/ ctx[19] },
    		{ readOnly: /*readonly*/ ctx[11] },
    		{ disabled: /*disabled*/ ctx[12] },
    		/*$$restProps*/ ctx[27]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block = /*clearable*/ ctx[10] && /*value*/ ctx[0] !== "" && create_if_block_1$1(ctx);
    	const append_slot_template = /*#slots*/ ctx[30].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[37], get_append_slot_context);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div1 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (content_slot) content_slot.c();
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			if (append_slot) append_slot.c();
    			t6 = space();
    			t7 = space();
    			attr_dev(label, "for", /*id*/ ctx[19]);
    			toggle_class(label, "active", /*labelActive*/ ctx[22]);
    			add_location(label, file$5, 83, 6, 1886);
    			set_attributes(input, input_data);
    			add_location(input, file$5, 87, 6, 1998);
    			attr_dev(div0, "class", "s-text-field__input");
    			add_location(div0, file$5, 82, 4, 1846);
    			attr_dev(div1, "class", "s-text-field__wrapper");
    			toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			toggle_class(div1, "rounded", /*rounded*/ ctx[9]);
    			add_location(div1, file$5, 72, 2, 1641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			append_dev(div0, t2);

    			if (content_slot) {
    				content_slot.m(div0, null);
    			}

    			append_dev(div0, t3);
    			append_dev(div0, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div1, t4);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t5);

    			if (append_slot) {
    				append_slot.m(div1, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, t7, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[36]),
    					listen_dev(input, "focus", /*onFocus*/ ctx[23], false, false, false),
    					listen_dev(input, "blur", /*onBlur*/ ctx[24], false, false, false),
    					listen_dev(input, "input", /*onInput*/ ctx[26], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[31], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[32], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[33], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[34], false, false, false),
    					listen_dev(input, "keypress", /*keypress_handler*/ ctx[35], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_prepend_slot_changes, get_prepend_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[37], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*id*/ 524288) {
    				attr_dev(label, "for", /*id*/ ctx[19]);
    			}

    			if (dirty[0] & /*labelActive*/ 4194304) {
    				toggle_class(label, "active", /*labelActive*/ ctx[22]);
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				{ type: "text" },
    				(!current || dirty[0] & /*placeholder*/ 8192) && { placeholder: /*placeholder*/ ctx[13] },
    				(!current || dirty[0] & /*id*/ 524288) && { id: /*id*/ ctx[19] },
    				(!current || dirty[0] & /*readonly*/ 2048) && { readOnly: /*readonly*/ ctx[11] },
    				(!current || dirty[0] & /*disabled*/ 4096) && { disabled: /*disabled*/ ctx[12] },
    				dirty[0] & /*$$restProps*/ 134217728 && /*$$restProps*/ ctx[27]
    			]));

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*clearable*/ ctx[10] && /*value*/ ctx[0] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*clearable, value*/ 1025) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t5);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty[1] & /*$$scope*/ 64) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_append_slot_changes, get_append_slot_context);
    				}
    			}

    			if (dirty[0] & /*filled*/ 16) {
    				toggle_class(div1, "filled", /*filled*/ ctx[4]);
    			}

    			if (dirty[0] & /*solo*/ 32) {
    				toggle_class(div1, "solo", /*solo*/ ctx[5]);
    			}

    			if (dirty[0] & /*outlined*/ 64) {
    				toggle_class(div1, "outlined", /*outlined*/ ctx[6]);
    			}

    			if (dirty[0] & /*flat*/ 128) {
    				toggle_class(div1, "flat", /*flat*/ ctx[7]);
    			}

    			if (dirty[0] & /*rounded*/ 512) {
    				toggle_class(div1, "rounded", /*rounded*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(content_slot, local);
    			transition_in(if_block);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(content_slot, local);
    			transition_out(if_block);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (append_slot) append_slot.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(t7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(62:0) <Input   class=\\\"s-text-field {klass}\\\"   {color}   {dense}   {readonly}   {disabled}   {error}   {success}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-text-field " + /*klass*/ ctx[2],
    				color: /*color*/ ctx[3],
    				dense: /*dense*/ ctx[8],
    				readonly: /*readonly*/ ctx[11],
    				disabled: /*disabled*/ ctx[12],
    				error: /*error*/ ctx[1],
    				success: /*success*/ ctx[18],
    				style: /*style*/ ctx[20],
    				$$slots: {
    					default: [create_default_slot],
    					"append-outer": [create_append_outer_slot],
    					messages: [create_messages_slot],
    					"prepend-outer": [create_prepend_outer_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};
    			if (dirty[0] & /*klass*/ 4) input_changes.class = "s-text-field " + /*klass*/ ctx[2];
    			if (dirty[0] & /*color*/ 8) input_changes.color = /*color*/ ctx[3];
    			if (dirty[0] & /*dense*/ 256) input_changes.dense = /*dense*/ ctx[8];
    			if (dirty[0] & /*readonly*/ 2048) input_changes.readonly = /*readonly*/ ctx[11];
    			if (dirty[0] & /*disabled*/ 4096) input_changes.disabled = /*disabled*/ ctx[12];
    			if (dirty[0] & /*error*/ 2) input_changes.error = /*error*/ ctx[1];
    			if (dirty[0] & /*success*/ 262144) input_changes.success = /*success*/ ctx[18];
    			if (dirty[0] & /*style*/ 1048576) input_changes.style = /*style*/ ctx[20];

    			if (dirty[0] & /*counter, value, errorMessages, errorCount, messages, hint, filled, solo, outlined, flat, rounded, clearable, placeholder, id, readonly, disabled, $$restProps, labelActive*/ 141295345 | dirty[1] & /*$$scope*/ 64) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","value","color","filled","solo","outlined","flat","dense","rounded","clearable","readonly","disabled","placeholder","hint","counter","messages","rules","errorCount","validateOnBlur","error","success","id","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots("TextField", slots, [
    		'prepend-outer','prepend','default','content','clear-icon','append','append-outer'
    	]);

    	let { class: klass = "" } = $$props;
    	let { value = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { filled = false } = $$props;
    	let { solo = false } = $$props;
    	let { outlined = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { rounded = false } = $$props;
    	let { clearable = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { counter = false } = $$props;
    	let { messages = [] } = $$props;
    	let { rules = [] } = $$props;
    	let { errorCount = 1 } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { error = false } = $$props;
    	let { success = false } = $$props;
    	let { id = `s-input-${uid(5)}` } = $$props;
    	let { style = null } = $$props;
    	let focused = false;
    	let errorMessages = [];

    	function checkRules() {
    		$$invalidate(21, errorMessages = rules.map(r => r(value)).filter(r => typeof r === "string"));

    		if (errorMessages.length) $$invalidate(1, error = true); else {
    			$$invalidate(1, error = false);
    		}
    	}

    	function onFocus() {
    		$$invalidate(38, focused = true);
    	}

    	function onBlur() {
    		$$invalidate(38, focused = false);
    		if (validateOnBlur) checkRules();
    	}

    	function clear() {
    		$$invalidate(0, value = "");
    	}

    	function onInput() {
    		if (!validateOnBlur) checkRules();
    	}

    	function focus_handler(event) {
    		bubble($$self, event);
    	}

    	function blur_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function keypress_handler(event) {
    		bubble($$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(27, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(2, klass = $$new_props.class);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$new_props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$new_props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$new_props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$new_props) $$invalidate(7, flat = $$new_props.flat);
    		if ("dense" in $$new_props) $$invalidate(8, dense = $$new_props.dense);
    		if ("rounded" in $$new_props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("clearable" in $$new_props) $$invalidate(10, clearable = $$new_props.clearable);
    		if ("readonly" in $$new_props) $$invalidate(11, readonly = $$new_props.readonly);
    		if ("disabled" in $$new_props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("placeholder" in $$new_props) $$invalidate(13, placeholder = $$new_props.placeholder);
    		if ("hint" in $$new_props) $$invalidate(14, hint = $$new_props.hint);
    		if ("counter" in $$new_props) $$invalidate(15, counter = $$new_props.counter);
    		if ("messages" in $$new_props) $$invalidate(16, messages = $$new_props.messages);
    		if ("rules" in $$new_props) $$invalidate(28, rules = $$new_props.rules);
    		if ("errorCount" in $$new_props) $$invalidate(17, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$new_props) $$invalidate(29, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$new_props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$new_props) $$invalidate(18, success = $$new_props.success);
    		if ("id" in $$new_props) $$invalidate(19, id = $$new_props.id);
    		if ("style" in $$new_props) $$invalidate(20, style = $$new_props.style);
    		if ("$$scope" in $$new_props) $$invalidate(37, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Input,
    		Icon,
    		uid,
    		clearIcon: closeIcon,
    		klass,
    		value,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		rules,
    		errorCount,
    		validateOnBlur,
    		error,
    		success,
    		id,
    		style,
    		focused,
    		errorMessages,
    		checkRules,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		labelActive
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$new_props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("filled" in $$props) $$invalidate(4, filled = $$new_props.filled);
    		if ("solo" in $$props) $$invalidate(5, solo = $$new_props.solo);
    		if ("outlined" in $$props) $$invalidate(6, outlined = $$new_props.outlined);
    		if ("flat" in $$props) $$invalidate(7, flat = $$new_props.flat);
    		if ("dense" in $$props) $$invalidate(8, dense = $$new_props.dense);
    		if ("rounded" in $$props) $$invalidate(9, rounded = $$new_props.rounded);
    		if ("clearable" in $$props) $$invalidate(10, clearable = $$new_props.clearable);
    		if ("readonly" in $$props) $$invalidate(11, readonly = $$new_props.readonly);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ("placeholder" in $$props) $$invalidate(13, placeholder = $$new_props.placeholder);
    		if ("hint" in $$props) $$invalidate(14, hint = $$new_props.hint);
    		if ("counter" in $$props) $$invalidate(15, counter = $$new_props.counter);
    		if ("messages" in $$props) $$invalidate(16, messages = $$new_props.messages);
    		if ("rules" in $$props) $$invalidate(28, rules = $$new_props.rules);
    		if ("errorCount" in $$props) $$invalidate(17, errorCount = $$new_props.errorCount);
    		if ("validateOnBlur" in $$props) $$invalidate(29, validateOnBlur = $$new_props.validateOnBlur);
    		if ("error" in $$props) $$invalidate(1, error = $$new_props.error);
    		if ("success" in $$props) $$invalidate(18, success = $$new_props.success);
    		if ("id" in $$props) $$invalidate(19, id = $$new_props.id);
    		if ("style" in $$props) $$invalidate(20, style = $$new_props.style);
    		if ("focused" in $$props) $$invalidate(38, focused = $$new_props.focused);
    		if ("errorMessages" in $$props) $$invalidate(21, errorMessages = $$new_props.errorMessages);
    		if ("labelActive" in $$props) $$invalidate(22, labelActive = $$new_props.labelActive);
    	};

    	let labelActive;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*placeholder, value*/ 8193 | $$self.$$.dirty[1] & /*focused*/ 128) {
    			 $$invalidate(22, labelActive = !!placeholder || value || focused);
    		}
    	};

    	return [
    		value,
    		error,
    		klass,
    		color,
    		filled,
    		solo,
    		outlined,
    		flat,
    		dense,
    		rounded,
    		clearable,
    		readonly,
    		disabled,
    		placeholder,
    		hint,
    		counter,
    		messages,
    		errorCount,
    		success,
    		id,
    		style,
    		errorMessages,
    		labelActive,
    		onFocus,
    		onBlur,
    		clear,
    		onInput,
    		$$restProps,
    		rules,
    		validateOnBlur,
    		slots,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		keypress_handler,
    		input_input_handler,
    		$$scope
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				class: 2,
    				value: 0,
    				color: 3,
    				filled: 4,
    				solo: 5,
    				outlined: 6,
    				flat: 7,
    				dense: 8,
    				rounded: 9,
    				clearable: 10,
    				readonly: 11,
    				disabled: 12,
    				placeholder: 13,
    				hint: 14,
    				counter: 15,
    				messages: 16,
    				rules: 28,
    				errorCount: 17,
    				validateOnBlur: 29,
    				error: 1,
    				success: 18,
    				id: 19,
    				style: 20
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get counter() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set counter(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rules() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rules(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorCount() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorCount(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validateOnBlur() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validateOnBlur(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get success() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set success(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var nouislider_min = createCommonjsModule(function (module, exports) {
    /* eslint-disable */
    /*! nouislider - 14.6.1 - 8/17/2020 */
    !(function (t) {
        (module.exports = t())
        ;
    })(function () {
      var lt = '14.6.1';
      function ut(t) {
        t.parentElement.removeChild(t);
      }
      function a(t) {
        return null != t;
      }
      function ct(t) {
        t.preventDefault();
      }
      function o(t) {
        return 'number' == typeof t && !isNaN(t) && isFinite(t);
      }
      function pt(t, e, r) {
        0 < r &&
          (ht(t, e),
          setTimeout(function () {
            mt(t, e);
          }, r));
      }
      function ft(t) {
        return Math.max(Math.min(t, 100), 0);
      }
      function dt(t) {
        return Array.isArray(t) ? t : [t];
      }
      function e(t) {
        var e = (t = String(t)).split('.');
        return 1 < e.length ? e[1].length : 0;
      }
      function ht(t, e) {
        t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
      }
      function mt(t, e) {
        t.classList && !/\s/.test(e)
          ? t.classList.remove(e)
          : (t.className = t.className.replace(
              new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'),
              ' ',
            ));
      }
      function gt(t) {
        var e = void 0 !== window.pageXOffset,
          r = 'CSS1Compat' === (t.compatMode || '');
        return {
          x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
          y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
        };
      }
      function c(t, e) {
        return 100 / (e - t);
      }
      function p(t, e, r) {
        return (100 * e) / (t[r + 1] - t[r]);
      }
      function f(t, e) {
        for (var r = 1; t >= e[r]; ) r += 1;
        return r;
      }
      function r(t, e, r) {
        if (r >= t.slice(-1)[0]) return 100;
        var n,
          i,
          o = f(r, t),
          s = t[o - 1],
          a = t[o],
          l = e[o - 1],
          u = e[o];
        return (
          l +
          ((i = r), p((n = [s, a]), n[0] < 0 ? i + Math.abs(n[0]) : i - n[0], 0) / c(l, u))
        );
      }
      function n(t, e, r, n) {
        if (100 === n) return n;
        var i,
          o,
          s = f(n, t),
          a = t[s - 1],
          l = t[s];
        return r
          ? (l - a) / 2 < n - a
            ? l
            : a
          : e[s - 1]
          ? t[s - 1] + ((i = n - t[s - 1]), (o = e[s - 1]), Math.round(i / o) * o)
          : n;
      }
      function s(t, e, r) {
        var n;
        if (('number' == typeof e && (e = [e]), !Array.isArray(e)))
          throw new Error('noUiSlider (' + lt + "): 'range' contains invalid value.");
        if (!o((n = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !o(e[0]))
          throw new Error('noUiSlider (' + lt + "): 'range' value isn't numeric.");
        r.xPct.push(n),
          r.xVal.push(e[0]),
          n ? r.xSteps.push(!isNaN(e[1]) && e[1]) : isNaN(e[1]) || (r.xSteps[0] = e[1]),
          r.xHighestCompleteStep.push(0);
      }
      function l(t, e, r) {
        if (e)
          if (r.xVal[t] !== r.xVal[t + 1]) {
            r.xSteps[t] = p([r.xVal[t], r.xVal[t + 1]], e, 0) / c(r.xPct[t], r.xPct[t + 1]);
            var n = (r.xVal[t + 1] - r.xVal[t]) / r.xNumSteps[t],
              i = Math.ceil(Number(n.toFixed(3)) - 1),
              o = r.xVal[t] + r.xNumSteps[t] * i;
            r.xHighestCompleteStep[t] = o;
          } else r.xSteps[t] = r.xHighestCompleteStep[t] = r.xVal[t];
      }
      function i(t, e, r) {
        var n;
        (this.xPct = []),
          (this.xVal = []),
          (this.xSteps = [r || !1]),
          (this.xNumSteps = [!1]),
          (this.xHighestCompleteStep = []),
          (this.snap = e);
        var i = [];
        for (n in t) t.hasOwnProperty(n) && i.push([t[n], n]);
        for (
          i.length && 'object' == typeof i[0][0]
            ? i.sort(function (t, e) {
                return t[0][0] - e[0][0];
              })
            : i.sort(function (t, e) {
                return t[0] - e[0];
              }),
            n = 0;
          n < i.length;
          n++
        )
          s(i[n][1], i[n][0], this);
        for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
          l(n, this.xNumSteps[n], this);
      }
      (i.prototype.getDistance = function (t) {
        var e,
          r = [];
        for (e = 0; e < this.xNumSteps.length - 1; e++) {
          var n = this.xNumSteps[e];
          if (n && (t / n) % 1 != 0)
            throw new Error(
              'noUiSlider (' +
                lt +
                "): 'limit', 'margin' and 'padding' of " +
                this.xPct[e] +
                '% range must be divisible by step.',
            );
          r[e] = p(this.xVal, t, e);
        }
        return r;
      }),
        (i.prototype.getAbsoluteDistance = function (t, e, r) {
          var n,
            i = 0;
          if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
          else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
          r || t !== this.xPct[i + 1] || i++;
          var o = 1,
            s = e[i],
            a = 0,
            l = 0,
            u = 0,
            c = 0;
          for (
            n = r
              ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
              : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
            0 < s;

          )
            (a = this.xPct[i + 1 + c] - this.xPct[i + c]),
              100 < e[i + c] * o + 100 - 100 * n
                ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
              r
                ? ((u -= l), 1 <= this.xPct.length + c && c--)
                : ((u += l), 1 <= this.xPct.length - c && c++),
              (s = e[i + c] * o);
          return t + u;
        }),
        (i.prototype.toStepping = function (t) {
          return (t = r(this.xVal, this.xPct, t));
        }),
        (i.prototype.fromStepping = function (t) {
          return (function (t, e, r) {
            if (100 <= r) return t.slice(-1)[0];
            var n,
              i = f(r, e),
              o = t[i - 1],
              s = t[i],
              a = e[i - 1],
              l = e[i];
            return (n = [o, s]), ((r - a) * c(a, l) * (n[1] - n[0])) / 100 + n[0];
          })(this.xVal, this.xPct, t);
        }),
        (i.prototype.getStep = function (t) {
          return (t = n(this.xPct, this.xSteps, this.snap, t));
        }),
        (i.prototype.getDefaultStep = function (t, e, r) {
          var n = f(t, this.xPct);
          return (
            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
            (this.xVal[n] - this.xVal[n - 1]) / r
          );
        }),
        (i.prototype.getNearbySteps = function (t) {
          var e = f(t, this.xPct);
          return {
            stepBefore: {
              startValue: this.xVal[e - 2],
              step: this.xNumSteps[e - 2],
              highestStep: this.xHighestCompleteStep[e - 2],
            },
            thisStep: {
              startValue: this.xVal[e - 1],
              step: this.xNumSteps[e - 1],
              highestStep: this.xHighestCompleteStep[e - 1],
            },
            stepAfter: {
              startValue: this.xVal[e],
              step: this.xNumSteps[e],
              highestStep: this.xHighestCompleteStep[e],
            },
          };
        }),
        (i.prototype.countStepDecimals = function () {
          var t = this.xNumSteps.map(e);
          return Math.max.apply(null, t);
        }),
        (i.prototype.convert = function (t) {
          return this.getStep(this.toStepping(t));
        });
      var u = {
          to: function (t) {
            return void 0 !== t && t.toFixed(2);
          },
          from: Number,
        },
        d = {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle',
          handleLower: 'handle-lower',
          handleUpper: 'handle-upper',
          touchArea: 'touch-area',
          horizontal: 'horizontal',
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          textDirectionLtr: 'txt-dir-ltr',
          textDirectionRtl: 'txt-dir-rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub',
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub',
        };
      function h(t) {
        if (
          'object' == typeof (e = t) &&
          'function' == typeof e.to &&
          'function' == typeof e.from
        )
          return !0;
        var e;
        throw new Error(
          'noUiSlider (' + lt + "): 'format' requires 'to' and 'from' methods.",
        );
      }
      function m(t, e) {
        if (!o(e)) throw new Error('noUiSlider (' + lt + "): 'step' is not numeric.");
        t.singleStep = e;
      }
      function g(t, e) {
        if (!o(e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardPageMultiplier' is not numeric.",
          );
        t.keyboardPageMultiplier = e;
      }
      function v(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'keyboardDefaultStep' is not numeric.");
        t.keyboardDefaultStep = e;
      }
      function b(t, e) {
        if ('object' != typeof e || Array.isArray(e))
          throw new Error('noUiSlider (' + lt + "): 'range' is not an object.");
        if (void 0 === e.min || void 0 === e.max)
          throw new Error('noUiSlider (' + lt + "): Missing 'min' or 'max' in 'range'.");
        if (e.min === e.max)
          throw new Error(
            'noUiSlider (' + lt + "): 'range' 'min' and 'max' cannot be equal.",
          );
        t.spectrum = new i(e, t.snap, t.singleStep);
      }
      function x(t, e) {
        if (((e = dt(e)), !Array.isArray(e) || !e.length))
          throw new Error('noUiSlider (' + lt + "): 'start' option is incorrect.");
        (t.handles = e.length), (t.start = e);
      }
      function S(t, e) {
        if ('boolean' != typeof (t.snap = e))
          throw new Error('noUiSlider (' + lt + "): 'snap' option must be a boolean.");
      }
      function w(t, e) {
        if ('boolean' != typeof (t.animate = e))
          throw new Error('noUiSlider (' + lt + "): 'animate' option must be a boolean.");
      }
      function y(t, e) {
        if ('number' != typeof (t.animationDuration = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'animationDuration' option must be a number.",
          );
      }
      function E(t, e) {
        var r,
          n = [!1];
        if (
          ('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]),
          !0 === e || !1 === e)
        ) {
          for (r = 1; r < t.handles; r++) n.push(e);
          n.push(!1);
        } else {
          if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
            throw new Error(
              'noUiSlider (' + lt + "): 'connect' option doesn't match handle count.",
            );
          n = e;
        }
        t.connect = n;
      }
      function C(t, e) {
        switch (e) {
          case 'horizontal':
            t.ort = 0;
            break;
          case 'vertical':
            t.ort = 1;
            break;
          default:
            throw new Error('noUiSlider (' + lt + "): 'orientation' option is invalid.");
        }
      }
      function P(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'margin' option must be numeric.");
        0 !== e && (t.margin = t.spectrum.getDistance(e));
      }
      function N(t, e) {
        if (!o(e))
          throw new Error('noUiSlider (' + lt + "): 'limit' option must be numeric.");
        if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'limit' option is only supported on linear sliders with 2 or more handles.",
          );
      }
      function k(t, e) {
        var r;
        if (!o(e) && !Array.isArray(e))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (Array.isArray(e) && 2 !== e.length && !o(e[0]) && !o(e[1]))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'padding' option must be numeric or array of exactly 2 numbers.",
          );
        if (0 !== e) {
          for (
            Array.isArray(e) || (e = [e, e]),
              t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])],
              r = 0;
            r < t.spectrum.xNumSteps.length - 1;
            r++
          )
            if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
              throw new Error(
                'noUiSlider (' + lt + "): 'padding' option must be a positive number(s).",
              );
          var n = e[0] + e[1],
            i = t.spectrum.xVal[0];
          if (1 < n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i))
            throw new Error(
              'noUiSlider (' + lt + "): 'padding' option must not exceed 100% of the range.",
            );
        }
      }
      function U(t, e) {
        switch (e) {
          case 'ltr':
            t.dir = 0;
            break;
          case 'rtl':
            t.dir = 1;
            break;
          default:
            throw new Error(
              'noUiSlider (' + lt + "): 'direction' option was not recognized.",
            );
        }
      }
      function A(t, e) {
        if ('string' != typeof e)
          throw new Error(
            'noUiSlider (' + lt + "): 'behaviour' must be a string containing options.",
          );
        var r = 0 <= e.indexOf('tap'),
          n = 0 <= e.indexOf('drag'),
          i = 0 <= e.indexOf('fixed'),
          o = 0 <= e.indexOf('snap'),
          s = 0 <= e.indexOf('hover'),
          a = 0 <= e.indexOf('unconstrained');
        if (i) {
          if (2 !== t.handles)
            throw new Error(
              'noUiSlider (' + lt + "): 'fixed' behaviour must be used with 2 handles",
            );
          P(t, t.start[1] - t.start[0]);
        }
        if (a && (t.margin || t.limit))
          throw new Error(
            'noUiSlider (' +
              lt +
              "): 'unconstrained' behaviour cannot be used with margin or limit",
          );
        t.events = { tap: r || o, drag: n, fixed: i, snap: o, hover: s, unconstrained: a };
      }
      function V(t, e) {
        if (!1 !== e)
          if (!0 === e) {
            t.tooltips = [];
            for (var r = 0; r < t.handles; r++) t.tooltips.push(!0);
          } else {
            if (((t.tooltips = dt(e)), t.tooltips.length !== t.handles))
              throw new Error(
                'noUiSlider (' + lt + '): must pass a formatter for all handles.',
              );
            t.tooltips.forEach(function (t) {
              if (
                'boolean' != typeof t &&
                ('object' != typeof t || 'function' != typeof t.to)
              )
                throw new Error(
                  'noUiSlider (' +
                    lt +
                    "): 'tooltips' must be passed a formatter or 'false'.",
                );
            });
          }
      }
      function D(t, e) {
        h((t.ariaFormat = e));
      }
      function M(t, e) {
        h((t.format = e));
      }
      function O(t, e) {
        if ('boolean' != typeof (t.keyboardSupport = e))
          throw new Error(
            'noUiSlider (' + lt + "): 'keyboardSupport' option must be a boolean.",
          );
      }
      function L(t, e) {
        t.documentElement = e;
      }
      function z(t, e) {
        if ('string' != typeof e && !1 !== e)
          throw new Error(
            'noUiSlider (' + lt + "): 'cssPrefix' must be a string or `false`.",
          );
        t.cssPrefix = e;
      }
      function H(t, e) {
        if ('object' != typeof e)
          throw new Error('noUiSlider (' + lt + "): 'cssClasses' must be an object.");
        if ('string' == typeof t.cssPrefix)
          for (var r in ((t.cssClasses = {}), e))
            e.hasOwnProperty(r) && (t.cssClasses[r] = t.cssPrefix + e[r]);
        else t.cssClasses = e;
      }
      function vt(e) {
        var r = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: !0,
            animationDuration: 300,
            ariaFormat: u,
            format: u,
          },
          n = {
            step: { r: !1, t: m },
            keyboardPageMultiplier: { r: !1, t: g },
            keyboardDefaultStep: { r: !1, t: v },
            start: { r: !0, t: x },
            connect: { r: !0, t: E },
            direction: { r: !0, t: U },
            snap: { r: !1, t: S },
            animate: { r: !1, t: w },
            animationDuration: { r: !1, t: y },
            range: { r: !0, t: b },
            orientation: { r: !1, t: C },
            margin: { r: !1, t: P },
            limit: { r: !1, t: N },
            padding: { r: !1, t: k },
            behaviour: { r: !0, t: A },
            ariaFormat: { r: !1, t: D },
            format: { r: !1, t: M },
            tooltips: { r: !1, t: V },
            keyboardSupport: { r: !0, t: O },
            documentElement: { r: !1, t: L },
            cssPrefix: { r: !0, t: z },
            cssClasses: { r: !0, t: H },
          },
          i = {
            connect: !1,
            direction: 'ltr',
            behaviour: 'tap',
            orientation: 'horizontal',
            keyboardSupport: !0,
            cssPrefix: 'noUi-',
            cssClasses: d,
            keyboardPageMultiplier: 5,
            keyboardDefaultStep: 10,
          };
        e.format && !e.ariaFormat && (e.ariaFormat = e.format),
          Object.keys(n).forEach(function (t) {
            if (!a(e[t]) && void 0 === i[t]) {
              if (n[t].r)
                throw new Error('noUiSlider (' + lt + "): '" + t + "' is required.");
              return !0;
            }
            n[t].t(r, a(e[t]) ? e[t] : i[t]);
          }),
          (r.pips = e.pips);
        var t = document.createElement('div'),
          o = void 0 !== t.style.msTransform,
          s = void 0 !== t.style.transform;
        r.transformRule = s ? 'transform' : o ? 'msTransform' : 'webkitTransform';
        return (
          (r.style = [
            ['left', 'top'],
            ['right', 'bottom'],
          ][r.dir][r.ort]),
          r
        );
      }
      function j(t, b, o) {
        var l,
          u,
          s,
          c,
          i,
          a,
          e,
          p,
          f = window.navigator.pointerEnabled
            ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
            : window.navigator.msPointerEnabled
            ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
            : {
                start: 'mousedown touchstart',
                move: 'mousemove touchmove',
                end: 'mouseup touchend',
              },
          d =
            window.CSS &&
            CSS.supports &&
            CSS.supports('touch-action', 'none') &&
            (function () {
              var t = !1;
              try {
                var e = Object.defineProperty({}, 'passive', {
                  get: function () {
                    t = !0;
                  },
                });
                window.addEventListener('test', null, e);
              } catch (t) {}
              return t;
            })(),
          h = t,
          y = b.spectrum,
          x = [],
          S = [],
          m = [],
          g = 0,
          v = {},
          w = t.ownerDocument,
          E = b.documentElement || w.documentElement,
          C = w.body,
          P = -1,
          N = 0,
          k = 1,
          U = 2,
          A = 'rtl' === w.dir || 1 === b.ort ? 0 : 100;
        function V(t, e) {
          var r = w.createElement('div');
          return e && ht(r, e), t.appendChild(r), r;
        }
        function D(t, e) {
          var r = V(t, b.cssClasses.origin),
            n = V(r, b.cssClasses.handle);
          return (
            V(n, b.cssClasses.touchArea),
            n.setAttribute('data-handle', e),
            b.keyboardSupport &&
              (n.setAttribute('tabindex', '0'),
              n.addEventListener('keydown', function (t) {
                return (function (t, e) {
                  if (O() || L(e)) return !1;
                  var r = ['Left', 'Right'],
                    n = ['Down', 'Up'],
                    i = ['PageDown', 'PageUp'],
                    o = ['Home', 'End'];
                  b.dir && !b.ort
                    ? r.reverse()
                    : b.ort && !b.dir && (n.reverse(), i.reverse());
                  var s,
                    a = t.key.replace('Arrow', ''),
                    l = a === i[0],
                    u = a === i[1],
                    c = a === n[0] || a === r[0] || l,
                    p = a === n[1] || a === r[1] || u,
                    f = a === o[0],
                    d = a === o[1];
                  if (!(c || p || f || d)) return !0;
                  if ((t.preventDefault(), p || c)) {
                    var h = b.keyboardPageMultiplier,
                      m = c ? 0 : 1,
                      g = at(e),
                      v = g[m];
                    if (null === v) return !1;
                    !1 === v && (v = y.getDefaultStep(S[e], c, b.keyboardDefaultStep)),
                      (u || l) && (v *= h),
                      (v = Math.max(v, 1e-7)),
                      (v *= c ? -1 : 1),
                      (s = x[e] + v);
                  } else s = d ? b.spectrum.xVal[b.spectrum.xVal.length - 1] : b.spectrum.xVal[0];
                  return (
                    rt(e, y.toStepping(s), !0, !0),
                    J('slide', e),
                    J('update', e),
                    J('change', e),
                    J('set', e),
                    !1
                  );
                })(t, e);
              })),
            n.setAttribute('role', 'slider'),
            n.setAttribute('aria-orientation', b.ort ? 'vertical' : 'horizontal'),
            0 === e
              ? ht(n, b.cssClasses.handleLower)
              : e === b.handles - 1 && ht(n, b.cssClasses.handleUpper),
            r
          );
        }
        function M(t, e) {
          return !!e && V(t, b.cssClasses.connect);
        }
        function r(t, e) {
          return !!b.tooltips[e] && V(t.firstChild, b.cssClasses.tooltip);
        }
        function O() {
          return h.hasAttribute('disabled');
        }
        function L(t) {
          return u[t].hasAttribute('disabled');
        }
        function z() {
          i &&
            (G('update.tooltips'),
            i.forEach(function (t) {
              t && ut(t);
            }),
            (i = null));
        }
        function H() {
          z(),
            (i = u.map(r)),
            $('update.tooltips', function (t, e, r) {
              if (i[e]) {
                var n = t[e];
                !0 !== b.tooltips[e] && (n = b.tooltips[e].to(r[e])), (i[e].innerHTML = n);
              }
            });
        }
        function j(e, i, o) {
          var s = w.createElement('div'),
            a = [];
          (a[N] = b.cssClasses.valueNormal),
            (a[k] = b.cssClasses.valueLarge),
            (a[U] = b.cssClasses.valueSub);
          var l = [];
          (l[N] = b.cssClasses.markerNormal),
            (l[k] = b.cssClasses.markerLarge),
            (l[U] = b.cssClasses.markerSub);
          var u = [b.cssClasses.valueHorizontal, b.cssClasses.valueVertical],
            c = [b.cssClasses.markerHorizontal, b.cssClasses.markerVertical];
          function p(t, e) {
            var r = e === b.cssClasses.value,
              n = r ? a : l;
            return e + ' ' + (r ? u : c)[b.ort] + ' ' + n[t];
          }
          return (
            ht(s, b.cssClasses.pips),
            ht(s, 0 === b.ort ? b.cssClasses.pipsHorizontal : b.cssClasses.pipsVertical),
            Object.keys(e).forEach(function (t) {
              !(function (t, e, r) {
                if ((r = i ? i(e, r) : r) !== P) {
                  var n = V(s, !1);
                  (n.className = p(r, b.cssClasses.marker)),
                    (n.style[b.style] = t + '%'),
                    N < r &&
                      (((n = V(s, !1)).className = p(r, b.cssClasses.value)),
                      n.setAttribute('data-value', e),
                      (n.style[b.style] = t + '%'),
                      (n.innerHTML = o.to(e)));
                }
              })(t, e[t][0], e[t][1]);
            }),
            s
          );
        }
        function F() {
          c && (ut(c), (c = null));
        }
        function R(t) {
          F();
          var m,
            g,
            v,
            b,
            e,
            r,
            x,
            S,
            w,
            n = t.mode,
            i = t.density || 1,
            o = t.filter || !1,
            s = (function (t, e, r) {
              if ('range' === t || 'steps' === t) return y.xVal;
              if ('count' === t) {
                if (e < 2)
                  throw new Error(
                    'noUiSlider (' + lt + "): 'values' (>= 2) required for mode 'count'.",
                  );
                var n = e - 1,
                  i = 100 / n;
                for (e = []; n--; ) e[n] = n * i;
                e.push(100), (t = 'positions');
              }
              return 'positions' === t
                ? e.map(function (t) {
                    return y.fromStepping(r ? y.getStep(t) : t);
                  })
                : 'values' === t
                ? r
                  ? e.map(function (t) {
                      return y.fromStepping(y.getStep(y.toStepping(t)));
                    })
                  : e
                : void 0;
            })(n, t.values || !1, t.stepped || !1),
            a =
              ((m = i),
              (g = n),
              (v = s),
              (b = {}),
              (e = y.xVal[0]),
              (r = y.xVal[y.xVal.length - 1]),
              (S = x = !1),
              (w = 0),
              (v = v
                .slice()
                .sort(function (t, e) {
                  return t - e;
                })
                .filter(function (t) {
                  return !this[t] && (this[t] = !0);
                }, {}))[0] !== e && (v.unshift(e), (x = !0)),
              v[v.length - 1] !== r && (v.push(r), (S = !0)),
              v.forEach(function (t, e) {
                var r,
                  n,
                  i,
                  o,
                  s,
                  a,
                  l,
                  u,
                  c,
                  p,
                  f = t,
                  d = v[e + 1],
                  h = 'steps' === g;
                if ((h && (r = y.xNumSteps[e]), r || (r = d - f), !1 !== f))
                  for (
                    void 0 === d && (d = f), r = Math.max(r, 1e-7), n = f;
                    n <= d;
                    n = (n + r).toFixed(7) / 1
                  ) {
                    for (
                      u = (s = (o = y.toStepping(n)) - w) / m,
                        p = s / (c = Math.round(u)),
                        i = 1;
                      i <= c;
                      i += 1
                    )
                      b[(a = w + i * p).toFixed(5)] = [y.fromStepping(a), 0];
                    (l = -1 < v.indexOf(n) ? k : h ? U : N),
                      !e && x && n !== d && (l = 0),
                      (n === d && S) || (b[o.toFixed(5)] = [n, l]),
                      (w = o);
                  }
              }),
              b),
            l = t.format || { to: Math.round };
          return (c = h.appendChild(j(a, o, l)));
        }
        function T() {
          var t = l.getBoundingClientRect(),
            e = 'offset' + ['Width', 'Height'][b.ort];
          return 0 === b.ort ? t.width || l[e] : t.height || l[e];
        }
        function B(n, i, o, s) {
          var e = function (t) {
              return (
                !!(t = (function (t, e, r) {
                  var n,
                    i,
                    o = 0 === t.type.indexOf('touch'),
                    s = 0 === t.type.indexOf('mouse'),
                    a = 0 === t.type.indexOf('pointer');
                  0 === t.type.indexOf('MSPointer') && (a = !0);
                  if (o) {
                    var l = function (t) {
                      return (
                        t.target === r ||
                        r.contains(t.target) ||
                        (t.target.shadowRoot && t.target.shadowRoot.contains(r))
                      );
                    };
                    if ('touchstart' === t.type) {
                      var u = Array.prototype.filter.call(t.touches, l);
                      if (1 < u.length) return !1;
                      (n = u[0].pageX), (i = u[0].pageY);
                    } else {
                      var c = Array.prototype.find.call(t.changedTouches, l);
                      if (!c) return !1;
                      (n = c.pageX), (i = c.pageY);
                    }
                  }
                  (e = e || gt(w)),
                    (s || a) && ((n = t.clientX + e.x), (i = t.clientY + e.y));
                  return (t.pageOffset = e), (t.points = [n, i]), (t.cursor = s || a), t;
                })(t, s.pageOffset, s.target || i)) &&
                !(O() && !s.doNotReject) &&
                ((e = h),
                (r = b.cssClasses.tap),
                !(
                  (e.classList
                    ? e.classList.contains(r)
                    : new RegExp('\\b' + r + '\\b').test(e.className)) && !s.doNotReject
                ) &&
                  !(n === f.start && void 0 !== t.buttons && 1 < t.buttons) &&
                  (!s.hover || !t.buttons) &&
                  (d || t.preventDefault(), (t.calcPoint = t.points[b.ort]), void o(t, s)))
              );
              var e, r;
            },
            r = [];
          return (
            n.split(' ').forEach(function (t) {
              i.addEventListener(t, e, !!d && { passive: !0 }), r.push([t, e]);
            }),
            r
          );
        }
        function q(t) {
          var e,
            r,
            n,
            i,
            o,
            s,
            a =
              (100 *
                (t -
                  ((e = l),
                  (r = b.ort),
                  (n = e.getBoundingClientRect()),
                  (i = e.ownerDocument),
                  (o = i.documentElement),
                  (s = gt(i)),
                  /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (s.x = 0),
                  r ? n.top + s.y - o.clientTop : n.left + s.x - o.clientLeft))) /
              T();
          return (a = ft(a)), b.dir ? 100 - a : a;
        }
        function X(t, e) {
          'mouseout' === t.type &&
            'HTML' === t.target.nodeName &&
            null === t.relatedTarget &&
            _(t, e);
        }
        function Y(t, e) {
          if (
            -1 === navigator.appVersion.indexOf('MSIE 9') &&
            0 === t.buttons &&
            0 !== e.buttonsProperty
          )
            return _(t, e);
          var r = (b.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
          Z(0 < r, (100 * r) / e.baseSize, e.locations, e.handleNumbers);
        }
        function _(t, e) {
          e.handle && (mt(e.handle, b.cssClasses.active), (g -= 1)),
            e.listeners.forEach(function (t) {
              E.removeEventListener(t[0], t[1]);
            }),
            0 === g &&
              (mt(h, b.cssClasses.drag),
              et(),
              t.cursor && ((C.style.cursor = ''), C.removeEventListener('selectstart', ct))),
            e.handleNumbers.forEach(function (t) {
              J('change', t), J('set', t), J('end', t);
            });
        }
        function I(t, e) {
          if (e.handleNumbers.some(L)) return !1;
          var r;
          1 === e.handleNumbers.length &&
            ((r = u[e.handleNumbers[0]].children[0]), (g += 1), ht(r, b.cssClasses.active));
          t.stopPropagation();
          var n = [],
            i = B(f.move, E, Y, {
              target: t.target,
              handle: r,
              listeners: n,
              startCalcPoint: t.calcPoint,
              baseSize: T(),
              pageOffset: t.pageOffset,
              handleNumbers: e.handleNumbers,
              buttonsProperty: t.buttons,
              locations: S.slice(),
            }),
            o = B(f.end, E, _, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            }),
            s = B('mouseout', E, X, {
              target: t.target,
              handle: r,
              listeners: n,
              doNotReject: !0,
              handleNumbers: e.handleNumbers,
            });
          n.push.apply(n, i.concat(o, s)),
            t.cursor &&
              ((C.style.cursor = getComputedStyle(t.target).cursor),
              1 < u.length && ht(h, b.cssClasses.drag),
              C.addEventListener('selectstart', ct, !1)),
            e.handleNumbers.forEach(function (t) {
              J('start', t);
            });
        }
        function n(t) {
          if (!t.buttons && !t.touches) return !1;
          t.stopPropagation();
          var i,
            o,
            s,
            e = q(t.calcPoint),
            r =
              ((i = e),
              (s = !(o = 100)),
              u.forEach(function (t, e) {
                if (!L(e)) {
                  var r = S[e],
                    n = Math.abs(r - i);
                  (n < o || (n <= o && r < i) || (100 === n && 100 === o)) &&
                    ((s = e), (o = n));
                }
              }),
              s);
          if (!1 === r) return !1;
          b.events.snap || pt(h, b.cssClasses.tap, b.animationDuration),
            rt(r, e, !0, !0),
            et(),
            J('slide', r, !0),
            J('update', r, !0),
            J('change', r, !0),
            J('set', r, !0),
            b.events.snap && I(t, { handleNumbers: [r] });
        }
        function W(t) {
          var e = q(t.calcPoint),
            r = y.getStep(e),
            n = y.fromStepping(r);
          Object.keys(v).forEach(function (t) {
            'hover' === t.split('.')[0] &&
              v[t].forEach(function (t) {
                t.call(a, n);
              });
          });
        }
        function $(t, e) {
          (v[t] = v[t] || []),
            v[t].push(e),
            'update' === t.split('.')[0] &&
              u.forEach(function (t, e) {
                J('update', e);
              });
        }
        function G(t) {
          var n = t && t.split('.')[0],
            i = n && t.substring(n.length);
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0],
              r = t.substring(e.length);
            (n && n !== e) || (i && i !== r) || delete v[t];
          });
        }
        function J(r, n, i) {
          Object.keys(v).forEach(function (t) {
            var e = t.split('.')[0];
            r === e &&
              v[t].forEach(function (t) {
                t.call(a, x.map(b.format.to), n, x.slice(), i || !1, S.slice(), a);
              });
          });
        }
        function K(t, e, r, n, i, o) {
          var s;
          return (
            1 < u.length &&
              !b.events.unconstrained &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.margin, 0)), (r = Math.max(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.margin, 1)), (r = Math.min(r, s)))),
            1 < u.length &&
              b.limit &&
              (n &&
                0 < e &&
                ((s = y.getAbsoluteDistance(t[e - 1], b.limit, 0)), (r = Math.min(r, s))),
              i &&
                e < u.length - 1 &&
                ((s = y.getAbsoluteDistance(t[e + 1], b.limit, 1)), (r = Math.max(r, s)))),
            b.padding &&
              (0 === e &&
                ((s = y.getAbsoluteDistance(0, b.padding[0], 0)), (r = Math.max(r, s))),
              e === u.length - 1 &&
                ((s = y.getAbsoluteDistance(100, b.padding[1], 1)), (r = Math.min(r, s)))),
            !((r = ft((r = y.getStep(r)))) === t[e] && !o) && r
          );
        }
        function Q(t, e) {
          var r = b.ort;
          return (r ? e : t) + ', ' + (r ? t : e);
        }
        function Z(t, n, r, e) {
          var i = r.slice(),
            o = [!t, t],
            s = [t, !t];
          (e = e.slice()),
            t && e.reverse(),
            1 < e.length
              ? e.forEach(function (t, e) {
                  var r = K(i, t, i[t] + n, o[e], s[e], !1);
                  !1 === r ? (n = 0) : ((n = r - i[t]), (i[t] = r));
                })
              : (o = s = [!0]);
          var a = !1;
          e.forEach(function (t, e) {
            a = rt(t, r[t] + n, o[e], s[e]) || a;
          }),
            a &&
              e.forEach(function (t) {
                J('update', t), J('slide', t);
              });
        }
        function tt(t, e) {
          return b.dir ? 100 - t - e : t;
        }
        function et() {
          m.forEach(function (t) {
            var e = 50 < S[t] ? -1 : 1,
              r = 3 + (u.length + e * t);
            u[t].style.zIndex = r;
          });
        }
        function rt(t, e, r, n) {
          return (
            !1 !== (e = K(S, t, e, r, n, !1)) &&
            ((function (t, e) {
              (S[t] = e), (x[t] = y.fromStepping(e));
              var r = 'translate(' + Q(10 * (tt(e, 0) - A) + '%', '0') + ')';
              (u[t].style[b.transformRule] = r), nt(t), nt(t + 1);
            })(t, e),
            !0)
          );
        }
        function nt(t) {
          if (s[t]) {
            var e = 0,
              r = 100;
            0 !== t && (e = S[t - 1]), t !== s.length - 1 && (r = S[t]);
            var n = r - e,
              i = 'translate(' + Q(tt(e, n) + '%', '0') + ')',
              o = 'scale(' + Q(n / 100, '1') + ')';
            s[t].style[b.transformRule] = i + ' ' + o;
          }
        }
        function it(t, e) {
          return null === t || !1 === t || void 0 === t
            ? S[e]
            : ('number' == typeof t && (t = String(t)),
              (t = b.format.from(t)),
              !1 === (t = y.toStepping(t)) || isNaN(t) ? S[e] : t);
        }
        function ot(t, e) {
          var r = dt(t),
            n = void 0 === S[0];
          (e = void 0 === e || !!e),
            b.animate && !n && pt(h, b.cssClasses.tap, b.animationDuration),
            m.forEach(function (t) {
              rt(t, it(r[t], t), !0, !1);
            });
          for (var i = 1 === m.length ? 0 : 1; i < m.length; ++i)
            m.forEach(function (t) {
              rt(t, S[t], !0, !0);
            });
          et(),
            m.forEach(function (t) {
              J('update', t), null !== r[t] && e && J('set', t);
            });
        }
        function st() {
          var t = x.map(b.format.to);
          return 1 === t.length ? t[0] : t;
        }
        function at(t) {
          var e = S[t],
            r = y.getNearbySteps(e),
            n = x[t],
            i = r.thisStep.step,
            o = null;
          if (b.snap)
            return [n - r.stepBefore.startValue || null, r.stepAfter.startValue - n || null];
          !1 !== i && n + i > r.stepAfter.startValue && (i = r.stepAfter.startValue - n),
            (o =
              n > r.thisStep.startValue
                ? r.thisStep.step
                : !1 !== r.stepBefore.step && n - r.stepBefore.highestStep),
            100 === e ? (i = null) : 0 === e && (o = null);
          var s = y.countStepDecimals();
          return (
            null !== i && !1 !== i && (i = Number(i.toFixed(s))),
            null !== o && !1 !== o && (o = Number(o.toFixed(s))),
            [o, i]
          );
        }
        return (
          ht((e = h), b.cssClasses.target),
          0 === b.dir ? ht(e, b.cssClasses.ltr) : ht(e, b.cssClasses.rtl),
          0 === b.ort ? ht(e, b.cssClasses.horizontal) : ht(e, b.cssClasses.vertical),
          ht(
            e,
            'rtl' === getComputedStyle(e).direction
              ? b.cssClasses.textDirectionRtl
              : b.cssClasses.textDirectionLtr,
          ),
          (l = V(e, b.cssClasses.base)),
          (function (t, e) {
            var r = V(e, b.cssClasses.connects);
            (u = []), (s = []).push(M(r, t[0]));
            for (var n = 0; n < b.handles; n++)
              u.push(D(e, n)), (m[n] = n), s.push(M(r, t[n + 1]));
          })(b.connect, l),
          (p = b.events).fixed ||
            u.forEach(function (t, e) {
              B(f.start, t.children[0], I, { handleNumbers: [e] });
            }),
          p.tap && B(f.start, l, n, {}),
          p.hover && B(f.move, l, W, { hover: !0 }),
          p.drag &&
            s.forEach(function (t, e) {
              if (!1 !== t && 0 !== e && e !== s.length - 1) {
                var r = u[e - 1],
                  n = u[e],
                  i = [t];
                ht(t, b.cssClasses.draggable),
                  p.fixed && (i.push(r.children[0]), i.push(n.children[0])),
                  i.forEach(function (t) {
                    B(f.start, t, I, { handles: [r, n], handleNumbers: [e - 1, e] });
                  });
              }
            }),
          ot(b.start),
          b.pips && R(b.pips),
          b.tooltips && H(),
          $('update', function (t, e, s, r, a) {
            m.forEach(function (t) {
              var e = u[t],
                r = K(S, t, 0, !0, !0, !0),
                n = K(S, t, 100, !0, !0, !0),
                i = a[t],
                o = b.ariaFormat.to(s[t]);
              (r = y.fromStepping(r).toFixed(1)),
                (n = y.fromStepping(n).toFixed(1)),
                (i = y.fromStepping(i).toFixed(1)),
                e.children[0].setAttribute('aria-valuemin', r),
                e.children[0].setAttribute('aria-valuemax', n),
                e.children[0].setAttribute('aria-valuenow', i),
                e.children[0].setAttribute('aria-valuetext', o);
            });
          }),
          (a = {
            destroy: function () {
              for (var t in b.cssClasses)
                b.cssClasses.hasOwnProperty(t) && mt(h, b.cssClasses[t]);
              for (; h.firstChild; ) h.removeChild(h.firstChild);
              delete h.noUiSlider;
            },
            steps: function () {
              return m.map(at);
            },
            on: $,
            off: G,
            get: st,
            set: ot,
            setHandle: function (t, e, r) {
              if (!(0 <= (t = Number(t)) && t < m.length))
                throw new Error('noUiSlider (' + lt + '): invalid handle number, got: ' + t);
              rt(t, it(e, t), !0, !0), J('update', t), r && J('set', t);
            },
            reset: function (t) {
              ot(b.start, t);
            },
            __moveHandles: function (t, e, r) {
              Z(t, e, S, r);
            },
            options: o,
            updateOptions: function (e, t) {
              var r = st(),
                n = [
                  'margin',
                  'limit',
                  'padding',
                  'range',
                  'animate',
                  'snap',
                  'step',
                  'format',
                  'pips',
                  'tooltips',
                ];
              n.forEach(function (t) {
                void 0 !== e[t] && (o[t] = e[t]);
              });
              var i = vt(o);
              n.forEach(function (t) {
                void 0 !== e[t] && (b[t] = i[t]);
              }),
                (y = i.spectrum),
                (b.margin = i.margin),
                (b.limit = i.limit),
                (b.padding = i.padding),
                b.pips ? R(b.pips) : F(),
                b.tooltips ? H() : z(),
                (S = []),
                ot(e.start || r, t);
            },
            target: h,
            removePips: F,
            removeTooltips: z,
            getTooltips: function () {
              return i;
            },
            getOrigins: function () {
              return u;
            },
            pips: R,
          })
        );
      }
      return {
        __spectrum: i,
        version: lt,
        cssClasses: d,
        create: function (t, e) {
          if (!t || !t.nodeName)
            throw new Error(
              'noUiSlider (' + lt + '): create requires a single element, got: ' + t,
            );
          if (t.noUiSlider)
            throw new Error('noUiSlider (' + lt + '): Slider was already initialized.');
          var r = j(t, vt(e), e);
          return (t.noUiSlider = r);
        },
      };
    });
    });

    /* node_modules\svelte-materialify\dist\components\Slider\Slider.svelte generated by Svelte v3.29.7 */
    const file$6 = "node_modules\\svelte-materialify\\dist\\components\\Slider\\Slider.svelte";
    const get_append_outer_slot_changes$2 = dirty => ({});
    const get_append_outer_slot_context$2 = ctx => ({ slot: "append-outer" });
    const get_prepend_outer_slot_changes$2 = dirty => ({});
    const get_prepend_outer_slot_context$2 = ctx => ({ slot: "prepend-outer" });

    // (110:2) <slot slot="prepend-outer" name="prepend-outer" />   <label class="s-slider__label" class:inverse-label={inverseLabel}
    function create_prepend_outer_slot$1(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[19]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[21], get_prepend_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_prepend_outer_slot_changes$2, get_prepend_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$1.name,
    		type: "slot",
    		source: "(110:2) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />   <label class=\\\"s-slider__label\\\" class:inverse-label={inverseLabel}",
    		ctx
    	});

    	return block;
    }

    // (119:2) <slot slot="append-outer" name="append-outer" /> </Input> 
    function create_append_outer_slot$1(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[19]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[21], get_append_outer_slot_context$2);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_append_outer_slot_changes$2, get_append_outer_slot_context$2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$1.name,
    		type: "slot",
    		source: "(119:2) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" /> </Input> ",
    		ctx
    	});

    	return block;
    }

    // (108:0) <Input class="s-slider" {color} {readonly} {disabled} {hint}>
    function create_default_slot$1(ctx) {
    	let t0;
    	let label;
    	let t1;
    	let div;
    	let t2;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			t0 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			attr_dev(label, "class", "s-slider__label");
    			toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			add_location(label, file$6, 110, 2, 6588);
    			attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			attr_dev(div, "style", /*style*/ ctx[6]);
    			toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			add_location(div, file$6, 111, 2, 6673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[20](div);
    			insert_dev(target, t2, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}

    			if (dirty & /*inverseLabel*/ 4) {
    				toggle_class(label, "inverse-label", /*inverseLabel*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 16) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (!current || dirty & /*style*/ 64) {
    				attr_dev(div, "style", /*style*/ ctx[6]);
    			}

    			if (dirty & /*persistentThumb*/ 2) {
    				toggle_class(div, "persistent-thumb", /*persistentThumb*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[20](null);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(108:0) <Input class=\\\"s-slider\\\" {color} {readonly} {disabled} {hint}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let input;
    	let current;

    	input = new Input({
    			props: {
    				class: "s-slider",
    				color: /*color*/ ctx[0],
    				readonly: /*readonly*/ ctx[3],
    				disabled: /*disabled*/ ctx[4],
    				hint: /*hint*/ ctx[5],
    				$$slots: {
    					default: [create_default_slot$1],
    					"append-outer": [create_append_outer_slot$1],
    					"prepend-outer": [create_prepend_outer_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*color*/ 1) input_changes.color = /*color*/ ctx[0];
    			if (dirty & /*readonly*/ 8) input_changes.readonly = /*readonly*/ ctx[3];
    			if (dirty & /*disabled*/ 16) input_changes.disabled = /*disabled*/ ctx[4];
    			if (dirty & /*hint*/ 32) input_changes.hint = /*hint*/ ctx[5];

    			if (dirty & /*$$scope, disabled, style, sliderElement, persistentThumb, inverseLabel*/ 2097366) {
    				input_changes.$$scope = { dirty, ctx };
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function format$2(val) {
    	if (Array.isArray(val)) {
    		if (val.length === 1) return Number(val[0]);
    		return val.map(v => Number(v));
    	}

    	return Number(val);
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Slider", slots, ['prepend-outer','default','append-outer']);
    	let sliderElement;
    	let slider;
    	let localValue;
    	const dispatch = createEventDispatcher();
    	let { min = 0 } = $$props;
    	let { max = 100 } = $$props;
    	let { value = (min + max) / 2 } = $$props;
    	let { connect = Array.isArray(value) ? true : "lower" } = $$props;
    	let { color = "primary" } = $$props;
    	let { step = null } = $$props;
    	let { margin = null } = $$props;
    	let { limit = null } = $$props;
    	let { padding = null } = $$props;
    	let { thumb = false } = $$props;
    	let { persistentThumb = false } = $$props;
    	let { thumbClass = "primary-color" } = $$props;
    	let { vertical = false } = $$props;
    	let { inverseLabel = false } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = null } = $$props;
    	let { hint = "" } = $$props;
    	let { style = null } = $$props;

    	function tooltip() {
    		if (Array.isArray(thumb)) {
    			return thumb.map(x => {
    				if (typeof x === "function") return { to: x };
    				return x;
    			});
    		}

    		if (typeof thumb === "function") {
    			return { to: thumb };
    		}

    		return thumb;
    	}

    	onMount(() => {
    		nouislider_min.cssClasses.tooltip = `tooltip ${thumbClass}`;

    		nouislider_min.create(sliderElement, {
    			cssPrefix: "s-slider__",
    			format: {
    				to: v => Math.round(v),
    				from: v => Number(v)
    			},
    			start: value,
    			connect,
    			margin,
    			limit,
    			padding,
    			range: { min, max },
    			orientation: vertical ? "vertical" : "horizontal",
    			step,
    			tooltips: tooltip()
    		});

    		$$invalidate(22, slider = sliderElement.noUiSlider);

    		slider.on("update", (val, handle) => {
    			$$invalidate(8, value = format$2(val));
    			localValue = value;
    			dispatch("update", { value: val, handle });
    		});

    		slider.on("change", (val, handle) => {
    			dispatch("change", { value: val, handle });
    		});

    		return () => {
    			slider.destroy();
    		};
    	});

    	afterUpdate(() => {
    		if (value !== localValue) slider.set(value, false);
    	});

    	const writable_props = [
    		"min",
    		"max",
    		"value",
    		"connect",
    		"color",
    		"step",
    		"margin",
    		"limit",
    		"padding",
    		"thumb",
    		"persistentThumb",
    		"thumbClass",
    		"vertical",
    		"inverseLabel",
    		"readonly",
    		"disabled",
    		"hint",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(7, sliderElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("min" in $$props) $$invalidate(9, min = $$props.min);
    		if ("max" in $$props) $$invalidate(10, max = $$props.max);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(11, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(12, step = $$props.step);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("hint" in $$props) $$invalidate(5, hint = $$props.hint);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		noUiSlider: nouislider_min,
    		Input,
    		onMount,
    		afterUpdate,
    		createEventDispatcher,
    		sliderElement,
    		slider,
    		localValue,
    		dispatch,
    		min,
    		max,
    		value,
    		connect,
    		color,
    		step,
    		margin,
    		limit,
    		padding,
    		thumb,
    		persistentThumb,
    		thumbClass,
    		vertical,
    		inverseLabel,
    		readonly,
    		disabled,
    		hint,
    		style,
    		format: format$2,
    		tooltip
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(7, sliderElement = $$props.sliderElement);
    		if ("slider" in $$props) $$invalidate(22, slider = $$props.slider);
    		if ("localValue" in $$props) localValue = $$props.localValue;
    		if ("min" in $$props) $$invalidate(9, min = $$props.min);
    		if ("max" in $$props) $$invalidate(10, max = $$props.max);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("connect" in $$props) $$invalidate(11, connect = $$props.connect);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("step" in $$props) $$invalidate(12, step = $$props.step);
    		if ("margin" in $$props) $$invalidate(13, margin = $$props.margin);
    		if ("limit" in $$props) $$invalidate(14, limit = $$props.limit);
    		if ("padding" in $$props) $$invalidate(15, padding = $$props.padding);
    		if ("thumb" in $$props) $$invalidate(16, thumb = $$props.thumb);
    		if ("persistentThumb" in $$props) $$invalidate(1, persistentThumb = $$props.persistentThumb);
    		if ("thumbClass" in $$props) $$invalidate(17, thumbClass = $$props.thumbClass);
    		if ("vertical" in $$props) $$invalidate(18, vertical = $$props.vertical);
    		if ("inverseLabel" in $$props) $$invalidate(2, inverseLabel = $$props.inverseLabel);
    		if ("readonly" in $$props) $$invalidate(3, readonly = $$props.readonly);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("hint" in $$props) $$invalidate(5, hint = $$props.hint);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slider, min, max, vertical, connect, margin, limit, padding*/ 4517376) {
    			 {
    				if (slider != null) {
    					slider.updateOptions({
    						range: { min, max },
    						orientation: vertical ? "vertical" : "horizontal",
    						connect,
    						margin,
    						limit,
    						padding
    					});
    				}
    			}
    		}
    	};

    	return [
    		color,
    		persistentThumb,
    		inverseLabel,
    		readonly,
    		disabled,
    		hint,
    		style,
    		sliderElement,
    		value,
    		min,
    		max,
    		connect,
    		step,
    		margin,
    		limit,
    		padding,
    		thumb,
    		thumbClass,
    		vertical,
    		slots,
    		div_binding,
    		$$scope
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			min: 9,
    			max: 10,
    			value: 8,
    			connect: 11,
    			color: 0,
    			step: 12,
    			margin: 13,
    			limit: 14,
    			padding: 15,
    			thumb: 16,
    			persistentThumb: 1,
    			thumbClass: 17,
    			vertical: 18,
    			inverseLabel: 2,
    			readonly: 3,
    			disabled: 4,
    			hint: 5,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get connect() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set connect(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get step() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set step(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get limit() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set limit(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistentThumb() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistentThumb(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbClass() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbClass(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverseLabel() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverseLabel(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get readonly() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set readonly(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* node_modules\svelte-materialify\dist\components\Menu\Menu.svelte generated by Svelte v3.29.7 */
    const file$7 = "node_modules\\svelte-materialify\\dist\\components\\Menu\\Menu.svelte";
    const get_activator_slot_changes = dirty => ({});
    const get_activator_slot_context = ctx => ({});

    // (122:2) {#if active}
    function create_if_block$2(ctx) {
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-menu " + /*klass*/ ctx[1]);
    			attr_dev(div, "role", "menu");
    			attr_dev(div, "style", div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]));
    			toggle_class(div, "tile", /*tile*/ ctx[5]);
    			add_location(div, file$7, 122, 4, 3584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*menuClick*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*klass*/ 2 && div_class_value !== (div_class_value = "s-menu " + /*klass*/ ctx[1])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*position, origin, index, style*/ 960 && div_style_value !== (div_style_value = "" + (/*position*/ ctx[9] + ";transform-origin:" + /*origin*/ ctx[8] + ";z-index:" + /*index*/ ctx[6] + ";" + /*style*/ ctx[7]))) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty[0] & /*klass, tile*/ 34) {
    				toggle_class(div, "tile", /*tile*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*transition*/ ctx[2], /*inOpts*/ ctx[3]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*transition*/ ctx[2], /*outOpts*/ ctx[4]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(122:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let t;
    	let ClickOutside_action;
    	let current;
    	let mounted;
    	let dispose;
    	const activator_slot_template = /*#slots*/ ctx[26].activator;
    	const activator_slot = create_slot(activator_slot_template, ctx, /*$$scope*/ ctx[25], get_activator_slot_context);
    	let if_block = /*active*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (activator_slot) activator_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "s-menu__wrapper");
    			add_location(div, file$7, 113, 0, 3383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (activator_slot) {
    				activator_slot.m(div, null);
    			}

    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[27](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(ClickOutside_action = ClickOutside.call(null, div)),
    					listen_dev(div, "clickOutside", /*clickOutsideMenu*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (activator_slot) {
    				if (activator_slot.p && dirty[0] & /*$$scope*/ 33554432) {
    					update_slot(activator_slot, activator_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_activator_slot_changes, get_activator_slot_context);
    				}
    			}

    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(activator_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(activator_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (activator_slot) activator_slot.d(detaching);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, ['activator','default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { absolute = false } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 200 } } = $$props;
    	let { offsetX = false } = $$props;
    	let { offsetY = true } = $$props;
    	let { nudgeX = 0 } = $$props;
    	let { nudgeY = 0 } = $$props;
    	let { openOnClick = true } = $$props;
    	let { hover = false } = $$props;
    	let { closeOnClickOutside = true } = $$props;
    	let { closeOnClick = true } = $$props;
    	let { bottom = false } = $$props;
    	let { right = false } = $$props;
    	let { tile = false } = $$props;
    	let { disabled = false } = $$props;
    	let { index = 8 } = $$props;
    	let { style = "" } = $$props;
    	let origin = "top left";
    	let position;
    	let wrapper;
    	const dispatch = createEventDispatcher();

    	const align = {
    		x: right ? "right" : "left",
    		y: bottom ? "bottom" : "top"
    	};

    	setContext("S_ListItemRole", "menuitem");
    	setContext("S_ListItemRipple", true);

    	// For opening the menu
    	function open(posX = 0, posY = 0) {
    		$$invalidate(0, active = true);
    		const rect = wrapper.getBoundingClientRect();
    		let x = nudgeX;
    		let y = nudgeY;

    		if (absolute) {
    			x += posX;
    			y += posY;
    		} else {
    			if (offsetX) x += rect.width;
    			if (offsetY) y += rect.height;
    		}

    		$$invalidate(9, position = `${align.y}:${y}px;${align.x}:${x}px`);
    		$$invalidate(8, origin = `${align.y} ${align.x}`);

    		/**
     * Event when menu is opened.
     * @returns Nothing
     */
    		dispatch("open");
    	}

    	// For closing the menu.
    	function close() {
    		$$invalidate(0, active = false);

    		/**
     * Event when menu is closed.
     * @returns Nothing
     */
    		dispatch("close");
    	}

    	// When the activator slot is clicked.
    	function triggerClick(e) {
    		if (!disabled) {
    			if (active) {
    				close();
    			} else if (openOnClick) {
    				open(e.offsetX, e.offsetY);
    			}
    		}
    	}

    	// When the menu itself is clicked.
    	function menuClick() {
    		if (active && closeOnClick) close();
    	}

    	// When user clicked somewhere outside the menu.
    	function clickOutsideMenu() {
    		if (active && closeOnClickOutside) close();
    	}

    	onMount(() => {
    		const trigger = wrapper.querySelector("[slot='activator']");

    		// Opening the menu if active is set to true.
    		if (active) open();

    		trigger.addEventListener("click", triggerClick, { passive: true });

    		if (hover) {
    			wrapper.addEventListener("mouseenter", open, { passive: true });
    			wrapper.addEventListener("mouseleave", close, { passive: true });
    		}

    		return () => {
    			trigger.removeEventListener("click", triggerClick);

    			if (hover) {
    				wrapper.removeEventListener("mouseenter", open);
    				wrapper.removeEventListener("mouseleave", close);
    			}
    		};
    	});

    	const writable_props = [
    		"class",
    		"active",
    		"absolute",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"offsetX",
    		"offsetY",
    		"nudgeX",
    		"nudgeY",
    		"openOnClick",
    		"hover",
    		"closeOnClickOutside",
    		"closeOnClick",
    		"bottom",
    		"right",
    		"tile",
    		"disabled",
    		"index",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrapper = $$value;
    			$$invalidate(10, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ClickOutside,
    		onMount,
    		setContext,
    		createEventDispatcher,
    		fade,
    		klass,
    		active,
    		absolute,
    		transition,
    		inOpts,
    		outOpts,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		tile,
    		disabled,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		dispatch,
    		align,
    		open,
    		close,
    		triggerClick,
    		menuClick,
    		clickOutsideMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("absolute" in $$props) $$invalidate(13, absolute = $$props.absolute);
    		if ("transition" in $$props) $$invalidate(2, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(3, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(4, outOpts = $$props.outOpts);
    		if ("offsetX" in $$props) $$invalidate(14, offsetX = $$props.offsetX);
    		if ("offsetY" in $$props) $$invalidate(15, offsetY = $$props.offsetY);
    		if ("nudgeX" in $$props) $$invalidate(16, nudgeX = $$props.nudgeX);
    		if ("nudgeY" in $$props) $$invalidate(17, nudgeY = $$props.nudgeY);
    		if ("openOnClick" in $$props) $$invalidate(18, openOnClick = $$props.openOnClick);
    		if ("hover" in $$props) $$invalidate(19, hover = $$props.hover);
    		if ("closeOnClickOutside" in $$props) $$invalidate(20, closeOnClickOutside = $$props.closeOnClickOutside);
    		if ("closeOnClick" in $$props) $$invalidate(21, closeOnClick = $$props.closeOnClick);
    		if ("bottom" in $$props) $$invalidate(22, bottom = $$props.bottom);
    		if ("right" in $$props) $$invalidate(23, right = $$props.right);
    		if ("tile" in $$props) $$invalidate(5, tile = $$props.tile);
    		if ("disabled" in $$props) $$invalidate(24, disabled = $$props.disabled);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("origin" in $$props) $$invalidate(8, origin = $$props.origin);
    		if ("position" in $$props) $$invalidate(9, position = $$props.position);
    		if ("wrapper" in $$props) $$invalidate(10, wrapper = $$props.wrapper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		tile,
    		index,
    		style,
    		origin,
    		position,
    		wrapper,
    		menuClick,
    		clickOutsideMenu,
    		absolute,
    		offsetX,
    		offsetY,
    		nudgeX,
    		nudgeY,
    		openOnClick,
    		hover,
    		closeOnClickOutside,
    		closeOnClick,
    		bottom,
    		right,
    		disabled,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				class: 1,
    				active: 0,
    				absolute: 13,
    				transition: 2,
    				inOpts: 3,
    				outOpts: 4,
    				offsetX: 14,
    				offsetY: 15,
    				nudgeX: 16,
    				nudgeY: 17,
    				openOnClick: 18,
    				hover: 19,
    				closeOnClickOutside: 20,
    				closeOnClick: 21,
    				bottom: 22,
    				right: 23,
    				tile: 5,
    				disabled: 24,
    				index: 6,
    				style: 7
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offsetY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offsetY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeX() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeX(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nudgeY() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nudgeY(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set openOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClickOutside() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClickOutside(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnClick() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnClick(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItem.svelte generated by Svelte v3.29.7 */
    const file$8 = "node_modules\\svelte-materialify\\dist\\components\\List\\ListItem.svelte";
    const get_append_slot_changes$1 = dirty => ({});
    const get_append_slot_context$1 = ctx => ({});
    const get_subtitle_slot_changes = dirty => ({});
    const get_subtitle_slot_context = ctx => ({});
    const get_prepend_slot_changes$1 = dirty => ({});
    const get_prepend_slot_context$1 = ctx => ({});

    function create_fragment$8(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_class_value;
    	let div3_tabindex_value;
    	let div3_aria_selected_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[14].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[13], get_prepend_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[13], null);
    	const subtitle_slot_template = /*#slots*/ ctx[14].subtitle;
    	const subtitle_slot = create_slot(subtitle_slot_template, ctx, /*$$scope*/ ctx[13], get_subtitle_slot_context);
    	const append_slot_template = /*#slots*/ ctx[14].append;
    	const append_slot = create_slot(append_slot_template, ctx, /*$$scope*/ ctx[13], get_append_slot_context$1);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (subtitle_slot) subtitle_slot.c();
    			t2 = space();
    			if (append_slot) append_slot.c();
    			attr_dev(div0, "class", "s-list-item__title");
    			add_location(div0, file$8, 56, 4, 4907);
    			attr_dev(div1, "class", "s-list-item__subtitle");
    			add_location(div1, file$8, 59, 4, 4970);
    			attr_dev(div2, "class", "s-list-item__content");
    			add_location(div2, file$8, 55, 2, 4868);
    			attr_dev(div3, "class", div3_class_value = "s-list-item " + /*klass*/ ctx[1]);
    			attr_dev(div3, "role", /*role*/ ctx[10]);
    			attr_dev(div3, "tabindex", div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1);
    			attr_dev(div3, "aria-selected", div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null);
    			attr_dev(div3, "style", /*style*/ ctx[9]);
    			toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			toggle_class(div3, "link", /*link*/ ctx[6]);
    			toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			add_location(div3, file$8, 39, 0, 4535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (prepend_slot) {
    				prepend_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (subtitle_slot) {
    				subtitle_slot.m(div1, null);
    			}

    			append_dev(div3, t2);

    			if (append_slot) {
    				append_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, div3, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]])),
    					action_destroyer(Ripple_action = Ripple.call(null, div3, /*ripple*/ ctx[8])),
    					listen_dev(div3, "click", /*click*/ ctx[11], false, false, false),
    					listen_dev(div3, "click", /*click_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (prepend_slot) {
    				if (prepend_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(prepend_slot, prepend_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_prepend_slot_changes$1, get_prepend_slot_context$1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[13], dirty, null, null);
    				}
    			}

    			if (subtitle_slot) {
    				if (subtitle_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(subtitle_slot, subtitle_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_subtitle_slot_changes, get_subtitle_slot_context);
    				}
    			}

    			if (append_slot) {
    				if (append_slot.p && dirty & /*$$scope*/ 8192) {
    					update_slot(append_slot, append_slot_template, ctx, /*$$scope*/ ctx[13], dirty, get_append_slot_changes$1, get_append_slot_context$1);
    				}
    			}

    			if (!current || dirty & /*klass*/ 2 && div3_class_value !== (div3_class_value = "s-list-item " + /*klass*/ ctx[1])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*link*/ 64 && div3_tabindex_value !== (div3_tabindex_value = /*link*/ ctx[6] ? 0 : -1)) {
    				attr_dev(div3, "tabindex", div3_tabindex_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div3_aria_selected_value !== (div3_aria_selected_value = /*role*/ ctx[10] === "option" ? /*active*/ ctx[0] : null)) {
    				attr_dev(div3, "aria-selected", div3_aria_selected_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(div3, "style", /*style*/ ctx[9]);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 5) Class_action.update.call(null, [/*active*/ ctx[0] && /*activeClass*/ ctx[2]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 256) Ripple_action.update.call(null, /*ripple*/ ctx[8]);

    			if (dirty & /*klass, dense*/ 10) {
    				toggle_class(div3, "dense", /*dense*/ ctx[3]);
    			}

    			if (dirty & /*klass, disabled*/ 18) {
    				toggle_class(div3, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*klass, multiline*/ 34) {
    				toggle_class(div3, "multiline", /*multiline*/ ctx[5]);
    			}

    			if (dirty & /*klass, link*/ 66) {
    				toggle_class(div3, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, selectable*/ 130) {
    				toggle_class(div3, "selectable", /*selectable*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(subtitle_slot, local);
    			transition_in(append_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(subtitle_slot, local);
    			transition_out(append_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (subtitle_slot) subtitle_slot.d(detaching);
    			if (append_slot) append_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItem", slots, ['prepend','default','subtitle','append']);
    	const role = getContext("S_ListItemRole");
    	const ITEM_GROUP = getContext("S_ListItemGroup");

    	const DEFAULTS = {
    		select: () => null,
    		register: () => null,
    		index: () => null,
    		activeClass: "active"
    	};

    	const ITEM = ITEM_GROUP ? getContext(ITEM_GROUP) : DEFAULTS;
    	let { class: klass = "" } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { active = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = null } = $$props;
    	let { multiline = false } = $$props;
    	let { link = role } = $$props;
    	let { selectable = !link } = $$props;
    	let { ripple = getContext("S_ListItemRipple") || role || false } = $$props;
    	let { style = null } = $$props;

    	ITEM.register(values => {
    		$$invalidate(0, active = values.includes(value));
    	});

    	function click() {
    		if (!disabled) ITEM.select(value);
    	}

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"active",
    		"dense",
    		"disabled",
    		"multiline",
    		"link",
    		"selectable",
    		"ripple",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(13, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		Ripple,
    		Class,
    		role,
    		ITEM_GROUP,
    		DEFAULTS,
    		ITEM,
    		klass,
    		activeClass,
    		value,
    		active,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(12, value = $$props.value);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("dense" in $$props) $$invalidate(3, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("multiline" in $$props) $$invalidate(5, multiline = $$props.multiline);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("selectable" in $$props) $$invalidate(7, selectable = $$props.selectable);
    		if ("ripple" in $$props) $$invalidate(8, ripple = $$props.ripple);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		activeClass,
    		dense,
    		disabled,
    		multiline,
    		link,
    		selectable,
    		ripple,
    		style,
    		role,
    		click,
    		value,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class ListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 1,
    			activeClass: 2,
    			value: 12,
    			active: 0,
    			dense: 3,
    			disabled: 4,
    			multiline: 5,
    			link: 6,
    			selectable: 7,
    			ripple: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItem",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectable() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectable(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\List\ListItemGroup.svelte generated by Svelte v3.29.7 */

    // (20:0) <ItemGroup   class="s-list-item-group {klass}"   role="listbox"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(20:0) <ItemGroup   class=\\\"s-list-item-group {klass}\\\"   role=\\\"listbox\\\"   bind:value   {activeClass}   {multiple}   {mandatory}   {max}   {style}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[8].call(null, value);
    	}

    	let itemgroup_props = {
    		class: "s-list-item-group " + /*klass*/ ctx[1],
    		role: "listbox",
    		activeClass: /*activeClass*/ ctx[2],
    		multiple: /*multiple*/ ctx[3],
    		mandatory: /*mandatory*/ ctx[4],
    		max: /*max*/ ctx[5],
    		style: /*style*/ ctx[6],
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-list-item-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 4) itemgroup_changes.activeClass = /*activeClass*/ ctx[2];
    			if (dirty & /*multiple*/ 8) itemgroup_changes.multiple = /*multiple*/ ctx[3];
    			if (dirty & /*mandatory*/ 16) itemgroup_changes.mandatory = /*mandatory*/ ctx[4];
    			if (dirty & /*max*/ 32) itemgroup_changes.max = /*max*/ ctx[5];
    			if (dirty & /*style*/ 64) itemgroup_changes.style = /*style*/ ctx[6];

    			if (dirty & /*$$scope*/ 512) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ListItemGroup", slots, ['default']);
    	setContext("S_ListItemRole", "option");
    	setContext("S_ListItemGroup", ITEM_GROUP);
    	let { class: klass = "primary-text" } = $$props;
    	let { value = [] } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "value", "activeClass", "multiple", "mandatory", "max", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ListItemGroup> was created with unknown prop '${key}'`);
    	});

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		ItemGroup,
    		ITEM_GROUP,
    		klass,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(2, activeClass = $$props.activeClass);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(4, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(5, max = $$props.max);
    		if ("style" in $$props) $$invalidate(6, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		style,
    		slots,
    		itemgroup_value_binding,
    		$$scope
    	];
    }

    class ListItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 1,
    			value: 0,
    			activeClass: 2,
    			multiple: 3,
    			mandatory: 4,
    			max: 5,
    			style: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListItemGroup",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ListItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ListItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Chip\Chip.svelte generated by Svelte v3.29.7 */
    const file$9 = "node_modules\\svelte-materialify\\dist\\components\\Chip\\Chip.svelte";
    const get_close_icon_slot_changes = dirty => ({});
    const get_close_icon_slot_context = ctx => ({});

    // (38:0) {#if active}
    function create_if_block$3(ctx) {
    	let span;
    	let t;
    	let span_class_value;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block = /*close*/ ctx[8] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3]);
    			toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			toggle_class(span, "pill", /*pill*/ ctx[5]);
    			toggle_class(span, "link", /*link*/ ctx[6]);
    			toggle_class(span, "label", /*label*/ ctx[7]);
    			toggle_class(span, "selected", /*selected*/ ctx[2]);
    			add_location(span, file$9, 38, 2, 3527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(span, t);
    			if (if_block) if_block.m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Ripple_action = Ripple.call(null, span, /*link*/ ctx[6])),
    					listen_dev(span, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (/*close*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*close*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*klass, size*/ 10 && span_class_value !== (span_class_value = "s-chip " + /*klass*/ ctx[1] + " size-" + /*size*/ ctx[3])) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*link*/ 64) Ripple_action.update.call(null, /*link*/ ctx[6]);

    			if (dirty & /*klass, size, outlined*/ 26) {
    				toggle_class(span, "outlined", /*outlined*/ ctx[4]);
    			}

    			if (dirty & /*klass, size, pill*/ 42) {
    				toggle_class(span, "pill", /*pill*/ ctx[5]);
    			}

    			if (dirty & /*klass, size, link*/ 74) {
    				toggle_class(span, "link", /*link*/ ctx[6]);
    			}

    			if (dirty & /*klass, size, label*/ 138) {
    				toggle_class(span, "label", /*label*/ ctx[7]);
    			}

    			if (dirty & /*klass, size, selected*/ 14) {
    				toggle_class(span, "selected", /*selected*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(38:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if close}
    function create_if_block_1$2(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const close_icon_slot_template = /*#slots*/ ctx[11]["close-icon"];
    	const close_icon_slot = create_slot(close_icon_slot_template, ctx, /*$$scope*/ ctx[10], get_close_icon_slot_context);
    	const close_icon_slot_or_fallback = close_icon_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.c();
    			attr_dev(div, "class", "s-chip__close");
    			add_location(div, file$9, 49, 6, 3727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (close_icon_slot_or_fallback) {
    				close_icon_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClose*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (close_icon_slot) {
    				if (close_icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(close_icon_slot, close_icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_close_icon_slot_changes, get_close_icon_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(49:4) {#if close}",
    		ctx
    	});

    	return block;
    }

    // (51:32)            
    function fallback_block$1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: closeIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(51:32)            ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chip", slots, ['default','close-icon']);
    	let { class: klass = "" } = $$props;
    	let { active = true } = $$props;
    	let { selected = false } = $$props;
    	let { size = "default" } = $$props;
    	let { outlined = false } = $$props;
    	let { pill = false } = $$props;
    	let { link = false } = $$props;
    	let { label = false } = $$props;
    	let { close = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function onClose(e) {
    		$$invalidate(0, active = false);
    		dispatch("close", e);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"selected",
    		"size",
    		"outlined",
    		"pill",
    		"link",
    		"label",
    		"close"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chip> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Icon,
    		closeIcon,
    		createEventDispatcher,
    		klass,
    		active,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		dispatch,
    		onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("outlined" in $$props) $$invalidate(4, outlined = $$props.outlined);
    		if ("pill" in $$props) $$invalidate(5, pill = $$props.pill);
    		if ("link" in $$props) $$invalidate(6, link = $$props.link);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("close" in $$props) $$invalidate(8, close = $$props.close);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		klass,
    		selected,
    		size,
    		outlined,
    		pill,
    		link,
    		label,
    		close,
    		onClose,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Chip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 1,
    			active: 0,
    			selected: 2,
    			size: 3,
    			outlined: 4,
    			pill: 5,
    			link: 6,
    			label: 7,
    			close: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chip",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pill() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pill(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Chip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Chip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Checkbox\Checkbox.svelte generated by Svelte v3.29.7 */
    const file$a = "node_modules\\svelte-materialify\\dist\\components\\Checkbox\\Checkbox.svelte";

    // (80:6) {#if checked || indeterminate}
    function create_if_block$4(ctx) {
    	let svg;
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*checked*/ ctx[0] ? check : dash);
    			add_location(path, file$a, 85, 10, 3696);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file$a, 80, 8, 3562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*checked*/ 1 && path_d_value !== (path_d_value = /*checked*/ ctx[0] ? check : dash)) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(80:6) {#if checked || indeterminate}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let Ripple_action;
    	let TextColor_action;
    	let t1;
    	let label;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "checkbox");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			input.disabled = /*disabled*/ ctx[5];
    			input.__value = /*value*/ ctx[6];
    			input.value = input.__value;
    			if (/*checked*/ ctx[0] === void 0 || /*indeterminate*/ ctx[1] === void 0) add_render_callback(() => /*input_change_handler*/ ctx[13].call(input));
    			add_location(input, file$a, 67, 4, 3242);
    			attr_dev(div0, "class", "s-checkbox__background");
    			attr_dev(div0, "aria-hidden", "true");
    			add_location(div0, file$a, 78, 4, 3461);
    			attr_dev(div1, "class", div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[3]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[5]);
    			add_location(div1, file$a, 62, 2, 3076);
    			attr_dev(label, "for", /*id*/ ctx[2]);
    			add_location(label, file$a, 90, 2, 3781);
    			attr_dev(div2, "class", "s-checkbox");
    			attr_dev(div2, "style", /*style*/ ctx[7]);
    			add_location(div2, file$a, 61, 0, 3041);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			input.checked = /*checked*/ ctx[0];
    			input.indeterminate = /*indeterminate*/ ctx[1];
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[13]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[8], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[12], false, false, false),
    					action_destroyer(Ripple_action = Ripple.call(null, div1, { centered: true })),
    					action_destroyer(TextColor_action = TextColor.call(null, div1, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    					? /*color*/ ctx[4]
    					: false))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (!current || dirty & /*value*/ 64) {
    				prop_dev(input, "__value", /*value*/ ctx[6]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*indeterminate*/ 2) {
    				input.indeterminate = /*indeterminate*/ ctx[1];
    			}

    			if (/*checked*/ ctx[0] || /*indeterminate*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*klass*/ 8 && div1_class_value !== (div1_class_value = "s-checkbox__wrapper " + /*klass*/ ctx[3])) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, indeterminate, color*/ 19) TextColor_action.update.call(null, /*checked*/ ctx[0] || /*indeterminate*/ ctx[1]
    			? /*color*/ ctx[4]
    			: false);

    			if (dirty & /*klass, disabled*/ 40) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 4) {
    				attr_dev(label, "for", /*id*/ ctx[2]);
    			}

    			if (!current || dirty & /*style*/ 128) {
    				attr_dev(div2, "style", /*style*/ ctx[7]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const check = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
    const dash = "M4,11L4,13L20,13L20,11L4,11Z";

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Checkbox", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { checked = false } = $$props;
    	let { indeterminate = false } = $$props;
    	let { disabled = false } = $$props;
    	let { value = null } = $$props;
    	let { group = null } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	id = id || `s-checkbox-${uid(5)}`;

    	function groupUpdate() {
    		if (hasValidGroup && value != null) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(9, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"checked",
    		"indeterminate",
    		"disabled",
    		"value",
    		"group",
    		"id",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		indeterminate = this.indeterminate;
    		((($$invalidate(0, checked), $$invalidate(14, hasValidGroup)), $$invalidate(6, value)), $$invalidate(9, group));
    		$$invalidate(1, indeterminate);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(3, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("group" in $$props) $$invalidate(9, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		check,
    		dash,
    		Ripple,
    		TextColor,
    		klass,
    		color,
    		checked,
    		indeterminate,
    		disabled,
    		value,
    		group,
    		id,
    		style,
    		groupUpdate,
    		hasValidGroup
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(3, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(4, color = $$props.color);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("indeterminate" in $$props) $$invalidate(1, indeterminate = $$props.indeterminate);
    		if ("disabled" in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("group" in $$props) $$invalidate(9, group = $$props.group);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("style" in $$props) $$invalidate(7, style = $$props.style);
    		if ("hasValidGroup" in $$props) $$invalidate(14, hasValidGroup = $$props.hasValidGroup);
    	};

    	let hasValidGroup;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*group*/ 512) {
    			 $$invalidate(14, hasValidGroup = Array.isArray(group));
    		}

    		if ($$self.$$.dirty & /*hasValidGroup, value, group*/ 16960) {
    			 if (hasValidGroup && value != null) {
    				$$invalidate(0, checked = group.indexOf(value) >= 0);
    			}
    		}
    	};

    	return [
    		checked,
    		indeterminate,
    		id,
    		klass,
    		color,
    		disabled,
    		value,
    		style,
    		groupUpdate,
    		group,
    		$$scope,
    		slots,
    		change_handler,
    		input_change_handler
    	];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 3,
    			color: 4,
    			checked: 0,
    			indeterminate: 1,
    			disabled: 5,
    			value: 6,
    			group: 9,
    			id: 2,
    			style: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var down = 'M7,10L12,15L17,10H7Z';

    /* node_modules\svelte-materialify\dist\components\Select\Select.svelte generated by Svelte v3.29.7 */
    const file$b = "node_modules\\svelte-materialify\\dist\\components\\Select\\Select.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({ item: dirty & /*items*/ 8 });
    const get_item_slot_context = ctx => ({ item: /*item*/ ctx[20] });
    const get_append_outer_slot_changes$3 = dirty => ({});
    const get_append_outer_slot_context$3 = ctx => ({ slot: "append-outer" });

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    const get_prepend_outer_slot_changes$3 = dirty => ({});
    const get_prepend_outer_slot_context$3 = ctx => ({ slot: "prepend-outer" });

    // (44:8) <slot slot="prepend-outer" name="prepend-outer" />          <slot />         <div slot="content">           {#if chips}
    function create_prepend_outer_slot$2(ctx) {
    	let current;
    	const prepend_outer_slot_template = /*#slots*/ ctx[16]["prepend-outer"];
    	const prepend_outer_slot = create_slot(prepend_outer_slot_template, ctx, /*$$scope*/ ctx[19], get_prepend_outer_slot_context$3);

    	const block = {
    		c: function create() {
    			if (prepend_outer_slot) prepend_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (prepend_outer_slot) {
    				prepend_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prepend_outer_slot) {
    				if (prepend_outer_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(prepend_outer_slot, prepend_outer_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_prepend_outer_slot_changes$3, get_prepend_outer_slot_context$3);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prepend_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prepend_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prepend_outer_slot) prepend_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_outer_slot$2.name,
    		type: "slot",
    		source: "(44:8) <slot slot=\\\"prepend-outer\\\" name=\\\"prepend-outer\\\" />          <slot />         <div slot=\\\"content\\\">           {#if chips}",
    		ctx
    	});

    	return block;
    }

    // (48:10) {#if chips}
    function create_if_block_1$3(ctx) {
    	let span;
    	let current;

    	let each_value_1 = Array.isArray(/*value*/ ctx[1])
    	? /*value*/ ctx[1]
    	: [/*value*/ ctx[1]];

    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "s-select__chips");
    			add_location(span, file$b, 48, 12, 1856);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Array, value*/ 2) {
    				each_value_1 = Array.isArray(/*value*/ ctx[1])
    				? /*value*/ ctx[1]
    				: [/*value*/ ctx[1]];

    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(span, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(48:10) {#if chips}",
    		ctx
    	});

    	return block;
    }

    // (51:16) <Chip>
    function create_default_slot_4(ctx) {
    	let t_value = /*v*/ ctx[23] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 2 && t_value !== (t_value = /*v*/ ctx[23] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(51:16) <Chip>",
    		ctx
    	});

    	return block;
    }

    // (50:14) {#each Array.isArray(value) ? value : [value] as v}
    function create_each_block_1$1(ctx) {
    	let chip;
    	let current;

    	chip = new Chip({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chip_changes = {};

    			if (dirty & /*$$scope, value*/ 524290) {
    				chip_changes.$$scope = { dirty, ctx };
    			}

    			chip.$set(chip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(50:14) {#each Array.isArray(value) ? value : [value] as v}",
    		ctx
    	});

    	return block;
    }

    // (47:8) <div slot="content">
    function create_content_slot(ctx) {
    	let div;
    	let current;
    	let if_block = /*chips*/ ctx[13] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "content");
    			add_location(div, file$b, 46, 8, 1801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*chips*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*chips*/ 8192) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(47:8) <div slot=\\\"content\\\">",
    		ctx
    	});

    	return block;
    }

    // (56:8) <span slot="append">
    function create_append_slot(ctx) {
    	let span;
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				path: down,
    				rotate: /*active*/ ctx[0] ? 180 : 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(icon.$$.fragment);
    			attr_dev(span, "slot", "append");
    			add_location(span, file$b, 55, 8, 2067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(icon, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*active*/ 1) icon_changes.rotate = /*active*/ ctx[0] ? 180 : 0;
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(icon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_slot.name,
    		type: "slot",
    		source: "(56:8) <span slot=\\\"append\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:8) <slot slot="append-outer" name="append-outer" />       </TextField>     </span>     <ListItemGroup bind:value {mandatory}
    function create_append_outer_slot$2(ctx) {
    	let current;
    	const append_outer_slot_template = /*#slots*/ ctx[16]["append-outer"];
    	const append_outer_slot = create_slot(append_outer_slot_template, ctx, /*$$scope*/ ctx[19], get_append_outer_slot_context$3);

    	const block = {
    		c: function create() {
    			if (append_outer_slot) append_outer_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (append_outer_slot) {
    				append_outer_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (append_outer_slot) {
    				if (append_outer_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(append_outer_slot, append_outer_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_append_outer_slot_changes$3, get_append_outer_slot_context$3);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(append_outer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(append_outer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (append_outer_slot) append_outer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_append_outer_slot$2.name,
    		type: "slot",
    		source: "(59:8) <slot slot=\\\"append-outer\\\" name=\\\"append-outer\\\" />       </TextField>     </span>     <ListItemGroup bind:value {mandatory}",
    		ctx
    	});

    	return block;
    }

    // (34:6) <TextField         {filled}         {outlined}         {solo}         {dense}         {disabled}         value={format(value)}         {placeholder}         {hint}         readonly>
    function create_default_slot_3(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			t2 = space();
    			t3 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(34:6) <TextField         {filled}         {outlined}         {solo}         {dense}         {disabled}         value={format(value)}         {placeholder}         {hint}         readonly>",
    		ctx
    	});

    	return block;
    }

    // (33:4) <span slot="activator">
    function create_activator_slot(ctx) {
    	let span;
    	let textfield;
    	let current;

    	textfield = new TextField({
    			props: {
    				filled: /*filled*/ ctx[4],
    				outlined: /*outlined*/ ctx[5],
    				solo: /*solo*/ ctx[6],
    				dense: /*dense*/ ctx[7],
    				disabled: /*disabled*/ ctx[14],
    				value: /*format*/ ctx[15](/*value*/ ctx[1]),
    				placeholder: /*placeholder*/ ctx[8],
    				hint: /*hint*/ ctx[9],
    				readonly: true,
    				$$slots: {
    					default: [create_default_slot_3],
    					"append-outer": [create_append_outer_slot$2],
    					append: [create_append_slot],
    					content: [create_content_slot],
    					"prepend-outer": [create_prepend_outer_slot$2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(textfield.$$.fragment);
    			attr_dev(span, "slot", "activator");
    			add_location(span, file$b, 32, 4, 1504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(textfield, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty & /*filled*/ 16) textfield_changes.filled = /*filled*/ ctx[4];
    			if (dirty & /*outlined*/ 32) textfield_changes.outlined = /*outlined*/ ctx[5];
    			if (dirty & /*solo*/ 64) textfield_changes.solo = /*solo*/ ctx[6];
    			if (dirty & /*dense*/ 128) textfield_changes.dense = /*dense*/ ctx[7];
    			if (dirty & /*disabled*/ 16384) textfield_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*format, value*/ 32770) textfield_changes.value = /*format*/ ctx[15](/*value*/ ctx[1]);
    			if (dirty & /*placeholder*/ 256) textfield_changes.placeholder = /*placeholder*/ ctx[8];
    			if (dirty & /*hint*/ 512) textfield_changes.hint = /*hint*/ ctx[9];

    			if (dirty & /*$$scope, active, value, chips*/ 532483) {
    				textfield_changes.$$scope = { dirty, ctx };
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(textfield);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_activator_slot.name,
    		type: "slot",
    		source: "(33:4) <span slot=\\\"activator\\\">",
    		ctx
    	});

    	return block;
    }

    // (67:14) {#if multiple}
    function create_if_block$5(ctx) {
    	let checkbox;
    	let current;

    	checkbox = new Checkbox({
    			props: {
    				checked: /*value*/ ctx[1].includes(/*item*/ ctx[20].value)
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(checkbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(checkbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkbox_changes = {};
    			if (dirty & /*value, items*/ 10) checkbox_changes.checked = /*value*/ ctx[1].includes(/*item*/ ctx[20].value);
    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(checkbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(67:14) {#if multiple}",
    		ctx
    	});

    	return block;
    }

    // (66:12) <span slot="prepend">
    function create_prepend_slot(ctx) {
    	let span;
    	let current;
    	let if_block = /*multiple*/ ctx[11] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (if_block) if_block.c();
    			attr_dev(span, "slot", "prepend");
    			add_location(span, file$b, 65, 12, 2436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if (if_block) if_block.m(span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*multiple*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*multiple*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_prepend_slot.name,
    		type: "slot",
    		source: "(66:12) <span slot=\\\"prepend\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:10) <ListItem {dense} value={item.value}>
    function create_default_slot_2(ctx) {
    	let t0;
    	let t1_value = /*item*/ ctx[20].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if ( t1_value !== (t1_value = /*item*/ ctx[20].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(65:10) <ListItem {dense} value={item.value}>",
    		ctx
    	});

    	return block;
    }

    // (64:33)            
    function fallback_block$2(ctx) {
    	let listitem;
    	let t;
    	let current;

    	listitem = new ListItem({
    			props: {
    				dense: /*dense*/ ctx[7],
    				value: /*item*/ ctx[20].value,
    				$$slots: {
    					default: [create_default_slot_2],
    					prepend: [create_prepend_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listitem.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(listitem, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitem_changes = {};
    			if (dirty & /*dense*/ 128) listitem_changes.dense = /*dense*/ ctx[7];
    			if (dirty & /*items*/ 8) listitem_changes.value = /*item*/ ctx[20].value;

    			if (dirty & /*$$scope, items, value, multiple*/ 526346) {
    				listitem_changes.$$scope = { dirty, ctx };
    			}

    			listitem.$set(listitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listitem, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(64:33)            ",
    		ctx
    	});

    	return block;
    }

    // (63:6) {#each items as item}
    function create_each_block$1(ctx) {
    	let current;
    	const item_slot_template = /*#slots*/ ctx[16].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[19], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (item_slot) {
    				if (item_slot.p && dirty & /*$$scope, items*/ 524296) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[19], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty & /*dense, items, value, multiple*/ 2186) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(63:6) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    // (62:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>
    function create_default_slot_1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dense, items, value, multiple, $$scope*/ 526474) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(62:4) <ListItemGroup bind:value {mandatory} {multiple} {max}>",
    		ctx
    	});

    	return block;
    }

    // (32:2) <Menu offsetY={false} bind:active {disabled} closeOnClick={!multiple}>
    function create_default_slot$3(ctx) {
    	let t;
    	let listitemgroup;
    	let updating_value;
    	let current;

    	function listitemgroup_value_binding(value) {
    		/*listitemgroup_value_binding*/ ctx[17].call(null, value);
    	}

    	let listitemgroup_props = {
    		mandatory: /*mandatory*/ ctx[10],
    		multiple: /*multiple*/ ctx[11],
    		max: /*max*/ ctx[12],
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[1] !== void 0) {
    		listitemgroup_props.value = /*value*/ ctx[1];
    	}

    	listitemgroup = new ListItemGroup({
    			props: listitemgroup_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(listitemgroup, "value", listitemgroup_value_binding));

    	const block = {
    		c: function create() {
    			t = space();
    			create_component(listitemgroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			mount_component(listitemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listitemgroup_changes = {};
    			if (dirty & /*mandatory*/ 1024) listitemgroup_changes.mandatory = /*mandatory*/ ctx[10];
    			if (dirty & /*multiple*/ 2048) listitemgroup_changes.multiple = /*multiple*/ ctx[11];
    			if (dirty & /*max*/ 4096) listitemgroup_changes.max = /*max*/ ctx[12];

    			if (dirty & /*$$scope, items, dense, value, multiple*/ 526474) {
    				listitemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				listitemgroup_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			listitemgroup.$set(listitemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listitemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listitemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			destroy_component(listitemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(32:2) <Menu offsetY={false} bind:active {disabled} closeOnClick={!multiple}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let menu;
    	let updating_active;
    	let div_class_value;
    	let current;

    	function menu_active_binding(value) {
    		/*menu_active_binding*/ ctx[18].call(null, value);
    	}

    	let menu_props = {
    		offsetY: false,
    		disabled: /*disabled*/ ctx[14],
    		closeOnClick: !/*multiple*/ ctx[11],
    		$$slots: {
    			default: [create_default_slot$3],
    			activator: [create_activator_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[0] !== void 0) {
    		menu_props.active = /*active*/ ctx[0];
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });
    	binding_callbacks.push(() => bind(menu, "active", menu_active_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(menu.$$.fragment);
    			attr_dev(div, "class", div_class_value = "s-select " + /*klass*/ ctx[2]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			toggle_class(div, "chips", /*chips*/ ctx[13]);
    			add_location(div, file$b, 30, 0, 1369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(menu, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menu_changes = {};
    			if (dirty & /*disabled*/ 16384) menu_changes.disabled = /*disabled*/ ctx[14];
    			if (dirty & /*multiple*/ 2048) menu_changes.closeOnClick = !/*multiple*/ ctx[11];

    			if (dirty & /*$$scope, mandatory, multiple, max, value, items, dense, filled, outlined, solo, disabled, format, placeholder, hint, active, chips*/ 589819) {
    				menu_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 1) {
    				updating_active = true;
    				menu_changes.active = /*active*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			menu.$set(menu_changes);

    			if (!current || dirty & /*klass*/ 4 && div_class_value !== (div_class_value = "s-select " + /*klass*/ ctx[2])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, disabled*/ 16388) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[14]);
    			}

    			if (dirty & /*klass, chips*/ 8196) {
    				toggle_class(div, "chips", /*chips*/ ctx[13]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['prepend-outer','default','append-outer','item']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { value = [] } = $$props;
    	let { items = [] } = $$props;
    	let { filled = false } = $$props;
    	let { outlined = false } = $$props;
    	let { solo = false } = $$props;
    	let { dense = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { hint = "" } = $$props;
    	let { mandatory = false } = $$props;
    	let { multiple = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { chips = false } = $$props;
    	let { disabled = null } = $$props;
    	let { format = val => Array.isArray(val) ? val.join(", ") : val } = $$props;

    	const writable_props = [
    		"class",
    		"active",
    		"value",
    		"items",
    		"filled",
    		"outlined",
    		"solo",
    		"dense",
    		"placeholder",
    		"hint",
    		"mandatory",
    		"multiple",
    		"max",
    		"chips",
    		"disabled",
    		"format"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function listitemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	function menu_active_binding(value) {
    		active = value;
    		$$invalidate(0, active);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("format" in $$props) $$invalidate(15, format = $$props.format);
    		if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TextField,
    		Menu,
    		ListItemGroup,
    		ListItem,
    		Chip,
    		Checkbox,
    		Icon,
    		DOWN_ICON: down,
    		klass,
    		active,
    		value,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		format
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    		if ("filled" in $$props) $$invalidate(4, filled = $$props.filled);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$props.outlined);
    		if ("solo" in $$props) $$invalidate(6, solo = $$props.solo);
    		if ("dense" in $$props) $$invalidate(7, dense = $$props.dense);
    		if ("placeholder" in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ("hint" in $$props) $$invalidate(9, hint = $$props.hint);
    		if ("mandatory" in $$props) $$invalidate(10, mandatory = $$props.mandatory);
    		if ("multiple" in $$props) $$invalidate(11, multiple = $$props.multiple);
    		if ("max" in $$props) $$invalidate(12, max = $$props.max);
    		if ("chips" in $$props) $$invalidate(13, chips = $$props.chips);
    		if ("disabled" in $$props) $$invalidate(14, disabled = $$props.disabled);
    		if ("format" in $$props) $$invalidate(15, format = $$props.format);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		value,
    		klass,
    		items,
    		filled,
    		outlined,
    		solo,
    		dense,
    		placeholder,
    		hint,
    		mandatory,
    		multiple,
    		max,
    		chips,
    		disabled,
    		format,
    		slots,
    		listitemgroup_value_binding,
    		menu_active_binding,
    		$$scope
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 2,
    			active: 0,
    			value: 1,
    			items: 3,
    			filled: 4,
    			outlined: 5,
    			solo: 6,
    			dense: 7,
    			placeholder: 8,
    			hint: 9,
    			mandatory: 10,
    			multiple: 11,
    			max: 12,
    			chips: 13,
    			disabled: 14,
    			format: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get solo() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set solo(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chips() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chips(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Switch\Switch.svelte generated by Svelte v3.29.7 */
    const file$c = "node_modules\\svelte-materialify\\dist\\components\\Switch\\Switch.svelte";

    function create_fragment$d(ctx) {
    	let div3;
    	let div2;
    	let input;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let TextColor_action;
    	let t2;
    	let label;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			label = element("label");
    			if (default_slot) default_slot.c();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "role", "switch");
    			attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			input.disabled = /*disabled*/ ctx[7];
    			input.__value = /*value*/ ctx[4];
    			input.value = input.__value;
    			add_location(input, file$c, 67, 4, 3964);
    			attr_dev(div0, "class", "s-switch__track");
    			add_location(div0, file$c, 77, 4, 4156);
    			attr_dev(div1, "class", "s-switch__thumb");
    			add_location(div1, file$c, 78, 4, 4192);
    			attr_dev(div2, "class", "s-switch__wrapper");
    			toggle_class(div2, "dense", /*dense*/ ctx[6]);
    			toggle_class(div2, "inset", /*inset*/ ctx[5]);
    			toggle_class(div2, "disabled", /*disabled*/ ctx[7]);
    			add_location(div2, file$c, 61, 2, 3836);
    			attr_dev(label, "for", /*id*/ ctx[1]);
    			add_location(label, file$c, 80, 2, 4235);
    			attr_dev(div3, "class", div3_class_value = "s-switch " + /*klass*/ ctx[2]);
    			attr_dev(div3, "style", /*style*/ ctx[8]);
    			add_location(div3, file$c, 60, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div3, t2);
    			append_dev(div3, label);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[14]),
    					listen_dev(input, "change", /*groupUpdate*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[13], false, false, false),
    					action_destroyer(TextColor_action = TextColor.call(null, div2, /*checked*/ ctx[0] && /*color*/ ctx[3]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*checked*/ 1) {
    				attr_dev(input, "aria-checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*disabled*/ 128) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (!current || dirty & /*value*/ 16) {
    				prop_dev(input, "__value", /*value*/ ctx[4]);
    				input.value = input.__value;
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (TextColor_action && is_function(TextColor_action.update) && dirty & /*checked, color*/ 9) TextColor_action.update.call(null, /*checked*/ ctx[0] && /*color*/ ctx[3]);

    			if (dirty & /*dense*/ 64) {
    				toggle_class(div2, "dense", /*dense*/ ctx[6]);
    			}

    			if (dirty & /*inset*/ 32) {
    				toggle_class(div2, "inset", /*inset*/ ctx[5]);
    			}

    			if (dirty & /*disabled*/ 128) {
    				toggle_class(div2, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(label, "for", /*id*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 4 && div3_class_value !== (div3_class_value = "s-switch " + /*klass*/ ctx[2])) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*style*/ 256) {
    				attr_dev(div3, "style", /*style*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { value = null } = $$props;
    	let { group = [] } = $$props;
    	let { checked = false } = $$props;
    	let { inset = false } = $$props;
    	let { dense = false } = $$props;
    	let { disabled = false } = $$props;
    	let { id = null } = $$props;
    	let { style = null } = $$props;
    	id = id || `s-switch-${uid(5)}`;
    	const hasValidGroup = Array.isArray(group);

    	if (hasValidGroup && value) {
    		if (group.indexOf(value) >= 0) checked = true;
    	}

    	function groupUpdate() {
    		if (hasValidGroup && value) {
    			const i = group.indexOf(value);

    			if (i < 0) {
    				group.push(value);
    			} else {
    				group.splice(i, 1);
    			}

    			$$invalidate(10, group);
    		}
    	}

    	const writable_props = [
    		"class",
    		"color",
    		"value",
    		"group",
    		"checked",
    		"inset",
    		"dense",
    		"disabled",
    		"id",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(5, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(6, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		uid,
    		TextColor,
    		klass,
    		color,
    		value,
    		group,
    		checked,
    		inset,
    		dense,
    		disabled,
    		id,
    		style,
    		hasValidGroup,
    		groupUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("color" in $$props) $$invalidate(3, color = $$props.color);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("group" in $$props) $$invalidate(10, group = $$props.group);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("inset" in $$props) $$invalidate(5, inset = $$props.inset);
    		if ("dense" in $$props) $$invalidate(6, dense = $$props.dense);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("style" in $$props) $$invalidate(8, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		checked,
    		id,
    		klass,
    		color,
    		value,
    		inset,
    		dense,
    		disabled,
    		style,
    		groupUpdate,
    		group,
    		$$scope,
    		slots,
    		change_handler,
    		input_change_handler
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 2,
    			color: 3,
    			value: 4,
    			group: 10,
    			checked: 0,
    			inset: 5,
    			dense: 6,
    			disabled: 7,
    			id: 1,
    			style: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable no-param-reassign */

    const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    /**
     * @param {string} klass
     */
    function formatClass$1(klass) {
      return klass.split(' ').map((i) => {
        if (themeColors.includes(i)) return `${i}-color`;
        return i;
      });
    }

    function setBackgroundColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.backgroundColor = text;
        return false;
      }

      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.backgroundColor = `var(${text})`;
        return false;
      }

      const klass = formatClass$1(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var BackgroundColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setBackgroundColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.backgroundColor = null;
          }

          if (typeof newText === 'string') {
            klass = setBackgroundColor(node, newText);
          }
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Overlay\Overlay.svelte generated by Svelte v3.29.7 */
    const file$d = "node_modules\\svelte-materialify\\dist\\components\\Overlay\\Overlay.svelte";

    // (20:0) {#if active}
    function create_if_block$6(ctx) {
    	let div2;
    	let div0;
    	let BackgroundColor_action;
    	let t;
    	let div1;
    	let div2_class_value;
    	let div2_style_value;
    	let div2_intro;
    	let div2_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "s-overlay__scrim svelte-zop6hb");
    			set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			add_location(div0, file$d, 27, 4, 1076);
    			attr_dev(div1, "class", "s-overlay__content svelte-zop6hb");
    			add_location(div1, file$d, 28, 4, 1167);
    			attr_dev(div2, "class", div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-zop6hb");
    			attr_dev(div2, "style", div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9]);
    			toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			add_location(div2, file$d, 20, 2, 912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*color*/ ctx[6])),
    					listen_dev(div2, "click", /*click_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 32) {
    				set_style(div0, "opacity", /*opacity*/ ctx[5]);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 64) BackgroundColor_action.update.call(null, /*color*/ ctx[6]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-overlay " + /*klass*/ ctx[0] + " svelte-zop6hb")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*index, style*/ 640 && div2_style_value !== (div2_style_value = "z-index:" + /*index*/ ctx[7] + ";" + /*style*/ ctx[9])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, absolute*/ 257) {
    				toggle_class(div2, "absolute", /*absolute*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, /*transition*/ ctx[1], /*inOpts*/ ctx[2]);
    				div2_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, /*transition*/ ctx[1], /*outOpts*/ ctx[3]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(20:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[4] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Overlay", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { transition = fade } = $$props;
    	let { inOpts = { duration: 250 } } = $$props;
    	let { outOpts = { duration: 250 } } = $$props;
    	let { active = true } = $$props;
    	let { opacity = 0.46 } = $$props;
    	let { color = "rgb(33, 33, 33)" } = $$props;
    	let { index = 5 } = $$props;
    	let { absolute = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"transition",
    		"inOpts",
    		"outOpts",
    		"active",
    		"opacity",
    		"color",
    		"index",
    		"absolute",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		BackgroundColor,
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("transition" in $$props) $$invalidate(1, transition = $$props.transition);
    		if ("inOpts" in $$props) $$invalidate(2, inOpts = $$props.inOpts);
    		if ("outOpts" in $$props) $$invalidate(3, outOpts = $$props.outOpts);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    		if ("opacity" in $$props) $$invalidate(5, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(6, color = $$props.color);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    		if ("absolute" in $$props) $$invalidate(8, absolute = $$props.absolute);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		transition,
    		inOpts,
    		outOpts,
    		active,
    		opacity,
    		color,
    		index,
    		absolute,
    		style,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 0,
    			transition: 1,
    			inOpts: 2,
    			outOpts: 3,
    			active: 4,
    			opacity: 5,
    			color: 6,
    			index: 7,
    			absolute: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get class() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outOpts() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outOpts(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Dialog\Dialog.svelte generated by Svelte v3.29.7 */
    const file$e = "node_modules\\svelte-materialify\\dist\\components\\Dialog\\Dialog.svelte";

    // (24:0) {#if visible}
    function create_if_block$7(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div0_transition;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "s-dialog__content " + /*klass*/ ctx[0]);
    			toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			add_location(div0, file$e, 25, 4, 1868);
    			attr_dev(div1, "role", "document");
    			attr_dev(div1, "class", "s-dialog");
    			add_location(div1, file$e, 24, 2, 1787);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, div1, { "dialog-width": /*width*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div0_class_value !== (div0_class_value = "s-dialog__content " + /*klass*/ ctx[0])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fullscreen*/ 5) {
    				toggle_class(div0, "fullscreen", /*fullscreen*/ ctx[2]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*width*/ 2) Style_action.update.call(null, { "dialog-width": /*width*/ ctx[1] });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, true);
    				div0_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, /*transition*/ ctx[3], { duration: 300, start: 0.1 }, false);
    			div0_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(24:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t;
    	let overlay_1;
    	let current;
    	let if_block = /*visible*/ ctx[5] && create_if_block$7(ctx);
    	const overlay_1_spread_levels = [/*overlay*/ ctx[4], { active: /*visible*/ ctx[5] }];
    	let overlay_1_props = {};

    	for (let i = 0; i < overlay_1_spread_levels.length; i += 1) {
    		overlay_1_props = assign(overlay_1_props, overlay_1_spread_levels[i]);
    	}

    	overlay_1 = new Overlay({ props: overlay_1_props, $$inline: true });
    	overlay_1.$on("click", /*close*/ ctx[6]);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(overlay_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(overlay_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const overlay_1_changes = (dirty & /*overlay, visible*/ 48)
    			? get_spread_update(overlay_1_spread_levels, [
    					dirty & /*overlay*/ 16 && get_spread_object(/*overlay*/ ctx[4]),
    					dirty & /*visible*/ 32 && { active: /*visible*/ ctx[5] }
    				])
    			: {};

    			overlay_1.$set(overlay_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(overlay_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(overlay_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(overlay_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dialog", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { active = false } = $$props;
    	let { persistent = false } = $$props;
    	let { disabled = false } = $$props;
    	let { width = 500 } = $$props;
    	let { fullscreen = false } = $$props;
    	let { transition = scale } = $$props;
    	let { overlay = {} } = $$props;

    	function close() {
    		if (!persistent) $$invalidate(7, active = false);
    	}

    	const writable_props = [
    		"class",
    		"active",
    		"persistent",
    		"disabled",
    		"width",
    		"fullscreen",
    		"transition",
    		"overlay"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Overlay,
    		Style,
    		scale,
    		klass,
    		active,
    		persistent,
    		disabled,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		close,
    		visible
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("active" in $$props) $$invalidate(7, active = $$props.active);
    		if ("persistent" in $$props) $$invalidate(8, persistent = $$props.persistent);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("fullscreen" in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ("transition" in $$props) $$invalidate(3, transition = $$props.transition);
    		if ("overlay" in $$props) $$invalidate(4, overlay = $$props.overlay);
    		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
    	};

    	let visible;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active, disabled*/ 640) {
    			 $$invalidate(5, visible = active && !disabled);
    		}
    	};

    	return [
    		klass,
    		width,
    		fullscreen,
    		transition,
    		overlay,
    		visible,
    		close,
    		active,
    		persistent,
    		disabled,
    		$$scope,
    		slots
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 0,
    			active: 7,
    			persistent: 8,
    			disabled: 9,
    			width: 1,
    			fullscreen: 2,
    			transition: 3,
    			overlay: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overlay() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overlay(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Divider\Divider.svelte generated by Svelte v3.29.7 */

    const file$f = "node_modules\\svelte-materialify\\dist\\components\\Divider\\Divider.svelte";

    function create_fragment$g(ctx) {
    	let hr;
    	let hr_class_value;
    	let hr_aria_orientation_value;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			attr_dev(hr, "class", hr_class_value = "s-divider " + /*klass*/ ctx[0] + " svelte-wwsm4v");
    			attr_dev(hr, "role", "separator");
    			attr_dev(hr, "aria-orientation", hr_aria_orientation_value = /*vertical*/ ctx[2] ? "vertical" : "horizontal");
    			attr_dev(hr, "style", /*style*/ ctx[3]);
    			toggle_class(hr, "inset", /*inset*/ ctx[1]);
    			toggle_class(hr, "vertical", /*vertical*/ ctx[2]);
    			add_location(hr, file$f, 10, 0, 715);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*klass*/ 1 && hr_class_value !== (hr_class_value = "s-divider " + /*klass*/ ctx[0] + " svelte-wwsm4v")) {
    				attr_dev(hr, "class", hr_class_value);
    			}

    			if (dirty & /*vertical*/ 4 && hr_aria_orientation_value !== (hr_aria_orientation_value = /*vertical*/ ctx[2] ? "vertical" : "horizontal")) {
    				attr_dev(hr, "aria-orientation", hr_aria_orientation_value);
    			}

    			if (dirty & /*style*/ 8) {
    				attr_dev(hr, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*klass, inset*/ 3) {
    				toggle_class(hr, "inset", /*inset*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 5) {
    				toggle_class(hr, "vertical", /*vertical*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider", slots, []);
    	let { class: klass = "" } = $$props;
    	let { inset = false } = $$props;
    	let { vertical = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "inset", "vertical", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("inset" in $$props) $$invalidate(1, inset = $$props.inset);
    		if ("vertical" in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ klass, inset, vertical, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("inset" in $$props) $$invalidate(1, inset = $$props.inset);
    		if ("vertical" in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, inset, vertical, style];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 0,
    			inset: 1,
    			vertical: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\AppBar\AppBar.svelte generated by Svelte v3.29.7 */
    const file$g = "node_modules\\svelte-materialify\\dist\\components\\AppBar\\AppBar.svelte";
    const get_extension_slot_changes = dirty => ({});
    const get_extension_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (32:4) {#if !collapsed}
    function create_if_block$8(ctx) {
    	let div;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[11].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[10], get_title_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			attr_dev(div, "class", "s-app-bar__title");
    			add_location(div, file$g, 32, 6, 2032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(32:4) {#if !collapsed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let header;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let header_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[11].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[10], get_icon_slot_context);
    	let if_block = !/*collapsed*/ ctx[8] && create_if_block$8(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const extension_slot_template = /*#slots*/ ctx[11].extension;
    	const extension_slot = create_slot(extension_slot_template, ctx, /*$$scope*/ ctx[10], get_extension_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (extension_slot) extension_slot.c();
    			attr_dev(div, "class", "s-app-bar__wrapper");
    			add_location(div, file$g, 29, 2, 1947);
    			attr_dev(header, "class", header_class_value = "s-app-bar " + /*klass*/ ctx[0]);
    			attr_dev(header, "style", /*style*/ ctx[9]);
    			toggle_class(header, "tile", /*tile*/ ctx[2]);
    			toggle_class(header, "flat", /*flat*/ ctx[3]);
    			toggle_class(header, "dense", /*dense*/ ctx[4]);
    			toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			add_location(header, file$g, 18, 0, 1748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(header, t2);

    			if (extension_slot) {
    				extension_slot.m(header, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, header, { "app-bar-height": /*height*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			}

    			if (!/*collapsed*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (extension_slot) {
    				if (extension_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(extension_slot, extension_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_extension_slot_changes, get_extension_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && header_class_value !== (header_class_value = "s-app-bar " + /*klass*/ ctx[0])) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(header, "style", /*style*/ ctx[9]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*height*/ 2) Style_action.update.call(null, { "app-bar-height": /*height*/ ctx[1] });

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(header, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(header, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 17) {
    				toggle_class(header, "dense", /*dense*/ ctx[4]);
    			}

    			if (dirty & /*klass, prominent*/ 33) {
    				toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			}

    			if (dirty & /*klass, fixed*/ 65) {
    				toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			}

    			if (dirty & /*klass, absolute*/ 129) {
    				toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			}

    			if (dirty & /*klass, collapsed*/ 257) {
    				toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			transition_in(extension_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			transition_out(extension_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (extension_slot) extension_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppBar", slots, ['icon','title','default','extension']);
    	let { class: klass = "" } = $$props;
    	let { height = "56px" } = $$props;
    	let { tile = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { prominent = false } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { collapsed = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"height",
    		"tile",
    		"flat",
    		"dense",
    		"prominent",
    		"fixed",
    		"absolute",
    		"collapsed",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style,
    		$$scope,
    		slots
    	];
    }

    class AppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			class: 0,
    			height: 1,
    			tile: 2,
    			flat: 3,
    			dense: 4,
    			prominent: 5,
    			fixed: 6,
    			absolute: 7,
    			collapsed: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppBar",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get class() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\ProgressLinear\ProgressLinear.svelte generated by Svelte v3.29.7 */
    const file$h = "node_modules\\svelte-materialify\\dist\\components\\ProgressLinear\\ProgressLinear.svelte";

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "determinate svelte-yd0o6d");
    			set_style(div, "width", /*value*/ ctx[1] + "%");
    			toggle_class(div, "striped", /*striped*/ ctx[12]);
    			add_location(div, file$h, 43, 4, 3255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 2) {
    				set_style(div, "width", /*value*/ ctx[1] + "%");
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);

    			if (dirty & /*striped*/ 4096) {
    				toggle_class(div, "striped", /*striped*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#if indeterminate}
    function create_if_block_1$4(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "indeterminate long svelte-yd0o6d");
    			add_location(div0, file$h, 39, 6, 3153);
    			attr_dev(div1, "class", "indeterminate short svelte-yd0o6d");
    			add_location(div1, file$h, 40, 6, 3194);
    			add_location(div2, file$h, 38, 4, 3113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div2, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(38:2) {#if indeterminate}",
    		ctx
    	});

    	return block;
    }

    // (55:2) {#if stream}
    function create_if_block$9(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "stream " + /*color*/ ctx[7] + " svelte-yd0o6d");
    			set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			add_location(div, file$h, 55, 4, 3466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 128 && div_class_value !== (div_class_value = "stream " + /*color*/ ctx[7] + " svelte-yd0o6d")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*buffer*/ 256) {
    				set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(55:2) {#if stream}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div2;
    	let div0;
    	let div0_style_value;
    	let BackgroundColor_action;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;
    	let div2_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*indeterminate*/ ctx[3]) return create_if_block_1$4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*stream*/ ctx[10] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "background svelte-yd0o6d");
    			attr_dev(div0, "style", div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? "right" : "left") + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%");
    			add_location(div0, file$h, 32, 2, 2910);
    			attr_dev(div1, "class", "s-progress-linear__content svelte-yd0o6d");
    			add_location(div1, file$h, 50, 2, 3383);
    			attr_dev(div2, "role", "progressbar");
    			attr_dev(div2, "aria-valuemin", "0");
    			attr_dev(div2, "aria-valuemax", "100");
    			attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			attr_dev(div2, "class", div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-yd0o6d");
    			attr_dev(div2, "style", div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13]);
    			toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			add_location(div2, file$h, 22, 0, 2685);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if_block0.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*backgroundColor*/ ctx[5]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*backgroundOpacity, reversed, value, buffer*/ 834 && div0_style_value !== (div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? "right" : "left") + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*backgroundColor*/ 32) BackgroundColor_action.update.call(null, /*backgroundColor*/ ctx[5]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, t1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (/*stream*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*value*/ 2) {
    				attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-yd0o6d")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*height, style*/ 8208 && div2_style_value !== (div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (dirty & /*klass, active*/ 5) {
    				toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			}

    			if (dirty & /*klass, reversed*/ 513) {
    				toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			}

    			if (dirty & /*klass, rounded*/ 2049) {
    				toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProgressLinear", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { active = true } = $$props;
    	let { indeterminate = false } = $$props;
    	let { height = "4px" } = $$props;
    	let { backgroundColor = "primary" } = $$props;
    	let { backgroundOpacity = 0.3 } = $$props;
    	let { color = backgroundColor } = $$props;
    	let { buffer = 100 } = $$props;
    	let { reversed = false } = $$props;
    	let { stream = false } = $$props;
    	let { rounded = false } = $$props;
    	let { striped = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"value",
    		"active",
    		"indeterminate",
    		"height",
    		"backgroundColor",
    		"backgroundOpacity",
    		"color",
    		"buffer",
    		"reversed",
    		"stream",
    		"rounded",
    		"striped",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProgressLinear> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("indeterminate" in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("backgroundColor" in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ("backgroundOpacity" in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("buffer" in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ("reversed" in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ("stream" in $$props) $$invalidate(10, stream = $$props.stream);
    		if ("rounded" in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ("striped" in $$props) $$invalidate(12, striped = $$props.striped);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		BackgroundColor,
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    		if ("indeterminate" in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("backgroundColor" in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ("backgroundOpacity" in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ("color" in $$props) $$invalidate(7, color = $$props.color);
    		if ("buffer" in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ("reversed" in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ("stream" in $$props) $$invalidate(10, stream = $$props.stream);
    		if ("rounded" in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ("striped" in $$props) $$invalidate(12, striped = $$props.striped);
    		if ("style" in $$props) $$invalidate(13, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style,
    		$$scope,
    		slots
    	];
    }

    class ProgressLinear extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			class: 0,
    			value: 1,
    			active: 2,
    			indeterminate: 3,
    			height: 4,
    			backgroundColor: 5,
    			backgroundOpacity: 6,
    			color: 7,
    			buffer: 8,
    			reversed: 9,
    			stream: 10,
    			rounded: 11,
    			striped: 12,
    			style: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressLinear",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get class() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundOpacity() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundOpacity(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buffer() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buffer(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reversed() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reversed(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stream() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stream(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Card\Card.svelte generated by Svelte v3.29.7 */
    const file$i = "node_modules\\svelte-materialify\\dist\\components\\Card\\Card.svelte";
    const get_progress_slot_changes = dirty => ({});
    const get_progress_slot_context = ctx => ({});

    // (31:2) {#if loading}
    function create_if_block$a(ctx) {
    	let current;
    	const progress_slot_template = /*#slots*/ ctx[12].progress;
    	const progress_slot = create_slot(progress_slot_template, ctx, /*$$scope*/ ctx[11], get_progress_slot_context);
    	const progress_slot_or_fallback = progress_slot || fallback_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (progress_slot_or_fallback) {
    				progress_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (progress_slot) {
    				if (progress_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(progress_slot, progress_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_progress_slot_changes, get_progress_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(31:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (32:26)        
    function fallback_block$3(ctx) {
    	let progresslinear;
    	let current;

    	progresslinear = new ProgressLinear({
    			props: { indeterminate: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progresslinear.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresslinear, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresslinear.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresslinear.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresslinear, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(32:26)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let if_block = /*loading*/ ctx[8] && create_if_block$a(ctx);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[10]);
    			toggle_class(div, "flat", /*flat*/ ctx[1]);
    			toggle_class(div, "tile", /*tile*/ ctx[2]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			toggle_class(div, "raised", /*raised*/ ctx[4]);
    			toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			toggle_class(div, "hover", /*hover*/ ctx[6]);
    			toggle_class(div, "link", /*link*/ ctx[7]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[9]);
    			add_location(div, file$i, 19, 0, 2223);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loading*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loading*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(div, "style", /*style*/ ctx[10]);
    			}

    			if (dirty & /*klass, flat*/ 3) {
    				toggle_class(div, "flat", /*flat*/ ctx[1]);
    			}

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(div, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, outlined*/ 9) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			}

    			if (dirty & /*klass, raised*/ 17) {
    				toggle_class(div, "raised", /*raised*/ ctx[4]);
    			}

    			if (dirty & /*klass, shaped*/ 33) {
    				toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			}

    			if (dirty & /*klass, hover*/ 65) {
    				toggle_class(div, "hover", /*hover*/ ctx[6]);
    			}

    			if (dirty & /*klass, link*/ 129) {
    				toggle_class(div, "link", /*link*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 513) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['progress','default']);
    	let { class: klass = "" } = $$props;
    	let { flat = false } = $$props;
    	let { tile = false } = $$props;
    	let { outlined = false } = $$props;
    	let { raised = false } = $$props;
    	let { shaped = false } = $$props;
    	let { hover = false } = $$props;
    	let { link = false } = $$props;
    	let { loading = false } = $$props;
    	let { disabled = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"flat",
    		"tile",
    		"outlined",
    		"raised",
    		"shaped",
    		"hover",
    		"link",
    		"loading",
    		"disabled",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("raised" in $$props) $$invalidate(4, raised = $$props.raised);
    		if ("shaped" in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ("hover" in $$props) $$invalidate(6, hover = $$props.hover);
    		if ("link" in $$props) $$invalidate(7, link = $$props.link);
    		if ("loading" in $$props) $$invalidate(8, loading = $$props.loading);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ProgressLinear,
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("flat" in $$props) $$invalidate(1, flat = $$props.flat);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("outlined" in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ("raised" in $$props) $$invalidate(4, raised = $$props.raised);
    		if ("shaped" in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ("hover" in $$props) $$invalidate(6, hover = $$props.hover);
    		if ("link" in $$props) $$invalidate(7, link = $$props.link);
    		if ("loading" in $$props) $$invalidate(8, loading = $$props.loading);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			class: 0,
    			flat: 1,
    			tile: 2,
    			outlined: 3,
    			raised: 4,
    			shaped: 5,
    			hover: 6,
    			link: 7,
    			loading: 8,
    			disabled: 9,
    			style: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raised() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raised(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shaped() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shaped(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Card\CardActions.svelte generated by Svelte v3.29.7 */

    const file$j = "node_modules\\svelte-materialify\\dist\\components\\Card\\CardActions.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-actions " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$j, 8, 0, 224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-actions " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardActions", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardActions> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardActions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardActions",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get class() {
    		throw new Error("<CardActions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardActions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardActions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardActions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Card\CardText.svelte generated by Svelte v3.29.7 */

    const file$k = "node_modules\\svelte-materialify\\dist\\components\\Card\\CardText.svelte";

    function create_fragment$l(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-text " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$k, 8, 0, 316);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-text " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardText", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardText",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get class() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var prevIcon = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';

    var nextIcon = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';

    /* node_modules\svelte-materialify\dist\components\SlideGroup\SlideGroup.svelte generated by Svelte v3.29.7 */
    const file$l = "node_modules\\svelte-materialify\\dist\\components\\SlideGroup\\SlideGroup.svelte";
    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_previous_slot_changes = dirty => ({});
    const get_previous_slot_context = ctx => ({});

    // (74:2) {#if arrowsVisible}
    function create_if_block_1$5(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const previous_slot_template = /*#slots*/ ctx[17].previous;
    	const previous_slot = create_slot(previous_slot_template, ctx, /*$$scope*/ ctx[22], get_previous_slot_context);
    	const previous_slot_or_fallback = previous_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (previous_slot_or_fallback) previous_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__prev");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$l, 74, 4, 2409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (previous_slot_or_fallback) {
    				previous_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*prev*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (previous_slot) {
    				if (previous_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(previous_slot, previous_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_previous_slot_changes, get_previous_slot_context);
    				}
    			}

    			if (dirty & /*x*/ 512) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previous_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previous_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (previous_slot_or_fallback) previous_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(74:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (80:28)          
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: prevIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(80:28)          ",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#if arrowsVisible}
    function create_if_block$b(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const next_slot_template = /*#slots*/ ctx[17].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[22], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__next");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$l, 97, 4, 2994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*next*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			}

    			if (dirty & /*x, contentWidth, wrapperWidth*/ 896) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(97:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (103:24)          
    function fallback_block$4(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: nextIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(103:24)          ",
    		ctx
    	});

    	return block;
    }

    // (66:0) <ItemGroup   class="s-slide-group {klass}"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>
    function create_default_slot$4(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_resize_listener;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrowsVisible*/ ctx[10] && create_if_block_1$5(ctx);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*arrowsVisible*/ ctx[10] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "s-slide-group__content");
    			set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[18].call(div0));
    			add_location(div0, file$l, 89, 4, 2810);
    			attr_dev(div1, "class", "s-slide-group__wrapper");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			add_location(div1, file$l, 84, 2, 2653);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[18].bind(div0));
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "touchstart", /*touchstart*/ ctx[13], { passive: true }, false, false),
    					listen_dev(div1, "touchmove", /*touchmove*/ ctx[14], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*x*/ 512) {
    				set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			}

    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$b(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			div1_resize_listener();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(66:0) <ItemGroup   class=\\\"s-slide-group {klass}\\\"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[20].call(null, value);
    	}

    	let itemgroup_props = {
    		class: "s-slide-group " + /*klass*/ ctx[1],
    		activeClass: /*activeClass*/ ctx[3],
    		multiple: /*multiple*/ ctx[4],
    		mandatory: /*mandatory*/ ctx[5],
    		max: /*max*/ ctx[6],
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));
    	itemgroup.$on("change", /*change_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-slide-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 8) itemgroup_changes.activeClass = /*activeClass*/ ctx[3];
    			if (dirty & /*multiple*/ 16) itemgroup_changes.multiple = /*multiple*/ ctx[4];
    			if (dirty & /*mandatory*/ 32) itemgroup_changes.mandatory = /*mandatory*/ ctx[5];
    			if (dirty & /*max*/ 64) itemgroup_changes.max = /*max*/ ctx[6];

    			if (dirty & /*$$scope, x, contentWidth, wrapperWidth, hideDisabledArrows, arrowsVisible*/ 4196228) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SLIDE_GROUP = {};

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideGroup", slots, ['previous','default','next']);
    	let contentWidth;
    	let wrapperWidth;
    	let { class: klass = "" } = $$props;
    	let { showArrows = true } = $$props;
    	let { hideDisabledArrows = false } = $$props;
    	let { centerActive = false } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let x = 0;

    	setContext(SLIDE_GROUP, item => {
    		const left = item.offsetLeft;
    		const width = item.offsetWidth;

    		if (centerActive) $$invalidate(9, x = left + (width - wrapperWidth) / 2); else if (left + 1.25 * width > wrapperWidth + x) {
    			$$invalidate(9, x = left + 1.25 * width - wrapperWidth);
    		} else if (left < x + width / 4) {
    			$$invalidate(9, x = left - width / 4);
    		}
    	});

    	afterUpdate(() => {
    		if (x + wrapperWidth > contentWidth) $$invalidate(9, x = contentWidth - wrapperWidth); else if (x < 0) $$invalidate(9, x = 0);
    	});

    	function next() {
    		$$invalidate(9, x += wrapperWidth);
    	}

    	function prev() {
    		$$invalidate(9, x -= wrapperWidth);
    	}

    	let touchStartX;

    	function touchstart({ touches }) {
    		touchStartX = x + touches[0].clientX;
    	}

    	function touchmove({ touches }) {
    		$$invalidate(9, x = touchStartX - touches[0].clientX);
    	}

    	const writable_props = [
    		"class",
    		"showArrows",
    		"hideDisabledArrows",
    		"centerActive",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideGroup> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		$$invalidate(7, contentWidth);
    	}

    	function div1_elementresize_handler() {
    		wrapperWidth = this.clientWidth;
    		$$invalidate(8, wrapperWidth);
    	}

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SLIDE_GROUP,
    		setContext,
    		afterUpdate,
    		ItemGroup,
    		prevIcon,
    		nextIcon,
    		Icon,
    		contentWidth,
    		wrapperWidth,
    		klass,
    		showArrows,
    		hideDisabledArrows,
    		centerActive,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		x,
    		next,
    		prev,
    		touchStartX,
    		touchstart,
    		touchmove,
    		arrowsVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentWidth" in $$props) $$invalidate(7, contentWidth = $$props.contentWidth);
    		if ("wrapperWidth" in $$props) $$invalidate(8, wrapperWidth = $$props.wrapperWidth);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("x" in $$props) $$invalidate(9, x = $$props.x);
    		if ("touchStartX" in $$props) touchStartX = $$props.touchStartX;
    		if ("arrowsVisible" in $$props) $$invalidate(10, arrowsVisible = $$props.arrowsVisible);
    	};

    	let arrowsVisible;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperWidth, contentWidth, showArrows*/ 33152) {
    			 $$invalidate(10, arrowsVisible = wrapperWidth < contentWidth && showArrows);
    		}
    	};

    	return [
    		value,
    		klass,
    		hideDisabledArrows,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		contentWidth,
    		wrapperWidth,
    		x,
    		arrowsVisible,
    		next,
    		prev,
    		touchstart,
    		touchmove,
    		showArrows,
    		centerActive,
    		slots,
    		div0_elementresize_handler,
    		div1_elementresize_handler,
    		itemgroup_value_binding,
    		change_handler,
    		$$scope
    	];
    }

    class SlideGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			class: 1,
    			showArrows: 15,
    			hideDisabledArrows: 2,
    			centerActive: 16,
    			activeClass: 3,
    			value: 0,
    			multiple: 4,
    			mandatory: 5,
    			max: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideGroup",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get class() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideDisabledArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDisabledArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Window\Window.svelte generated by Svelte v3.29.7 */
    const file$m = "node_modules\\svelte-materialify\\dist\\components\\Window\\Window.svelte";

    function create_fragment$n(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window " + /*klass*/ ctx[0]);
    			toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			add_location(div, file$m, 89, 0, 3456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[12](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, reverse*/ 5) {
    				toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const WINDOW = {};

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { value = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { reverse = false } = $$props;
    	let { continuous = true } = $$props;
    	let container;
    	const windowItems = [];
    	let moving = false;

    	setContext(WINDOW, window => {
    		windowItems.push(window);
    	});

    	function set(index) {
    		const prevIndex = windowItems.findIndex(i => i.classList.contains(activeClass));

    		if (!moving && windowItems[index] && index !== prevIndex) {
    			moving = true;
    			let direction;
    			let position;

    			if (index > prevIndex) {
    				direction = "left";
    				position = "next";
    			} else {
    				direction = "right";
    				position = "prev";
    			}

    			const prev = windowItems[prevIndex];
    			prev.classList.add(direction);
    			$$invalidate(3, container.style.height = `${prev.offsetHeight}px`, container);
    			const active = windowItems[index];
    			active.classList.add(position);
    			$$invalidate(3, container.style.height = `${active.offsetHeight}px`, container);
    			active.classList.add(direction);

    			setTimeout(
    				() => {
    					prev.classList.remove("active", direction);
    					active.classList.add("active");
    					active.classList.remove(position, direction);
    					$$invalidate(3, container.style.height = null, container);
    					moving = false;
    					$$invalidate(4, value = index);
    				},
    				300
    			);
    		}
    	}

    	function next() {
    		if (value === windowItems.length - 1) {
    			if (continuous) set(0);
    		} else {
    			set(value + 1);
    		}
    	}

    	function previous() {
    		if (value === 0) {
    			if (continuous) set(windowItems.length - 1);
    		} else {
    			set(value - 1);
    		}
    	}

    	onMount(() => {
    		const activeItem = windowItems[value];
    		if (activeItem) activeItem.classList.add(activeClass);
    	});

    	const writable_props = ["class", "activeClass", "value", "vertical", "reverse", "continuous"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		WINDOW,
    		onMount,
    		setContext,
    		klass,
    		activeClass,
    		value,
    		vertical,
    		reverse,
    		continuous,
    		container,
    		windowItems,
    		moving,
    		set,
    		next,
    		previous
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("moving" in $$props) moving = $$props.moving;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 16) {
    			 set(value);
    		}
    	};

    	return [
    		klass,
    		vertical,
    		reverse,
    		container,
    		value,
    		activeClass,
    		continuous,
    		set,
    		next,
    		previous,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			class: 0,
    			activeClass: 5,
    			value: 4,
    			vertical: 1,
    			reverse: 2,
    			continuous: 6,
    			set: 7,
    			next: 8,
    			previous: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get class() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get continuous() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set continuous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get set() {
    		return this.$$.ctx[7];
    	}

    	set set(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[8];
    	}

    	set next(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		return this.$$.ctx[9];
    	}

    	set previous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Tabs\Tabs.svelte generated by Svelte v3.29.7 */
    const file$n = "node_modules\\svelte-materialify\\dist\\components\\Tabs\\Tabs.svelte";
    const get_tabs_slot_changes = dirty => ({});
    const get_tabs_slot_context = ctx => ({});

    // (74:6) {#if slider}
    function create_if_block$c(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10]);
    			add_location(div, file$n, 74, 8, 3309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderClass*/ 1024 && div_class_value !== (div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(74:6) {#if slider}",
    		ctx
    	});

    	return block;
    }

    // (66:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>
    function create_default_slot_1$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const tabs_slot_template = /*#slots*/ ctx[16].tabs;
    	const tabs_slot = create_slot(tabs_slot_template, ctx, /*$$scope*/ ctx[21], get_tabs_slot_context);
    	let if_block = /*slider*/ ctx[9] && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			if (tabs_slot) tabs_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (tabs_slot) {
    				tabs_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tabs_slot) {
    				if (tabs_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(tabs_slot, tabs_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_tabs_slot_changes, get_tabs_slot_context);
    				}
    			}

    			if (/*slider*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tabs_slot) tabs_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(66:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>",
    		ctx
    	});

    	return block;
    }

    // (79:2) <Window bind:this={windowComponent}>
    function create_default_slot$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(79:2) <Window bind:this={windowComponent}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let div1;
    	let div0;
    	let slidegroup;
    	let updating_value;
    	let div0_class_value;
    	let t;
    	let window;
    	let current;

    	function slidegroup_value_binding(value) {
    		/*slidegroup_value_binding*/ ctx[18].call(null, value);
    	}

    	let slidegroup_props = {
    		mandatory: true,
    		centerActive: /*centerActive*/ ctx[2],
    		showArrows: /*showArrows*/ ctx[3],
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		slidegroup_props.value = /*value*/ ctx[0];
    	}

    	slidegroup = new SlideGroup({ props: slidegroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(slidegroup, "value", slidegroup_value_binding));
    	slidegroup.$on("change", /*moveSlider*/ ctx[14]);
    	slidegroup.$on("change", /*change_handler*/ ctx[19]);

    	let window_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	window = new Window({ props: window_props, $$inline: true });
    	/*window_binding*/ ctx[20](window);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slidegroup.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1]);
    			attr_dev(div0, "role", "tablist");
    			toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			toggle_class(div0, "right", /*right*/ ctx[7]);
    			toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			add_location(div0, file$n, 57, 2, 2965);
    			attr_dev(div1, "class", "s-tabs");
    			attr_dev(div1, "role", "tablist");
    			toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			add_location(div1, file$n, 56, 0, 2912);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slidegroup, div0, null);
    			append_dev(div1, t);
    			mount_component(window, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidegroup_changes = {};
    			if (dirty & /*centerActive*/ 4) slidegroup_changes.centerActive = /*centerActive*/ ctx[2];
    			if (dirty & /*showArrows*/ 8) slidegroup_changes.showArrows = /*showArrows*/ ctx[3];

    			if (dirty & /*$$scope, sliderClass, sliderElement, slider*/ 2102784) {
    				slidegroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				slidegroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidegroup.$set(slidegroup_changes);

    			if (!current || dirty & /*klass*/ 2 && div0_class_value !== (div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fixedTabs*/ 18) {
    				toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			}

    			if (dirty & /*klass, grow*/ 34) {
    				toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			}

    			if (dirty & /*klass, centered*/ 66) {
    				toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			}

    			if (dirty & /*klass, right*/ 130) {
    				toggle_class(div0, "right", /*right*/ ctx[7]);
    			}

    			if (dirty & /*klass, icons*/ 258) {
    				toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			}

    			const window_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);

    			if (dirty & /*vertical*/ 2048) {
    				toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidegroup.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidegroup.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidegroup);
    			/*window_binding*/ ctx[20](null);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['tabs','default']);
    	let sliderElement;
    	let windowComponent;
    	const tabs = [];
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { centerActive = false } = $$props;
    	let { showArrows = true } = $$props;
    	let { fixedTabs = false } = $$props;
    	let { grow = false } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { icons = false } = $$props;
    	let { slider = true } = $$props;
    	let { sliderClass = "" } = $$props;
    	let { ripple = {} } = $$props;
    	let { vertical = false } = $$props;

    	setContext(TABS, {
    		ripple,
    		registerTab: tab => {
    			tabs.push(tab);
    		}
    	});

    	function moveSlider({ detail }) {
    		if (slider) {
    			const activeTab = tabs[detail];

    			if (vertical) {
    				$$invalidate(12, sliderElement.style.top = `${activeTab.offsetTop}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.height = `${activeTab.offsetHeight}px`, sliderElement);
    			} else {
    				$$invalidate(12, sliderElement.style.left = `${activeTab.offsetLeft}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.width = `${activeTab.offsetWidth}px`, sliderElement);
    			}
    		}

    		windowComponent.set(value);
    	}

    	onMount(() => {
    		moveSlider({ detail: value });
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"centerActive",
    		"showArrows",
    		"fixedTabs",
    		"grow",
    		"centered",
    		"right",
    		"icons",
    		"slider",
    		"sliderClass",
    		"ripple",
    		"vertical"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(12, sliderElement);
    		});
    	}

    	function slidegroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function window_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			windowComponent = $$value;
    			$$invalidate(13, windowComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ("$$scope" in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		SlideGroup,
    		Window,
    		onMount,
    		setContext,
    		sliderElement,
    		windowComponent,
    		tabs,
    		klass,
    		value,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		ripple,
    		vertical,
    		moveSlider
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(12, sliderElement = $$props.sliderElement);
    		if ("windowComponent" in $$props) $$invalidate(13, windowComponent = $$props.windowComponent);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		vertical,
    		sliderElement,
    		windowComponent,
    		moveSlider,
    		ripple,
    		slots,
    		div_binding,
    		slidegroup_value_binding,
    		change_handler,
    		window_binding,
    		$$scope
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			class: 1,
    			value: 0,
    			centerActive: 2,
    			showArrows: 3,
    			fixedTabs: 4,
    			grow: 5,
    			centered: 6,
    			right: 7,
    			icons: 8,
    			slider: 9,
    			sliderClass: 10,
    			ripple: 15,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get class() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedTabs() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedTabs(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icons() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icons(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slider() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slider(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliderClass() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliderClass(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Tabs\Tab.svelte generated by Svelte v3.29.7 */
    const file$o = "node_modules\\svelte-materialify\\dist\\components\\Tabs\\Tab.svelte";

    function create_fragment$p(ctx) {
    	let button;
    	let button_class_value;
    	let button_tabindex_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0]);
    			attr_dev(button, "role", "tab");
    			attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0);
    			toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			add_location(button, file$o, 38, 0, 1801);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[10](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]])),
    					listen_dev(button, "click", /*selectTab*/ ctx[6], false, false, false),
    					action_destroyer(Ripple_action = Ripple.call(null, button, /*ripple*/ ctx[5]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && button_class_value !== (button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*active*/ 16) {
    				attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 4 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 18) Class_action.update.call(null, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]]);

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, active*/ 17) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let tab;
    	const click = getContext(SLIDE_GROUP);
    	const ITEM = getContext(ITEM_GROUP);
    	const { ripple, registerTab } = getContext(TABS);
    	let { class: klass = "" } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { disabled = null } = $$props;
    	let active;

    	ITEM.register(values => {
    		$$invalidate(4, active = values.includes(value));
    	});

    	function selectTab({ target }) {
    		if (!disabled) {
    			click(target);
    			ITEM.select(value);
    		}
    	}

    	onMount(() => {
    		registerTab(tab);
    	});

    	const writable_props = ["class", "value", "activeClass", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tab = $$value;
    			$$invalidate(3, tab);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		SLIDE_GROUP,
    		ITEM_GROUP,
    		TABS,
    		Class,
    		Ripple,
    		tab,
    		click,
    		ITEM,
    		ripple,
    		registerTab,
    		klass,
    		value,
    		activeClass,
    		disabled,
    		active,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		activeClass,
    		disabled,
    		tab,
    		active,
    		ripple,
    		selectTab,
    		value,
    		$$scope,
    		slots,
    		button_binding
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			class: 0,
    			value: 7,
    			activeClass: 1,
    			disabled: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Footer\Footer.svelte generated by Svelte v3.29.7 */

    const file$p = "node_modules\\svelte-materialify\\dist\\components\\Footer\\Footer.svelte";

    function create_fragment$q(ctx) {
    	let footer;
    	let footer_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			if (default_slot) default_slot.c();
    			attr_dev(footer, "class", footer_class_value = "s-footer " + /*klass*/ ctx[0]);
    			attr_dev(footer, "style", /*style*/ ctx[5]);
    			toggle_class(footer, "absolute", /*absolute*/ ctx[1]);
    			toggle_class(footer, "fixed", /*fixed*/ ctx[2]);
    			toggle_class(footer, "inset", /*inset*/ ctx[3]);
    			toggle_class(footer, "padless", /*padless*/ ctx[4]);
    			add_location(footer, file$p, 12, 0, 912);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);

    			if (default_slot) {
    				default_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && footer_class_value !== (footer_class_value = "s-footer " + /*klass*/ ctx[0])) {
    				attr_dev(footer, "class", footer_class_value);
    			}

    			if (!current || dirty & /*style*/ 32) {
    				attr_dev(footer, "style", /*style*/ ctx[5]);
    			}

    			if (dirty & /*klass, absolute*/ 3) {
    				toggle_class(footer, "absolute", /*absolute*/ ctx[1]);
    			}

    			if (dirty & /*klass, fixed*/ 5) {
    				toggle_class(footer, "fixed", /*fixed*/ ctx[2]);
    			}

    			if (dirty & /*klass, inset*/ 9) {
    				toggle_class(footer, "inset", /*inset*/ ctx[3]);
    			}

    			if (dirty & /*klass, padless*/ 17) {
    				toggle_class(footer, "padless", /*padless*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { absolute = false } = $$props;
    	let { fixed = false } = $$props;
    	let { inset = false } = $$props;
    	let { padless = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "absolute", "fixed", "inset", "padless", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("absolute" in $$props) $$invalidate(1, absolute = $$props.absolute);
    		if ("fixed" in $$props) $$invalidate(2, fixed = $$props.fixed);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("padless" in $$props) $$invalidate(4, padless = $$props.padless);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		klass,
    		absolute,
    		fixed,
    		inset,
    		padless,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("absolute" in $$props) $$invalidate(1, absolute = $$props.absolute);
    		if ("fixed" in $$props) $$invalidate(2, fixed = $$props.fixed);
    		if ("inset" in $$props) $$invalidate(3, inset = $$props.inset);
    		if ("padless" in $$props) $$invalidate(4, padless = $$props.padless);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, absolute, fixed, inset, padless, style, $$scope, slots];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			class: 0,
    			absolute: 1,
    			fixed: 2,
    			inset: 3,
    			padless: 4,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get class() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padless() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padless(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Settings.svelte generated by Svelte v3.29.7 */

    const { console: console_1 } = globals;
    const file$q = "src\\Settings.svelte";

    // (7:4) <Switch on:change = {(val) => {onHelperChange(val)}} checked = {settings.helper} color = {settings.accentColour.toLowerCase()}>
    function create_default_slot_1$2(ctx) {
    	let b;

    	const block = {
    		c: function create() {
    			b = element("b");
    			b.textContent = "Helper";
    			attr_dev(b, "class", "svelte-omkqb3");
    			add_location(b, file$q, 6, 131, 200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(7:4) <Switch on:change = {(val) => {onHelperChange(val)}} checked = {settings.helper} color = {settings.accentColour.toLowerCase()}>",
    		ctx
    	});

    	return block;
    }

    // (5:1) <Card style = "margin-top : 10px; border-radius : 5px">
    function create_default_slot$6(ctx) {
    	let div0;
    	let switch_1;
    	let t0;
    	let divider;
    	let t1;
    	let div1;
    	let select;
    	let updating_value;
    	let current;
    	let mounted;
    	let dispose;

    	switch_1 = new Switch({
    			props: {
    				checked: /*settings*/ ctx[0].helper,
    				color: /*settings*/ ctx[0].accentColour.toLowerCase(),
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	switch_1.$on("change", /*change_handler*/ ctx[4]);
    	divider = new Divider({ $$inline: true });

    	function select_value_binding(value) {
    		/*select_value_binding*/ ctx[5].call(null, value);
    	}

    	let select_props = {
    		solo: true,
    		items: /*colourOptions*/ ctx[3],
    		placeholder: "Accent Colour"
    	};

    	if (/*settings*/ ctx[0].accentColour !== void 0) {
    		select_props.value = /*settings*/ ctx[0].accentColour;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "value", select_value_binding));

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(switch_1.$$.fragment);
    			t0 = space();
    			create_component(divider.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(select.$$.fragment);
    			attr_dev(div0, "class", "svelte-omkqb3");
    			add_location(div0, file$q, 5, 2, 63);
    			attr_dev(div1, "class", "svelte-omkqb3");
    			add_location(div1, file$q, 9, 2, 251);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(switch_1, div0, null);
    			insert_dev(target, t0, anchor);
    			mount_component(divider, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(select, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					div1,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_1_changes = {};
    			if (dirty & /*settings*/ 1) switch_1_changes.checked = /*settings*/ ctx[0].helper;
    			if (dirty & /*settings*/ 1) switch_1_changes.color = /*settings*/ ctx[0].accentColour.toLowerCase();

    			if (dirty & /*$$scope*/ 64) {
    				switch_1_changes.$$scope = { dirty, ctx };
    			}

    			switch_1.$set(switch_1_changes);
    			const select_changes = {};

    			if (!updating_value && dirty & /*settings*/ 1) {
    				updating_value = true;
    				select_changes.value = /*settings*/ ctx[0].accentColour;
    				add_flush_callback(() => updating_value = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			transition_in(divider.$$.fragment, local);
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			transition_out(divider.$$.fragment, local);
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(switch_1);
    			if (detaching) detach_dev(t0);
    			destroy_component(divider, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(select);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(5:1) <Card style = \\\"margin-top : 10px; border-radius : 5px\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				style: "margin-top : 10px; border-radius : 5px",
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, onClick, settings, onHelperChange*/ 71) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function check$1() {
    	console.log("yeay");
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Settings", slots, []);
    	let { onHelperChange } = $$props;
    	let { settings } = $$props;
    	let { onClick } = $$props;

    	const colourOptions = [
    		{ name: "Blue", value: "Blue" },
    		{ name: "Green", value: "Green" },
    		{ name: "Orange", value: "Orange" },
    		{ name: "Red", value: "Red" }
    	];

    	const writable_props = ["onHelperChange", "settings", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const change_handler = val => {
    		onHelperChange(val);
    	};

    	function select_value_binding(value) {
    		settings.accentColour = value;
    		$$invalidate(0, settings);
    	}

    	$$self.$$set = $$props => {
    		if ("onHelperChange" in $$props) $$invalidate(1, onHelperChange = $$props.onHelperChange);
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		Switch,
    		Select,
    		Divider,
    		Card,
    		onHelperChange,
    		settings,
    		onClick,
    		colourOptions,
    		check: check$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("onHelperChange" in $$props) $$invalidate(1, onHelperChange = $$props.onHelperChange);
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		settings,
    		onHelperChange,
    		onClick,
    		colourOptions,
    		change_handler,
    		select_value_binding
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			onHelperChange: 1,
    			settings: 0,
    			onClick: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$r.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onHelperChange*/ ctx[1] === undefined && !("onHelperChange" in props)) {
    			console_1.warn("<Settings> was created without expected prop 'onHelperChange'");
    		}

    		if (/*settings*/ ctx[0] === undefined && !("settings" in props)) {
    			console_1.warn("<Settings> was created without expected prop 'settings'");
    		}

    		if (/*onClick*/ ctx[2] === undefined && !("onClick" in props)) {
    			console_1.warn("<Settings> was created without expected prop 'onClick'");
    		}
    	}

    	get onHelperChange() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onHelperChange(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Start.svelte generated by Svelte v3.29.7 */
    const file$r = "src\\Start.svelte";

    // (4:3) <Slider thumb>
    function create_default_slot_1$3(ctx) {
    	let b;

    	const block = {
    		c: function create() {
    			b = element("b");
    			b.textContent = "Difficulty";
    			attr_dev(b, "class", "svelte-flnyjn");
    			add_location(b, file$r, 3, 17, 61);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(4:3) <Slider thumb>",
    		ctx
    	});

    	return block;
    }

    // (6:2) <Button class={settings.accentColour.toLowerCase() + " white-text"} on:click = {onClick}>
    function create_default_slot$7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(6:2) <Button class={settings.accentColour.toLowerCase() + \\\" white-text\\\"} on:click = {onClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let div1;
    	let div0;
    	let slider;
    	let t;
    	let button;
    	let current;

    	slider = new Slider({
    			props: {
    				thumb: true,
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				class: /*settings*/ ctx[0].accentColour.toLowerCase() + " white-text",
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slider.$$.fragment);
    			t = space();
    			create_component(button.$$.fragment);
    			attr_dev(div0, "class", "fill svelte-flnyjn");
    			add_location(div0, file$r, 2, 2, 25);
    			attr_dev(div1, "class", "center svelte-flnyjn");
    			add_location(div1, file$r, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slider, div0, null);
    			append_dev(div1, t);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const slider_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				slider_changes.$$scope = { dirty, ctx };
    			}

    			slider.$set(slider_changes);
    			const button_changes = {};
    			if (dirty & /*settings*/ 1) button_changes.class = /*settings*/ ctx[0].accentColour.toLowerCase() + " white-text";

    			if (dirty & /*$$scope*/ 4) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slider);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Start", slots, []);
    	let { settings } = $$props;
    	let { onClick } = $$props;
    	const writable_props = ["settings", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Start> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({ Button, Slider, settings, onClick });

    	$$self.$inject_state = $$props => {
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [settings, onClick];
    }

    class Start extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { settings: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Start",
    			options,
    			id: create_fragment$s.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*settings*/ ctx[0] === undefined && !("settings" in props)) {
    			console.warn("<Start> was created without expected prop 'settings'");
    		}

    		if (/*onClick*/ ctx[1] === undefined && !("onClick" in props)) {
    			console.warn("<Start> was created without expected prop 'onClick'");
    		}
    	}

    	get settings() {
    		throw new Error("<Start>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Start>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Start>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Start>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Stats.svelte generated by Svelte v3.29.7 */
    const file$s = "src\\Stats.svelte";

    function create_fragment$t(ctx) {
    	let div3;
    	let div0;
    	let h40;
    	let b0;
    	let t1;
    	let p0;
    	let b1;
    	let t3;
    	let div1;
    	let h41;
    	let b2;
    	let t5;
    	let p1;
    	let b3;
    	let t7;
    	let div2;
    	let h42;
    	let b4;
    	let t9;
    	let p2;
    	let b5;
    	let div3_style_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			b0 = element("b");
    			b0.textContent = "Lvl1 Solved";
    			t1 = space();
    			p0 = element("p");
    			b1 = element("b");
    			b1.textContent = "20";
    			t3 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			b2 = element("b");
    			b2.textContent = "Lvl2 Solved";
    			t5 = space();
    			p1 = element("p");
    			b3 = element("b");
    			b3.textContent = "5";
    			t7 = space();
    			div2 = element("div");
    			h42 = element("h4");
    			b4 = element("b");
    			b4.textContent = "Lvl3 Solved";
    			t9 = space();
    			p2 = element("p");
    			b5 = element("b");
    			b5.textContent = "15";
    			add_location(b0, file$s, 3, 5, 112);
    			attr_dev(h40, "class", "svelte-gz3vef");
    			add_location(h40, file$s, 3, 1, 108);
    			add_location(b1, file$s, 5, 2, 143);
    			attr_dev(p0, "class", "svelte-gz3vef");
    			add_location(p0, file$s, 4, 1, 137);
    			attr_dev(div0, "class", "stat svelte-gz3vef");
    			add_location(div0, file$s, 2, 0, 86);
    			add_location(b2, file$s, 12, 5, 200);
    			attr_dev(h41, "class", "svelte-gz3vef");
    			add_location(h41, file$s, 12, 1, 196);
    			add_location(b3, file$s, 14, 2, 231);
    			attr_dev(p1, "class", "svelte-gz3vef");
    			add_location(p1, file$s, 13, 1, 225);
    			attr_dev(div1, "class", "stat svelte-gz3vef");
    			add_location(div1, file$s, 11, 0, 174);
    			add_location(b4, file$s, 21, 5, 287);
    			attr_dev(h42, "class", "svelte-gz3vef");
    			add_location(h42, file$s, 21, 1, 283);
    			add_location(b5, file$s, 23, 2, 318);
    			attr_dev(p2, "class", "svelte-gz3vef");
    			add_location(p2, file$s, 22, 1, 312);
    			attr_dev(div2, "class", "stat svelte-gz3vef");
    			add_location(div2, file$s, 20, 0, 261);
    			attr_dev(div3, "style", div3_style_value = "color : " + /*settings*/ ctx[0].accentColour.toLowerCase() + ";");
    			attr_dev(div3, "class", "fill svelte-gz3vef");
    			add_location(div3, file$s, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h40);
    			append_dev(h40, b0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, b1);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, h41);
    			append_dev(h41, b2);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, b3);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, h42);
    			append_dev(h42, b4);
    			append_dev(div2, t9);
    			append_dev(div2, p2);
    			append_dev(p2, b5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*settings*/ 1 && div3_style_value !== (div3_style_value = "color : " + /*settings*/ ctx[0].accentColour.toLowerCase() + ";")) {
    				attr_dev(div3, "style", div3_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Stats", slots, []);
    	let { settings } = $$props;
    	const writable_props = ["settings"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stats> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	$$self.$capture_state = () => ({ Divider, settings });

    	$$self.$inject_state = $$props => {
    		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [settings];
    }

    class Stats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { settings: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stats",
    			options,
    			id: create_fragment$t.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*settings*/ ctx[0] === undefined && !("settings" in props)) {
    			console.warn("<Stats> was created without expected prop 'settings'");
    		}
    	}

    	get settings() {
    		throw new Error("<Stats>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Stats>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Play.svelte generated by Svelte v3.29.7 */

    const file$t = "src\\Play.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[11] = list;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (105:3) <span slot="title">
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Play";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$t, 104, 3, 1513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(105:3) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (121:5) {#each board as cell, x}
    function create_each_block_1$2(ctx) {
    	let input;
    	let input_disabled_value;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[4].call(input, /*y*/ ctx[9], /*x*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			input.disabled = input_disabled_value = /*notEditable*/ ctx[3][/*y*/ ctx[9]][/*x*/ ctx[12]];
    			attr_dev(input, "class", "svelte-1oxv11");
    			add_location(input, file$t, 121, 5, 1755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*boards*/ ctx[2][/*y*/ ctx[9]][/*x*/ ctx[12]]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*notEditable*/ 8 && input_disabled_value !== (input_disabled_value = /*notEditable*/ ctx[3][/*y*/ ctx[9]][/*x*/ ctx[12]])) {
    				prop_dev(input, "disabled", input_disabled_value);
    			}

    			if (dirty & /*boards*/ 4 && input.value !== /*boards*/ ctx[2][/*y*/ ctx[9]][/*x*/ ctx[12]]) {
    				set_input_value(input, /*boards*/ ctx[2][/*y*/ ctx[9]][/*x*/ ctx[12]]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(121:5) {#each board as cell, x}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#each boards as board, y}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*board*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row");
    			add_location(div, file$t, 119, 4, 1700);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notEditable, boards*/ 12) {
    				each_value_1 = /*board*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(119:4) {#each boards as board, y}",
    		ctx
    	});

    	return block;
    }

    // (131:2) <Button>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Undo");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(131:2) <Button>",
    		ctx
    	});

    	return block;
    }

    // (134:2) <Button>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hint");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(134:2) <Button>",
    		ctx
    	});

    	return block;
    }

    // (141:4) <Button class="red-text" on:click={onClose} text>
    function create_default_slot_1$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Exit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(141:4) <Button class=\\\"red-text\\\" on:click={onClose} text>",
    		ctx
    	});

    	return block;
    }

    // (102:0) <Dialog fullscreen bind:active>
    function create_default_slot$8(ctx) {
    	let appbar;
    	let t0;
    	let div3;
    	let h3;
    	let b0;
    	let t2;
    	let br0;
    	let t3;
    	let div0;
    	let t4;
    	let br1;
    	let t5;
    	let div1;
    	let button0;
    	let t6;
    	let button1;
    	let t7;
    	let b1;
    	let t9;
    	let div2;
    	let button2;
    	let current;

    	appbar = new AppBar({
    			props: {
    				$$slots: { title: [create_title_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*boards*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				class: "red-text",
    				text: true,
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", function () {
    		if (is_function(/*onClose*/ ctx[1])) /*onClose*/ ctx[1].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(appbar.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			b0 = element("b");
    			b0.textContent = "00:00";
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			div1 = element("div");
    			create_component(button0.$$.fragment);
    			t6 = space();
    			create_component(button1.$$.fragment);
    			t7 = space();
    			b1 = element("b");
    			b1.textContent = "3";
    			t9 = space();
    			div2 = element("div");
    			create_component(button2.$$.fragment);
    			add_location(b0, file$t, 110, 2, 1605);
    			attr_dev(h3, "class", "timer svelte-1oxv11");
    			add_location(h3, file$t, 109, 1, 1584);
    			add_location(br0, file$t, 115, 1, 1634);
    			attr_dev(div0, "class", "board svelte-1oxv11");
    			add_location(div0, file$t, 117, 2, 1645);
    			add_location(br1, file$t, 127, 1, 1884);
    			attr_dev(b1, "class", "hints svelte-1oxv11");
    			add_location(b1, file$t, 136, 2, 1980);
    			attr_dev(div1, "class", "buttons svelte-1oxv11");
    			add_location(div1, file$t, 129, 1, 1894);
    			attr_dev(div2, "class", "footer svelte-1oxv11");
    			add_location(div2, file$t, 138, 3, 2014);
    			attr_dev(div3, "class", "container svelte-1oxv11");
    			add_location(div3, file$t, 107, 0, 1557);
    		},
    		m: function mount(target, anchor) {
    			mount_component(appbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h3);
    			append_dev(h3, b0);
    			append_dev(div3, t2);
    			append_dev(div3, br0);
    			append_dev(div3, t3);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t4);
    			append_dev(div3, br1);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			mount_component(button0, div1, null);
    			append_dev(div1, t6);
    			mount_component(button1, div1, null);
    			append_dev(div1, t7);
    			append_dev(div1, b1);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			mount_component(button2, div2, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const appbar_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				appbar_changes.$$scope = { dirty, ctx };
    			}

    			appbar.$set(appbar_changes);

    			if (dirty & /*boards, notEditable*/ 12) {
    				each_value = /*boards*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appbar.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appbar.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(102:0) <Dialog fullscreen bind:active>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let dialog;
    	let updating_active;
    	let current;

    	function dialog_active_binding(value) {
    		/*dialog_active_binding*/ ctx[5].call(null, value);
    	}

    	let dialog_props = {
    		fullscreen: true,
    		$$slots: { default: [create_default_slot$8] },
    		$$scope: { ctx }
    	};

    	if (/*active*/ ctx[0] !== void 0) {
    		dialog_props.active = /*active*/ ctx[0];
    	}

    	dialog = new Dialog({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, "active", dialog_active_binding));

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dialog_changes = {};

    			if (dirty & /*$$scope, onClose, boards, notEditable*/ 8206) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*active*/ 1) {
    				updating_active = true;
    				dialog_changes.active = /*active*/ ctx[0];
    				add_flush_callback(() => updating_active = false);
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Play", slots, []);
    	let { active } = $$props;
    	let { onClose } = $$props;

    	let boards = [
    		[8, "", 5, 4, 1, 6, 9, 2, 7],
    		[2, 9, "", 8, 5, 7, "", 3, ""],
    		[4, 1, 7, 2, 9, 3, 6, 5, 8],
    		[5, 6, 9, "", 3, 4, 7, 8, 2],
    		[1, 2, "", 6, 7, 8, 5, 4, 9],
    		[7, 4, 8, 5, "", 9, 1, 6, 3],
    		[6, 5, 2, 7, 8, 1, 3, 9, 4],
    		[9, 8, 1, "", 4, 5, 2, "", 6],
    		["", 7, 4, 9, 6, 2, 8, 1, 5]
    	];

    	let notEditable = [];
    	set();

    	function set() {
    		$$invalidate(3, notEditable = []);

    		for (var i = 0; i < boards.length; i++) {
    			var holder = [];

    			for (var t = 0; t < boards[i].length; t++) {
    				if (boards[i][t] == "") {
    					holder.push(false);
    				} else {
    					holder.push(true);
    				}
    			}

    			notEditable.push(holder);
    		}
    	}

    	const writable_props = ["active", "onClose"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Play> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(y, x) {
    		boards[y][x] = this.value;
    		$$invalidate(2, boards);
    	}

    	function dialog_active_binding(value) {
    		active = value;
    		$$invalidate(0, active);
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("onClose" in $$props) $$invalidate(1, onClose = $$props.onClose);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Dialog,
    		Card,
    		CardText,
    		CardActions,
    		Footer,
    		AppBar,
    		active,
    		onClose,
    		boards,
    		notEditable,
    		set
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("onClose" in $$props) $$invalidate(1, onClose = $$props.onClose);
    		if ("boards" in $$props) $$invalidate(2, boards = $$props.boards);
    		if ("notEditable" in $$props) $$invalidate(3, notEditable = $$props.notEditable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		active,
    		onClose,
    		boards,
    		notEditable,
    		input_input_handler,
    		dialog_active_binding
    	];
    }

    class Play extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, { active: 0, onClose: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Play",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<Play> was created without expected prop 'active'");
    		}

    		if (/*onClose*/ ctx[1] === undefined && !("onClose" in props)) {
    			console.warn("<Play> was created without expected prop 'onClose'");
    		}
    	}

    	get active() {
    		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<Play>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<Play>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.7 */

    const { console: console_1$1 } = globals;
    const file$u = "src\\App.svelte";

    // (59:2) <span slot="title">
    function create_title_slot$1(ctx) {
    	let span;
    	let t_value = /*pages*/ ctx[3][/*appState*/ ctx[0].currentPage] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "slot", "title");
    			add_location(span, file$u, 58, 2, 1034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*appState*/ 1 && t_value !== (t_value = /*pages*/ ctx[3][/*appState*/ ctx[0].currentPage] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$1.name,
    		type: "slot",
    		source: "(59:2) <span slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (65:3) <Tab>
    function create_default_slot_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$2.name,
    		type: "slot",
    		source: "(65:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (66:3) <Tab>
    function create_default_slot_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Stats");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(66:3) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (64:2) <div slot="tabs">
    function create_tabs_slot(ctx) {
    	let div;
    	let tab0;
    	let t;
    	let tab1;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_3$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    			attr_dev(div, "slot", "tabs");
    			add_location(div, file$u, 63, 2, 1243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tab0, div, null);
    			append_dev(div, t);
    			mount_component(tab1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tab0);
    			destroy_component(tab1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tabs_slot.name,
    		type: "slot",
    		source: "(64:2) <div slot=\\\"tabs\\\">",
    		ctx
    	});

    	return block;
    }

    // (78:2) {#if appState.currentPage == 1}
    function create_if_block_1$6(ctx) {
    	let stats;
    	let current;

    	stats = new Stats({
    			props: { settings: /*appState*/ ctx[0].settings },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(stats.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stats, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stats_changes = {};
    			if (dirty & /*appState*/ 1) stats_changes.settings = /*appState*/ ctx[0].settings;
    			stats.$set(stats_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stats.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stats.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stats, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(78:2) {#if appState.currentPage == 1}",
    		ctx
    	});

    	return block;
    }

    // (74:2) {#if appState.currentPage == 0}
    function create_if_block$d(ctx) {
    	let settings;
    	let t;
    	let start_1;
    	let current;

    	settings = new Settings({
    			props: {
    				onHelperChange: /*switchHelper*/ ctx[6],
    				settings: /*appState*/ ctx[0].settings,
    				onClick: /*updateColour*/ ctx[4]
    			},
    			$$inline: true
    		});

    	start_1 = new Start({
    			props: {
    				settings: /*appState*/ ctx[0].settings,
    				onClick: /*start*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(settings.$$.fragment);
    			t = space();
    			create_component(start_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(start_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const settings_changes = {};
    			if (dirty & /*appState*/ 1) settings_changes.settings = /*appState*/ ctx[0].settings;
    			settings.$set(settings_changes);
    			const start_1_changes = {};
    			if (dirty & /*appState*/ 1) start_1_changes.settings = /*appState*/ ctx[0].settings;
    			start_1.$set(start_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);
    			transition_in(start_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			transition_out(start_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(start_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(74:2) {#if appState.currentPage == 0}",
    		ctx
    	});

    	return block;
    }

    // (57:0) <MaterialApp {theme}>
    function create_default_slot$9(ctx) {
    	let appbar;
    	let t0;
    	let div;
    	let tabs;
    	let t1;
    	let play;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	appbar = new AppBar({
    			props: {
    				style: "border-radius : 10px;",
    				$$slots: { title: [create_title_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs = new Tabs({
    			props: {
    				grow: true,
    				class: /*appState*/ ctx[0].settings.accentColour.toLowerCase() + "-text",
    				$$slots: { tabs: [create_tabs_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs.$on("change", /*change_handler*/ ctx[9]);

    	play = new Play({
    			props: {
    				active: /*playActive*/ ctx[1],
    				onClose: /*stop*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$d, create_if_block_1$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*appState*/ ctx[0].currentPage == 0) return 0;
    		if (/*appState*/ ctx[0].currentPage == 1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(appbar.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			t1 = space();
    			create_component(play.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "nav svelte-f7phcp");
    			add_location(div, file$u, 61, 1, 1103);
    		},
    		m: function mount(target, anchor) {
    			mount_component(appbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(tabs, div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(play, target, anchor);
    			insert_dev(target, t2, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const appbar_changes = {};

    			if (dirty & /*$$scope, appState*/ 1025) {
    				appbar_changes.$$scope = { dirty, ctx };
    			}

    			appbar.$set(appbar_changes);
    			const tabs_changes = {};
    			if (dirty & /*appState*/ 1) tabs_changes.class = /*appState*/ ctx[0].settings.accentColour.toLowerCase() + "-text";

    			if (dirty & /*$$scope*/ 1024) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    			const play_changes = {};
    			if (dirty & /*playActive*/ 2) play_changes.active = /*playActive*/ ctx[1];
    			play.$set(play_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appbar.$$.fragment, local);
    			transition_in(tabs.$$.fragment, local);
    			transition_in(play.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appbar.$$.fragment, local);
    			transition_out(tabs.$$.fragment, local);
    			transition_out(play.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(tabs);
    			if (detaching) detach_dev(t1);
    			destroy_component(play, detaching);
    			if (detaching) detach_dev(t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(57:0) <MaterialApp {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let materialapp;
    	let current;

    	materialapp = new MaterialApp({
    			props: {
    				theme: /*theme*/ ctx[2],
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialapp.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialapp, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialapp_changes = {};

    			if (dirty & /*$$scope, appState, playActive*/ 1027) {
    				materialapp_changes.$$scope = { dirty, ctx };
    			}

    			materialapp.$set(materialapp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialapp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialapp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialapp, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let theme = "light";

    	//let current = 0;
    	let pages = ["Start", "Stats", "Settings"];

    	function updateColour() {
    		$$invalidate(0, appState);
    		console.log("run");
    	}

    	let appState = {
    		settings: { helper: false, accentColour: "Blue" },
    		currentPage: 0
    	};

    	function check(val) {
    		$$invalidate(0, appState.currentPage = val, appState);
    	}

    	function switchHelper(val) {
    		$$invalidate(0, appState.settings.helper = !appState.settings.helper, appState);
    		console.log(appState.settings.helper);
    	}

    	let playActive = false;

    	function start() {
    		$$invalidate(1, playActive = true);
    	}

    	function stop() {
    		$$invalidate(1, playActive = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const change_handler = val => {
    		check(val.detail);
    	};

    	$$self.$capture_state = () => ({
    		MaterialApp,
    		AppBar,
    		Divider,
    		Button,
    		Tabs,
    		Tab,
    		Switch,
    		Settings,
    		Start,
    		Stats,
    		Play,
    		theme,
    		pages,
    		updateColour,
    		appState,
    		check,
    		switchHelper,
    		playActive,
    		start,
    		stop
    	});

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(2, theme = $$props.theme);
    		if ("pages" in $$props) $$invalidate(3, pages = $$props.pages);
    		if ("appState" in $$props) $$invalidate(0, appState = $$props.appState);
    		if ("playActive" in $$props) $$invalidate(1, playActive = $$props.playActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		appState,
    		playActive,
    		theme,
    		pages,
    		updateColour,
    		check,
    		switchHelper,
    		start,
    		stop,
    		change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
