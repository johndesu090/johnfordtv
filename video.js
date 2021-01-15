/**
 * @license
 * Video.js 7.10.2 <http://videojs.com/>
 * Copyright Brightcove, Inc. <https://www.brightcove.com/>
 * Available under Apache License Version 2.0
 * <https://github.com/videojs/video.js/blob/master/LICENSE>
 *
 * Includes vtt.js <https://github.com/mozilla/vtt.js>
 * Available under Apache License Version 2.0
 * <https://github.com/mozilla/vtt.js/blob/master/LICENSE>
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('global/window'), require('global/document')) :
  typeof define === 'function' && define.amd ? define(['global/window', 'global/document'], factory) :
  (global = global || self, global.videojs = factory(global.window, global.document));
}(this, (function (window$1, document) { 'use strict';

  window$1 = window$1 && Object.prototype.hasOwnProperty.call(window$1, 'default') ? window$1['default'] : window$1;
  document = document && Object.prototype.hasOwnProperty.call(document, 'default') ? document['default'] : document;

  var version = "7.10.2";

  /**
   * @file create-logger.js
   * @module create-logger
   */

  var history = [];
  /**
   * Log messages to the console and history based on the type of message
   *
   * @private
   * @param  {string} type
   *         The name of the console method to use.
   *
   * @param  {Array} args
   *         The arguments to be passed to the matching console method.
   */

  var LogByTypeFactory = function LogByTypeFactory(name, log) {
    return function (type, level, args) {
      var lvl = log.levels[level];
      var lvlRegExp = new RegExp("^(" + lvl + ")$");

      if (type !== 'log') {
        // Add the type to the front of the message when it's not "log".
        args.unshift(type.toUpperCase() + ':');
      } // Add console prefix after adding to history.


      args.unshift(name + ':'); // Add a clone of the args at this point to history.

      if (history) {
        history.push([].concat(args)); // only store 1000 history entries

        var splice = history.length - 1000;
        history.splice(0, splice > 0 ? splice : 0);
      } // If there's no console then don't try to output messages, but they will
      // still be stored in history.


      if (!window$1.console) {
        return;
      } // Was setting these once outside of this function, but containing them
      // in the function makes it easier to test cases where console doesn't exist
      // when the module is executed.


      var fn = window$1.console[type];

      if (!fn && type === 'debug') {
        // Certain browsers don't have support for console.debug. For those, we
        // should default to the closest comparable log.
        fn = window$1.console.info || window$1.console.log;
      } // Bail out if there's no console or if this type is not allowed by the
      // current logging level.


      if (!fn || !lvl || !lvlRegExp.test(type)) {
        return;
      }

      fn[Array.isArray(args) ? 'apply' : 'call'](window$1.console, args);
    };
  };

  function createLogger(name) {
    // This is the private tracking variable for logging level.
    var level = 'info'; // the curried logByType bound to the specific log and history

    var logByType;
    /**
     * Logs plain debug messages. Similar to `console.log`.
     *
     * Due to [limitations](https://github.com/jsdoc3/jsdoc/issues/955#issuecomment-313829149)
     * of our JSDoc template, we cannot properly document this as both a function
     * and a namespace, so its function signature is documented here.
     *
     * #### Arguments
     * ##### *args
     * Mixed[]
     *
     * Any combination of values that could be passed to `console.log()`.
     *
     * #### Return Value
     *
     * `undefined`
     *
     * @namespace
     * @param    {Mixed[]} args
     *           One or more messages or objects that should be logged.
     */

    var log = function log() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      logByType('log', level, args);
    }; // This is the logByType helper that the logging methods below use


    logByType = LogByTypeFactory(name, log);
    /**
     * Create a new sublogger which chains the old name to the new name.
     *
     * For example, doing `videojs.log.createLogger('player')` and then using that logger will log the following:
     * ```js
     *  mylogger('foo');
     *  // > VIDEOJS: player: foo
     * ```
     *
     * @param {string} name
     *        The name to add call the new logger
     * @return {Object}
     */

    log.createLogger = function (subname) {
      return createLogger(name + ': ' + subname);
    };
    /**
     * Enumeration of available logging levels, where the keys are the level names
     * and the values are `|`-separated strings containing logging methods allowed
     * in that logging level. These strings are used to create a regular expression
     * matching the function name being called.
     *
     * Levels provided by Video.js are:
     *
     * - `off`: Matches no calls. Any value that can be cast to `false` will have
     *   this effect. The most restrictive.
     * - `all`: Matches only Video.js-provided functions (`debug`, `log`,
     *   `log.warn`, and `log.error`).
     * - `debug`: Matches `log.debug`, `log`, `log.warn`, and `log.error` calls.
     * - `info` (default): Matches `log`, `log.warn`, and `log.error` calls.
     * - `warn`: Matches `log.warn` and `log.error` calls.
     * - `error`: Matches only `log.error` calls.
     *
     * @type {Object}
     */


    log.levels = {
      all: 'debug|log|warn|error',
      off: '',
      debug: 'debug|log|warn|error',
      info: 'log|warn|error',
      warn: 'warn|error',
      error: 'error',
      DEFAULT: level
    };
    /**
     * Get or set the current logging level.
     *
     * If a string matching a key from {@link module:log.levels} is provided, acts
     * as a setter.
     *
     * @param  {string} [lvl]
     *         Pass a valid level to set a new logging level.
     *
     * @return {string}
     *         The current logging level.
     */

    log.level = function (lvl) {
      if (typeof lvl === 'string') {
        if (!log.levels.hasOwnProperty(lvl)) {
          throw new Error("\"" + lvl + "\" in not a valid log level");
        }

        level = lvl;
      }

      return level;
    };
    /**
     * Returns an array containing everything that has been logged to the history.
     *
     * This array is a shallow clone of the internal history record. However, its
     * contents are _not_ cloned; so, mutating objects inside this array will
     * mutate them in history.
     *
     * @return {Array}
     */


    log.history = function () {
      return history ? [].concat(history) : [];
    };
    /**
     * Allows you to filter the history by the given logger name
     *
     * @param {string} fname
     *        The name to filter by
     *
     * @return {Array}
     *         The filtered list to return
     */


    log.history.filter = function (fname) {
      return (history || []).filter(function (historyItem) {
        // if the first item in each historyItem includes `fname`, then it's a match
        return new RegExp(".*" + fname + ".*").test(historyItem[0]);
      });
    };
    /**
     * Clears the internal history tracking, but does not prevent further history
     * tracking.
     */


    log.history.clear = function () {
      if (history) {
        history.length = 0;
      }
    };
    /**
     * Disable history tracking if it is currently enabled.
     */


    log.history.disable = function () {
      if (history !== null) {
        history.length = 0;
        history = null;
      }
    };
    /**
     * Enable history tracking if it is currently disabled.
     */


    log.history.enable = function () {
      if (history === null) {
        history = [];
      }
    };
    /**
     * Logs error messages. Similar to `console.error`.
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as an error
     */


    log.error = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return logByType('error', level, args);
    };
    /**
     * Logs warning messages. Similar to `console.warn`.
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as a warning.
     */


    log.warn = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return logByType('warn', level, args);
    };
    /**
     * Logs debug messages. Similar to `console.debug`, but may also act as a comparable
     * log if `console.debug` is not available
     *
     * @param {Mixed[]} args
     *        One or more messages or objects that should be logged as debug.
     */


    log.debug = function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return logByType('debug', level, args);
    };

    return log;
  }

  /**
   * @file log.js
   * @module log
   */
  var log = createLogger('VIDEOJS');
  var createLogger$1 = log.createLogger;

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _extends_1 = createCommonjsModule(function (module) {
    function _extends() {
      module.exports = _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }

        return target;
      };

      return _extends.apply(this, arguments);
    }

    module.exports = _extends;
  });

  /**
   * @file obj.js
   * @module obj
   */

  /**
   * @callback obj:EachCallback
   *
   * @param {Mixed} value
   *        The current key for the object that is being iterated over.
   *
   * @param {string} key
   *        The current key-value for object that is being iterated over
   */

  /**
   * @callback obj:ReduceCallback
   *
   * @param {Mixed} accum
   *        The value that is accumulating over the reduce loop.
   *
   * @param {Mixed} value
   *        The current key for the object that is being iterated over.
   *
   * @param {string} key
   *        The current key-value for object that is being iterated over
   *
   * @return {Mixed}
   *         The new accumulated value.
   */
  var toString = Object.prototype.toString;
  /**
   * Get the keys of an Object
   *
   * @param {Object}
   *        The Object to get the keys from
   *
   * @return {string[]}
   *         An array of the keys from the object. Returns an empty array if the
   *         object passed in was invalid or had no keys.
   *
   * @private
   */

  var keys = function keys(object) {
    return isObject(object) ? Object.keys(object) : [];
  };
  /**
   * Array-like iteration for objects.
   *
   * @param {Object} object
   *        The object to iterate over
   *
   * @param {obj:EachCallback} fn
   *        The callback function which is called for each key in the object.
   */


  function each(object, fn) {
    keys(object).forEach(function (key) {
      return fn(object[key], key);
    });
  }
  /**
   * Array-like reduce for objects.
   *
   * @param {Object} object
   *        The Object that you want to reduce.
   *
   * @param {Function} fn
   *         A callback function which is called for each key in the object. It
   *         receives the accumulated value and the per-iteration value and key
   *         as arguments.
   *
   * @param {Mixed} [initial = 0]
   *        Starting value
   *
   * @return {Mixed}
   *         The final accumulated value.
   */

  function reduce(object, fn, initial) {
    if (initial === void 0) {
      initial = 0;
    }

    return keys(object).reduce(function (accum, key) {
      return fn(accum, object[key], key);
    }, initial);
  }
  /**
   * Object.assign-style object shallow merge/extend.
   *
   * @param  {Object} target
   * @param  {Object} ...sources
   * @return {Object}
   */

  function assign(target) {
    for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      sources[_key - 1] = arguments[_key];
    }

    if (Object.assign) {
      return _extends_1.apply(void 0, [target].concat(sources));
    }

    sources.forEach(function (source) {
      if (!source) {
        return;
      }

      each(source, function (value, key) {
        target[key] = value;
      });
    });
    return target;
  }
  /**
   * Returns whether a value is an object of any kind - including DOM nodes,
   * arrays, regular expressions, etc. Not functions, though.
   *
   * This avoids the gotcha where using `typeof` on a `null` value
   * results in `'object'`.
   *
   * @param  {Object} value
   * @return {boolean}
   */

  function isObject(value) {
    return !!value && typeof value === 'object';
  }
  /**
   * Returns whether an object appears to be a "plain" object - that is, a
   * direct instance of `Object`.
   *
   * @param  {Object} value
   * @return {boolean}
   */

  function isPlain(value) {
    return isObject(value) && toString.call(value) === '[object Object]' && value.constructor === Object;
  }

  /**
   * @file computed-style.js
   * @module computed-style
   */
  /**
   * A safe getComputedStyle.
   *
   * This is needed because in Firefox, if the player is loaded in an iframe with
   * `display:none`, then `getComputedStyle` returns `null`, so, we do a
   * null-check to make sure that the player doesn't break in these cases.
   *
   * @function
   * @param    {Element} el
   *           The element you want the computed style of
   *
   * @param    {string} prop
   *           The property name you want
   *
   * @see      https://bugzilla.mozilla.org/show_bug.cgi?id=548397
   */

  function computedStyle(el, prop) {
    if (!el || !prop) {
      return '';
    }

    if (typeof window$1.getComputedStyle === 'function') {
      var computedStyleValue = window$1.getComputedStyle(el);
      return computedStyleValue ? computedStyleValue.getPropertyValue(prop) || computedStyleValue[prop] : '';
    }

    return '';
  }

  /**
   * @file dom.js
   * @module dom
   */
  /**
   * Detect if a value is a string with any non-whitespace characters.
   *
   * @private
   * @param  {string} str
   *         The string to check
   *
   * @return {boolean}
   *         Will be `true` if the string is non-blank, `false` otherwise.
   *
   */

  function isNonBlankString(str) {
    // we use str.trim as it will trim any whitespace characters
    // from the front or back of non-whitespace characters. aka
    // Any string that contains non-whitespace characters will
    // still contain them after `trim` but whitespace only strings
    // will have a length of 0, failing this check.
    return typeof str === 'string' && Boolean(str.trim());
  }
  /**
   * Throws an error if the passed string has whitespace. This is used by
   * class methods to be relatively consistent with the classList API.
   *
   * @private
   * @param  {string} str
   *         The string to check for whitespace.
   *
   * @throws {Error}
   *         Throws an error if there is whitespace in the string.
   */


  function throwIfWhitespace(str) {
    // str.indexOf instead of regex because str.indexOf is faster performance wise.
    if (str.indexOf(' ') >= 0) {
      throw new Error('class has illegal whitespace characters');
    }
  }
  /**
   * Produce a regular expression for matching a className within an elements className.
   *
   * @private
   * @param  {string} className
   *         The className to generate the RegExp for.
   *
   * @return {RegExp}
   *         The RegExp that will check for a specific `className` in an elements
   *         className.
   */


  function classRegExp(className) {
    return new RegExp('(^|\\s)' + className + '($|\\s)');
  }
  /**
   * Whether the current DOM interface appears to be real (i.e. not simulated).
   *
   * @return {boolean}
   *         Will be `true` if the DOM appears to be real, `false` otherwise.
   */


  function isReal() {
    // Both document and window will never be undefined thanks to `global`.
    return document === window$1.document;
  }
  /**
   * Determines, via duck typing, whether or not a value is a DOM element.
   *
   * @param  {Mixed} value
   *         The value to check.
   *
   * @return {boolean}
   *         Will be `true` if the value is a DOM element, `false` otherwise.
   */

  function isEl(value) {
    return isObject(value) && value.nodeType === 1;
  }
  /**
   * Determines if the current DOM is embedded in an iframe.
   *
   * @return {boolean}
   *         Will be `true` if the DOM is embedded in an iframe, `false`
   *         otherwise.
   */

  function isInFrame() {
    // We need a try/catch here because Safari will throw errors when attempting
    // to get either `parent` or `self`
    try {
      return window$1.parent !== window$1.self;
    } catch (x) {
      return true;
    }
  }
  /**
   * Creates functions to query the DOM using a given method.
   *
   * @private
   * @param   {string} method
   *          The method to create the query with.
   *
   * @return  {Function}
   *          The query method
   */

  function createQuerier(method) {
    return function (selector, context) {
      if (!isNonBlankString(selector)) {
        return document[method](null);
      }

      if (isNonBlankString(context)) {
        context = document.querySelector(context);
      }

      var ctx = isEl(context) ? context : document;
      return ctx[method] && ctx[method](selector);
    };
  }
  /**
   * Creates an element and applies properties, attributes, and inserts content.
   *
   * @param  {string} [tagName='div']
   *         Name of tag to be created.
   *
   * @param  {Object} [properties={}]
   *         Element properties to be applied.
   *
   * @param  {Object} [attributes={}]
   *         Element attributes to be applied.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor object.
   *
   * @return {Element}
   *         The element that was created.
   */


  function createEl(tagName, properties, attributes, content) {
    if (tagName === void 0) {
      tagName = 'div';
    }

    if (properties === void 0) {
      properties = {};
    }

    if (attributes === void 0) {
      attributes = {};
    }

    var el = document.createElement(tagName);
    Object.getOwnPropertyNames(properties).forEach(function (propName) {
      var val = properties[propName]; // See #2176
      // We originally were accepting both properties and attributes in the
      // same object, but that doesn't work so well.

      if (propName.indexOf('aria-') !== -1 || propName === 'role' || propName === 'type') {
        log.warn('Setting attributes in the second argument of createEl()\n' + 'has been deprecated. Use the third argument instead.\n' + ("createEl(type, properties, attributes). Attempting to set " + propName + " to " + val + "."));
        el.setAttribute(propName, val); // Handle textContent since it's not supported everywhere and we have a
        // method for it.
      } else if (propName === 'textContent') {
        textContent(el, val);
      } else if (el[propName] !== val) {
        el[propName] = val;
      }
    });
    Object.getOwnPropertyNames(attributes).forEach(function (attrName) {
      el.setAttribute(attrName, attributes[attrName]);
    });

    if (content) {
      appendContent(el, content);
    }

    return el;
  }
  /**
   * Injects text into an element, replacing any existing contents entirely.
   *
   * @param  {Element} el
   *         The element to add text content into
   *
   * @param  {string} text
   *         The text content to add.
   *
   * @return {Element}
   *         The element with added text content.
   */

  function textContent(el, text) {
    if (typeof el.textContent === 'undefined') {
      el.innerText = text;
    } else {
      el.textContent = text;
    }

    return el;
  }
  /**
   * Insert an element as the first child node of another
   *
   * @param {Element} child
   *        Element to insert
   *
   * @param {Element} parent
   *        Element to insert child into
   */

  function prependTo(child, parent) {
    if (parent.firstChild) {
      parent.insertBefore(child, parent.firstChild);
    } else {
      parent.appendChild(child);
    }
  }
  /**
   * Check if an element has a class name.
   *
   * @param  {Element} element
   *         Element to check
   *
   * @param  {string} classToCheck
   *         Class name to check for
   *
   * @return {boolean}
   *         Will be `true` if the element has a class, `false` otherwise.
   *
   * @throws {Error}
   *         Throws an error if `classToCheck` has white space.
   */

  function hasClass(element, classToCheck) {
    throwIfWhitespace(classToCheck);

    if (element.classList) {
      return element.classList.contains(classToCheck);
    }

    return classRegExp(classToCheck).test(element.className);
  }
  /**
   * Add a class name to an element.
   *
   * @param  {Element} element
   *         Element to add class name to.
   *
   * @param  {string} classToAdd
   *         Class name to add.
   *
   * @return {Element}
   *         The DOM element with the added class name.
   */

  function addClass(element, classToAdd) {
    if (element.classList) {
      element.classList.add(classToAdd); // Don't need to `throwIfWhitespace` here because `hasElClass` will do it
      // in the case of classList not being supported.
    } else if (!hasClass(element, classToAdd)) {
      element.className = (element.className + ' ' + classToAdd).trim();
    }

    return element;
  }
  /**
   * Remove a class name from an element.
   *
   * @param  {Element} element
   *         Element to remove a class name from.
   *
   * @param  {string} classToRemove
   *         Class name to remove
   *
   * @return {Element}
   *         The DOM element with class name removed.
   */

  function removeClass(element, classToRemove) {
    if (element.classList) {
      element.classList.remove(classToRemove);
    } else {
      throwIfWhitespace(classToRemove);
      element.className = element.className.split(/\s+/).filter(function (c) {
        return c !== classToRemove;
      }).join(' ');
    }

    return element;
  }
  /**
   * The callback definition for toggleClass.
   *
   * @callback module:dom~PredicateCallback
   * @param    {Element} element
   *           The DOM element of the Component.
   *
   * @param    {string} classToToggle
   *           The `className` that wants to be toggled
   *
   * @return   {boolean|undefined}
   *           If `true` is returned, the `classToToggle` will be added to the
   *           `element`. If `false`, the `classToToggle` will be removed from
   *           the `element`. If `undefined`, the callback will be ignored.
   */

  /**
   * Adds or removes a class name to/from an element depending on an optional
   * condition or the presence/absence of the class name.
   *
   * @param  {Element} element
   *         The element to toggle a class name on.
   *
   * @param  {string} classToToggle
   *         The class that should be toggled.
   *
   * @param  {boolean|module:dom~PredicateCallback} [predicate]
   *         See the return value for {@link module:dom~PredicateCallback}
   *
   * @return {Element}
   *         The element with a class that has been toggled.
   */

  function toggleClass(element, classToToggle, predicate) {
    // This CANNOT use `classList` internally because IE11 does not support the
    // second parameter to the `classList.toggle()` method! Which is fine because
    // `classList` will be used by the add/remove functions.
    var has = hasClass(element, classToToggle);

    if (typeof predicate === 'function') {
      predicate = predicate(element, classToToggle);
    }

    if (typeof predicate !== 'boolean') {
      predicate = !has;
    } // If the necessary class operation matches the current state of the
    // element, no action is required.


    if (predicate === has) {
      return;
    }

    if (predicate) {
      addClass(element, classToToggle);
    } else {
      removeClass(element, classToToggle);
    }

    return element;
  }
  /**
   * Apply attributes to an HTML element.
   *
   * @param {Element} el
   *        Element to add attributes to.
   *
   * @param {Object} [attributes]
   *        Attributes to be applied.
   */

  function setAttributes(el, attributes) {
    Object.getOwnPropertyNames(attributes).forEach(function (attrName) {
      var attrValue = attributes[attrName];

      if (attrValue === null || typeof attrValue === 'undefined' || attrValue === false) {
        el.removeAttribute(attrName);
      } else {
        el.setAttribute(attrName, attrValue === true ? '' : attrValue);
      }
    });
  }
  /**
   * Get an element's attribute values, as defined on the HTML tag.
   *
   * Attributes are not the same as properties. They're defined on the tag
   * or with setAttribute.
   *
   * @param  {Element} tag
   *         Element from which to get tag attributes.
   *
   * @return {Object}
   *         All attributes of the element. Boolean attributes will be `true` or
   *         `false`, others will be strings.
   */

  function getAttributes(tag) {
    var obj = {}; // known boolean attributes
    // we can check for matching boolean properties, but not all browsers
    // and not all tags know about these attributes, so, we still want to check them manually

    var knownBooleans = ',' + 'autoplay,controls,playsinline,loop,muted,default,defaultMuted' + ',';

    if (tag && tag.attributes && tag.attributes.length > 0) {
      var attrs = tag.attributes;

      for (var i = attrs.length - 1; i >= 0; i--) {
        var attrName = attrs[i].name;
        var attrVal = attrs[i].value; // check for known booleans
        // the matching element property will return a value for typeof

        if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(',' + attrName + ',') !== -1) {
          // the value of an included boolean attribute is typically an empty
          // string ('') which would equal false if we just check for a false value.
          // we also don't want support bad code like autoplay='false'
          attrVal = attrVal !== null ? true : false;
        }

        obj[attrName] = attrVal;
      }
    }

    return obj;
  }
  /**
   * Get the value of an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to get the value of.
   *
   * @return {string}
   *         The value of the attribute.
   */

  function getAttribute(el, attribute) {
    return el.getAttribute(attribute);
  }
  /**
   * Set the value of an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to set.
   *
   * @param {string} value
   *        Value to set the attribute to.
   */

  function setAttribute(el, attribute, value) {
    el.setAttribute(attribute, value);
  }
  /**
   * Remove an element's attribute.
   *
   * @param {Element} el
   *        A DOM element.
   *
   * @param {string} attribute
   *        Attribute to remove.
   */

  function removeAttribute(el, attribute) {
    el.removeAttribute(attribute);
  }
  /**
   * Attempt to block the ability to select text.
   */

  function blockTextSelection() {
    document.body.focus();

    document.onselectstart = function () {
      return false;
    };
  }
  /**
   * Turn off text selection blocking.
   */

  function unblockTextSelection() {
    document.onselectstart = function () {
      return true;
    };
  }
  /**
   * Identical to the native `getBoundingClientRect` function, but ensures that
   * the method is supported at all (it is in all browsers we claim to support)
   * and that the element is in the DOM before continuing.
   *
   * This wrapper function also shims properties which are not provided by some
   * older browsers (namely, IE8).
   *
   * Additionally, some browsers do not support adding properties to a
   * `ClientRect`/`DOMRect` object; so, we shallow-copy it with the standard
   * properties (except `x` and `y` which are not widely supported). This helps
   * avoid implementations where keys are non-enumerable.
   *
   * @param  {Element} el
   *         Element whose `ClientRect` we want to calculate.
   *
   * @return {Object|undefined}
   *         Always returns a plain object - or `undefined` if it cannot.
   */

  function getBoundingClientRect(el) {
    if (el && el.getBoundingClientRect && el.parentNode) {
      var rect = el.getBoundingClientRect();
      var result = {};
      ['bottom', 'height', 'left', 'right', 'top', 'width'].forEach(function (k) {
        if (rect[k] !== undefined) {
          result[k] = rect[k];
        }
      });

      if (!result.height) {
        result.height = parseFloat(computedStyle(el, 'height'));
      }

      if (!result.width) {
        result.width = parseFloat(computedStyle(el, 'width'));
      }

      return result;
    }
  }
  /**
   * Represents the position of a DOM element on the page.
   *
   * @typedef  {Object} module:dom~Position
   *
   * @property {number} left
   *           Pixels to the left.
   *
   * @property {number} top
   *           Pixels from the top.
   */

  /**
   * Get the position of an element in the DOM.
   *
   * Uses `getBoundingClientRect` technique from John Resig.
   *
   * @see http://ejohn.org/blog/getboundingclientrect-is-awesome/
   *
   * @param  {Element} el
   *         Element from which to get offset.
   *
   * @return {module:dom~Position}
   *         The position of the element that was passed in.
   */

  function findPosition(el) {
    if (!el || el && !el.offsetParent) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      };
    }

    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var left = 0;
    var top = 0;

    do {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent;
    } while (el);

    return {
      left: left,
      top: top,
      width: width,
      height: height
    };
  }
  /**
   * Represents x and y coordinates for a DOM element or mouse pointer.
   *
   * @typedef  {Object} module:dom~Coordinates
   *
   * @property {number} x
   *           x coordinate in pixels
   *
   * @property {number} y
   *           y coordinate in pixels
   */

  /**
   * Get the pointer position within an element.
   *
   * The base on the coordinates are the bottom left of the element.
   *
   * @param  {Element} el
   *         Element on which to get the pointer position on.
   *
   * @param  {EventTarget~Event} event
   *         Event object.
   *
   * @return {module:dom~Coordinates}
   *         A coordinates object corresponding to the mouse position.
   *
   */

  function getPointerPosition(el, event) {
    var position = {};
    var boxTarget = findPosition(event.target);
    var box = findPosition(el);
    var boxW = box.width;
    var boxH = box.height;
    var offsetY = event.offsetY - (box.top - boxTarget.top);
    var offsetX = event.offsetX - (box.left - boxTarget.left);

    if (event.changedTouches) {
      offsetX = event.changedTouches[0].pageX - box.left;
      offsetY = event.changedTouches[0].pageY + box.top;
    }

    position.y = 1 - Math.max(0, Math.min(1, offsetY / boxH));
    position.x = Math.max(0, Math.min(1, offsetX / boxW));
    return position;
  }
  /**
   * Determines, via duck typing, whether or not a value is a text node.
   *
   * @param  {Mixed} value
   *         Check if this value is a text node.
   *
   * @return {boolean}
   *         Will be `true` if the value is a text node, `false` otherwise.
   */

  function isTextNode(value) {
    return isObject(value) && value.nodeType === 3;
  }
  /**
   * Empties the contents of an element.
   *
   * @param  {Element} el
   *         The element to empty children from
   *
   * @return {Element}
   *         The element with no children
   */

  function emptyEl(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    return el;
  }
  /**
   * This is a mixed value that describes content to be injected into the DOM
   * via some method. It can be of the following types:
   *
   * Type       | Description
   * -----------|-------------
   * `string`   | The value will be normalized into a text node.
   * `Element`  | The value will be accepted as-is.
   * `TextNode` | The value will be accepted as-is.
   * `Array`    | A one-dimensional array of strings, elements, text nodes, or functions. These functions should return a string, element, or text node (any other return value, like an array, will be ignored).
   * `Function` | A function, which is expected to return a string, element, text node, or array - any of the other possible values described above. This means that a content descriptor could be a function that returns an array of functions, but those second-level functions must return strings, elements, or text nodes.
   *
   * @typedef {string|Element|TextNode|Array|Function} module:dom~ContentDescriptor
   */

  /**
   * Normalizes content for eventual insertion into the DOM.
   *
   * This allows a wide range of content definition methods, but helps protect
   * from falling into the trap of simply writing to `innerHTML`, which could
   * be an XSS concern.
   *
   * The content for an element can be passed in multiple types and
   * combinations, whose behavior is as follows:
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Array}
   *         All of the content that was passed in, normalized to an array of
   *         elements or text nodes.
   */

  function normalizeContent(content) {
    // First, invoke content if it is a function. If it produces an array,
    // that needs to happen before normalization.
    if (typeof content === 'function') {
      content = content();
    } // Next up, normalize to an array, so one or many items can be normalized,
    // filtered, and returned.


    return (Array.isArray(content) ? content : [content]).map(function (value) {
      // First, invoke value if it is a function to produce a new value,
      // which will be subsequently normalized to a Node of some kind.
      if (typeof value === 'function') {
        value = value();
      }

      if (isEl(value) || isTextNode(value)) {
        return value;
      }

      if (typeof value === 'string' && /\S/.test(value)) {
        return document.createTextNode(value);
      }
    }).filter(function (value) {
      return value;
    });
  }
  /**
   * Normalizes and appends content to an element.
   *
   * @param  {Element} el
   *         Element to append normalized content to.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Element}
   *         The element with appended normalized content.
   */

  function appendContent(el, content) {
    normalizeContent(content).forEach(function (node) {
      return el.appendChild(node);
    });
    return el;
  }
  /**
   * Normalizes and inserts content into an element; this is identical to
   * `appendContent()`, except it empties the element first.
   *
   * @param {Element} el
   *        Element to insert normalized content into.
   *
   * @param {module:dom~ContentDescriptor} content
   *        A content descriptor value.
   *
   * @return {Element}
   *         The element with inserted normalized content.
   */

  function insertContent(el, content) {
    return appendContent(emptyEl(el), content);
  }
  /**
   * Check if an event was a single left click.
   *
   * @param  {EventTarget~Event} event
   *         Event object.
   *
   * @return {boolean}
   *         Will be `true` if a single left click, `false` otherwise.
   */

  function isSingleLeftClick(event) {
    // Note: if you create something draggable, be sure to
    // call it on both `mousedown` and `mousemove` event,
    // otherwise `mousedown` should be enough for a button
    if (event.button === undefined && event.buttons === undefined) {
      // Why do we need `buttons` ?
      // Because, middle mouse sometimes have this:
      // e.button === 0 and e.buttons === 4
      // Furthermore, we want to prevent combination click, something like
      // HOLD middlemouse then left click, that would be
      // e.button === 0, e.buttons === 5
      // just `button` is not gonna work
      // Alright, then what this block does ?
      // this is for chrome `simulate mobile devices`
      // I want to support this as well
      return true;
    }

    if (event.button === 0 && event.buttons === undefined) {
      // Touch screen, sometimes on some specific device, `buttons`
      // doesn't have anything (safari on ios, blackberry...)
      return true;
    } // `mouseup` event on a single left click has
    // `button` and `buttons` equal to 0


    if (event.type === 'mouseup' && event.button === 0 && event.buttons === 0) {
      return true;
    }

    if (event.button !== 0 || event.buttons !== 1) {
      // This is the reason we have those if else block above
      // if any special case we can catch and let it slide
      // we do it above, when get to here, this definitely
      // is-not-left-click
      return false;
    }

    return true;
  }
  /**
   * Finds a single DOM element matching `selector` within the optional
   * `context` of another DOM element (defaulting to `document`).
   *
   * @param  {string} selector
   *         A valid CSS selector, which will be passed to `querySelector`.
   *
   * @param  {Element|String} [context=document]
   *         A DOM element within which to query. Can also be a selector
   *         string in which case the first matching element will be used
   *         as context. If missing (or no element matches selector), falls
   *         back to `document`.
   *
   * @return {Element|null}
   *         The element that was found or null.
   */

  var $ = createQuerier('querySelector');
  /**
   * Finds a all DOM elements matching `selector` within the optional
   * `context` of another DOM element (defaulting to `document`).
   *
   * @param  {string} selector
   *         A valid CSS selector, which will be passed to `querySelectorAll`.
   *
   * @param  {Element|String} [context=document]
   *         A DOM element within which to query. Can also be a selector
   *         string in which case the first matching element will be used
   *         as context. If missing (or no element matches selector), falls
   *         back to `document`.
   *
   * @return {NodeList}
   *         A element list of elements that were found. Will be empty if none
   *         were found.
   *
   */

  var $$ = createQuerier('querySelectorAll');

  var Dom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isReal: isReal,
    isEl: isEl,
    isInFrame: isInFrame,
    createEl: createEl,
    textContent: textContent,
    prependTo: prependTo,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    setAttributes: setAttributes,
    getAttributes: getAttributes,
    getAttribute: getAttribute,
    setAttribute: setAttribute,
    removeAttribute: removeAttribute,
    blockTextSelection: blockTextSelection,
    unblockTextSelection: unblockTextSelection,
    getBoundingClientRect: getBoundingClientRect,
    findPosition: findPosition,
    getPointerPosition: getPointerPosition,
    isTextNode: isTextNode,
    emptyEl: emptyEl,
    normalizeContent: normalizeContent,
    appendContent: appendContent,
    insertContent: insertContent,
    isSingleLeftClick: isSingleLeftClick,
    $: $,
    $$: $$
  });

  /**
   * @file setup.js - Functions for setting up a player without
   * user interaction based on the data-setup `attribute` of the video tag.
   *
   * @module setup
   */
  var _windowLoaded = false;
  var videojs;
  /**
   * Set up any tags that have a data-setup `attribute` when the player is started.
   */

  var autoSetup = function autoSetup() {
    // Protect against breakage in non-browser environments and check global autoSetup option.
    if (!isReal() || videojs.options.autoSetup === false) {
      return;
    }

    var vids = Array.prototype.slice.call(document.getElementsByTagName('video'));
    var audios = Array.prototype.slice.call(document.getElementsByTagName('audio'));
    var divs = Array.prototype.slice.call(document.getElementsByTagName('video-js'));
    var mediaEls = vids.concat(audios, divs); // Check if any media elements exist

    if (mediaEls && mediaEls.length > 0) {
      for (var i = 0, e = mediaEls.length; i < e; i++) {
        var mediaEl = mediaEls[i]; // Check if element exists, has getAttribute func.

        if (mediaEl && mediaEl.getAttribute) {
          // Make sure this player hasn't already been set up.
          if (mediaEl.player === undefined) {
            var options = mediaEl.getAttribute('data-setup'); // Check if data-setup attr exists.
            // We only auto-setup if they've added the data-setup attr.

            if (options !== null) {
              // Create new video.js instance.
              videojs(mediaEl);
            }
          } // If getAttribute isn't defined, we need to wait for the DOM.

        } else {
          autoSetupTimeout(1);
          break;
        }
      } // No videos were found, so keep looping unless page is finished loading.

    } else if (!_windowLoaded) {
      autoSetupTimeout(1);
    }
  };
  /**
   * Wait until the page is loaded before running autoSetup. This will be called in
   * autoSetup if `hasLoaded` returns false.
   *
   * @param {number} wait
   *        How long to wait in ms
   *
   * @param {module:videojs} [vjs]
   *        The videojs library function
   */


  function autoSetupTimeout(wait, vjs) {
    if (vjs) {
      videojs = vjs;
    }

    window$1.setTimeout(autoSetup, wait);
  }
  /**
   * Used to set the internal tracking of window loaded state to true.
   *
   * @private
   */


  function setWindowLoaded() {
    _windowLoaded = true;
    window$1.removeEventListener('load', setWindowLoaded);
  }

  if (isReal()) {
    if (document.readyState === 'complete') {
      setWindowLoaded();
    } else {
      /**
       * Listen for the load event on window, and set _windowLoaded to true.
       *
       * We use a standard event listener here to avoid incrementing the GUID
       * before any players are created.
       *
       * @listens load
       */
      window$1.addEventListener('load', setWindowLoaded);
    }
  }

  /**
   * @file stylesheet.js
   * @module stylesheet
   */
  /**
   * Create a DOM syle element given a className for it.
   *
   * @param {string} className
   *        The className to add to the created style element.
   *
   * @return {Element}
   *         The element that was created.
   */

  var createStyleElement = function createStyleElement(className) {
    var style = document.createElement('style');
    style.className = className;
    return style;
  };
  /**
   * Add text to a DOM element.
   *
   * @param {Element} el
   *        The Element to add text content to.
   *
   * @param {string} content
   *        The text to add to the element.
   */

  var setTextContent = function setTextContent(el, content) {
    if (el.styleSheet) {
      el.styleSheet.cssText = content;
    } else {
      el.textContent = content;
    }
  };

  /**
   * @file guid.js
   * @module guid
   */
  // Default value for GUIDs. This allows us to reset the GUID counter in tests.
  //
  // The initial GUID is 3 because some users have come to rely on the first
  // default player ID ending up as `vjs_video_3`.
  //
  // See: https://github.com/videojs/video.js/pull/6216
  var _initialGuid = 3;
  /**
   * Unique ID for an element or function
   *
   * @type {Number}
   */

  var _guid = _initialGuid;
  /**
   * Get a unique auto-incrementing ID by number that has not been returned before.
   *
   * @return {number}
   *         A new unique ID.
   */

  function newGUID() {
    return _guid++;
  }

  /**
   * @file dom-data.js
   * @module dom-data
   */
  var FakeWeakMap;

  if (!window$1.WeakMap) {
    FakeWeakMap = /*#__PURE__*/function () {
      function FakeWeakMap() {
        this.vdata = 'vdata' + Math.floor(window$1.performance && window$1.performance.now() || Date.now());
        this.data = {};
      }

      var _proto = FakeWeakMap.prototype;

      _proto.set = function set(key, value) {
        var access = key[this.vdata] || newGUID();

        if (!key[this.vdata]) {
          key[this.vdata] = access;
        }

        this.data[access] = value;
        return this;
      };

      _proto.get = function get(key) {
        var access = key[this.vdata]; // we have data, return it

        if (access) {
          return this.data[access];
        } // we don't have data, return nothing.
        // return undefined explicitly as that's the contract for this method


        log('We have no data for this element', key);
        return undefined;
      };

      _proto.has = function has(key) {
        var access = key[this.vdata];
        return access in this.data;
      };

      _proto["delete"] = function _delete(key) {
        var access = key[this.vdata];

        if (access) {
          delete this.data[access];
          delete key[this.vdata];
        }
      };

      return FakeWeakMap;
    }();
  }
  /**
   * Element Data Store.
   *
   * Allows for binding data to an element without putting it directly on the
   * element. Ex. Event listeners are stored here.
   * (also from jsninja.com, slightly modified and updated for closure compiler)
   *
   * @type {Object}
   * @private
   */


  var DomData = window$1.WeakMap ? new WeakMap() : new FakeWeakMap();

  /**
   * @file events.js. An Event System (John Resig - Secrets of a JS Ninja http://jsninja.com/)
   * (Original book version wasn't completely usable, so fixed some things and made Closure Compiler compatible)
   * This should work very similarly to jQuery's events, however it's based off the book version which isn't as
   * robust as jquery's, so there's probably some differences.
   *
   * @file events.js
   * @module events
   */
  /**
   * Clean up the listener cache and dispatchers
   *
   * @param {Element|Object} elem
   *        Element to clean up
   *
   * @param {string} type
   *        Type of event to clean up
   */

  function _cleanUpEvents(elem, type) {
    if (!DomData.has(elem)) {
      return;
    }

    var data = DomData.get(elem); // Remove the events of a particular type if there are none left

    if (data.handlers[type].length === 0) {
      delete data.handlers[type]; // data.handlers[type] = null;
      // Setting to null was causing an error with data.handlers
      // Remove the meta-handler from the element

      if (elem.removeEventListener) {
        elem.removeEventListener(type, data.dispatcher, false);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + type, data.dispatcher);
      }
    } // Remove the events object if there are no types left


    if (Object.getOwnPropertyNames(data.handlers).length <= 0) {
      delete data.handlers;
      delete data.dispatcher;
      delete data.disabled;
    } // Finally remove the element data if there is no data left


    if (Object.getOwnPropertyNames(data).length === 0) {
      DomData["delete"](elem);
    }
  }
  /**
   * Loops through an array of event types and calls the requested method for each type.
   *
   * @param {Function} fn
   *        The event method we want to use.
   *
   * @param {Element|Object} elem
   *        Element or object to bind listeners to
   *
   * @param {string} type
   *        Type of event to bind to.
   *
   * @param {EventTarget~EventListener} callback
   *        Event listener.
   */


  function _handleMultipleEvents(fn, elem, types, callback) {
    types.forEach(function (type) {
      // Call the event method for each one of the types
      fn(elem, type, callback);
    });
  }
  /**
   * Fix a native event to have standard property values
   *
   * @param {Object} event
   *        Event object to fix.
   *
   * @return {Object}
   *         Fixed event object.
   */


  function fixEvent(event) {
    if (event.fixed_) {
      return event;
    }

    function returnTrue() {
      return true;
    }

    function returnFalse() {
      return false;
    } // Test if fixing up is needed
    // Used to check if !event.stopPropagation instead of isPropagationStopped
    // But native events return true for stopPropagation, but don't have
    // other expected methods like isPropagationStopped. Seems to be a problem
    // with the Javascript Ninja code. So we're just overriding all events now.


    if (!event || !event.isPropagationStopped) {
      var old = event || window$1.event;
      event = {}; // Clone the old object so that we can modify the values event = {};
      // IE8 Doesn't like when you mess with native event properties
      // Firefox returns false for event.hasOwnProperty('type') and other props
      //  which makes copying more difficult.
      // TODO: Probably best to create a whitelist of event props

      for (var key in old) {
        // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
        // Chrome warns you if you try to copy deprecated keyboardEvent.keyLocation
        // and webkitMovementX/Y
        if (key !== 'layerX' && key !== 'layerY' && key !== 'keyLocation' && key !== 'webkitMovementX' && key !== 'webkitMovementY') {
          // Chrome 32+ warns if you try to copy deprecated returnValue, but
          // we still want to if preventDefault isn't supported (IE8).
          if (!(key === 'returnValue' && old.preventDefault)) {
            event[key] = old[key];
          }
        }
      } // The event occurred on this element


      if (!event.target) {
        event.target = event.srcElement || document;
      } // Handle which other element the event is related to


      if (!event.relatedTarget) {
        event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
      } // Stop the default browser action


      event.preventDefault = function () {
        if (old.preventDefault) {
          old.preventDefault();
        }

        event.returnValue = false;
        old.returnValue = false;
        event.defaultPrevented = true;
      };

      event.defaultPrevented = false; // Stop the event from bubbling

      event.stopPropagation = function () {
        if (old.stopPropagation) {
          old.stopPropagation();
        }

        event.cancelBubble = true;
        old.cancelBubble = true;
        event.isPropagationStopped = returnTrue;
      };

      event.isPropagationStopped = returnFalse; // Stop the event from bubbling and executing other handlers

      event.stopImmediatePropagation = function () {
        if (old.stopImmediatePropagation) {
          old.stopImmediatePropagation();
        }

        event.isImmediatePropagationStopped = returnTrue;
        event.stopPropagation();
      };

      event.isImmediatePropagationStopped = returnFalse; // Handle mouse position

      if (event.clientX !== null && event.clientX !== undefined) {
        var doc = document.documentElement;
        var body = document.body;
        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
      } // Handle key presses


      event.which = event.charCode || event.keyCode; // Fix button for mouse clicks:
      // 0 == left; 1 == middle; 2 == right

      if (event.button !== null && event.button !== undefined) {
        // The following is disabled because it does not pass videojs-standard
        // and... yikes.

        /* eslint-disable */
        event.button = event.button & 1 ? 0 : event.button & 4 ? 1 : event.button & 2 ? 2 : 0;
        /* eslint-enable */
      }
    }

    event.fixed_ = true; // Returns fixed-up instance

    return event;
  }
  /**
   * Whether passive event listeners are supported
   */

  var _supportsPassive;

  var supportsPassive = function supportsPassive() {
    if (typeof _supportsPassive !== 'boolean') {
      _supportsPassive = false;

      try {
        var opts = Object.defineProperty({}, 'passive', {
          get: function get() {
            _supportsPassive = true;
          }
        });
        window$1.addEventListener('test', null, opts);
        window$1.removeEventListener('test', null, opts);
      } catch (e) {// disregard
      }
    }

    return _supportsPassive;
  };
  /**
   * Touch events Chrome expects to be passive
   */


  var passiveEvents = ['touchstart', 'touchmove'];
  /**
   * Add an event listener to element
   * It stores the handler function in a separate cache object
   * and adds a generic handler to the element's event,
   * along with a unique id (guid) to the element.
   *
   * @param {Element|Object} elem
   *        Element or object to bind listeners to
   *
   * @param {string|string[]} type
   *        Type of event to bind to.
   *
   * @param {EventTarget~EventListener} fn
   *        Event listener.
   */

  function on(elem, type, fn) {
    if (Array.isArray(type)) {
      return _handleMultipleEvents(on, elem, type, fn);
    }

    if (!DomData.has(elem)) {
      DomData.set(elem, {});
    }

    var data = DomData.get(elem); // We need a place to store all our handler data

    if (!data.handlers) {
      data.handlers = {};
    }

    if (!data.handlers[type]) {
      data.handlers[type] = [];
    }

    if (!fn.guid) {
      fn.guid = newGUID();
    }

    data.handlers[type].push(fn);

    if (!data.dispatcher) {
      data.disabled = false;

      data.dispatcher = function (event, hash) {
        if (data.disabled) {
          return;
        }

        event = fixEvent(event);
        var handlers = data.handlers[event.type];

        if (handlers) {
          // Copy handlers so if handlers are added/removed during the process it doesn't throw everything off.
          var handlersCopy = handlers.slice(0);

          for (var m = 0, n = handlersCopy.length; m < n; m++) {
            if (event.isImmediatePropagationStopped()) {
              break;
            } else {
              try {
                handlersCopy[m].call(elem, event, hash);
              } catch (e) {
                log.error(e);
              }
            }
          }
        }
      };
    }

    if (data.handlers[type].length === 1) {
      if (elem.addEventListener) {
        var options = false;

        if (supportsPassive() && passiveEvents.indexOf(type) > -1) {
          options = {
            passive: true
          };
        }

        elem.addEventListener(type, data.dispatcher, options);
      } else if (elem.attachEvent) {
        elem.attachEvent('on' + type, data.dispatcher);
      }
    }
  }
  /**
   * Removes event listeners from an element
   *
   * @param {Element|Object} elem
   *        Object to remove listeners from.
   *
   * @param {string|string[]} [type]
   *        Type of listener to remove. Don't include to remove all events from element.
   *
   * @param {EventTarget~EventListener} [fn]
   *        Specific listener to remove. Don't include to remove listeners for an event
   *        type.
   */

  function off(elem, type, fn) {
    // Don't want to add a cache object through getElData if not needed
    if (!DomData.has(elem)) {
      return;
    }

    var data = DomData.get(elem); // If no events exist, nothing to unbind

    if (!data.handlers) {
      return;
    }

    if (Array.isArray(type)) {
      return _handleMultipleEvents(off, elem, type, fn);
    } // Utility function


    var removeType = function removeType(el, t) {
      data.handlers[t] = [];

      _cleanUpEvents(el, t);
    }; // Are we removing all bound events?


    if (type === undefined) {
      for (var t in data.handlers) {
        if (Object.prototype.hasOwnProperty.call(data.handlers || {}, t)) {
          removeType(elem, t);
        }
      }

      return;
    }

    var handlers = data.handlers[type]; // If no handlers exist, nothing to unbind

    if (!handlers) {
      return;
    } // If no listener was provided, remove all listeners for type


    if (!fn) {
      removeType(elem, type);
      return;
    } // We're only removing a single handler


    if (fn.guid) {
      for (var n = 0; n < handlers.length; n++) {
        if (handlers[n].guid === fn.guid) {
          handlers.splice(n--, 1);
        }
      }
    }

    _cleanUpEvents(elem, type);
  }
  /**
   * Trigger an event for an element
   *
   * @param {Element|Object} elem
   *        Element to trigger an event on
   *
   * @param {EventTarget~Event|string} event
   *        A string (the type) or an event object with a type attribute
   *
   * @param {Object} [hash]
   *        data hash to pass along with the event
   *
   * @return {boolean|undefined}
   *         Returns the opposite of `defaultPrevented` if default was
   *         prevented. Otherwise, returns `undefined`
   */

  function trigger(elem, event, hash) {
    // Fetches element data and a reference to the parent (for bubbling).
    // Don't want to add a data object to cache for every parent,
    // so checking hasElData first.
    var elemData = DomData.has(elem) ? DomData.get(elem) : {};
    var parent = elem.parentNode || elem.ownerDocument; // type = event.type || event,
    // handler;
    // If an event name was passed as a string, creates an event out of it

    if (typeof event === 'string') {
      event = {
        type: event,
        target: elem
      };
    } else if (!event.target) {
      event.target = elem;
    } // Normalizes the event properties.


    event = fixEvent(event); // If the passed element has a dispatcher, executes the established handlers.

    if (elemData.dispatcher) {
      elemData.dispatcher.call(elem, event, hash);
    } // Unless explicitly stopped or the event does not bubble (e.g. media events)
    // recursively calls this function to bubble the event up the DOM.


    if (parent && !event.isPropagationStopped() && event.bubbles === true) {
      trigger.call(null, parent, event, hash); // If at the top of the DOM, triggers the default action unless disabled.
    } else if (!parent && !event.defaultPrevented && event.target && event.target[event.type]) {
      if (!DomData.has(event.target)) {
        DomData.set(event.target, {});
      }

      var targetData = DomData.get(event.target); // Checks if the target has a default action for this event.

      if (event.target[event.type]) {
        // Temporarily disables event dispatching on the target as we have already executed the handler.
        targetData.disabled = true; // Executes the default action.

        if (typeof event.target[event.type] === 'function') {
          event.target[event.type]();
        } // Re-enables event dispatching.


        targetData.disabled = false;
      }
    } // Inform the triggerer if the default was prevented by returning false


    return !event.defaultPrevented;
  }
  /**
   * Trigger a listener only once for an event.
   *
   * @param {Element|Object} elem
   *        Element or object to bind to.
   *
   * @param {string|string[]} type
   *        Name/type of event
   *
   * @param {Event~EventListener} fn
   *        Event listener function
   */

  function one(elem, type, fn) {
    if (Array.isArray(type)) {
      return _handleMultipleEvents(one, elem, type, fn);
    }

    var func = function func() {
      off(elem, type, func);
      fn.apply(this, arguments);
    }; // copy the guid to the new function so it can removed using the original function's ID


    func.guid = fn.guid = fn.guid || newGUID();
    on(elem, type, func);
  }
  /**
   * Trigger a listener only once and then turn if off for all
   * configured events
   *
   * @param {Element|Object} elem
   *        Element or object to bind to.
   *
   * @param {string|string[]} type
   *        Name/type of event
   *
   * @param {Event~EventListener} fn
   *        Event listener function
   */

  function any(elem, type, fn) {
    var func = function func() {
      off(elem, type, func);
      fn.apply(this, arguments);
    }; // copy the guid to the new function so it can removed using the original function's ID


    func.guid = fn.guid = fn.guid || newGUID(); // multiple ons, but one off for everything

    on(elem, type, func);
  }

  var Events = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fixEvent: fixEvent,
    on: on,
    off: off,
    trigger: trigger,
    one: one,
    any: any
  });

  /**
   * @file fn.js
   * @module fn
   */
  var UPDATE_REFRESH_INTERVAL = 30;
  /**
   * Bind (a.k.a proxy or context). A simple method for changing the context of
   * a function.
   *
   * It also stores a unique id on the function so it can be easily removed from
   * events.
   *
   * @function
   * @param    {Mixed} context
   *           The object to bind as scope.
   *
   * @param    {Function} fn
   *           The function to be bound to a scope.
   *
   * @param    {number} [uid]
   *           An optional unique ID for the function to be set
   *
   * @return   {Function}
   *           The new function that will be bound into the context given
   */

  var bind = function bind(context, fn, uid) {
    // Make sure the function has a unique ID
    if (!fn.guid) {
      fn.guid = newGUID();
    } // Create the new function that changes the context


    var bound = fn.bind(context); // Allow for the ability to individualize this function
    // Needed in the case where multiple objects might share the same prototype
    // IF both items add an event listener with the same function, then you try to remove just one
    // it will remove both because they both have the same guid.
    // when using this, you need to use the bind method when you remove the listener as well.
    // currently used in text tracks

    bound.guid = uid ? uid + '_' + fn.guid : fn.guid;
    return bound;
  };
  /**
   * Wraps the given function, `fn`, with a new function that only invokes `fn`
   * at most once per every `wait` milliseconds.
   *
   * @function
   * @param    {Function} fn
   *           The function to be throttled.
   *
   * @param    {number}   wait
   *           The number of milliseconds by which to throttle.
   *
   * @return   {Function}
   */

  var throttle = function throttle(fn, wait) {
    var last = window$1.performance.now();

    var throttled = function throttled() {
      var now = window$1.performance.now();

      if (now - last >= wait) {
        fn.apply(void 0, arguments);
        last = now;
      }
    };

    return throttled;
  };
  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked.
   *
   * Inspired by lodash and underscore implementations.
   *
   * @function
   * @param    {Function} func
   *           The function to wrap with debounce behavior.
   *
   * @param    {number} wait
   *           The number of milliseconds to wait after the last invocation.
   *
   * @param    {boolean} [immediate]
   *           Whether or not to invoke the function immediately upon creation.
   *
   * @param    {Object} [context=window]
   *           The "context" in which the debounced function should debounce. For
   *           example, if this function should be tied to a Video.js player,
   *           the player can be passed here. Alternatively, defaults to the
   *           global `window` object.
   *
   * @return   {Function}
   *           A debounced function.
   */

  var debounce = function debounce(func, wait, immediate, context) {
    if (context === void 0) {
      context = window$1;
    }

    var timeout;

    var cancel = function cancel() {
      context.clearTimeout(timeout);
      timeout = null;
    };
    /* eslint-disable consistent-this */


    var debounced = function debounced() {
      var self = this;
      var args = arguments;

      var _later = function later() {
        timeout = null;
        _later = null;

        if (!immediate) {
          func.apply(self, args);
        }
      };

      if (!timeout && immediate) {
        func.apply(self, args);
      }

      context.clearTimeout(timeout);
      timeout = context.setTimeout(_later, wait);
    };
    /* eslint-enable consistent-this */


    debounced.cancel = cancel;
    return debounced;
  };

  /**
   * @file src/js/event-target.js
   */
  /**
   * `EventTarget` is a class that can have the same API as the DOM `EventTarget`. It
   * adds shorthand functions that wrap around lengthy functions. For example:
   * the `on` function is a wrapper around `addEventListener`.
   *
   * @see [EventTarget Spec]{@link https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget}
   * @class EventTarget
   */

  var EventTarget = function EventTarget() {};
  /**
   * A Custom DOM event.
   *
   * @typedef {Object} EventTarget~Event
   * @see [Properties]{@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent}
   */

  /**
   * All event listeners should follow the following format.
   *
   * @callback EventTarget~EventListener
   * @this {EventTarget}
   *
   * @param {EventTarget~Event} event
   *        the event that triggered this function
   *
   * @param {Object} [hash]
   *        hash of data sent during the event
   */

  /**
   * An object containing event names as keys and booleans as values.
   *
   * > NOTE: If an event name is set to a true value here {@link EventTarget#trigger}
   *         will have extra functionality. See that function for more information.
   *
   * @property EventTarget.prototype.allowedEvents_
   * @private
   */


  EventTarget.prototype.allowedEvents_ = {};
  /**
   * Adds an `event listener` to an instance of an `EventTarget`. An `event listener` is a
   * function that will get called when an event with a certain name gets triggered.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to call with `EventTarget`s
   */

  EventTarget.prototype.on = function (type, fn) {
    // Remove the addEventListener alias before calling Events.on
    // so we don't get into an infinite type loop
    var ael = this.addEventListener;

    this.addEventListener = function () {};

    on(this, type, fn);
    this.addEventListener = ael;
  };
  /**
   * An alias of {@link EventTarget#on}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#on}
   */


  EventTarget.prototype.addEventListener = EventTarget.prototype.on;
  /**
   * Removes an `event listener` for a specific event from an instance of `EventTarget`.
   * This makes it so that the `event listener` will no longer get called when the
   * named event happens.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to remove.
   */

  EventTarget.prototype.off = function (type, fn) {
    off(this, type, fn);
  };
  /**
   * An alias of {@link EventTarget#off}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#off}
   */


  EventTarget.prototype.removeEventListener = EventTarget.prototype.off;
  /**
   * This function will add an `event listener` that gets triggered only once. After the
   * first trigger it will get removed. This is like adding an `event listener`
   * with {@link EventTarget#on} that calls {@link EventTarget#off} on itself.
   *
   * @param {string|string[]} type
   *        An event name or an array of event names.
   *
   * @param {EventTarget~EventListener} fn
   *        The function to be called once for each event name.
   */

  EventTarget.prototype.one = function (type, fn) {
    // Remove the addEventListener aliasing Events.on
    // so we don't get into an infinite type loop
    var ael = this.addEventListener;

    this.addEventListener = function () {};

    one(this, type, fn);
    this.addEventListener = ael;
  };

  EventTarget.prototype.any = function (type, fn) {
    // Remove the addEventListener aliasing Events.on
    // so we don't get into an infinite type loop
    var ael = this.addEventListener;

    this.addEventListener = function () {};

    any(this, type, fn);
    this.addEventListener = ael;
  };
  /**
   * This function causes an event to happen. This will then cause any `event listeners`
   * that are waiting for that event, to get called. If there are no `event listeners`
   * for an event then nothing will happen.
   *
   * If the name of the `Event` that is being triggered is in `EventTarget.allowedEvents_`.
   * Trigger will also call the `on` + `uppercaseEventName` function.
   *
   * Example:
   * 'click' is in `EventTarget.allowedEvents_`, so, trigger will attempt to call
   * `onClick` if it exists.
   *
   * @param {string|EventTarget~Event|Object} event
   *        The name of the event, an `Event`, or an object with a key of type set to
   *        an event name.
   */


  EventTarget.prototype.trigger = function (event) {
    var type = event.type || event; // deprecation
    // In a future version we should default target to `this`
    // similar to how we default the target to `elem` in
    // `Events.trigger`. Right now the default `target` will be
    // `document` due to the `Event.fixEvent` call.

    if (typeof event === 'string') {
      event = {
        type: type
      };
    }

    event = fixEvent(event);

    if (this.allowedEvents_[type] && this['on' + type]) {
      this['on' + type](event);
    }

    trigger(this, event);
  };
  /**
   * An alias of {@link EventTarget#trigger}. Allows `EventTarget` to mimic
   * the standard DOM API.
   *
   * @function
   * @see {@link EventTarget#trigger}
   */


  EventTarget.prototype.dispatchEvent = EventTarget.prototype.trigger;
  var EVENT_MAP;

  EventTarget.prototype.queueTrigger = function (event) {
    var _this = this;

    // only set up EVENT_MAP if it'll be used
    if (!EVENT_MAP) {
      EVENT_MAP = new Map();
    }

    var type = event.type || event;
    var map = EVENT_MAP.get(this);

    if (!map) {
      map = new Map();
      EVENT_MAP.set(this, map);
    }

    var oldTimeout = map.get(type);
    map["delete"](type);
    window$1.clearTimeout(oldTimeout);
    var timeout = window$1.setTimeout(function () {
      // if we cleared out all timeouts for the current target, delete its map
      if (map.size === 0) {
        map = null;
        EVENT_MAP["delete"](_this);
      }

      _this.trigger(event);
    }, 0);
    map.set(type, timeout);
  };

  /**
   * @file mixins/evented.js
   * @module evented
   */
  /**
   * Returns whether or not an object has had the evented mixin applied.
   *
   * @param  {Object} object
   *         An object to test.
   *
   * @return {boolean}
   *         Whether or not the object appears to be evented.
   */

  var isEvented = function isEvented(object) {
    return object instanceof EventTarget || !!object.eventBusEl_ && ['on', 'one', 'off', 'trigger'].every(function (k) {
      return typeof object[k] === 'function';
    });
  };
  /**
   * Adds a callback to run after the evented mixin applied.
   *
   * @param  {Object} object
   *         An object to Add
   * @param  {Function} callback
   *         The callback to run.
   */


  var addEventedCallback = function addEventedCallback(target, callback) {
    if (isEvented(target)) {
      callback();
    } else {
      if (!target.eventedCallbacks) {
        target.eventedCallbacks = [];
      }

      target.eventedCallbacks.push(callback);
    }
  };
  /**
   * Whether a value is a valid event type - non-empty string or array.
   *
   * @private
   * @param  {string|Array} type
   *         The type value to test.
   *
   * @return {boolean}
   *         Whether or not the type is a valid event type.
   */


  var isValidEventType = function isValidEventType(type) {
    return (// The regex here verifies that the `type` contains at least one non-
      // whitespace character.
      typeof type === 'string' && /\S/.test(type) || Array.isArray(type) && !!type.length
    );
  };
  /**
   * Validates a value to determine if it is a valid event target. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the target does not appear to be a valid event target.
   *
   * @param  {Object} target
   *         The object to test.
   */


  var validateTarget = function validateTarget(target) {
    if (!target.nodeName && !isEvented(target)) {
      throw new Error('Invalid target; must be a DOM node or evented object.');
    }
  };
  /**
   * Validates a value to determine if it is a valid event target. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the type does not appear to be a valid event type.
   *
   * @param  {string|Array} type
   *         The type to test.
   */


  var validateEventType = function validateEventType(type) {
    if (!isValidEventType(type)) {
      throw new Error('Invalid event type; must be a non-empty string or array.');
    }
  };
  /**
   * Validates a value to determine if it is a valid listener. Throws if not.
   *
   * @private
   * @throws {Error}
   *         If the listener is not a function.
   *
   * @param  {Function} listener
   *         The listener to test.
   */


  var validateListener = function validateListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Invalid listener; must be a function.');
    }
  };
  /**
   * Takes an array of arguments given to `on()` or `one()`, validates them, and
   * normalizes them into an object.
   *
   * @private
   * @param  {Object} self
   *         The evented object on which `on()` or `one()` was called. This
   *         object will be bound as the `this` value for the listener.
   *
   * @param  {Array} args
   *         An array of arguments passed to `on()` or `one()`.
   *
   * @return {Object}
   *         An object containing useful values for `on()` or `one()` calls.
   */


  var normalizeListenArgs = function normalizeListenArgs(self, args) {
    // If the number of arguments is less than 3, the target is always the
    // evented object itself.
    var isTargetingSelf = args.length < 3 || args[0] === self || args[0] === self.eventBusEl_;
    var target;
    var type;
    var listener;

    if (isTargetingSelf) {
      target = self.eventBusEl_; // Deal with cases where we got 3 arguments, but we are still listening to
      // the evented object itself.

      if (args.length >= 3) {
        args.shift();
      }

      type = args[0];
      listener = args[1];
    } else {
      target = args[0];
      type = args[1];
      listener = args[2];
    }

    validateTarget(target);
    validateEventType(type);
    validateListener(listener);
    listener = bind(self, listener);
    return {
      isTargetingSelf: isTargetingSelf,
      target: target,
      type: type,
      listener: listener
    };
  };
  /**
   * Adds the listener to the event type(s) on the target, normalizing for
   * the type of target.
   *
   * @private
   * @param  {Element|Object} target
   *         A DOM node or evented object.
   *
   * @param  {string} method
   *         The event binding method to use ("on" or "one").
   *
   * @param  {string|Array} type
   *         One or more event type(s).
   *
   * @param  {Function} listener
   *         A listener function.
   */


  var listen = function listen(target, method, type, listener) {
    validateTarget(target);

    if (target.nodeName) {
      Events[method](target, type, listener);
    } else {
      target[method](type, listener);
    }
  };
  /**
   * Contains methods that provide event capabilities to an object which is passed
   * to {@link module:evented|evented}.
   *
   * @mixin EventedMixin
   */


  var EventedMixin = {
    /**
     * Add a listener to an event (or events) on this object or another evented
     * object.
     *
     * @param  {string|Array|Element|Object} targetOrType
     *         If this is a string or array, it represents the event type(s)
     *         that will trigger the listener.
     *
     *         Another evented object can be passed here instead, which will
     *         cause the listener to listen for events on _that_ object.
     *
     *         In either case, the listener's `this` value will be bound to
     *         this object.
     *
     * @param  {string|Array|Function} typeOrListener
     *         If the first argument was a string or array, this should be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function.
     */
    on: function on() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _normalizeListenArgs = normalizeListenArgs(this, args),
          isTargetingSelf = _normalizeListenArgs.isTargetingSelf,
          target = _normalizeListenArgs.target,
          type = _normalizeListenArgs.type,
          listener = _normalizeListenArgs.listener;

      listen(target, 'on', type, listener); // If this object is listening to another evented object.

      if (!isTargetingSelf) {
        // If this object is disposed, remove the listener.
        var removeListenerOnDispose = function removeListenerOnDispose() {
          return _this.off(target, type, listener);
        }; // Use the same function ID as the listener so we can remove it later it
        // using the ID of the original listener.


        removeListenerOnDispose.guid = listener.guid; // Add a listener to the target's dispose event as well. This ensures
        // that if the target is disposed BEFORE this object, we remove the
        // removal listener that was just added. Otherwise, we create a memory leak.

        var removeRemoverOnTargetDispose = function removeRemoverOnTargetDispose() {
          return _this.off('dispose', removeListenerOnDispose);
        }; // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.


        removeRemoverOnTargetDispose.guid = listener.guid;
        listen(this, 'on', 'dispose', removeListenerOnDispose);
        listen(target, 'on', 'dispose', removeRemoverOnTargetDispose);
      }
    },

    /**
     * Add a listener to an event (or events) on this object or another evented
     * object. The listener will be called once per event and then removed.
     *
     * @param  {string|Array|Element|Object} targetOrType
     *         If this is a string or array, it represents the event type(s)
     *         that will trigger the listener.
     *
     *         Another evented object can be passed here instead, which will
     *         cause the listener to listen for events on _that_ object.
     *
     *         In either case, the listener's `this` value will be bound to
     *         this object.
     *
     * @param  {string|Array|Function} typeOrListener
     *         If the first argument was a string or array, this should be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function.
     */
    one: function one() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _normalizeListenArgs2 = normalizeListenArgs(this, args),
          isTargetingSelf = _normalizeListenArgs2.isTargetingSelf,
          target = _normalizeListenArgs2.target,
          type = _normalizeListenArgs2.type,
          listener = _normalizeListenArgs2.listener; // Targeting this evented object.


      if (isTargetingSelf) {
        listen(target, 'one', type, listener); // Targeting another evented object.
      } else {
        // TODO: This wrapper is incorrect! It should only
        //       remove the wrapper for the event type that called it.
        //       Instead all listners are removed on the first trigger!
        //       see https://github.com/videojs/video.js/issues/5962
        var wrapper = function wrapper() {
          _this2.off(target, type, wrapper);

          for (var _len3 = arguments.length, largs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            largs[_key3] = arguments[_key3];
          }

          listener.apply(null, largs);
        }; // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.


        wrapper.guid = listener.guid;
        listen(target, 'one', type, wrapper);
      }
    },

    /**
     * Add a listener to an event (or events) on this object or another evented
     * object. The listener will only be called once for the first event that is triggered
     * then removed.
     *
     * @param  {string|Array|Element|Object} targetOrType
     *         If this is a string or array, it represents the event type(s)
     *         that will trigger the listener.
     *
     *         Another evented object can be passed here instead, which will
     *         cause the listener to listen for events on _that_ object.
     *
     *         In either case, the listener's `this` value will be bound to
     *         this object.
     *
     * @param  {string|Array|Function} typeOrListener
     *         If the first argument was a string or array, this should be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function.
     */
    any: function any() {
      var _this3 = this;

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      var _normalizeListenArgs3 = normalizeListenArgs(this, args),
          isTargetingSelf = _normalizeListenArgs3.isTargetingSelf,
          target = _normalizeListenArgs3.target,
          type = _normalizeListenArgs3.type,
          listener = _normalizeListenArgs3.listener; // Targeting this evented object.


      if (isTargetingSelf) {
        listen(target, 'any', type, listener); // Targeting another evented object.
      } else {
        var wrapper = function wrapper() {
          _this3.off(target, type, wrapper);

          for (var _len5 = arguments.length, largs = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            largs[_key5] = arguments[_key5];
          }

          listener.apply(null, largs);
        }; // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.


        wrapper.guid = listener.guid;
        listen(target, 'any', type, wrapper);
      }
    },

    /**
     * Removes listener(s) from event(s) on an evented object.
     *
     * @param  {string|Array|Element|Object} [targetOrType]
     *         If this is a string or array, it represents the event type(s).
     *
     *         Another evented object can be passed here instead, in which case
     *         ALL 3 arguments are _required_.
     *
     * @param  {string|Array|Function} [typeOrListener]
     *         If the first argument was a string or array, this may be the
     *         listener function. Otherwise, this is a string or array of event
     *         type(s).
     *
     * @param  {Function} [listener]
     *         If the first argument was another evented object, this will be
     *         the listener function; otherwise, _all_ listeners bound to the
     *         event type(s) will be removed.
     */
    off: function off$1(targetOrType, typeOrListener, listener) {
      // Targeting this evented object.
      if (!targetOrType || isValidEventType(targetOrType)) {
        off(this.eventBusEl_, targetOrType, typeOrListener); // Targeting another evented object.
      } else {
        var target = targetOrType;
        var type = typeOrListener; // Fail fast and in a meaningful way!

        validateTarget(target);
        validateEventType(type);
        validateListener(listener); // Ensure there's at least a guid, even if the function hasn't been used

        listener = bind(this, listener); // Remove the dispose listener on this evented object, which was given
        // the same guid as the event listener in on().

        this.off('dispose', listener);

        if (target.nodeName) {
          off(target, type, listener);
          off(target, 'dispose', listener);
        } else if (isEvented(target)) {
          target.off(type, listener);
          target.off('dispose', listener);
        }
      }
    },

    /**
     * Fire an event on this evented object, causing its listeners to be called.
     *
     * @param   {string|Object} event
     *          An event type or an object with a type property.
     *
     * @param   {Object} [hash]
     *          An additional object to pass along to listeners.
     *
     * @return {boolean}
     *          Whether or not the default behavior was prevented.
     */
    trigger: function trigger$1(event, hash) {
      return trigger(this.eventBusEl_, event, hash);
    }
  };
  /**
   * Applies {@link module:evented~EventedMixin|EventedMixin} to a target object.
   *
   * @param  {Object} target
   *         The object to which to add event methods.
   *
   * @param  {Object} [options={}]
   *         Options for customizing the mixin behavior.
   *
   * @param  {string} [options.eventBusKey]
   *         By default, adds a `eventBusEl_` DOM element to the target object,
   *         which is used as an event bus. If the target object already has a
   *         DOM element that should be used, pass its key here.
   *
   * @return {Object}
   *         The target object.
   */

  function evented(target, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        eventBusKey = _options.eventBusKey; // Set or create the eventBusEl_.

    if (eventBusKey) {
      if (!target[eventBusKey].nodeName) {
        throw new Error("The eventBusKey \"" + eventBusKey + "\" does not refer to an element.");
      }

      target.eventBusEl_ = target[eventBusKey];
    } else {
      target.eventBusEl_ = createEl('span', {
        className: 'vjs-event-bus'
      });
    }

    assign(target, EventedMixin);

    if (target.eventedCallbacks) {
      target.eventedCallbacks.forEach(function (callback) {
        callback();
      });
    } // When any evented object is disposed, it removes all its listeners.


    target.on('dispose', function () {
      target.off();
      window$1.setTimeout(function () {
        target.eventBusEl_ = null;
      }, 0);
    });
    return target;
  }

  /**
   * @file mixins/stateful.js
   * @module stateful
   */
  /**
   * Contains methods that provide statefulness to an object which is passed
   * to {@link module:stateful}.
   *
   * @mixin StatefulMixin
   */

  var StatefulMixin = {
    /**
     * A hash containing arbitrary keys and values representing the state of
     * the object.
     *
     * @type {Object}
     */
    state: {},

    /**
     * Set the state of an object by mutating its
     * {@link module:stateful~StatefulMixin.state|state} object in place.
     *
     * @fires   module:stateful~StatefulMixin#statechanged
     * @param   {Object|Function} stateUpdates
     *          A new set of properties to shallow-merge into the plugin state.
     *          Can be a plain object or a function returning a plain object.
     *
     * @return {Object|undefined}
     *          An object containing changes that occurred. If no changes
     *          occurred, returns `undefined`.
     */
    setState: function setState(stateUpdates) {
      var _this = this;

      // Support providing the `stateUpdates` state as a function.
      if (typeof stateUpdates === 'function') {
        stateUpdates = stateUpdates();
      }

      var changes;
      each(stateUpdates, function (value, key) {
        // Record the change if the value is different from what's in the
        // current state.
        if (_this.state[key] !== value) {
          changes = changes || {};
          changes[key] = {
            from: _this.state[key],
            to: value
          };
        }

        _this.state[key] = value;
      }); // Only trigger "statechange" if there were changes AND we have a trigger
      // function. This allows us to not require that the target object be an
      // evented object.

      if (changes && isEvented(this)) {
        /**
         * An event triggered on an object that is both
         * {@link module:stateful|stateful} and {@link module:evented|evented}
         * indicating that its state has changed.
         *
         * @event    module:stateful~StatefulMixin#statechanged
         * @type     {Object}
         * @property {Object} changes
         *           A hash containing the properties that were changed and
         *           the values they were changed `from` and `to`.
         */
        this.trigger({
          changes: changes,
          type: 'statechanged'
        });
      }

      return changes;
    }
  };
  /**
   * Applies {@link module:stateful~StatefulMixin|StatefulMixin} to a target
   * object.
   *
   * If the target object is {@link module:evented|evented} and has a
   * `handleStateChanged` method, that method will be automatically bound to the
   * `statechanged` event on itself.
   *
   * @param   {Object} target
   *          The object to be made stateful.
   *
   * @param   {Object} [defaultState]
   *          A default set of properties to populate the newly-stateful object's
   *          `state` property.
   *
   * @return {Object}
   *          Returns the `target`.
   */

  function stateful(target, defaultState) {
    assign(target, StatefulMixin); // This happens after the mixing-in because we need to replace the `state`
    // added in that step.

    target.state = assign({}, target.state, defaultState); // Auto-bind the `handleStateChanged` method of the target object if it exists.

    if (typeof target.handleStateChanged === 'function' && isEvented(target)) {
      target.on('statechanged', target.handleStateChanged);
    }

    return target;
  }

  /**
   * @file string-cases.js
   * @module to-lower-case
   */

  /**
   * Lowercase the first letter of a string.
   *
   * @param {string} string
   *        String to be lowercased
   *
   * @return {string}
   *         The string with a lowercased first letter
   */
  var toLowerCase = function toLowerCase(string) {
    if (typeof string !== 'string') {
      return string;
    }

    return string.replace(/./, function (w) {
      return w.toLowerCase();
    });
  };
  /**
   * Uppercase the first letter of a string.
   *
   * @param {string} string
   *        String to be uppercased
   *
   * @return {string}
   *         The string with an uppercased first letter
   */

  var toTitleCase = function toTitleCase(string) {
    if (typeof string !== 'string') {
      return string;
    }

    return string.replace(/./, function (w) {
      return w.toUpperCase();
    });
  };
  /**
   * Compares the TitleCase versions of the two strings for equality.
   *
   * @param {string} str1
   *        The first string to compare
   *
   * @param {string} str2
   *        The second string to compare
   *
   * @return {boolean}
   *         Whether the TitleCase versions of the strings are equal
   */

  var titleCaseEquals = function titleCaseEquals(str1, str2) {
    return toTitleCase(str1) === toTitleCase(str2);
  };

  /**
   * @file merge-options.js
   * @module merge-options
   */
  /**
   * Merge two objects recursively.
   *
   * Performs a deep merge like
   * {@link https://lodash.com/docs/4.17.10#merge|lodash.merge}, but only merges
   * plain objects (not arrays, elements, or anything else).
   *
   * Non-plain object values will be copied directly from the right-most
   * argument.
   *
   * @static
   * @param   {Object[]} sources
   *          One or more objects to merge into a new object.
   *
   * @return {Object}
   *          A new object that is the merged result of all sources.
   */

  function mergeOptions() {
    var result = {};

    for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
      sources[_key] = arguments[_key];
    }

    sources.forEach(function (source) {
      if (!source) {
        return;
      }

      each(source, function (value, key) {
        if (!isPlain(value)) {
          result[key] = value;
          return;
        }

        if (!isPlain(result[key])) {
          result[key] = {};
        }

        result[key] = mergeOptions(result[key], value);
      });
    });
    return result;
  }

  var MapSham = /*#__PURE__*/function () {
    function MapSham() {
      this.map_ = {};
    }

    var _proto = MapSham.prototype;

    _proto.has = function has(key) {
      return key in this.map_;
    };

    _proto["delete"] = function _delete(key) {
      var has = this.has(key);
      delete this.map_[key];
      return has;
    };

    _proto.set = function set(key, value) {
      this.set_[key] = value;
      return this;
    };

    _proto.forEach = function forEach(callback, thisArg) {
      for (var key in this.map_) {
        callback.call(thisArg, this.map_[key], key, this);
      }
    };

    return MapSham;
  }();

  var Map$1 = window$1.Map ? window$1.Map : MapSham;

  var SetSham = /*#__PURE__*/function () {
    function SetSham() {
      this.set_ = {};
    }

    var _proto = SetSham.prototype;

    _proto.has = function has(key) {
      return key in this.set_;
    };

    _proto["delete"] = function _delete(key) {
      var has = this.has(key);
      delete this.set_[key];
      return has;
    };

    _proto.add = function add(key) {
      this.set_[key] = 1;
      return this;
    };

    _proto.forEach = function forEach(callback, thisArg) {
      for (var key in this.set_) {
        callback.call(thisArg, key, key, this);
      }
    };

    return SetSham;
  }();

  var Set = window$1.Set ? window$1.Set : SetSham;

  /**
   * Player Component - Base class for all UI objects
   *
   * @file component.js
   */
  /**
   * Base class for all UI Components.
   * Components are UI objects which represent both a javascript object and an element
   * in the DOM. They can be children of other components, and can have
   * children themselves.
   *
   * Components can also use methods from {@link EventTarget}
   */

  var Component = /*#__PURE__*/function () {
    /**
     * A callback that is called when a component is ready. Does not have any
     * paramters and any callback value will be ignored.
     *
     * @callback Component~ReadyCallback
     * @this Component
     */

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Object[]} [options.children]
     *        An array of children objects to intialize this component with. Children objects have
     *        a name property that will be used if more than one component of the same type needs to be
     *        added.
     *
     * @param {Component~ReadyCallback} [ready]
     *        Function that gets called when the `Component` is ready.
     */
    function Component(player, options, ready) {
      // The component might be the player itself and we can't pass `this` to super
      if (!player && this.play) {
        this.player_ = player = this; // eslint-disable-line
      } else {
        this.player_ = player;
      }

      this.isDisposed_ = false; // Hold the reference to the parent component via `addChild` method

      this.parentComponent_ = null; // Make a copy of prototype.options_ to protect against overriding defaults

      this.options_ = mergeOptions({}, this.options_); // Updated options with supplied options

      options = this.options_ = mergeOptions(this.options_, options); // Get ID from options or options element if one is supplied

      this.id_ = options.id || options.el && options.el.id; // If there was no ID from the options, generate one

      if (!this.id_) {
        // Don't require the player ID function in the case of mock players
        var id = player && player.id && player.id() || 'no_player';
        this.id_ = id + "_component_" + newGUID();
      }

      this.name_ = options.name || null; // Create element if one wasn't provided in options

      if (options.el) {
        this.el_ = options.el;
      } else if (options.createEl !== false) {
        this.el_ = this.createEl();
      } // if evented is anything except false, we want to mixin in evented


      if (options.evented !== false) {
        // Make this an evented object and use `el_`, if available, as its event bus
        evented(this, {
          eventBusKey: this.el_ ? 'el_' : null
        });
      }

      stateful(this, this.constructor.defaultState);
      this.children_ = [];
      this.childIndex_ = {};
      this.childNameIndex_ = {};
      this.setTimeoutIds_ = new Set();
      this.setIntervalIds_ = new Set();
      this.rafIds_ = new Set();
      this.namedRafs_ = new Map$1();
      this.clearingTimersOnDispose_ = false; // Add any child components in options

      if (options.initChildren !== false) {
        this.initChildren();
      }

      this.ready(ready); // Don't want to trigger ready here or it will before init is actually
      // finished for all children that run this constructor

      if (options.reportTouchActivity !== false) {
        this.enableTouchActivity();
      }
    }
    /**
     * Dispose of the `Component` and all child components.
     *
     * @fires Component#dispose
     */


    var _proto = Component.prototype;

    _proto.dispose = function dispose() {
      // Bail out if the component has already been disposed.
      if (this.isDisposed_) {
        return;
      }
      /**
       * Triggered when a `Component` is disposed.
       *
       * @event Component#dispose
       * @type {EventTarget~Event}
       *
       * @property {boolean} [bubbles=false]
       *           set to false so that the dispose event does not
       *           bubble up
       */


      this.trigger({
        type: 'dispose',
        bubbles: false
      });
      this.isDisposed_ = true; // Dispose all children.

      if (this.children_) {
        for (var i = this.children_.length - 1; i >= 0; i--) {
          if (this.children_[i].dispose) {
            this.children_[i].dispose();
          }
        }
      } // Delete child references


      this.children_ = null;
      this.childIndex_ = null;
      this.childNameIndex_ = null;
      this.parentComponent_ = null;

      if (this.el_) {
        // Remove element from DOM
        if (this.el_.parentNode) {
          this.el_.parentNode.removeChild(this.el_);
        }

        if (DomData.has(this.el_)) {
          DomData["delete"](this.el_);
        }

        this.el_ = null;
      } // remove reference to the player after disposing of the element


      this.player_ = null;
    }
    /**
     * Determine whether or not this component has been disposed.
     *
     * @return {boolean}
     *         If the component has been disposed, will be `true`. Otherwise, `false`.
     */
    ;

    _proto.isDisposed = function isDisposed() {
      return Boolean(this.isDisposed_);
    }
    /**
     * Return the {@link Player} that the `Component` has attached to.
     *
     * @return {Player}
     *         The player that this `Component` has attached to.
     */
    ;

    _proto.player = function player() {
      return this.player_;
    }
    /**
     * Deep merge of options objects with new options.
     * > Note: When both `obj` and `options` contain properties whose values are objects.
     *         The two properties get merged using {@link module:mergeOptions}
     *
     * @param {Object} obj
     *        The object that contains new options.
     *
     * @return {Object}
     *         A new object of `this.options_` and `obj` merged together.
     */
    ;

    _proto.options = function options(obj) {
      if (!obj) {
        return this.options_;
      }

      this.options_ = mergeOptions(this.options_, obj);
      return this.options_;
    }
    /**
     * Get the `Component`s DOM element
     *
     * @return {Element}
     *         The DOM element for this `Component`.
     */
    ;

    _proto.el = function el() {
      return this.el_;
    }
    /**
     * Create the `Component`s DOM element.
     *
     * @param {string} [tagName]
     *        Element's DOM node type. e.g. 'div'
     *
     * @param {Object} [properties]
     *        An object of properties that should be set.
     *
     * @param {Object} [attributes]
     *        An object of attributes that should be set.
     *
     * @return {Element}
     *         The element that gets created.
     */
    ;

    _proto.createEl = function createEl$1(tagName, properties, attributes) {
      return createEl(tagName, properties, attributes);
    }
    /**
     * Localize a string given the string in english.
     *
     * If tokens are provided, it'll try and run a simple token replacement on the provided string.
     * The tokens it looks for look like `{1}` with the index being 1-indexed into the tokens array.
     *
     * If a `defaultValue` is provided, it'll use that over `string`,
     * if a value isn't found in provided language files.
     * This is useful if you want to have a descriptive key for token replacement
     * but have a succinct localized string and not require `en.json` to be included.
     *
     * Currently, it is used for the progress bar timing.
     * ```js
     * {
     *   "progress bar timing: currentTime={1} duration={2}": "{1} of {2}"
     * }
     * ```
     * It is then used like so:
     * ```js
     * this.localize('progress bar timing: currentTime={1} duration{2}',
     *               [this.player_.currentTime(), this.player_.duration()],
     *               '{1} of {2}');
     * ```
     *
     * Which outputs something like: `01:23 of 24:56`.
     *
     *
     * @param {string} string
     *        The string to localize and the key to lookup in the language files.
     * @param {string[]} [tokens]
     *        If the current item has token replacements, provide the tokens here.
     * @param {string} [defaultValue]
     *        Defaults to `string`. Can be a default value to use for token replacement
     *        if the lookup key is needed to be separate.
     *
     * @return {string}
     *         The localized string or if no localization exists the english string.
     */
    ;

    _proto.localize = function localize(string, tokens, defaultValue) {
      if (defaultValue === void 0) {
        defaultValue = string;
      }

      var code = this.player_.language && this.player_.language();
      var languages = this.player_.languages && this.player_.languages();
      var language = languages && languages[code];
      var primaryCode = code && code.split('-')[0];
      var primaryLang = languages && languages[primaryCode];
      var localizedString = defaultValue;

      if (language && language[string]) {
        localizedString = language[string];
      } else if (primaryLang && primaryLang[string]) {
        localizedString = primaryLang[string];
      }

      if (tokens) {
        localizedString = localizedString.replace(/\{(\d+)\}/g, function (match, index) {
          var value = tokens[index - 1];
          var ret = value;

          if (typeof value === 'undefined') {
            ret = match;
          }

          return ret;
        });
      }

      return localizedString;
    }
    /**
     * Return the `Component`s DOM element. This is where children get inserted.
     * This will usually be the the same as the element returned in {@link Component#el}.
     *
     * @return {Element}
     *         The content element for this `Component`.
     */
    ;

    _proto.contentEl = function contentEl() {
      return this.contentEl_ || this.el_;
    }
    /**
     * Get this `Component`s ID
     *
     * @return {string}
     *         The id of this `Component`
     */
    ;

    _proto.id = function id() {
      return this.id_;
    }
    /**
     * Get the `Component`s name. The name gets used to reference the `Component`
     * and is set during registration.
     *
     * @return {string}
     *         The name of this `Component`.
     */
    ;

    _proto.name = function name() {
      return this.name_;
    }
    /**
     * Get an array of all child components
     *
     * @return {Array}
     *         The children
     */
    ;

    _proto.children = function children() {
      return this.children_;
    }
    /**
     * Returns the child `Component` with the given `id`.
     *
     * @param {string} id
     *        The id of the child `Component` to get.
     *
     * @return {Component|undefined}
     *         The child `Component` with the given `id` or undefined.
     */
    ;

    _proto.getChildById = function getChildById(id) {
      return this.childIndex_[id];
    }
    /**
     * Returns the child `Component` with the given `name`.
     *
     * @param {string} name
     *        The name of the child `Component` to get.
     *
     * @return {Component|undefined}
     *         The child `Component` with the given `name` or undefined.
     */
    ;

    _proto.getChild = function getChild(name) {
      if (!name) {
        return;
      }

      return this.childNameIndex_[name];
    }
    /**
     * Returns the descendant `Component` following the givent
     * descendant `names`. For instance ['foo', 'bar', 'baz'] would
     * try to get 'foo' on the current component, 'bar' on the 'foo'
     * component and 'baz' on the 'bar' component and return undefined
     * if any of those don't exist.
     *
     * @param {...string[]|...string} names
     *        The name of the child `Component` to get.
     *
     * @return {Component|undefined}
     *         The descendant `Component` following the given descendant
     *         `names` or undefined.
     */
    ;

    _proto.getDescendant = function getDescendant() {
      for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
        names[_key] = arguments[_key];
      }

      // flatten array argument into the main array
      names = names.reduce(function (acc, n) {
        return acc.concat(n);
      }, []);
      var currentChild = this;

      for (var i = 0; i < names.length; i++) {
        currentChild = currentChild.getChild(names[i]);

        if (!currentChild || !currentChild.getChild) {
          return;
        }
      }

      return currentChild;
    }
    /**
     * Add a child `Component` inside the current `Component`.
     *
     *
     * @param {string|Component} child
     *        The name or instance of a child to add.
     *
     * @param {Object} [options={}]
     *        The key/value store of options that will get passed to children of
     *        the child.
     *
     * @param {number} [index=this.children_.length]
     *        The index to attempt to add a child into.
     *
     * @return {Component}
     *         The `Component` that gets added as a child. When using a string the
     *         `Component` will get created by this process.
     */
    ;

    _proto.addChild = function addChild(child, options, index) {
      if (options === void 0) {
        options = {};
      }

      if (index === void 0) {
        index = this.children_.length;
      }

      var component;
      var componentName; // If child is a string, create component with options

      if (typeof child === 'string') {
        componentName = toTitleCase(child);
        var componentClassName = options.componentClass || componentName; // Set name through options

        options.name = componentName; // Create a new object & element for this controls set
        // If there's no .player_, this is a player

        var ComponentClass = Component.getComponent(componentClassName);

        if (!ComponentClass) {
          throw new Error("Component " + componentClassName + " does not exist");
        } // data stored directly on the videojs object may be
        // misidentified as a component to retain
        // backwards-compatibility with 4.x. check to make sure the
        // component class can be instantiated.


        if (typeof ComponentClass !== 'function') {
          return null;
        }

        component = new ComponentClass(this.player_ || this, options); // child is a component instance
      } else {
        component = child;
      }

      if (component.parentComponent_) {
        component.parentComponent_.removeChild(component);
      }

      this.children_.splice(index, 0, component);
      component.parentComponent_ = this;

      if (typeof component.id === 'function') {
        this.childIndex_[component.id()] = component;
      } // If a name wasn't used to create the component, check if we can use the
      // name function of the component


      componentName = componentName || component.name && toTitleCase(component.name());

      if (componentName) {
        this.childNameIndex_[componentName] = component;
        this.childNameIndex_[toLowerCase(componentName)] = component;
      } // Add the UI object's element to the container div (box)
      // Having an element is not required


      if (typeof component.el === 'function' && component.el()) {
        // If inserting before a component, insert before that component's element
        var refNode = null;

        if (this.children_[index + 1]) {
          // Most children are components, but the video tech is an HTML element
          if (this.children_[index + 1].el_) {
            refNode = this.children_[index + 1].el_;
          } else if (isEl(this.children_[index + 1])) {
            refNode = this.children_[index + 1];
          }
        }

        this.contentEl().insertBefore(component.el(), refNode);
      } // Return so it can stored on parent object if desired.


      return component;
    }
    /**
     * Remove a child `Component` from this `Component`s list of children. Also removes
     * the child `Component`s element from this `Component`s element.
     *
     * @param {Component} component
     *        The child `Component` to remove.
     */
    ;

    _proto.removeChild = function removeChild(component) {
      if (typeof component === 'string') {
        component = this.getChild(component);
      }

      if (!component || !this.children_) {
        return;
      }

      var childFound = false;

      for (var i = this.children_.length - 1; i >= 0; i--) {
        if (this.children_[i] === component) {
          childFound = true;
          this.children_.splice(i, 1);
          break;
        }
      }

      if (!childFound) {
        return;
      }

      component.parentComponent_ = null;
      this.childIndex_[component.id()] = null;
      this.childNameIndex_[toTitleCase(component.name())] = null;
      this.childNameIndex_[toLowerCase(component.name())] = null;
      var compEl = component.el();

      if (compEl && compEl.parentNode === this.contentEl()) {
        this.contentEl().removeChild(component.el());
      }
    }
    /**
     * Add and initialize default child `Component`s based upon options.
     */
    ;

    _proto.initChildren = function initChildren() {
      var _this = this;

      var children = this.options_.children;

      if (children) {
        // `this` is `parent`
        var parentOptions = this.options_;

        var handleAdd = function handleAdd(child) {
          var name = child.name;
          var opts = child.opts; // Allow options for children to be set at the parent options
          // e.g. videojs(id, { controlBar: false });
          // instead of videojs(id, { children: { controlBar: false });

          if (parentOptions[name] !== undefined) {
            opts = parentOptions[name];
          } // Allow for disabling default components
          // e.g. options['children']['posterImage'] = false


          if (opts === false) {
            return;
          } // Allow options to be passed as a simple boolean if no configuration
          // is necessary.


          if (opts === true) {
            opts = {};
          } // We also want to pass the original player options
          // to each component as well so they don't need to
          // reach back into the player for options later.


          opts.playerOptions = _this.options_.playerOptions; // Create and add the child component.
          // Add a direct reference to the child by name on the parent instance.
          // If two of the same component are used, different names should be supplied
          // for each

          var newChild = _this.addChild(name, opts);

          if (newChild) {
            _this[name] = newChild;
          }
        }; // Allow for an array of children details to passed in the options


        var workingChildren;
        var Tech = Component.getComponent('Tech');

        if (Array.isArray(children)) {
          workingChildren = children;
        } else {
          workingChildren = Object.keys(children);
        }

        workingChildren // children that are in this.options_ but also in workingChildren  would
        // give us extra children we do not want. So, we want to filter them out.
        .concat(Object.keys(this.options_).filter(function (child) {
          return !workingChildren.some(function (wchild) {
            if (typeof wchild === 'string') {
              return child === wchild;
            }

            return child === wchild.name;
          });
        })).map(function (child) {
          var name;
          var opts;

          if (typeof child === 'string') {
            name = child;
            opts = children[name] || _this.options_[name] || {};
          } else {
            name = child.name;
            opts = child;
          }

          return {
            name: name,
            opts: opts
          };
        }).filter(function (child) {
          // we have to make sure that child.name isn't in the techOrder since
          // techs are registerd as Components but can't aren't compatible
          // See https://github.com/videojs/video.js/issues/2772
          var c = Component.getComponent(child.opts.componentClass || toTitleCase(child.name));
          return c && !Tech.isTech(c);
        }).forEach(handleAdd);
      }
    }
    /**
     * Builds the default DOM class name. Should be overriden by sub-components.
     *
     * @return {string}
     *         The DOM class name for this object.
     *
     * @abstract
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      // Child classes can include a function that does:
      // return 'CLASS NAME' + this._super();
      return '';
    }
    /**
     * Bind a listener to the component's ready state.
     * Different from event listeners in that if the ready event has already happened
     * it will trigger the function immediately.
     *
     * @return {Component}
     *         Returns itself; method can be chained.
     */
    ;

    _proto.ready = function ready(fn, sync) {
      if (sync === void 0) {
        sync = false;
      }

      if (!fn) {
        return;
      }

      if (!this.isReady_) {
        this.readyQueue_ = this.readyQueue_ || [];
        this.readyQueue_.push(fn);
        return;
      }

      if (sync) {
        fn.call(this);
      } else {
        // Call the function asynchronously by default for consistency
        this.setTimeout(fn, 1);
      }
    }
    /**
     * Trigger all the ready listeners for this `Component`.
     *
     * @fires Component#ready
     */
    ;

    _proto.triggerReady = function triggerReady() {
      this.isReady_ = true; // Ensure ready is triggered asynchronously

      this.setTimeout(function () {
        var readyQueue = this.readyQueue_; // Reset Ready Queue

        this.readyQueue_ = [];

        if (readyQueue && readyQueue.length > 0) {
          readyQueue.forEach(function (fn) {
            fn.call(this);
          }, this);
        } // Allow for using event listeners also

        /**
         * Triggered when a `Component` is ready.
         *
         * @event Component#ready
         * @type {EventTarget~Event}
         */


        this.trigger('ready');
      }, 1);
    }
    /**
     * Find a single DOM element matching a `selector`. This can be within the `Component`s
     * `contentEl()` or another custom context.
     *
     * @param {string} selector
     *        A valid CSS selector, which will be passed to `querySelector`.
     *
     * @param {Element|string} [context=this.contentEl()]
     *        A DOM element within which to query. Can also be a selector string in
     *        which case the first matching element will get used as context. If
     *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
     *        nothing it falls back to `document`.
     *
     * @return {Element|null}
     *         the dom element that was found, or null
     *
     * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
     */
    ;

    _proto.$ = function $$1(selector, context) {
      return $(selector, context || this.contentEl());
    }
    /**
     * Finds all DOM element matching a `selector`. This can be within the `Component`s
     * `contentEl()` or another custom context.
     *
     * @param {string} selector
     *        A valid CSS selector, which will be passed to `querySelectorAll`.
     *
     * @param {Element|string} [context=this.contentEl()]
     *        A DOM element within which to query. Can also be a selector string in
     *        which case the first matching element will get used as context. If
     *        missing `this.contentEl()` gets used. If  `this.contentEl()` returns
     *        nothing it falls back to `document`.
     *
     * @return {NodeList}
     *         a list of dom elements that were found
     *
     * @see [Information on CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_Started/Selectors)
     */
    ;

    _proto.$$ = function $$$1(selector, context) {
      return $$(selector, context || this.contentEl());
    }
    /**
     * Check if a component's element has a CSS class name.
     *
     * @param {string} classToCheck
     *        CSS class name to check.
     *
     * @return {boolean}
     *         - True if the `Component` has the class.
     *         - False if the `Component` does not have the class`
     */
    ;

    _proto.hasClass = function hasClass$1(classToCheck) {
      return hasClass(this.el_, classToCheck);
    }
    /**
     * Add a CSS class name to the `Component`s element.
     *
     * @param {string} classToAdd
     *        CSS class name to add
     */
    ;

    _proto.addClass = function addClass$1(classToAdd) {
      addClass(this.el_, classToAdd);
    }
    /**
     * Remove a CSS class name from the `Component`s element.
     *
     * @param {string} classToRemove
     *        CSS class name to remove
     */
    ;

    _proto.removeClass = function removeClass$1(classToRemove) {
      removeClass(this.el_, classToRemove);
    }
    /**
     * Add or remove a CSS class name from the component's element.
     * - `classToToggle` gets added when {@link Component#hasClass} would return false.
     * - `classToToggle` gets removed when {@link Component#hasClass} would return true.
     *
     * @param  {string} classToToggle
     *         The class to add or remove based on (@link Component#hasClass}
     *
     * @param  {boolean|Dom~predicate} [predicate]
     *         An {@link Dom~predicate} function or a boolean
     */
    ;

    _proto.toggleClass = function toggleClass$1(classToToggle, predicate) {
      toggleClass(this.el_, classToToggle, predicate);
    }
    /**
     * Show the `Component`s element if it is hidden by removing the
     * 'vjs-hidden' class name from it.
     */
    ;

    _proto.show = function show() {
      this.removeClass('vjs-hidden');
    }
    /**
     * Hide the `Component`s element if it is currently showing by adding the
     * 'vjs-hidden` class name to it.
     */
    ;

    _proto.hide = function hide() {
      this.addClass('vjs-hidden');
    }
    /**
     * Lock a `Component`s element in its visible state by adding the 'vjs-lock-showing'
     * class name to it. Used during fadeIn/fadeOut.
     *
     * @private
     */
    ;

    _proto.lockShowing = function lockShowing() {
      this.addClass('vjs-lock-showing');
    }
    /**
     * Unlock a `Component`s element from its visible state by removing the 'vjs-lock-showing'
     * class name from it. Used during fadeIn/fadeOut.
     *
     * @private
     */
    ;

    _proto.unlockShowing = function unlockShowing() {
      this.removeClass('vjs-lock-showing');
    }
    /**
     * Get the value of an attribute on the `Component`s element.
     *
     * @param {string} attribute
     *        Name of the attribute to get the value from.
     *
     * @return {string|null}
     *         - The value of the attribute that was asked for.
     *         - Can be an empty string on some browsers if the attribute does not exist
     *           or has no value
     *         - Most browsers will return null if the attibute does not exist or has
     *           no value.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute}
     */
    ;

    _proto.getAttribute = function getAttribute$1(attribute) {
      return getAttribute(this.el_, attribute);
    }
    /**
     * Set the value of an attribute on the `Component`'s element
     *
     * @param {string} attribute
     *        Name of the attribute to set.
     *
     * @param {string} value
     *        Value to set the attribute to.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute}
     */
    ;

    _proto.setAttribute = function setAttribute$1(attribute, value) {
      setAttribute(this.el_, attribute, value);
    }
    /**
     * Remove an attribute from the `Component`s element.
     *
     * @param {string} attribute
     *        Name of the attribute to remove.
     *
     * @see [DOM API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute}
     */
    ;

    _proto.removeAttribute = function removeAttribute$1(attribute) {
      removeAttribute(this.el_, attribute);
    }
    /**
     * Get or set the width of the component based upon the CSS styles.
     * See {@link Component#dimension} for more detailed information.
     *
     * @param {number|string} [num]
     *        The width that you want to set postfixed with '%', 'px' or nothing.
     *
     * @param {boolean} [skipListeners]
     *        Skip the componentresize event trigger
     *
     * @return {number|string}
     *         The width when getting, zero if there is no width. Can be a string
     *           postpixed with '%' or 'px'.
     */
    ;

    _proto.width = function width(num, skipListeners) {
      return this.dimension('width', num, skipListeners);
    }
    /**
     * Get or set the height of the component based upon the CSS styles.
     * See {@link Component#dimension} for more detailed information.
     *
     * @param {number|string} [num]
     *        The height that you want to set postfixed with '%', 'px' or nothing.
     *
     * @param {boolean} [skipListeners]
     *        Skip the componentresize event trigger
     *
     * @return {number|string}
     *         The width when getting, zero if there is no width. Can be a string
     *         postpixed with '%' or 'px'.
     */
    ;

    _proto.height = function height(num, skipListeners) {
      return this.dimension('height', num, skipListeners);
    }
    /**
     * Set both the width and height of the `Component` element at the same time.
     *
     * @param  {number|string} width
     *         Width to set the `Component`s element to.
     *
     * @param  {number|string} height
     *         Height to set the `Component`s element to.
     */
    ;

    _proto.dimensions = function dimensions(width, height) {
      // Skip componentresize listeners on width for optimization
      this.width(width, true);
      this.height(height);
    }
    /**
     * Get or set width or height of the `Component` element. This is the shared code
     * for the {@link Component#width} and {@link Component#height}.
     *
     * Things to know:
     * - If the width or height in an number this will return the number postfixed with 'px'.
     * - If the width/height is a percent this will return the percent postfixed with '%'
     * - Hidden elements have a width of 0 with `window.getComputedStyle`. This function
     *   defaults to the `Component`s `style.width` and falls back to `window.getComputedStyle`.
     *   See [this]{@link http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/}
     *   for more information
     * - If you want the computed style of the component, use {@link Component#currentWidth}
     *   and {@link {Component#currentHeight}
     *
     * @fires Component#componentresize
     *
     * @param {string} widthOrHeight
     8        'width' or 'height'
     *
     * @param  {number|string} [num]
     8         New dimension
     *
     * @param  {boolean} [skipListeners]
     *         Skip componentresize event trigger
     *
     * @return {number}
     *         The dimension when getting or 0 if unset
     */
    ;

    _proto.dimension = function dimension(widthOrHeight, num, skipListeners) {
      if (num !== undefined) {
        // Set to zero if null or literally NaN (NaN !== NaN)
        if (num === null || num !== num) {
          num = 0;
        } // Check if using css width/height (% or px) and adjust


        if (('' + num).indexOf('%') !== -1 || ('' + num).indexOf('px') !== -1) {
          this.el_.style[widthOrHeight] = num;
        } else if (num === 'auto') {
          this.el_.style[widthOrHeight] = '';
        } else {
          this.el_.style[widthOrHeight] = num + 'px';
        } // skipListeners allows us to avoid triggering the resize event when setting both width and height


        if (!skipListeners) {
          /**
           * Triggered when a component is resized.
           *
           * @event Component#componentresize
           * @type {EventTarget~Event}
           */
          this.trigger('componentresize');
        }

        return;
      } // Not setting a value, so getting it
      // Make sure element exists


      if (!this.el_) {
        return 0;
      } // Get dimension value from style


      var val = this.el_.style[widthOrHeight];
      var pxIndex = val.indexOf('px');

      if (pxIndex !== -1) {
        // Return the pixel value with no 'px'
        return parseInt(val.slice(0, pxIndex), 10);
      } // No px so using % or no style was set, so falling back to offsetWidth/height
      // If component has display:none, offset will return 0
      // TODO: handle display:none and no dimension style using px


      return parseInt(this.el_['offset' + toTitleCase(widthOrHeight)], 10);
    }
    /**
     * Get the computed width or the height of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @param {string} widthOrHeight
     *        A string containing 'width' or 'height'. Whichever one you want to get.
     *
     * @return {number}
     *         The dimension that gets asked for or 0 if nothing was set
     *         for that dimension.
     */
    ;

    _proto.currentDimension = function currentDimension(widthOrHeight) {
      var computedWidthOrHeight = 0;

      if (widthOrHeight !== 'width' && widthOrHeight !== 'height') {
        throw new Error('currentDimension only accepts width or height value');
      }

      computedWidthOrHeight = computedStyle(this.el_, widthOrHeight); // remove 'px' from variable and parse as integer

      computedWidthOrHeight = parseFloat(computedWidthOrHeight); // if the computed value is still 0, it's possible that the browser is lying
      // and we want to check the offset values.
      // This code also runs wherever getComputedStyle doesn't exist.

      if (computedWidthOrHeight === 0 || isNaN(computedWidthOrHeight)) {
        var rule = "offset" + toTitleCase(widthOrHeight);
        computedWidthOrHeight = this.el_[rule];
      }

      return computedWidthOrHeight;
    }
    /**
     * An object that contains width and height values of the `Component`s
     * computed style. Uses `window.getComputedStyle`.
     *
     * @typedef {Object} Component~DimensionObject
     *
     * @property {number} width
     *           The width of the `Component`s computed style.
     *
     * @property {number} height
     *           The height of the `Component`s computed style.
     */

    /**
     * Get an object that contains computed width and height values of the
     * component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {Component~DimensionObject}
     *         The computed dimensions of the component's element.
     */
    ;

    _proto.currentDimensions = function currentDimensions() {
      return {
        width: this.currentDimension('width'),
        height: this.currentDimension('height')
      };
    }
    /**
     * Get the computed width of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {number}
     *         The computed width of the component's element.
     */
    ;

    _proto.currentWidth = function currentWidth() {
      return this.currentDimension('width');
    }
    /**
     * Get the computed height of the component's element.
     *
     * Uses `window.getComputedStyle`.
     *
     * @return {number}
     *         The computed height of the component's element.
     */
    ;

    _proto.currentHeight = function currentHeight() {
      return this.currentDimension('height');
    }
    /**
     * Set the focus to this component
     */
    ;

    _proto.focus = function focus() {
      this.el_.focus();
    }
    /**
     * Remove the focus from this component
     */
    ;

    _proto.blur = function blur() {
      this.el_.blur();
    }
    /**
     * When this Component receives a `keydown` event which it does not process,
     *  it passes the event to the Player for handling.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      if (this.player_) {
        // We only stop propagation here because we want unhandled events to fall
        // back to the browser.
        event.stopPropagation();
        this.player_.handleKeyDown(event);
      }
    }
    /**
     * Many components used to have a `handleKeyPress` method, which was poorly
     * named because it listened to a `keydown` event. This method name now
     * delegates to `handleKeyDown`. This means anyone calling `handleKeyPress`
     * will not see their method calls stop working.
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to be called.
     */
    ;

    _proto.handleKeyPress = function handleKeyPress(event) {
      this.handleKeyDown(event);
    }
    /**
     * Emit a 'tap' events when touch event support gets detected. This gets used to
     * support toggling the controls through a tap on the video. They get enabled
     * because every sub-component would have extra overhead otherwise.
     *
     * @private
     * @fires Component#tap
     * @listens Component#touchstart
     * @listens Component#touchmove
     * @listens Component#touchleave
     * @listens Component#touchcancel
     * @listens Component#touchend
      */
    ;

    _proto.emitTapEvents = function emitTapEvents() {
      // Track the start time so we can determine how long the touch lasted
      var touchStart = 0;
      var firstTouch = null; // Maximum movement allowed during a touch event to still be considered a tap
      // Other popular libs use anywhere from 2 (hammer.js) to 15,
      // so 10 seems like a nice, round number.

      var tapMovementThreshold = 10; // The maximum length a touch can be while still being considered a tap

      var touchTimeThreshold = 200;
      var couldBeTap;
      this.on('touchstart', function (event) {
        // If more than one finger, don't consider treating this as a click
        if (event.touches.length === 1) {
          // Copy pageX/pageY from the object
          firstTouch = {
            pageX: event.touches[0].pageX,
            pageY: event.touches[0].pageY
          }; // Record start time so we can detect a tap vs. "touch and hold"

          touchStart = window$1.performance.now(); // Reset couldBeTap tracking

          couldBeTap = true;
        }
      });
      this.on('touchmove', function (event) {
        // If more than one finger, don't consider treating this as a click
        if (event.touches.length > 1) {
          couldBeTap = false;
        } else if (firstTouch) {
          // Some devices will throw touchmoves for all but the slightest of taps.
          // So, if we moved only a small distance, this could still be a tap
          var xdiff = event.touches[0].pageX - firstTouch.pageX;
          var ydiff = event.touches[0].pageY - firstTouch.pageY;
          var touchDistance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

          if (touchDistance > tapMovementThreshold) {
            couldBeTap = false;
          }
        }
      });

      var noTap = function noTap() {
        couldBeTap = false;
      }; // TODO: Listen to the original target. http://youtu.be/DujfpXOKUp8?t=13m8s


      this.on('touchleave', noTap);
      this.on('touchcancel', noTap); // When the touch ends, measure how long it took and trigger the appropriate
      // event

      this.on('touchend', function (event) {
        firstTouch = null; // Proceed only if the touchmove/leave/cancel event didn't happen

        if (couldBeTap === true) {
          // Measure how long the touch lasted
          var touchTime = window$1.performance.now() - touchStart; // Make sure the touch was less than the threshold to be considered a tap

          if (touchTime < touchTimeThreshold) {
            // Don't let browser turn this into a click
            event.preventDefault();
            /**
             * Triggered when a `Component` is tapped.
             *
             * @event Component#tap
             * @type {EventTarget~Event}
             */

            this.trigger('tap'); // It may be good to copy the touchend event object and change the
            // type to tap, if the other event properties aren't exact after
            // Events.fixEvent runs (e.g. event.target)
          }
        }
      });
    }
    /**
     * This function reports user activity whenever touch events happen. This can get
     * turned off by any sub-components that wants touch events to act another way.
     *
     * Report user touch activity when touch events occur. User activity gets used to
     * determine when controls should show/hide. It is simple when it comes to mouse
     * events, because any mouse event should show the controls. So we capture mouse
     * events that bubble up to the player and report activity when that happens.
     * With touch events it isn't as easy as `touchstart` and `touchend` toggle player
     * controls. So touch events can't help us at the player level either.
     *
     * User activity gets checked asynchronously. So what could happen is a tap event
     * on the video turns the controls off. Then the `touchend` event bubbles up to
     * the player. Which, if it reported user activity, would turn the controls right
     * back on. We also don't want to completely block touch events from bubbling up.
     * Furthermore a `touchmove` event and anything other than a tap, should not turn
     * controls back on.
     *
     * @listens Component#touchstart
     * @listens Component#touchmove
     * @listens Component#touchend
     * @listens Component#touchcancel
     */
    ;

    _proto.enableTouchActivity = function enableTouchActivity() {
      // Don't continue if the root player doesn't support reporting user activity
      if (!this.player() || !this.player().reportUserActivity) {
        return;
      } // listener for reporting that the user is active


      var report = bind(this.player(), this.player().reportUserActivity);
      var touchHolding;
      this.on('touchstart', function () {
        report(); // For as long as the they are touching the device or have their mouse down,
        // we consider them active even if they're not moving their finger or mouse.
        // So we want to continue to update that they are active

        this.clearInterval(touchHolding); // report at the same interval as activityCheck

        touchHolding = this.setInterval(report, 250);
      });

      var touchEnd = function touchEnd(event) {
        report(); // stop the interval that maintains activity if the touch is holding

        this.clearInterval(touchHolding);
      };

      this.on('touchmove', report);
      this.on('touchend', touchEnd);
      this.on('touchcancel', touchEnd);
    }
    /**
     * A callback that has no parameters and is bound into `Component`s context.
     *
     * @callback Component~GenericCallback
     * @this Component
     */

    /**
     * Creates a function that runs after an `x` millisecond timeout. This function is a
     * wrapper around `window.setTimeout`. There are a few reasons to use this one
     * instead though:
     * 1. It gets cleared via  {@link Component#clearTimeout} when
     *    {@link Component#dispose} gets called.
     * 2. The function callback will gets turned into a {@link Component~GenericCallback}
     *
     * > Note: You can't use `window.clearTimeout` on the id returned by this function. This
     *         will cause its dispose listener not to get cleaned up! Please use
     *         {@link Component#clearTimeout} or {@link Component#dispose} instead.
     *
     * @param {Component~GenericCallback} fn
     *        The function that will be run after `timeout`.
     *
     * @param {number} timeout
     *        Timeout in milliseconds to delay before executing the specified function.
     *
     * @return {number}
     *         Returns a timeout ID that gets used to identify the timeout. It can also
     *         get used in {@link Component#clearTimeout} to clear the timeout that
     *         was set.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout}
     */
    ;

    _proto.setTimeout = function setTimeout(fn, timeout) {
      var _this2 = this;

      // declare as variables so they are properly available in timeout function
      // eslint-disable-next-line
      var timeoutId;
      fn = bind(this, fn);
      this.clearTimersOnDispose_();
      timeoutId = window$1.setTimeout(function () {
        if (_this2.setTimeoutIds_.has(timeoutId)) {
          _this2.setTimeoutIds_["delete"](timeoutId);
        }

        fn();
      }, timeout);
      this.setTimeoutIds_.add(timeoutId);
      return timeoutId;
    }
    /**
     * Clears a timeout that gets created via `window.setTimeout` or
     * {@link Component#setTimeout}. If you set a timeout via {@link Component#setTimeout}
     * use this function instead of `window.clearTimout`. If you don't your dispose
     * listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} timeoutId
     *        The id of the timeout to clear. The return value of
     *        {@link Component#setTimeout} or `window.setTimeout`.
     *
     * @return {number}
     *         Returns the timeout id that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout}
     */
    ;

    _proto.clearTimeout = function clearTimeout(timeoutId) {
      if (this.setTimeoutIds_.has(timeoutId)) {
        this.setTimeoutIds_["delete"](timeoutId);
        window$1.clearTimeout(timeoutId);
      }

      return timeoutId;
    }
    /**
     * Creates a function that gets run every `x` milliseconds. This function is a wrapper
     * around `window.setInterval`. There are a few reasons to use this one instead though.
     * 1. It gets cleared via  {@link Component#clearInterval} when
     *    {@link Component#dispose} gets called.
     * 2. The function callback will be a {@link Component~GenericCallback}
     *
     * @param {Component~GenericCallback} fn
     *        The function to run every `x` seconds.
     *
     * @param {number} interval
     *        Execute the specified function every `x` milliseconds.
     *
     * @return {number}
     *         Returns an id that can be used to identify the interval. It can also be be used in
     *         {@link Component#clearInterval} to clear the interval.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval}
     */
    ;

    _proto.setInterval = function setInterval(fn, interval) {
      fn = bind(this, fn);
      this.clearTimersOnDispose_();
      var intervalId = window$1.setInterval(fn, interval);
      this.setIntervalIds_.add(intervalId);
      return intervalId;
    }
    /**
     * Clears an interval that gets created via `window.setInterval` or
     * {@link Component#setInterval}. If you set an inteval via {@link Component#setInterval}
     * use this function instead of `window.clearInterval`. If you don't your dispose
     * listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} intervalId
     *        The id of the interval to clear. The return value of
     *        {@link Component#setInterval} or `window.setInterval`.
     *
     * @return {number}
     *         Returns the interval id that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearInterval}
     */
    ;

    _proto.clearInterval = function clearInterval(intervalId) {
      if (this.setIntervalIds_.has(intervalId)) {
        this.setIntervalIds_["delete"](intervalId);
        window$1.clearInterval(intervalId);
      }

      return intervalId;
    }
    /**
     * Queues up a callback to be passed to requestAnimationFrame (rAF), but
     * with a few extra bonuses:
     *
     * - Supports browsers that do not support rAF by falling back to
     *   {@link Component#setTimeout}.
     *
     * - The callback is turned into a {@link Component~GenericCallback} (i.e.
     *   bound to the component).
     *
     * - Automatic cancellation of the rAF callback is handled if the component
     *   is disposed before it is called.
     *
     * @param  {Component~GenericCallback} fn
     *         A function that will be bound to this component and executed just
     *         before the browser's next repaint.
     *
     * @return {number}
     *         Returns an rAF ID that gets used to identify the timeout. It can
     *         also be used in {@link Component#cancelAnimationFrame} to cancel
     *         the animation frame callback.
     *
     * @listens Component#dispose
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}
     */
    ;

    _proto.requestAnimationFrame = function requestAnimationFrame(fn) {
      var _this3 = this;

      // Fall back to using a timer.
      if (!this.supportsRaf_) {
        return this.setTimeout(fn, 1000 / 60);
      }

      this.clearTimersOnDispose_(); // declare as variables so they are properly available in rAF function
      // eslint-disable-next-line

      var id;
      fn = bind(this, fn);
      id = window$1.requestAnimationFrame(function () {
        if (_this3.rafIds_.has(id)) {
          _this3.rafIds_["delete"](id);
        }

        fn();
      });
      this.rafIds_.add(id);
      return id;
    }
    /**
     * Request an animation frame, but only one named animation
     * frame will be queued. Another will never be added until
     * the previous one finishes.
     *
     * @param {string} name
     *        The name to give this requestAnimationFrame
     *
     * @param  {Component~GenericCallback} fn
     *         A function that will be bound to this component and executed just
     *         before the browser's next repaint.
     */
    ;

    _proto.requestNamedAnimationFrame = function requestNamedAnimationFrame(name, fn) {
      var _this4 = this;

      if (this.namedRafs_.has(name)) {
        return;
      }

      this.clearTimersOnDispose_();
      fn = bind(this, fn);
      var id = this.requestAnimationFrame(function () {
        fn();

        if (_this4.namedRafs_.has(name)) {
          _this4.namedRafs_["delete"](name);
        }
      });
      this.namedRafs_.set(name, id);
      return name;
    }
    /**
     * Cancels a current named animation frame if it exists.
     *
     * @param {string} name
     *        The name of the requestAnimationFrame to cancel.
     */
    ;

    _proto.cancelNamedAnimationFrame = function cancelNamedAnimationFrame(name) {
      if (!this.namedRafs_.has(name)) {
        return;
      }

      this.cancelAnimationFrame(this.namedRafs_.get(name));
      this.namedRafs_["delete"](name);
    }
    /**
     * Cancels a queued callback passed to {@link Component#requestAnimationFrame}
     * (rAF).
     *
     * If you queue an rAF callback via {@link Component#requestAnimationFrame},
     * use this function instead of `window.cancelAnimationFrame`. If you don't,
     * your dispose listener will not get cleaned up until {@link Component#dispose}!
     *
     * @param {number} id
     *        The rAF ID to clear. The return value of {@link Component#requestAnimationFrame}.
     *
     * @return {number}
     *         Returns the rAF ID that was cleared.
     *
     * @see [Similar to]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame}
     */
    ;

    _proto.cancelAnimationFrame = function cancelAnimationFrame(id) {
      // Fall back to using a timer.
      if (!this.supportsRaf_) {
        return this.clearTimeout(id);
      }

      if (this.rafIds_.has(id)) {
        this.rafIds_["delete"](id);
        window$1.cancelAnimationFrame(id);
      }

      return id;
    }
    /**
     * A function to setup `requestAnimationFrame`, `setTimeout`,
     * and `setInterval`, clearing on dispose.
     *
     * > Previously each timer added and removed dispose listeners on it's own.
     * For better performance it was decided to batch them all, and use `Set`s
     * to track outstanding timer ids.
     *
     * @private
     */
    ;

    _proto.clearTimersOnDispose_ = function clearTimersOnDispose_() {
      var _this5 = this;

      if (this.clearingTimersOnDispose_) {
        return;
      }

      this.clearingTimersOnDispose_ = true;
      this.one('dispose', function () {
        [['namedRafs_', 'cancelNamedAnimationFrame'], ['rafIds_', 'cancelAnimationFrame'], ['setTimeoutIds_', 'clearTimeout'], ['setIntervalIds_', 'clearInterval']].forEach(function (_ref) {
          var idName = _ref[0],
              cancelName = _ref[1];

          // for a `Set` key will actually be the value again
          // so forEach((val, val) =>` but for maps we want to use
          // the key.
          _this5[idName].forEach(function (val, key) {
            return _this5[cancelName](key);
          });
        });
        _this5.clearingTimersOnDispose_ = false;
      });
    }
    /**
     * Register a `Component` with `videojs` given the name and the component.
     *
     * > NOTE: {@link Tech}s should not be registered as a `Component`. {@link Tech}s
     *         should be registered using {@link Tech.registerTech} or
     *         {@link videojs:videojs.registerTech}.
     *
     * > NOTE: This function can also be seen on videojs as
     *         {@link videojs:videojs.registerComponent}.
     *
     * @param {string} name
     *        The name of the `Component` to register.
     *
     * @param {Component} ComponentToRegister
     *        The `Component` class to register.
     *
     * @return {Component}
     *         The `Component` that was registered.
     */
    ;

    Component.registerComponent = function registerComponent(name, ComponentToRegister) {
      if (typeof name !== 'string' || !name) {
        throw new Error("Illegal component name, \"" + name + "\"; must be a non-empty string.");
      }

      var Tech = Component.getComponent('Tech'); // We need to make sure this check is only done if Tech has been registered.

      var isTech = Tech && Tech.isTech(ComponentToRegister);
      var isComp = Component === ComponentToRegister || Component.prototype.isPrototypeOf(ComponentToRegister.prototype);

      if (isTech || !isComp) {
        var reason;

        if (isTech) {
          reason = 'techs must be registered using Tech.registerTech()';
        } else {
          reason = 'must be a Component subclass';
        }

        throw new Error("Illegal component, \"" + name + "\"; " + reason + ".");
      }

      name = toTitleCase(name);

      if (!Component.components_) {
        Component.components_ = {};
      }

      var Player = Component.getComponent('Player');

      if (name === 'Player' && Player && Player.players) {
        var players = Player.players;
        var playerNames = Object.keys(players); // If we have players that were disposed, then their name will still be
        // in Players.players. So, we must loop through and verify that the value
        // for each item is not null. This allows registration of the Player component
        // after all players have been disposed or before any were created.

        if (players && playerNames.length > 0 && playerNames.map(function (pname) {
          return players[pname];
        }).every(Boolean)) {
          throw new Error('Can not register Player component after player has been created.');
        }
      }

      Component.components_[name] = ComponentToRegister;
      Component.components_[toLowerCase(name)] = ComponentToRegister;
      return ComponentToRegister;
    }
    /**
     * Get a `Component` based on the name it was registered with.
     *
     * @param {string} name
     *        The Name of the component to get.
     *
     * @return {Component}
     *         The `Component` that got registered under the given name.
     *
     * @deprecated In `videojs` 6 this will not return `Component`s that were not
     *             registered using {@link Component.registerComponent}. Currently we
     *             check the global `videojs` object for a `Component` name and
     *             return that if it exists.
     */
    ;

    Component.getComponent = function getComponent(name) {
      if (!name || !Component.components_) {
        return;
      }

      return Component.components_[name];
    };

    return Component;
  }();
  /**
   * Whether or not this component supports `requestAnimationFrame`.
   *
   * This is exposed primarily for testing purposes.
   *
   * @private
   * @type {Boolean}
   */


  Component.prototype.supportsRaf_ = typeof window$1.requestAnimationFrame === 'function' && typeof window$1.cancelAnimationFrame === 'function';
  Component.registerComponent('Component', Component);

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var assertThisInitialized = _assertThisInitialized;

  var _typeof_1 = createCommonjsModule(function (module) {
    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        module.exports = _typeof = function _typeof(obj) {
          return typeof obj;
        };
      } else {
        module.exports = _typeof = function _typeof(obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    module.exports = _typeof;
  });

  var getPrototypeOf = createCommonjsModule(function (module) {
    function _getPrototypeOf(o) {
      module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    module.exports = _getPrototypeOf;
  });

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var inheritsLoose = _inheritsLoose;

  /**
   * @file browser.js
   * @module browser
   */
  var USER_AGENT = window$1.navigator && window$1.navigator.userAgent || '';
  var webkitVersionMap = /AppleWebKit\/([\d.]+)/i.exec(USER_AGENT);
  var appleWebkitVersion = webkitVersionMap ? parseFloat(webkitVersionMap.pop()) : null;
  /**
   * Whether or not this device is an iPod.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IPOD = /iPod/i.test(USER_AGENT);
  /**
   * The detected iOS version - or `null`.
   *
   * @static
   * @const
   * @type {string|null}
   */

  var IOS_VERSION = function () {
    var match = USER_AGENT.match(/OS (\d+)_/i);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  }();
  /**
   * Whether or not this is an Android device.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_ANDROID = /Android/i.test(USER_AGENT);
  /**
   * The detected Android version - or `null`.
   *
   * @static
   * @const
   * @type {number|string|null}
   */

  var ANDROID_VERSION = function () {
    // This matches Android Major.Minor.Patch versions
    // ANDROID_VERSION is Major.Minor as a Number, if Minor isn't available, then only Major is returned
    var match = USER_AGENT.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);

    if (!match) {
      return null;
    }

    var major = match[1] && parseFloat(match[1]);
    var minor = match[2] && parseFloat(match[2]);

    if (major && minor) {
      return parseFloat(match[1] + '.' + match[2]);
    } else if (major) {
      return major;
    }

    return null;
  }();
  /**
   * Whether or not this is a native Android browser.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_NATIVE_ANDROID = IS_ANDROID && ANDROID_VERSION < 5 && appleWebkitVersion < 537;
  /**
   * Whether or not this is Mozilla Firefox.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_FIREFOX = /Firefox/i.test(USER_AGENT);
  /**
   * Whether or not this is Microsoft Edge.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_EDGE = /Edg/i.test(USER_AGENT);
  /**
   * Whether or not this is Google Chrome.
   *
   * This will also be `true` for Chrome on iOS, which will have different support
   * as it is actually Safari under the hood.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_CHROME = !IS_EDGE && (/Chrome/i.test(USER_AGENT) || /CriOS/i.test(USER_AGENT));
  /**
   * The detected Google Chrome version - or `null`.
   *
   * @static
   * @const
   * @type {number|null}
   */

  var CHROME_VERSION = function () {
    var match = USER_AGENT.match(/(Chrome|CriOS)\/(\d+)/);

    if (match && match[2]) {
      return parseFloat(match[2]);
    }

    return null;
  }();
  /**
   * The detected Internet Explorer version - or `null`.
   *
   * @static
   * @const
   * @type {number|null}
   */

  var IE_VERSION = function () {
    var result = /MSIE\s(\d+)\.\d/.exec(USER_AGENT);
    var version = result && parseFloat(result[1]);

    if (!version && /Trident\/7.0/i.test(USER_AGENT) && /rv:11.0/.test(USER_AGENT)) {
      // IE 11 has a different user agent string than other IE versions
      version = 11.0;
    }

    return version;
  }();
  /**
   * Whether or not this is desktop Safari.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_SAFARI = /Safari/i.test(USER_AGENT) && !IS_CHROME && !IS_ANDROID && !IS_EDGE;
  /**
   * Whether or not this is a Windows machine.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_WINDOWS = /Windows/i.test(USER_AGENT);
  /**
   * Whether or not this device is touch-enabled.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var TOUCH_ENABLED = isReal() && ('ontouchstart' in window$1 || window$1.navigator.maxTouchPoints || window$1.DocumentTouch && window$1.document instanceof window$1.DocumentTouch);
  /**
   * Whether or not this device is an iPad.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IPAD = /iPad/i.test(USER_AGENT) || IS_SAFARI && TOUCH_ENABLED && !/iPhone/i.test(USER_AGENT);
  /**
   * Whether or not this device is an iPhone.
   *
   * @static
   * @const
   * @type {Boolean}
   */
  // The Facebook app's UIWebView identifies as both an iPhone and iPad, so
  // to identify iPhones, we need to exclude iPads.
  // http://artsy.github.io/blog/2012/10/18/the-perils-of-ios-user-agent-sniffing/

  var IS_IPHONE = /iPhone/i.test(USER_AGENT) && !IS_IPAD;
  /**
   * Whether or not this is an iOS device.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_IOS = IS_IPHONE || IS_IPAD || IS_IPOD;
  /**
   * Whether or not this is any flavor of Safari - including iOS.
   *
   * @static
   * @const
   * @type {Boolean}
   */

  var IS_ANY_SAFARI = (IS_SAFARI || IS_IOS) && !IS_CHROME;

  var browser = /*#__PURE__*/Object.freeze({
    __proto__: null,
    IS_IPOD: IS_IPOD,
    IOS_VERSION: IOS_VERSION,
    IS_ANDROID: IS_ANDROID,
    ANDROID_VERSION: ANDROID_VERSION,
    IS_NATIVE_ANDROID: IS_NATIVE_ANDROID,
    IS_FIREFOX: IS_FIREFOX,
    IS_EDGE: IS_EDGE,
    IS_CHROME: IS_CHROME,
    CHROME_VERSION: CHROME_VERSION,
    IE_VERSION: IE_VERSION,
    IS_SAFARI: IS_SAFARI,
    IS_WINDOWS: IS_WINDOWS,
    TOUCH_ENABLED: TOUCH_ENABLED,
    IS_IPAD: IS_IPAD,
    IS_IPHONE: IS_IPHONE,
    IS_IOS: IS_IOS,
    IS_ANY_SAFARI: IS_ANY_SAFARI
  });

  /**
   * @file time-ranges.js
   * @module time-ranges
   */

  /**
   * Returns the time for the specified index at the start or end
   * of a TimeRange object.
   *
   * @typedef    {Function} TimeRangeIndex
   *
   * @param      {number} [index=0]
   *             The range number to return the time for.
   *
   * @return     {number}
   *             The time offset at the specified index.
   *
   * @deprecated The index argument must be provided.
   *             In the future, leaving it out will throw an error.
   */

  /**
   * An object that contains ranges of time.
   *
   * @typedef  {Object} TimeRange
   *
   * @property {number} length
   *           The number of time ranges represented by this object.
   *
   * @property {module:time-ranges~TimeRangeIndex} start
   *           Returns the time offset at which a specified time range begins.
   *
   * @property {module:time-ranges~TimeRangeIndex} end
   *           Returns the time offset at which a specified time range ends.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges
   */

  /**
   * Check if any of the time ranges are over the maximum index.
   *
   * @private
   * @param   {string} fnName
   *          The function name to use for logging
   *
   * @param   {number} index
   *          The index to check
   *
   * @param   {number} maxIndex
   *          The maximum possible index
   *
   * @throws  {Error} if the timeRanges provided are over the maxIndex
   */
  function rangeCheck(fnName, index, maxIndex) {
    if (typeof index !== 'number' || index < 0 || index > maxIndex) {
      throw new Error("Failed to execute '" + fnName + "' on 'TimeRanges': The index provided (" + index + ") is non-numeric or out of bounds (0-" + maxIndex + ").");
    }
  }
  /**
   * Get the time for the specified index at the start or end
   * of a TimeRange object.
   *
   * @private
   * @param      {string} fnName
   *             The function name to use for logging
   *
   * @param      {string} valueIndex
   *             The property that should be used to get the time. should be
   *             'start' or 'end'
   *
   * @param      {Array} ranges
   *             An array of time ranges
   *
   * @param      {Array} [rangeIndex=0]
   *             The index to start the search at
   *
   * @return     {number}
   *             The time that offset at the specified index.
   *
   * @deprecated rangeIndex must be set to a value, in the future this will throw an error.
   * @throws     {Error} if rangeIndex is more than the length of ranges
   */


  function getRange(fnName, valueIndex, ranges, rangeIndex) {
    rangeCheck(fnName, rangeIndex, ranges.length - 1);
    return ranges[rangeIndex][valueIndex];
  }
  /**
   * Create a time range object given ranges of time.
   *
   * @private
   * @param   {Array} [ranges]
   *          An array of time ranges.
   */


  function createTimeRangesObj(ranges) {
    if (ranges === undefined || ranges.length === 0) {
      return {
        length: 0,
        start: function start() {
          throw new Error('This TimeRanges object is empty');
        },
        end: function end() {
          throw new Error('This TimeRanges object is empty');
        }
      };
    }

    return {
      length: ranges.length,
      start: getRange.bind(null, 'start', 0, ranges),
      end: getRange.bind(null, 'end', 1, ranges)
    };
  }
  /**
   * Create a `TimeRange` object which mimics an
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges|HTML5 TimeRanges instance}.
   *
   * @param {number|Array[]} start
   *        The start of a single range (a number) or an array of ranges (an
   *        array of arrays of two numbers each).
   *
   * @param {number} end
   *        The end of a single range. Cannot be used with the array form of
   *        the `start` argument.
   */


  function createTimeRanges(start, end) {
    if (Array.isArray(start)) {
      return createTimeRangesObj(start);
    } else if (start === undefined || end === undefined) {
      return createTimeRangesObj();
    }

    return createTimeRangesObj([[start, end]]);
  }

  /**
   * @file buffer.js
   * @module buffer
   */
  /**
   * Compute the percentage of the media that has been buffered.
   *
   * @param {TimeRange} buffered
   *        The current `TimeRange` object representing buffered time ranges
   *
   * @param {number} duration
   *        Total duration of the media
   *
   * @return {number}
   *         Percent buffered of the total duration in decimal form.
   */

  function bufferedPercent(buffered, duration) {
    var bufferedDuration = 0;
    var start;
    var end;

    if (!duration) {
      return 0;
    }

    if (!buffered || !buffered.length) {
      buffered = createTimeRanges(0, 0);
    }

    for (var i = 0; i < buffered.length; i++) {
      start = buffered.start(i);
      end = buffered.end(i); // buffered end can be bigger than duration by a very small fraction

      if (end > duration) {
        end = duration;
      }

      bufferedDuration += end - start;
    }

    return bufferedDuration / duration;
  }

  /**
   * @file fullscreen-api.js
   * @module fullscreen-api
   * @private
   */
  /**
   * Store the browser-specific methods for the fullscreen API.
   *
   * @type {Object}
   * @see [Specification]{@link https://fullscreen.spec.whatwg.org}
   * @see [Map Approach From Screenfull.js]{@link https://github.com/sindresorhus/screenfull.js}
   */

  var FullscreenApi = {
    prefixed: true
  }; // browser API methods

  var apiMap = [['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror', 'fullscreen'], // WebKit
  ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror', '-webkit-full-screen'], // Mozilla
  ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror', '-moz-full-screen'], // Microsoft
  ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError', '-ms-fullscreen']];
  var specApi = apiMap[0];
  var browserApi; // determine the supported set of functions

  for (var i = 0; i < apiMap.length; i++) {
    // check for exitFullscreen function
    if (apiMap[i][1] in document) {
      browserApi = apiMap[i];
      break;
    }
  } // map the browser API names to the spec API names


  if (browserApi) {
    for (var _i = 0; _i < browserApi.length; _i++) {
      FullscreenApi[specApi[_i]] = browserApi[_i];
    }

    FullscreenApi.prefixed = browserApi[0] !== specApi[0];
  }

  /**
   * @file media-error.js
   */
  /**
   * A Custom `MediaError` class which mimics the standard HTML5 `MediaError` class.
   *
   * @param {number|string|Object|MediaError} value
   *        This can be of multiple types:
   *        - number: should be a standard error code
   *        - string: an error message (the code will be 0)
   *        - Object: arbitrary properties
   *        - `MediaError` (native): used to populate a video.js `MediaError` object
   *        - `MediaError` (video.js): will return itself if it's already a
   *          video.js `MediaError` object.
   *
   * @see [MediaError Spec]{@link https://dev.w3.org/html5/spec-author-view/video.html#mediaerror}
   * @see [Encrypted MediaError Spec]{@link https://www.w3.org/TR/2013/WD-encrypted-media-20130510/#error-codes}
   *
   * @class MediaError
   */

  function MediaError(value) {
    // Allow redundant calls to this constructor to avoid having `instanceof`
    // checks peppered around the code.
    if (value instanceof MediaError) {
      return value;
    }

    if (typeof value === 'number') {
      this.code = value;
    } else if (typeof value === 'string') {
      // default code is zero, so this is a custom error
      this.message = value;
    } else if (isObject(value)) {
      // We assign the `code` property manually because native `MediaError` objects
      // do not expose it as an own/enumerable property of the object.
      if (typeof value.code === 'number') {
        this.code = value.code;
      }

      assign(this, value);
    }

    if (!this.message) {
      this.message = MediaError.defaultMessages[this.code] || '';
    }
  }
  /**
   * The error code that refers two one of the defined `MediaError` types
   *
   * @type {Number}
   */


  MediaError.prototype.code = 0;
  /**
   * An optional message that to show with the error. Message is not part of the HTML5
   * video spec but allows for more informative custom errors.
   *
   * @type {String}
   */

  MediaError.prototype.message = '';
  /**
   * An optional status code that can be set by plugins to allow even more detail about
   * the error. For example a plugin might provide a specific HTTP status code and an
   * error message for that code. Then when the plugin gets that error this class will
   * know how to display an error message for it. This allows a custom message to show
   * up on the `Player` error overlay.
   *
   * @type {Array}
   */

  MediaError.prototype.status = null;
  /**
   * Errors indexed by the W3C standard. The order **CANNOT CHANGE**! See the
   * specification listed under {@link MediaError} for more information.
   *
   * @enum {array}
   * @readonly
   * @property {string} 0 - MEDIA_ERR_CUSTOM
   * @property {string} 1 - MEDIA_ERR_ABORTED
   * @property {string} 2 - MEDIA_ERR_NETWORK
   * @property {string} 3 - MEDIA_ERR_DECODE
   * @property {string} 4 - MEDIA_ERR_SRC_NOT_SUPPORTED
   * @property {string} 5 - MEDIA_ERR_ENCRYPTED
   */

  MediaError.errorTypes = ['MEDIA_ERR_CUSTOM', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED', 'MEDIA_ERR_ENCRYPTED'];
  /**
   * The default `MediaError` messages based on the {@link MediaError.errorTypes}.
   *
   * @type {Array}
   * @constant
   */

  MediaError.defaultMessages = {
    1: 'You aborted the media playback',
    2: 'A network error caused the media download to fail part-way.',
    3: 'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.',
    4: 'The media could not be loaded, either because the server or network failed or because the format is not supported.',
    5: 'The media is encrypted and we do not have the keys to decrypt it.'
  }; // Add types as properties on MediaError
  // e.g. MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

  for (var errNum = 0; errNum < MediaError.errorTypes.length; errNum++) {
    MediaError[MediaError.errorTypes[errNum]] = errNum; // values should be accessible on both the class and instance

    MediaError.prototype[MediaError.errorTypes[errNum]] = errNum;
  } // jsdocs for instance/static members added above

  var tuple = SafeParseTuple;

  function SafeParseTuple(obj, reviver) {
    var json;
    var error = null;

    try {
      json = JSON.parse(obj, reviver);
    } catch (err) {
      error = err;
    }

    return [error, json];
  }

  /**
   * Returns whether an object is `Promise`-like (i.e. has a `then` method).
   *
   * @param  {Object}  value
   *         An object that may or may not be `Promise`-like.
   *
   * @return {boolean}
   *         Whether or not the object is `Promise`-like.
   */
  function isPromise(value) {
    return value !== undefined && value !== null && typeof value.then === 'function';
  }
  /**
   * Silence a Promise-like object.
   *
   * This is useful for avoiding non-harmful, but potentially confusing "uncaught
   * play promise" rejection error messages.
   *
   * @param  {Object} value
   *         An object that may or may not be `Promise`-like.
   */

  function silencePromise(value) {
    if (isPromise(value)) {
      value.then(null, function (e) {});
    }
  }

  /**
   * @file text-track-list-converter.js Utilities for capturing text track state and
   * re-creating tracks based on a capture.
   *
   * @module text-track-list-converter
   */

  /**
   * Examine a single {@link TextTrack} and return a JSON-compatible javascript object that
   * represents the {@link TextTrack}'s state.
   *
   * @param {TextTrack} track
   *        The text track to query.
   *
   * @return {Object}
   *         A serializable javascript representation of the TextTrack.
   * @private
   */
  var trackToJson_ = function trackToJson_(track) {
    var ret = ['kind', 'label', 'language', 'id', 'inBandMetadataTrackDispatchType', 'mode', 'src'].reduce(function (acc, prop, i) {
      if (track[prop]) {
        acc[prop] = track[prop];
      }

      return acc;
    }, {
      cues: track.cues && Array.prototype.map.call(track.cues, function (cue) {
        return {
          startTime: cue.startTime,
          endTime: cue.endTime,
          text: cue.text,
          id: cue.id
        };
      })
    });
    return ret;
  };
  /**
   * Examine a {@link Tech} and return a JSON-compatible javascript array that represents the
   * state of all {@link TextTrack}s currently configured. The return array is compatible with
   * {@link text-track-list-converter:jsonToTextTracks}.
   *
   * @param {Tech} tech
   *        The tech object to query
   *
   * @return {Array}
   *         A serializable javascript representation of the {@link Tech}s
   *         {@link TextTrackList}.
   */


  var textTracksToJson = function textTracksToJson(tech) {
    var trackEls = tech.$$('track');
    var trackObjs = Array.prototype.map.call(trackEls, function (t) {
      return t.track;
    });
    var tracks = Array.prototype.map.call(trackEls, function (trackEl) {
      var json = trackToJson_(trackEl.track);

      if (trackEl.src) {
        json.src = trackEl.src;
      }

      return json;
    });
    return tracks.concat(Array.prototype.filter.call(tech.textTracks(), function (track) {
      return trackObjs.indexOf(track) === -1;
    }).map(trackToJson_));
  };
  /**
   * Create a set of remote {@link TextTrack}s on a {@link Tech} based on an array of javascript
   * object {@link TextTrack} representations.
   *
   * @param {Array} json
   *        An array of `TextTrack` representation objects, like those that would be
   *        produced by `textTracksToJson`.
   *
   * @param {Tech} tech
   *        The `Tech` to create the `TextTrack`s on.
   */


  var jsonToTextTracks = function jsonToTextTracks(json, tech) {
    json.forEach(function (track) {
      var addedTrack = tech.addRemoteTextTrack(track).track;

      if (!track.src && track.cues) {
        track.cues.forEach(function (cue) {
          return addedTrack.addCue(cue);
        });
      }
    });
    return tech.textTracks();
  };

  var textTrackConverter = {
    textTracksToJson: textTracksToJson,
    jsonToTextTracks: jsonToTextTracks,
    trackToJson_: trackToJson_
  };

  var keycode = createCommonjsModule(function (module, exports) {
    // Source: http://jsfiddle.net/vWx8V/
    // http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

    /**
     * Conenience method returns corresponding value for given keyName or keyCode.
     *
     * @param {Mixed} keyCode {Number} or keyName {String}
     * @return {Mixed}
     * @api public
     */
    function keyCode(searchInput) {
      // Keyboard Events
      if (searchInput && 'object' === typeof searchInput) {
        var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode;
        if (hasKeyCode) searchInput = hasKeyCode;
      } // Numbers


      if ('number' === typeof searchInput) return names[searchInput]; // Everything else (cast to string)

      var search = String(searchInput); // check codes

      var foundNamedKey = codes[search.toLowerCase()];
      if (foundNamedKey) return foundNamedKey; // check aliases

      var foundNamedKey = aliases[search.toLowerCase()];
      if (foundNamedKey) return foundNamedKey; // weird character?

      if (search.length === 1) return search.charCodeAt(0);
      return undefined;
    }
    /**
     * Compares a keyboard event with a given keyCode or keyName.
     *
     * @param {Event} event Keyboard event that should be tested
     * @param {Mixed} keyCode {Number} or keyName {String}
     * @return {Boolean}
     * @api public
     */


    keyCode.isEventKey = function isEventKey(event, nameOrCode) {
      if (event && 'object' === typeof event) {
        var keyCode = event.which || event.keyCode || event.charCode;

        if (keyCode === null || keyCode === undefined) {
          return false;
        }

        if (typeof nameOrCode === 'string') {
          // check codes
          var foundNamedKey = codes[nameOrCode.toLowerCase()];

          if (foundNamedKey) {
            return foundNamedKey === keyCode;
          } // check aliases


          var foundNamedKey = aliases[nameOrCode.toLowerCase()];

          if (foundNamedKey) {
            return foundNamedKey === keyCode;
          }
        } else if (typeof nameOrCode === 'number') {
          return nameOrCode === keyCode;
        }

        return false;
      }
    };

    exports = module.exports = keyCode;
    /**
     * Get by name
     *
     *   exports.code['enter'] // => 13
     */

    var codes = exports.code = exports.codes = {
      'backspace': 8,
      'tab': 9,
      'enter': 13,
      'shift': 16,
      'ctrl': 17,
      'alt': 18,
      'pause/break': 19,
      'caps lock': 20,
      'esc': 27,
      'space': 32,
      'page up': 33,
      'page down': 34,
      'end': 35,
      'home': 36,
      'left': 37,
      'up': 38,
      'right': 39,
      'down': 40,
      'insert': 45,
      'delete': 46,
      'command': 91,
      'left command': 91,
      'right command': 93,
      'numpad *': 106,
      'numpad +': 107,
      'numpad -': 109,
      'numpad .': 110,
      'numpad /': 111,
      'num lock': 144,
      'scroll lock': 145,
      'my computer': 182,
      'my calculator': 183,
      ';': 186,
      '=': 187,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      '`': 192,
      '[': 219,
      '\\': 220,
      ']': 221,
      "'": 222
    }; // Helper aliases

    var aliases = exports.aliases = {
      'windows': 91,
      '⇧': 16,
      '⌥': 18,
      '⌃': 17,
      '⌘': 91,
      'ctl': 17,
      'control': 17,
      'option': 18,
      'pause': 19,
      'break': 19,
      'caps': 20,
      'return': 13,
      'escape': 27,
      'spc': 32,
      'spacebar': 32,
      'pgup': 33,
      'pgdn': 34,
      'ins': 45,
      'del': 46,
      'cmd': 91
    };
    /*!
     * Programatically add the following
     */
    // lower case chars

    for (i = 97; i < 123; i++) {
      codes[String.fromCharCode(i)] = i - 32;
    } // numbers


    for (var i = 48; i < 58; i++) {
      codes[i - 48] = i;
    } // function keys


    for (i = 1; i < 13; i++) {
      codes['f' + i] = i + 111;
    } // numpad keys


    for (i = 0; i < 10; i++) {
      codes['numpad ' + i] = i + 96;
    }
    /**
     * Get by code
     *
     *   exports.name[13] // => 'Enter'
     */


    var names = exports.names = exports.title = {}; // title for backward compat
    // Create reverse mapping

    for (i in codes) {
      names[codes[i]] = i;
    } // Add aliases


    for (var alias in aliases) {
      codes[alias] = aliases[alias];
    }
  });
  var keycode_1 = keycode.code;
  var keycode_2 = keycode.codes;
  var keycode_3 = keycode.aliases;
  var keycode_4 = keycode.names;
  var keycode_5 = keycode.title;

  var MODAL_CLASS_NAME = 'vjs-modal-dialog';
  /**
   * The `ModalDialog` displays over the video and its controls, which blocks
   * interaction with the player until it is closed.
   *
   * Modal dialogs include a "Close" button and will close when that button
   * is activated - or when ESC is pressed anywhere.
   *
   * @extends Component
   */

  var ModalDialog = /*#__PURE__*/function (_Component) {
    inheritsLoose(ModalDialog, _Component);

    /**
     * Create an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Mixed} [options.content=undefined]
     *        Provide customized content for this modal.
     *
     * @param {string} [options.description]
     *        A text description for the modal, primarily for accessibility.
     *
     * @param {boolean} [options.fillAlways=false]
     *        Normally, modals are automatically filled only the first time
     *        they open. This tells the modal to refresh its content
     *        every time it opens.
     *
     * @param {string} [options.label]
     *        A text label for the modal, primarily for accessibility.
     *
     * @param {boolean} [options.pauseOnOpen=true]
     *        If `true`, playback will will be paused if playing when
     *        the modal opens, and resumed when it closes.
     *
     * @param {boolean} [options.temporary=true]
     *        If `true`, the modal can only be opened once; it will be
     *        disposed as soon as it's closed.
     *
     * @param {boolean} [options.uncloseable=false]
     *        If `true`, the user will not be able to close the modal
     *        through the UI in the normal ways. Programmatic closing is
     *        still possible.
     */
    function ModalDialog(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.opened_ = _this.hasBeenOpened_ = _this.hasBeenFilled_ = false;

      _this.closeable(!_this.options_.uncloseable);

      _this.content(_this.options_.content); // Make sure the contentEl is defined AFTER any children are initialized
      // because we only want the contents of the modal in the contentEl
      // (not the UI elements like the close button).


      _this.contentEl_ = createEl('div', {
        className: MODAL_CLASS_NAME + "-content"
      }, {
        role: 'document'
      });
      _this.descEl_ = createEl('p', {
        className: MODAL_CLASS_NAME + "-description vjs-control-text",
        id: _this.el().getAttribute('aria-describedby')
      });
      textContent(_this.descEl_, _this.description());

      _this.el_.appendChild(_this.descEl_);

      _this.el_.appendChild(_this.contentEl_);

      return _this;
    }
    /**
     * Create the `ModalDialog`'s DOM element
     *
     * @return {Element}
     *         The DOM element that gets created.
     */


    var _proto = ModalDialog.prototype;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: this.buildCSSClass(),
        tabIndex: -1
      }, {
        'aria-describedby': this.id() + "_description",
        'aria-hidden': 'true',
        'aria-label': this.label(),
        'role': 'dialog'
      });
    };

    _proto.dispose = function dispose() {
      this.contentEl_ = null;
      this.descEl_ = null;
      this.previouslyActiveEl_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      return MODAL_CLASS_NAME + " vjs-hidden " + _Component.prototype.buildCSSClass.call(this);
    }
    /**
     * Returns the label string for this modal. Primarily used for accessibility.
     *
     * @return {string}
     *         the localized or raw label of this modal.
     */
    ;

    _proto.label = function label() {
      return this.localize(this.options_.label || 'Modal Window');
    }
    /**
     * Returns the description string for this modal. Primarily used for
     * accessibility.
     *
     * @return {string}
     *         The localized or raw description of this modal.
     */
    ;

    _proto.description = function description() {
      var desc = this.options_.description || this.localize('This is a modal window.'); // Append a universal closeability message if the modal is closeable.

      if (this.closeable()) {
        desc += ' ' + this.localize('This modal can be closed by pressing the Escape key or activating the close button.');
      }

      return desc;
    }
    /**
     * Opens the modal.
     *
     * @fires ModalDialog#beforemodalopen
     * @fires ModalDialog#modalopen
     */
    ;

    _proto.open = function open() {
      if (!this.opened_) {
        var player = this.player();
        /**
          * Fired just before a `ModalDialog` is opened.
          *
          * @event ModalDialog#beforemodalopen
          * @type {EventTarget~Event}
          */

        this.trigger('beforemodalopen');
        this.opened_ = true; // Fill content if the modal has never opened before and
        // never been filled.

        if (this.options_.fillAlways || !this.hasBeenOpened_ && !this.hasBeenFilled_) {
          this.fill();
        } // If the player was playing, pause it and take note of its previously
        // playing state.


        this.wasPlaying_ = !player.paused();

        if (this.options_.pauseOnOpen && this.wasPlaying_) {
          player.pause();
        }

        this.on('keydown', this.handleKeyDown); // Hide controls and note if they were enabled.

        this.hadControls_ = player.controls();
        player.controls(false);
        this.show();
        this.conditionalFocus_();
        this.el().setAttribute('aria-hidden', 'false');
        /**
          * Fired just after a `ModalDialog` is opened.
          *
          * @event ModalDialog#modalopen
          * @type {EventTarget~Event}
          */

        this.trigger('modalopen');
        this.hasBeenOpened_ = true;
      }
    }
    /**
     * If the `ModalDialog` is currently open or closed.
     *
     * @param  {boolean} [value]
     *         If given, it will open (`true`) or close (`false`) the modal.
     *
     * @return {boolean}
     *         the current open state of the modaldialog
     */
    ;

    _proto.opened = function opened(value) {
      if (typeof value === 'boolean') {
        this[value ? 'open' : 'close']();
      }

      return this.opened_;
    }
    /**
     * Closes the modal, does nothing if the `ModalDialog` is
     * not open.
     *
     * @fires ModalDialog#beforemodalclose
     * @fires ModalDialog#modalclose
     */
    ;

    _proto.close = function close() {
      if (!this.opened_) {
        return;
      }

      var player = this.player();
      /**
        * Fired just before a `ModalDialog` is closed.
        *
        * @event ModalDialog#beforemodalclose
        * @type {EventTarget~Event}
        */

      this.trigger('beforemodalclose');
      this.opened_ = false;

      if (this.wasPlaying_ && this.options_.pauseOnOpen) {
        player.play();
      }

      this.off('keydown', this.handleKeyDown);

      if (this.hadControls_) {
        player.controls(true);
      }

      this.hide();
      this.el().setAttribute('aria-hidden', 'true');
      /**
        * Fired just after a `ModalDialog` is closed.
        *
        * @event ModalDialog#modalclose
        * @type {EventTarget~Event}
        */

      this.trigger('modalclose');
      this.conditionalBlur_();

      if (this.options_.temporary) {
        this.dispose();
      }
    }
    /**
     * Check to see if the `ModalDialog` is closeable via the UI.
     *
     * @param  {boolean} [value]
     *         If given as a boolean, it will set the `closeable` option.
     *
     * @return {boolean}
     *         Returns the final value of the closable option.
     */
    ;

    _proto.closeable = function closeable(value) {
      if (typeof value === 'boolean') {
        var closeable = this.closeable_ = !!value;
        var close = this.getChild('closeButton'); // If this is being made closeable and has no close button, add one.

        if (closeable && !close) {
          // The close button should be a child of the modal - not its
          // content element, so temporarily change the content element.
          var temp = this.contentEl_;
          this.contentEl_ = this.el_;
          close = this.addChild('closeButton', {
            controlText: 'Close Modal Dialog'
          });
          this.contentEl_ = temp;
          this.on(close, 'close', this.close);
        } // If this is being made uncloseable and has a close button, remove it.


        if (!closeable && close) {
          this.off(close, 'close', this.close);
          this.removeChild(close);
          close.dispose();
        }
      }

      return this.closeable_;
    }
    /**
     * Fill the modal's content element with the modal's "content" option.
     * The content element will be emptied before this change takes place.
     */
    ;

    _proto.fill = function fill() {
      this.fillWith(this.content());
    }
    /**
     * Fill the modal's content element with arbitrary content.
     * The content element will be emptied before this change takes place.
     *
     * @fires ModalDialog#beforemodalfill
     * @fires ModalDialog#modalfill
     *
     * @param {Mixed} [content]
     *        The same rules apply to this as apply to the `content` option.
     */
    ;

    _proto.fillWith = function fillWith(content) {
      var contentEl = this.contentEl();
      var parentEl = contentEl.parentNode;
      var nextSiblingEl = contentEl.nextSibling;
      /**
        * Fired just before a `ModalDialog` is filled with content.
        *
        * @event ModalDialog#beforemodalfill
        * @type {EventTarget~Event}
        */

      this.trigger('beforemodalfill');
      this.hasBeenFilled_ = true; // Detach the content element from the DOM before performing
      // manipulation to avoid modifying the live DOM multiple times.

      parentEl.removeChild(contentEl);
      this.empty();
      insertContent(contentEl, content);
      /**
       * Fired just after a `ModalDialog` is filled with content.
       *
       * @event ModalDialog#modalfill
       * @type {EventTarget~Event}
       */

      this.trigger('modalfill'); // Re-inject the re-filled content element.

      if (nextSiblingEl) {
        parentEl.insertBefore(contentEl, nextSiblingEl);
      } else {
        parentEl.appendChild(contentEl);
      } // make sure that the close button is last in the dialog DOM


      var closeButton = this.getChild('closeButton');

      if (closeButton) {
        parentEl.appendChild(closeButton.el_);
      }
    }
    /**
     * Empties the content element. This happens anytime the modal is filled.
     *
     * @fires ModalDialog#beforemodalempty
     * @fires ModalDialog#modalempty
     */
    ;

    _proto.empty = function empty() {
      /**
      * Fired just before a `ModalDialog` is emptied.
      *
      * @event ModalDialog#beforemodalempty
      * @type {EventTarget~Event}
      */
      this.trigger('beforemodalempty');
      emptyEl(this.contentEl());
      /**
      * Fired just after a `ModalDialog` is emptied.
      *
      * @event ModalDialog#modalempty
      * @type {EventTarget~Event}
      */

      this.trigger('modalempty');
    }
    /**
     * Gets or sets the modal content, which gets normalized before being
     * rendered into the DOM.
     *
     * This does not update the DOM or fill the modal, but it is called during
     * that process.
     *
     * @param  {Mixed} [value]
     *         If defined, sets the internal content value to be used on the
     *         next call(s) to `fill`. This value is normalized before being
     *         inserted. To "clear" the internal content value, pass `null`.
     *
     * @return {Mixed}
     *         The current content of the modal dialog
     */
    ;

    _proto.content = function content(value) {
      if (typeof value !== 'undefined') {
        this.content_ = value;
      }

      return this.content_;
    }
    /**
     * conditionally focus the modal dialog if focus was previously on the player.
     *
     * @private
     */
    ;

    _proto.conditionalFocus_ = function conditionalFocus_() {
      var activeEl = document.activeElement;
      var playerEl = this.player_.el_;
      this.previouslyActiveEl_ = null;

      if (playerEl.contains(activeEl) || playerEl === activeEl) {
        this.previouslyActiveEl_ = activeEl;
        this.focus();
      }
    }
    /**
     * conditionally blur the element and refocus the last focused element
     *
     * @private
     */
    ;

    _proto.conditionalBlur_ = function conditionalBlur_() {
      if (this.previouslyActiveEl_) {
        this.previouslyActiveEl_.focus();
        this.previouslyActiveEl_ = null;
      }
    }
    /**
     * Keydown handler. Attached when modal is focused.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Do not allow keydowns to reach out of the modal dialog.
      event.stopPropagation();

      if (keycode.isEventKey(event, 'Escape') && this.closeable()) {
        event.preventDefault();
        this.close();
        return;
      } // exit early if it isn't a tab key


      if (!keycode.isEventKey(event, 'Tab')) {
        return;
      }

      var focusableEls = this.focusableEls_();
      var activeEl = this.el_.querySelector(':focus');
      var focusIndex;

      for (var i = 0; i < focusableEls.length; i++) {
        if (activeEl === focusableEls[i]) {
          focusIndex = i;
          break;
        }
      }

      if (document.activeElement === this.el_) {
        focusIndex = 0;
      }

      if (event.shiftKey && focusIndex === 0) {
        focusableEls[focusableEls.length - 1].focus();
        event.preventDefault();
      } else if (!event.shiftKey && focusIndex === focusableEls.length - 1) {
        focusableEls[0].focus();
        event.preventDefault();
      }
    }
    /**
     * get all focusable elements
     *
     * @private
     */
    ;

    _proto.focusableEls_ = function focusableEls_() {
      var allChildren = this.el_.querySelectorAll('*');
      return Array.prototype.filter.call(allChildren, function (child) {
        return (child instanceof window$1.HTMLAnchorElement || child instanceof window$1.HTMLAreaElement) && child.hasAttribute('href') || (child instanceof window$1.HTMLInputElement || child instanceof window$1.HTMLSelectElement || child instanceof window$1.HTMLTextAreaElement || child instanceof window$1.HTMLButtonElement) && !child.hasAttribute('disabled') || child instanceof window$1.HTMLIFrameElement || child instanceof window$1.HTMLObjectElement || child instanceof window$1.HTMLEmbedElement || child.hasAttribute('tabindex') && child.getAttribute('tabindex') !== -1 || child.hasAttribute('contenteditable');
      });
    };

    return ModalDialog;
  }(Component);
  /**
   * Default options for `ModalDialog` default options.
   *
   * @type {Object}
   * @private
   */


  ModalDialog.prototype.options_ = {
    pauseOnOpen: true,
    temporary: true
  };
  Component.registerComponent('ModalDialog', ModalDialog);

  /**
   * Common functionaliy between {@link TextTrackList}, {@link AudioTrackList}, and
   * {@link VideoTrackList}
   *
   * @extends EventTarget
   */

  var TrackList = /*#__PURE__*/function (_EventTarget) {
    inheritsLoose(TrackList, _EventTarget);

    /**
     * Create an instance of this class
     *
     * @param {Track[]} tracks
     *        A list of tracks to initialize the list with.
     *
     * @abstract
     */
    function TrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      _this = _EventTarget.call(this) || this;
      _this.tracks_ = [];
      /**
       * @memberof TrackList
       * @member {number} length
       *         The current number of `Track`s in the this Trackist.
       * @instance
       */

      Object.defineProperty(assertThisInitialized(_this), 'length', {
        get: function get() {
          return this.tracks_.length;
        }
      });

      for (var i = 0; i < tracks.length; i++) {
        _this.addTrack(tracks[i]);
      }

      return _this;
    }
    /**
     * Add a {@link Track} to the `TrackList`
     *
     * @param {Track} track
     *        The audio, video, or text track to add to the list.
     *
     * @fires TrackList#addtrack
     */


    var _proto = TrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var index = this.tracks_.length;

      if (!('' + index in this)) {
        Object.defineProperty(this, index, {
          get: function get() {
            return this.tracks_[index];
          }
        });
      } // Do not add duplicate tracks


      if (this.tracks_.indexOf(track) === -1) {
        this.tracks_.push(track);
        /**
         * Triggered when a track is added to a track list.
         *
         * @event TrackList#addtrack
         * @type {EventTarget~Event}
         * @property {Track} track
         *           A reference to track that was added.
         */

        this.trigger({
          track: track,
          type: 'addtrack',
          target: this
        });
      }
    }
    /**
     * Remove a {@link Track} from the `TrackList`
     *
     * @param {Track} rtrack
     *        The audio, video, or text track to remove from the list.
     *
     * @fires TrackList#removetrack
     */
    ;

    _proto.removeTrack = function removeTrack(rtrack) {
      var track;

      for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] === rtrack) {
          track = this[i];

          if (track.off) {
            track.off();
          }

          this.tracks_.splice(i, 1);
          break;
        }
      }

      if (!track) {
        return;
      }
      /**
       * Triggered when a track is removed from track list.
       *
       * @event TrackList#removetrack
       * @type {EventTarget~Event}
       * @property {Track} track
       *           A reference to track that was removed.
       */


      this.trigger({
        track: track,
        type: 'removetrack',
        target: this
      });
    }
    /**
     * Get a Track from the TrackList by a tracks id
     *
     * @param {string} id - the id of the track to get
     * @method getTrackById
     * @return {Track}
     * @private
     */
    ;

    _proto.getTrackById = function getTrackById(id) {
      var result = null;

      for (var i = 0, l = this.length; i < l; i++) {
        var track = this[i];

        if (track.id === id) {
          result = track;
          break;
        }
      }

      return result;
    };

    return TrackList;
  }(EventTarget);
  /**
   * Triggered when a different track is selected/enabled.
   *
   * @event TrackList#change
   * @type {EventTarget~Event}
   */

  /**
   * Events that can be called with on + eventName. See {@link EventHandler}.
   *
   * @property {Object} TrackList#allowedEvents_
   * @private
   */


  TrackList.prototype.allowedEvents_ = {
    change: 'change',
    addtrack: 'addtrack',
    removetrack: 'removetrack'
  }; // emulate attribute EventHandler support to allow for feature detection

  for (var event in TrackList.prototype.allowedEvents_) {
    TrackList.prototype['on' + event] = null;
  }

  /**
   * Anywhere we call this function we diverge from the spec
   * as we only support one enabled audiotrack at a time
   *
   * @param {AudioTrackList} list
   *        list to work on
   *
   * @param {AudioTrack} track
   *        The track to skip
   *
   * @private
   */

  var disableOthers = function disableOthers(list, track) {
    for (var i = 0; i < list.length; i++) {
      if (!Object.keys(list[i]).length || track.id === list[i].id) {
        continue;
      } // another audio track is enabled, disable it


      list[i].enabled = false;
    }
  };
  /**
   * The current list of {@link AudioTrack} for a media file.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#audiotracklist}
   * @extends TrackList
   */


  var AudioTrackList = /*#__PURE__*/function (_TrackList) {
    inheritsLoose(AudioTrackList, _TrackList);

    /**
     * Create an instance of this class.
     *
     * @param {AudioTrack[]} [tracks=[]]
     *        A list of `AudioTrack` to instantiate the list with.
     */
    function AudioTrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      // make sure only 1 track is enabled
      // sorted from last index to first index
      for (var i = tracks.length - 1; i >= 0; i--) {
        if (tracks[i].enabled) {
          disableOthers(tracks, tracks[i]);
          break;
        }
      }

      _this = _TrackList.call(this, tracks) || this;
      _this.changing_ = false;
      return _this;
    }
    /**
     * Add an {@link AudioTrack} to the `AudioTrackList`.
     *
     * @param {AudioTrack} track
     *        The AudioTrack to add to the list
     *
     * @fires TrackList#addtrack
     */


    var _proto = AudioTrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var _this2 = this;

      if (track.enabled) {
        disableOthers(this, track);
      }

      _TrackList.prototype.addTrack.call(this, track); // native tracks don't have this


      if (!track.addEventListener) {
        return;
      }

      track.enabledChange_ = function () {
        // when we are disabling other tracks (since we don't support
        // more than one track at a time) we will set changing_
        // to true so that we don't trigger additional change events
        if (_this2.changing_) {
          return;
        }

        _this2.changing_ = true;
        disableOthers(_this2, track);
        _this2.changing_ = false;

        _this2.trigger('change');
      };
      /**
       * @listens AudioTrack#enabledchange
       * @fires TrackList#change
       */


      track.addEventListener('enabledchange', track.enabledChange_);
    };

    _proto.removeTrack = function removeTrack(rtrack) {
      _TrackList.prototype.removeTrack.call(this, rtrack);

      if (rtrack.removeEventListener && rtrack.enabledChange_) {
        rtrack.removeEventListener('enabledchange', rtrack.enabledChange_);
        rtrack.enabledChange_ = null;
      }
    };

    return AudioTrackList;
  }(TrackList);

  /**
   * Un-select all other {@link VideoTrack}s that are selected.
   *
   * @param {VideoTrackList} list
   *        list to work on
   *
   * @param {VideoTrack} track
   *        The track to skip
   *
   * @private
   */

  var disableOthers$1 = function disableOthers(list, track) {
    for (var i = 0; i < list.length; i++) {
      if (!Object.keys(list[i]).length || track.id === list[i].id) {
        continue;
      } // another video track is enabled, disable it


      list[i].selected = false;
    }
  };
  /**
   * The current list of {@link VideoTrack} for a video.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#videotracklist}
   * @extends TrackList
   */


  var VideoTrackList = /*#__PURE__*/function (_TrackList) {
    inheritsLoose(VideoTrackList, _TrackList);

    /**
     * Create an instance of this class.
     *
     * @param {VideoTrack[]} [tracks=[]]
     *        A list of `VideoTrack` to instantiate the list with.
     */
    function VideoTrackList(tracks) {
      var _this;

      if (tracks === void 0) {
        tracks = [];
      }

      // make sure only 1 track is enabled
      // sorted from last index to first index
      for (var i = tracks.length - 1; i >= 0; i--) {
        if (tracks[i].selected) {
          disableOthers$1(tracks, tracks[i]);
          break;
        }
      }

      _this = _TrackList.call(this, tracks) || this;
      _this.changing_ = false;
      /**
       * @member {number} VideoTrackList#selectedIndex
       *         The current index of the selected {@link VideoTrack`}.
       */

      Object.defineProperty(assertThisInitialized(_this), 'selectedIndex', {
        get: function get() {
          for (var _i = 0; _i < this.length; _i++) {
            if (this[_i].selected) {
              return _i;
            }
          }

          return -1;
        },
        set: function set() {}
      });
      return _this;
    }
    /**
     * Add a {@link VideoTrack} to the `VideoTrackList`.
     *
     * @param {VideoTrack} track
     *        The VideoTrack to add to the list
     *
     * @fires TrackList#addtrack
     */


    var _proto = VideoTrackList.prototype;

    _proto.addTrack = function addTrack(track) {
      var _this2 = this;

      if (track.selected) {
        disableOthers$1(this, track);
      }

      _TrackList.prototype.addTrack.call(this, track); // native tracks don't have this


      if (!track.addEventListener) {
        return;
      }

      track.selectedChange_ = function () {
        if (_this2.changing_) {
          return;
        }

        _this2.changing_ = true;
        disableOthers$1(_this2, track);
        _this2.changing_ = false;

        _this2.trigger('change');
      };
      /**
       * @listens VideoTrack#selectedchange
       * @fires TrackList#change
       */


      track.addEventListener('selectedchange', track.selectedChange_);
    };

    _proto.removeTrack = function removeTrack(rtrack) {
      _TrackList.prototype.removeTrack.call(this, rtrack);

      if (rtrack.removeEventListener && rtrack.selectedChange_) {
        rtrack.removeEventListener('selectedchange', rtrack.selectedChange_);
        rtrack.selectedChange_ = null;
      }
    };

    return VideoTrackList;
  }(TrackList);

  /**
   * The current list of {@link TextTrack} for a media file.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttracklist}
   * @extends TrackList
   */

  var TextTrackList = /*#__PURE__*/function (_TrackList) {
    inheritsLoose(TextTrackList, _TrackList);

    function TextTrackList() {
      return _TrackList.apply(this, arguments) || this;
    }

    var _proto = TextTrackList.prototype;

    /**
     * Add a {@link TextTrack} to the `TextTrackList`
     *
     * @param {TextTrack} track
     *        The text track to add to the list.
     *
     * @fires TrackList#addtrack
     */
    _proto.addTrack = function addTrack(track) {
      var _this = this;

      _TrackList.prototype.addTrack.call(this, track);

      if (!this.queueChange_) {
        this.queueChange_ = function () {
          return _this.queueTrigger('change');
        };
      }

      if (!this.triggerSelectedlanguagechange) {
        this.triggerSelectedlanguagechange_ = function () {
          return _this.trigger('selectedlanguagechange');
        };
      }
      /**
       * @listens TextTrack#modechange
       * @fires TrackList#change
       */


      track.addEventListener('modechange', this.queueChange_);
      var nonLanguageTextTrackKind = ['metadata', 'chapters'];

      if (nonLanguageTextTrackKind.indexOf(track.kind) === -1) {
        track.addEventListener('modechange', this.triggerSelectedlanguagechange_);
      }
    };

    _proto.removeTrack = function removeTrack(rtrack) {
      _TrackList.prototype.removeTrack.call(this, rtrack); // manually remove the event handlers we added


      if (rtrack.removeEventListener) {
        if (this.queueChange_) {
          rtrack.removeEventListener('modechange', this.queueChange_);
        }

        if (this.selectedlanguagechange_) {
          rtrack.removeEventListener('modechange', this.triggerSelectedlanguagechange_);
        }
      }
    };

    return TextTrackList;
  }(TrackList);

  /**
   * @file html-track-element-list.js
   */

  /**
   * The current list of {@link HtmlTrackElement}s.
   */
  var HtmlTrackElementList = /*#__PURE__*/function () {
    /**
     * Create an instance of this class.
     *
     * @param {HtmlTrackElement[]} [tracks=[]]
     *        A list of `HtmlTrackElement` to instantiate the list with.
     */
    function HtmlTrackElementList(trackElements) {
      if (trackElements === void 0) {
        trackElements = [];
      }

      this.trackElements_ = [];
      /**
       * @memberof HtmlTrackElementList
       * @member {number} length
       *         The current number of `Track`s in the this Trackist.
       * @instance
       */

      Object.defineProperty(this, 'length', {
        get: function get() {
          return this.trackElements_.length;
        }
      });

      for (var i = 0, length = trackElements.length; i < length; i++) {
        this.addTrackElement_(trackElements[i]);
      }
    }
    /**
     * Add an {@link HtmlTrackElement} to the `HtmlTrackElementList`
     *
     * @param {HtmlTrackElement} trackElement
     *        The track element to add to the list.
     *
     * @private
     */


    var _proto = HtmlTrackElementList.prototype;

    _proto.addTrackElement_ = function addTrackElement_(trackElement) {
      var index = this.trackElements_.length;

      if (!('' + index in this)) {
        Object.defineProperty(this, index, {
          get: function get() {
            return this.trackElements_[index];
          }
        });
      } // Do not add duplicate elements


      if (this.trackElements_.indexOf(trackElement) === -1) {
        this.trackElements_.push(trackElement);
      }
    }
    /**
     * Get an {@link HtmlTrackElement} from the `HtmlTrackElementList` given an
     * {@link TextTrack}.
     *
     * @param {TextTrack} track
     *        The track associated with a track element.
     *
     * @return {HtmlTrackElement|undefined}
     *         The track element that was found or undefined.
     *
     * @private
     */
    ;

    _proto.getTrackElementByTrack_ = function getTrackElementByTrack_(track) {
      var trackElement_;

      for (var i = 0, length = this.trackElements_.length; i < length; i++) {
        if (track === this.trackElements_[i].track) {
          trackElement_ = this.trackElements_[i];
          break;
        }
      }

      return trackElement_;
    }
    /**
     * Remove a {@link HtmlTrackElement} from the `HtmlTrackElementList`
     *
     * @param {HtmlTrackElement} trackElement
     *        The track element to remove from the list.
     *
     * @private
     */
    ;

    _proto.removeTrackElement_ = function removeTrackElement_(trackElement) {
      for (var i = 0, length = this.trackElements_.length; i < length; i++) {
        if (trackElement === this.trackElements_[i]) {
          if (this.trackElements_[i].track && typeof this.trackElements_[i].track.off === 'function') {
            this.trackElements_[i].track.off();
          }

          if (typeof this.trackElements_[i].off === 'function') {
            this.trackElements_[i].off();
          }

          this.trackElements_.splice(i, 1);
          break;
        }
      }
    };

    return HtmlTrackElementList;
  }();

  /**
   * @file text-track-cue-list.js
   */

  /**
   * @typedef {Object} TextTrackCueList~TextTrackCue
   *
   * @property {string} id
   *           The unique id for this text track cue
   *
   * @property {number} startTime
   *           The start time for this text track cue
   *
   * @property {number} endTime
   *           The end time for this text track cue
   *
   * @property {boolean} pauseOnExit
   *           Pause when the end time is reached if true.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackcue}
   */

  /**
   * A List of TextTrackCues.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackcuelist}
   */
  var TextTrackCueList = /*#__PURE__*/function () {
    /**
     * Create an instance of this class..
     *
     * @param {Array} cues
     *        A list of cues to be initialized with
     */
    function TextTrackCueList(cues) {
      TextTrackCueList.prototype.setCues_.call(this, cues);
      /**
       * @memberof TextTrackCueList
       * @member {number} length
       *         The current number of `TextTrackCue`s in the TextTrackCueList.
       * @instance
       */

      Object.defineProperty(this, 'length', {
        get: function get() {
          return this.length_;
        }
      });
    }
    /**
     * A setter for cues in this list. Creates getters
     * an an index for the cues.
     *
     * @param {Array} cues
     *        An array of cues to set
     *
     * @private
     */


    var _proto = TextTrackCueList.prototype;

    _proto.setCues_ = function setCues_(cues) {
      var oldLength = this.length || 0;
      var i = 0;
      var l = cues.length;
      this.cues_ = cues;
      this.length_ = cues.length;

      var defineProp = function defineProp(index) {
        if (!('' + index in this)) {
          Object.defineProperty(this, '' + index, {
            get: function get() {
              return this.cues_[index];
            }
          });
        }
      };

      if (oldLength < l) {
        i = oldLength;

        for (; i < l; i++) {
          defineProp.call(this, i);
        }
      }
    }
    /**
     * Get a `TextTrackCue` that is currently in the `TextTrackCueList` by id.
     *
     * @param {string} id
     *        The id of the cue that should be searched for.
     *
     * @return {TextTrackCueList~TextTrackCue|null}
     *         A single cue or null if none was found.
     */
    ;

    _proto.getCueById = function getCueById(id) {
      var result = null;

      for (var i = 0, l = this.length; i < l; i++) {
        var cue = this[i];

        if (cue.id === id) {
          result = cue;
          break;
        }
      }

      return result;
    };

    return TextTrackCueList;
  }();

  /**
   * @file track-kinds.js
   */

  /**
   * All possible `VideoTrackKind`s
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-videotrack-kind
   * @typedef VideoTrack~Kind
   * @enum
   */
  var VideoTrackKind = {
    alternative: 'alternative',
    captions: 'captions',
    main: 'main',
    sign: 'sign',
    subtitles: 'subtitles',
    commentary: 'commentary'
  };
  /**
   * All possible `AudioTrackKind`s
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-audiotrack-kind
   * @typedef AudioTrack~Kind
   * @enum
   */

  var AudioTrackKind = {
    'alternative': 'alternative',
    'descriptions': 'descriptions',
    'main': 'main',
    'main-desc': 'main-desc',
    'translation': 'translation',
    'commentary': 'commentary'
  };
  /**
   * All possible `TextTrackKind`s
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#dom-texttrack-kind
   * @typedef TextTrack~Kind
   * @enum
   */

  var TextTrackKind = {
    subtitles: 'subtitles',
    captions: 'captions',
    descriptions: 'descriptions',
    chapters: 'chapters',
    metadata: 'metadata'
  };
  /**
   * All possible `TextTrackMode`s
   *
   * @see https://html.spec.whatwg.org/multipage/embedded-content.html#texttrackmode
   * @typedef TextTrack~Mode
   * @enum
   */

  var TextTrackMode = {
    disabled: 'disabled',
    hidden: 'hidden',
    showing: 'showing'
  };

  /**
   * A Track class that contains all of the common functionality for {@link AudioTrack},
   * {@link VideoTrack}, and {@link TextTrack}.
   *
   * > Note: This class should not be used directly
   *
   * @see {@link https://html.spec.whatwg.org/multipage/embedded-content.html}
   * @extends EventTarget
   * @abstract
   */

  var Track = /*#__PURE__*/function (_EventTarget) {
    inheritsLoose(Track, _EventTarget);

    /**
     * Create an instance of this class.
     *
     * @param {Object} [options={}]
     *        Object of option names and values
     *
     * @param {string} [options.kind='']
     *        A valid kind for the track type you are creating.
     *
     * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
     *        A unique id for this AudioTrack.
     *
     * @param {string} [options.label='']
     *        The menu label for this track.
     *
     * @param {string} [options.language='']
     *        A valid two character language code.
     *
     * @abstract
     */
    function Track(options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _EventTarget.call(this) || this;
      var trackProps = {
        id: options.id || 'vjs_track_' + newGUID(),
        kind: options.kind || '',
        label: options.label || '',
        language: options.language || ''
      };
      /**
       * @memberof Track
       * @member {string} id
       *         The id of this track. Cannot be changed after creation.
       * @instance
       *
       * @readonly
       */

      /**
       * @memberof Track
       * @member {string} kind
       *         The kind of track that this is. Cannot be changed after creation.
       * @instance
       *
       * @readonly
       */

      /**
       * @memberof Track
       * @member {string} label
       *         The label of this track. Cannot be changed after creation.
       * @instance
       *
       * @readonly
       */

      /**
       * @memberof Track
       * @member {string} language
       *         The two letter language code for this track. Cannot be changed after
       *         creation.
       * @instance
       *
       * @readonly
       */

      var _loop = function _loop(key) {
        Object.defineProperty(assertThisInitialized(_this), key, {
          get: function get() {
            return trackProps[key];
          },
          set: function set() {}
        });
      };

      for (var key in trackProps) {
        _loop(key);
      }

      return _this;
    }

    return Track;
  }(EventTarget);

  /**
   * @file url.js
   * @module url
   */
  /**
   * @typedef {Object} url:URLObject
   *
   * @property {string} protocol
   *           The protocol of the url that was parsed.
   *
   * @property {string} hostname
   *           The hostname of the url that was parsed.
   *
   * @property {string} port
   *           The port of the url that was parsed.
   *
   * @property {string} pathname
   *           The pathname of the url that was parsed.
   *
   * @property {string} search
   *           The search query of the url that was parsed.
   *
   * @property {string} hash
   *           The hash of the url that was parsed.
   *
   * @property {string} host
   *           The host of the url that was parsed.
   */

  /**
   * Resolve and parse the elements of a URL.
   *
   * @function
   * @param    {String} url
   *           The url to parse
   *
   * @return   {url:URLObject}
   *           An object of url details
   */

  var parseUrl = function parseUrl(url) {
    var props = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host']; // add the url to an anchor and let the browser parse the URL

    var a = document.createElement('a');
    a.href = url; // IE8 (and 9?) Fix
    // ie8 doesn't parse the URL correctly until the anchor is actually
    // added to the body, and an innerHTML is needed to trigger the parsing

    var addToBody = a.host === '' && a.protocol !== 'file:';
    var div;

    if (addToBody) {
      div = document.createElement('div');
      div.innerHTML = "<a href=\"" + url + "\"></a>";
      a = div.firstChild; // prevent the div from affecting layout

      div.setAttribute('style', 'display:none; position:absolute;');
      document.body.appendChild(div);
    } // Copy the specific URL properties to a new object
    // This is also needed for IE8 because the anchor loses its
    // properties when it's removed from the dom


    var details = {};

    for (var i = 0; i < props.length; i++) {
      details[props[i]] = a[props[i]];
    } // IE9 adds the port to the host property unlike everyone else. If
    // a port identifier is added for standard ports, strip it.


    if (details.protocol === 'http:') {
      details.host = details.host.replace(/:80$/, '');
    }

    if (details.protocol === 'https:') {
      details.host = details.host.replace(/:443$/, '');
    }

    if (!details.protocol) {
      details.protocol = window$1.location.protocol;
    }

    if (addToBody) {
      document.body.removeChild(div);
    }

    return details;
  };
  /**
   * Get absolute version of relative URL. Used to tell Flash the correct URL.
   *
   * @function
   * @param    {string} url
   *           URL to make absolute
   *
   * @return   {string}
   *           Absolute URL
   *
   * @see      http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
   */

  var getAbsoluteURL = function getAbsoluteURL(url) {
    // Check if absolute URL
    if (!url.match(/^https?:\/\//)) {
      // Convert to absolute URL. Flash hosted off-site needs an absolute URL.
      var div = document.createElement('div');
      div.innerHTML = "<a href=\"" + url + "\">x</a>";
      url = div.firstChild.href;
    }

    return url;
  };
  /**
   * Returns the extension of the passed file name. It will return an empty string
   * if passed an invalid path.
   *
   * @function
   * @param    {string} path
   *           The fileName path like '/path/to/file.mp4'
   *
   * @return  {string}
   *           The extension in lower case or an empty string if no
   *           extension could be found.
   */

  var getFileExtension = function getFileExtension(path) {
    if (typeof path === 'string') {
      var splitPathRe = /^(\/?)([\s\S]*?)((?:\.{1,2}|[^\/]+?)(\.([^\.\/\?]+)))(?:[\/]*|[\?].*)$/;
      var pathParts = splitPathRe.exec(path);

      if (pathParts) {
        return pathParts.pop().toLowerCase();
      }
    }

    return '';
  };
  /**
   * Returns whether the url passed is a cross domain request or not.
   *
   * @function
   * @param    {string} url
   *           The url to check.
   *
   * @param    {Object} [winLoc]
   *           the domain to check the url against, defaults to window.location
   *
   * @param    {string} [winLoc.protocol]
   *           The window location protocol defaults to window.location.protocol
   *
   * @param    {string} [winLoc.host]
   *           The window location host defaults to window.location.host
   *
   * @return   {boolean}
   *           Whether it is a cross domain request or not.
   */

  var isCrossOrigin = function isCrossOrigin(url, winLoc) {
    if (winLoc === void 0) {
      winLoc = window$1.location;
    }

    var urlInfo = parseUrl(url); // IE8 protocol relative urls will return ':' for protocol

    var srcProtocol = urlInfo.protocol === ':' ? winLoc.protocol : urlInfo.protocol; // Check if url is for another domain/origin
    // IE8 doesn't know location.origin, so we won't rely on it here

    var crossOrigin = srcProtocol + urlInfo.host !== winLoc.protocol + winLoc.host;
    return crossOrigin;
  };

  var Url = /*#__PURE__*/Object.freeze({
    __proto__: null,
    parseUrl: parseUrl,
    getAbsoluteURL: getAbsoluteURL,
    getFileExtension: getFileExtension,
    isCrossOrigin: isCrossOrigin
  });

  var isFunction_1 = isFunction;
  var toString$1 = Object.prototype.toString;

  function isFunction(fn) {
    var string = toString$1.call(fn);
    return string === '[object Function]' || typeof fn === 'function' && string !== '[object RegExp]' || typeof window !== 'undefined' && ( // IE8 and below
    fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt);
  }

  /**
   * @license
   * slighly modified parse-headers 2.0.2 <https://github.com/kesla/parse-headers/>
   * Copyright (c) 2014 David Björklund
   * Available under the MIT license
   * <https://github.com/kesla/parse-headers/blob/master/LICENCE>
   */


  var parseHeaders = function parseHeaders(headers) {
    var result = {};

    if (!headers) {
      return result;
    }

    headers.trim().split('\n').forEach(function (row) {
      var index = row.indexOf(':');
      var key = row.slice(0, index).trim().toLowerCase();
      var value = row.slice(index + 1).trim();

      if (typeof result[key] === 'undefined') {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    });
    return result;
  };

  var xhr = createXHR; // Allow use of default import syntax in TypeScript

  var default_1 = createXHR;
  createXHR.XMLHttpRequest = window$1.XMLHttpRequest || noop;
  createXHR.XDomainRequest = "withCredentials" in new createXHR.XMLHttpRequest() ? createXHR.XMLHttpRequest : window$1.XDomainRequest;
  forEachArray(["get", "put", "post", "patch", "head", "delete"], function (method) {
    createXHR[method === "delete" ? "del" : method] = function (uri, options, callback) {
      options = initParams(uri, options, callback);
      options.method = method.toUpperCase();
      return _createXHR(options);
    };
  });

  function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
      iterator(array[i]);
    }
  }

  function isEmpty(obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) return false;
    }

    return true;
  }

  function initParams(uri, options, callback) {
    var params = uri;

    if (isFunction_1(options)) {
      callback = options;

      if (typeof uri === "string") {
        params = {
          uri: uri
        };
      }
    } else {
      params = _extends_1({}, options, {
        uri: uri
      });
    }

    params.callback = callback;
    return params;
  }

  function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback);
    return _createXHR(options);
  }

  function _createXHR(options) {
    if (typeof options.callback === "undefined") {
      throw new Error("callback argument missing");
    }

    var called = false;

    var callback = function cbOnce(err, response, body) {
      if (!called) {
        called = true;
        options.callback(err, response, body);
      }
    };

    function readystatechange() {
      if (xhr.readyState === 4) {
        setTimeout(loadFunc, 0);
      }
    }

    function getBody() {
      // Chrome with requestType=blob throws errors arround when even testing access to responseText
      var body = undefined;

      if (xhr.response) {
        body = xhr.response;
      } else {
        body = xhr.responseText || getXml(xhr);
      }

      if (isJson) {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }

      return body;
    }

    function errorFunc(evt) {
      clearTimeout(timeoutTimer);

      if (!(evt instanceof Error)) {
        evt = new Error("" + (evt || "Unknown XMLHttpRequest Error"));
      }

      evt.statusCode = 0;
      return callback(evt, failureResponse);
    } // will load the data & process the response in a special response object


    function loadFunc() {
      if (aborted) return;
      var status;
      clearTimeout(timeoutTimer);

      if (options.useXDR && xhr.status === undefined) {
        //IE8 CORS GET successful response doesn't have a status field, but body is fine
        status = 200;
      } else {
        status = xhr.status === 1223 ? 204 : xhr.status;
      }

      var response = failureResponse;
      var err = null;

      if (status !== 0) {
        response = {
          body: getBody(),
          statusCode: status,
          method: method,
          headers: {},
          url: uri,
          rawRequest: xhr
        };

        if (xhr.getAllResponseHeaders) {
          //remember xhr can in fact be XDR for CORS in IE
          response.headers = parseHeaders(xhr.getAllResponseHeaders());
        }
      } else {
        err = new Error("Internal XMLHttpRequest Error");
      }

      return callback(err, response, response.body);
    }

    var xhr = options.xhr || null;

    if (!xhr) {
      if (options.cors || options.useXDR) {
        xhr = new createXHR.XDomainRequest();
      } else {
        xhr = new createXHR.XMLHttpRequest();
      }
    }

    var key;
    var aborted;
    var uri = xhr.url = options.uri || options.url;
    var method = xhr.method = options.method || "GET";
    var body = options.body || options.data;
    var headers = xhr.headers = options.headers || {};
    var sync = !!options.sync;
    var isJson = false;
    var timeoutTimer;
    var failureResponse = {
      body: undefined,
      headers: {},
      statusCode: 0,
      method: method,
      url: uri,
      rawRequest: xhr
    };

    if ("json" in options && options.json !== false) {
      isJson = true;
      headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json"); //Don't override existing accept header declared by user

      if (method !== "GET" && method !== "HEAD") {
        headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json"); //Don't override existing accept header declared by user

        body = JSON.stringify(options.json === true ? body : options.json);
      }
    }

    xhr.onreadystatechange = readystatechange;
    xhr.onload = loadFunc;
    xhr.onerror = errorFunc; // IE9 must have onprogress be set to a unique function.

    xhr.onprogress = function () {// IE must die
    };

    xhr.onabort = function () {
      aborted = true;
    };

    xhr.ontimeout = errorFunc;
    xhr.open(method, uri, !sync, options.username, options.password); //has to be after open

    if (!sync) {
      xhr.withCredentials = !!options.withCredentials;
    } // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent


    if (!sync && options.timeout > 0) {
      timeoutTimer = setTimeout(function () {
        if (aborted) return;
        aborted = true; //IE9 may still call readystatechange

        xhr.abort("timeout");
        var e = new Error("XMLHttpRequest timeout");
        e.code = "ETIMEDOUT";
        errorFunc(e);
      }, options.timeout);
    }

    if (xhr.setRequestHeader) {
      for (key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
    } else if (options.headers && !isEmpty(options.headers)) {
      throw new Error("Headers cannot be set on an XDomainRequest object");
    }

    if ("responseType" in options) {
      xhr.responseType = options.responseType;
    }

    if ("beforeSend" in options && typeof options.beforeSend === "function") {
      options.beforeSend(xhr);
    } // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.


    xhr.send(body || null);
    return xhr;
  }

  function getXml(xhr) {
    // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
    // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
    try {
      if (xhr.responseType === "document") {
        return xhr.responseXML;
      }

      var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";

      if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML;
      }
    } catch (e) {}

    return null;
  }

  function noop() {}
  xhr["default"] = default_1;

  /**
   * Takes a webvtt file contents and parses it into cues
   *
   * @param {string} srcContent
   *        webVTT file contents
   *
   * @param {TextTrack} track
   *        TextTrack to add cues to. Cues come from the srcContent.
   *
   * @private
   */

  var parseCues = function parseCues(srcContent, track) {
    var parser = new window$1.WebVTT.Parser(window$1, window$1.vttjs, window$1.WebVTT.StringDecoder());
    var errors = [];

    parser.oncue = function (cue) {
      track.addCue(cue);
    };

    parser.onparsingerror = function (error) {
      errors.push(error);
    };

    parser.onflush = function () {
      track.trigger({
        type: 'loadeddata',
        target: track
      });
    };

    parser.parse(srcContent);

    if (errors.length > 0) {
      if (window$1.console && window$1.console.groupCollapsed) {
        window$1.console.groupCollapsed("Text Track parsing errors for " + track.src);
      }

      errors.forEach(function (error) {
        return log.error(error);
      });

      if (window$1.console && window$1.console.groupEnd) {
        window$1.console.groupEnd();
      }
    }

    parser.flush();
  };
  /**
   * Load a `TextTrack` from a specified url.
   *
   * @param {string} src
   *        Url to load track from.
   *
   * @param {TextTrack} track
   *        Track to add cues to. Comes from the content at the end of `url`.
   *
   * @private
   */


  var loadTrack = function loadTrack(src, track) {
    var opts = {
      uri: src
    };
    var crossOrigin = isCrossOrigin(src);

    if (crossOrigin) {
      opts.cors = crossOrigin;
    }

    var withCredentials = track.tech_.crossOrigin() === 'use-credentials';

    if (withCredentials) {
      opts.withCredentials = withCredentials;
    }

    xhr(opts, bind(this, function (err, response, responseBody) {
      if (err) {
        return log.error(err, response);
      }

      track.loaded_ = true; // Make sure that vttjs has loaded, otherwise, wait till it finished loading
      // NOTE: this is only used for the alt/video.novtt.js build

      if (typeof window$1.WebVTT !== 'function') {
        if (track.tech_) {
          // to prevent use before define eslint error, we define loadHandler
          // as a let here
          track.tech_.any(['vttjsloaded', 'vttjserror'], function (event) {
            if (event.type === 'vttjserror') {
              log.error("vttjs failed to load, stopping trying to process " + track.src);
              return;
            }

            return parseCues(responseBody, track);
          });
        }
      } else {
        parseCues(responseBody, track);
      }
    }));
  };
  /**
   * A representation of a single `TextTrack`.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#texttrack}
   * @extends Track
   */


  var TextTrack = /*#__PURE__*/function (_Track) {
    inheritsLoose(TextTrack, _Track);

    /**
     * Create an instance of this class.
     *
     * @param {Object} options={}
     *        Object of option names and values
     *
     * @param {Tech} options.tech
     *        A reference to the tech that owns this TextTrack.
     *
     * @param {TextTrack~Kind} [options.kind='subtitles']
     *        A valid text track kind.
     *
     * @param {TextTrack~Mode} [options.mode='disabled']
     *        A valid text track mode.
     *
     * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
     *        A unique id for this TextTrack.
     *
     * @param {string} [options.label='']
     *        The menu label for this track.
     *
     * @param {string} [options.language='']
     *        A valid two character language code.
     *
     * @param {string} [options.srclang='']
     *        A valid two character language code. An alternative, but deprioritized
     *        version of `options.language`
     *
     * @param {string} [options.src]
     *        A url to TextTrack cues.
     *
     * @param {boolean} [options.default]
     *        If this track should default to on or off.
     */
    function TextTrack(options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      if (!options.tech) {
        throw new Error('A tech was not provided.');
      }

      var settings = mergeOptions(options, {
        kind: TextTrackKind[options.kind] || 'subtitles',
        language: options.language || options.srclang || ''
      });
      var mode = TextTrackMode[settings.mode] || 'disabled';
      var default_ = settings["default"];

      if (settings.kind === 'metadata' || settings.kind === 'chapters') {
        mode = 'hidden';
      }

      _this = _Track.call(this, settings) || this;
      _this.tech_ = settings.tech;
      _this.cues_ = [];
      _this.activeCues_ = [];
      _this.preload_ = _this.tech_.preloadTextTracks !== false;
      var cues = new TextTrackCueList(_this.cues_);
      var activeCues = new TextTrackCueList(_this.activeCues_);
      var changed = false;
      var timeupdateHandler = bind(assertThisInitialized(_this), function () {
        // Accessing this.activeCues for the side-effects of updating itself
        // due to its nature as a getter function. Do not remove or cues will
        // stop updating!
        // Use the setter to prevent deletion from uglify (pure_getters rule)
        this.activeCues = this.activeCues;

        if (changed) {
          this.trigger('cuechange');
          changed = false;
        }
      });

      if (mode !== 'disabled') {
        _this.tech_.ready(function () {
          _this.tech_.on('timeupdate', timeupdateHandler);
        }, true);
      }

      Object.defineProperties(assertThisInitialized(_this), {
        /**
         * @memberof TextTrack
         * @member {boolean} default
         *         If this track was set to be on or off by default. Cannot be changed after
         *         creation.
         * @instance
         *
         * @readonly
         */
        "default": {
          get: function get() {
            return default_;
          },
          set: function set() {}
        },

        /**
         * @memberof TextTrack
         * @member {string} mode
         *         Set the mode of this TextTrack to a valid {@link TextTrack~Mode}. Will
         *         not be set if setting to an invalid mode.
         * @instance
         *
         * @fires TextTrack#modechange
         */
        mode: {
          get: function get() {
            return mode;
          },
          set: function set(newMode) {
            var _this2 = this;

            if (!TextTrackMode[newMode]) {
              return;
            }

            mode = newMode;

            if (!this.preload_ && mode !== 'disabled' && this.cues.length === 0) {
              // On-demand load.
              loadTrack(this.src, this);
            }

            if (mode !== 'disabled') {
              this.tech_.ready(function () {
                _this2.tech_.on('timeupdate', timeupdateHandler);
              }, true);
            } else {
              this.tech_.off('timeupdate', timeupdateHandler);
            }
            /**
             * An event that fires when mode changes on this track. This allows
             * the TextTrackList that holds this track to act accordingly.
             *
             * > Note: This is not part of the spec!
             *
             * @event TextTrack#modechange
             * @type {EventTarget~Event}
             */


            this.trigger('modechange');
          }
        },

        /**
         * @memberof TextTrack
         * @member {TextTrackCueList} cues
         *         The text track cue list for this TextTrack.
         * @instance
         */
        cues: {
          get: function get() {
            if (!this.loaded_) {
              return null;
            }

            return cues;
          },
          set: function set() {}
        },

        /**
         * @memberof TextTrack
         * @member {TextTrackCueList} activeCues
         *         The list text track cues that are currently active for this TextTrack.
         * @instance
         */
        activeCues: {
          get: function get() {
            if (!this.loaded_) {
              return null;
            } // nothing to do


            if (this.cues.length === 0) {
              return activeCues;
            }

            var ct = this.tech_.currentTime();
            var active = [];

            for (var i = 0, l = this.cues.length; i < l; i++) {
              var cue = this.cues[i];

              if (cue.startTime <= ct && cue.endTime >= ct) {
                active.push(cue);
              } else if (cue.startTime === cue.endTime && cue.startTime <= ct && cue.startTime + 0.5 >= ct) {
                active.push(cue);
              }
            }

            changed = false;

            if (active.length !== this.activeCues_.length) {
              changed = true;
            } else {
              for (var _i = 0; _i < active.length; _i++) {
                if (this.activeCues_.indexOf(active[_i]) === -1) {
                  changed = true;
                }
              }
            }

            this.activeCues_ = active;
            activeCues.setCues_(this.activeCues_);
            return activeCues;
          },
          // /!\ Keep this setter empty (see the timeupdate handler above)
          set: function set() {}
        }
      });

      if (settings.src) {
        _this.src = settings.src;

        if (!_this.preload_) {
          // Tracks will load on-demand.
          // Act like we're loaded for other purposes.
          _this.loaded_ = true;
        }

        if (_this.preload_ || default_ || settings.kind !== 'subtitles' && settings.kind !== 'captions') {
          loadTrack(_this.src, assertThisInitialized(_this));
        }
      } else {
        _this.loaded_ = true;
      }

      return _this;
    }
    /**
     * Add a cue to the internal list of cues.
     *
     * @param {TextTrack~Cue} cue
     *        The cue to add to our internal list
     */


    var _proto = TextTrack.prototype;

    _proto.addCue = function addCue(originalCue) {
      var cue = originalCue;

      if (window$1.vttjs && !(originalCue instanceof window$1.vttjs.VTTCue)) {
        cue = new window$1.vttjs.VTTCue(originalCue.startTime, originalCue.endTime, originalCue.text);

        for (var prop in originalCue) {
          if (!(prop in cue)) {
            cue[prop] = originalCue[prop];
          }
        } // make sure that `id` is copied over


        cue.id = originalCue.id;
        cue.originalCue_ = originalCue;
      }

      var tracks = this.tech_.textTracks();

      for (var i = 0; i < tracks.length; i++) {
        if (tracks[i] !== this) {
          tracks[i].removeCue(cue);
        }
      }

      this.cues_.push(cue);
      this.cues.setCues_(this.cues_);
    }
    /**
     * Remove a cue from our internal list
     *
     * @param {TextTrack~Cue} removeCue
     *        The cue to remove from our internal list
     */
    ;

    _proto.removeCue = function removeCue(_removeCue) {
      var i = this.cues_.length;

      while (i--) {
        var cue = this.cues_[i];

        if (cue === _removeCue || cue.originalCue_ && cue.originalCue_ === _removeCue) {
          this.cues_.splice(i, 1);
          this.cues.setCues_(this.cues_);
          break;
        }
      }
    };

    return TextTrack;
  }(Track);
  /**
   * cuechange - One or more cues in the track have become active or stopped being active.
   */


  TextTrack.prototype.allowedEvents_ = {
    cuechange: 'cuechange'
  };

  /**
   * A representation of a single `AudioTrack`. If it is part of an {@link AudioTrackList}
   * only one `AudioTrack` in the list will be enabled at a time.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#audiotrack}
   * @extends Track
   */

  var AudioTrack = /*#__PURE__*/function (_Track) {
    inheritsLoose(AudioTrack, _Track);

    /**
     * Create an instance of this class.
     *
     * @param {Object} [options={}]
     *        Object of option names and values
     *
     * @param {AudioTrack~Kind} [options.kind='']
     *        A valid audio track kind
     *
     * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
     *        A unique id for this AudioTrack.
     *
     * @param {string} [options.label='']
     *        The menu label for this track.
     *
     * @param {string} [options.language='']
     *        A valid two character language code.
     *
     * @param {boolean} [options.enabled]
     *        If this track is the one that is currently playing. If this track is part of
     *        an {@link AudioTrackList}, only one {@link AudioTrack} will be enabled.
     */
    function AudioTrack(options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      var settings = mergeOptions(options, {
        kind: AudioTrackKind[options.kind] || ''
      });
      _this = _Track.call(this, settings) || this;
      var enabled = false;
      /**
       * @memberof AudioTrack
       * @member {boolean} enabled
       *         If this `AudioTrack` is enabled or not. When setting this will
       *         fire {@link AudioTrack#enabledchange} if the state of enabled is changed.
       * @instance
       *
       * @fires VideoTrack#selectedchange
       */

      Object.defineProperty(assertThisInitialized(_this), 'enabled', {
        get: function get() {
          return enabled;
        },
        set: function set(newEnabled) {
          // an invalid or unchanged value
          if (typeof newEnabled !== 'boolean' || newEnabled === enabled) {
            return;
          }

          enabled = newEnabled;
          /**
           * An event that fires when enabled changes on this track. This allows
           * the AudioTrackList that holds this track to act accordingly.
           *
           * > Note: This is not part of the spec! Native tracks will do
           *         this internally without an event.
           *
           * @event AudioTrack#enabledchange
           * @type {EventTarget~Event}
           */

          this.trigger('enabledchange');
        }
      }); // if the user sets this track to selected then
      // set selected to that true value otherwise
      // we keep it false

      if (settings.enabled) {
        _this.enabled = settings.enabled;
      }

      _this.loaded_ = true;
      return _this;
    }

    return AudioTrack;
  }(Track);

  /**
   * A representation of a single `VideoTrack`.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#videotrack}
   * @extends Track
   */

  var VideoTrack = /*#__PURE__*/function (_Track) {
    inheritsLoose(VideoTrack, _Track);

    /**
     * Create an instance of this class.
     *
     * @param {Object} [options={}]
     *        Object of option names and values
     *
     * @param {string} [options.kind='']
     *        A valid {@link VideoTrack~Kind}
     *
     * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
     *        A unique id for this AudioTrack.
     *
     * @param {string} [options.label='']
     *        The menu label for this track.
     *
     * @param {string} [options.language='']
     *        A valid two character language code.
     *
     * @param {boolean} [options.selected]
     *        If this track is the one that is currently playing.
     */
    function VideoTrack(options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      var settings = mergeOptions(options, {
        kind: VideoTrackKind[options.kind] || ''
      });
      _this = _Track.call(this, settings) || this;
      var selected = false;
      /**
       * @memberof VideoTrack
       * @member {boolean} selected
       *         If this `VideoTrack` is selected or not. When setting this will
       *         fire {@link VideoTrack#selectedchange} if the state of selected changed.
       * @instance
       *
       * @fires VideoTrack#selectedchange
       */

      Object.defineProperty(assertThisInitialized(_this), 'selected', {
        get: function get() {
          return selected;
        },
        set: function set(newSelected) {
          // an invalid or unchanged value
          if (typeof newSelected !== 'boolean' || newSelected === selected) {
            return;
          }

          selected = newSelected;
          /**
           * An event that fires when selected changes on this track. This allows
           * the VideoTrackList that holds this track to act accordingly.
           *
           * > Note: This is not part of the spec! Native tracks will do
           *         this internally without an event.
           *
           * @event VideoTrack#selectedchange
           * @type {EventTarget~Event}
           */

          this.trigger('selectedchange');
        }
      }); // if the user sets this track to selected then
      // set selected to that true value otherwise
      // we keep it false

      if (settings.selected) {
        _this.selected = settings.selected;
      }

      return _this;
    }

    return VideoTrack;
  }(Track);

  /**
   * @memberof HTMLTrackElement
   * @typedef {HTMLTrackElement~ReadyState}
   * @enum {number}
   */

  var NONE = 0;
  var LOADING = 1;
  var LOADED = 2;
  var ERROR = 3;
  /**
   * A single track represented in the DOM.
   *
   * @see [Spec]{@link https://html.spec.whatwg.org/multipage/embedded-content.html#htmltrackelement}
   * @extends EventTarget
   */

  var HTMLTrackElement = /*#__PURE__*/function (_EventTarget) {
    inheritsLoose(HTMLTrackElement, _EventTarget);

    /**
     * Create an instance of this class.
     *
     * @param {Object} options={}
     *        Object of option names and values
     *
     * @param {Tech} options.tech
     *        A reference to the tech that owns this HTMLTrackElement.
     *
     * @param {TextTrack~Kind} [options.kind='subtitles']
     *        A valid text track kind.
     *
     * @param {TextTrack~Mode} [options.mode='disabled']
     *        A valid text track mode.
     *
     * @param {string} [options.id='vjs_track_' + Guid.newGUID()]
     *        A unique id for this TextTrack.
     *
     * @param {string} [options.label='']
     *        The menu label for this track.
     *
     * @param {string} [options.language='']
     *        A valid two character language code.
     *
     * @param {string} [options.srclang='']
     *        A valid two character language code. An alternative, but deprioritized
     *        vesion of `options.language`
     *
     * @param {string} [options.src]
     *        A url to TextTrack cues.
     *
     * @param {boolean} [options.default]
     *        If this track should default to on or off.
     */
    function HTMLTrackElement(options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _EventTarget.call(this) || this;
      var readyState;
      var track = new TextTrack(options);
      _this.kind = track.kind;
      _this.src = track.src;
      _this.srclang = track.language;
      _this.label = track.label;
      _this["default"] = track["default"];
      Object.defineProperties(assertThisInitialized(_this), {
        /**
         * @memberof HTMLTrackElement
         * @member {HTMLTrackElement~ReadyState} readyState
         *         The current ready state of the track element.
         * @instance
         */
        readyState: {
          get: function get() {
            return readyState;
          }
        },

        /**
         * @memberof HTMLTrackElement
         * @member {TextTrack} track
         *         The underlying TextTrack object.
         * @instance
         *
         */
        track: {
          get: function get() {
            return track;
          }
        }
      });
      readyState = NONE;
      /**
       * @listens TextTrack#loadeddata
       * @fires HTMLTrackElement#load
       */

      track.addEventListener('loadeddata', function () {
        readyState = LOADED;

        _this.trigger({
          type: 'load',
          target: assertThisInitialized(_this)
        });
      });
      return _this;
    }

    return HTMLTrackElement;
  }(EventTarget);

  HTMLTrackElement.prototype.allowedEvents_ = {
    load: 'load'
  };
  HTMLTrackElement.NONE = NONE;
  HTMLTrackElement.LOADING = LOADING;
  HTMLTrackElement.LOADED = LOADED;
  HTMLTrackElement.ERROR = ERROR;

  /*
   * This file contains all track properties that are used in
   * player.js, tech.js, html5.js and possibly other techs in the future.
   */

  var NORMAL = {
    audio: {
      ListClass: AudioTrackList,
      TrackClass: AudioTrack,
      capitalName: 'Audio'
    },
    video: {
      ListClass: VideoTrackList,
      TrackClass: VideoTrack,
      capitalName: 'Video'
    },
    text: {
      ListClass: TextTrackList,
      TrackClass: TextTrack,
      capitalName: 'Text'
    }
  };
  Object.keys(NORMAL).forEach(function (type) {
    NORMAL[type].getterName = type + "Tracks";
    NORMAL[type].privateName = type + "Tracks_";
  });
  var REMOTE = {
    remoteText: {
      ListClass: TextTrackList,
      TrackClass: TextTrack,
      capitalName: 'RemoteText',
      getterName: 'remoteTextTracks',
      privateName: 'remoteTextTracks_'
    },
    remoteTextEl: {
      ListClass: HtmlTrackElementList,
      TrackClass: HTMLTrackElement,
      capitalName: 'RemoteTextTrackEls',
      getterName: 'remoteTextTrackEls',
      privateName: 'remoteTextTrackEls_'
    }
  };

  var ALL = _extends_1({}, NORMAL, REMOTE);

  REMOTE.names = Object.keys(REMOTE);
  NORMAL.names = Object.keys(NORMAL);
  ALL.names = [].concat(REMOTE.names).concat(NORMAL.names);

  /**
   * Copyright 2013 vtt.js Contributors
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

  /* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

  var _objCreate = Object.create || function () {
    function F() {}

    return function (o) {
      if (arguments.length !== 1) {
        throw new Error('Object.create shim only accepts one parameter.');
      }

      F.prototype = o;
      return new F();
    };
  }(); // Creates a new ParserError object from an errorData object. The errorData
  // object should have default code and message properties. The default message
  // property can be overriden by passing in a message parameter.
  // See ParsingError.Errors below for acceptable errors.


  function ParsingError(errorData, message) {
    this.name = "ParsingError";
    this.code = errorData.code;
    this.message = message || errorData.message;
  }

  ParsingError.prototype = _objCreate(Error.prototype);
  ParsingError.prototype.constructor = ParsingError; // ParsingError metadata for acceptable ParsingErrors.

  ParsingError.Errors = {
    BadSignature: {
      code: 0,
      message: "Malformed WebVTT signature."
    },
    BadTimeStamp: {
      code: 1,
      message: "Malformed time stamp."
    }
  }; // Try to parse input as a time stamp.

  function parseTimeStamp(input) {
    function computeSeconds(h, m, s, f) {
      return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
    }

    var m = input.match(/^(\d+):(\d{1,2})(:\d{1,2})?\.(\d{3})/);

    if (!m) {
      return null;
    }

    if (m[3]) {
      // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
      return computeSeconds(m[1], m[2], m[3].replace(":", ""), m[4]);
    } else if (m[1] > 59) {
      // Timestamp takes the form of [hours]:[minutes].[milliseconds]
      // First position is hours as it's over 59.
      return computeSeconds(m[1], m[2], 0, m[4]);
    } else {
      // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
      return computeSeconds(0, m[1], m[2], m[4]);
    }
  } // A settings object holds key/value pairs and will ignore anything but the first
  // assignment to a specific key.


  function Settings() {
    this.values = _objCreate(null);
  }

  Settings.prototype = {
    // Only accept the first assignment to any key.
    set: function set(k, v) {
      if (!this.get(k) && v !== "") {
        this.values[k] = v;
      }
    },
    // Return the value for a key, or a default value.
    // If 'defaultKey' is passed then 'dflt' is assumed to be an object with
    // a number of possible default values as properties where 'defaultKey' is
    // the key of the property that will be chosen; otherwise it's assumed to be
    // a single value.
    get: function get(k, dflt, defaultKey) {
      if (defaultKey) {
        return this.has(k) ? this.values[k] : dflt[defaultKey];
      }

      return this.has(k) ? this.values[k] : dflt;
    },
    // Check whether we have a value for a key.
    has: function has(k) {
      return k in this.values;
    },
    // Accept a setting if its one of the given alternatives.
    alt: function alt(k, v, a) {
      for (var n = 0; n < a.length; ++n) {
        if (v === a[n]) {
          this.set(k, v);
          break;
        }
      }
    },
    // Accept a setting if its a valid (signed) integer.
    integer: function integer(k, v) {
      if (/^-?\d+$/.test(v)) {
        // integer
        this.set(k, parseInt(v, 10));
      }
    },
    // Accept a setting if its a valid percentage.
    percent: function percent(k, v) {
      var m;

      if (m = v.match(/^([\d]{1,3})(\.[\d]*)?%$/)) {
        v = parseFloat(v);

        if (v >= 0 && v <= 100) {
          this.set(k, v);
          return true;
        }
      }

      return false;
    }
  }; // Helper function to parse input into groups separated by 'groupDelim', and
  // interprete each group as a key/value pair separated by 'keyValueDelim'.

  function parseOptions(input, callback, keyValueDelim, groupDelim) {
    var groups = groupDelim ? input.split(groupDelim) : [input];

    for (var i in groups) {
      if (typeof groups[i] !== "string") {
        continue;
      }

      var kv = groups[i].split(keyValueDelim);

      if (kv.length !== 2) {
        continue;
      }

      var k = kv[0];
      var v = kv[1];
      callback(k, v);
    }
  }

  function parseCue(input, cue, regionList) {
    // Remember the original input if we need to throw an error.
    var oInput = input; // 4.1 WebVTT timestamp

    function consumeTimeStamp() {
      var ts = parseTimeStamp(input);

      if (ts === null) {
        throw new ParsingError(ParsingError.Errors.BadTimeStamp, "Malformed timestamp: " + oInput);
      } // Remove time stamp from input.


      input = input.replace(/^[^\sa-zA-Z-]+/, "");
      return ts;
    } // 4.4.2 WebVTT cue settings


    function consumeCueSettings(input, cue) {
      var settings = new Settings();
      parseOptions(input, function (k, v) {
        switch (k) {
          case "region":
            // Find the last region we parsed with the same region id.
            for (var i = regionList.length - 1; i >= 0; i--) {
              if (regionList[i].id === v) {
                settings.set(k, regionList[i].region);
                break;
              }
            }

            break;

          case "vertical":
            settings.alt(k, v, ["rl", "lr"]);
            break;

          case "line":
            var vals = v.split(","),
                vals0 = vals[0];
            settings.integer(k, vals0);
            settings.percent(k, vals0) ? settings.set("snapToLines", false) : null;
            settings.alt(k, vals0, ["auto"]);

            if (vals.length === 2) {
              settings.alt("lineAlign", vals[1], ["start", "center", "end"]);
            }

            break;

          case "position":
            vals = v.split(",");
            settings.percent(k, vals[0]);

            if (vals.length === 2) {
              settings.alt("positionAlign", vals[1], ["start", "center", "end"]);
            }

            break;

          case "size":
            settings.percent(k, v);
            break;

          case "align":
            settings.alt(k, v, ["start", "center", "end", "left", "right"]);
            break;
        }
      }, /:/, /\s/); // Apply default values for any missing fields.

      cue.region = settings.get("region", null);
      cue.vertical = settings.get("vertical", "");

      try {
        cue.line = settings.get("line", "auto");
      } catch (e) {}

      cue.lineAlign = settings.get("lineAlign", "start");
      cue.snapToLines = settings.get("snapToLines", true);
      cue.size = settings.get("size", 100); // Safari still uses the old middle value and won't accept center

      try {
        cue.align = settings.get("align", "center");
      } catch (e) {
        cue.align = settings.get("align", "middle");
      }

      try {
        cue.position = settings.get("position", "auto");
      } catch (e) {
        cue.position = settings.get("position", {
          start: 0,
          left: 0,
          center: 50,
          middle: 50,
          end: 100,
          right: 100
        }, cue.align);
      }

      cue.positionAlign = settings.get("positionAlign", {
        start: "start",
        left: "start",
        center: "center",
        middle: "center",
        end: "end",
        right: "end"
      }, cue.align);
    }

    function skipWhitespace() {
      input = input.replace(/^\s+/, "");
    } // 4.1 WebVTT cue timings.


    skipWhitespace();
    cue.startTime = consumeTimeStamp(); // (1) collect cue start time

    skipWhitespace();

    if (input.substr(0, 3) !== "-->") {
      // (3) next characters must match "-->"
      throw new ParsingError(ParsingError.Errors.BadTimeStamp, "Malformed time stamp (time stamps must be separated by '-->'): " + oInput);
    }

    input = input.substr(3);
    skipWhitespace();
    cue.endTime = consumeTimeStamp(); // (5) collect cue end time
    // 4.1 WebVTT cue settings list.

    skipWhitespace();
    consumeCueSettings(input, cue);
  }

  var TEXTAREA_ELEMENT = document.createElement("textarea");
  var TAG_NAME = {
    c: "span",
    i: "i",
    b: "b",
    u: "u",
    ruby: "ruby",
    rt: "rt",
    v: "span",
    lang: "span"
  }; // 5.1 default text color
  // 5.2 default text background color is equivalent to text color with bg_ prefix

  var DEFAULT_COLOR_CLASS = {
    white: 'rgba(255,255,255,1)',
    lime: 'rgba(0,255,0,1)',
    cyan: 'rgba(0,255,255,1)',
    red: 'rgba(255,0,0,1)',
    yellow: 'rgba(255,255,0,1)',
    magenta: 'rgba(255,0,255,1)',
    blue: 'rgba(0,0,255,1)',
    black: 'rgba(0,0,0,1)'
  };
  var TAG_ANNOTATION = {
    v: "title",
    lang: "lang"
  };
  var NEEDS_PARENT = {
    rt: "ruby"
  }; // Parse content into a document fragment.

  function parseContent(window, input) {
    function nextToken() {
      // Check for end-of-string.
      if (!input) {
        return null;
      } // Consume 'n' characters from the input.


      function consume(result) {
        input = input.substr(result.length);
        return result;
      }

      var m = input.match(/^([^<]*)(<[^>]*>?)?/); // If there is some text before the next tag, return it, otherwise return
      // the tag.

      return consume(m[1] ? m[1] : m[2]);
    }

    function unescape(s) {
      TEXTAREA_ELEMENT.innerHTML = s;
      s = TEXTAREA_ELEMENT.textContent;
      TEXTAREA_ELEMENT.textContent = "";
      return s;
    }

    function shouldAdd(current, element) {
      return !NEEDS_PARENT[element.localName] || NEEDS_PARENT[element.localName] === current.localName;
    } // Create an element for this tag.


    function createElement(type, annotation) {
      var tagName = TAG_NAME[type];

      if (!tagName) {
        return null;
      }

      var element = window.document.createElement(tagName);
      var name = TAG_ANNOTATION[type];

      if (name && annotation) {
        element[name] = annotation.trim();
      }

      return element;
    }

    var rootDiv = window.document.createElement("div"),
        current = rootDiv,
        t,
        tagStack = [];

    while ((t = nextToken()) !== null) {
      if (t[0] === '<') {
        if (t[1] === "/") {
          // If the closing tag matches, move back up to the parent node.
          if (tagStack.length && tagStack[tagStack.length - 1] === t.substr(2).replace(">", "")) {
            tagStack.pop();
            current = current.parentNode;
          } // Otherwise just ignore the end tag.


          continue;
        }

        var ts = parseTimeStamp(t.substr(1, t.length - 2));
        var node;

        if (ts) {
          // Timestamps are lead nodes as well.
          node = window.document.createProcessingInstruction("timestamp", ts);
          current.appendChild(node);
          continue;
        }

        var m = t.match(/^<([^.\s/0-9>]+)(\.[^\s\\>]+)?([^>\\]+)?(\\?)>?$/); // If we can't parse the tag, skip to the next tag.

        if (!m) {
          continue;
        } // Try to construct an element, and ignore the tag if we couldn't.


        node = createElement(m[1], m[3]);

        if (!node) {
          continue;
        } // Determine if the tag should be added based on the context of where it
        // is placed in the cuetext.


        if (!shouldAdd(current, node)) {
          continue;
        } // Set the class list (as a list of classes, separated by space).


        if (m[2]) {
          var classes = m[2].split('.');
          classes.forEach(function (cl) {
            var bgColor = /^bg_/.test(cl); // slice out `bg_` if it's a background color

            var colorName = bgColor ? cl.slice(3) : cl;

            if (DEFAULT_COLOR_CLASS.hasOwnProperty(colorName)) {
              var propName = bgColor ? 'background-color' : 'color';
              var propValue = DEFAULT_COLOR_CLASS[colorName];
              node.style[propName] = propValue;
            }
          });
          node.className = classes.join(' ');
        } // Append the node to the current node, and enter the scope of the new
        // node.


        tagStack.push(m[1]);
        current.appendChild(node);
        current = node;
        continue;
      } // Text nodes are leaf nodes.


      current.appendChild(window.document.createTextNode(unescape(t)));
    }

    return rootDiv;
  } // This is a list of all the Unicode characters that have a strong
  // right-to-left category. What this means is that these characters are
  // written right-to-left for sure. It was generated by pulling all the strong
  // right-to-left characters out of the Unicode data table. That table can
  // found at: http://www.unicode.org/Public/UNIDATA/UnicodeData.txt


  var strongRTLRanges = [[0x5be, 0x5be], [0x5c0, 0x5c0], [0x5c3, 0x5c3], [0x5c6, 0x5c6], [0x5d0, 0x5ea], [0x5f0, 0x5f4], [0x608, 0x608], [0x60b, 0x60b], [0x60d, 0x60d], [0x61b, 0x61b], [0x61e, 0x64a], [0x66d, 0x66f], [0x671, 0x6d5], [0x6e5, 0x6e6], [0x6ee, 0x6ef], [0x6fa, 0x70d], [0x70f, 0x710], [0x712, 0x72f], [0x74d, 0x7a5], [0x7b1, 0x7b1], [0x7c0, 0x7ea], [0x7f4, 0x7f5], [0x7fa, 0x7fa], [0x800, 0x815], [0x81a, 0x81a], [0x824, 0x824], [0x828, 0x828], [0x830, 0x83e], [0x840, 0x858], [0x85e, 0x85e], [0x8a0, 0x8a0], [0x8a2, 0x8ac], [0x200f, 0x200f], [0xfb1d, 0xfb1d], [0xfb1f, 0xfb28], [0xfb2a, 0xfb36], [0xfb38, 0xfb3c], [0xfb3e, 0xfb3e], [0xfb40, 0xfb41], [0xfb43, 0xfb44], [0xfb46, 0xfbc1], [0xfbd3, 0xfd3d], [0xfd50, 0xfd8f], [0xfd92, 0xfdc7], [0xfdf0, 0xfdfc], [0xfe70, 0xfe74], [0xfe76, 0xfefc], [0x10800, 0x10805], [0x10808, 0x10808], [0x1080a, 0x10835], [0x10837, 0x10838], [0x1083c, 0x1083c], [0x1083f, 0x10855], [0x10857, 0x1085f], [0x10900, 0x1091b], [0x10920, 0x10939], [0x1093f, 0x1093f], [0x10980, 0x109b7], [0x109be, 0x109bf], [0x10a00, 0x10a00], [0x10a10, 0x10a13], [0x10a15, 0x10a17], [0x10a19, 0x10a33], [0x10a40, 0x10a47], [0x10a50, 0x10a58], [0x10a60, 0x10a7f], [0x10b00, 0x10b35], [0x10b40, 0x10b55], [0x10b58, 0x10b72], [0x10b78, 0x10b7f], [0x10c00, 0x10c48], [0x1ee00, 0x1ee03], [0x1ee05, 0x1ee1f], [0x1ee21, 0x1ee22], [0x1ee24, 0x1ee24], [0x1ee27, 0x1ee27], [0x1ee29, 0x1ee32], [0x1ee34, 0x1ee37], [0x1ee39, 0x1ee39], [0x1ee3b, 0x1ee3b], [0x1ee42, 0x1ee42], [0x1ee47, 0x1ee47], [0x1ee49, 0x1ee49], [0x1ee4b, 0x1ee4b], [0x1ee4d, 0x1ee4f], [0x1ee51, 0x1ee52], [0x1ee54, 0x1ee54], [0x1ee57, 0x1ee57], [0x1ee59, 0x1ee59], [0x1ee5b, 0x1ee5b], [0x1ee5d, 0x1ee5d], [0x1ee5f, 0x1ee5f], [0x1ee61, 0x1ee62], [0x1ee64, 0x1ee64], [0x1ee67, 0x1ee6a], [0x1ee6c, 0x1ee72], [0x1ee74, 0x1ee77], [0x1ee79, 0x1ee7c], [0x1ee7e, 0x1ee7e], [0x1ee80, 0x1ee89], [0x1ee8b, 0x1ee9b], [0x1eea1, 0x1eea3], [0x1eea5, 0x1eea9], [0x1eeab, 0x1eebb], [0x10fffd, 0x10fffd]];

  function isStrongRTLChar(charCode) {
    for (var i = 0; i < strongRTLRanges.length; i++) {
      var currentRange = strongRTLRanges[i];

      if (charCode >= currentRange[0] && charCode <= currentRange[1]) {
        return true;
      }
    }

    return false;
  }

  function determineBidi(cueDiv) {
    var nodeStack = [],
        text = "",
        charCode;

    if (!cueDiv || !cueDiv.childNodes) {
      return "ltr";
    }

    function pushNodes(nodeStack, node) {
      for (var i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }

    function nextTextNode(nodeStack) {
      if (!nodeStack || !nodeStack.length) {
        return null;
      }

      var node = nodeStack.pop(),
          text = node.textContent || node.innerText;

      if (text) {
        // TODO: This should match all unicode type B characters (paragraph
        // separator characters). See issue #115.
        var m = text.match(/^.*(\n|\r)/);

        if (m) {
          nodeStack.length = 0;
          return m[0];
        }

        return text;
      }

      if (node.tagName === "ruby") {
        return nextTextNode(nodeStack);
      }

      if (node.childNodes) {
        pushNodes(nodeStack, node);
        return nextTextNode(nodeStack);
      }
    }

    pushNodes(nodeStack, cueDiv);

    while (text = nextTextNode(nodeStack)) {
      for (var i = 0; i < text.length; i++) {
        charCode = text.charCodeAt(i);

        if (isStrongRTLChar(charCode)) {
          return "rtl";
        }
      }
    }

    return "ltr";
  }

  function computeLinePos(cue) {
    if (typeof cue.line === "number" && (cue.snapToLines || cue.line >= 0 && cue.line <= 100)) {
      return cue.line;
    }

    if (!cue.track || !cue.track.textTrackList || !cue.track.textTrackList.mediaElement) {
      return -1;
    }

    var track = cue.track,
        trackList = track.textTrackList,
        count = 0;

    for (var i = 0; i < trackList.length && trackList[i] !== track; i++) {
      if (trackList[i].mode === "showing") {
        count++;
      }
    }

    return ++count * -1;
  }

  function StyleBox() {} // Apply styles to a div. If there is no div passed then it defaults to the
  // div on 'this'.


  StyleBox.prototype.applyStyles = function (styles, div) {
    div = div || this.div;

    for (var prop in styles) {
      if (styles.hasOwnProperty(prop)) {
        div.style[prop] = styles[prop];
      }
    }
  };

  StyleBox.prototype.formatStyle = function (val, unit) {
    return val === 0 ? 0 : val + unit;
  }; // Constructs the computed display state of the cue (a div). Places the div
  // into the overlay which should be a block level element (usually a div).


  function CueStyleBox(window, cue, styleOptions) {
    StyleBox.call(this);
    this.cue = cue; // Parse our cue's text into a DOM tree rooted at 'cueDiv'. This div will
    // have inline positioning and will function as the cue background box.

    this.cueDiv = parseContent(window, cue.text);
    var styles = {
      color: "rgba(255, 255, 255, 1)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      position: "relative",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: "inline",
      writingMode: cue.vertical === "" ? "horizontal-tb" : cue.vertical === "lr" ? "vertical-lr" : "vertical-rl",
      unicodeBidi: "plaintext"
    };
    this.applyStyles(styles, this.cueDiv); // Create an absolutely positioned div that will be used to position the cue
    // div. Note, all WebVTT cue-setting alignments are equivalent to the CSS
    // mirrors of them except middle instead of center on Safari.

    this.div = window.document.createElement("div");
    styles = {
      direction: determineBidi(this.cueDiv),
      writingMode: cue.vertical === "" ? "horizontal-tb" : cue.vertical === "lr" ? "vertical-lr" : "vertical-rl",
      unicodeBidi: "plaintext",
      textAlign: cue.align === "middle" ? "center" : cue.align,
      font: styleOptions.font,
      whiteSpace: "pre-line",
      position: "absolute"
    };
    this.applyStyles(styles);
    this.div.appendChild(this.cueDiv); // Calculate the distance from the reference edge of the viewport to the text
    // position of the cue box. The reference edge will be resolved later when
    // the box orientation styles are applied.

    var textPos = 0;

    switch (cue.positionAlign) {
      case "start":
        textPos = cue.position;
        break;

      case "center":
        textPos = cue.position - cue.size / 2;
        break;

      case "end":
        textPos = cue.position - cue.size;
        break;
    } // Horizontal box orientation; textPos is the distance from the left edge of the
    // area to the left edge of the box and cue.size is the distance extending to
    // the right from there.


    if (cue.vertical === "") {
      this.applyStyles({
        left: this.formatStyle(textPos, "%"),
        width: this.formatStyle(cue.size, "%")
      }); // Vertical box orientation; textPos is the distance from the top edge of the
      // area to the top edge of the box and cue.size is the height extending
      // downwards from there.
    } else {
      this.applyStyles({
        top: this.formatStyle(textPos, "%"),
        height: this.formatStyle(cue.size, "%")
      });
    }

    this.move = function (box) {
      this.applyStyles({
        top: this.formatStyle(box.top, "px"),
        bottom: this.formatStyle(box.bottom, "px"),
        left: this.formatStyle(box.left, "px"),
        right: this.formatStyle(box.right, "px"),
        height: this.formatStyle(box.height, "px"),
        width: this.formatStyle(box.width, "px")
      });
    };
  }

  CueStyleBox.prototype = _objCreate(StyleBox.prototype);
  CueStyleBox.prototype.constructor = CueStyleBox; // Represents the co-ordinates of an Element in a way that we can easily
  // compute things with such as if it overlaps or intersects with another Element.
  // Can initialize it with either a StyleBox or another BoxPosition.

  function BoxPosition(obj) {
    // Either a BoxPosition was passed in and we need to copy it, or a StyleBox
    // was passed in and we need to copy the results of 'getBoundingClientRect'
    // as the object returned is readonly. All co-ordinate values are in reference
    // to the viewport origin (top left).
    var lh, height, width, top;

    if (obj.div) {
      height = obj.div.offsetHeight;
      width = obj.div.offsetWidth;
      top = obj.div.offsetTop;
      var rects = (rects = obj.div.childNodes) && (rects = rects[0]) && rects.getClientRects && rects.getClientRects();
      obj = obj.div.getBoundingClientRect(); // In certain cases the outter div will be slightly larger then the sum of
      // the inner div's lines. This could be due to bold text, etc, on some platforms.
      // In this case we should get the average line height and use that. This will
      // result in the desired behaviour.

      lh = rects ? Math.max(rects[0] && rects[0].height || 0, obj.height / rects.length) : 0;
    }

    this.left = obj.left;
    this.right = obj.right;
    this.top = obj.top || top;
    this.height = obj.height || height;
    this.bottom = obj.bottom || top + (obj.height || height);
    this.width = obj.width || width;
    this.lineHeight = lh !== undefined ? lh : obj.lineHeight;
  } // Move the box along a particular axis. Optionally pass in an amount to move
  // the box. If no amount is passed then the default is the line height of the
  // box.


  BoxPosition.prototype.move = function (axis, toMove) {
    toMove = toMove !== undefined ? toMove : this.lineHeight;

    switch (axis) {
      case "+x":
        this.left += toMove;
        this.right += toMove;
        break;

      case "-x":
        this.left -= toMove;
        this.right -= toMove;
        break;

      case "+y":
        this.top += toMove;
        this.bottom += toMove;
        break;

      case "-y":
        this.top -= toMove;
        this.bottom -= toMove;
        break;
    }
  }; // Check if this box overlaps another box, b2.


  BoxPosition.prototype.overlaps = function (b2) {
    return this.left < b2.right && this.right > b2.left && this.top < b2.bottom && this.bottom > b2.top;
  }; // Check if this box overlaps any other boxes in boxes.


  BoxPosition.prototype.overlapsAny = function (boxes) {
    for (var i = 0; i < boxes.length; i++) {
      if (this.overlaps(boxes[i])) {
        return true;
      }
    }

    return false;
  }; // Check if this box is within another box.


  BoxPosition.prototype.within = function (container) {
    return this.top >= container.top && this.bottom <= container.bottom && this.left >= container.left && this.right <= container.right;
  }; // Check if this box is entirely within the container or it is overlapping
  // on the edge opposite of the axis direction passed. For example, if "+x" is
  // passed and the box is overlapping on the left edge of the container, then
  // return true.


  BoxPosition.prototype.overlapsOppositeAxis = function (container, axis) {
    switch (axis) {
      case "+x":
        return this.left < container.left;

      case "-x":
        return this.right > container.right;

      case "+y":
        return this.top < container.top;

      case "-y":
        return this.bottom > container.bottom;
    }
  }; // Find the percentage of the area that this box is overlapping with another
  // box.


  BoxPosition.prototype.intersectPercentage = function (b2) {
    var x = Math.max(0, Math.min(this.right, b2.right) - Math.max(this.left, b2.left)),
        y = Math.max(0, Math.min(this.bottom, b2.bottom) - Math.max(this.top, b2.top)),
        intersectArea = x * y;
    return intersectArea / (this.height * this.width);
  }; // Convert the positions from this box to CSS compatible positions using
  // the reference container's positions. This has to be done because this
  // box's positions are in reference to the viewport origin, whereas, CSS
  // values are in referecne to their respective edges.


  BoxPosition.prototype.toCSSCompatValues = function (reference) {
    return {
      top: this.top - reference.top,
      bottom: reference.bottom - this.bottom,
      left: this.left - reference.left,
      right: reference.right - this.right,
      height: this.height,
      width: this.width
    };
  }; // Get an object that represents the box's position without anything extra.
  // Can pass a StyleBox, HTMLElement, or another BoxPositon.


  BoxPosition.getSimpleBoxPosition = function (obj) {
    var height = obj.div ? obj.div.offsetHeight : obj.tagName ? obj.offsetHeight : 0;
    var width = obj.div ? obj.div.offsetWidth : obj.tagName ? obj.offsetWidth : 0;
    var top = obj.div ? obj.div.offsetTop : obj.tagName ? obj.offsetTop : 0;
    obj = obj.div ? obj.div.getBoundingClientRect() : obj.tagName ? obj.getBoundingClientRect() : obj;
    var ret = {
      left: obj.left,
      right: obj.right,
      top: obj.top || top,
      height: obj.height || height,
      bottom: obj.bottom || top + (obj.height || height),
      width: obj.width || width
    };
    return ret;
  }; // Move a StyleBox to its specified, or next best, position. The containerBox
  // is the box that contains the StyleBox, such as a div. boxPositions are
  // a list of other boxes that the styleBox can't overlap with.


  function moveBoxToLinePosition(window, styleBox, containerBox, boxPositions) {
    // Find the best position for a cue box, b, on the video. The axis parameter
    // is a list of axis, the order of which, it will move the box along. For example:
    // Passing ["+x", "-x"] will move the box first along the x axis in the positive
    // direction. If it doesn't find a good position for it there it will then move
    // it along the x axis in the negative direction.
    function findBestPosition(b, axis) {
      var bestPosition,
          specifiedPosition = new BoxPosition(b),
          percentage = 1; // Highest possible so the first thing we get is better.

      for (var i = 0; i < axis.length; i++) {
        while (b.overlapsOppositeAxis(containerBox, axis[i]) || b.within(containerBox) && b.overlapsAny(boxPositions)) {
          b.move(axis[i]);
        } // We found a spot where we aren't overlapping anything. This is our
        // best position.


        if (b.within(containerBox)) {
          return b;
        }

        var p = b.intersectPercentage(containerBox); // If we're outside the container box less then we were on our last try
        // then remember this position as the best position.

        if (percentage > p) {
          bestPosition = new BoxPosition(b);
          percentage = p;
        } // Reset the box position to the specified position.


        b = new BoxPosition(specifiedPosition);
      }

      return bestPosition || specifiedPosition;
    }

    var boxPosition = new BoxPosition(styleBox),
        cue = styleBox.cue,
        linePos = computeLinePos(cue),
        axis = []; // If we have a line number to align the cue to.

    if (cue.snapToLines) {
      var size;

      switch (cue.vertical) {
        case "":
          axis = ["+y", "-y"];
          size = "height";
          break;

        case "rl":
          axis = ["+x", "-x"];
          size = "width";
          break;

        case "lr":
          axis = ["-x", "+x"];
          size = "width";
          break;
      }

      var step = boxPosition.lineHeight,
          position = step * Math.round(linePos),
          maxPosition = containerBox[size] + step,
          initialAxis = axis[0]; // If the specified intial position is greater then the max position then
      // clamp the box to the amount of steps it would take for the box to
      // reach the max position.

      if (Math.abs(position) > maxPosition) {
        position = position < 0 ? -1 : 1;
        position *= Math.ceil(maxPosition / step) * step;
      } // If computed line position returns negative then line numbers are
      // relative to the bottom of the video instead of the top. Therefore, we
      // need to increase our initial position by the length or width of the
      // video, depending on the writing direction, and reverse our axis directions.


      if (linePos < 0) {
        position += cue.vertical === "" ? containerBox.height : containerBox.width;
        axis = axis.reverse();
      } // Move the box to the specified position. This may not be its best
      // position.


      boxPosition.move(initialAxis, position);
    } else {
      // If we have a percentage line value for the cue.
      var calculatedPercentage = boxPosition.lineHeight / containerBox.height * 100;

      switch (cue.lineAlign) {
        case "center":
          linePos -= calculatedPercentage / 2;
          break;

        case "end":
          linePos -= calculatedPercentage;
          break;
      } // Apply initial line position to the cue box.


      switch (cue.vertical) {
        case "":
          styleBox.applyStyles({
            top: styleBox.formatStyle(linePos, "%")
          });
          break;

        case "rl":
          styleBox.applyStyles({
            left: styleBox.formatStyle(linePos, "%")
          });
          break;

        case "lr":
          styleBox.applyStyles({
            right: styleBox.formatStyle(linePos, "%")
          });
          break;
      }

      axis = ["+y", "-x", "+x", "-y"]; // Get the box position again after we've applied the specified positioning
      // to it.

      boxPosition = new BoxPosition(styleBox);
    }

    var bestPosition = findBestPosition(boxPosition, axis);
    styleBox.move(bestPosition.toCSSCompatValues(containerBox));
  }

  function WebVTT$1() {} // Nothing
  // Helper to allow strings to be decoded instead of the default binary utf8 data.


  WebVTT$1.StringDecoder = function () {
    return {
      decode: function decode(data) {
        if (!data) {
          return "";
        }

        if (typeof data !== "string") {
          throw new Error("Error - expected string data.");
        }

        return decodeURIComponent(encodeURIComponent(data));
      }
    };
  };

  WebVTT$1.convertCueToDOMTree = function (window, cuetext) {
    if (!window || !cuetext) {
      return null;
    }

    return parseContent(window, cuetext);
  };

  var FONT_SIZE_PERCENT = 0.05;
  var FONT_STYLE = "sans-serif";
  var CUE_BACKGROUND_PADDING = "1.5%"; // Runs the processing model over the cues and regions passed to it.
  // @param overlay A block level element (usually a div) that the computed cues
  //                and regions will be placed into.

  WebVTT$1.processCues = function (window, cues, overlay) {
    if (!window || !cues || !overlay) {
      return null;
    } // Remove all previous children.


    while (overlay.firstChild) {
      overlay.removeChild(overlay.firstChild);
    }

    var paddedOverlay = window.document.createElement("div");
    paddedOverlay.style.position = "absolute";
    paddedOverlay.style.left = "0";
    paddedOverlay.style.right = "0";
    paddedOverlay.style.top = "0";
    paddedOverlay.style.bottom = "0";
    paddedOverlay.style.margin = CUE_BACKGROUND_PADDING;
    overlay.appendChild(paddedOverlay); // Determine if we need to compute the display states of the cues. This could
    // be the case if a cue's state has been changed since the last computation or
    // if it has not been computed yet.

    function shouldCompute(cues) {
      for (var i = 0; i < cues.length; i++) {
        if (cues[i].hasBeenReset || !cues[i].displayState) {
          return true;
        }
      }

      return false;
    } // We don't need to recompute the cues' display states. Just reuse them.


    if (!shouldCompute(cues)) {
      for (var i = 0; i < cues.length; i++) {
        paddedOverlay.appendChild(cues[i].displayState);
      }

      return;
    }

    var boxPositions = [],
        containerBox = BoxPosition.getSimpleBoxPosition(paddedOverlay),
        fontSize = Math.round(containerBox.height * FONT_SIZE_PERCENT * 100) / 100;
    var styleOptions = {
      font: fontSize + "px " + FONT_STYLE
    };

    (function () {
      var styleBox, cue;

      for (var i = 0; i < cues.length; i++) {
        cue = cues[i]; // Compute the intial position and styles of the cue div.

        styleBox = new CueStyleBox(window, cue, styleOptions);
        paddedOverlay.appendChild(styleBox.div); // Move the cue div to it's correct line position.

        moveBoxToLinePosition(window, styleBox, containerBox, boxPositions); // Remember the computed div so that we don't have to recompute it later
        // if we don't have too.

        cue.displayState = styleBox.div;
        boxPositions.push(BoxPosition.getSimpleBoxPosition(styleBox));
      }
    })();
  };

  WebVTT$1.Parser = function (window, vttjs, decoder) {
    if (!decoder) {
      decoder = vttjs;
      vttjs = {};
    }

    if (!vttjs) {
      vttjs = {};
    }

    this.window = window;
    this.vttjs = vttjs;
    this.state = "INITIAL";
    this.buffer = "";
    this.decoder = decoder || new TextDecoder("utf8");
    this.regionList = [];
  };

  WebVTT$1.Parser.prototype = {
    // If the error is a ParsingError then report it to the consumer if
    // possible. If it's not a ParsingError then throw it like normal.
    reportOrThrowError: function reportOrThrowError(e) {
      if (e instanceof ParsingError) {
        this.onparsingerror && this.onparsingerror(e);
      } else {
        throw e;
      }
    },
    parse: function parse(data) {
      var self = this; // If there is no data then we won't decode it, but will just try to parse
      // whatever is in buffer already. This may occur in circumstances, for
      // example when flush() is called.

      if (data) {
        // Try to decode the data that we received.
        self.buffer += self.decoder.decode(data, {
          stream: true
        });
      }

      function collectNextLine() {
        var buffer = self.buffer;
        var pos = 0;

        while (pos < buffer.length && buffer[pos] !== '\r' && buffer[pos] !== '\n') {
          ++pos;
        }

        var line = buffer.substr(0, pos); // Advance the buffer early in case we fail below.

        if (buffer[pos] === '\r') {
          ++pos;
        }

        if (buffer[pos] === '\n') {
          ++pos;
        }

        self.buffer = buffer.substr(pos);
        return line;
      } // 3.4 WebVTT region and WebVTT region settings syntax


      function parseRegion(input) {
        var settings = new Settings();
        parseOptions(input, function (k, v) {
          switch (k) {
            case "id":
              settings.set(k, v);
              break;

            case "width":
              settings.percent(k, v);
              break;

            case "lines":
              settings.integer(k, v);
              break;

            case "regionanchor":
            case "viewportanchor":
              var xy = v.split(',');

              if (xy.length !== 2) {
                break;
              } // We have to make sure both x and y parse, so use a temporary
              // settings object here.


              var anchor = new Settings();
              anchor.percent("x", xy[0]);
              anchor.percent("y", xy[1]);

              if (!anchor.has("x") || !anchor.has("y")) {
                break;
              }

              settings.set(k + "X", anchor.get("x"));
              settings.set(k + "Y", anchor.get("y"));
              break;

            case "scroll":
              settings.alt(k, v, ["up"]);
              break;
          }
        }, /=/, /\s/); // Create the region, using default values for any values that were not
        // specified.

        if (settings.has("id")) {
          var region = new (self.vttjs.VTTRegion || self.window.VTTRegion)();
          region.width = settings.get("width", 100);
          region.lines = settings.get("lines", 3);
          region.regionAnchorX = settings.get("regionanchorX", 0);
          region.regionAnchorY = settings.get("regionanchorY", 100);
          region.viewportAnchorX = settings.get("viewportanchorX", 0);
          region.viewportAnchorY = settings.get("viewportanchorY", 100);
          region.scroll = settings.get("scroll", ""); // Register the region.

          self.onregion && self.onregion(region); // Remember the VTTRegion for later in case we parse any VTTCues that
          // reference it.

          self.regionList.push({
            id: settings.get("id"),
            region: region
          });
        }
      } // draft-pantos-http-live-streaming-20
      // https://tools.ietf.org/html/draft-pantos-http-live-streaming-20#section-3.5
      // 3.5 WebVTT


      function parseTimestampMap(input) {
        var settings = new Settings();
        parseOptions(input, function (k, v) {
          switch (k) {
            case "MPEGT":
              settings.integer(k + 'S', v);
              break;

            case "LOCA":
              settings.set(k + 'L', parseTimeStamp(v));
              break;
          }
        }, /[^\d]:/, /,/);
        self.ontimestampmap && self.ontimestampmap({
          "MPEGTS": settings.get("MPEGTS"),
          "LOCAL": settings.get("LOCAL")
        });
      } // 3.2 WebVTT metadata header syntax


      function parseHeader(input) {
        if (input.match(/X-TIMESTAMP-MAP/)) {
          // This line contains HLS X-TIMESTAMP-MAP metadata
          parseOptions(input, function (k, v) {
            switch (k) {
              case "X-TIMESTAMP-MAP":
                parseTimestampMap(v);
                break;
            }
          }, /=/);
        } else {
          parseOptions(input, function (k, v) {
            switch (k) {
              case "Region":
                // 3.3 WebVTT region metadata header syntax
                parseRegion(v);
                break;
            }
          }, /:/);
        }
      } // 5.1 WebVTT file parsing.


      try {
        var line;

        if (self.state === "INITIAL") {
          // We can't start parsing until we have the first line.
          if (!/\r\n|\n/.test(self.buffer)) {
            return this;
          }

          line = collectNextLine();
          var m = line.match(/^WEBVTT([ \t].*)?$/);

          if (!m || !m[0]) {
            throw new ParsingError(ParsingError.Errors.BadSignature);
          }

          self.state = "HEADER";
        }

        var alreadyCollectedLine = false;

        while (self.buffer) {
          // We can't parse a line until we have the full line.
          if (!/\r\n|\n/.test(self.buffer)) {
            return this;
          }

          if (!alreadyCollectedLine) {
            line = collectNextLine();
          } else {
            alreadyCollectedLine = false;
          }

          switch (self.state) {
            case "HEADER":
              // 13-18 - Allow a header (metadata) under the WEBVTT line.
              if (/:/.test(line)) {
                parseHeader(line);
              } else if (!line) {
                // An empty line terminates the header and starts the body (cues).
                self.state = "ID";
              }

              continue;

            case "NOTE":
              // Ignore NOTE blocks.
              if (!line) {
                self.state = "ID";
              }

              continue;

            case "ID":
              // Check for the start of NOTE blocks.
              if (/^NOTE($|[ \t])/.test(line)) {
                self.state = "NOTE";
                break;
              } // 19-29 - Allow any number of line terminators, then initialize new cue values.


              if (!line) {
                continue;
              }

              self.cue = new (self.vttjs.VTTCue || self.window.VTTCue)(0, 0, ""); // Safari still uses the old middle value and won't accept center

              try {
                self.cue.align = "center";
              } catch (e) {
                self.cue.align = "middle";
              }

              self.state = "CUE"; // 30-39 - Check if self line contains an optional identifier or timing data.

              if (line.indexOf("-->") === -1) {
                self.cue.id = line;
                continue;
              }

            // Process line as start of a cue.

            /*falls through*/

            case "CUE":
              // 40 - Collect cue timings and settings.
              try {
                parseCue(line, self.cue, self.regionList);
              } catch (e) {
                self.reportOrThrowError(e); // In case of an error ignore rest of the cue.

                self.cue = null;
                self.state = "BADCUE";
                continue;
              }

              self.state = "CUETEXT";
              continue;

            case "CUETEXT":
              var hasSubstring = line.indexOf("-->") !== -1; // 34 - If we have an empty line then report the cue.
              // 35 - If we have the special substring '-->' then report the cue,
              // but do not collect the line as we need to process the current
              // one as a new cue.

              if (!line || hasSubstring && (alreadyCollectedLine = true)) {
                // We are done parsing self cue.
                self.oncue && self.oncue(self.cue);
                self.cue = null;
                self.state = "ID";
                continue;
              }

              if (self.cue.text) {
                self.cue.text += "\n";
              }

              self.cue.text += line.replace(/\u2028/g, '\n').replace(/u2029/g, '\n');
              continue;

            case "BADCUE":
              // BADCUE
              // 54-62 - Collect and discard the remaining cue.
              if (!line) {
                self.state = "ID";
              }

              continue;
          }
        }
      } catch (e) {
        self.reportOrThrowError(e); // If we are currently parsing a cue, report what we have.

        if (self.state === "CUETEXT" && self.cue && self.oncue) {
          self.oncue(self.cue);
        }

        self.cue = null; // Enter BADWEBVTT state if header was not parsed correctly otherwise
        // another exception occurred so enter BADCUE state.

        self.state = self.state === "INITIAL" ? "BADWEBVTT" : "BADCUE";
      }

      return this;
    },
    flush: function flush() {
      var self = this;

      try {
        // Finish decoding the stream.
        self.buffer += self.decoder.decode(); // Synthesize the end of the current cue or region.

        if (self.cue || self.state === "HEADER") {
          self.buffer += "\n\n";
          self.parse();
        } // If we've flushed, parsed, and we're still on the INITIAL state then
        // that means we don't have enough of the stream to parse the first
        // line.


        if (self.state === "INITIAL") {
          throw new ParsingError(ParsingError.Errors.BadSignature);
        }
      } catch (e) {
        self.reportOrThrowError(e);
      }

      self.onflush && self.onflush();
      return this;
    }
  };
  var vtt = WebVTT$1;

  /**
   * Copyright 2013 vtt.js Contributors
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var autoKeyword = "auto";
  var directionSetting = {
    "": 1,
    "lr": 1,
    "rl": 1
  };
  var alignSetting = {
    "start": 1,
    "center": 1,
    "end": 1,
    "left": 1,
    "right": 1,
    "auto": 1,
    "line-left": 1,
    "line-right": 1
  };

  function findDirectionSetting(value) {
    if (typeof value !== "string") {
      return false;
    }

    var dir = directionSetting[value.toLowerCase()];
    return dir ? value.toLowerCase() : false;
  }

  function findAlignSetting(value) {
    if (typeof value !== "string") {
      return false;
    }

    var align = alignSetting[value.toLowerCase()];
    return align ? value.toLowerCase() : false;
  }

  function VTTCue(startTime, endTime, text) {
    /**
     * Shim implementation specific properties. These properties are not in
     * the spec.
     */
    // Lets us know when the VTTCue's data has changed in such a way that we need
    // to recompute its display state. This lets us compute its display state
    // lazily.
    this.hasBeenReset = false;
    /**
     * VTTCue and TextTrackCue properties
     * http://dev.w3.org/html5/webvtt/#vttcue-interface
     */

    var _id = "";
    var _pauseOnExit = false;
    var _startTime = startTime;
    var _endTime = endTime;
    var _text = text;
    var _region = null;
    var _vertical = "";
    var _snapToLines = true;
    var _line = "auto";
    var _lineAlign = "start";
    var _position = "auto";
    var _positionAlign = "auto";
    var _size = 100;
    var _align = "center";
    Object.defineProperties(this, {
      "id": {
        enumerable: true,
        get: function get() {
          return _id;
        },
        set: function set(value) {
          _id = "" + value;
        }
      },
      "pauseOnExit": {
        enumerable: true,
        get: function get() {
          return _pauseOnExit;
        },
        set: function set(value) {
          _pauseOnExit = !!value;
        }
      },
      "startTime": {
        enumerable: true,
        get: function get() {
          return _startTime;
        },
        set: function set(value) {
          if (typeof value !== "number") {
            throw new TypeError("Start time must be set to a number.");
          }

          _startTime = value;
          this.hasBeenReset = true;
        }
      },
      "endTime": {
        enumerable: true,
        get: function get() {
          return _endTime;
        },
        set: function set(value) {
          if (typeof value !== "number") {
            throw new TypeError("End time must be set to a number.");
          }

          _endTime = value;
          this.hasBeenReset = true;
        }
      },
      "text": {
        enumerable: true,
        get: function get() {
          return _text;
        },
        set: function set(value) {
          _text = "" + value;
          this.hasBeenReset = true;
        }
      },
      "region": {
        enumerable: true,
        get: function get() {
          return _region;
        },
        set: function set(value) {
          _region = value;
          this.hasBeenReset = true;
        }
      },
      "vertical": {
        enumerable: true,
        get: function get() {
          return _vertical;
        },
        set: function set(value) {
          var setting = findDirectionSetting(value); // Have to check for false because the setting an be an empty string.

          if (setting === false) {
            throw new SyntaxError("Vertical: an invalid or illegal direction string was specified.");
          }

          _vertical = setting;
          this.hasBeenReset = true;
        }
      },
      "snapToLines": {
        enumerable: true,
        get: function get() {
          return _snapToLines;
        },
        set: function set(value) {
          _snapToLines = !!value;
          this.hasBeenReset = true;
        }
      },
      "line": {
        enumerable: true,
        get: function get() {
          return _line;
        },
        set: function set(value) {
          if (typeof value !== "number" && value !== autoKeyword) {
            throw new SyntaxError("Line: an invalid number or illegal string was specified.");
          }

          _line = value;
          this.hasBeenReset = true;
        }
      },
      "lineAlign": {
        enumerable: true,
        get: function get() {
          return _lineAlign;
        },
        set: function set(value) {
          var setting = findAlignSetting(value);

          if (!setting) {
            console.warn("lineAlign: an invalid or illegal string was specified.");
          } else {
            _lineAlign = setting;
            this.hasBeenReset = true;
          }
        }
      },
      "position": {
        enumerable: true,
        get: function get() {
          return _position;
        },
        set: function set(value) {
          if (value < 0 || value > 100) {
            throw new Error("Position must be between 0 and 100.");
          }

          _position = value;
          this.hasBeenReset = true;
        }
      },
      "positionAlign": {
        enumerable: true,
        get: function get() {
          return _positionAlign;
        },
        set: function set(value) {
          var setting = findAlignSetting(value);

          if (!setting) {
            console.warn("positionAlign: an invalid or illegal string was specified.");
          } else {
            _positionAlign = setting;
            this.hasBeenReset = true;
          }
        }
      },
      "size": {
        enumerable: true,
        get: function get() {
          return _size;
        },
        set: function set(value) {
          if (value < 0 || value > 100) {
            throw new Error("Size must be between 0 and 100.");
          }

          _size = value;
          this.hasBeenReset = true;
        }
      },
      "align": {
        enumerable: true,
        get: function get() {
          return _align;
        },
        set: function set(value) {
          var setting = findAlignSetting(value);

          if (!setting) {
            throw new SyntaxError("align: an invalid or illegal alignment string was specified.");
          }

          _align = setting;
          this.hasBeenReset = true;
        }
      }
    });
    /**
     * Other <track> spec defined properties
     */
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#text-track-cue-display-state

    this.displayState = undefined;
  }
  /**
   * VTTCue methods
   */


  VTTCue.prototype.getCueAsHTML = function () {
    // Assume WebVTT.convertCueToDOMTree is on the global.
    return WebVTT.convertCueToDOMTree(window, this.text);
  };

  var vttcue = VTTCue;

  /**
   * Copyright 2013 vtt.js Contributors
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  var scrollSetting = {
    "": true,
    "up": true
  };

  function findScrollSetting(value) {
    if (typeof value !== "string") {
      return false;
    }

    var scroll = scrollSetting[value.toLowerCase()];
    return scroll ? value.toLowerCase() : false;
  }

  function isValidPercentValue(value) {
    return typeof value === "number" && value >= 0 && value <= 100;
  } // VTTRegion shim http://dev.w3.org/html5/webvtt/#vttregion-interface


  function VTTRegion() {
    var _width = 100;
    var _lines = 3;
    var _regionAnchorX = 0;
    var _regionAnchorY = 100;
    var _viewportAnchorX = 0;
    var _viewportAnchorY = 100;
    var _scroll = "";
    Object.defineProperties(this, {
      "width": {
        enumerable: true,
        get: function get() {
          return _width;
        },
        set: function set(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("Width must be between 0 and 100.");
          }

          _width = value;
        }
      },
      "lines": {
        enumerable: true,
        get: function get() {
          return _lines;
        },
        set: function set(value) {
          if (typeof value !== "number") {
            throw new TypeError("Lines must be set to a number.");
          }

          _lines = value;
        }
      },
      "regionAnchorY": {
        enumerable: true,
        get: function get() {
          return _regionAnchorY;
        },
        set: function set(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("RegionAnchorX must be between 0 and 100.");
          }

          _regionAnchorY = value;
        }
      },
      "regionAnchorX": {
        enumerable: true,
        get: function get() {
          return _regionAnchorX;
        },
        set: function set(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("RegionAnchorY must be between 0 and 100.");
          }

          _regionAnchorX = value;
        }
      },
      "viewportAnchorY": {
        enumerable: true,
        get: function get() {
          return _viewportAnchorY;
        },
        set: function set(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("ViewportAnchorY must be between 0 and 100.");
          }

          _viewportAnchorY = value;
        }
      },
      "viewportAnchorX": {
        enumerable: true,
        get: function get() {
          return _viewportAnchorX;
        },
        set: function set(value) {
          if (!isValidPercentValue(value)) {
            throw new Error("ViewportAnchorX must be between 0 and 100.");
          }

          _viewportAnchorX = value;
        }
      },
      "scroll": {
        enumerable: true,
        get: function get() {
          return _scroll;
        },
        set: function set(value) {
          var setting = findScrollSetting(value); // Have to check for false as an empty string is a legal value.

          if (setting === false) {
            console.warn("Scroll: an invalid or illegal string was specified.");
          } else {
            _scroll = setting;
          }
        }
      }
    });
  }

  var vttregion = VTTRegion;

  var browserIndex = createCommonjsModule(function (module) {
    /**
     * Copyright 2013 vtt.js Contributors
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // Default exports for Node. Export the extended versions of VTTCue and
    // VTTRegion in Node since we likely want the capability to convert back and
    // forth between JSON. If we don't then it's not that big of a deal since we're
    // off browser.
    var vttjs = module.exports = {
      WebVTT: vtt,
      VTTCue: vttcue,
      VTTRegion: vttregion
    };
    window$1.vttjs = vttjs;
    window$1.WebVTT = vttjs.WebVTT;
    var cueShim = vttjs.VTTCue;
    var regionShim = vttjs.VTTRegion;
    var nativeVTTCue = window$1.VTTCue;
    var nativeVTTRegion = window$1.VTTRegion;

    vttjs.shim = function () {
      window$1.VTTCue = cueShim;
      window$1.VTTRegion = regionShim;
    };

    vttjs.restore = function () {
      window$1.VTTCue = nativeVTTCue;
      window$1.VTTRegion = nativeVTTRegion;
    };

    if (!window$1.VTTCue) {
      vttjs.shim();
    }
  });
  var browserIndex_1 = browserIndex.WebVTT;
  var browserIndex_2 = browserIndex.VTTCue;
  var browserIndex_3 = browserIndex.VTTRegion;

  /**
   * An Object containing a structure like: `{src: 'url', type: 'mimetype'}` or string
   * that just contains the src url alone.
   * * `var SourceObject = {src: 'http://ex.com/video.mp4', type: 'video/mp4'};`
     * `var SourceString = 'http://example.com/some-video.mp4';`
   *
   * @typedef {Object|string} Tech~SourceObject
   *
   * @property {string} src
   *           The url to the source
   *
   * @property {string} type
   *           The mime type of the source
   */

  /**
   * A function used by {@link Tech} to create a new {@link TextTrack}.
   *
   * @private
   *
   * @param {Tech} self
   *        An instance of the Tech class.
   *
   * @param {string} kind
   *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata)
   *
   * @param {string} [label]
   *        Label to identify the text track
   *
   * @param {string} [language]
   *        Two letter language abbreviation
   *
   * @param {Object} [options={}]
   *        An object with additional text track options
   *
   * @return {TextTrack}
   *          The text track that was created.
   */

  function createTrackHelper(self, kind, label, language, options) {
    if (options === void 0) {
      options = {};
    }

    var tracks = self.textTracks();
    options.kind = kind;

    if (label) {
      options.label = label;
    }

    if (language) {
      options.language = language;
    }

    options.tech = self;
    var track = new ALL.text.TrackClass(options);
    tracks.addTrack(track);
    return track;
  }
  /**
   * This is the base class for media playback technology controllers, such as
   * {@link Flash} and {@link HTML5}
   *
   * @extends Component
   */


  var Tech = /*#__PURE__*/function (_Component) {
    inheritsLoose(Tech, _Component);

    /**
    * Create an instance of this Tech.
    *
    * @param {Object} [options]
    *        The key/value store of player options.
    *
    * @param {Component~ReadyCallback} ready
    *        Callback function to call when the `HTML5` Tech is ready.
    */
    function Tech(options, ready) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      if (ready === void 0) {
        ready = function ready() {};
      }

      // we don't want the tech to report user activity automatically.
      // This is done manually in addControlsListeners
      options.reportTouchActivity = false;
      _this = _Component.call(this, null, options, ready) || this; // keep track of whether the current source has played at all to
      // implement a very limited played()

      _this.hasStarted_ = false;

      _this.on('playing', function () {
        this.hasStarted_ = true;
      });

      _this.on('loadstart', function () {
        this.hasStarted_ = false;
      });

      ALL.names.forEach(function (name) {
        var props = ALL[name];

        if (options && options[props.getterName]) {
          _this[props.privateName] = options[props.getterName];
        }
      }); // Manually track progress in cases where the browser/flash player doesn't report it.

      if (!_this.featuresProgressEvents) {
        _this.manualProgressOn();
      } // Manually track timeupdates in cases where the browser/flash player doesn't report it.


      if (!_this.featuresTimeupdateEvents) {
        _this.manualTimeUpdatesOn();
      }

      ['Text', 'Audio', 'Video'].forEach(function (track) {
        if (options["native" + track + "Tracks"] === false) {
          _this["featuresNative" + track + "Tracks"] = false;
        }
      });

      if (options.nativeCaptions === false || options.nativeTextTracks === false) {
        _this.featuresNativeTextTracks = false;
      } else if (options.nativeCaptions === true || options.nativeTextTracks === true) {
        _this.featuresNativeTextTracks = true;
      }

      if (!_this.featuresNativeTextTracks) {
        _this.emulateTextTracks();
      }

      _this.preloadTextTracks = options.preloadTextTracks !== false;
      _this.autoRemoteTextTracks_ = new ALL.text.ListClass();

      _this.initTrackListeners(); // Turn on component tap events only if not using native controls


      if (!options.nativeControlsForTouch) {
        _this.emitTapEvents();
      }

      if (_this.constructor) {
        _this.name_ = _this.constructor.name || 'Unknown Tech';
      }

      return _this;
    }
    /**
     * A special function to trigger source set in a way that will allow player
     * to re-trigger if the player or tech are not ready yet.
     *
     * @fires Tech#sourceset
     * @param {string} src The source string at the time of the source changing.
     */


    var _proto = Tech.prototype;

    _proto.triggerSourceset = function triggerSourceset(src) {
      var _this2 = this;

      if (!this.isReady_) {
        // on initial ready we have to trigger source set
        // 1ms after ready so that player can watch for it.
        this.one('ready', function () {
          return _this2.setTimeout(function () {
            return _this2.triggerSourceset(src);
          }, 1);
        });
      }
      /**
       * Fired when the source is set on the tech causing the media element
       * to reload.
       *
       * @see {@link Player#event:sourceset}
       * @event Tech#sourceset
       * @type {EventTarget~Event}
       */


      this.trigger({
        src: src,
        type: 'sourceset'
      });
    }
    /* Fallbacks for unsupported event types
    ================================================================================ */

    /**
     * Polyfill the `progress` event for browsers that don't support it natively.
     *
     * @see {@link Tech#trackProgress}
     */
    ;

    _proto.manualProgressOn = function manualProgressOn() {
      this.on('durationchange', this.onDurationChange);
      this.manualProgress = true; // Trigger progress watching when a source begins loading

      this.one('ready', this.trackProgress);
    }
    /**
     * Turn off the polyfill for `progress` events that was created in
     * {@link Tech#manualProgressOn}
     */
    ;

    _proto.manualProgressOff = function manualProgressOff() {
      this.manualProgress = false;
      this.stopTrackingProgress();
      this.off('durationchange', this.onDurationChange);
    }
    /**
     * This is used to trigger a `progress` event when the buffered percent changes. It
     * sets an interval function that will be called every 500 milliseconds to check if the
     * buffer end percent has changed.
     *
     * > This function is called by {@link Tech#manualProgressOn}
     *
     * @param {EventTarget~Event} event
     *        The `ready` event that caused this to run.
     *
     * @listens Tech#ready
     * @fires Tech#progress
     */
    ;

    _proto.trackProgress = function trackProgress(event) {
      this.stopTrackingProgress();
      this.progressInterval = this.setInterval(bind(this, function () {
        // Don't trigger unless buffered amount is greater than last time
        var numBufferedPercent = this.bufferedPercent();

        if (this.bufferedPercent_ !== numBufferedPercent) {
          /**
           * See {@link Player#progress}
           *
           * @event Tech#progress
           * @type {EventTarget~Event}
           */
          this.trigger('progress');
        }

        this.bufferedPercent_ = numBufferedPercent;

        if (numBufferedPercent === 1) {
          this.stopTrackingProgress();
        }
      }), 500);
    }
    /**
     * Update our internal duration on a `durationchange` event by calling
     * {@link Tech#duration}.
     *
     * @param {EventTarget~Event} event
     *        The `durationchange` event that caused this to run.
     *
     * @listens Tech#durationchange
     */
    ;

    _proto.onDurationChange = function onDurationChange(event) {
      this.duration_ = this.duration();
    }
    /**
     * Get and create a `TimeRange` object for buffering.
     *
     * @return {TimeRange}
     *         The time range object that was created.
     */
    ;

    _proto.buffered = function buffered() {
      return createTimeRanges(0, 0);
    }
    /**
     * Get the percentage of the current video that is currently buffered.
     *
     * @return {number}
     *         A number from 0 to 1 that represents the decimal percentage of the
     *         video that is buffered.
     *
     */
    ;

    _proto.bufferedPercent = function bufferedPercent$1() {
      return bufferedPercent(this.buffered(), this.duration_);
    }
    /**
     * Turn off the polyfill for `progress` events that was created in
     * {@link Tech#manualProgressOn}
     * Stop manually tracking progress events by clearing the interval that was set in
     * {@link Tech#trackProgress}.
     */
    ;

    _proto.stopTrackingProgress = function stopTrackingProgress() {
      this.clearInterval(this.progressInterval);
    }
    /**
     * Polyfill the `timeupdate` event for browsers that don't support it.
     *
     * @see {@link Tech#trackCurrentTime}
     */
    ;

    _proto.manualTimeUpdatesOn = function manualTimeUpdatesOn() {
      this.manualTimeUpdates = true;
      this.on('play', this.trackCurrentTime);
      this.on('pause', this.stopTrackingCurrentTime);
    }
    /**
     * Turn off the polyfill for `timeupdate` events that was created in
     * {@link Tech#manualTimeUpdatesOn}
     */
    ;

    _proto.manualTimeUpdatesOff = function manualTimeUpdatesOff() {
      this.manualTimeUpdates = false;
      this.stopTrackingCurrentTime();
      this.off('play', this.trackCurrentTime);
      this.off('pause', this.stopTrackingCurrentTime);
    }
    /**
     * Sets up an interval function to track current time and trigger `timeupdate` every
     * 250 milliseconds.
     *
     * @listens Tech#play
     * @triggers Tech#timeupdate
     */
    ;

    _proto.trackCurrentTime = function trackCurrentTime() {
      if (this.currentTimeInterval) {
        this.stopTrackingCurrentTime();
      }

      this.currentTimeInterval = this.setInterval(function () {
        /**
         * Triggered at an interval of 250ms to indicated that time is passing in the video.
         *
         * @event Tech#timeupdate
         * @type {EventTarget~Event}
         */
        this.trigger({
          type: 'timeupdate',
          target: this,
          manuallyTriggered: true
        }); // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
      }, 250);
    }
    /**
     * Stop the interval function created in {@link Tech#trackCurrentTime} so that the
     * `timeupdate` event is no longer triggered.
     *
     * @listens {Tech#pause}
     */
    ;

    _proto.stopTrackingCurrentTime = function stopTrackingCurrentTime() {
      this.clearInterval(this.currentTimeInterval); // #1002 - if the video ends right before the next timeupdate would happen,
      // the progress bar won't make it all the way to the end

      this.trigger({
        type: 'timeupdate',
        target: this,
        manuallyTriggered: true
      });
    }
    /**
     * Turn off all event polyfills, clear the `Tech`s {@link AudioTrackList},
     * {@link VideoTrackList}, and {@link TextTrackList}, and dispose of this Tech.
     *
     * @fires Component#dispose
     */
    ;

    _proto.dispose = function dispose() {
      // clear out all tracks because we can't reuse them between techs
      this.clearTracks(NORMAL.names); // Turn off any manual progress or timeupdate tracking

      if (this.manualProgress) {
        this.manualProgressOff();
      }

      if (this.manualTimeUpdates) {
        this.manualTimeUpdatesOff();
      }

      _Component.prototype.dispose.call(this);
    }
    /**
     * Clear out a single `TrackList` or an array of `TrackLists` given their names.
     *
     * > Note: Techs without source handlers should call this between sources for `video`
     *         & `audio` tracks. You don't want to use them between tracks!
     *
     * @param {string[]|string} types
     *        TrackList names to clear, valid names are `video`, `audio`, and
     *        `text`.
     */
    ;

    _proto.clearTracks = function clearTracks(types) {
      var _this3 = this;

      types = [].concat(types); // clear out all tracks because we can't reuse them between techs

      types.forEach(function (type) {
        var list = _this3[type + "Tracks"]() || [];
        var i = list.length;

        while (i--) {
          var track = list[i];

          if (type === 'text') {
            _this3.removeRemoteTextTrack(track);
          }

          list.removeTrack(track);
        }
      });
    }
    /**
     * Remove any TextTracks added via addRemoteTextTrack that are
     * flagged for automatic garbage collection
     */
    ;

    _proto.cleanupAutoTextTracks = function cleanupAutoTextTracks() {
      var list = this.autoRemoteTextTracks_ || [];
      var i = list.length;

      while (i--) {
        var track = list[i];
        this.removeRemoteTextTrack(track);
      }
    }
    /**
     * Reset the tech, which will removes all sources and reset the internal readyState.
     *
     * @abstract
     */
    ;

    _proto.reset = function reset() {}
    /**
     * Get the value of `crossOrigin` from the tech.
     *
     * @abstract
     *
     * @see {Html5#crossOrigin}
     */
    ;

    _proto.crossOrigin = function crossOrigin() {}
    /**
     * Set the value of `crossOrigin` on the tech.
     *
     * @abstract
     *
     * @param {string} crossOrigin the crossOrigin value
     * @see {Html5#setCrossOrigin}
     */
    ;

    _proto.setCrossOrigin = function setCrossOrigin() {}
    /**
     * Get or set an error on the Tech.
     *
     * @param {MediaError} [err]
     *        Error to set on the Tech
     *
     * @return {MediaError|null}
     *         The current error object on the tech, or null if there isn't one.
     */
    ;

    _proto.error = function error(err) {
      if (err !== undefined) {
        this.error_ = new MediaError(err);
        this.trigger('error');
      }

      return this.error_;
    }
    /**
     * Returns the `TimeRange`s that have been played through for the current source.
     *
     * > NOTE: This implementation is incomplete. It does not track the played `TimeRange`.
     *         It only checks whether the source has played at all or not.
     *
     * @return {TimeRange}
     *         - A single time range if this video has played
     *         - An empty set of ranges if not.
     */
    ;

    _proto.played = function played() {
      if (this.hasStarted_) {
        return createTimeRanges(0, 0);
      }

      return createTimeRanges();
    }
    /**
     * Set whether we are scrubbing or not
     *
     * @abstract
     *
     * @see {Html5#setScrubbing}
     */
    ;

    _proto.setScrubbing = function setScrubbing() {}
    /**
     * Causes a manual time update to occur if {@link Tech#manualTimeUpdatesOn} was
     * previously called.
     *
     * @fires Tech#timeupdate
     */
    ;

    _proto.setCurrentTime = function setCurrentTime() {
      // improve the accuracy of manual timeupdates
      if (this.manualTimeUpdates) {
        /**
         * A manual `timeupdate` event.
         *
         * @event Tech#timeupdate
         * @type {EventTarget~Event}
         */
        this.trigger({
          type: 'timeupdate',
          target: this,
          manuallyTriggered: true
        });
      }
    }
    /**
     * Turn on listeners for {@link VideoTrackList}, {@link {AudioTrackList}, and
     * {@link TextTrackList} events.
     *
     * This adds {@link EventTarget~EventListeners} for `addtrack`, and  `removetrack`.
     *
     * @fires Tech#audiotrackchange
     * @fires Tech#videotrackchange
     * @fires Tech#texttrackchange
     */
    ;

    _proto.initTrackListeners = function initTrackListeners() {
      var _this4 = this;

      /**
        * Triggered when tracks are added or removed on the Tech {@link AudioTrackList}
        *
        * @event Tech#audiotrackchange
        * @type {EventTarget~Event}
        */

      /**
        * Triggered when tracks are added or removed on the Tech {@link VideoTrackList}
        *
        * @event Tech#videotrackchange
        * @type {EventTarget~Event}
        */

      /**
        * Triggered when tracks are added or removed on the Tech {@link TextTrackList}
        *
        * @event Tech#texttrackchange
        * @type {EventTarget~Event}
        */
      NORMAL.names.forEach(function (name) {
        var props = NORMAL[name];

        var trackListChanges = function trackListChanges() {
          _this4.trigger(name + "trackchange");
        };

        var tracks = _this4[props.getterName]();

        tracks.addEventListener('removetrack', trackListChanges);
        tracks.addEventListener('addtrack', trackListChanges);

        _this4.on('dispose', function () {
          tracks.removeEventListener('removetrack', trackListChanges);
          tracks.removeEventListener('addtrack', trackListChanges);
        });
      });
    }
    /**
     * Emulate TextTracks using vtt.js if necessary
     *
     * @fires Tech#vttjsloaded
     * @fires Tech#vttjserror
     */
    ;

    _proto.addWebVttScript_ = function addWebVttScript_() {
      var _this5 = this;

      if (window$1.WebVTT) {
        return;
      } // Initially, Tech.el_ is a child of a dummy-div wait until the Component system
      // signals that the Tech is ready at which point Tech.el_ is part of the DOM
      // before inserting the WebVTT script


      if (document.body.contains(this.el())) {
        // load via require if available and vtt.js script location was not passed in
        // as an option. novtt builds will turn the above require call into an empty object
        // which will cause this if check to always fail.
        if (!this.options_['vtt.js'] && isPlain(browserIndex) && Object.keys(browserIndex).length > 0) {
          this.trigger('vttjsloaded');
          return;
        } // load vtt.js via the script location option or the cdn of no location was
        // passed in


        var script = document.createElement('script');
        script.src = this.options_['vtt.js'] || 'https://vjs.zencdn.net/vttjs/0.14.1/vtt.min.js';

        script.onload = function () {
          /**
           * Fired when vtt.js is loaded.
           *
           * @event Tech#vttjsloaded
           * @type {EventTarget~Event}
           */
          _this5.trigger('vttjsloaded');
        };

        script.onerror = function () {
          /**
           * Fired when vtt.js was not loaded due to an error
           *
           * @event Tech#vttjsloaded
           * @type {EventTarget~Event}
           */
          _this5.trigger('vttjserror');
        };

        this.on('dispose', function () {
          script.onload = null;
          script.onerror = null;
        }); // but have not loaded yet and we set it to true before the inject so that
        // we don't overwrite the injected window.WebVTT if it loads right away

        window$1.WebVTT = true;
        this.el().parentNode.appendChild(script);
      } else {
        this.ready(this.addWebVttScript_);
      }
    }
    /**
     * Emulate texttracks
     *
     */
    ;

    _proto.emulateTextTracks = function emulateTextTracks() {
      var _this6 = this;

      var tracks = this.textTracks();
      var remoteTracks = this.remoteTextTracks();

      var handleAddTrack = function handleAddTrack(e) {
        return tracks.addTrack(e.track);
      };

      var handleRemoveTrack = function handleRemoveTrack(e) {
        return tracks.removeTrack(e.track);
      };

      remoteTracks.on('addtrack', handleAddTrack);
      remoteTracks.on('removetrack', handleRemoveTrack);
      this.addWebVttScript_();

      var updateDisplay = function updateDisplay() {
        return _this6.trigger('texttrackchange');
      };

      var textTracksChanges = function textTracksChanges() {
        updateDisplay();

        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          track.removeEventListener('cuechange', updateDisplay);

          if (track.mode === 'showing') {
            track.addEventListener('cuechange', updateDisplay);
          }
        }
      };

      textTracksChanges();
      tracks.addEventListener('change', textTracksChanges);
      tracks.addEventListener('addtrack', textTracksChanges);
      tracks.addEventListener('removetrack', textTracksChanges);
      this.on('dispose', function () {
        remoteTracks.off('addtrack', handleAddTrack);
        remoteTracks.off('removetrack', handleRemoveTrack);
        tracks.removeEventListener('change', textTracksChanges);
        tracks.removeEventListener('addtrack', textTracksChanges);
        tracks.removeEventListener('removetrack', textTracksChanges);

        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          track.removeEventListener('cuechange', updateDisplay);
        }
      });
    }
    /**
     * Create and returns a remote {@link TextTrack} object.
     *
     * @param {string} kind
     *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata)
     *
     * @param {string} [label]
     *        Label to identify the text track
     *
     * @param {string} [language]
     *        Two letter language abbreviation
     *
     * @return {TextTrack}
     *         The TextTrack that gets created.
     */
    ;

    _proto.addTextTrack = function addTextTrack(kind, label, language) {
      if (!kind) {
        throw new Error('TextTrack kind is required but was not provided');
      }

      return createTrackHelper(this, kind, label, language);
    }
    /**
     * Create an emulated TextTrack for use by addRemoteTextTrack
     *
     * This is intended to be overridden by classes that inherit from
     * Tech in order to create native or custom TextTracks.
     *
     * @param {Object} options
     *        The object should contain the options to initialize the TextTrack with.
     *
     * @param {string} [options.kind]
     *        `TextTrack` kind (subtitles, captions, descriptions, chapters, or metadata).
     *
     * @param {string} [options.label].
     *        Label to identify the text track
     *
     * @param {string} [options.language]
     *        Two letter language abbreviation.
     *
     * @return {HTMLTrackElement}
     *         The track element that gets created.
     */
    ;

    _proto.createRemoteTextTrack = function createRemoteTextTrack(options) {
      var track = mergeOptions(options, {
        tech: this
      });
      return new REMOTE.remoteTextEl.TrackClass(track);
    }
    /**
     * Creates a remote text track object and returns an html track element.
     *
     * > Note: This can be an emulated {@link HTMLTrackElement} or a native one.
     *
     * @param {Object} options
     *        See {@link Tech#createRemoteTextTrack} for more detailed properties.
     *
     * @param {boolean} [manualCleanup=true]
     *        - When false: the TextTrack will be automatically removed from the video
     *          element whenever the source changes
     *        - When True: The TextTrack will have to be cleaned up manually
     *
     * @return {HTMLTrackElement}
     *         An Html Track Element.
     *
     * @deprecated The default functionality for this function will be equivalent
     *             to "manualCleanup=false" in the future. The manualCleanup parameter will
     *             also be removed.
     */
    ;

    _proto.addRemoteTextTrack = function addRemoteTextTrack(options, manualCleanup) {
      var _this7 = this;

      if (options === void 0) {
        options = {};
      }

      var htmlTrackElement = this.createRemoteTextTrack(options);

      if (manualCleanup !== true && manualCleanup !== false) {
        // deprecation warning
        log.warn('Calling addRemoteTextTrack without explicitly setting the "manualCleanup" parameter to `true` is deprecated and default to `false` in future version of video.js');
        manualCleanup = true;
      } // store HTMLTrackElement and TextTrack to remote list


      this.remoteTextTrackEls().addTrackElement_(htmlTrackElement);
      this.remoteTextTracks().addTrack(htmlTrackElement.track);

      if (manualCleanup !== true) {
        // create the TextTrackList if it doesn't exist
        this.ready(function () {
          return _this7.autoRemoteTextTracks_.addTrack(htmlTrackElement.track);
        });
      }

      return htmlTrackElement;
    }
    /**
     * Remove a remote text track from the remote `TextTrackList`.
     *
     * @param {TextTrack} track
     *        `TextTrack` to remove from the `TextTrackList`
     */
    ;

    _proto.removeRemoteTextTrack = function removeRemoteTextTrack(track) {
      var trackElement = this.remoteTextTrackEls().getTrackElementByTrack_(track); // remove HTMLTrackElement and TextTrack from remote list

      this.remoteTextTrackEls().removeTrackElement_(trackElement);
      this.remoteTextTracks().removeTrack(track);
      this.autoRemoteTextTracks_.removeTrack(track);
    }
    /**
     * Gets available media playback quality metrics as specified by the W3C's Media
     * Playback Quality API.
     *
     * @see [Spec]{@link https://wicg.github.io/media-playback-quality}
     *
     * @return {Object}
     *         An object with supported media playback quality metrics
     *
     * @abstract
     */
    ;

    _proto.getVideoPlaybackQuality = function getVideoPlaybackQuality() {
      return {};
    }
    /**
     * Attempt to create a floating video window always on top of other windows
     * so that users may continue consuming media while they interact with other
     * content sites, or applications on their device.
     *
     * @see [Spec]{@link https://wicg.github.io/picture-in-picture}
     *
     * @return {Promise|undefined}
     *         A promise with a Picture-in-Picture window if the browser supports
     *         Promises (or one was passed in as an option). It returns undefined
     *         otherwise.
     *
     * @abstract
     */
    ;

    _proto.requestPictureInPicture = function requestPictureInPicture() {
      var PromiseClass = this.options_.Promise || window$1.Promise;

      if (PromiseClass) {
        return PromiseClass.reject();
      }
    }
    /**
     * A method to check for the value of the 'disablePictureInPicture' <video> property.
     * Defaults to true, as it should be considered disabled if the tech does not support pip
     *
     * @abstract
     */
    ;

    _proto.disablePictureInPicture = function disablePictureInPicture() {
      return true;
    }
    /**
     * A method to set or unset the 'disablePictureInPicture' <video> property.
     *
     * @abstract
     */
    ;

    _proto.setDisablePictureInPicture = function setDisablePictureInPicture() {}
    /**
     * A method to set a poster from a `Tech`.
     *
     * @abstract
     */
    ;

    _proto.setPoster = function setPoster() {}
    /**
     * A method to check for the presence of the 'playsinline' <video> attribute.
     *
     * @abstract
     */
    ;

    _proto.playsinline = function playsinline() {}
    /**
     * A method to set or unset the 'playsinline' <video> attribute.
     *
     * @abstract
     */
    ;

    _proto.setPlaysinline = function setPlaysinline() {}
    /**
     * Attempt to force override of native audio tracks.
     *
     * @param {boolean} override - If set to true native audio will be overridden,
     * otherwise native audio will potentially be used.
     *
     * @abstract
     */
    ;

    _proto.overrideNativeAudioTracks = function overrideNativeAudioTracks() {}
    /**
     * Attempt to force override of native video tracks.
     *
     * @param {boolean} override - If set to true native video will be overridden,
     * otherwise native video will potentially be used.
     *
     * @abstract
     */
    ;

    _proto.overrideNativeVideoTracks = function overrideNativeVideoTracks() {}
    /*
     * Check if the tech can support the given mime-type.
     *
     * The base tech does not support any type, but source handlers might
     * overwrite this.
     *
     * @param  {string} type
     *         The mimetype to check for support
     *
     * @return {string}
     *         'probably', 'maybe', or empty string
     *
     * @see [Spec]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType}
     *
     * @abstract
     */
    ;

    _proto.canPlayType = function canPlayType() {
      return '';
    }
    /**
     * Check if the type is supported by this tech.
     *
     * The base tech does not support any type, but source handlers might
     * overwrite this.
     *
     * @param {string} type
     *        The media type to check
     * @return {string} Returns the native video element's response
     */
    ;

    Tech.canPlayType = function canPlayType() {
      return '';
    }
    /**
     * Check if the tech can support the given source
     *
     * @param {Object} srcObj
     *        The source object
     * @param {Object} options
     *        The options passed to the tech
     * @return {string} 'probably', 'maybe', or '' (empty string)
     */
    ;

    Tech.canPlaySource = function canPlaySource(srcObj, options) {
      return Tech.canPlayType(srcObj.type);
    }
    /*
     * Return whether the argument is a Tech or not.
     * Can be passed either a Class like `Html5` or a instance like `player.tech_`
     *
     * @param {Object} component
     *        The item to check
     *
     * @return {boolean}
     *         Whether it is a tech or not
     *         - True if it is a tech
     *         - False if it is not
     */
    ;

    Tech.isTech = function isTech(component) {
      return component.prototype instanceof Tech || component instanceof Tech || component === Tech;
    }
    /**
     * Registers a `Tech` into a shared list for videojs.
     *
     * @param {string} name
     *        Name of the `Tech` to register.
     *
     * @param {Object} tech
     *        The `Tech` class to register.
     */
    ;

    Tech.registerTech = function registerTech(name, tech) {
      if (!Tech.techs_) {
        Tech.techs_ = {};
      }

      if (!Tech.isTech(tech)) {
        throw new Error("Tech " + name + " must be a Tech");
      }

      if (!Tech.canPlayType) {
        throw new Error('Techs must have a static canPlayType method on them');
      }

      if (!Tech.canPlaySource) {
        throw new Error('Techs must have a static canPlaySource method on them');
      }

      name = toTitleCase(name);
      Tech.techs_[name] = tech;
      Tech.techs_[toLowerCase(name)] = tech;

      if (name !== 'Tech') {
        // camel case the techName for use in techOrder
        Tech.defaultTechOrder_.push(name);
      }

      return tech;
    }
    /**
     * Get a `Tech` from the shared list by name.
     *
     * @param {string} name
     *        `camelCase` or `TitleCase` name of the Tech to get
     *
     * @return {Tech|undefined}
     *         The `Tech` or undefined if there was no tech with the name requested.
     */
    ;

    Tech.getTech = function getTech(name) {
      if (!name) {
        return;
      }

      if (Tech.techs_ && Tech.techs_[name]) {
        return Tech.techs_[name];
      }

      name = toTitleCase(name);

      if (window$1 && window$1.videojs && window$1.videojs[name]) {
        log.warn("The " + name + " tech was added to the videojs object when it should be registered using videojs.registerTech(name, tech)");
        return window$1.videojs[name];
      }
    };

    return Tech;
  }(Component);
  /**
   * Get the {@link VideoTrackList}
   *
   * @returns {VideoTrackList}
   * @method Tech.prototype.videoTracks
   */

  /**
   * Get the {@link AudioTrackList}
   *
   * @returns {AudioTrackList}
   * @method Tech.prototype.audioTracks
   */

  /**
   * Get the {@link TextTrackList}
   *
   * @returns {TextTrackList}
   * @method Tech.prototype.textTracks
   */

  /**
   * Get the remote element {@link TextTrackList}
   *
   * @returns {TextTrackList}
   * @method Tech.prototype.remoteTextTracks
   */

  /**
   * Get the remote element {@link HtmlTrackElementList}
   *
   * @returns {HtmlTrackElementList}
   * @method Tech.prototype.remoteTextTrackEls
   */


  ALL.names.forEach(function (name) {
    var props = ALL[name];

    Tech.prototype[props.getterName] = function () {
      this[props.privateName] = this[props.privateName] || new props.ListClass();
      return this[props.privateName];
    };
  });
  /**
   * List of associated text tracks
   *
   * @type {TextTrackList}
   * @private
   * @property Tech#textTracks_
   */

  /**
   * List of associated audio tracks.
   *
   * @type {AudioTrackList}
   * @private
   * @property Tech#audioTracks_
   */

  /**
   * List of associated video tracks.
   *
   * @type {VideoTrackList}
   * @private
   * @property Tech#videoTracks_
   */

  /**
   * Boolean indicating whether the `Tech` supports volume control.
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresVolumeControl = true;
  /**
   * Boolean indicating whether the `Tech` supports muting volume.
   *
   * @type {bolean}
   * @default
   */

  Tech.prototype.featuresMuteControl = true;
  /**
   * Boolean indicating whether the `Tech` supports fullscreen resize control.
   * Resizing plugins using request fullscreen reloads the plugin
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresFullscreenResize = false;
  /**
   * Boolean indicating whether the `Tech` supports changing the speed at which the video
   * plays. Examples:
   *   - Set player to play 2x (twice) as fast
   *   - Set player to play 0.5x (half) as fast
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresPlaybackRate = false;
  /**
   * Boolean indicating whether the `Tech` supports the `progress` event. This is currently
   * not triggered by video-js-swf. This will be used to determine if
   * {@link Tech#manualProgressOn} should be called.
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresProgressEvents = false;
  /**
   * Boolean indicating whether the `Tech` supports the `sourceset` event.
   *
   * A tech should set this to `true` and then use {@link Tech#triggerSourceset}
   * to trigger a {@link Tech#event:sourceset} at the earliest time after getting
   * a new source.
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresSourceset = false;
  /**
   * Boolean indicating whether the `Tech` supports the `timeupdate` event. This is currently
   * not triggered by video-js-swf. This will be used to determine if
   * {@link Tech#manualTimeUpdates} should be called.
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresTimeupdateEvents = false;
  /**
   * Boolean indicating whether the `Tech` supports the native `TextTrack`s.
   * This will help us integrate with native `TextTrack`s if the browser supports them.
   *
   * @type {boolean}
   * @default
   */

  Tech.prototype.featuresNativeTextTracks = false;
  /**
   * A functional mixin for techs that want to use the Source Handler pattern.
   * Source handlers are scripts for handling specific formats.
   * The source handler pattern is used for adaptive formats (HLS, DASH) that
   * manually load video data and feed it into a Source Buffer (Media Source Extensions)
   * Example: `Tech.withSourceHandlers.call(MyTech);`
   *
   * @param {Tech} _Tech
   *        The tech to add source handler functions to.
   *
   * @mixes Tech~SourceHandlerAdditions
   */

  Tech.withSourceHandlers = function (_Tech) {
    /**
     * Register a source handler
     *
     * @param {Function} handler
     *        The source handler class
     *
     * @param {number} [index]
     *        Register it at the following index
     */
    _Tech.registerSourceHandler = function (handler, index) {
      var handlers = _Tech.sourceHandlers;

      if (!handlers) {
        handlers = _Tech.sourceHandlers = [];
      }

      if (index === undefined) {
        // add to the end of the list
        index = handlers.length;
      }

      handlers.splice(index, 0, handler);
    };
    /**
     * Check if the tech can support the given type. Also checks the
     * Techs sourceHandlers.
     *
     * @param {string} type
     *         The mimetype to check.
     *
     * @return {string}
     *         'probably', 'maybe', or '' (empty string)
     */


    _Tech.canPlayType = function (type) {
      var handlers = _Tech.sourceHandlers || [];
      var can;

      for (var i = 0; i < handlers.length; i++) {
        can = handlers[i].canPlayType(type);

        if (can) {
          return can;
        }
      }

      return '';
    };
    /**
     * Returns the first source handler that supports the source.
     *
     * TODO: Answer question: should 'probably' be prioritized over 'maybe'
     *
     * @param {Tech~SourceObject} source
     *        The source object
     *
     * @param {Object} options
     *        The options passed to the tech
     *
     * @return {SourceHandler|null}
     *          The first source handler that supports the source or null if
     *          no SourceHandler supports the source
     */


    _Tech.selectSourceHandler = function (source, options) {
      var handlers = _Tech.sourceHandlers || [];
      var can;

      for (var i = 0; i < handlers.length; i++) {
        can = handlers[i].canHandleSource(source, options);

        if (can) {
          return handlers[i];
        }
      }

      return null;
    };
    /**
     * Check if the tech can support the given source.
     *
     * @param {Tech~SourceObject} srcObj
     *        The source object
     *
     * @param {Object} options
     *        The options passed to the tech
     *
     * @return {string}
     *         'probably', 'maybe', or '' (empty string)
     */


    _Tech.canPlaySource = function (srcObj, options) {
      var sh = _Tech.selectSourceHandler(srcObj, options);

      if (sh) {
        return sh.canHandleSource(srcObj, options);
      }

      return '';
    };
    /**
     * When using a source handler, prefer its implementation of
     * any function normally provided by the tech.
     */


    var deferrable = ['seekable', 'seeking', 'duration'];
    /**
     * A wrapper around {@link Tech#seekable} that will call a `SourceHandler`s seekable
     * function if it exists, with a fallback to the Techs seekable function.
     *
     * @method _Tech.seekable
     */

    /**
     * A wrapper around {@link Tech#duration} that will call a `SourceHandler`s duration
     * function if it exists, otherwise it will fallback to the techs duration function.
     *
     * @method _Tech.duration
     */

    deferrable.forEach(function (fnName) {
      var originalFn = this[fnName];

      if (typeof originalFn !== 'function') {
        return;
      }

      this[fnName] = function () {
        if (this.sourceHandler_ && this.sourceHandler_[fnName]) {
          return this.sourceHandler_[fnName].apply(this.sourceHandler_, arguments);
        }

        return originalFn.apply(this, arguments);
      };
    }, _Tech.prototype);
    /**
     * Create a function for setting the source using a source object
     * and source handlers.
     * Should never be called unless a source handler was found.
     *
     * @param {Tech~SourceObject} source
     *        A source object with src and type keys
     */

    _Tech.prototype.setSource = function (source) {
      var sh = _Tech.selectSourceHandler(source, this.options_);

      if (!sh) {
        // Fall back to a native source hander when unsupported sources are
        // deliberately set
        if (_Tech.nativeSourceHandler) {
          sh = _Tech.nativeSourceHandler;
        } else {
          log.error('No source handler found for the current source.');
        }
      } // Dispose any existing source handler


      this.disposeSourceHandler();
      this.off('dispose', this.disposeSourceHandler);

      if (sh !== _Tech.nativeSourceHandler) {
        this.currentSource_ = source;
      }

      this.sourceHandler_ = sh.handleSource(source, this, this.options_);
      this.one('dispose', this.disposeSourceHandler);
    };
    /**
     * Clean up any existing SourceHandlers and listeners when the Tech is disposed.
     *
     * @listens Tech#dispose
     */


    _Tech.prototype.disposeSourceHandler = function () {
      // if we have a source and get another one
      // then we are loading something new
      // than clear all of our current tracks
      if (this.currentSource_) {
        this.clearTracks(['audio', 'video']);
        this.currentSource_ = null;
      } // always clean up auto-text tracks


      this.cleanupAutoTextTracks();

      if (this.sourceHandler_) {
        if (this.sourceHandler_.dispose) {
          this.sourceHandler_.dispose();
        }

        this.sourceHandler_ = null;
      }
    };
  }; // The base Tech class needs to be registered as a Component. It is the only
  // Tech that can be registered as a Component.


  Component.registerComponent('Tech', Tech);
  Tech.registerTech('Tech', Tech);
  /**
   * A list of techs that should be added to techOrder on Players
   *
   * @private
   */

  Tech.defaultTechOrder_ = [];

  /**
   * @file middleware.js
   * @module middleware
   */
  var middlewares = {};
  var middlewareInstances = {};
  var TERMINATOR = {};
  /**
   * A middleware object is a plain JavaScript object that has methods that
   * match the {@link Tech} methods found in the lists of allowed
   * {@link module:middleware.allowedGetters|getters},
   * {@link module:middleware.allowedSetters|setters}, and
   * {@link module:middleware.allowedMediators|mediators}.
   *
   * @typedef {Object} MiddlewareObject
   */

  /**
   * A middleware factory function that should return a
   * {@link module:middleware~MiddlewareObject|MiddlewareObject}.
   *
   * This factory will be called for each player when needed, with the player
   * passed in as an argument.
   *
   * @callback MiddlewareFactory
   * @param {Player} player
   *        A Video.js player.
   */

  /**
   * Define a middleware that the player should use by way of a factory function
   * that returns a middleware object.
   *
   * @param  {string} type
   *         The MIME type to match or `"*"` for all MIME types.
   *
   * @param  {MiddlewareFactory} middleware
   *         A middleware factory function that will be executed for
   *         matching types.
   */

  function use(type, middleware) {
    middlewares[type] = middlewares[type] || [];
    middlewares[type].push(middleware);
  }
  /**
   * Asynchronously sets a source using middleware by recursing through any
   * matching middlewares and calling `setSource` on each, passing along the
   * previous returned value each time.
   *
   * @param  {Player} player
   *         A {@link Player} instance.
   *
   * @param  {Tech~SourceObject} src
   *         A source object.
   *
   * @param  {Function}
   *         The next middleware to run.
   */

  function setSource(player, src, next) {
    player.setTimeout(function () {
      return setSourceHelper(src, middlewares[src.type], next, player);
    }, 1);
  }
  /**
   * When the tech is set, passes the tech to each middleware's `setTech` method.
   *
   * @param {Object[]} middleware
   *        An array of middleware instances.
   *
   * @param {Tech} tech
   *        A Video.js tech.
   */

  function setTech(middleware, tech) {
    middleware.forEach(function (mw) {
      return mw.setTech && mw.setTech(tech);
    });
  }
  /**
   * Calls a getter on the tech first, through each middleware
   * from right to left to the player.
   *
   * @param  {Object[]} middleware
   *         An array of middleware instances.
   *
   * @param  {Tech} tech
   *         The current tech.
   *
   * @param  {string} method
   *         A method name.
   *
   * @return {Mixed}
   *         The final value from the tech after middleware has intercepted it.
   */

  function get(middleware, tech, method) {
    return middleware.reduceRight(middlewareIterator(method), tech[method]());
  }
  /**
   * Takes the argument given to the player and calls the setter method on each
   * middleware from left to right to the tech.
   *
   * @param  {Object[]} middleware
   *         An array of middleware instances.
   *
   * @param  {Tech} tech
   *         The current tech.
   *
   * @param  {string} method
   *         A method name.
   *
   * @param  {Mixed} arg
   *         The value to set on the tech.
   *
   * @return {Mixed}
   *         The return value of the `method` of the `tech`.
   */

  function set(middleware, tech, method, arg) {
    return tech[method](middleware.reduce(middlewareIterator(method), arg));
  }
  /**
   * Takes the argument given to the player and calls the `call` version of the
   * method on each middleware from left to right.
   *
   * Then, call the passed in method on the tech and return the result unchanged
   * back to the player, through middleware, this time from right to left.
   *
   * @param  {Object[]} middleware
   *         An array of middleware instances.
   *
   * @param  {Tech} tech
   *         The current tech.
   *
   * @param  {string} method
   *         A method name.
   *
   * @param  {Mixed} arg
   *         The value to set on the tech.
   *
   * @return {Mixed}
   *         The return value of the `method` of the `tech`, regardless of the
   *         return values of middlewares.
   */

  function mediate(middleware, tech, method, arg) {
    if (arg === void 0) {
      arg = null;
    }

    var callMethod = 'call' + toTitleCase(method);
    var middlewareValue = middleware.reduce(middlewareIterator(callMethod), arg);
    var terminated = middlewareValue === TERMINATOR; // deprecated. The `null` return value should instead return TERMINATOR to
    // prevent confusion if a techs method actually returns null.

    var returnValue = terminated ? null : tech[method](middlewareValue);
    executeRight(middleware, method, returnValue, terminated);
    return returnValue;
  }
  /**
   * Enumeration of allowed getters where the keys are method names.
   *
   * @type {Object}
   */

  var allowedGetters = {
    buffered: 1,
    currentTime: 1,
    duration: 1,
    muted: 1,
    played: 1,
    paused: 1,
    seekable: 1,
    volume: 1
  };
  /**
   * Enumeration of allowed setters where the keys are method names.
   *
   * @type {Object}
   */

  var allowedSetters = {
    setCurrentTime: 1,
    setMuted: 1,
    setVolume: 1
  };
  /**
   * Enumeration of allowed mediators where the keys are method names.
   *
   * @type {Object}
   */

  var allowedMediators = {
    play: 1,
    pause: 1
  };

  function middlewareIterator(method) {
    return function (value, mw) {
      // if the previous middleware terminated, pass along the termination
      if (value === TERMINATOR) {
        return TERMINATOR;
      }

      if (mw[method]) {
        return mw[method](value);
      }

      return value;
    };
  }

  function executeRight(mws, method, value, terminated) {
    for (var i = mws.length - 1; i >= 0; i--) {
      var mw = mws[i];

      if (mw[method]) {
        mw[method](terminated, value);
      }
    }
  }
  /**
   * Clear the middleware cache for a player.
   *
   * @param  {Player} player
   *         A {@link Player} instance.
   */


  function clearCacheForPlayer(player) {
    middlewareInstances[player.id()] = null;
  }
  /**
   * {
   *  [playerId]: [[mwFactory, mwInstance], ...]
   * }
   *
   * @private
   */

  function getOrCreateFactory(player, mwFactory) {
    var mws = middlewareInstances[player.id()];
    var mw = null;

    if (mws === undefined || mws === null) {
      mw = mwFactory(player);
      middlewareInstances[player.id()] = [[mwFactory, mw]];
      return mw;
    }

    for (var i = 0; i < mws.length; i++) {
      var _mws$i = mws[i],
          mwf = _mws$i[0],
          mwi = _mws$i[1];

      if (mwf !== mwFactory) {
        continue;
      }

      mw = mwi;
    }

    if (mw === null) {
      mw = mwFactory(player);
      mws.push([mwFactory, mw]);
    }

    return mw;
  }

  function setSourceHelper(src, middleware, next, player, acc, lastRun) {
    if (src === void 0) {
      src = {};
    }

    if (middleware === void 0) {
      middleware = [];
    }

    if (acc === void 0) {
      acc = [];
    }

    if (lastRun === void 0) {
      lastRun = false;
    }

    var _middleware = middleware,
        mwFactory = _middleware[0],
        mwrest = _middleware.slice(1); // if mwFactory is a string, then we're at a fork in the road


    if (typeof mwFactory === 'string') {
      setSourceHelper(src, middlewares[mwFactory], next, player, acc, lastRun); // if we have an mwFactory, call it with the player to get the mw,
      // then call the mw's setSource method
    } else if (mwFactory) {
      var mw = getOrCreateFactory(player, mwFactory); // if setSource isn't present, implicitly select this middleware

      if (!mw.setSource) {
        acc.push(mw);
        return setSourceHelper(src, mwrest, next, player, acc, lastRun);
      }

      mw.setSource(assign({}, src), function (err, _src) {
        // something happened, try the next middleware on the current level
        // make sure to use the old src
        if (err) {
          return setSourceHelper(src, mwrest, next, player, acc, lastRun);
        } // we've succeeded, now we need to go deeper


        acc.push(mw); // if it's the same type, continue down the current chain
        // otherwise, we want to go down the new chain

        setSourceHelper(_src, src.type === _src.type ? mwrest : middlewares[_src.type], next, player, acc, lastRun);
      });
    } else if (mwrest.length) {
      setSourceHelper(src, mwrest, next, player, acc, lastRun);
    } else if (lastRun) {
      next(src, acc);
    } else {
      setSourceHelper(src, middlewares['*'], next, player, acc, true);
    }
  }

  /**
   * Mimetypes
   *
   * @see http://hul.harvard.edu/ois/////systems/wax/wax-public-help/mimetypes.htm
   * @typedef Mimetypes~Kind
   * @enum
   */

  var MimetypesKind = {
    opus: 'video/ogg',
    ogv: 'video/ogg',
    mp4: 'video/mp4',
    mov: 'video/mp4',
    m4v: 'video/mp4',
    mkv: 'video/x-matroska',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',
    caf: 'audio/x-caf',
    flac: 'audio/flac',
    oga: 'audio/ogg',
    wav: 'audio/wav',
    m3u8: 'application/x-mpegURL',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    png: 'image/png',
    svg: 'image/svg+xml',
    webp: 'image/webp'
  };
  /**
   * Get the mimetype of a given src url if possible
   *
   * @param {string} src
   *        The url to the src
   *
   * @return {string}
   *         return the mimetype if it was known or empty string otherwise
   */

  var getMimetype = function getMimetype(src) {
    if (src === void 0) {
      src = '';
    }

    var ext = getFileExtension(src);
    var mimetype = MimetypesKind[ext.toLowerCase()];
    return mimetype || '';
  };
  /**
   * Find the mime type of a given source string if possible. Uses the player
   * source cache.
   *
   * @param {Player} player
   *        The player object
   *
   * @param {string} src
   *        The source string
   *
   * @return {string}
   *         The type that was found
   */

  var findMimetype = function findMimetype(player, src) {
    if (!src) {
      return '';
    } // 1. check for the type in the `source` cache


    if (player.cache_.source.src === src && player.cache_.source.type) {
      return player.cache_.source.type;
    } // 2. see if we have this source in our `currentSources` cache


    var matchingSources = player.cache_.sources.filter(function (s) {
      return s.src === src;
    });

    if (matchingSources.length) {
      return matchingSources[0].type;
    } // 3. look for the src url in source elements and use the type there


    var sources = player.$$('source');

    for (var i = 0; i < sources.length; i++) {
      var s = sources[i];

      if (s.type && s.src && s.src === src) {
        return s.type;
      }
    } // 4. finally fallback to our list of mime types based on src url extension


    return getMimetype(src);
  };

  /**
   * @module filter-source
   */
  /**
   * Filter out single bad source objects or multiple source objects in an
   * array. Also flattens nested source object arrays into a 1 dimensional
   * array of source objects.
   *
   * @param {Tech~SourceObject|Tech~SourceObject[]} src
   *        The src object to filter
   *
   * @return {Tech~SourceObject[]}
   *         An array of sourceobjects containing only valid sources
   *
   * @private
   */

  var filterSource = function filterSource(src) {
    // traverse array
    if (Array.isArray(src)) {
      var newsrc = [];
      src.forEach(function (srcobj) {
        srcobj = filterSource(srcobj);

        if (Array.isArray(srcobj)) {
          newsrc = newsrc.concat(srcobj);
        } else if (isObject(srcobj)) {
          newsrc.push(srcobj);
        }
      });
      src = newsrc;
    } else if (typeof src === 'string' && src.trim()) {
      // convert string into object
      src = [fixSource({
        src: src
      })];
    } else if (isObject(src) && typeof src.src === 'string' && src.src && src.src.trim()) {
      // src is already valid
      src = [fixSource(src)];
    } else {
      // invalid source, turn it into an empty array
      src = [];
    }

    return src;
  };
  /**
   * Checks src mimetype, adding it when possible
   *
   * @param {Tech~SourceObject} src
   *        The src object to check
   * @return {Tech~SourceObject}
   *        src Object with known type
   */


  function fixSource(src) {
    if (!src.type) {
      var mimetype = getMimetype(src.src);

      if (mimetype) {
        src.type = mimetype;
      }
    }

    return src;
  }

  /**
   * The `MediaLoader` is the `Component` that decides which playback technology to load
   * when a player is initialized.
   *
   * @extends Component
   */

  var MediaLoader = /*#__PURE__*/function (_Component) {
    inheritsLoose(MediaLoader, _Component);

    /**
     * Create an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should attach to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function that is run when this component is ready.
     */
    function MediaLoader(player, options, ready) {
      var _this;

      // MediaLoader has no element
      var options_ = mergeOptions({
        createEl: false
      }, options);
      _this = _Component.call(this, player, options_, ready) || this; // If there are no sources when the player is initialized,
      // load the first supported playback technology.

      if (!options.playerOptions.sources || options.playerOptions.sources.length === 0) {
        for (var i = 0, j = options.playerOptions.techOrder; i < j.length; i++) {
          var techName = toTitleCase(j[i]);
          var tech = Tech.getTech(techName); // Support old behavior of techs being registered as components.
          // Remove once that deprecated behavior is removed.

          if (!techName) {
            tech = Component.getComponent(techName);
          } // Check if the browser supports this technology


          if (tech && tech.isSupported()) {
            player.loadTech_(techName);
            break;
          }
        }
      } else {
        // Loop through playback technologies (HTML5, Flash) and check for support.
        // Then load the best source.
        // A few assumptions here:
        //   All playback technologies respect preload false.
        player.src(options.playerOptions.sources);
      }

      return _this;
    }

    return MediaLoader;
  }(Component);

  Component.registerComponent('MediaLoader', MediaLoader);

  /**
   * Component which is clickable or keyboard actionable, but is not a
   * native HTML button.
   *
   * @extends Component
   */

  var ClickableComponent = /*#__PURE__*/function (_Component) {
    inheritsLoose(ClickableComponent, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param  {Player} player
     *         The `Player` that this class should be attached to.
     *
     * @param  {Object} [options]
     *         The key/value store of player options.
     *
     * @param  {function} [options.clickHandler]
     *         The function to call when the button is clicked / activated
     */
    function ClickableComponent(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;

      _this.emitTapEvents();

      _this.enable();

      return _this;
    }
    /**
     * Create the `ClickableComponent`s DOM element.
     *
     * @param {string} [tag=div]
     *        The element's node type.
     *
     * @param {Object} [props={}]
     *        An object of properties that should be set on the element.
     *
     * @param {Object} [attributes={}]
     *        An object of attributes that should be set on the element.
     *
     * @return {Element}
     *         The element that gets created.
     */


    var _proto = ClickableComponent.prototype;

    _proto.createEl = function createEl(tag, props, attributes) {
      if (tag === void 0) {
        tag = 'div';
      }

      if (props === void 0) {
        props = {};
      }

      if (attributes === void 0) {
        attributes = {};
      }

      props = assign({
        innerHTML: '<span aria-hidden="true" class="vjs-icon-placeholder"></span>',
        className: this.buildCSSClass(),
        tabIndex: 0
      }, props);

      if (tag === 'button') {
        log.error("Creating a ClickableComponent with an HTML element of " + tag + " is not supported; use a Button instead.");
      } // Add ARIA attributes for clickable element which is not a native HTML button


      attributes = assign({
        role: 'button'
      }, attributes);
      this.tabIndex_ = props.tabIndex;

      var el = _Component.prototype.createEl.call(this, tag, props, attributes);

      this.createControlTextEl(el);
      return el;
    };

    _proto.dispose = function dispose() {
      // remove controlTextEl_ on dispose
      this.controlTextEl_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Create a control text element on this `ClickableComponent`
     *
     * @param {Element} [el]
     *        Parent element for the control text.
     *
     * @return {Element}
     *         The control text element that gets created.
     */
    ;

    _proto.createControlTextEl = function createControlTextEl(el) {
      this.controlTextEl_ = createEl('span', {
        className: 'vjs-control-text'
      }, {
        // let the screen reader user know that the text of the element may change
        'aria-live': 'polite'
      });

      if (el) {
        el.appendChild(this.controlTextEl_);
      }

      this.controlText(this.controlText_, el);
      return this.controlTextEl_;
    }
    /**
     * Get or set the localize text to use for the controls on the `ClickableComponent`.
     *
     * @param {string} [text]
     *        Control text for element.
     *
     * @param {Element} [el=this.el()]
     *        Element to set the title on.
     *
     * @return {string}
     *         - The control text when getting
     */
    ;

    _proto.controlText = function controlText(text, el) {
      if (el === void 0) {
        el = this.el();
      }

      if (text === undefined) {
        return this.controlText_ || 'Need Text';
      }

      var localizedText = this.localize(text);
      this.controlText_ = text;
      textContent(this.controlTextEl_, localizedText);

      if (!this.nonIconControl) {
        // Set title attribute if only an icon is shown
        el.setAttribute('title', localizedText);
      }
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-control vjs-button " + _Component.prototype.buildCSSClass.call(this);
    }
    /**
     * Enable this `ClickableComponent`
     */
    ;

    _proto.enable = function enable() {
      if (!this.enabled_) {
        this.enabled_ = true;
        this.removeClass('vjs-disabled');
        this.el_.setAttribute('aria-disabled', 'false');

        if (typeof this.tabIndex_ !== 'undefined') {
          this.el_.setAttribute('tabIndex', this.tabIndex_);
        }

        this.on(['tap', 'click'], this.handleClick);
        this.on('keydown', this.handleKeyDown);
      }
    }
    /**
     * Disable this `ClickableComponent`
     */
    ;

    _proto.disable = function disable() {
      this.enabled_ = false;
      this.addClass('vjs-disabled');
      this.el_.setAttribute('aria-disabled', 'true');

      if (typeof this.tabIndex_ !== 'undefined') {
        this.el_.removeAttribute('tabIndex');
      }

      this.off('mouseover', this.handleMouseOver);
      this.off('mouseout', this.handleMouseOut);
      this.off(['tap', 'click'], this.handleClick);
      this.off('keydown', this.handleKeyDown);
    }
    /**
     * Event handler that is called when a `ClickableComponent` receives a
     * `click` or `tap` event.
     *
     * @param {EventTarget~Event} event
     *        The `tap` or `click` event that caused this function to be called.
     *
     * @listens tap
     * @listens click
     * @abstract
     */
    ;

    _proto.handleClick = function handleClick(event) {
      if (this.options_.clickHandler) {
        this.options_.clickHandler.call(this, arguments);
      }
    }
    /**
     * Event handler that is called when a `ClickableComponent` receives a
     * `keydown` event.
     *
     * By default, if the key is Space or Enter, it will trigger a `click` event.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Support Space or Enter key operation to fire a click event. Also,
      // prevent the event from propagating through the DOM and triggering
      // Player hotkeys.
      if (keycode.isEventKey(event, 'Space') || keycode.isEventKey(event, 'Enter')) {
        event.preventDefault();
        event.stopPropagation();
        this.trigger('click');
      } else {
        // Pass keypress handling up for unsupported keys
        _Component.prototype.handleKeyDown.call(this, event);
      }
    };

    return ClickableComponent;
  }(Component);

  Component.registerComponent('ClickableComponent', ClickableComponent);

  /**
   * A `ClickableComponent` that handles showing the poster image for the player.
   *
   * @extends ClickableComponent
   */

  var PosterImage = /*#__PURE__*/function (_ClickableComponent) {
    inheritsLoose(PosterImage, _ClickableComponent);

    /**
     * Create an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should attach to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function PosterImage(player, options) {
      var _this;

      _this = _ClickableComponent.call(this, player, options) || this;

      _this.update();

      player.on('posterchange', bind(assertThisInitialized(_this), _this.update));
      return _this;
    }
    /**
     * Clean up and dispose of the `PosterImage`.
     */


    var _proto = PosterImage.prototype;

    _proto.dispose = function dispose() {
      this.player().off('posterchange', this.update);

      _ClickableComponent.prototype.dispose.call(this);
    }
    /**
     * Create the `PosterImage`s DOM element.
     *
     * @return {Element}
     *         The element that gets created.
     */
    ;

    _proto.createEl = function createEl$1() {
      var el = createEl('div', {
        className: 'vjs-poster',
        // Don't want poster to be tabbable.
        tabIndex: -1
      });
      return el;
    }
    /**
     * An {@link EventTarget~EventListener} for {@link Player#posterchange} events.
     *
     * @listens Player#posterchange
     *
     * @param {EventTarget~Event} [event]
     *        The `Player#posterchange` event that triggered this function.
     */
    ;

    _proto.update = function update(event) {
      var url = this.player().poster();
      this.setSrc(url); // If there's no poster source we should display:none on this component
      // so it's not still clickable or right-clickable

      if (url) {
        this.show();
      } else {
        this.hide();
      }
    }
    /**
     * Set the source of the `PosterImage` depending on the display method.
     *
     * @param {string} url
     *        The URL to the source for the `PosterImage`.
     */
    ;

    _proto.setSrc = function setSrc(url) {
      var backgroundImage = ''; // Any falsy value should stay as an empty string, otherwise
      // this will throw an extra error

      if (url) {
        backgroundImage = "url(\"" + url + "\")";
      }

      this.el_.style.backgroundImage = backgroundImage;
    }
    /**
     * An {@link EventTarget~EventListener} for clicks on the `PosterImage`. See
     * {@link ClickableComponent#handleClick} for instances where this will be triggered.
     *
     * @listens tap
     * @listens click
     * @listens keydown
     *
     * @param {EventTarget~Event} event
     +        The `click`, `tap` or `keydown` event that caused this function to be called.
     */
    ;

    _proto.handleClick = function handleClick(event) {
      // We don't want a click to trigger playback when controls are disabled
      if (!this.player_.controls()) {
        return;
      }

      var sourceIsEncrypted = this.player_.usingPlugin('eme') && this.player_.eme.sessions && this.player_.eme.sessions.length > 0;

      if (this.player_.tech(true) && // We've observed a bug in IE and Edge when playing back DRM content where
      // calling .focus() on the video element causes the video to go black,
      // so we avoid it in that specific case
      !((IE_VERSION || IS_EDGE) && sourceIsEncrypted)) {
        this.player_.tech(true).focus();
      }

      if (this.player_.paused()) {
        silencePromise(this.player_.play());
      } else {
        this.player_.pause();
      }
    };

    return PosterImage;
  }(ClickableComponent);

  Component.registerComponent('PosterImage', PosterImage);

  var darkGray = '#222';
  var lightGray = '#ccc';
  var fontMap = {
    monospace: 'monospace',
    sansSerif: 'sans-serif',
    serif: 'serif',
    monospaceSansSerif: '"Andale Mono", "Lucida Console", monospace',
    monospaceSerif: '"Courier New", monospace',
    proportionalSansSerif: 'sans-serif',
    proportionalSerif: 'serif',
    casual: '"Comic Sans MS", Impact, fantasy',
    script: '"Monotype Corsiva", cursive',
    smallcaps: '"Andale Mono", "Lucida Console", monospace, sans-serif'
  };
  /**
   * Construct an rgba color from a given hex color code.
   *
   * @param {number} color
   *        Hex number for color, like #f0e or #f604e2.
   *
   * @param {number} opacity
   *        Value for opacity, 0.0 - 1.0.
   *
   * @return {string}
   *         The rgba color that was created, like 'rgba(255, 0, 0, 0.3)'.
   */

  function constructColor(color, opacity) {
    var hex;

    if (color.length === 4) {
      // color looks like "#f0e"
      hex = color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    } else if (color.length === 7) {
      // color looks like "#f604e2"
      hex = color.slice(1);
    } else {
      throw new Error('Invalid color code provided, ' + color + '; must be formatted as e.g. #f0e or #f604e2.');
    }

    return 'rgba(' + parseInt(hex.slice(0, 2), 16) + ',' + parseInt(hex.slice(2, 4), 16) + ',' + parseInt(hex.slice(4, 6), 16) + ',' + opacity + ')';
  }
  /**
   * Try to update the style of a DOM element. Some style changes will throw an error,
   * particularly in IE8. Those should be noops.
   *
   * @param {Element} el
   *        The DOM element to be styled.
   *
   * @param {string} style
   *        The CSS property on the element that should be styled.
   *
   * @param {string} rule
   *        The style rule that should be applied to the property.
   *
   * @private
   */

  function tryUpdateStyle(el, style, rule) {
    try {
      el.style[style] = rule;
    } catch (e) {
      // Satisfies linter.
      return;
    }
  }
  /**
   * The component for displaying text track cues.
   *
   * @extends Component
   */


  var TextTrackDisplay = /*#__PURE__*/function (_Component) {
    inheritsLoose(TextTrackDisplay, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function to call when `TextTrackDisplay` is ready.
     */
    function TextTrackDisplay(player, options, ready) {
      var _this;

      _this = _Component.call(this, player, options, ready) || this;
      var updateDisplayHandler = bind(assertThisInitialized(_this), _this.updateDisplay);
      player.on('loadstart', bind(assertThisInitialized(_this), _this.toggleDisplay));
      player.on('texttrackchange', updateDisplayHandler);
      player.on('loadedmetadata', bind(assertThisInitialized(_this), _this.preselectTrack)); // This used to be called during player init, but was causing an error
      // if a track should show by default and the display hadn't loaded yet.
      // Should probably be moved to an external track loader when we support
      // tracks that don't need a display.

      player.ready(bind(assertThisInitialized(_this), function () {
        if (player.tech_ && player.tech_.featuresNativeTextTracks) {
          this.hide();
          return;
        }

        player.on('fullscreenchange', updateDisplayHandler);
        player.on('playerresize', updateDisplayHandler);
        window$1.addEventListener('orientationchange', updateDisplayHandler);
        player.on('dispose', function () {
          return window$1.removeEventListener('orientationchange', updateDisplayHandler);
        });
        var tracks = this.options_.playerOptions.tracks || [];

        for (var i = 0; i < tracks.length; i++) {
          this.player_.addRemoteTextTrack(tracks[i], true);
        }

        this.preselectTrack();
      }));
      return _this;
    }
    /**
    * Preselect a track following this precedence:
    * - matches the previously selected {@link TextTrack}'s language and kind
    * - matches the previously selected {@link TextTrack}'s language only
    * - is the first default captions track
    * - is the first default descriptions track
    *
    * @listens Player#loadstart
    */


    var _proto = TextTrackDisplay.prototype;

    _proto.preselectTrack = function preselectTrack() {
      var modes = {
        captions: 1,
        subtitles: 1
      };
      var trackList = this.player_.textTracks();
      var userPref = this.player_.cache_.selectedLanguage;
      var firstDesc;
      var firstCaptions;
      var preferredTrack;

      for (var i = 0; i < trackList.length; i++) {
        var track = trackList[i];

        if (userPref && userPref.enabled && userPref.language && userPref.language === track.language && track.kind in modes) {
          // Always choose the track that matches both language and kind
          if (track.kind === userPref.kind) {
            preferredTrack = track; // or choose the first track that matches language
          } else if (!preferredTrack) {
            preferredTrack = track;
          } // clear everything if offTextTrackMenuItem was clicked

        } else if (userPref && !userPref.enabled) {
          preferredTrack = null;
          firstDesc = null;
          firstCaptions = null;
        } else if (track["default"]) {
          if (track.kind === 'descriptions' && !firstDesc) {
            firstDesc = track;
          } else if (track.kind in modes && !firstCaptions) {
            firstCaptions = track;
          }
        }
      } // The preferredTrack matches the user preference and takes
      // precedence over all the other tracks.
      // So, display the preferredTrack before the first default track
      // and the subtitles/captions track before the descriptions track


      if (preferredTrack) {
        preferredTrack.mode = 'showing';
      } else if (firstCaptions) {
        firstCaptions.mode = 'showing';
      } else if (firstDesc) {
        firstDesc.mode = 'showing';
      }
    }
    /**
     * Turn display of {@link TextTrack}'s from the current state into the other state.
     * There are only two states:
     * - 'shown'
     * - 'hidden'
     *
     * @listens Player#loadstart
     */
    ;

    _proto.toggleDisplay = function toggleDisplay() {
      if (this.player_.tech_ && this.player_.tech_.featuresNativeTextTracks) {
        this.hide();
      } else {
        this.show();
      }
    }
    /**
     * Create the {@link Component}'s DOM element.
     *
     * @return {Element}
     *         The element that was created.
     */
    ;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-text-track-display'
      }, {
        'aria-live': 'off',
        'aria-atomic': 'true'
      });
    }
    /**
     * Clear all displayed {@link TextTrack}s.
     */
    ;

    _proto.clearDisplay = function clearDisplay() {
      if (typeof window$1.WebVTT === 'function') {
        window$1.WebVTT.processCues(window$1, [], this.el_);
      }
    }
    /**
     * Update the displayed TextTrack when a either a {@link Player#texttrackchange} or
     * a {@link Player#fullscreenchange} is fired.
     *
     * @listens Player#texttrackchange
     * @listens Player#fullscreenchange
     */
    ;

    _proto.updateDisplay = function updateDisplay() {
      var tracks = this.player_.textTracks();
      var allowMultipleShowingTracks = this.options_.allowMultipleShowingTracks;
      this.clearDisplay();

      if (allowMultipleShowingTracks) {
        var showingTracks = [];

        for (var _i = 0; _i < tracks.length; ++_i) {
          var track = tracks[_i];

          if (track.mode !== 'showing') {
            continue;
          }

          showingTracks.push(track);
        }

        this.updateForTrack(showingTracks);
        return;
      } //  Track display prioritization model: if multiple tracks are 'showing',
      //  display the first 'subtitles' or 'captions' track which is 'showing',
      //  otherwise display the first 'descriptions' track which is 'showing'


      var descriptionsTrack = null;
      var captionsSubtitlesTrack = null;
      var i = tracks.length;

      while (i--) {
        var _track = tracks[i];

        if (_track.mode === 'showing') {
          if (_track.kind === 'descriptions') {
            descriptionsTrack = _track;
          } else {
            captionsSubtitlesTrack = _track;
          }
        }
      }

      if (captionsSubtitlesTrack) {
        if (this.getAttribute('aria-live') !== 'off') {
          this.setAttribute('aria-live', 'off');
        }

        this.updateForTrack(captionsSubtitlesTrack);
      } else if (descriptionsTrack) {
        if (this.getAttribute('aria-live') !== 'assertive') {
          this.setAttribute('aria-live', 'assertive');
        }

        this.updateForTrack(descriptionsTrack);
      }
    }
    /**
     * Style {@Link TextTrack} activeCues according to {@Link TextTrackSettings}.
     *
     * @param {TextTrack} track
     *        Text track object containing active cues to style.
     */
    ;

    _proto.updateDisplayState = function updateDisplayState(track) {
      var overrides = this.player_.textTrackSettings.getValues();
      var cues = track.activeCues;
      var i = cues.length;

      while (i--) {
        var cue = cues[i];

        if (!cue) {
          continue;
        }

        var cueDiv = cue.displayState;

        if (overrides.color) {
          cueDiv.firstChild.style.color = overrides.color;
        }

        if (overrides.textOpacity) {
          tryUpdateStyle(cueDiv.firstChild, 'color', constructColor(overrides.color || '#fff', overrides.textOpacity));
        }

        if (overrides.backgroundColor) {
          cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
        }

        if (overrides.backgroundOpacity) {
          tryUpdateStyle(cueDiv.firstChild, 'backgroundColor', constructColor(overrides.backgroundColor || '#000', overrides.backgroundOpacity));
        }

        if (overrides.windowColor) {
          if (overrides.windowOpacity) {
            tryUpdateStyle(cueDiv, 'backgroundColor', constructColor(overrides.windowColor, overrides.windowOpacity));
          } else {
            cueDiv.style.backgroundColor = overrides.windowColor;
          }
        }

        if (overrides.edgeStyle) {
          if (overrides.edgeStyle === 'dropshadow') {
            cueDiv.firstChild.style.textShadow = "2px 2px 3px " + darkGray + ", 2px 2px 4px " + darkGray + ", 2px 2px 5px " + darkGray;
          } else if (overrides.edgeStyle === 'raised') {
            cueDiv.firstChild.style.textShadow = "1px 1px " + darkGray + ", 2px 2px " + darkGray + ", 3px 3px " + darkGray;
          } else if (overrides.edgeStyle === 'depressed') {
            cueDiv.firstChild.style.textShadow = "1px 1px " + lightGray + ", 0 1px " + lightGray + ", -1px -1px " + darkGray + ", 0 -1px " + darkGray;
          } else if (overrides.edgeStyle === 'uniform') {
            cueDiv.firstChild.style.textShadow = "0 0 4px " + darkGray + ", 0 0 4px " + darkGray + ", 0 0 4px " + darkGray + ", 0 0 4px " + darkGray;
          }
        }

        if (overrides.fontPercent && overrides.fontPercent !== 1) {
          var fontSize = window$1.parseFloat(cueDiv.style.fontSize);
          cueDiv.style.fontSize = fontSize * overrides.fontPercent + 'px';
          cueDiv.style.height = 'auto';
          cueDiv.style.top = 'auto';
        }

        if (overrides.fontFamily && overrides.fontFamily !== 'default') {
          if (overrides.fontFamily === 'small-caps') {
            cueDiv.firstChild.style.fontVariant = 'small-caps';
          } else {
            cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily];
          }
        }
      }
    }
    /**
     * Add an {@link TextTrack} to to the {@link Tech}s {@link TextTrackList}.
     *
     * @param {TextTrack|TextTrack[]} tracks
     *        Text track object or text track array to be added to the list.
     */
    ;

    _proto.updateForTrack = function updateForTrack(tracks) {
      if (!Array.isArray(tracks)) {
        tracks = [tracks];
      }

      if (typeof window$1.WebVTT !== 'function' || tracks.every(function (track) {
        return !track.activeCues;
      })) {
        return;
      }

      var cues = []; // push all active track cues

      for (var i = 0; i < tracks.length; ++i) {
        var track = tracks[i];

        for (var j = 0; j < track.activeCues.length; ++j) {
          cues.push(track.activeCues[j]);
        }
      } // removes all cues before it processes new ones


      window$1.WebVTT.processCues(window$1, cues, this.el_); // add unique class to each language text track & add settings styling if necessary

      for (var _i2 = 0; _i2 < tracks.length; ++_i2) {
        var _track2 = tracks[_i2];

        for (var _j = 0; _j < _track2.activeCues.length; ++_j) {
          var cueEl = _track2.activeCues[_j].displayState;
          addClass(cueEl, 'vjs-text-track-cue');
          addClass(cueEl, 'vjs-text-track-cue-' + (_track2.language ? _track2.language : _i2));
        }

        if (this.player_.textTrackSettings) {
          this.updateDisplayState(_track2);
        }
      }
    };

    return TextTrackDisplay;
  }(Component);

  Component.registerComponent('TextTrackDisplay', TextTrackDisplay);

  /**
   * A loading spinner for use during waiting/loading events.
   *
   * @extends Component
   */

  var LoadingSpinner = /*#__PURE__*/function (_Component) {
    inheritsLoose(LoadingSpinner, _Component);

    function LoadingSpinner() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = LoadingSpinner.prototype;

    /**
     * Create the `LoadingSpinner`s DOM element.
     *
     * @return {Element}
     *         The dom element that gets created.
     */
    _proto.createEl = function createEl$1() {
      var isAudio = this.player_.isAudio();
      var playerType = this.localize(isAudio ? 'Audio Player' : 'Video Player');
      var controlText = createEl('span', {
        className: 'vjs-control-text',
        innerHTML: this.localize('{1} is loading.', [playerType])
      });

      var el = _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-loading-spinner',
        dir: 'ltr'
      });

      el.appendChild(controlText);
      return el;
    };

    return LoadingSpinner;
  }(Component);

  Component.registerComponent('LoadingSpinner', LoadingSpinner);

  /**
   * Base class for all buttons.
   *
   * @extends ClickableComponent
   */

  var Button = /*#__PURE__*/function (_ClickableComponent) {
    inheritsLoose(Button, _ClickableComponent);

    function Button() {
      return _ClickableComponent.apply(this, arguments) || this;
    }

    var _proto = Button.prototype;

    /**
     * Create the `Button`s DOM element.
     *
     * @param {string} [tag="button"]
     *        The element's node type. This argument is IGNORED: no matter what
     *        is passed, it will always create a `button` element.
     *
     * @param {Object} [props={}]
     *        An object of properties that should be set on the element.
     *
     * @param {Object} [attributes={}]
     *        An object of attributes that should be set on the element.
     *
     * @return {Element}
     *         The element that gets created.
     */
    _proto.createEl = function createEl(tag, props, attributes) {
      if (props === void 0) {
        props = {};
      }

      if (attributes === void 0) {
        attributes = {};
      }

      tag = 'button';
      props = assign({
        innerHTML: '<span aria-hidden="true" class="vjs-icon-placeholder"></span>',
        className: this.buildCSSClass()
      }, props); // Add attributes for button element

      attributes = assign({
        // Necessary since the default button type is "submit"
        type: 'button'
      }, attributes);
      var el = Component.prototype.createEl.call(this, tag, props, attributes);
      this.createControlTextEl(el);
      return el;
    }
    /**
     * Add a child `Component` inside of this `Button`.
     *
     * @param {string|Component} child
     *        The name or instance of a child to add.
     *
     * @param {Object} [options={}]
     *        The key/value store of options that will get passed to children of
     *        the child.
     *
     * @return {Component}
     *         The `Component` that gets added as a child. When using a string the
     *         `Component` will get created by this process.
     *
     * @deprecated since version 5
     */
    ;

    _proto.addChild = function addChild(child, options) {
      if (options === void 0) {
        options = {};
      }

      var className = this.constructor.name;
      log.warn("Adding an actionable (user controllable) child to a Button (" + className + ") is not supported; use a ClickableComponent instead."); // Avoid the error message generated by ClickableComponent's addChild method

      return Component.prototype.addChild.call(this, child, options);
    }
    /**
     * Enable the `Button` element so that it can be activated or clicked. Use this with
     * {@link Button#disable}.
     */
    ;

    _proto.enable = function enable() {
      _ClickableComponent.prototype.enable.call(this);

      this.el_.removeAttribute('disabled');
    }
    /**
     * Disable the `Button` element so that it cannot be activated or clicked. Use this with
     * {@link Button#enable}.
     */
    ;

    _proto.disable = function disable() {
      _ClickableComponent.prototype.disable.call(this);

      this.el_.setAttribute('disabled', 'disabled');
    }
    /**
     * This gets called when a `Button` has focus and `keydown` is triggered via a key
     * press.
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to get called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Ignore Space or Enter key operation, which is handled by the browser for
      // a button - though not for its super class, ClickableComponent. Also,
      // prevent the event from propagating through the DOM and triggering Player
      // hotkeys. We do not preventDefault here because we _want_ the browser to
      // handle it.
      if (keycode.isEventKey(event, 'Space') || keycode.isEventKey(event, 'Enter')) {
        event.stopPropagation();
        return;
      } // Pass keypress handling up for unsupported keys


      _ClickableComponent.prototype.handleKeyDown.call(this, event);
    };

    return Button;
  }(ClickableComponent);

  Component.registerComponent('Button', Button);

  /**
   * The initial play button that shows before the video has played. The hiding of the
   * `BigPlayButton` get done via CSS and `Player` states.
   *
   * @extends Button
   */

  var BigPlayButton = /*#__PURE__*/function (_Button) {
    inheritsLoose(BigPlayButton, _Button);

    function BigPlayButton(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this;
      _this.mouseused_ = false;

      _this.on('mousedown', _this.handleMouseDown);

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object. Always returns 'vjs-big-play-button'.
     */


    var _proto = BigPlayButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return 'vjs-big-play-button';
    }
    /**
     * This gets called when a `BigPlayButton` "clicked". See {@link ClickableComponent}
     * for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} event
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      var playPromise = this.player_.play(); // exit early if clicked via the mouse

      if (this.mouseused_ && event.clientX && event.clientY) {
        var sourceIsEncrypted = this.player_.usingPlugin('eme') && this.player_.eme.sessions && this.player_.eme.sessions.length > 0;
        silencePromise(playPromise);

        if (this.player_.tech(true) && // We've observed a bug in IE and Edge when playing back DRM content where
        // calling .focus() on the video element causes the video to go black,
        // so we avoid it in that specific case
        !((IE_VERSION || IS_EDGE) && sourceIsEncrypted)) {
          this.player_.tech(true).focus();
        }

        return;
      }

      var cb = this.player_.getChild('controlBar');
      var playToggle = cb && cb.getChild('playToggle');

      if (!playToggle) {
        this.player_.tech(true).focus();
        return;
      }

      var playFocus = function playFocus() {
        return playToggle.focus();
      };

      if (isPromise(playPromise)) {
        playPromise.then(playFocus, function () {});
      } else {
        this.setTimeout(playFocus, 1);
      }
    };

    _proto.handleKeyDown = function handleKeyDown(event) {
      this.mouseused_ = false;

      _Button.prototype.handleKeyDown.call(this, event);
    };

    _proto.handleMouseDown = function handleMouseDown(event) {
      this.mouseused_ = true;
    };

    return BigPlayButton;
  }(Button);
  /**
   * The text that should display over the `BigPlayButton`s controls. Added to for localization.
   *
   * @type {string}
   * @private
   */


  BigPlayButton.prototype.controlText_ = 'Play Video';
  Component.registerComponent('BigPlayButton', BigPlayButton);

  /**
   * The `CloseButton` is a `{@link Button}` that fires a `close` event when
   * it gets clicked.
   *
   * @extends Button
   */

  var CloseButton = /*#__PURE__*/function (_Button) {
    inheritsLoose(CloseButton, _Button);

    /**
    * Creates an instance of the this class.
    *
    * @param  {Player} player
    *         The `Player` that this class should be attached to.
    *
    * @param  {Object} [options]
    *         The key/value store of player options.
    */
    function CloseButton(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this;

      _this.controlText(options && options.controlText || _this.localize('Close'));

      return _this;
    }
    /**
    * Builds the default DOM `className`.
    *
    * @return {string}
    *         The DOM `className` for this object.
    */


    var _proto = CloseButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-close-button " + _Button.prototype.buildCSSClass.call(this);
    }
    /**
     * This gets called when a `CloseButton` gets clicked. See
     * {@link ClickableComponent#handleClick} for more information on when
     * this will be triggered
     *
     * @param {EventTarget~Event} event
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     * @fires CloseButton#close
     */
    ;

    _proto.handleClick = function handleClick(event) {
      /**
       * Triggered when the a `CloseButton` is clicked.
       *
       * @event CloseButton#close
       * @type {EventTarget~Event}
       *
       * @property {boolean} [bubbles=false]
       *           set to false so that the close event does not
       *           bubble up to parents if there is no listener
       */
      this.trigger({
        type: 'close',
        bubbles: false
      });
    }
    /**
     * Event handler that is called when a `CloseButton` receives a
     * `keydown` event.
     *
     * By default, if the key is Esc, it will trigger a `click` event.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Esc button will trigger `click` event
      if (keycode.isEventKey(event, 'Esc')) {
        event.preventDefault();
        event.stopPropagation();
        this.trigger('click');
      } else {
        // Pass keypress handling up for unsupported keys
        _Button.prototype.handleKeyDown.call(this, event);
      }
    };

    return CloseButton;
  }(Button);

  Component.registerComponent('CloseButton', CloseButton);

  /**
   * Button to toggle between play and pause.
   *
   * @extends Button
   */

  var PlayToggle = /*#__PURE__*/function (_Button) {
    inheritsLoose(PlayToggle, _Button);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     */
    function PlayToggle(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _Button.call(this, player, options) || this; // show or hide replay icon

      options.replay = options.replay === undefined || options.replay;

      _this.on(player, 'play', _this.handlePlay);

      _this.on(player, 'pause', _this.handlePause);

      if (options.replay) {
        _this.on(player, 'ended', _this.handleEnded);
      }

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = PlayToggle.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-play-control " + _Button.prototype.buildCSSClass.call(this);
    }
    /**
     * This gets called when an `PlayToggle` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      if (this.player_.paused()) {
        this.player_.play();
      } else {
        this.player_.pause();
      }
    }
    /**
     * This gets called once after the video has ended and the user seeks so that
     * we can change the replay button back to a play button.
     *
     * @param {EventTarget~Event} [event]
     *        The event that caused this function to run.
     *
     * @listens Player#seeked
     */
    ;

    _proto.handleSeeked = function handleSeeked(event) {
      this.removeClass('vjs-ended');

      if (this.player_.paused()) {
        this.handlePause(event);
      } else {
        this.handlePlay(event);
      }
    }
    /**
     * Add the vjs-playing class to the element so it can change appearance.
     *
     * @param {EventTarget~Event} [event]
     *        The event that caused this function to run.
     *
     * @listens Player#play
     */
    ;

    _proto.handlePlay = function handlePlay(event) {
      this.removeClass('vjs-ended');
      this.removeClass('vjs-paused');
      this.addClass('vjs-playing'); // change the button text to "Pause"

      this.controlText('Pause');
    }
    /**
     * Add the vjs-paused class to the element so it can change appearance.
     *
     * @param {EventTarget~Event} [event]
     *        The event that caused this function to run.
     *
     * @listens Player#pause
     */
    ;

    _proto.handlePause = function handlePause(event) {
      this.removeClass('vjs-playing');
      this.addClass('vjs-paused'); // change the button text to "Play"

      this.controlText('Play');
    }
    /**
     * Add the vjs-ended class to the element so it can change appearance
     *
     * @param {EventTarget~Event} [event]
     *        The event that caused this function to run.
     *
     * @listens Player#ended
     */
    ;

    _proto.handleEnded = function handleEnded(event) {
      this.removeClass('vjs-playing');
      this.addClass('vjs-ended'); // change the button text to "Replay"

      this.controlText('Replay'); // on the next seek remove the replay button

      this.one(this.player_, 'seeked', this.handleSeeked);
    };

    return PlayToggle;
  }(Button);
  /**
   * The text that should display over the `PlayToggle`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */


  PlayToggle.prototype.controlText_ = 'Play';
  Component.registerComponent('PlayToggle', PlayToggle);

  /**
   * @file format-time.js
   * @module format-time
   */

  /**
   * Format seconds as a time string, H:MM:SS or M:SS. Supplying a guide (in
   * seconds) will force a number of leading zeros to cover the length of the
   * guide.
   *
   * @private
   * @param  {number} seconds
   *         Number of seconds to be turned into a string
   *
   * @param  {number} guide
   *         Number (in seconds) to model the string after
   *
   * @return {string}
   *         Time formatted as H:MM:SS or M:SS
   */
  var defaultImplementation = function defaultImplementation(seconds, guide) {
    seconds = seconds < 0 ? 0 : seconds;
    var s = Math.floor(seconds % 60);
    var m = Math.floor(seconds / 60 % 60);
    var h = Math.floor(seconds / 3600);
    var gm = Math.floor(guide / 60 % 60);
    var gh = Math.floor(guide / 3600); // handle invalid times

    if (isNaN(seconds) || seconds === Infinity) {
      // '-' is false for all relational operators (e.g. <, >=) so this setting
      // will add the minimum number of fields specified by the guide
      h = m = s = '-';
    } // Check if we need to show hours


    h = h > 0 || gh > 0 ? h + ':' : ''; // If hours are showing, we may need to add a leading zero.
    // Always show at least one digit of minutes.

    m = ((h || gm >= 10) && m < 10 ? '0' + m : m) + ':'; // Check if leading zero is need for seconds

    s = s < 10 ? '0' + s : s;
    return h + m + s;
  }; // Internal pointer to the current implementation.


  var implementation = defaultImplementation;
  /**
   * Replaces the default formatTime implementation with a custom implementation.
   *
   * @param {Function} customImplementation
   *        A function which will be used in place of the default formatTime
   *        implementation. Will receive the current time in seconds and the
   *        guide (in seconds) as arguments.
   */

  function setFormatTime(customImplementation) {
    implementation = customImplementation;
  }
  /**
   * Resets formatTime to the default implementation.
   */

  function resetFormatTime() {
    implementation = defaultImplementation;
  }
  /**
   * Delegates to either the default time formatting function or a custom
   * function supplied via `setFormatTime`.
   *
   * Formats seconds as a time string (H:MM:SS or M:SS). Supplying a
   * guide (in seconds) will force a number of leading zeros to cover the
   * length of the guide.
   *
   * @static
   * @example  formatTime(125, 600) === "02:05"
   * @param    {number} seconds
   *           Number of seconds to be turned into a string
   *
   * @param    {number} guide
   *           Number (in seconds) to model the string after
   *
   * @return   {string}
   *           Time formatted as H:MM:SS or M:SS
   */

  function formatTime(seconds, guide) {
    if (guide === void 0) {
      guide = seconds;
    }

    return implementation(seconds, guide);
  }

  /**
   * Displays time information about the video
   *
   * @extends Component
   */

  var TimeDisplay = /*#__PURE__*/function (_Component) {
    inheritsLoose(TimeDisplay, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function TimeDisplay(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;

      _this.on(player, ['timeupdate', 'ended'], _this.updateContent);

      _this.updateTextNode_();

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = TimeDisplay.prototype;

    _proto.createEl = function createEl$1() {
      var className = this.buildCSSClass();

      var el = _Component.prototype.createEl.call(this, 'div', {
        className: className + " vjs-time-control vjs-control",
        innerHTML: "<span class=\"vjs-control-text\" role=\"presentation\">" + this.localize(this.labelText_) + "\xA0</span>"
      });

      this.contentEl_ = createEl('span', {
        className: className + "-display"
      }, {
        // tell screen readers not to automatically read the time as it changes
        'aria-live': 'off',
        // span elements have no implicit role, but some screen readers (notably VoiceOver)
        // treat them as a break between items in the DOM when using arrow keys
        // (or left-to-right swipes on iOS) to read contents of a page. Using
        // role='presentation' causes VoiceOver to NOT treat this span as a break.
        'role': 'presentation'
      });
      el.appendChild(this.contentEl_);
      return el;
    };

    _proto.dispose = function dispose() {
      this.contentEl_ = null;
      this.textNode_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Updates the time display text node with a new time
     *
     * @param {number} [time=0] the time to update to
     *
     * @private
     */
    ;

    _proto.updateTextNode_ = function updateTextNode_(time) {
      var _this2 = this;

      if (time === void 0) {
        time = 0;
      }

      time = formatTime(time);

      if (this.formattedTime_ === time) {
        return;
      }

      this.formattedTime_ = time;
      this.requestNamedAnimationFrame('TimeDisplay#updateTextNode_', function () {
        if (!_this2.contentEl_) {
          return;
        }

        var oldNode = _this2.textNode_;
        _this2.textNode_ = document.createTextNode(_this2.formattedTime_);

        if (!_this2.textNode_) {
          return;
        }

        if (oldNode) {
          _this2.contentEl_.replaceChild(_this2.textNode_, oldNode);
        } else {
          _this2.contentEl_.appendChild(_this2.textNode_);
        }
      });
    }
    /**
     * To be filled out in the child class, should update the displayed time
     * in accordance with the fact that the current time has changed.
     *
     * @param {EventTarget~Event} [event]
     *        The `timeupdate`  event that caused this to run.
     *
     * @listens Player#timeupdate
     */
    ;

    _proto.updateContent = function updateContent(event) {};

    return TimeDisplay;
  }(Component);
  /**
   * The text that is added to the `TimeDisplay` for screen reader users.
   *
   * @type {string}
   * @private
   */


  TimeDisplay.prototype.labelText_ = 'Time';
  /**
   * The text that should display over the `TimeDisplay`s controls. Added to for localization.
   *
   * @type {string}
   * @private
   *
   * @deprecated in v7; controlText_ is not used in non-active display Components
   */

  TimeDisplay.prototype.controlText_ = 'Time';
  Component.registerComponent('TimeDisplay', TimeDisplay);

  /**
   * Displays the current time
   *
   * @extends Component
   */

  var CurrentTimeDisplay = /*#__PURE__*/function (_TimeDisplay) {
    inheritsLoose(CurrentTimeDisplay, _TimeDisplay);

    function CurrentTimeDisplay() {
      return _TimeDisplay.apply(this, arguments) || this;
    }

    var _proto = CurrentTimeDisplay.prototype;

    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    _proto.buildCSSClass = function buildCSSClass() {
      return 'vjs-current-time';
    }
    /**
     * Update current time display
     *
     * @param {EventTarget~Event} [event]
     *        The `timeupdate` event that caused this function to run.
     *
     * @listens Player#timeupdate
     */
    ;

    _proto.updateContent = function updateContent(event) {
      // Allows for smooth scrubbing, when player can't keep up.
      var time;

      if (this.player_.ended()) {
        time = this.player_.duration();
      } else {
        time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
      }

      this.updateTextNode_(time);
    };

    return CurrentTimeDisplay;
  }(TimeDisplay);
  /**
   * The text that is added to the `CurrentTimeDisplay` for screen reader users.
   *
   * @type {string}
   * @private
   */


  CurrentTimeDisplay.prototype.labelText_ = 'Current Time';
  /**
   * The text that should display over the `CurrentTimeDisplay`s controls. Added to for localization.
   *
   * @type {string}
   * @private
   *
   * @deprecated in v7; controlText_ is not used in non-active display Components
   */

  CurrentTimeDisplay.prototype.controlText_ = 'Current Time';
  Component.registerComponent('CurrentTimeDisplay', CurrentTimeDisplay);

  /**
   * Displays the duration
   *
   * @extends Component
   */

  var DurationDisplay = /*#__PURE__*/function (_TimeDisplay) {
    inheritsLoose(DurationDisplay, _TimeDisplay);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function DurationDisplay(player, options) {
      var _this;

      _this = _TimeDisplay.call(this, player, options) || this; // we do not want to/need to throttle duration changes,
      // as they should always display the changed duration as
      // it has changed

      _this.on(player, 'durationchange', _this.updateContent); // Listen to loadstart because the player duration is reset when a new media element is loaded,
      // but the durationchange on the user agent will not fire.
      // @see [Spec]{@link https://www.w3.org/TR/2011/WD-html5-20110113/video.html#media-element-load-algorithm}


      _this.on(player, 'loadstart', _this.updateContent); // Also listen for timeupdate (in the parent) and loadedmetadata because removing those
      // listeners could have broken dependent applications/libraries. These
      // can likely be removed for 7.0.


      _this.on(player, 'loadedmetadata', _this.updateContent);

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = DurationDisplay.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return 'vjs-duration';
    }
    /**
     * Update duration time display.
     *
     * @param {EventTarget~Event} [event]
     *        The `durationchange`, `timeupdate`, or `loadedmetadata` event that caused
     *        this function to be called.
     *
     * @listens Player#durationchange
     * @listens Player#timeupdate
     * @listens Player#loadedmetadata
     */
    ;

    _proto.updateContent = function updateContent(event) {
      var duration = this.player_.duration();
      this.updateTextNode_(duration);
    };

    return DurationDisplay;
  }(TimeDisplay);
  /**
   * The text that is added to the `DurationDisplay` for screen reader users.
   *
   * @type {string}
   * @private
   */


  DurationDisplay.prototype.labelText_ = 'Duration';
  /**
   * The text that should display over the `DurationDisplay`s controls. Added to for localization.
   *
   * @type {string}
   * @private
   *
   * @deprecated in v7; controlText_ is not used in non-active display Components
   */

  DurationDisplay.prototype.controlText_ = 'Duration';
  Component.registerComponent('DurationDisplay', DurationDisplay);

  /**
   * The separator between the current time and duration.
   * Can be hidden if it's not needed in the design.
   *
   * @extends Component
   */

  var TimeDivider = /*#__PURE__*/function (_Component) {
    inheritsLoose(TimeDivider, _Component);

    function TimeDivider() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = TimeDivider.prototype;

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     *         The element that was created.
     */
    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-time-control vjs-time-divider',
        innerHTML: '<div><span>/</span></div>'
      }, {
        // this element and its contents can be hidden from assistive techs since
        // it is made extraneous by the announcement of the control text
        // for the current time and duration displays
        'aria-hidden': true
      });
    };

    return TimeDivider;
  }(Component);

  Component.registerComponent('TimeDivider', TimeDivider);

  /**
   * Displays the time left in the video
   *
   * @extends Component
   */

  var RemainingTimeDisplay = /*#__PURE__*/function (_TimeDisplay) {
    inheritsLoose(RemainingTimeDisplay, _TimeDisplay);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function RemainingTimeDisplay(player, options) {
      var _this;

      _this = _TimeDisplay.call(this, player, options) || this;

      _this.on(player, 'durationchange', _this.updateContent);

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = RemainingTimeDisplay.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return 'vjs-remaining-time';
    }
    /**
     * Create the `Component`'s DOM element with the "minus" characted prepend to the time
     *
     * @return {Element}
     *         The element that was created.
     */
    ;

    _proto.createEl = function createEl$1() {
      var el = _TimeDisplay.prototype.createEl.call(this);

      el.insertBefore(createEl('span', {}, {
        'aria-hidden': true
      }, '-'), this.contentEl_);
      return el;
    }
    /**
     * Update remaining time display.
     *
     * @param {EventTarget~Event} [event]
     *        The `timeupdate` or `durationchange` event that caused this to run.
     *
     * @listens Player#timeupdate
     * @listens Player#durationchange
     */
    ;

    _proto.updateContent = function updateContent(event) {
      if (typeof this.player_.duration() !== 'number') {
        return;
      }

      var time; // @deprecated We should only use remainingTimeDisplay
      // as of video.js 7

      if (this.player_.ended()) {
        time = 0;
      } else if (this.player_.remainingTimeDisplay) {
        time = this.player_.remainingTimeDisplay();
      } else {
        time = this.player_.remainingTime();
      }

      this.updateTextNode_(time);
    };

    return RemainingTimeDisplay;
  }(TimeDisplay);
  /**
   * The text that is added to the `RemainingTimeDisplay` for screen reader users.
   *
   * @type {string}
   * @private
   */


  RemainingTimeDisplay.prototype.labelText_ = 'Remaining Time';
  /**
   * The text that should display over the `RemainingTimeDisplay`s controls. Added to for localization.
   *
   * @type {string}
   * @private
   *
   * @deprecated in v7; controlText_ is not used in non-active display Components
   */

  RemainingTimeDisplay.prototype.controlText_ = 'Remaining Time';
  Component.registerComponent('RemainingTimeDisplay', RemainingTimeDisplay);

  /**
   * Displays the live indicator when duration is Infinity.
   *
   * @extends Component
   */

  var LiveDisplay = /*#__PURE__*/function (_Component) {
    inheritsLoose(LiveDisplay, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function LiveDisplay(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;

      _this.updateShowing();

      _this.on(_this.player(), 'durationchange', _this.updateShowing);

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = LiveDisplay.prototype;

    _proto.createEl = function createEl$1() {
      var el = _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-live-control vjs-control'
      });

      this.contentEl_ = createEl('div', {
        className: 'vjs-live-display',
        innerHTML: "<span class=\"vjs-control-text\">" + this.localize('Stream Type') + "\xA0</span>" + this.localize('LIVE')
      }, {
        'aria-live': 'off'
      });
      el.appendChild(this.contentEl_);
      return el;
    };

    _proto.dispose = function dispose() {
      this.contentEl_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Check the duration to see if the LiveDisplay should be showing or not. Then show/hide
     * it accordingly
     *
     * @param {EventTarget~Event} [event]
     *        The {@link Player#durationchange} event that caused this function to run.
     *
     * @listens Player#durationchange
     */
    ;

    _proto.updateShowing = function updateShowing(event) {
      if (this.player().duration() === Infinity) {
        this.show();
      } else {
        this.hide();
      }
    };

    return LiveDisplay;
  }(Component);

  Component.registerComponent('LiveDisplay', LiveDisplay);

  /**
   * Displays the live indicator when duration is Infinity.
   *
   * @extends Component
   */

  var SeekToLive = /*#__PURE__*/function (_Button) {
    inheritsLoose(SeekToLive, _Button);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function SeekToLive(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this;

      _this.updateLiveEdgeStatus();

      if (_this.player_.liveTracker) {
        _this.on(_this.player_.liveTracker, 'liveedgechange', _this.updateLiveEdgeStatus);
      }

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = SeekToLive.prototype;

    _proto.createEl = function createEl$1() {
      var el = _Button.prototype.createEl.call(this, 'button', {
        className: 'vjs-seek-to-live-control vjs-control'
      });

      this.textEl_ = createEl('span', {
        className: 'vjs-seek-to-live-text',
        innerHTML: this.localize('LIVE')
      }, {
        'aria-hidden': 'true'
      });
      el.appendChild(this.textEl_);
      return el;
    }
    /**
     * Update the state of this button if we are at the live edge
     * or not
     */
    ;

    _proto.updateLiveEdgeStatus = function updateLiveEdgeStatus() {
      // default to live edge
      if (!this.player_.liveTracker || this.player_.liveTracker.atLiveEdge()) {
        this.setAttribute('aria-disabled', true);
        this.addClass('vjs-at-live-edge');
        this.controlText('Seek to live, currently playing live');
      } else {
        this.setAttribute('aria-disabled', false);
        this.removeClass('vjs-at-live-edge');
        this.controlText('Seek to live, currently behind live');
      }
    }
    /**
     * On click bring us as near to the live point as possible.
     * This requires that we wait for the next `live-seekable-change`
     * event which will happen every segment length seconds.
     */
    ;

    _proto.handleClick = function handleClick() {
      this.player_.liveTracker.seekToLiveEdge();
    }
    /**
     * Dispose of the element and stop tracking
     */
    ;

    _proto.dispose = function dispose() {
      if (this.player_.liveTracker) {
        this.off(this.player_.liveTracker, 'liveedgechange', this.updateLiveEdgeStatus);
      }

      this.textEl_ = null;

      _Button.prototype.dispose.call(this);
    };

    return SeekToLive;
  }(Button);

  SeekToLive.prototype.controlText_ = 'Seek to live, currently playing live';
  Component.registerComponent('SeekToLive', SeekToLive);

  /**
   * Keep a number between a min and a max value
   *
   * @param {number} number
   *        The number to clamp
   *
   * @param {number} min
   *        The minimum value
   * @param {number} max
   *        The maximum value
   *
   * @return {number}
   *         the clamped number
   */
  var clamp = function clamp(number, min, max) {
    number = Number(number);
    return Math.min(max, Math.max(min, isNaN(number) ? min : number));
  };

  /**
   * The base functionality for a slider. Can be vertical or horizontal.
   * For instance the volume bar or the seek bar on a video is a slider.
   *
   * @extends Component
   */

  var Slider = /*#__PURE__*/function (_Component) {
    inheritsLoose(Slider, _Component);

    /**
    * Create an instance of this class
    *
    * @param {Player} player
    *        The `Player` that this class should be attached to.
    *
    * @param {Object} [options]
    *        The key/value store of player options.
    */
    function Slider(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this; // Set property names to bar to match with the child Slider class is looking for

      _this.bar = _this.getChild(_this.options_.barName); // Set a horizontal or vertical class on the slider depending on the slider type

      _this.vertical(!!_this.options_.vertical);

      _this.enable();

      return _this;
    }
    /**
     * Are controls are currently enabled for this slider or not.
     *
     * @return {boolean}
     *         true if controls are enabled, false otherwise
     */


    var _proto = Slider.prototype;

    _proto.enabled = function enabled() {
      return this.enabled_;
    }
    /**
     * Enable controls for this slider if they are disabled
     */
    ;

    _proto.enable = function enable() {
      if (this.enabled()) {
        return;
      }

      this.on('mousedown', this.handleMouseDown);
      this.on('touchstart', this.handleMouseDown);
      this.on('keydown', this.handleKeyDown);
      this.on('click', this.handleClick); // TODO: deprecated, controlsvisible does not seem to be fired

      this.on(this.player_, 'controlsvisible', this.update);

      if (this.playerEvent) {
        this.on(this.player_, this.playerEvent, this.update);
      }

      this.removeClass('disabled');
      this.setAttribute('tabindex', 0);
      this.enabled_ = true;
    }
    /**
     * Disable controls for this slider if they are enabled
     */
    ;

    _proto.disable = function disable() {
      if (!this.enabled()) {
        return;
      }

      var doc = this.bar.el_.ownerDocument;
      this.off('mousedown', this.handleMouseDown);
      this.off('touchstart', this.handleMouseDown);
      this.off('keydown', this.handleKeyDown);
      this.off('click', this.handleClick);
      this.off(this.player_, 'controlsvisible', this.update);
      this.off(doc, 'mousemove', this.handleMouseMove);
      this.off(doc, 'mouseup', this.handleMouseUp);
      this.off(doc, 'touchmove', this.handleMouseMove);
      this.off(doc, 'touchend', this.handleMouseUp);
      this.removeAttribute('tabindex');
      this.addClass('disabled');

      if (this.playerEvent) {
        this.off(this.player_, this.playerEvent, this.update);
      }

      this.enabled_ = false;
    }
    /**
     * Create the `Slider`s DOM element.
     *
     * @param {string} type
     *        Type of element to create.
     *
     * @param {Object} [props={}]
     *        List of properties in Object form.
     *
     * @param {Object} [attributes={}]
     *        list of attributes in Object form.
     *
     * @return {Element}
     *         The element that gets created.
     */
    ;

    _proto.createEl = function createEl(type, props, attributes) {
      if (props === void 0) {
        props = {};
      }

      if (attributes === void 0) {
        attributes = {};
      }

      // Add the slider element class to all sub classes
      props.className = props.className + ' vjs-slider';
      props = assign({
        tabIndex: 0
      }, props);
      attributes = assign({
        'role': 'slider',
        'aria-valuenow': 0,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'tabIndex': 0
      }, attributes);
      return _Component.prototype.createEl.call(this, type, props, attributes);
    }
    /**
     * Handle `mousedown` or `touchstart` events on the `Slider`.
     *
     * @param {EventTarget~Event} event
     *        `mousedown` or `touchstart` event that triggered this function
     *
     * @listens mousedown
     * @listens touchstart
     * @fires Slider#slideractive
     */
    ;

    _proto.handleMouseDown = function handleMouseDown(event) {
      var doc = this.bar.el_.ownerDocument;

      if (event.type === 'mousedown') {
        event.preventDefault();
      } // Do not call preventDefault() on touchstart in Chrome
      // to avoid console warnings. Use a 'touch-action: none' style
      // instead to prevent unintented scrolling.
      // https://developers.google.com/web/updates/2017/01/scrolling-intervention


      if (event.type === 'touchstart' && !IS_CHROME) {
        event.preventDefault();
      }

      blockTextSelection();
      this.addClass('vjs-sliding');
      /**
       * Triggered when the slider is in an active state
       *
       * @event Slider#slideractive
       * @type {EventTarget~Event}
       */

      this.trigger('slideractive');
      this.on(doc, 'mousemove', this.handleMouseMove);
      this.on(doc, 'mouseup', this.handleMouseUp);
      this.on(doc, 'touchmove', this.handleMouseMove);
      this.on(doc, 'touchend', this.handleMouseUp);
      this.handleMouseMove(event);
    }
    /**
     * Handle the `mousemove`, `touchmove`, and `mousedown` events on this `Slider`.
     * The `mousemove` and `touchmove` events will only only trigger this function during
     * `mousedown` and `touchstart`. This is due to {@link Slider#handleMouseDown} and
     * {@link Slider#handleMouseUp}.
     *
     * @param {EventTarget~Event} event
     *        `mousedown`, `mousemove`, `touchstart`, or `touchmove` event that triggered
     *        this function
     *
     * @listens mousemove
     * @listens touchmove
     */
    ;

    _proto.handleMouseMove = function handleMouseMove(event) {}
    /**
     * Handle `mouseup` or `touchend` events on the `Slider`.
     *
     * @param {EventTarget~Event} event
     *        `mouseup` or `touchend` event that triggered this function.
     *
     * @listens touchend
     * @listens mouseup
     * @fires Slider#sliderinactive
     */
    ;

    _proto.handleMouseUp = function handleMouseUp() {
      var doc = this.bar.el_.ownerDocument;
      unblockTextSelection();
      this.removeClass('vjs-sliding');
      /**
       * Triggered when the slider is no longer in an active state.
       *
       * @event Slider#sliderinactive
       * @type {EventTarget~Event}
       */

      this.trigger('sliderinactive');
      this.off(doc, 'mousemove', this.handleMouseMove);
      this.off(doc, 'mouseup', this.handleMouseUp);
      this.off(doc, 'touchmove', this.handleMouseMove);
      this.off(doc, 'touchend', this.handleMouseUp);
      this.update();
    }
    /**
     * Update the progress bar of the `Slider`.
     *
     * @return {number}
     *          The percentage of progress the progress bar represents as a
     *          number from 0 to 1.
     */
    ;

    _proto.update = function update() {
      var _this2 = this;

      // In VolumeBar init we have a setTimeout for update that pops and update
      // to the end of the execution stack. The player is destroyed before then
      // update will cause an error
      // If there's no bar...
      if (!this.el_ || !this.bar) {
        return;
      } // clamp progress between 0 and 1
      // and only round to four decimal places, as we round to two below


      var progress = this.getProgress();

      if (progress === this.progress_) {
        return progress;
      }

      this.progress_ = progress;
      this.requestNamedAnimationFrame('Slider#update', function () {
        // Set the new bar width or height
        var sizeKey = _this2.vertical() ? 'height' : 'width'; // Convert to a percentage for css value

        _this2.bar.el().style[sizeKey] = (progress * 100).toFixed(2) + '%';
      });
      return progress;
    }
    /**
     * Get the percentage of the bar that should be filled
     * but clamped and rounded.
     *
     * @return {number}
     *         percentage filled that the slider is
     */
    ;

    _proto.getProgress = function getProgress() {
      return Number(clamp(this.getPercent(), 0, 1).toFixed(4));
    }
    /**
     * Calculate distance for slider
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to run.
     *
     * @return {number}
     *         The current position of the Slider.
     *         - position.x for vertical `Slider`s
     *         - position.y for horizontal `Slider`s
     */
    ;

    _proto.calculateDistance = function calculateDistance(event) {
      var position = getPointerPosition(this.el_, event);

      if (this.vertical()) {
        return position.y;
      }

      return position.x;
    }
    /**
     * Handle a `keydown` event on the `Slider`. Watches for left, rigth, up, and down
     * arrow keys. This function will only be called when the slider has focus. See
     * {@link Slider#handleFocus} and {@link Slider#handleBlur}.
     *
     * @param {EventTarget~Event} event
     *        the `keydown` event that caused this function to run.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Left and Down Arrows
      if (keycode.isEventKey(event, 'Left') || keycode.isEventKey(event, 'Down')) {
        event.preventDefault();
        event.stopPropagation();
        this.stepBack(); // Up and Right Arrows
      } else if (keycode.isEventKey(event, 'Right') || keycode.isEventKey(event, 'Up')) {
        event.preventDefault();
        event.stopPropagation();
        this.stepForward();
      } else {
        // Pass keydown handling up for unsupported keys
        _Component.prototype.handleKeyDown.call(this, event);
      }
    }
    /**
     * Listener for click events on slider, used to prevent clicks
     *   from bubbling up to parent elements like button menus.
     *
     * @param {Object} event
     *        Event that caused this object to run
     */
    ;

    _proto.handleClick = function handleClick(event) {
      event.stopPropagation();
      event.preventDefault();
    }
    /**
     * Get/set if slider is horizontal for vertical
     *
     * @param {boolean} [bool]
     *        - true if slider is vertical,
     *        - false is horizontal
     *
     * @return {boolean}
     *         - true if slider is vertical, and getting
     *         - false if the slider is horizontal, and getting
     */
    ;

    _proto.vertical = function vertical(bool) {
      if (bool === undefined) {
        return this.vertical_ || false;
      }

      this.vertical_ = !!bool;

      if (this.vertical_) {
        this.addClass('vjs-slider-vertical');
      } else {
        this.addClass('vjs-slider-horizontal');
      }
    };

    return Slider;
  }(Component);

  Component.registerComponent('Slider', Slider);

  var percentify = function percentify(time, end) {
    return clamp(time / end * 100, 0, 100).toFixed(2) + '%';
  };
  /**
   * Shows loading progress
   *
   * @extends Component
   */


  var LoadProgressBar = /*#__PURE__*/function (_Component) {
    inheritsLoose(LoadProgressBar, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function LoadProgressBar(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.partEls_ = [];

      _this.on(player, 'progress', _this.update);

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = LoadProgressBar.prototype;

    _proto.createEl = function createEl$1() {
      var el = _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-load-progress'
      });

      var wrapper = createEl('span', {
        className: 'vjs-control-text'
      });
      var loadedText = createEl('span', {
        textContent: this.localize('Loaded')
      });
      var separator = document.createTextNode(': ');
      this.percentageEl_ = createEl('span', {
        className: 'vjs-control-text-loaded-percentage',
        textContent: '0%'
      });
      el.appendChild(wrapper);
      wrapper.appendChild(loadedText);
      wrapper.appendChild(separator);
      wrapper.appendChild(this.percentageEl_);
      return el;
    };

    _proto.dispose = function dispose() {
      this.partEls_ = null;
      this.percentageEl_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Update progress bar
     *
     * @param {EventTarget~Event} [event]
     *        The `progress` event that caused this function to run.
     *
     * @listens Player#progress
     */
    ;

    _proto.update = function update(event) {
      var _this2 = this;

      this.requestNamedAnimationFrame('LoadProgressBar#update', function () {
        var liveTracker = _this2.player_.liveTracker;

        var buffered = _this2.player_.buffered();

        var duration = liveTracker && liveTracker.isLive() ? liveTracker.seekableEnd() : _this2.player_.duration();

        var bufferedEnd = _this2.player_.bufferedEnd();

        var children = _this2.partEls_;
        var percent = percentify(bufferedEnd, duration);

        if (_this2.percent_ !== percent) {
          // update the width of the progress bar
          _this2.el_.style.width = percent; // update the control-text

          textContent(_this2.percentageEl_, percent);
          _this2.percent_ = percent;
        } // add child elements to represent the individual buffered time ranges


        for (var i = 0; i < buffered.length; i++) {
          var start = buffered.start(i);
          var end = buffered.end(i);
          var part = children[i];

          if (!part) {
            part = _this2.el_.appendChild(createEl());
            children[i] = part;
          } //  only update if changed


          if (part.dataset.start === start && part.dataset.end === end) {
            continue;
          }

          part.dataset.start = start;
          part.dataset.end = end; // set the percent based on the width of the progress bar (bufferedEnd)

          part.style.left = percentify(start, bufferedEnd);
          part.style.width = percentify(end - start, bufferedEnd);
        } // remove unused buffered range elements


        for (var _i = children.length; _i > buffered.length; _i--) {
          _this2.el_.removeChild(children[_i - 1]);
        }

        children.length = buffered.length;
      });
    };

    return LoadProgressBar;
  }(Component);

  Component.registerComponent('LoadProgressBar', LoadProgressBar);

  /**
   * Time tooltips display a time above the progress bar.
   *
   * @extends Component
   */

  var TimeTooltip = /*#__PURE__*/function (_Component) {
    inheritsLoose(TimeTooltip, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The {@link Player} that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function TimeTooltip(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.update = throttle(bind(assertThisInitialized(_this), _this.update), UPDATE_REFRESH_INTERVAL);
      return _this;
    }
    /**
     * Create the time tooltip DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = TimeTooltip.prototype;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-time-tooltip'
      }, {
        'aria-hidden': 'true'
      });
    }
    /**
     * Updates the position of the time tooltip relative to the `SeekBar`.
     *
     * @param {Object} seekBarRect
     *        The `ClientRect` for the {@link SeekBar} element.
     *
     * @param {number} seekBarPoint
     *        A number from 0 to 1, representing a horizontal reference point
     *        from the left edge of the {@link SeekBar}
     */
    ;

    _proto.update = function update(seekBarRect, seekBarPoint, content) {
      var tooltipRect = findPosition(this.el_);
      var playerRect = getBoundingClientRect(this.player_.el());
      var seekBarPointPx = seekBarRect.width * seekBarPoint; // do nothing if either rect isn't available
      // for example, if the player isn't in the DOM for testing

      if (!playerRect || !tooltipRect) {
        return;
      } // This is the space left of the `seekBarPoint` available within the bounds
      // of the player. We calculate any gap between the left edge of the player
      // and the left edge of the `SeekBar` and add the number of pixels in the
      // `SeekBar` before hitting the `seekBarPoint`


      var spaceLeftOfPoint = seekBarRect.left - playerRect.left + seekBarPointPx; // This is the space right of the `seekBarPoint` available within the bounds
      // of the player. We calculate the number of pixels from the `seekBarPoint`
      // to the right edge of the `SeekBar` and add to that any gap between the
      // right edge of the `SeekBar` and the player.

      var spaceRightOfPoint = seekBarRect.width - seekBarPointPx + (playerRect.right - seekBarRect.right); // This is the number of pixels by which the tooltip will need to be pulled
      // further to the right to center it over the `seekBarPoint`.

      var pullTooltipBy = tooltipRect.width / 2; // Adjust the `pullTooltipBy` distance to the left or right depending on
      // the results of the space calculations above.

      if (spaceLeftOfPoint < pullTooltipBy) {
        pullTooltipBy += pullTooltipBy - spaceLeftOfPoint;
      } else if (spaceRightOfPoint < pullTooltipBy) {
        pullTooltipBy = spaceRightOfPoint;
      } // Due to the imprecision of decimal/ratio based calculations and varying
      // rounding behaviors, there are cases where the spacing adjustment is off
      // by a pixel or two. This adds insurance to these calculations.


      if (pullTooltipBy < 0) {
        pullTooltipBy = 0;
      } else if (pullTooltipBy > tooltipRect.width) {
        pullTooltipBy = tooltipRect.width;
      }

      this.el_.style.right = "-" + pullTooltipBy + "px";
      this.write(content);
    }
    /**
     * Write the time to the tooltip DOM element.
     *
     * @param {string} content
     *        The formatted time for the tooltip.
     */
    ;

    _proto.write = function write(content) {
      textContent(this.el_, content);
    }
    /**
     * Updates the position of the time tooltip relative to the `SeekBar`.
     *
     * @param {Object} seekBarRect
     *        The `ClientRect` for the {@link SeekBar} element.
     *
     * @param {number} seekBarPoint
     *        A number from 0 to 1, representing a horizontal reference point
     *        from the left edge of the {@link SeekBar}
     *
     * @param {number} time
     *        The time to update the tooltip to, not used during live playback
     *
     * @param {Function} cb
     *        A function that will be called during the request animation frame
     *        for tooltips that need to do additional animations from the default
     */
    ;

    _proto.updateTime = function updateTime(seekBarRect, seekBarPoint, time, cb) {
      var _this2 = this;

      this.requestNamedAnimationFrame('TimeTooltip#updateTime', function () {
        var content;

        var duration = _this2.player_.duration();

        if (_this2.player_.liveTracker && _this2.player_.liveTracker.isLive()) {
          var liveWindow = _this2.player_.liveTracker.liveWindow();

          var secondsBehind = liveWindow - seekBarPoint * liveWindow;
          content = (secondsBehind < 1 ? '' : '-') + formatTime(secondsBehind, liveWindow);
        } else {
          content = formatTime(time, duration);
        }

        _this2.update(seekBarRect, seekBarPoint, content);

        if (cb) {
          cb();
        }
      });
    };

    return TimeTooltip;
  }(Component);

  Component.registerComponent('TimeTooltip', TimeTooltip);

  /**
   * Used by {@link SeekBar} to display media playback progress as part of the
   * {@link ProgressControl}.
   *
   * @extends Component
   */

  var PlayProgressBar = /*#__PURE__*/function (_Component) {
    inheritsLoose(PlayProgressBar, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The {@link Player} that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function PlayProgressBar(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.update = throttle(bind(assertThisInitialized(_this), _this.update), UPDATE_REFRESH_INTERVAL);
      return _this;
    }
    /**
     * Create the the DOM element for this class.
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = PlayProgressBar.prototype;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-play-progress vjs-slider-bar'
      }, {
        'aria-hidden': 'true'
      });
    }
    /**
     * Enqueues updates to its own DOM as well as the DOM of its
     * {@link TimeTooltip} child.
     *
     * @param {Object} seekBarRect
     *        The `ClientRect` for the {@link SeekBar} element.
     *
     * @param {number} seekBarPoint
     *        A number from 0 to 1, representing a horizontal reference point
     *        from the left edge of the {@link SeekBar}
     */
    ;

    _proto.update = function update(seekBarRect, seekBarPoint) {
      var timeTooltip = this.getChild('timeTooltip');

      if (!timeTooltip) {
        return;
      }

      var time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
      timeTooltip.updateTime(seekBarRect, seekBarPoint, time);
    };

    return PlayProgressBar;
  }(Component);
  /**
   * Default options for {@link PlayProgressBar}.
   *
   * @type {Object}
   * @private
   */


  PlayProgressBar.prototype.options_ = {
    children: []
  }; // Time tooltips should not be added to a player on mobile devices

  if (!IS_IOS && !IS_ANDROID) {
    PlayProgressBar.prototype.options_.children.push('timeTooltip');
  }

  Component.registerComponent('PlayProgressBar', PlayProgressBar);

  /**
   * The {@link MouseTimeDisplay} component tracks mouse movement over the
   * {@link ProgressControl}. It displays an indicator and a {@link TimeTooltip}
   * indicating the time which is represented by a given point in the
   * {@link ProgressControl}.
   *
   * @extends Component
   */

  var MouseTimeDisplay = /*#__PURE__*/function (_Component) {
    inheritsLoose(MouseTimeDisplay, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The {@link Player} that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function MouseTimeDisplay(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.update = throttle(bind(assertThisInitialized(_this), _this.update), UPDATE_REFRESH_INTERVAL);
      return _this;
    }
    /**
     * Create the DOM element for this class.
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = MouseTimeDisplay.prototype;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-mouse-display'
      });
    }
    /**
     * Enqueues updates to its own DOM as well as the DOM of its
     * {@link TimeTooltip} child.
     *
     * @param {Object} seekBarRect
     *        The `ClientRect` for the {@link SeekBar} element.
     *
     * @param {number} seekBarPoint
     *        A number from 0 to 1, representing a horizontal reference point
     *        from the left edge of the {@link SeekBar}
     */
    ;

    _proto.update = function update(seekBarRect, seekBarPoint) {
      var _this2 = this;

      var time = seekBarPoint * this.player_.duration();
      this.getChild('timeTooltip').updateTime(seekBarRect, seekBarPoint, time, function () {
        _this2.el_.style.left = seekBarRect.width * seekBarPoint + "px";
      });
    };

    return MouseTimeDisplay;
  }(Component);
  /**
   * Default options for `MouseTimeDisplay`
   *
   * @type {Object}
   * @private
   */


  MouseTimeDisplay.prototype.options_ = {
    children: ['timeTooltip']
  };
  Component.registerComponent('MouseTimeDisplay', MouseTimeDisplay);

  var STEP_SECONDS = 5; // The multiplier of STEP_SECONDS that PgUp/PgDown move the timeline.

  var PAGE_KEY_MULTIPLIER = 12;
  /**
   * Seek bar and container for the progress bars. Uses {@link PlayProgressBar}
   * as its `bar`.
   *
   * @extends Slider
   */

  var SeekBar = /*#__PURE__*/function (_Slider) {
    inheritsLoose(SeekBar, _Slider);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function SeekBar(player, options) {
      var _this;

      _this = _Slider.call(this, player, options) || this;

      _this.setEventHandlers_();

      return _this;
    }
    /**
     * Sets the event handlers
     *
     * @private
     */


    var _proto = SeekBar.prototype;

    _proto.setEventHandlers_ = function setEventHandlers_() {
      this.update_ = bind(this, this.update);
      this.update = throttle(this.update_, UPDATE_REFRESH_INTERVAL);
      this.on(this.player_, ['ended', 'durationchange', 'timeupdate'], this.update);

      if (this.player_.liveTracker) {
        this.on(this.player_.liveTracker, 'liveedgechange', this.update);
      } // when playing, let's ensure we smoothly update the play progress bar
      // via an interval


      this.updateInterval = null;
      this.on(this.player_, ['playing'], this.enableInterval_);
      this.on(this.player_, ['ended', 'pause', 'waiting'], this.disableInterval_); // we don't need to update the play progress if the document is hidden,
      // also, this causes the CPU to spike and eventually crash the page on IE11.

      if ('hidden' in document && 'visibilityState' in document) {
        this.on(document, 'visibilitychange', this.toggleVisibility_);
      }
    };

    _proto.toggleVisibility_ = function toggleVisibility_(e) {
      if (document.hidden) {
        this.disableInterval_(e);
      } else {
        this.enableInterval_(); // we just switched back to the page and someone may be looking, so, update ASAP

        this.update();
      }
    };

    _proto.enableInterval_ = function enableInterval_() {
      if (this.updateInterval) {
        return;
      }

      this.updateInterval = this.setInterval(this.update, UPDATE_REFRESH_INTERVAL);
    };

    _proto.disableInterval_ = function disableInterval_(e) {
      if (this.player_.liveTracker && this.player_.liveTracker.isLive() && e && e.type !== 'ended') {
        return;
      }

      if (!this.updateInterval) {
        return;
      }

      this.clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */
    ;

    _proto.createEl = function createEl() {
      return _Slider.prototype.createEl.call(this, 'div', {
        className: 'vjs-progress-holder'
      }, {
        'aria-label': this.localize('Progress Bar')
      });
    }
    /**
     * This function updates the play progress bar and accessibility
     * attributes to whatever is passed in.
     *
     * @param {EventTarget~Event} [event]
     *        The `timeupdate` or `ended` event that caused this to run.
     *
     * @listens Player#timeupdate
     *
     * @return {number}
     *          The current percent at a number from 0-1
     */
    ;

    _proto.update = function update(event) {
      var _this2 = this;

      var percent = _Slider.prototype.update.call(this);

      this.requestNamedAnimationFrame('SeekBar#update', function () {
        var currentTime = _this2.player_.ended() ? _this2.player_.duration() : _this2.getCurrentTime_();
        var liveTracker = _this2.player_.liveTracker;

        var duration = _this2.player_.duration();

        if (liveTracker && liveTracker.isLive()) {
          duration = _this2.player_.liveTracker.liveCurrentTime();
        }

        if (_this2.percent_ !== percent) {
          // machine readable value of progress bar (percentage complete)
          _this2.el_.setAttribute('aria-valuenow', (percent * 100).toFixed(2));

          _this2.percent_ = percent;
        }

        if (_this2.currentTime_ !== currentTime || _this2.duration_ !== duration) {
          // human readable value of progress bar (time complete)
          _this2.el_.setAttribute('aria-valuetext', _this2.localize('progress bar timing: currentTime={1} duration={2}', [formatTime(currentTime, duration), formatTime(duration, duration)], '{1} of {2}'));

          _this2.currentTime_ = currentTime;
          _this2.duration_ = duration;
        } // update the progress bar time tooltip with the current time


        if (_this2.bar) {
          _this2.bar.update(getBoundingClientRect(_this2.el()), _this2.getProgress());
        }
      });
      return percent;
    }
    /**
     * Get the value of current time but allows for smooth scrubbing,
     * when player can't keep up.
     *
     * @return {number}
     *         The current time value to display
     *
     * @private
     */
    ;

    _proto.getCurrentTime_ = function getCurrentTime_() {
      return this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();
    }
    /**
     * Get the percentage of media played so far.
     *
     * @return {number}
     *         The percentage of media played so far (0 to 1).
     */
    ;

    _proto.getPercent = function getPercent() {
      var currentTime = this.getCurrentTime_();
      var percent;
      var liveTracker = this.player_.liveTracker;

      if (liveTracker && liveTracker.isLive()) {
        percent = (currentTime - liveTracker.seekableStart()) / liveTracker.liveWindow(); // prevent the percent from changing at the live edge

        if (liveTracker.atLiveEdge()) {
          percent = 1;
        }
      } else {
        percent = currentTime / this.player_.duration();
      }

      return percent;
    }
    /**
     * Handle mouse down on seek bar
     *
     * @param {EventTarget~Event} event
     *        The `mousedown` event that caused this to run.
     *
     * @listens mousedown
     */
    ;

    _proto.handleMouseDown = function handleMouseDown(event) {
      if (!isSingleLeftClick(event)) {
        return;
      } // Stop event propagation to prevent double fire in progress-control.js


      event.stopPropagation();
      this.player_.scrubbing(true);
      this.videoWasPlaying = !this.player_.paused();
      this.player_.pause();

      _Slider.prototype.handleMouseDown.call(this, event);
    }
    /**
     * Handle mouse move on seek bar
     *
     * @param {EventTarget~Event} event
     *        The `mousemove` event that caused this to run.
     *
     * @listens mousemove
     */
    ;

    _proto.handleMouseMove = function handleMouseMove(event) {
      if (!isSingleLeftClick(event)) {
        return;
      }

      var newTime;
      var distance = this.calculateDistance(event);
      var liveTracker = this.player_.liveTracker;

      if (!liveTracker || !liveTracker.isLive()) {
        newTime = distance * this.player_.duration(); // Don't let video end while scrubbing.

        if (newTime === this.player_.duration()) {
          newTime = newTime - 0.1;
        }
      } else {
        if (distance >= 0.99) {
          liveTracker.seekToLiveEdge();
          return;
        }

        var seekableStart = liveTracker.seekableStart();
        var seekableEnd = liveTracker.liveCurrentTime();
        newTime = seekableStart + distance * liveTracker.liveWindow(); // Don't let video end while scrubbing.

        if (newTime >= seekableEnd) {
          newTime = seekableEnd;
        } // Compensate for precision differences so that currentTime is not less
        // than seekable start


        if (newTime <= seekableStart) {
          newTime = seekableStart + 0.1;
        } // On android seekableEnd can be Infinity sometimes,
        // this will cause newTime to be Infinity, which is
        // not a valid currentTime.


        if (newTime === Infinity) {
          return;
        }
      } // Set new time (tell player to seek to new time)


      this.player_.currentTime(newTime);
    };

    _proto.enable = function enable() {
      _Slider.prototype.enable.call(this);

      var mouseTimeDisplay = this.getChild('mouseTimeDisplay');

      if (!mouseTimeDisplay) {
        return;
      }

      mouseTimeDisplay.show();
    };

    _proto.disable = function disable() {
      _Slider.prototype.disable.call(this);

      var mouseTimeDisplay = this.getChild('mouseTimeDisplay');

      if (!mouseTimeDisplay) {
        return;
      }

      mouseTimeDisplay.hide();
    }
    /**
     * Handle mouse up on seek bar
     *
     * @param {EventTarget~Event} event
     *        The `mouseup` event that caused this to run.
     *
     * @listens mouseup
     */
    ;

    _proto.handleMouseUp = function handleMouseUp(event) {
      _Slider.prototype.handleMouseUp.call(this, event); // Stop event propagation to prevent double fire in progress-control.js


      if (event) {
        event.stopPropagation();
      }

      this.player_.scrubbing(false);
      /**
       * Trigger timeupdate because we're done seeking and the time has changed.
       * This is particularly useful for if the player is paused to time the time displays.
       *
       * @event Tech#timeupdate
       * @type {EventTarget~Event}
       */

      this.player_.trigger({
        type: 'timeupdate',
        target: this,
        manuallyTriggered: true
      });

      if (this.videoWasPlaying) {
        silencePromise(this.player_.play());
      } else {
        // We're done seeking and the time has changed.
        // If the player is paused, make sure we display the correct time on the seek bar.
        this.update_();
      }
    }
    /**
     * Move more quickly fast forward for keyboard-only users
     */
    ;

    _proto.stepForward = function stepForward() {
      this.player_.currentTime(this.player_.currentTime() + STEP_SECONDS);
    }
    /**
     * Move more quickly rewind for keyboard-only users
     */
    ;

    _proto.stepBack = function stepBack() {
      this.player_.currentTime(this.player_.currentTime() - STEP_SECONDS);
    }
    /**
     * Toggles the playback state of the player
     * This gets called when enter or space is used on the seekbar
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called
     *
     */
    ;

    _proto.handleAction = function handleAction(event) {
      if (this.player_.paused()) {
        this.player_.play();
      } else {
        this.player_.pause();
      }
    }
    /**
     * Called when this SeekBar has focus and a key gets pressed down.
     * Supports the following keys:
     *
     *   Space or Enter key fire a click event
     *   Home key moves to start of the timeline
     *   End key moves to end of the timeline
     *   Digit "0" through "9" keys move to 0%, 10% ... 80%, 90% of the timeline
     *   PageDown key moves back a larger step than ArrowDown
     *   PageUp key moves forward a large step
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      if (keycode.isEventKey(event, 'Space') || keycode.isEventKey(event, 'Enter')) {
        event.preventDefault();
        event.stopPropagation();
        this.handleAction(event);
      } else if (keycode.isEventKey(event, 'Home')) {
        event.preventDefault();
        event.stopPropagation();
        this.player_.currentTime(0);
      } else if (keycode.isEventKey(event, 'End')) {
        event.preventDefault();
        event.stopPropagation();
        this.player_.currentTime(this.player_.duration());
      } else if (/^[0-9]$/.test(keycode(event))) {
        event.preventDefault();
        event.stopPropagation();
        var gotoFraction = (keycode.codes[keycode(event)] - keycode.codes['0']) * 10.0 / 100.0;
        this.player_.currentTime(this.player_.duration() * gotoFraction);
      } else if (keycode.isEventKey(event, 'PgDn')) {
        event.preventDefault();
        event.stopPropagation();
        this.player_.currentTime(this.player_.currentTime() - STEP_SECONDS * PAGE_KEY_MULTIPLIER);
      } else if (keycode.isEventKey(event, 'PgUp')) {
        event.preventDefault();
        event.stopPropagation();
        this.player_.currentTime(this.player_.currentTime() + STEP_SECONDS * PAGE_KEY_MULTIPLIER);
      } else {
        // Pass keydown handling up for unsupported keys
        _Slider.prototype.handleKeyDown.call(this, event);
      }
    };

    _proto.dispose = function dispose() {
      this.disableInterval_();
      this.off(this.player_, ['ended', 'durationchange', 'timeupdate'], this.update);

      if (this.player_.liveTracker) {
        this.on(this.player_.liveTracker, 'liveedgechange', this.update);
      }

      this.off(this.player_, ['playing'], this.enableInterval_);
      this.off(this.player_, ['ended', 'pause', 'waiting'], this.disableInterval_); // we don't need to update the play progress if the document is hidden,
      // also, this causes the CPU to spike and eventually crash the page on IE11.

      if ('hidden' in document && 'visibilityState' in document) {
        this.off(document, 'visibilitychange', this.toggleVisibility_);
      }

      _Slider.prototype.dispose.call(this);
    };

    return SeekBar;
  }(Slider);
  /**
   * Default options for the `SeekBar`
   *
   * @type {Object}
   * @private
   */


  SeekBar.prototype.options_ = {
    children: ['loadProgressBar', 'playProgressBar'],
    barName: 'playProgressBar'
  }; // MouseTimeDisplay tooltips should not be added to a player on mobile devices

  if (!IS_IOS && !IS_ANDROID) {
    SeekBar.prototype.options_.children.splice(1, 0, 'mouseTimeDisplay');
  }

  Component.registerComponent('SeekBar', SeekBar);

  /**
   * The Progress Control component contains the seek bar, load progress,
   * and play progress.
   *
   * @extends Component
   */

  var ProgressControl = /*#__PURE__*/function (_Component) {
    inheritsLoose(ProgressControl, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function ProgressControl(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;
      _this.handleMouseMove = throttle(bind(assertThisInitialized(_this), _this.handleMouseMove), UPDATE_REFRESH_INTERVAL);
      _this.throttledHandleMouseSeek = throttle(bind(assertThisInitialized(_this), _this.handleMouseSeek), UPDATE_REFRESH_INTERVAL);

      _this.enable();

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = ProgressControl.prototype;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-progress-control vjs-control'
      });
    }
    /**
     * When the mouse moves over the `ProgressControl`, the pointer position
     * gets passed down to the `MouseTimeDisplay` component.
     *
     * @param {EventTarget~Event} event
     *        The `mousemove` event that caused this function to run.
     *
     * @listen mousemove
     */
    ;

    _proto.handleMouseMove = function handleMouseMove(event) {
      var seekBar = this.getChild('seekBar');

      if (!seekBar) {
        return;
      }

      var playProgressBar = seekBar.getChild('playProgressBar');
      var mouseTimeDisplay = seekBar.getChild('mouseTimeDisplay');

      if (!playProgressBar && !mouseTimeDisplay) {
        return;
      }

      var seekBarEl = seekBar.el();
      var seekBarRect = findPosition(seekBarEl);
      var seekBarPoint = getPointerPosition(seekBarEl, event).x; // The default skin has a gap on either side of the `SeekBar`. This means
      // that it's possible to trigger this behavior outside the boundaries of
      // the `SeekBar`. This ensures we stay within it at all times.

      seekBarPoint = clamp(seekBarPoint, 0, 1);

      if (mouseTimeDisplay) {
        mouseTimeDisplay.update(seekBarRect, seekBarPoint);
      }

      if (playProgressBar) {
        playProgressBar.update(seekBarRect, seekBar.getProgress());
      }
    }
    /**
     * A throttled version of the {@link ProgressControl#handleMouseSeek} listener.
     *
     * @method ProgressControl#throttledHandleMouseSeek
     * @param {EventTarget~Event} event
     *        The `mousemove` event that caused this function to run.
     *
     * @listen mousemove
     * @listen touchmove
     */

    /**
     * Handle `mousemove` or `touchmove` events on the `ProgressControl`.
     *
     * @param {EventTarget~Event} event
     *        `mousedown` or `touchstart` event that triggered this function
     *
     * @listens mousemove
     * @listens touchmove
     */
    ;

    _proto.handleMouseSeek = function handleMouseSeek(event) {
      var seekBar = this.getChild('seekBar');

      if (seekBar) {
        seekBar.handleMouseMove(event);
      }
    }
    /**
     * Are controls are currently enabled for this progress control.
     *
     * @return {boolean}
     *         true if controls are enabled, false otherwise
     */
    ;

    _proto.enabled = function enabled() {
      return this.enabled_;
    }
    /**
     * Disable all controls on the progress control and its children
     */
    ;

    _proto.disable = function disable() {
      this.children().forEach(function (child) {
        return child.disable && child.disable();
      });

      if (!this.enabled()) {
        return;
      }

      this.off(['mousedown', 'touchstart'], this.handleMouseDown);
      this.off(this.el_, 'mousemove', this.handleMouseMove);
      this.handleMouseUp();
      this.addClass('disabled');
      this.enabled_ = false;
    }
    /**
     * Enable all controls on the progress control and its children
     */
    ;

    _proto.enable = function enable() {
      this.children().forEach(function (child) {
        return child.enable && child.enable();
      });

      if (this.enabled()) {
        return;
      }

      this.on(['mousedown', 'touchstart'], this.handleMouseDown);
      this.on(this.el_, 'mousemove', this.handleMouseMove);
      this.removeClass('disabled');
      this.enabled_ = true;
    }
    /**
     * Handle `mousedown` or `touchstart` events on the `ProgressControl`.
     *
     * @param {EventTarget~Event} event
     *        `mousedown` or `touchstart` event that triggered this function
     *
     * @listens mousedown
     * @listens touchstart
     */
    ;

    _proto.handleMouseDown = function handleMouseDown(event) {
      var doc = this.el_.ownerDocument;
      var seekBar = this.getChild('seekBar');

      if (seekBar) {
        seekBar.handleMouseDown(event);
      }

      this.on(doc, 'mousemove', this.throttledHandleMouseSeek);
      this.on(doc, 'touchmove', this.throttledHandleMouseSeek);
      this.on(doc, 'mouseup', this.handleMouseUp);
      this.on(doc, 'touchend', this.handleMouseUp);
    }
    /**
     * Handle `mouseup` or `touchend` events on the `ProgressControl`.
     *
     * @param {EventTarget~Event} event
     *        `mouseup` or `touchend` event that triggered this function.
     *
     * @listens touchend
     * @listens mouseup
     */
    ;

    _proto.handleMouseUp = function handleMouseUp(event) {
      var doc = this.el_.ownerDocument;
      var seekBar = this.getChild('seekBar');

      if (seekBar) {
        seekBar.handleMouseUp(event);
      }

      this.off(doc, 'mousemove', this.throttledHandleMouseSeek);
      this.off(doc, 'touchmove', this.throttledHandleMouseSeek);
      this.off(doc, 'mouseup', this.handleMouseUp);
      this.off(doc, 'touchend', this.handleMouseUp);
    };

    return ProgressControl;
  }(Component);
  /**
   * Default options for `ProgressControl`
   *
   * @type {Object}
   * @private
   */


  ProgressControl.prototype.options_ = {
    children: ['seekBar']
  };
  Component.registerComponent('ProgressControl', ProgressControl);

  /**
   * Toggle Picture-in-Picture mode
   *
   * @extends Button
   */

  var PictureInPictureToggle = /*#__PURE__*/function (_Button) {
    inheritsLoose(PictureInPictureToggle, _Button);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @listens Player#enterpictureinpicture
     * @listens Player#leavepictureinpicture
     */
    function PictureInPictureToggle(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this;

      _this.on(player, ['enterpictureinpicture', 'leavepictureinpicture'], _this.handlePictureInPictureChange);

      _this.on(player, ['disablepictureinpicturechanged', 'loadedmetadata'], _this.handlePictureInPictureEnabledChange); // TODO: Deactivate button on player emptied event.


      _this.disable();

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = PictureInPictureToggle.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-picture-in-picture-control " + _Button.prototype.buildCSSClass.call(this);
    }
    /**
     * Enables or disables button based on document.pictureInPictureEnabled property value
     * or on value returned by player.disablePictureInPicture() method.
     */
    ;

    _proto.handlePictureInPictureEnabledChange = function handlePictureInPictureEnabledChange() {
      if (document.pictureInPictureEnabled && this.player_.disablePictureInPicture() === false) {
        this.enable();
      } else {
        this.disable();
      }
    }
    /**
     * Handles enterpictureinpicture and leavepictureinpicture on the player and change control text accordingly.
     *
     * @param {EventTarget~Event} [event]
     *        The {@link Player#enterpictureinpicture} or {@link Player#leavepictureinpicture} event that caused this function to be
     *        called.
     *
     * @listens Player#enterpictureinpicture
     * @listens Player#leavepictureinpicture
     */
    ;

    _proto.handlePictureInPictureChange = function handlePictureInPictureChange(event) {
      if (this.player_.isInPictureInPicture()) {
        this.controlText('Exit Picture-in-Picture');
      } else {
        this.controlText('Picture-in-Picture');
      }

      this.handlePictureInPictureEnabledChange();
    }
    /**
     * This gets called when an `PictureInPictureToggle` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      if (!this.player_.isInPictureInPicture()) {
        this.player_.requestPictureInPicture();
      } else {
        this.player_.exitPictureInPicture();
      }
    };

    return PictureInPictureToggle;
  }(Button);
  /**
   * The text that should display over the `PictureInPictureToggle`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */


  PictureInPictureToggle.prototype.controlText_ = 'Picture-in-Picture';
  Component.registerComponent('PictureInPictureToggle', PictureInPictureToggle);

  /**
   * Toggle fullscreen video
   *
   * @extends Button
   */

  var FullscreenToggle = /*#__PURE__*/function (_Button) {
    inheritsLoose(FullscreenToggle, _Button);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function FullscreenToggle(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this;

      _this.on(player, 'fullscreenchange', _this.handleFullscreenChange);

      if (document[player.fsApi_.fullscreenEnabled] === false) {
        _this.disable();
      }

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = FullscreenToggle.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-fullscreen-control " + _Button.prototype.buildCSSClass.call(this);
    }
    /**
     * Handles fullscreenchange on the player and change control text accordingly.
     *
     * @param {EventTarget~Event} [event]
     *        The {@link Player#fullscreenchange} event that caused this function to be
     *        called.
     *
     * @listens Player#fullscreenchange
     */
    ;

    _proto.handleFullscreenChange = function handleFullscreenChange(event) {
      if (this.player_.isFullscreen()) {
        this.controlText('Non-Fullscreen');
      } else {
        this.controlText('Fullscreen');
      }
    }
    /**
     * This gets called when an `FullscreenToggle` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      if (!this.player_.isFullscreen()) {
        this.player_.requestFullscreen();
      } else {
        this.player_.exitFullscreen();
      }
    };

    return FullscreenToggle;
  }(Button);
  /**
   * The text that should display over the `FullscreenToggle`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */


  FullscreenToggle.prototype.controlText_ = 'Fullscreen';
  Component.registerComponent('FullscreenToggle', FullscreenToggle);

  /**
   * Check if volume control is supported and if it isn't hide the
   * `Component` that was passed  using the `vjs-hidden` class.
   *
   * @param {Component} self
   *        The component that should be hidden if volume is unsupported
   *
   * @param {Player} player
   *        A reference to the player
   *
   * @private
   */
  var checkVolumeSupport = function checkVolumeSupport(self, player) {
    // hide volume controls when they're not supported by the current tech
    if (player.tech_ && !player.tech_.featuresVolumeControl) {
      self.addClass('vjs-hidden');
    }

    self.on(player, 'loadstart', function () {
      if (!player.tech_.featuresVolumeControl) {
        self.addClass('vjs-hidden');
      } else {
        self.removeClass('vjs-hidden');
      }
    });
  };

  /**
   * Shows volume level
   *
   * @extends Component
   */

  var VolumeLevel = /*#__PURE__*/function (_Component) {
    inheritsLoose(VolumeLevel, _Component);

    function VolumeLevel() {
      return _Component.apply(this, arguments) || this;
    }

    var _proto = VolumeLevel.prototype;

    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */
    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-level',
        innerHTML: '<span class="vjs-control-text"></span>'
      });
    };

    return VolumeLevel;
  }(Component);

  Component.registerComponent('VolumeLevel', VolumeLevel);

  /**
   * The bar that contains the volume level and can be clicked on to adjust the level
   *
   * @extends Slider
   */

  var VolumeBar = /*#__PURE__*/function (_Slider) {
    inheritsLoose(VolumeBar, _Slider);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function VolumeBar(player, options) {
      var _this;

      _this = _Slider.call(this, player, options) || this;

      _this.on('slideractive', _this.updateLastVolume_);

      _this.on(player, 'volumechange', _this.updateARIAAttributes);

      player.ready(function () {
        return _this.updateARIAAttributes();
      });
      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = VolumeBar.prototype;

    _proto.createEl = function createEl() {
      return _Slider.prototype.createEl.call(this, 'div', {
        className: 'vjs-volume-bar vjs-slider-bar'
      }, {
        'aria-label': this.localize('Volume Level'),
        'aria-live': 'polite'
      });
    }
    /**
     * Handle mouse down on volume bar
     *
     * @param {EventTarget~Event} event
     *        The `mousedown` event that caused this to run.
     *
     * @listens mousedown
     */
    ;

    _proto.handleMouseDown = function handleMouseDown(event) {
      if (!isSingleLeftClick(event)) {
        return;
      }

      _Slider.prototype.handleMouseDown.call(this, event);
    }
    /**
     * Handle movement events on the {@link VolumeMenuButton}.
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to run.
     *
     * @listens mousemove
     */
    ;

    _proto.handleMouseMove = function handleMouseMove(event) {
      if (!isSingleLeftClick(event)) {
        return;
      }

      this.checkMuted();
      this.player_.volume(this.calculateDistance(event));
    }
    /**
     * If the player is muted unmute it.
     */
    ;

    _proto.checkMuted = function checkMuted() {
      if (this.player_.muted()) {
        this.player_.muted(false);
      }
    }
    /**
     * Get percent of volume level
     *
     * @return {number}
     *         Volume level percent as a decimal number.
     */
    ;

    _proto.getPercent = function getPercent() {
      if (this.player_.muted()) {
        return 0;
      }

      return this.player_.volume();
    }
    /**
     * Increase volume level for keyboard users
     */
    ;

    _proto.stepForward = function stepForward() {
      this.checkMuted();
      this.player_.volume(this.player_.volume() + 0.1);
    }
    /**
     * Decrease volume level for keyboard users
     */
    ;

    _proto.stepBack = function stepBack() {
      this.checkMuted();
      this.player_.volume(this.player_.volume() - 0.1);
    }
    /**
     * Update ARIA accessibility attributes
     *
     * @param {EventTarget~Event} [event]
     *        The `volumechange` event that caused this function to run.
     *
     * @listens Player#volumechange
     */
    ;

    _proto.updateARIAAttributes = function updateARIAAttributes(event) {
      var ariaValue = this.player_.muted() ? 0 : this.volumeAsPercentage_();
      this.el_.setAttribute('aria-valuenow', ariaValue);
      this.el_.setAttribute('aria-valuetext', ariaValue + '%');
    }
    /**
     * Returns the current value of the player volume as a percentage
     *
     * @private
     */
    ;

    _proto.volumeAsPercentage_ = function volumeAsPercentage_() {
      return Math.round(this.player_.volume() * 100);
    }
    /**
     * When user starts dragging the VolumeBar, store the volume and listen for
     * the end of the drag. When the drag ends, if the volume was set to zero,
     * set lastVolume to the stored volume.
     *
     * @listens slideractive
     * @private
     */
    ;

    _proto.updateLastVolume_ = function updateLastVolume_() {
      var _this2 = this;

      var volumeBeforeDrag = this.player_.volume();
      this.one('sliderinactive', function () {
        if (_this2.player_.volume() === 0) {
          _this2.player_.lastVolume_(volumeBeforeDrag);
        }
      });
    };

    return VolumeBar;
  }(Slider);
  /**
   * Default options for the `VolumeBar`
   *
   * @type {Object}
   * @private
   */


  VolumeBar.prototype.options_ = {
    children: ['volumeLevel'],
    barName: 'volumeLevel'
  };
  /**
   * Call the update event for this Slider when this event happens on the player.
   *
   * @type {string}
   */

  VolumeBar.prototype.playerEvent = 'volumechange';
  Component.registerComponent('VolumeBar', VolumeBar);

  /**
   * The component for controlling the volume level
   *
   * @extends Component
   */

  var VolumeControl = /*#__PURE__*/function (_Component) {
    inheritsLoose(VolumeControl, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     */
    function VolumeControl(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      options.vertical = options.vertical || false; // Pass the vertical option down to the VolumeBar if
      // the VolumeBar is turned on.

      if (typeof options.volumeBar === 'undefined' || isPlain(options.volumeBar)) {
        options.volumeBar = options.volumeBar || {};
        options.volumeBar.vertical = options.vertical;
      }

      _this = _Component.call(this, player, options) || this; // hide this control if volume support is missing

      checkVolumeSupport(assertThisInitialized(_this), player);
      _this.throttledHandleMouseMove = throttle(bind(assertThisInitialized(_this), _this.handleMouseMove), UPDATE_REFRESH_INTERVAL);

      _this.on('mousedown', _this.handleMouseDown);

      _this.on('touchstart', _this.handleMouseDown); // while the slider is active (the mouse has been pressed down and
      // is dragging) or in focus we do not want to hide the VolumeBar


      _this.on(_this.volumeBar, ['focus', 'slideractive'], function () {
        _this.volumeBar.addClass('vjs-slider-active');

        _this.addClass('vjs-slider-active');

        _this.trigger('slideractive');
      });

      _this.on(_this.volumeBar, ['blur', 'sliderinactive'], function () {
        _this.volumeBar.removeClass('vjs-slider-active');

        _this.removeClass('vjs-slider-active');

        _this.trigger('sliderinactive');
      });

      return _this;
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */


    var _proto = VolumeControl.prototype;

    _proto.createEl = function createEl() {
      var orientationClass = 'vjs-volume-horizontal';

      if (this.options_.vertical) {
        orientationClass = 'vjs-volume-vertical';
      }

      return _Component.prototype.createEl.call(this, 'div', {
        className: "vjs-volume-control vjs-control " + orientationClass
      });
    }
    /**
     * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
     *
     * @param {EventTarget~Event} event
     *        `mousedown` or `touchstart` event that triggered this function
     *
     * @listens mousedown
     * @listens touchstart
     */
    ;

    _proto.handleMouseDown = function handleMouseDown(event) {
      var doc = this.el_.ownerDocument;
      this.on(doc, 'mousemove', this.throttledHandleMouseMove);
      this.on(doc, 'touchmove', this.throttledHandleMouseMove);
      this.on(doc, 'mouseup', this.handleMouseUp);
      this.on(doc, 'touchend', this.handleMouseUp);
    }
    /**
     * Handle `mouseup` or `touchend` events on the `VolumeControl`.
     *
     * @param {EventTarget~Event} event
     *        `mouseup` or `touchend` event that triggered this function.
     *
     * @listens touchend
     * @listens mouseup
     */
    ;

    _proto.handleMouseUp = function handleMouseUp(event) {
      var doc = this.el_.ownerDocument;
      this.off(doc, 'mousemove', this.throttledHandleMouseMove);
      this.off(doc, 'touchmove', this.throttledHandleMouseMove);
      this.off(doc, 'mouseup', this.handleMouseUp);
      this.off(doc, 'touchend', this.handleMouseUp);
    }
    /**
     * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
     *
     * @param {EventTarget~Event} event
     *        `mousedown` or `touchstart` event that triggered this function
     *
     * @listens mousedown
     * @listens touchstart
     */
    ;

    _proto.handleMouseMove = function handleMouseMove(event) {
      this.volumeBar.handleMouseMove(event);
    };

    return VolumeControl;
  }(Component);
  /**
   * Default options for the `VolumeControl`
   *
   * @type {Object}
   * @private
   */


  VolumeControl.prototype.options_ = {
    children: ['volumeBar']
  };
  Component.registerComponent('VolumeControl', VolumeControl);

  /**
   * Check if muting volume is supported and if it isn't hide the mute toggle
   * button.
   *
   * @param {Component} self
   *        A reference to the mute toggle button
   *
   * @param {Player} player
   *        A reference to the player
   *
   * @private
   */
  var checkMuteSupport = function checkMuteSupport(self, player) {
    // hide mute toggle button if it's not supported by the current tech
    if (player.tech_ && !player.tech_.featuresMuteControl) {
      self.addClass('vjs-hidden');
    }

    self.on(player, 'loadstart', function () {
      if (!player.tech_.featuresMuteControl) {
        self.addClass('vjs-hidden');
      } else {
        self.removeClass('vjs-hidden');
      }
    });
  };

  /**
   * A button component for muting the audio.
   *
   * @extends Button
   */

  var MuteToggle = /*#__PURE__*/function (_Button) {
    inheritsLoose(MuteToggle, _Button);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function MuteToggle(player, options) {
      var _this;

      _this = _Button.call(this, player, options) || this; // hide this control if volume support is missing

      checkMuteSupport(assertThisInitialized(_this), player);

      _this.on(player, ['loadstart', 'volumechange'], _this.update);

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = MuteToggle.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-mute-control " + _Button.prototype.buildCSSClass.call(this);
    }
    /**
     * This gets called when an `MuteToggle` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      var vol = this.player_.volume();
      var lastVolume = this.player_.lastVolume_();

      if (vol === 0) {
        var volumeToSet = lastVolume < 0.1 ? 0.1 : lastVolume;
        this.player_.volume(volumeToSet);
        this.player_.muted(false);
      } else {
        this.player_.muted(this.player_.muted() ? false : true);
      }
    }
    /**
     * Update the `MuteToggle` button based on the state of `volume` and `muted`
     * on the player.
     *
     * @param {EventTarget~Event} [event]
     *        The {@link Player#loadstart} event if this function was called
     *        through an event.
     *
     * @listens Player#loadstart
     * @listens Player#volumechange
     */
    ;

    _proto.update = function update(event) {
      this.updateIcon_();
      this.updateControlText_();
    }
    /**
     * Update the appearance of the `MuteToggle` icon.
     *
     * Possible states (given `level` variable below):
     * - 0: crossed out
     * - 1: zero bars of volume
     * - 2: one bar of volume
     * - 3: two bars of volume
     *
     * @private
     */
    ;

    _proto.updateIcon_ = function updateIcon_() {
      var vol = this.player_.volume();
      var level = 3; // in iOS when a player is loaded with muted attribute
      // and volume is changed with a native mute button
      // we want to make sure muted state is updated

      if (IS_IOS && this.player_.tech_ && this.player_.tech_.el_) {
        this.player_.muted(this.player_.tech_.el_.muted);
      }

      if (vol === 0 || this.player_.muted()) {
        level = 0;
      } else if (vol < 0.33) {
        level = 1;
      } else if (vol < 0.67) {
        level = 2;
      } // TODO improve muted icon classes


      for (var i = 0; i < 4; i++) {
        removeClass(this.el_, "vjs-vol-" + i);
      }

      addClass(this.el_, "vjs-vol-" + level);
    }
    /**
     * If `muted` has changed on the player, update the control text
     * (`title` attribute on `vjs-mute-control` element and content of
     * `vjs-control-text` element).
     *
     * @private
     */
    ;

    _proto.updateControlText_ = function updateControlText_() {
      var soundOff = this.player_.muted() || this.player_.volume() === 0;
      var text = soundOff ? 'Unmute' : 'Mute';

      if (this.controlText() !== text) {
        this.controlText(text);
      }
    };

    return MuteToggle;
  }(Button);
  /**
   * The text that should display over the `MuteToggle`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */


  MuteToggle.prototype.controlText_ = 'Mute';
  Component.registerComponent('MuteToggle', MuteToggle);

  /**
   * A Component to contain the MuteToggle and VolumeControl so that
   * they can work together.
   *
   * @extends Component
   */

  var VolumePanel = /*#__PURE__*/function (_Component) {
    inheritsLoose(VolumePanel, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     */
    function VolumePanel(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      if (typeof options.inline !== 'undefined') {
        options.inline = options.inline;
      } else {
        options.inline = true;
      } // pass the inline option down to the VolumeControl as vertical if
      // the VolumeControl is on.


      if (typeof options.volumeControl === 'undefined' || isPlain(options.volumeControl)) {
        options.volumeControl = options.volumeControl || {};
        options.volumeControl.vertical = !options.inline;
      }

      _this = _Component.call(this, player, options) || this;

      _this.on(player, ['loadstart'], _this.volumePanelState_);

      _this.on(_this.muteToggle, 'keyup', _this.handleKeyPress);

      _this.on(_this.volumeControl, 'keyup', _this.handleVolumeControlKeyUp);

      _this.on('keydown', _this.handleKeyPress);

      _this.on('mouseover', _this.handleMouseOver);

      _this.on('mouseout', _this.handleMouseOut); // while the slider is active (the mouse has been pressed down and
      // is dragging) we do not want to hide the VolumeBar


      _this.on(_this.volumeControl, ['slideractive'], _this.sliderActive_);

      _this.on(_this.volumeControl, ['sliderinactive'], _this.sliderInactive_);

      return _this;
    }
    /**
     * Add vjs-slider-active class to the VolumePanel
     *
     * @listens VolumeControl#slideractive
     * @private
     */


    var _proto = VolumePanel.prototype;

    _proto.sliderActive_ = function sliderActive_() {
      this.addClass('vjs-slider-active');
    }
    /**
     * Removes vjs-slider-active class to the VolumePanel
     *
     * @listens VolumeControl#sliderinactive
     * @private
     */
    ;

    _proto.sliderInactive_ = function sliderInactive_() {
      this.removeClass('vjs-slider-active');
    }
    /**
     * Adds vjs-hidden or vjs-mute-toggle-only to the VolumePanel
     * depending on MuteToggle and VolumeControl state
     *
     * @listens Player#loadstart
     * @private
     */
    ;

    _proto.volumePanelState_ = function volumePanelState_() {
      // hide volume panel if neither volume control or mute toggle
      // are displayed
      if (this.volumeControl.hasClass('vjs-hidden') && this.muteToggle.hasClass('vjs-hidden')) {
        this.addClass('vjs-hidden');
      } // if only mute toggle is visible we don't want
      // volume panel expanding when hovered or active


      if (this.volumeControl.hasClass('vjs-hidden') && !this.muteToggle.hasClass('vjs-hidden')) {
        this.addClass('vjs-mute-toggle-only');
      }
    }
    /**
     * Create the `Component`'s DOM element
     *
     * @return {Element}
     *         The element that was created.
     */
    ;

    _proto.createEl = function createEl() {
      var orientationClass = 'vjs-volume-panel-horizontal';

      if (!this.options_.inline) {
        orientationClass = 'vjs-volume-panel-vertical';
      }

      return _Component.prototype.createEl.call(this, 'div', {
        className: "vjs-volume-panel vjs-control " + orientationClass
      });
    }
    /**
     * Dispose of the `volume-panel` and all child components.
     */
    ;

    _proto.dispose = function dispose() {
      this.handleMouseOut();

      _Component.prototype.dispose.call(this);
    }
    /**
     * Handles `keyup` events on the `VolumeControl`, looking for ESC, which closes
     * the volume panel and sets focus on `MuteToggle`.
     *
     * @param {EventTarget~Event} event
     *        The `keyup` event that caused this function to be called.
     *
     * @listens keyup
     */
    ;

    _proto.handleVolumeControlKeyUp = function handleVolumeControlKeyUp(event) {
      if (keycode.isEventKey(event, 'Esc')) {
        this.muteToggle.focus();
      }
    }
    /**
     * This gets called when a `VolumePanel` gains hover via a `mouseover` event.
     * Turns on listening for `mouseover` event. When they happen it
     * calls `this.handleMouseOver`.
     *
     * @param {EventTarget~Event} event
     *        The `mouseover` event that caused this function to be called.
     *
     * @listens mouseover
     */
    ;

    _proto.handleMouseOver = function handleMouseOver(event) {
      this.addClass('vjs-hover');
      on(document, 'keyup', bind(this, this.handleKeyPress));
    }
    /**
     * This gets called when a `VolumePanel` gains hover via a `mouseout` event.
     * Turns on listening for `mouseout` event. When they happen it
     * calls `this.handleMouseOut`.
     *
     * @param {EventTarget~Event} event
     *        The `mouseout` event that caused this function to be called.
     *
     * @listens mouseout
     */
    ;

    _proto.handleMouseOut = function handleMouseOut(event) {
      this.removeClass('vjs-hover');
      off(document, 'keyup', bind(this, this.handleKeyPress));
    }
    /**
     * Handles `keyup` event on the document or `keydown` event on the `VolumePanel`,
     * looking for ESC, which hides the `VolumeControl`.
     *
     * @param {EventTarget~Event} event
     *        The keypress that triggered this event.
     *
     * @listens keydown | keyup
     */
    ;

    _proto.handleKeyPress = function handleKeyPress(event) {
      if (keycode.isEventKey(event, 'Esc')) {
        this.handleMouseOut();
      }
    };

    return VolumePanel;
  }(Component);
  /**
   * Default options for the `VolumeControl`
   *
   * @type {Object}
   * @private
   */


  VolumePanel.prototype.options_ = {
    children: ['muteToggle', 'volumeControl']
  };
  Component.registerComponent('VolumePanel', VolumePanel);

  /**
   * The Menu component is used to build popup menus, including subtitle and
   * captions selection menus.
   *
   * @extends Component
   */

  var Menu = /*#__PURE__*/function (_Component) {
    inheritsLoose(Menu, _Component);

    /**
     * Create an instance of this class.
     *
     * @param {Player} player
     *        the player that this component should attach to
     *
     * @param {Object} [options]
     *        Object of option names and values
     *
     */
    function Menu(player, options) {
      var _this;

      _this = _Component.call(this, player, options) || this;

      if (options) {
        _this.menuButton_ = options.menuButton;
      }

      _this.focusedChild_ = -1;

      _this.on('keydown', _this.handleKeyDown); // All the menu item instances share the same blur handler provided by the menu container.


      _this.boundHandleBlur_ = bind(assertThisInitialized(_this), _this.handleBlur);
      _this.boundHandleTapClick_ = bind(assertThisInitialized(_this), _this.handleTapClick);
      return _this;
    }
    /**
     * Add event listeners to the {@link MenuItem}.
     *
     * @param {Object} component
     *        The instance of the `MenuItem` to add listeners to.
     *
     */


    var _proto = Menu.prototype;

    _proto.addEventListenerForItem = function addEventListenerForItem(component) {
      if (!(component instanceof Component)) {
        return;
      }

      this.on(component, 'blur', this.boundHandleBlur_);
      this.on(component, ['tap', 'click'], this.boundHandleTapClick_);
    }
    /**
     * Remove event listeners from the {@link MenuItem}.
     *
     * @param {Object} component
     *        The instance of the `MenuItem` to remove listeners.
     *
     */
    ;

    _proto.removeEventListenerForItem = function removeEventListenerForItem(component) {
      if (!(component instanceof Component)) {
        return;
      }

      this.off(component, 'blur', this.boundHandleBlur_);
      this.off(component, ['tap', 'click'], this.boundHandleTapClick_);
    }
    /**
     * This method will be called indirectly when the component has been added
     * before the component adds to the new menu instance by `addItem`.
     * In this case, the original menu instance will remove the component
     * by calling `removeChild`.
     *
     * @param {Object} component
     *        The instance of the `MenuItem`
     */
    ;

    _proto.removeChild = function removeChild(component) {
      if (typeof component === 'string') {
        component = this.getChild(component);
      }

      this.removeEventListenerForItem(component);

      _Component.prototype.removeChild.call(this, component);
    }
    /**
     * Add a {@link MenuItem} to the menu.
     *
     * @param {Object|string} component
     *        The name or instance of the `MenuItem` to add.
     *
     */
    ;

    _proto.addItem = function addItem(component) {
      var childComponent = this.addChild(component);

      if (childComponent) {
        this.addEventListenerForItem(childComponent);
      }
    }
    /**
     * Create the `Menu`s DOM element.
     *
     * @return {Element}
     *         the element that was created
     */
    ;

    _proto.createEl = function createEl$1() {
      var contentElType = this.options_.contentElType || 'ul';
      this.contentEl_ = createEl(contentElType, {
        className: 'vjs-menu-content'
      });
      this.contentEl_.setAttribute('role', 'menu');

      var el = _Component.prototype.createEl.call(this, 'div', {
        append: this.contentEl_,
        className: 'vjs-menu'
      });

      el.appendChild(this.contentEl_); // Prevent clicks from bubbling up. Needed for Menu Buttons,
      // where a click on the parent is significant

      on(el, 'click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      });
      return el;
    };

    _proto.dispose = function dispose() {
      this.contentEl_ = null;
      this.boundHandleBlur_ = null;
      this.boundHandleTapClick_ = null;

      _Component.prototype.dispose.call(this);
    }
    /**
     * Called when a `MenuItem` loses focus.
     *
     * @param {EventTarget~Event} event
     *        The `blur` event that caused this function to be called.
     *
     * @listens blur
     */
    ;

    _proto.handleBlur = function handleBlur(event) {
      var relatedTarget = event.relatedTarget || document.activeElement; // Close menu popup when a user clicks outside the menu

      if (!this.children().some(function (element) {
        return element.el() === relatedTarget;
      })) {
        var btn = this.menuButton_;

        if (btn && btn.buttonPressed_ && relatedTarget !== btn.el().firstChild) {
          btn.unpressButton();
        }
      }
    }
    /**
     * Called when a `MenuItem` gets clicked or tapped.
     *
     * @param {EventTarget~Event} event
     *        The `click` or `tap` event that caused this function to be called.
     *
     * @listens click,tap
     */
    ;

    _proto.handleTapClick = function handleTapClick(event) {
      // Unpress the associated MenuButton, and move focus back to it
      if (this.menuButton_) {
        this.menuButton_.unpressButton();
        var childComponents = this.children();

        if (!Array.isArray(childComponents)) {
          return;
        }

        var foundComponent = childComponents.filter(function (component) {
          return component.el() === event.target;
        })[0];

        if (!foundComponent) {
          return;
        } // don't focus menu button if item is a caption settings item
        // because focus will move elsewhere


        if (foundComponent.name() !== 'CaptionSettingsMenuItem') {
          this.menuButton_.focus();
        }
      }
    }
    /**
     * Handle a `keydown` event on this menu. This listener is added in the constructor.
     *
     * @param {EventTarget~Event} event
     *        A `keydown` event that happened on the menu.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Left and Down Arrows
      if (keycode.isEventKey(event, 'Left') || keycode.isEventKey(event, 'Down')) {
        event.preventDefault();
        event.stopPropagation();
        this.stepForward(); // Up and Right Arrows
      } else if (keycode.isEventKey(event, 'Right') || keycode.isEventKey(event, 'Up')) {
        event.preventDefault();
        event.stopPropagation();
        this.stepBack();
      }
    }
    /**
     * Move to next (lower) menu item for keyboard users.
     */
    ;

    _proto.stepForward = function stepForward() {
      var stepChild = 0;

      if (this.focusedChild_ !== undefined) {
        stepChild = this.focusedChild_ + 1;
      }

      this.focus(stepChild);
    }
    /**
     * Move to previous (higher) menu item for keyboard users.
     */
    ;

    _proto.stepBack = function stepBack() {
      var stepChild = 0;

      if (this.focusedChild_ !== undefined) {
        stepChild = this.focusedChild_ - 1;
      }

      this.focus(stepChild);
    }
    /**
     * Set focus on a {@link MenuItem} in the `Menu`.
     *
     * @param {Object|string} [item=0]
     *        Index of child item set focus on.
     */
    ;

    _proto.focus = function focus(item) {
      if (item === void 0) {
        item = 0;
      }

      var children = this.children().slice();
      var haveTitle = children.length && children[0].className && /vjs-menu-title/.test(children[0].className);

      if (haveTitle) {
        children.shift();
      }

      if (children.length > 0) {
        if (item < 0) {
          item = 0;
        } else if (item >= children.length) {
          item = children.length - 1;
        }

        this.focusedChild_ = item;
        children[item].el_.focus();
      }
    };

    return Menu;
  }(Component);

  Component.registerComponent('Menu', Menu);

  /**
   * A `MenuButton` class for any popup {@link Menu}.
   *
   * @extends Component
   */

  var MenuButton = /*#__PURE__*/function (_Component) {
    inheritsLoose(MenuButton, _Component);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     */
    function MenuButton(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _Component.call(this, player, options) || this;
      _this.menuButton_ = new Button(player, options);

      _this.menuButton_.controlText(_this.controlText_);

      _this.menuButton_.el_.setAttribute('aria-haspopup', 'true'); // Add buildCSSClass values to the button, not the wrapper


      var buttonClass = Button.prototype.buildCSSClass();
      _this.menuButton_.el_.className = _this.buildCSSClass() + ' ' + buttonClass;

      _this.menuButton_.removeClass('vjs-control');

      _this.addChild(_this.menuButton_);

      _this.update();

      _this.enabled_ = true;

      _this.on(_this.menuButton_, 'tap', _this.handleClick);

      _this.on(_this.menuButton_, 'click', _this.handleClick);

      _this.on(_this.menuButton_, 'keydown', _this.handleKeyDown);

      _this.on(_this.menuButton_, 'mouseenter', function () {
        _this.addClass('vjs-hover');

        _this.menu.show();

        on(document, 'keyup', bind(assertThisInitialized(_this), _this.handleMenuKeyUp));
      });

      _this.on('mouseleave', _this.handleMouseLeave);

      _this.on('keydown', _this.handleSubmenuKeyDown);

      return _this;
    }
    /**
     * Update the menu based on the current state of its items.
     */


    var _proto = MenuButton.prototype;

    _proto.update = function update() {
      var menu = this.createMenu();

      if (this.menu) {
        this.menu.dispose();
        this.removeChild(this.menu);
      }

      this.menu = menu;
      this.addChild(menu);
      /**
       * Track the state of the menu button
       *
       * @type {Boolean}
       * @private
       */

      this.buttonPressed_ = false;
      this.menuButton_.el_.setAttribute('aria-expanded', 'false');

      if (this.items && this.items.length <= this.hideThreshold_) {
        this.hide();
      } else {
        this.show();
      }
    }
    /**
     * Create the menu and add all items to it.
     *
     * @return {Menu}
     *         The constructed menu
     */
    ;

    _proto.createMenu = function createMenu() {
      var menu = new Menu(this.player_, {
        menuButton: this
      });
      /**
       * Hide the menu if the number of items is less than or equal to this threshold. This defaults
       * to 0 and whenever we add items which can be hidden to the menu we'll increment it. We list
       * it here because every time we run `createMenu` we need to reset the value.
       *
       * @protected
       * @type {Number}
       */

      this.hideThreshold_ = 0; // Add a title list item to the top

      if (this.options_.title) {
        var titleEl = createEl('li', {
          className: 'vjs-menu-title',
          innerHTML: toTitleCase(this.options_.title),
          tabIndex: -1
        });
        this.hideThreshold_ += 1;
        var titleComponent = new Component(this.player_, {
          el: titleEl
        });
        menu.addItem(titleComponent);
      }

      this.items = this.createItems();

      if (this.items) {
        // Add menu items to the menu
        for (var i = 0; i < this.items.length; i++) {
          menu.addItem(this.items[i]);
        }
      }

      return menu;
    }
    /**
     * Create the list of menu items. Specific to each subclass.
     *
     * @abstract
     */
    ;

    _proto.createItems = function createItems() {}
    /**
     * Create the `MenuButtons`s DOM element.
     *
     * @return {Element}
     *         The element that gets created.
     */
    ;

    _proto.createEl = function createEl() {
      return _Component.prototype.createEl.call(this, 'div', {
        className: this.buildWrapperCSSClass()
      }, {});
    }
    /**
     * Allow sub components to stack CSS class names for the wrapper element
     *
     * @return {string}
     *         The constructed wrapper DOM `className`
     */
    ;

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      var menuButtonClass = 'vjs-menu-button'; // If the inline option is passed, we want to use different styles altogether.

      if (this.options_.inline === true) {
        menuButtonClass += '-inline';
      } else {
        menuButtonClass += '-popup';
      } // TODO: Fix the CSS so that this isn't necessary


      var buttonClass = Button.prototype.buildCSSClass();
      return "vjs-menu-button " + menuButtonClass + " " + buttonClass + " " + _Component.prototype.buildCSSClass.call(this);
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      var menuButtonClass = 'vjs-menu-button'; // If the inline option is passed, we want to use different styles altogether.

      if (this.options_.inline === true) {
        menuButtonClass += '-inline';
      } else {
        menuButtonClass += '-popup';
      }

      return "vjs-menu-button " + menuButtonClass + " " + _Component.prototype.buildCSSClass.call(this);
    }
    /**
     * Get or set the localized control text that will be used for accessibility.
     *
     * > NOTE: This will come from the internal `menuButton_` element.
     *
     * @param {string} [text]
     *        Control text for element.
     *
     * @param {Element} [el=this.menuButton_.el()]
     *        Element to set the title on.
     *
     * @return {string}
     *         - The control text when getting
     */
    ;

    _proto.controlText = function controlText(text, el) {
      if (el === void 0) {
        el = this.menuButton_.el();
      }

      return this.menuButton_.controlText(text, el);
    }
    /**
     * Dispose of the `menu-button` and all child components.
     */
    ;

    _proto.dispose = function dispose() {
      this.handleMouseLeave();

      _Component.prototype.dispose.call(this);
    }
    /**
     * Handle a click on a `MenuButton`.
     * See {@link ClickableComponent#handleClick} for instances where this is called.
     *
     * @param {EventTarget~Event} event
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      if (this.buttonPressed_) {
        this.unpressButton();
      } else {
        this.pressButton();
      }
    }
    /**
     * Handle `mouseleave` for `MenuButton`.
     *
     * @param {EventTarget~Event} event
     *        The `mouseleave` event that caused this function to be called.
     *
     * @listens mouseleave
     */
    ;

    _proto.handleMouseLeave = function handleMouseLeave(event) {
      this.removeClass('vjs-hover');
      off(document, 'keyup', bind(this, this.handleMenuKeyUp));
    }
    /**
     * Set the focus to the actual button, not to this element
     */
    ;

    _proto.focus = function focus() {
      this.menuButton_.focus();
    }
    /**
     * Remove the focus from the actual button, not this element
     */
    ;

    _proto.blur = function blur() {
      this.menuButton_.blur();
    }
    /**
     * Handle tab, escape, down arrow, and up arrow keys for `MenuButton`. See
     * {@link ClickableComponent#handleKeyDown} for instances where this is called.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      // Escape or Tab unpress the 'button'
      if (keycode.isEventKey(event, 'Esc') || keycode.isEventKey(event, 'Tab')) {
        if (this.buttonPressed_) {
          this.unpressButton();
        } // Don't preventDefault for Tab key - we still want to lose focus


        if (!keycode.isEventKey(event, 'Tab')) {
          event.preventDefault(); // Set focus back to the menu button's button

          this.menuButton_.focus();
        } // Up Arrow or Down Arrow also 'press' the button to open the menu

      } else if (keycode.isEventKey(event, 'Up') || keycode.isEventKey(event, 'Down')) {
        if (!this.buttonPressed_) {
          event.preventDefault();
          this.pressButton();
        }
      }
    }
    /**
     * Handle a `keyup` event on a `MenuButton`. The listener for this is added in
     * the constructor.
     *
     * @param {EventTarget~Event} event
     *        Key press event
     *
     * @listens keyup
     */
    ;

    _proto.handleMenuKeyUp = function handleMenuKeyUp(event) {
      // Escape hides popup menu
      if (keycode.isEventKey(event, 'Esc') || keycode.isEventKey(event, 'Tab')) {
        this.removeClass('vjs-hover');
      }
    }
    /**
     * This method name now delegates to `handleSubmenuKeyDown`. This means
     * anyone calling `handleSubmenuKeyPress` will not see their method calls
     * stop working.
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to be called.
     */
    ;

    _proto.handleSubmenuKeyPress = function handleSubmenuKeyPress(event) {
      this.handleSubmenuKeyDown(event);
    }
    /**
     * Handle a `keydown` event on a sub-menu. The listener for this is added in
     * the constructor.
     *
     * @param {EventTarget~Event} event
     *        Key press event
     *
     * @listens keydown
     */
    ;

    _proto.handleSubmenuKeyDown = function handleSubmenuKeyDown(event) {
      // Escape or Tab unpress the 'button'
      if (keycode.isEventKey(event, 'Esc') || keycode.isEventKey(event, 'Tab')) {
        if (this.buttonPressed_) {
          this.unpressButton();
        } // Don't preventDefault for Tab key - we still want to lose focus


        if (!keycode.isEventKey(event, 'Tab')) {
          event.preventDefault(); // Set focus back to the menu button's button

          this.menuButton_.focus();
        }
      }
    }
    /**
     * Put the current `MenuButton` into a pressed state.
     */
    ;

    _proto.pressButton = function pressButton() {
      if (this.enabled_) {
        this.buttonPressed_ = true;
        this.menu.show();
        this.menu.lockShowing();
        this.menuButton_.el_.setAttribute('aria-expanded', 'true'); // set the focus into the submenu, except on iOS where it is resulting in
        // undesired scrolling behavior when the player is in an iframe

        if (IS_IOS && isInFrame()) {
          // Return early so that the menu isn't focused
          return;
        }

        this.menu.focus();
      }
    }
    /**
     * Take the current `MenuButton` out of a pressed state.
     */
    ;

    _proto.unpressButton = function unpressButton() {
      if (this.enabled_) {
        this.buttonPressed_ = false;
        this.menu.unlockShowing();
        this.menu.hide();
        this.menuButton_.el_.setAttribute('aria-expanded', 'false');
      }
    }
    /**
     * Disable the `MenuButton`. Don't allow it to be clicked.
     */
    ;

    _proto.disable = function disable() {
      this.unpressButton();
      this.enabled_ = false;
      this.addClass('vjs-disabled');
      this.menuButton_.disable();
    }
    /**
     * Enable the `MenuButton`. Allow it to be clicked.
     */
    ;

    _proto.enable = function enable() {
      this.enabled_ = true;
      this.removeClass('vjs-disabled');
      this.menuButton_.enable();
    };

    return MenuButton;
  }(Component);

  Component.registerComponent('MenuButton', MenuButton);

  /**
   * The base class for buttons that toggle specific  track types (e.g. subtitles).
   *
   * @extends MenuButton
   */

  var TrackButton = /*#__PURE__*/function (_MenuButton) {
    inheritsLoose(TrackButton, _MenuButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function TrackButton(player, options) {
      var _this;

      var tracks = options.tracks;
      _this = _MenuButton.call(this, player, options) || this;

      if (_this.items.length <= 1) {
        _this.hide();
      }

      if (!tracks) {
        return assertThisInitialized(_this);
      }

      var updateHandler = bind(assertThisInitialized(_this), _this.update);
      tracks.addEventListener('removetrack', updateHandler);
      tracks.addEventListener('addtrack', updateHandler);

      _this.player_.on('ready', updateHandler);

      _this.player_.on('dispose', function () {
        tracks.removeEventListener('removetrack', updateHandler);
        tracks.removeEventListener('addtrack', updateHandler);
      });

      return _this;
    }

    return TrackButton;
  }(MenuButton);

  Component.registerComponent('TrackButton', TrackButton);

  /**
   * @file menu-keys.js
   */

  /**
    * All keys used for operation of a menu (`MenuButton`, `Menu`, and `MenuItem`)
    * Note that 'Enter' and 'Space' are not included here (otherwise they would
    * prevent the `MenuButton` and `MenuItem` from being keyboard-clickable)
    * @typedef MenuKeys
    * @array
    */
  var MenuKeys = ['Tab', 'Esc', 'Up', 'Down', 'Right', 'Left'];

  /**
   * The component for a menu item. `<li>`
   *
   * @extends ClickableComponent
   */

  var MenuItem = /*#__PURE__*/function (_ClickableComponent) {
    inheritsLoose(MenuItem, _ClickableComponent);

    /**
     * Creates an instance of the this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     *
     */
    function MenuItem(player, options) {
      var _this;

      _this = _ClickableComponent.call(this, player, options) || this;
      _this.selectable = options.selectable;
      _this.isSelected_ = options.selected || false;
      _this.multiSelectable = options.multiSelectable;

      _this.selected(_this.isSelected_);

      if (_this.selectable) {
        if (_this.multiSelectable) {
          _this.el_.setAttribute('role', 'menuitemcheckbox');
        } else {
          _this.el_.setAttribute('role', 'menuitemradio');
        }
      } else {
        _this.el_.setAttribute('role', 'menuitem');
      }

      return _this;
    }
    /**
     * Create the `MenuItem's DOM element
     *
     * @param {string} [type=li]
     *        Element's node type, not actually used, always set to `li`.
     *
     * @param {Object} [props={}]
     *        An object of properties that should be set on the element
     *
     * @param {Object} [attrs={}]
     *        An object of attributes that should be set on the element
     *
     * @return {Element}
     *         The element that gets created.
     */


    var _proto = MenuItem.prototype;

    _proto.createEl = function createEl(type, props, attrs) {
      // The control is textual, not just an icon
      this.nonIconControl = true;
      return _ClickableComponent.prototype.createEl.call(this, 'li', assign({
        className: 'vjs-menu-item',
        innerHTML: "<span class=\"vjs-menu-item-text\">" + this.localize(this.options_.label) + "</span>",
        tabIndex: -1
      }, props), attrs);
    }
    /**
     * Ignore keys which are used by the menu, but pass any other ones up. See
     * {@link ClickableComponent#handleKeyDown} for instances where this is called.
     *
     * @param {EventTarget~Event} event
     *        The `keydown` event that caused this function to be called.
     *
     * @listens keydown
     */
    ;

    _proto.handleKeyDown = function handleKeyDown(event) {
      if (!MenuKeys.some(function (key) {
        return keycode.isEventKey(event, key);
      })) {
        // Pass keydown handling up for unused keys
        _ClickableComponent.prototype.handleKeyDown.call(this, event);
      }
    }
    /**
     * Any click on a `MenuItem` puts it into the selected state.
     * See {@link ClickableComponent#handleClick} for instances where this is called.
     *
     * @param {EventTarget~Event} event
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */
    ;

    _proto.handleClick = function handleClick(event) {
      this.selected(true);
    }
    /**
     * Set the state for this menu item as selected or not.
     *
     * @param {boolean} selected
     *        if the menu item is selected or not
     */
    ;

    _proto.selected = function selected(_selected) {
      if (this.selectable) {
        if (_selected) {
          this.addClass('vjs-selected');
          this.el_.setAttribute('aria-checked', 'true'); // aria-checked isn't fully supported by browsers/screen readers,
          // so indicate selected state to screen reader in the control text.

          this.controlText(', selected');
          this.isSelected_ = true;
        } else {
          this.removeClass('vjs-selected');
          this.el_.setAttribute('aria-checked', 'false'); // Indicate un-selected state to screen reader

          this.controlText('');
          this.isSelected_ = false;
        }
      }
    };

    return MenuItem;
  }(ClickableComponent);

  Component.registerComponent('MenuItem', MenuItem);

  /**
   * The specific menu item type for selecting a language within a text track kind
   *
   * @extends MenuItem
   */

  var TextTrackMenuItem = /*#__PURE__*/function (_MenuItem) {
    inheritsLoose(TextTrackMenuItem, _MenuItem);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function TextTrackMenuItem(player, options) {
      var _this;

      var track = options.track;
      var tracks = player.textTracks(); // Modify options for parent MenuItem class's init.

      options.label = track.label || track.language || 'Unknown';
      options.selected = track.mode === 'showing';
      _this = _MenuItem.call(this, player, options) || this;
      _this.track = track; // Determine the relevant kind(s) of tracks for this component and filter
      // out empty kinds.

      _this.kinds = (options.kinds || [options.kind || _this.track.kind]).filter(Boolean);

      var changeHandler = function changeHandler() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.handleTracksChange.apply(assertThisInitialized(_this), args);
      };

      var selectedLanguageChangeHandler = function selectedLanguageChangeHandler() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this.handleSelectedLanguageChange.apply(assertThisInitialized(_this), args);
      };

      player.on(['loadstart', 'texttrackchange'], changeHandler);
      tracks.addEventListener('change', changeHandler);
      tracks.addEventListener('selectedlanguagechange', selectedLanguageChangeHandler);

      _this.on('dispose', function () {
        player.off(['loadstart', 'texttrackchange'], changeHandler);
        tracks.removeEventListener('change', changeHandler);
        tracks.removeEventListener('selectedlanguagechange', selectedLanguageChangeHandler);
      }); // iOS7 doesn't dispatch change events to TextTrackLists when an
      // associated track's mode changes. Without something like
      // Object.observe() (also not present on iOS7), it's not
      // possible to detect changes to the mode attribute and polyfill
      // the change event. As a poor substitute, we manually dispatch
      // change events whenever the controls modify the mode.


      if (tracks.onchange === undefined) {
        var event;

        _this.on(['tap', 'click'], function () {
          if (typeof window$1.Event !== 'object') {
            // Android 2.3 throws an Illegal Constructor error for window.Event
            try {
              event = new window$1.Event('change');
            } catch (err) {// continue regardless of error
            }
          }

          if (!event) {
            event = document.createEvent('Event');
            event.initEvent('change', true, true);
          }

          tracks.dispatchEvent(event);
        });
      } // set the default state based on current tracks


      _this.handleTracksChange();

      return _this;
    }
    /**
     * This gets called when an `TextTrackMenuItem` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} event
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */


    var _proto = TextTrackMenuItem.prototype;

    _proto.handleClick = function handleClick(event) {
      var referenceTrack = this.track;
      var tracks = this.player_.textTracks();

      _MenuItem.prototype.handleClick.call(this, event);

      if (!tracks) {
        return;
      }

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i]; // If the track from the text tracks list is not of the right kind,
        // skip it. We do not want to affect tracks of incompatible kind(s).

        if (this.kinds.indexOf(track.kind) === -1) {
          continue;
        } // If this text track is the component's track and it is not showing,
        // set it to showing.


        if (track === referenceTrack) {
          if (track.mode !== 'showing') {
            track.mode = 'showing';
          } // If this text track is not the component's track and it is not
          // disabled, set it to disabled.

        } else if (track.mode !== 'disabled') {
          track.mode = 'disabled';
        }
      }
    }
    /**
     * Handle text track list change
     *
     * @param {EventTarget~Event} event
     *        The `change` event that caused this function to be called.
     *
     * @listens TextTrackList#change
     */
    ;

    _proto.handleTracksChange = function handleTracksChange(event) {
      var shouldBeSelected = this.track.mode === 'showing'; // Prevent redundant selected() calls because they may cause
      // screen readers to read the appended control text unnecessarily

      if (shouldBeSelected !== this.isSelected_) {
        this.selected(shouldBeSelected);
      }
    };

    _proto.handleSelectedLanguageChange = function handleSelectedLanguageChange(event) {
      if (this.track.mode === 'showing') {
        var selectedLanguage = this.player_.cache_.selectedLanguage; // Don't replace the kind of track across the same language

        if (selectedLanguage && selectedLanguage.enabled && selectedLanguage.language === this.track.language && selectedLanguage.kind !== this.track.kind) {
          return;
        }

        this.player_.cache_.selectedLanguage = {
          enabled: true,
          language: this.track.language,
          kind: this.track.kind
        };
      }
    };

    _proto.dispose = function dispose() {
      // remove reference to track object on dispose
      this.track = null;

      _MenuItem.prototype.dispose.call(this);
    };

    return TextTrackMenuItem;
  }(MenuItem);

  Component.registerComponent('TextTrackMenuItem', TextTrackMenuItem);

  /**
   * A special menu item for turning of a specific type of text track
   *
   * @extends TextTrackMenuItem
   */

  var OffTextTrackMenuItem = /*#__PURE__*/function (_TextTrackMenuItem) {
    inheritsLoose(OffTextTrackMenuItem, _TextTrackMenuItem);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function OffTextTrackMenuItem(player, options) {
      // Create pseudo track info
      // Requires options['kind']
      options.track = {
        player: player,
        // it is no longer necessary to store `kind` or `kinds` on the track itself
        // since they are now stored in the `kinds` property of all instances of
        // TextTrackMenuItem, but this will remain for backwards compatibility
        kind: options.kind,
        kinds: options.kinds,
        "default": false,
        mode: 'disabled'
      };

      if (!options.kinds) {
        options.kinds = [options.kind];
      }

      if (options.label) {
        options.track.label = options.label;
      } else {
        options.track.label = options.kinds.join(' and ') + ' off';
      } // MenuItem is selectable


      options.selectable = true; // MenuItem is NOT multiSelectable (i.e. only one can be marked "selected" at a time)

      options.multiSelectable = false;
      return _TextTrackMenuItem.call(this, player, options) || this;
    }
    /**
     * Handle text track change
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to run
     */


    var _proto = OffTextTrackMenuItem.prototype;

    _proto.handleTracksChange = function handleTracksChange(event) {
      var tracks = this.player().textTracks();
      var shouldBeSelected = true;

      for (var i = 0, l = tracks.length; i < l; i++) {
        var track = tracks[i];

        if (this.options_.kinds.indexOf(track.kind) > -1 && track.mode === 'showing') {
          shouldBeSelected = false;
          break;
        }
      } // Prevent redundant selected() calls because they may cause
      // screen readers to read the appended control text unnecessarily


      if (shouldBeSelected !== this.isSelected_) {
        this.selected(shouldBeSelected);
      }
    };

    _proto.handleSelectedLanguageChange = function handleSelectedLanguageChange(event) {
      var tracks = this.player().textTracks();
      var allHidden = true;

      for (var i = 0, l = tracks.length; i < l; i++) {
        var track = tracks[i];

        if (['captions', 'descriptions', 'subtitles'].indexOf(track.kind) > -1 && track.mode === 'showing') {
          allHidden = false;
          break;
        }
      }

      if (allHidden) {
        this.player_.cache_.selectedLanguage = {
          enabled: false
        };
      }
    };

    return OffTextTrackMenuItem;
  }(TextTrackMenuItem);

  Component.registerComponent('OffTextTrackMenuItem', OffTextTrackMenuItem);

  /**
   * The base class for buttons that toggle specific text track types (e.g. subtitles)
   *
   * @extends MenuButton
   */

  var TextTrackButton = /*#__PURE__*/function (_TrackButton) {
    inheritsLoose(TextTrackButton, _TrackButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options={}]
     *        The key/value store of player options.
     */
    function TextTrackButton(player, options) {
      if (options === void 0) {
        options = {};
      }

      options.tracks = player.textTracks();
      return _TrackButton.call(this, player, options) || this;
    }
    /**
     * Create a menu item for each text track
     *
     * @param {TextTrackMenuItem[]} [items=[]]
     *        Existing array of items to use during creation
     *
     * @return {TextTrackMenuItem[]}
     *         Array of menu items that were created
     */


    var _proto = TextTrackButton.prototype;

    _proto.createItems = function createItems(items, TrackMenuItem) {
      if (items === void 0) {
        items = [];
      }

      if (TrackMenuItem === void 0) {
        TrackMenuItem = TextTrackMenuItem;
      }

      // Label is an override for the [track] off label
      // USed to localise captions/subtitles
      var label;

      if (this.label_) {
        label = this.label_ + " off";
      } // Add an OFF menu item to turn all tracks off


      items.push(new OffTextTrackMenuItem(this.player_, {
        kinds: this.kinds_,
        kind: this.kind_,
        label: label
      }));
      this.hideThreshold_ += 1;
      var tracks = this.player_.textTracks();

      if (!Array.isArray(this.kinds_)) {
        this.kinds_ = [this.kind_];
      }

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i]; // only add tracks that are of an appropriate kind and have a label

        if (this.kinds_.indexOf(track.kind) > -1) {
          var item = new TrackMenuItem(this.player_, {
            track: track,
            kinds: this.kinds_,
            kind: this.kind_,
            // MenuItem is selectable
            selectable: true,
            // MenuItem is NOT multiSelectable (i.e. only one can be marked "selected" at a time)
            multiSelectable: false
          });
          item.addClass("vjs-" + track.kind + "-menu-item");
          items.push(item);
        }
      }

      return items;
    };

    return TextTrackButton;
  }(TrackButton);

  Component.registerComponent('TextTrackButton', TextTrackButton);

  /**
   * The chapter track menu item
   *
   * @extends MenuItem
   */

  var ChaptersTrackMenuItem = /*#__PURE__*/function (_MenuItem) {
    inheritsLoose(ChaptersTrackMenuItem, _MenuItem);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function ChaptersTrackMenuItem(player, options) {
      var _this;

      var track = options.track;
      var cue = options.cue;
      var currentTime = player.currentTime(); // Modify options for parent MenuItem class's init.

      options.selectable = true;
      options.multiSelectable = false;
      options.label = cue.text;
      options.selected = cue.startTime <= currentTime && currentTime < cue.endTime;
      _this = _MenuItem.call(this, player, options) || this;
      _this.track = track;
      _this.cue = cue;
      track.addEventListener('cuechange', bind(assertThisInitialized(_this), _this.update));
      return _this;
    }
    /**
     * This gets called when an `ChaptersTrackMenuItem` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */


    var _proto = ChaptersTrackMenuItem.prototype;

    _proto.handleClick = function handleClick(event) {
      _MenuItem.prototype.handleClick.call(this);

      this.player_.currentTime(this.cue.startTime);
      this.update(this.cue.startTime);
    }
    /**
     * Update chapter menu item
     *
     * @param {EventTarget~Event} [event]
     *        The `cuechange` event that caused this function to run.
     *
     * @listens TextTrack#cuechange
     */
    ;

    _proto.update = function update(event) {
      var cue = this.cue;
      var currentTime = this.player_.currentTime(); // vjs.log(currentTime, cue.startTime);

      this.selected(cue.startTime <= currentTime && currentTime < cue.endTime);
    };

    return ChaptersTrackMenuItem;
  }(MenuItem);

  Component.registerComponent('ChaptersTrackMenuItem', ChaptersTrackMenuItem);

  /**
   * The button component for toggling and selecting chapters
   * Chapters act much differently than other text tracks
   * Cues are navigation vs. other tracks of alternative languages
   *
   * @extends TextTrackButton
   */

  var ChaptersButton = /*#__PURE__*/function (_TextTrackButton) {
    inheritsLoose(ChaptersButton, _TextTrackButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function to call when this function is ready.
     */
    function ChaptersButton(player, options, ready) {
      return _TextTrackButton.call(this, player, options, ready) || this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = ChaptersButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-chapters-button " + _TextTrackButton.prototype.buildCSSClass.call(this);
    };

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      return "vjs-chapters-button " + _TextTrackButton.prototype.buildWrapperCSSClass.call(this);
    }
    /**
     * Update the menu based on the current state of its items.
     *
     * @param {EventTarget~Event} [event]
     *        An event that triggered this function to run.
     *
     * @listens TextTrackList#addtrack
     * @listens TextTrackList#removetrack
     * @listens TextTrackList#change
     */
    ;

    _proto.update = function update(event) {
      if (!this.track_ || event && (event.type === 'addtrack' || event.type === 'removetrack')) {
        this.setTrack(this.findChaptersTrack());
      }

      _TextTrackButton.prototype.update.call(this);
    }
    /**
     * Set the currently selected track for the chapters button.
     *
     * @param {TextTrack} track
     *        The new track to select. Nothing will change if this is the currently selected
     *        track.
     */
    ;

    _proto.setTrack = function setTrack(track) {
      if (this.track_ === track) {
        return;
      }

      if (!this.updateHandler_) {
        this.updateHandler_ = this.update.bind(this);
      } // here this.track_ refers to the old track instance


      if (this.track_) {
        var remoteTextTrackEl = this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);

        if (remoteTextTrackEl) {
          remoteTextTrackEl.removeEventListener('load', this.updateHandler_);
        }

        this.track_ = null;
      }

      this.track_ = track; // here this.track_ refers to the new track instance

      if (this.track_) {
        this.track_.mode = 'hidden';

        var _remoteTextTrackEl = this.player_.remoteTextTrackEls().getTrackElementByTrack_(this.track_);

        if (_remoteTextTrackEl) {
          _remoteTextTrackEl.addEventListener('load', this.updateHandler_);
        }
      }
    }
    /**
     * Find the track object that is currently in use by this ChaptersButton
     *
     * @return {TextTrack|undefined}
     *         The current track or undefined if none was found.
     */
    ;

    _proto.findChaptersTrack = function findChaptersTrack() {
      var tracks = this.player_.textTracks() || [];

      for (var i = tracks.length - 1; i >= 0; i--) {
        // We will always choose the last track as our chaptersTrack
        var track = tracks[i];

        if (track.kind === this.kind_) {
          return track;
        }
      }
    }
    /**
     * Get the caption for the ChaptersButton based on the track label. This will also
     * use the current tracks localized kind as a fallback if a label does not exist.
     *
     * @return {string}
     *         The tracks current label or the localized track kind.
     */
    ;

    _proto.getMenuCaption = function getMenuCaption() {
      if (this.track_ && this.track_.label) {
        return this.track_.label;
      }

      return this.localize(toTitleCase(this.kind_));
    }
    /**
     * Create menu from chapter track
     *
     * @return {Menu}
     *         New menu for the chapter buttons
     */
    ;

    _proto.createMenu = function createMenu() {
      this.options_.title = this.getMenuCaption();
      return _TextTrackButton.prototype.createMenu.call(this);
    }
    /**
     * Create a menu item for each text track
     *
     * @return {TextTrackMenuItem[]}
     *         Array of menu items
     */
    ;

    _proto.createItems = function createItems() {
      var items = [];

      if (!this.track_) {
        return items;
      }

      var cues = this.track_.cues;

      if (!cues) {
        return items;
      }

      for (var i = 0, l = cues.length; i < l; i++) {
        var cue = cues[i];
        var mi = new ChaptersTrackMenuItem(this.player_, {
          track: this.track_,
          cue: cue
        });
        items.push(mi);
      }

      return items;
    };

    return ChaptersButton;
  }(TextTrackButton);
  /**
   * `kind` of TextTrack to look for to associate it with this menu.
   *
   * @type {string}
   * @private
   */


  ChaptersButton.prototype.kind_ = 'chapters';
  /**
   * The text that should display over the `ChaptersButton`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */

  ChaptersButton.prototype.controlText_ = 'Chapters';
  Component.registerComponent('ChaptersButton', ChaptersButton);

  /**
   * The button component for toggling and selecting descriptions
   *
   * @extends TextTrackButton
   */

  var DescriptionsButton = /*#__PURE__*/function (_TextTrackButton) {
    inheritsLoose(DescriptionsButton, _TextTrackButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function to call when this component is ready.
     */
    function DescriptionsButton(player, options, ready) {
      var _this;

      _this = _TextTrackButton.call(this, player, options, ready) || this;
      var tracks = player.textTracks();
      var changeHandler = bind(assertThisInitialized(_this), _this.handleTracksChange);
      tracks.addEventListener('change', changeHandler);

      _this.on('dispose', function () {
        tracks.removeEventListener('change', changeHandler);
      });

      return _this;
    }
    /**
     * Handle text track change
     *
     * @param {EventTarget~Event} event
     *        The event that caused this function to run
     *
     * @listens TextTrackList#change
     */


    var _proto = DescriptionsButton.prototype;

    _proto.handleTracksChange = function handleTracksChange(event) {
      var tracks = this.player().textTracks();
      var disabled = false; // Check whether a track of a different kind is showing

      for (var i = 0, l = tracks.length; i < l; i++) {
        var track = tracks[i];

        if (track.kind !== this.kind_ && track.mode === 'showing') {
          disabled = true;
          break;
        }
      } // If another track is showing, disable this menu button


      if (disabled) {
        this.disable();
      } else {
        this.enable();
      }
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */
    ;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-descriptions-button " + _TextTrackButton.prototype.buildCSSClass.call(this);
    };

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      return "vjs-descriptions-button " + _TextTrackButton.prototype.buildWrapperCSSClass.call(this);
    };

    return DescriptionsButton;
  }(TextTrackButton);
  /**
   * `kind` of TextTrack to look for to associate it with this menu.
   *
   * @type {string}
   * @private
   */


  DescriptionsButton.prototype.kind_ = 'descriptions';
  /**
   * The text that should display over the `DescriptionsButton`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */

  DescriptionsButton.prototype.controlText_ = 'Descriptions';
  Component.registerComponent('DescriptionsButton', DescriptionsButton);

  /**
   * The button component for toggling and selecting subtitles
   *
   * @extends TextTrackButton
   */

  var SubtitlesButton = /*#__PURE__*/function (_TextTrackButton) {
    inheritsLoose(SubtitlesButton, _TextTrackButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function to call when this component is ready.
     */
    function SubtitlesButton(player, options, ready) {
      return _TextTrackButton.call(this, player, options, ready) || this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = SubtitlesButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-subtitles-button " + _TextTrackButton.prototype.buildCSSClass.call(this);
    };

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      return "vjs-subtitles-button " + _TextTrackButton.prototype.buildWrapperCSSClass.call(this);
    };

    return SubtitlesButton;
  }(TextTrackButton);
  /**
   * `kind` of TextTrack to look for to associate it with this menu.
   *
   * @type {string}
   * @private
   */


  SubtitlesButton.prototype.kind_ = 'subtitles';
  /**
   * The text that should display over the `SubtitlesButton`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */

  SubtitlesButton.prototype.controlText_ = 'Subtitles';
  Component.registerComponent('SubtitlesButton', SubtitlesButton);

  /**
   * The menu item for caption track settings menu
   *
   * @extends TextTrackMenuItem
   */

  var CaptionSettingsMenuItem = /*#__PURE__*/function (_TextTrackMenuItem) {
    inheritsLoose(CaptionSettingsMenuItem, _TextTrackMenuItem);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     */
    function CaptionSettingsMenuItem(player, options) {
      var _this;

      options.track = {
        player: player,
        kind: options.kind,
        label: options.kind + ' settings',
        selectable: false,
        "default": false,
        mode: 'disabled'
      }; // CaptionSettingsMenuItem has no concept of 'selected'

      options.selectable = false;
      options.name = 'CaptionSettingsMenuItem';
      _this = _TextTrackMenuItem.call(this, player, options) || this;

      _this.addClass('vjs-texttrack-settings');

      _this.controlText(', opens ' + options.kind + ' settings dialog');

      return _this;
    }
    /**
     * This gets called when an `CaptionSettingsMenuItem` is "clicked". See
     * {@link ClickableComponent} for more detailed information on what a click can be.
     *
     * @param {EventTarget~Event} [event]
     *        The `keydown`, `tap`, or `click` event that caused this function to be
     *        called.
     *
     * @listens tap
     * @listens click
     */


    var _proto = CaptionSettingsMenuItem.prototype;

    _proto.handleClick = function handleClick(event) {
      this.player().getChild('textTrackSettings').open();
    };

    return CaptionSettingsMenuItem;
  }(TextTrackMenuItem);

  Component.registerComponent('CaptionSettingsMenuItem', CaptionSettingsMenuItem);

  /**
   * The button component for toggling and selecting captions
   *
   * @extends TextTrackButton
   */

  var CaptionsButton = /*#__PURE__*/function (_TextTrackButton) {
    inheritsLoose(CaptionsButton, _TextTrackButton);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of player options.
     *
     * @param {Component~ReadyCallback} [ready]
     *        The function to call when this component is ready.
     */
    function CaptionsButton(player, options, ready) {
      return _TextTrackButton.call(this, player, options, ready) || this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = CaptionsButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-captions-button " + _TextTrackButton.prototype.buildCSSClass.call(this);
    };

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      return "vjs-captions-button " + _TextTrackButton.prototype.buildWrapperCSSClass.call(this);
    }
    /**
     * Create caption menu items
     *
     * @return {CaptionSettingsMenuItem[]}
     *         The array of current menu items.
     */
    ;

    _proto.createItems = function createItems() {
      var items = [];

      if (!(this.player().tech_ && this.player().tech_.featuresNativeTextTracks) && this.player().getChild('textTrackSettings')) {
        items.push(new CaptionSettingsMenuItem(this.player_, {
          kind: this.kind_
        }));
        this.hideThreshold_ += 1;
      }

      return _TextTrackButton.prototype.createItems.call(this, items);
    };

    return CaptionsButton;
  }(TextTrackButton);
  /**
   * `kind` of TextTrack to look for to associate it with this menu.
   *
   * @type {string}
   * @private
   */


  CaptionsButton.prototype.kind_ = 'captions';
  /**
   * The text that should display over the `CaptionsButton`s controls. Added for localization.
   *
   * @type {string}
   * @private
   */

  CaptionsButton.prototype.controlText_ = 'Captions';
  Component.registerComponent('CaptionsButton', CaptionsButton);

  /**
   * SubsCapsMenuItem has an [cc] icon to distinguish captions from subtitles
   * in the SubsCapsMenu.
   *
   * @extends TextTrackMenuItem
   */

  var SubsCapsMenuItem = /*#__PURE__*/function (_TextTrackMenuItem) {
    inheritsLoose(SubsCapsMenuItem, _TextTrackMenuItem);

    function SubsCapsMenuItem() {
      return _TextTrackMenuItem.apply(this, arguments) || this;
    }

    var _proto = SubsCapsMenuItem.prototype;

    _proto.createEl = function createEl(type, props, attrs) {
      var innerHTML = "<span class=\"vjs-menu-item-text\">" + this.localize(this.options_.label);

      if (this.options_.track.kind === 'captions') {
        innerHTML += "\n        <span aria-hidden=\"true\" class=\"vjs-icon-placeholder\"></span>\n        <span class=\"vjs-control-text\"> " + this.localize('Captions') + "</span>\n      ";
      }

      innerHTML += '</span>';

      var el = _TextTrackMenuItem.prototype.createEl.call(this, type, assign({
        innerHTML: innerHTML
      }, props), attrs);

      return el;
    };

    return SubsCapsMenuItem;
  }(TextTrackMenuItem);

  Component.registerComponent('SubsCapsMenuItem', SubsCapsMenuItem);

  /**
   * The button component for toggling and selecting captions and/or subtitles
   *
   * @extends TextTrackButton
   */

  var SubsCapsButton = /*#__PURE__*/function (_TextTrackButton) {
    inheritsLoose(SubsCapsButton, _TextTrackButton);

    function SubsCapsButton(player, options) {
      var _this;

      if (options === void 0) {
        options = {};
      }

      _this = _TextTrackButton.call(this, player, options) || this; // Although North America uses "captions" in most cases for
      // "captions and subtitles" other locales use "subtitles"

      _this.label_ = 'subtitles';

      if (['en', 'en-us', 'en-ca', 'fr-ca'].indexOf(_this.player_.language_) > -1) {
        _this.label_ = 'captions';
      }

      _this.menuButton_.controlText(toTitleCase(_this.label_));

      return _this;
    }
    /**
     * Builds the default DOM `className`.
     *
     * @return {string}
     *         The DOM `className` for this object.
     */


    var _proto = SubsCapsButton.prototype;

    _proto.buildCSSClass = function buildCSSClass() {
      return "vjs-subs-caps-button " + _TextTrackButton.prototype.buildCSSClass.call(this);
    };

    _proto.buildWrapperCSSClass = function buildWrapperCSSClass() {
      return "vjs-subs-caps-button " + _TextTrackButton.prototype.buildWrapperCSSClass.call(this);
    }
    /**
     * Create caption/subtitles menu items
     *
     * @return {CaptionSettingsMenuItem[]}
     *         The array of current menu items.
     */
    ;

    _proto.createItems = function createItems() {
      var items = [];

      if (!(this.player().tech_ && this.player().tech_.featuresNativeTextTracks) && this.player().getChild('textTrackSettings')) {
        items.push(new CaptionSettingsMenuItem(this.player_, {
          kind: this.label_
        }));
        this.hideThreshold_ += 1;
      }

      items = _TextTrackButton.prototype.createItems.call(this, items, SubsCapsMenuItem);
      return items;
    };

    return SubsCapsButton;
  }(TextTrackButton);
  /**
   * `kind`s of TextTrack to look for to associate it with this menu.
   *
   * @type {array}
   * @private
   */


  SubsCapsButton.prototype.kinds_ = ['captions', 'subtitles'];
  /**
   * The text that should display over the `SubsCapsButton`s controls.
   *
   *
   * @type {string}
   * @private
   */

  SubsCapsButton.prototype.controlText_ = 'Subtitles';
  Component.registerComponent('SubsCapsButton', SubsCapsButton);

  /**
   * An {@link AudioTrack} {@link MenuItem}
   *
   * @extends MenuItem
   */

  var AudioTrackMenuItem = /*#__PURE__*/function (_MenuItem) {
    inheritsLoose(AudioTrackMenuItem, _MenuItem);

    /**
     * Creates an instance of this class.
     *
     * @param {Player} player
     *        The `Player` that this class should be attached to.
     *
     * @param {Object} [options]
     *        The key/value store of pla