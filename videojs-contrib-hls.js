/**
 * videojs-contrib-hls
 * @version 5.15.0
 * @copyright 2018 Brightcove, Inc
 * @license Apache-2.0
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsContribHls = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @file ad-cue-tags.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

/**
 * Searches for an ad cue that overlaps with the given mediaTime
 */
var findAdCue = function findAdCue(track, mediaTime) {
  var cues = track.cues;

  for (var i = 0; i < cues.length; i++) {
    var cue = cues[i];

    if (mediaTime >= cue.adStartTime && mediaTime <= cue.adEndTime) {
      return cue;
    }
  }
  return null;
};

var updateAdCues = function updateAdCues(media, track) {
  var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  if (!media.segments) {
    return;
  }

  var mediaTime = offset;
  var cue = undefined;

  for (var i = 0; i < media.segments.length; i++) {
    var segment = media.segments[i];

    if (!cue) {
      // Since the cues will span for at least the segment duration, adding a fudge
      // factor of half segment duration will prevent duplicate cues from being
      // created when timing info is not exact (e.g. cue start time initialized
      // at 10.006677, but next call mediaTime is 10.003332 )
      cue = findAdCue(track, mediaTime + segment.duration / 2);
    }

    if (cue) {
      if ('cueIn' in segment) {
        // Found a CUE-IN so end the cue
        cue.endTime = mediaTime;
        cue.adEndTime = mediaTime;
        mediaTime += segment.duration;
        cue = null;
        continue;
      }

      if (mediaTime < cue.endTime) {
        // Already processed this mediaTime for this cue
        mediaTime += segment.duration;
        continue;
      }

      // otherwise extend cue until a CUE-IN is found
      cue.endTime += segment.duration;
    } else {
      if ('cueOut' in segment) {
        cue = new _globalWindow2['default'].VTTCue(mediaTime, mediaTime + segment.duration, segment.cueOut);
        cue.adStartTime = mediaTime;
        // Assumes tag format to be
        // #EXT-X-CUE-OUT:30
        cue.adEndTime = mediaTime + parseFloat(segment.cueOut);
        track.addCue(cue);
      }

      if ('cueOutCont' in segment) {
        // Entered into the middle of an ad cue
        var adOffset = undefined;
        var adTotal = undefined;

        // Assumes tag formate to be
        // #EXT-X-CUE-OUT-CONT:10/30

        var _segment$cueOutCont$split$map = segment.cueOutCont.split('/').map(parseFloat);

        var _segment$cueOutCont$split$map2 = _slicedToArray(_segment$cueOutCont$split$map, 2);

        adOffset = _segment$cueOutCont$split$map2[0];
        adTotal = _segment$cueOutCont$split$map2[1];

        cue = new _globalWindow2['default'].VTTCue(mediaTime, mediaTime + segment.duration, '');
        cue.adStartTime = mediaTime - adOffset;
        cue.adEndTime = cue.adStartTime + adTotal;
        track.addCue(cue);
      }
    }
    mediaTime += segment.duration;
  }
};

exports['default'] = {
  updateAdCues: updateAdCues,
  findAdCue: findAdCue
};
module.exports = exports['default'];
},{"global/window":32}],2:[function(require,module,exports){
/**
 * @file bin-utils.js
 */

/**
 * convert a TimeRange to text
 *
 * @param {TimeRange} range the timerange to use for conversion
 * @param {Number} i the iterator on the range to convert
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var textRange = function textRange(range, i) {
  return range.start(i) + '-' + range.end(i);
};

/**
 * format a number as hex string
 *
 * @param {Number} e The number
 * @param {Number} i the iterator
 */
var formatHexString = function formatHexString(e, i) {
  var value = e.toString(16);

  return '00'.substring(0, 2 - value.length) + value + (i % 2 ? ' ' : '');
};
var formatAsciiString = function formatAsciiString(e) {
  if (e >= 0x20 && e < 0x7e) {
    return String.fromCharCode(e);
  }
  return '.';
};

/**
 * Creates an object for sending to a web worker modifying properties that are TypedArrays
 * into a new object with seperated properties for the buffer, byteOffset, and byteLength.
 *
 * @param {Object} message
 *        Object of properties and values to send to the web worker
 * @return {Object}
 *         Modified message with TypedArray values expanded
 * @function createTransferableMessage
 */
var createTransferableMessage = function createTransferableMessage(message) {
  var transferable = {};

  Object.keys(message).forEach(function (key) {
    var value = message[key];

    if (ArrayBuffer.isView(value)) {
      transferable[key] = {
        bytes: value.buffer,
        byteOffset: value.byteOffset,
        byteLength: value.byteLength
      };
    } else {
      transferable[key] = value;
    }
  });

  return transferable;
};

/**
 * Returns a unique string identifier for a media initialization
 * segment.
 */
var initSegmentId = function initSegmentId(initSegment) {
  var byterange = initSegment.byterange || {
    length: Infinity,
    offset: 0
  };

  return [byterange.length, byterange.offset, initSegment.resolvedUri].join(',');
};

/**
 * utils to help dump binary data to the console
 */
var utils = {
  hexDump: function hexDump(data) {
    var bytes = Array.prototype.slice.call(data);
    var step = 16;
    var result = '';
    var hex = undefined;
    var ascii = undefined;

    for (var j = 0; j < bytes.length / step; j++) {
      hex = bytes.slice(j * step, j * step + step).map(formatHexString).join('');
      ascii = bytes.slice(j * step, j * step + step).map(formatAsciiString).join('');
      result += hex + ' ' + ascii + '\n';
    }
    return result;
  },
  tagDump: function tagDump(tag) {
    return utils.hexDump(tag.bytes);
  },
  textRanges: function textRanges(ranges) {
    var result = '';
    var i = undefined;

    for (i = 0; i < ranges.length; i++) {
      result += textRange(ranges, i) + ' ';
    }
    return result;
  },
  createTransferableMessage: createTransferableMessage,
  initSegmentId: initSegmentId
};

exports['default'] = utils;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  GOAL_BUFFER_LENGTH: 30,
  MAX_GOAL_BUFFER_LENGTH: 60,
  GOAL_BUFFER_LENGTH_RATE: 1,
  // A fudge factor to apply to advertised playlist bitrates to account for
  // temporary flucations in client bandwidth
  BANDWIDTH_VARIANCE: 1.2,
  // How much of the buffer must be filled before we consider upswitching
  BUFFER_LOW_WATER_LINE: 0,
  MAX_BUFFER_LOW_WATER_LINE: 30,
  BUFFER_LOW_WATER_LINE_RATE: 1
};
module.exports = exports["default"];
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _aesDecrypter = require('aes-decrypter');

var _binUtils = require('./bin-utils');

/**
 * Our web worker interface so that things can talk to aes-decrypter
 * that will be running in a web worker. the scope is passed to this by
 * webworkify.
 *
 * @param {Object} self
 *        the scope for the web worker
 */
var DecrypterWorker = function DecrypterWorker(self) {
  self.onmessage = function (event) {
    var data = event.data;
    var encrypted = new Uint8Array(data.encrypted.bytes, data.encrypted.byteOffset, data.encrypted.byteLength);
    var key = new Uint32Array(data.key.bytes, data.key.byteOffset, data.key.byteLength / 4);
    var iv = new Uint32Array(data.iv.bytes, data.iv.byteOffset, data.iv.byteLength / 4);

    /* eslint-disable no-new, handle-callback-err */
    new _aesDecrypter.Decrypter(encrypted, key, iv, function (err, bytes) {
      _globalWindow2['default'].postMessage((0, _binUtils.createTransferableMessage)({
        source: data.source,
        decrypted: bytes
      }), [bytes.buffer]);
    });
    /* eslint-enable */
  };
};

exports['default'] = function (self) {
  return new DecrypterWorker(self);
};

module.exports = exports['default'];
},{"./bin-utils":2,"aes-decrypter":25,"global/window":32}],5:[function(require,module,exports){
(function (global){
/**
 * @file master-playlist-controller.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _playlistLoader = require('./playlist-loader');

var _playlistLoader2 = _interopRequireDefault(_playlistLoader);

var _playlistJs = require('./playlist.js');

var _segmentLoader = require('./segment-loader');

var _segmentLoader2 = _interopRequireDefault(_segmentLoader);

var _vttSegmentLoader = require('./vtt-segment-loader');

var _vttSegmentLoader2 = _interopRequireDefault(_vttSegmentLoader);

var _ranges = require('./ranges');

var _ranges2 = _interopRequireDefault(_ranges);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _adCueTags = require('./ad-cue-tags');

var _adCueTags2 = _interopRequireDefault(_adCueTags);

var _syncController = require('./sync-controller');

var _syncController2 = _interopRequireDefault(_syncController);

var _videojsContribMediaSourcesEs5CodecUtils = require('videojs-contrib-media-sources/es5/codec-utils');

var _webwackify = require('webwackify');

var _webwackify2 = _interopRequireDefault(_webwackify);

var _decrypterWorker = require('./decrypter-worker');

var _decrypterWorker2 = _interopRequireDefault(_decrypterWorker);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utilCodecsJs = require('./util/codecs.js');

var _mediaGroups = require('./media-groups');

var ABORT_EARLY_BLACKLIST_SECONDS = 60 * 2;

var Hls = undefined;

// Default codec parameters if none were provided for video and/or audio
var defaultCodecs = {
  videoCodec: 'avc1',
  videoObjectTypeIndicator: '.4d400d',
  // AAC-LC
  audioProfile: '2'
};

// SegmentLoader stats that need to have each loader's
// values summed to calculate the final value
var loaderStats = ['mediaRequests', 'mediaRequestsAborted', 'mediaRequestsTimedout', 'mediaRequestsErrored', 'mediaTransferDuration', 'mediaBytesTransferred'];
var sumLoaderStat = function sumLoaderStat(stat) {
  return this.audioSegmentLoader_[stat] + this.mainSegmentLoader_[stat];
};

var resolveDecrypterWorker = function resolveDecrypterWorker() {
  var result = undefined;

  try {
    result = require.resolve('./decrypter-worker');
  } catch (e) {
    // no result
  }

  return result;
};

/**
 * Replace codecs in the codec string with the old apple-style `avc1.<dd>.<dd>` to the
 * standard `avc1.<hhhhhh>`.
 *
 * @param codecString {String} the codec string
 * @return {String} the codec string with old apple-style codecs replaced
 *
 * @private
 */
var mapLegacyAvcCodecs_ = function mapLegacyAvcCodecs_(codecString) {
  return codecString.replace(/avc1\.(\d+)\.(\d+)/i, function (match) {
    return (0, _videojsContribMediaSourcesEs5CodecUtils.translateLegacyCodecs)([match])[0];
  });
};

exports.mapLegacyAvcCodecs_ = mapLegacyAvcCodecs_;
/**
 * Build a media mime-type string from a set of parameters
 * @param {String} type either 'audio' or 'video'
 * @param {String} container either 'mp2t' or 'mp4'
 * @param {Array} codecs an array of codec strings to add
 * @return {String} a valid media mime-type
 */
var makeMimeTypeString = function makeMimeTypeString(type, container, codecs) {
  // The codecs array is filtered so that falsey values are
  // dropped and don't cause Array#join to create spurious
  // commas
  return type + '/' + container + '; codecs="' + codecs.filter(function (c) {
    return !!c;
  }).join(', ') + '"';
};

/**
 * Returns the type container based on information in the playlist
 * @param {Playlist} media the current media playlist
 * @return {String} a valid media container type
 */
var getContainerType = function getContainerType(media) {
  // An initialization segment means the media playlist is an iframe
  // playlist or is using the mp4 container. We don't currently
  // support iframe playlists, so assume this is signalling mp4
  // fragments.
  if (media.segments && media.segments.length && media.segments[0].map) {
    return 'mp4';
  }
  return 'mp2t';
};

/**
 * Returns a set of codec strings parsed from the playlist or the default
 * codec strings if no codecs were specified in the playlist
 * @param {Playlist} media the current media playlist
 * @return {Object} an object with the video and audio codecs
 */
var getCodecs = function getCodecs(media) {
  // if the codecs were explicitly specified, use them instead of the
  // defaults
  var mediaAttributes = media.attributes || {};

  if (mediaAttributes.CODECS) {
    return (0, _utilCodecsJs.parseCodecs)(mediaAttributes.CODECS);
  }
  return defaultCodecs;
};

/**
 * Calculates the MIME type strings for a working configuration of
 * SourceBuffers to play variant streams in a master playlist. If
 * there is no possible working configuration, an empty array will be
 * returned.
 *
 * @param master {Object} the m3u8 object for the master playlist
 * @param media {Object} the m3u8 object for the variant playlist
 * @return {Array} the MIME type strings. If the array has more than
 * one entry, the first element should be applied to the video
 * SourceBuffer and the second to the audio SourceBuffer.
 *
 * @private
 */
var mimeTypesForPlaylist_ = function mimeTypesForPlaylist_(master, media) {
  var containerType = getContainerType(media);
  var codecInfo = getCodecs(media);
  var mediaAttributes = media.attributes || {};
  // Default condition for a traditional HLS (no demuxed audio/video)
  var isMuxed = true;
  var isMaat = false;

  if (!media) {
    // Not enough information
    return [];
  }

  if (master.mediaGroups.AUDIO && mediaAttributes.AUDIO) {
    var audioGroup = master.mediaGroups.AUDIO[mediaAttributes.AUDIO];

    // Handle the case where we are in a multiple-audio track scenario
    if (audioGroup) {
      isMaat = true;
      // Start with the everything demuxed then...
      isMuxed = false;
      // ...check to see if any audio group tracks are muxed (ie. lacking a uri)
      for (var groupId in audioGroup) {
        if (!audioGroup[groupId].uri) {
          isMuxed = true;
          break;
        }
      }
    }
  }

  // HLS with multiple-audio tracks must always get an audio codec.
  // Put another way, there is no way to have a video-only multiple-audio HLS!
  if (isMaat && !codecInfo.audioProfile) {
    _videoJs2['default'].log.warn('Multiple audio tracks present but no audio codec string is specified. ' + 'Attempting to use the default audio codec (mp4a.40.2)');
    codecInfo.audioProfile = defaultCodecs.audioProfile;
  }

  // Generate the final codec strings from the codec object generated above
  var codecStrings = {};

  if (codecInfo.videoCodec) {
    codecStrings.video = '' + codecInfo.videoCodec + codecInfo.videoObjectTypeIndicator;
  }

  if (codecInfo.audioProfile) {
    codecStrings.audio = 'mp4a.40.' + codecInfo.audioProfile;
  }

  // Finally, make and return an array with proper mime-types depending on
  // the configuration
  var justAudio = makeMimeTypeString('audio', containerType, [codecStrings.audio]);
  var justVideo = makeMimeTypeString('video', containerType, [codecStrings.video]);
  var bothVideoAudio = makeMimeTypeString('video', containerType, [codecStrings.video, codecStrings.audio]);

  if (isMaat) {
    if (!isMuxed && codecStrings.video) {
      return [justVideo, justAudio];
    }
    // There exists the possiblity that this will return a `video/container`
    // mime-type for the first entry in the array even when there is only audio.
    // This doesn't appear to be a problem and simplifies the code.
    return [bothVideoAudio, justAudio];
  }

  // If there is ano video codec at all, always just return a single
  // audio/<container> mime-type
  if (!codecStrings.video) {
    return [justAudio];
  }

  // When not using separate audio media groups, audio and video is
  // *always* muxed
  return [bothVideoAudio];
};

exports.mimeTypesForPlaylist_ = mimeTypesForPlaylist_;
/**
 * the master playlist controller controls all interactons
 * between playlists and segmentloaders. At this time this mainly
 * involves a master playlist and a series of audio playlists
 * if they are available
 *
 * @class MasterPlaylistController
 * @extends videojs.EventTarget
 */

var MasterPlaylistController = (function (_videojs$EventTarget) {
  _inherits(MasterPlaylistController, _videojs$EventTarget);

  function MasterPlaylistController(options) {
    var _this = this;

    _classCallCheck(this, MasterPlaylistController);

    _get(Object.getPrototypeOf(MasterPlaylistController.prototype), 'constructor', this).call(this);

    var url = options.url;
    var handleManifestRedirects = options.handleManifestRedirects;
    var withCredentials = options.withCredentials;
    var mode = options.mode;
    var tech = options.tech;
    var bandwidth = options.bandwidth;
    var externHls = options.externHls;
    var useCueTags = options.useCueTags;
    var blacklistDuration = options.blacklistDuration;
    var enableLowInitialPlaylist = options.enableLowInitialPlaylist;

    if (!url) {
      throw new Error('A non-empty playlist URL is required');
    }

    Hls = externHls;

    this.tech_ = tech;
    this.hls_ = tech.hls;
    this.mode_ = mode;
    this.useCueTags_ = useCueTags;
    this.blacklistDuration = blacklistDuration;
    this.enableLowInitialPlaylist = enableLowInitialPlaylist;

    if (this.useCueTags_) {
      this.cueTagsTrack_ = this.tech_.addTextTrack('metadata', 'ad-cues');
      this.cueTagsTrack_.inBandMetadataTrackDispatchType = '';
    }

    this.requestOptions_ = {
      withCredentials: withCredentials,
      handleManifestRedirects: handleManifestRedirects,
      timeout: null
    };

    this.mediaTypes_ = (0, _mediaGroups.createMediaTypes)();

    this.mediaSource = new _videoJs2['default'].MediaSource({ mode: mode });

    // load the media source into the player
    this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen_.bind(this));

    this.seekable_ = _videoJs2['default'].createTimeRanges();
    this.hasPlayed_ = function () {
      return false;
    };

    this.syncController_ = new _syncController2['default'](options);
    this.segmentMetadataTrack_ = tech.addRemoteTextTrack({
      kind: 'metadata',
      label: 'segment-metadata'
    }, false).track;

    this.decrypter_ = (0, _webwackify2['default'])(_decrypterWorker2['default'], resolveDecrypterWorker());

    var segmentLoaderSettings = {
      hls: this.hls_,
      mediaSource: this.mediaSource,
      currentTime: this.tech_.currentTime.bind(this.tech_),
      seekable: function seekable() {
        return _this.seekable();
      },
      seeking: function seeking() {
        return _this.tech_.seeking();
      },
      duration: function duration() {
        return _this.mediaSource.duration;
      },
      hasPlayed: function hasPlayed() {
        return _this.hasPlayed_();
      },
      goalBufferLength: function goalBufferLength() {
        return _this.goalBufferLength();
      },
      bandwidth: bandwidth,
      syncController: this.syncController_,
      decrypter: this.decrypter_
    };

    // setup playlist loaders
    this.masterPlaylistLoader_ = new _playlistLoader2['default'](url, this.hls_, this.requestOptions_);
    this.setupMasterPlaylistLoaderListeners_();

    // setup segment loaders
    // combined audio/video or just video when alternate audio track is selected
    this.mainSegmentLoader_ = new _segmentLoader2['default'](_videoJs2['default'].mergeOptions(segmentLoaderSettings, {
      segmentMetadataTrack: this.segmentMetadataTrack_,
      loaderType: 'main'
    }), options);

    // alternate audio track
    this.audioSegmentLoader_ = new _segmentLoader2['default'](_videoJs2['default'].mergeOptions(segmentLoaderSettings, {
      loaderType: 'audio'
    }), options);

    this.subtitleSegmentLoader_ = new _vttSegmentLoader2['default'](_videoJs2['default'].mergeOptions(segmentLoaderSettings, {
      loaderType: 'vtt'
    }), options);

    this.setupSegmentLoaderListeners_();

    // Create SegmentLoader stat-getters
    loaderStats.forEach(function (stat) {
      _this[stat + '_'] = sumLoaderStat.bind(_this, stat);
    });

    this.masterPlaylistLoader_.load();
  }

  /**
   * Register event handlers on the master playlist loader. A helper
   * function for construction time.
   *
   * @private
   */

  _createClass(MasterPlaylistController, [{
    key: 'setupMasterPlaylistLoaderListeners_',
    value: function setupMasterPlaylistLoaderListeners_() {
      var _this2 = this;

      this.masterPlaylistLoader_.on('loadedmetadata', function () {
        var media = _this2.masterPlaylistLoader_.media();
        var requestTimeout = _this2.masterPlaylistLoader_.targetDuration * 1.5 * 1000;

        // If we don't have any more available playlists, we don't want to
        // timeout the request.
        if ((0, _playlistJs.isLowestEnabledRendition)(_this2.masterPlaylistLoader_.master, _this2.masterPlaylistLoader_.media())) {
          _this2.requestOptions_.timeout = 0;
        } else {
          _this2.requestOptions_.timeout = requestTimeout;
        }

        // if this isn't a live video and preload permits, start
        // downloading segments
        if (media.endList && _this2.tech_.preload() !== 'none') {
          _this2.mainSegmentLoader_.playlist(media, _this2.requestOptions_);
          _this2.mainSegmentLoader_.load();
        }

        (0, _mediaGroups.setupMediaGroups)({
          segmentLoaders: {
            AUDIO: _this2.audioSegmentLoader_,
            SUBTITLES: _this2.subtitleSegmentLoader_,
            main: _this2.mainSegmentLoader_
          },
          tech: _this2.tech_,
          requestOptions: _this2.requestOptions_,
          masterPlaylistLoader: _this2.masterPlaylistLoader_,
          mode: _this2.mode_,
          hls: _this2.hls_,
          master: _this2.master(),
          mediaTypes: _this2.mediaTypes_,
          blacklistCurrentPlaylist: _this2.blacklistCurrentPlaylist.bind(_this2)
        });

        _this2.triggerPresenceUsage_(_this2.master(), media);

        try {
          _this2.setupSourceBuffers_();
        } catch (e) {
          _videoJs2['default'].log.warn('Failed to create SourceBuffers', e);
          return _this2.mediaSource.endOfStream('decode');
        }
        _this2.setupFirstPlay();

        _this2.trigger('selectedinitialmedia');
      });

      this.masterPlaylistLoader_.on('loadedplaylist', function () {
        var updatedPlaylist = _this2.masterPlaylistLoader_.media();

        if (!updatedPlaylist) {
          var selectedMedia = undefined;

          if (_this2.enableLowInitialPlaylist) {
            selectedMedia = _this2.selectInitialPlaylist();
          }

          if (!selectedMedia) {
            selectedMedia = _this2.selectPlaylist();
          }

          _this2.initialMedia_ = selectedMedia;
          _this2.masterPlaylistLoader_.media(_this2.initialMedia_);
          return;
        }

        if (_this2.useCueTags_) {
          _this2.updateAdCues_(updatedPlaylist);
        }

        // TODO: Create a new event on the PlaylistLoader that signals
        // that the segments have changed in some way and use that to
        // update the SegmentLoader instead of doing it twice here and
        // on `mediachange`
        _this2.mainSegmentLoader_.playlist(updatedPlaylist, _this2.requestOptions_);
        _this2.updateDuration();

        // If the player isn't paused, ensure that the segment loader is running,
        // as it is possible that it was temporarily stopped while waiting for
        // a playlist (e.g., in case the playlist errored and we re-requested it).
        if (!_this2.tech_.paused()) {
          _this2.mainSegmentLoader_.load();
        }

        if (!updatedPlaylist.endList) {
          (function () {
            var addSeekableRange = function addSeekableRange() {
              var seekable = _this2.seekable();

              if (seekable.length !== 0) {
                _this2.mediaSource.addSeekableRange_(seekable.start(0), seekable.end(0));
              }
            };

            if (_this2.duration() !== Infinity) {
              (function () {
                var onDurationchange = function onDurationchange() {
                  if (_this2.duration() === Infinity) {
                    addSeekableRange();
                  } else {
                    _this2.tech_.one('durationchange', onDurationchange);
                  }
                };

                _this2.tech_.one('durationchange', onDurationchange);
              })();
            } else {
              addSeekableRange();
            }
          })();
        }
      });

      this.masterPlaylistLoader_.on('error', function () {
        _this2.blacklistCurrentPlaylist(_this2.masterPlaylistLoader_.error);
      });

      this.masterPlaylistLoader_.on('mediachanging', function () {
        _this2.mainSegmentLoader_.abort();
        _this2.mainSegmentLoader_.pause();
      });

      this.masterPlaylistLoader_.on('mediachange', function () {
        var media = _this2.masterPlaylistLoader_.media();
        var requestTimeout = _this2.masterPlaylistLoader_.targetDuration * 1.5 * 1000;

        // If we don't have any more available playlists, we don't want to
        // timeout the request.
        if ((0, _playlistJs.isLowestEnabledRendition)(_this2.masterPlaylistLoader_.master, _this2.masterPlaylistLoader_.media())) {
          _this2.requestOptions_.timeout = 0;
        } else {
          _this2.requestOptions_.timeout = requestTimeout;
        }

        // TODO: Create a new event on the PlaylistLoader that signals
        // that the segments have changed in some way and use that to
        // update the SegmentLoader instead of doing it twice here and
        // on `loadedplaylist`
        _this2.mainSegmentLoader_.playlist(media, _this2.requestOptions_);
        _this2.mainSegmentLoader_.load();

        _this2.tech_.trigger({
          type: 'mediachange',
          bubbles: true
        });
      });

      this.masterPlaylistLoader_.on('playlistunchanged', function () {
        var updatedPlaylist = _this2.masterPlaylistLoader_.media();
        var playlistOutdated = _this2.stuckAtPlaylistEnd_(updatedPlaylist);

        if (playlistOutdated) {
          // Playlist has stopped updating and we're stuck at its end. Try to
          // blacklist it and switch to another playlist in the hope that that
          // one is updating (and give the player a chance to re-adjust to the
          // safe live point).
          _this2.blacklistCurrentPlaylist({
            message: 'Playlist no longer updating.'
          });
          // useful for monitoring QoS
          _this2.tech_.trigger('playliststuck');
        }
      });

      this.masterPlaylistLoader_.on('renditiondisabled', function () {
        _this2.tech_.trigger({ type: 'usage', name: 'hls-rendition-disabled' });
      });
      this.masterPlaylistLoader_.on('renditionenabled', function () {
        _this2.tech_.trigger({ type: 'usage', name: 'hls-rendition-enabled' });
      });
    }

    /**
     * A helper function for triggerring presence usage events once per source
     *
     * @private
     */
  }, {
    key: 'triggerPresenceUsage_',
    value: function triggerPresenceUsage_(master, media) {
      var mediaGroups = master.mediaGroups || {};
      var defaultDemuxed = true;
      var audioGroupKeys = Object.keys(mediaGroups.AUDIO);

      for (var mediaGroup in mediaGroups.AUDIO) {
        for (var label in mediaGroups.AUDIO[mediaGroup]) {
          var properties = mediaGroups.AUDIO[mediaGroup][label];

          if (!properties.uri) {
            defaultDemuxed = false;
          }
        }
      }

      if (defaultDemuxed) {
        this.tech_.trigger({ type: 'usage', name: 'hls-demuxed' });
      }

      if (Object.keys(mediaGroups.SUBTITLES).length) {
        this.tech_.trigger({ type: 'usage', name: 'hls-webvtt' });
      }

      if (Hls.Playlist.isAes(media)) {
        this.tech_.trigger({ type: 'usage', name: 'hls-aes' });
      }

      if (Hls.Playlist.isFmp4(media)) {
        this.tech_.trigger({ type: 'usage', name: 'hls-fmp4' });
      }

      if (audioGroupKeys.length && Object.keys(mediaGroups.AUDIO[audioGroupKeys[0]]).length > 1) {
        this.tech_.trigger({ type: 'usage', name: 'hls-alternate-audio' });
      }

      if (this.useCueTags_) {
        this.tech_.trigger({ type: 'usage', name: 'hls-playlist-cue-tags' });
      }
    }

    /**
     * Register event handlers on the segment loaders. A helper function
     * for construction time.
     *
     * @private
     */
  }, {
    key: 'setupSegmentLoaderListeners_',
    value: function setupSegmentLoaderListeners_() {
      var _this3 = this;

      this.mainSegmentLoader_.on('bandwidthupdate', function () {
        var nextPlaylist = _this3.selectPlaylist();
        var currentPlaylist = _this3.masterPlaylistLoader_.media();
        var buffered = _this3.tech_.buffered();
        var forwardBuffer = buffered.length ? buffered.end(buffered.length - 1) - _this3.tech_.currentTime() : 0;

        var bufferLowWaterLine = _this3.bufferLowWaterLine();

        // If the playlist is live, then we want to not take low water line into account.
        // This is because in LIVE, the player plays 3 segments from the end of the
        // playlist, and if `BUFFER_LOW_WATER_LINE` is greater than the duration availble
        // in those segments, a viewer will never experience a rendition upswitch.
        if (!currentPlaylist.endList ||
        // For the same reason as LIVE, we ignore the low water line when the VOD
        // duration is below the max potential low water line
        _this3.duration() < _config2['default'].MAX_BUFFER_LOW_WATER_LINE ||
        // we want to switch down to lower resolutions quickly to continue playback, but
        nextPlaylist.attributes.BANDWIDTH < currentPlaylist.attributes.BANDWIDTH ||
        // ensure we have some buffer before we switch up to prevent us running out of
        // buffer while loading a higher rendition.
        forwardBuffer >= bufferLowWaterLine) {
          _this3.masterPlaylistLoader_.media(nextPlaylist);
        }

        _this3.tech_.trigger('bandwidthupdate');
      });
      this.mainSegmentLoader_.on('progress', function () {
        _this3.trigger('progress');
      });

      this.mainSegmentLoader_.on('error', function () {
        _this3.blacklistCurrentPlaylist(_this3.mainSegmentLoader_.error());
      });

      this.mainSegmentLoader_.on('syncinfoupdate', function () {
        _this3.onSyncInfoUpdate_();
      });

      this.mainSegmentLoader_.on('timestampoffset', function () {
        _this3.tech_.trigger({ type: 'usage', name: 'hls-timestamp-offset' });
      });
      this.audioSegmentLoader_.on('syncinfoupdate', function () {
        _this3.onSyncInfoUpdate_();
      });

      this.mainSegmentLoader_.on('ended', function () {
        _this3.onEndOfStream();
      });

      this.mainSegmentLoader_.on('earlyabort', function () {
        _this3.blacklistCurrentPlaylist({
          message: 'Aborted early because there isn\'t enough bandwidth to complete the ' + 'request without rebuffering.'
        }, ABORT_EARLY_BLACKLIST_SECONDS);
      });

      this.mainSegmentLoader_.on('reseteverything', function () {
        // If playing an MTS stream, a videojs.MediaSource is listening for
        // hls-reset to reset caption parsing state in the transmuxer
        _this3.tech_.trigger('hls-reset');
      });

      this.mainSegmentLoader_.on('segmenttimemapping', function (event) {
        // If playing an MTS stream in html, a videojs.MediaSource is listening for
        // hls-segment-time-mapping update its internal mapping of stream to display time
        _this3.tech_.trigger({
          type: 'hls-segment-time-mapping',
          mapping: event.mapping
        });
      });

      this.audioSegmentLoader_.on('ended', function () {
        _this3.onEndOfStream();
      });
    }
  }, {
    key: 'mediaSecondsLoaded_',
    value: function mediaSecondsLoaded_() {
      return Math.max(this.audioSegmentLoader_.mediaSecondsLoaded + this.mainSegmentLoader_.mediaSecondsLoaded);
    }

    /**
     * Call load on our SegmentLoaders
     */
  }, {
    key: 'load',
    value: function load() {
      this.mainSegmentLoader_.load();
      if (this.mediaTypes_.AUDIO.activePlaylistLoader) {
        this.audioSegmentLoader_.load();
      }
      if (this.mediaTypes_.SUBTITLES.activePlaylistLoader) {
        this.subtitleSegmentLoader_.load();
      }
    }

    /**
     * Re-tune playback quality level for the current player
     * conditions. This method may perform destructive actions, like
     * removing already buffered content, to readjust the currently
     * active playlist quickly.
     *
     * @private
     */
  }, {
    key: 'fastQualityChange_',
    value: function fastQualityChange_() {
      var media = this.selectPlaylist();

      if (media !== this.masterPlaylistLoader_.media()) {
        this.masterPlaylistLoader_.media(media);

        this.mainSegmentLoader_.resetLoader();
        // don't need to reset audio as it is reset when media changes
      }
    }

    /**
     * Begin playback.
     */
  }, {
    key: 'play',
    value: function play() {
      if (this.setupFirstPlay()) {
        return;
      }

      if (this.tech_.ended()) {
        this.tech_.setCurrentTime(0);
      }

      if (this.hasPlayed_()) {
        this.load();
      }

      var seekable = this.tech_.seekable();

      // if the viewer has paused and we fell out of the live window,
      // seek forward to the live point
      if (this.tech_.duration() === Infinity) {
        if (this.tech_.currentTime() < seekable.start(0)) {
          return this.tech_.setCurrentTime(seekable.end(seekable.length - 1));
        }
      }
    }

    /**
     * Seek to the latest media position if this is a live video and the
     * player and video are loaded and initialized.
     */
  }, {
    key: 'setupFirstPlay',
    value: function setupFirstPlay() {
      var _this4 = this;

      var media = this.masterPlaylistLoader_.media();

      // Check that everything is ready to begin buffering for the first call to play
      //  If 1) there is no active media
      //     2) the player is paused
      //     3) the first play has already been setup
      // then exit early
      if (!media || this.tech_.paused() || this.hasPlayed_()) {
        return false;
      }

      // when the video is a live stream
      if (!media.endList) {
        var _ret3 = (function () {
          var seekable = _this4.seekable();

          if (!seekable.length) {
            // without a seekable range, the player cannot seek to begin buffering at the live
            // point
            return {
              v: false
            };
          }

          if (_videoJs2['default'].browser.IE_VERSION && _this4.mode_ === 'html5' && _this4.tech_.readyState() === 0) {
            // IE11 throws an InvalidStateError if you try to set currentTime while the
            // readyState is 0, so it must be delayed until the tech fires loadedmetadata.
            _this4.tech_.one('loadedmetadata', function () {
              _this4.trigger('firstplay');
              _this4.tech_.setCurrentTime(seekable.end(0));
              _this4.hasPlayed_ = function () {
                return true;
              };
            });

            return {
              v: false
            };
          }

          // trigger firstplay to inform the source handler to ignore the next seek event
          _this4.trigger('firstplay');
          // seek to the live point
          _this4.tech_.setCurrentTime(seekable.end(0));
        })();

        if (typeof _ret3 === 'object') return _ret3.v;
      }

      this.hasPlayed_ = function () {
        return true;
      };
      // we can begin loading now that everything is ready
      this.load();
      return true;
    }

    /**
     * handle the sourceopen event on the MediaSource
     *
     * @private
     */
  }, {
    key: 'handleSourceOpen_',
    value: function handleSourceOpen_() {
      // Only attempt to create the source buffer if none already exist.
      // handleSourceOpen is also called when we are "re-opening" a source buffer
      // after `endOfStream` has been called (in response to a seek for instance)
      try {
        this.setupSourceBuffers_();
      } catch (e) {
        _videoJs2['default'].log.warn('Failed to create Source Buffers', e);
        return this.mediaSource.endOfStream('decode');
      }

      // if autoplay is enabled, begin playback. This is duplicative of
      // code in video.js but is required because play() must be invoked
      // *after* the media source has opened.
      if (this.tech_.autoplay()) {
        var playPromise = this.tech_.play();

        // Catch/silence error when a pause interrupts a play request
        // on browsers which return a promise
        if (typeof playPromise !== 'undefined' && typeof playPromise.then === 'function') {
          playPromise.then(null, function (e) {});
        }
      }

      this.trigger('sourceopen');
    }

    /**
     * Calls endOfStream on the media source when all active stream types have called
     * endOfStream
     *
     * @param {string} streamType
     *        Stream type of the segment loader that called endOfStream
     * @private
     */
  }, {
    key: 'onEndOfStream',
    value: function onEndOfStream() {
      var isEndOfStream = this.mainSegmentLoader_.ended_;

      if (this.mediaTypes_.AUDIO.activePlaylistLoader) {
        // if the audio playlist loader exists, then alternate audio is active, so we need
        // to wait for both the main and audio segment loaders to call endOfStream
        isEndOfStream = isEndOfStream && this.audioSegmentLoader_.ended_;
      }

      if (isEndOfStream) {
        this.mediaSource.endOfStream();
      }
    }

    /**
     * Check if a playlist has stopped being updated
     * @param {Object} playlist the media playlist object
     * @return {boolean} whether the playlist has stopped being updated or not
     */
  }, {
    key: 'stuckAtPlaylistEnd_',
    value: function stuckAtPlaylistEnd_(playlist) {
      var seekable = this.seekable();

      if (!seekable.length) {
        // playlist doesn't have enough information to determine whether we are stuck
        return false;
      }

      var expired = this.syncController_.getExpiredTime(playlist, this.mediaSource.duration);

      if (expired === null) {
        return false;
      }

      // does not use the safe live end to calculate playlist end, since we
      // don't want to say we are stuck while there is still content
      var absolutePlaylistEnd = Hls.Playlist.playlistEnd(playlist, expired);
      var currentTime = this.tech_.currentTime();
      var buffered = this.tech_.buffered();

      if (!buffered.length) {
        // return true if the playhead reached the absolute end of the playlist
        return absolutePlaylistEnd - currentTime <= _ranges2['default'].SAFE_TIME_DELTA;
      }
      var bufferedEnd = buffered.end(buffered.length - 1);

      // return true if there is too little buffer left and buffer has reached absolute
      // end of playlist
      return bufferedEnd - currentTime <= _ranges2['default'].SAFE_TIME_DELTA && absolutePlaylistEnd - bufferedEnd <= _ranges2['default'].SAFE_TIME_DELTA;
    }

    /**
     * Blacklists a playlist when an error occurs for a set amount of time
     * making it unavailable for selection by the rendition selection algorithm
     * and then forces a new playlist (rendition) selection.
     *
     * @param {Object=} error an optional error that may include the playlist
     * to blacklist
     * @param {Number=} blacklistDuration an optional number of seconds to blacklist the
     * playlist
     */
  }, {
    key: 'blacklistCurrentPlaylist',
    value: function blacklistCurrentPlaylist(error, blacklistDuration) {
      if (error === undefined) error = {};

      var currentPlaylist = undefined;
      var nextPlaylist = undefined;

      // If the `error` was generated by the playlist loader, it will contain
      // the playlist we were trying to load (but failed) and that should be
      // blacklisted instead of the currently selected playlist which is likely
      // out-of-date in this scenario
      currentPlaylist = error.playlist || this.masterPlaylistLoader_.media();

      blacklistDuration = blacklistDuration || error.blacklistDuration || this.blacklistDuration;

      // If there is no current playlist, then an error occurred while we were
      // trying to load the master OR while we were disposing of the tech
      if (!currentPlaylist) {
        this.error = error;

        try {
          return this.mediaSource.endOfStream('network');
        } catch (e) {
          return this.trigger('error');
        }
      }

      var isFinalRendition = this.masterPlaylistLoader_.master.playlists.filter(_playlistJs.isEnabled).length === 1;

      if (isFinalRendition) {
        // Never blacklisting this playlist because it's final rendition
        _videoJs2['default'].log.warn('Problem encountered with the current ' + 'HLS playlist. Trying again since it is the final playlist.');

        this.tech_.trigger('retryplaylist');
        return this.masterPlaylistLoader_.load(isFinalRendition);
      }
      // Blacklist this playlist
      currentPlaylist.excludeUntil = Date.now() + blacklistDuration * 1000;
      this.tech_.trigger('blacklistplaylist');
      this.tech_.trigger({ type: 'usage', name: 'hls-rendition-blacklisted' });

      // Select a new playlist
      nextPlaylist = this.selectPlaylist();
      _videoJs2['default'].log.warn('Problem encountered with the current HLS playlist.' + (error.message ? ' ' + error.message : '') + ' Switching to another playlist.');

      return this.masterPlaylistLoader_.media(nextPlaylist);
    }

    /**
     * Pause all segment loaders
     */
  }, {
    key: 'pauseLoading',
    value: function pauseLoading() {
      this.mainSegmentLoader_.pause();
      if (this.mediaTypes_.AUDIO.activePlaylistLoader) {
        this.audioSegmentLoader_.pause();
      }
      if (this.mediaTypes_.SUBTITLES.activePlaylistLoader) {
        this.subtitleSegmentLoader_.pause();
      }
    }

    /**
     * set the current time on all segment loaders
     *
     * @param {TimeRange} currentTime the current time to set
     * @return {TimeRange} the current time
     */
  }, {
    key: 'setCurrentTime',
    value: function setCurrentTime(currentTime) {
      var buffered = _ranges2['default'].findRange(this.tech_.buffered(), currentTime);

      if (!(this.masterPlaylistLoader_ && this.masterPlaylistLoader_.media())) {
        // return immediately if the metadata is not ready yet
        return 0;
      }

      // it's clearly an edge-case but don't thrown an error if asked to
      // seek within an empty playlist
      if (!this.masterPlaylistLoader_.media().segments) {
        return 0;
      }

      // In flash playback, the segment loaders should be reset on every seek, even
      // in buffer seeks. If the seek location is already buffered, continue buffering as
      // usual
      if (buffered && buffered.length && this.mode_ !== 'flash') {
        return currentTime;
      }

      // cancel outstanding requests so we begin buffering at the new
      // location
      this.mainSegmentLoader_.resetEverything();
      this.mainSegmentLoader_.abort();
      if (this.mediaTypes_.AUDIO.activePlaylistLoader) {
        this.audioSegmentLoader_.resetEverything();
        this.audioSegmentLoader_.abort();
      }
      if (this.mediaTypes_.SUBTITLES.activePlaylistLoader) {
        this.subtitleSegmentLoader_.resetEverything();
        this.subtitleSegmentLoader_.abort();
      }

      // start segment loader loading in case they are paused
      this.load();
    }

    /**
     * get the current duration
     *
     * @return {TimeRange} the duration
     */
  }, {
    key: 'duration',
    value: function duration() {
      if (!this.masterPlaylistLoader_) {
        return 0;
      }

      if (this.mediaSource) {
        return this.mediaSource.duration;
      }

      return Hls.Playlist.duration(this.masterPlaylistLoader_.media());
    }

    /**
     * check the seekable range
     *
     * @return {TimeRange} the seekable range
     */
  }, {
    key: 'seekable',
    value: function seekable() {
      return this.seekable_;
    }
  }, {
    key: 'onSyncInfoUpdate_',
    value: function onSyncInfoUpdate_() {
      var mainSeekable = undefined;
      var audioSeekable = undefined;

      if (!this.masterPlaylistLoader_) {
        return;
      }

      var media = this.masterPlaylistLoader_.media();

      if (!media) {
        return;
      }

      var expired = this.syncController_.getExpiredTime(media, this.mediaSource.duration);

      if (expired === null) {
        // not enough information to update seekable
        return;
      }

      mainSeekable = Hls.Playlist.seekable(media, expired);

      if (mainSeekable.length === 0) {
        return;
      }

      if (this.mediaTypes_.AUDIO.activePlaylistLoader) {
        media = this.mediaTypes_.AUDIO.activePlaylistLoader.media();
        expired = this.syncController_.getExpiredTime(media, this.mediaSource.duration);

        if (expired === null) {
          return;
        }

        audioSeekable = Hls.Playlist.seekable(media, expired);

        if (audioSeekable.length === 0) {
          return;
        }
      }

      if (!audioSeekable) {
        // seekable has been calculated based on buffering video data so it
        // can be returned directly
        this.seekable_ = mainSeekable;
      } else if (audioSeekable.start(0) > mainSeekable.end(0) || mainSeekable.start(0) > audioSeekable.end(0)) {
        // seekables are pretty far off, rely on main
        this.seekable_ = mainSeekable;
      } else {
        this.seekable_ = _videoJs2['default'].createTimeRanges([[audioSeekable.start(0) > mainSeekable.start(0) ? audioSeekable.start(0) : mainSeekable.start(0), audioSeekable.end(0) < mainSeekable.end(0) ? audioSeekable.end(0) : mainSeekable.end(0)]]);
      }

      this.tech_.trigger('seekablechanged');
    }

    /**
     * Update the player duration
     */
  }, {
    key: 'updateDuration',
    value: function updateDuration() {
      var _this5 = this;

      var oldDuration = this.mediaSource.duration;
      var newDuration = Hls.Playlist.duration(this.masterPlaylistLoader_.media());
      var buffered = this.tech_.buffered();
      var setDuration = function setDuration() {
        _this5.mediaSource.duration = newDuration;
        _this5.tech_.trigger('durationchange');

        _this5.mediaSource.removeEventListener('sourceopen', setDuration);
      };

      if (buffered.length > 0) {
        newDuration = Math.max(newDuration, buffered.end(buffered.length - 1));
      }

      // if the duration has changed, invalidate the cached value
      if (oldDuration !== newDuration) {
        // update the duration
        if (this.mediaSource.readyState !== 'open') {
          this.mediaSource.addEventListener('sourceopen', setDuration);
        } else {
          setDuration();
        }
      }
    }

    /**
     * dispose of the MasterPlaylistController and everything
     * that it controls
     */
  }, {
    key: 'dispose',
    value: function dispose() {
      var _this6 = this;

      this.decrypter_.terminate();
      this.masterPlaylistLoader_.dispose();
      this.mainSegmentLoader_.dispose();

      ['AUDIO', 'SUBTITLES'].forEach(function (type) {
        var groups = _this6.mediaTypes_[type].groups;

        for (var id in groups) {
          groups[id].forEach(function (group) {
            if (group.playlistLoader) {
              group.playlistLoader.dispose();
            }
          });
        }
      });

      this.audioSegmentLoader_.dispose();
      this.subtitleSegmentLoader_.dispose();
    }

    /**
     * return the master playlist object if we have one
     *
     * @return {Object} the master playlist object that we parsed
     */
  }, {
    key: 'master',
    value: function master() {
      return this.masterPlaylistLoader_.master;
    }

    /**
     * return the currently selected playlist
     *
     * @return {Object} the currently selected playlist object that we parsed
     */
  }, {
    key: 'media',
    value: function media() {
      // playlist loader will not return media if it has not been fully loaded
      return this.masterPlaylistLoader_.media() || this.initialMedia_;
    }

    /**
     * setup our internal source buffers on our segment Loaders
     *
     * @private
     */
  }, {
    key: 'setupSourceBuffers_',
    value: function setupSourceBuffers_() {
      var media = this.masterPlaylistLoader_.media();
      var mimeTypes = undefined;

      // wait until a media playlist is available and the Media Source is
      // attached
      if (!media || this.mediaSource.readyState !== 'open') {
        return;
      }

      mimeTypes = mimeTypesForPlaylist_(this.masterPlaylistLoader_.master, media);
      if (mimeTypes.length < 1) {
        this.error = 'No compatible SourceBuffer configuration for the variant stream:' + media.resolvedUri;
        return this.mediaSource.endOfStream('decode');
      }
      this.mainSegmentLoader_.mimeType(mimeTypes[0]);
      if (mimeTypes[1]) {
        this.audioSegmentLoader_.mimeType(mimeTypes[1]);
      }

      // exclude any incompatible variant streams from future playlist
      // selection
      this.excludeIncompatibleVariants_(media);
    }

    /**
     * Blacklist playlists that are known to be codec or
     * stream-incompatible with the SourceBuffer configuration. For
     * instance, Media Source Extensions would cause the video element to
     * stall waiting for video data if you switched from a variant with
     * video and audio to an audio-only one.
     *
     * @param {Object} media a media playlist compatible with the current
     * set of SourceBuffers. Variants in the current master playlist that
     * do not appear to have compatible codec or stream configurations
     * will be excluded from the default playlist selection algorithm
     * indefinitely.
     * @private
     */
  }, {
    key: 'excludeIncompatibleVariants_',
    value: function excludeIncompatibleVariants_(media) {
      var master = this.masterPlaylistLoader_.master;
      var codecCount = 2;
      var videoCodec = null;
      var codecs = undefined;

      if (media.attributes.CODECS) {
        codecs = (0, _utilCodecsJs.parseCodecs)(media.attributes.CODECS);
        videoCodec = codecs.videoCodec;
        codecCount = codecs.codecCount;
      }
      master.playlists.forEach(function (variant) {
        var variantCodecs = {
          codecCount: 2,
          videoCodec: null
        };

        if (variant.attributes.CODECS) {
          var codecString = variant.attributes.CODECS;

          variantCodecs = (0, _utilCodecsJs.parseCodecs)(codecString);

          if (window.MediaSource && window.MediaSource.isTypeSupported && !window.MediaSource.isTypeSupported('video/mp4; codecs="' + mapLegacyAvcCodecs_(codecString) + '"')) {
            variant.excludeUntil = Infinity;
          }
        }

        // if the streams differ in the presence or absence of audio or
        // video, they are incompatible
        if (variantCodecs.codecCount !== codecCount) {
          variant.excludeUntil = Infinity;
        }

        // if h.264 is specified on the current playlist, some flavor of
        // it must be specified on all compatible variants
        if (variantCodecs.videoCodec !== videoCodec) {
          variant.excludeUntil = Infinity;
        }
      });
    }
  }, {
    key: 'updateAdCues_',
    value: function updateAdCues_(media) {
      var offset = 0;
      var seekable = this.seekable();

      if (seekable.length) {
        offset = seekable.start(0);
      }

      _adCueTags2['default'].updateAdCues(media, this.cueTagsTrack_, offset);
    }

    /**
     * Calculates the desired forward buffer length based on current time
     *
     * @return {Number} Desired forward buffer length in seconds
     */
  }, {
    key: 'goalBufferLength',
    value: function goalBufferLength() {
      var currentTime = this.tech_.currentTime();
      var initial = _config2['default'].GOAL_BUFFER_LENGTH;
      var rate = _config2['default'].GOAL_BUFFER_LENGTH_RATE;
      var max = Math.max(initial, _config2['default'].MAX_GOAL_BUFFER_LENGTH);

      return Math.min(initial + currentTime * rate, max);
    }

    /**
     * Calculates the desired buffer low water line based on current time
     *
     * @return {Number} Desired buffer low water line in seconds
     */
  }, {
    key: 'bufferLowWaterLine',
    value: function bufferLowWaterLine() {
      var currentTime = this.tech_.currentTime();
      var initial = _config2['default'].BUFFER_LOW_WATER_LINE;
      var rate = _config2['default'].BUFFER_LOW_WATER_LINE_RATE;
      var max = Math.max(initial, _config2['default'].MAX_BUFFER_LOW_WATER_LINE);

      return Math.min(initial + currentTime * rate, max);
    }
  }]);

  return MasterPlaylistController;
})(_videoJs2['default'].EventTarget);

exports.MasterPlaylistController = MasterPlaylistController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ad-cue-tags":1,"./config":3,"./decrypter-worker":4,"./media-groups":6,"./playlist-loader":9,"./playlist.js":11,"./ranges":12,"./segment-loader":16,"./sync-controller":18,"./util/codecs.js":19,"./vtt-segment-loader":20,"videojs-contrib-media-sources/es5/codec-utils":65,"webwackify":76}],6:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _playlistLoader = require('./playlist-loader');

var _playlistLoader2 = _interopRequireDefault(_playlistLoader);

var noop = function noop() {};

/**
 * Convert the properties of an HLS track into an audioTrackKind.
 *
 * @private
 */
var audioTrackKind_ = function audioTrackKind_(properties) {
  var kind = properties['default'] ? 'main' : 'alternative';

  if (properties.characteristics && properties.characteristics.indexOf('public.accessibility.describes-video') >= 0) {
    kind = 'main-desc';
  }

  return kind;
};

/**
 * Pause provided segment loader and playlist loader if active
 *
 * @param {SegmentLoader} segmentLoader
 *        SegmentLoader to pause
 * @param {Object} mediaType
 *        Active media type
 * @function stopLoaders
 */
var stopLoaders = function stopLoaders(segmentLoader, mediaType) {
  segmentLoader.abort();
  segmentLoader.pause();

  if (mediaType && mediaType.activePlaylistLoader) {
    mediaType.activePlaylistLoader.pause();
    mediaType.activePlaylistLoader = null;
  }
};

exports.stopLoaders = stopLoaders;
/**
 * Start loading provided segment loader and playlist loader
 *
 * @param {PlaylistLoader} playlistLoader
 *        PlaylistLoader to start loading
 * @param {Object} mediaType
 *        Active media type
 * @function startLoaders
 */
var startLoaders = function startLoaders(playlistLoader, mediaType) {
  // Segment loader will be started after `loadedmetadata` or `loadedplaylist` from the
  // playlist loader
  mediaType.activePlaylistLoader = playlistLoader;
  playlistLoader.load();
};

exports.startLoaders = startLoaders;
/**
 * Returns a function to be called when the media group changes. It performs a
 * non-destructive (preserve the buffer) resync of the SegmentLoader. This is because a
 * change of group is merely a rendition switch of the same content at another encoding,
 * rather than a change of content, such as switching audio from English to Spanish.
 *
 * @param {String} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Handler for a non-destructive resync of SegmentLoader when the active media
 *         group changes.
 * @function onGroupChanged
 */
var onGroupChanged = function onGroupChanged(type, settings) {
  return function () {
    var _settings$segmentLoaders = settings.segmentLoaders;
    var segmentLoader = _settings$segmentLoaders[type];
    var mainSegmentLoader = _settings$segmentLoaders.main;
    var mediaType = settings.mediaTypes[type];

    var activeTrack = mediaType.activeTrack();
    var activeGroup = mediaType.activeGroup(activeTrack);
    var previousActiveLoader = mediaType.activePlaylistLoader;

    stopLoaders(segmentLoader, mediaType);

    if (!activeGroup) {
      // there is no group active
      return;
    }

    if (!activeGroup.playlistLoader) {
      if (previousActiveLoader) {
        // The previous group had a playlist loader but the new active group does not
        // this means we are switching from demuxed to muxed audio. In this case we want to
        // do a destructive reset of the main segment loader and not restart the audio
        // loaders.
        mainSegmentLoader.resetEverything();
      }
      return;
    }

    // Non-destructive resync
    segmentLoader.resyncLoader();

    startLoaders(activeGroup.playlistLoader, mediaType);
  };
};

exports.onGroupChanged = onGroupChanged;
/**
 * Returns a function to be called when the media track changes. It performs a
 * destructive reset of the SegmentLoader to ensure we start loading as close to
 * currentTime as possible.
 *
 * @param {String} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Handler for a destructive reset of SegmentLoader when the active media
 *         track changes.
 * @function onTrackChanged
 */
var onTrackChanged = function onTrackChanged(type, settings) {
  return function () {
    var _settings$segmentLoaders2 = settings.segmentLoaders;
    var segmentLoader = _settings$segmentLoaders2[type];
    var mainSegmentLoader = _settings$segmentLoaders2.main;
    var mediaType = settings.mediaTypes[type];

    var activeTrack = mediaType.activeTrack();
    var activeGroup = mediaType.activeGroup(activeTrack);
    var previousActiveLoader = mediaType.activePlaylistLoader;

    stopLoaders(segmentLoader, mediaType);

    if (!activeGroup) {
      // there is no group active so we do not want to restart loaders
      return;
    }

    if (!activeGroup.playlistLoader) {
      // when switching from demuxed audio/video to muxed audio/video (noted by no playlist
      // loader for the audio group), we want to do a destructive reset of the main segment
      // loader and not restart the audio loaders
      mainSegmentLoader.resetEverything();
      return;
    }

    if (previousActiveLoader === activeGroup.playlistLoader) {
      // Nothing has actually changed. This can happen because track change events can fire
      // multiple times for a "single" change. One for enabling the new active track, and
      // one for disabling the track that was active
      startLoaders(activeGroup.playlistLoader, mediaType);
      return;
    }

    if (segmentLoader.track) {
      // For WebVTT, set the new text track in the segmentloader
      segmentLoader.track(activeTrack);
    }

    // destructive reset
    segmentLoader.resetEverything();

    startLoaders(activeGroup.playlistLoader, mediaType);
  };
};

exports.onTrackChanged = onTrackChanged;
var onError = {
  /**
   * Returns a function to be called when a SegmentLoader or PlaylistLoader encounters
   * an error.
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Error handler. Logs warning (or error if the playlist is blacklisted) to
   *         console and switches back to default audio track.
   * @function onError.AUDIO
   */
  AUDIO: function AUDIO(type, settings) {
    return function () {
      var segmentLoader = settings.segmentLoaders[type];
      var mediaType = settings.mediaTypes[type];
      var blacklistCurrentPlaylist = settings.blacklistCurrentPlaylist;

      stopLoaders(segmentLoader, mediaType);

      // switch back to default audio track
      var activeTrack = mediaType.activeTrack();
      var activeGroup = mediaType.activeGroup();
      var id = (activeGroup.filter(function (group) {
        return group['default'];
      })[0] || activeGroup[0]).id;
      var defaultTrack = mediaType.tracks[id];

      if (activeTrack === defaultTrack) {
        // Default track encountered an error. All we can do now is blacklist the current
        // rendition and hope another will switch audio groups
        blacklistCurrentPlaylist({
          message: 'Problem encountered loading the default audio track.'
        });
        return;
      }

      _videoJs2['default'].log.warn('Problem encountered loading the alternate audio track.' + 'Switching back to default.');

      for (var trackId in mediaType.tracks) {
        mediaType.tracks[trackId].enabled = mediaType.tracks[trackId] === defaultTrack;
      }

      mediaType.onTrackChanged();
    };
  },
  /**
   * Returns a function to be called when a SegmentLoader or PlaylistLoader encounters
   * an error.
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Error handler. Logs warning to console and disables the active subtitle track
   * @function onError.SUBTITLES
   */
  SUBTITLES: function SUBTITLES(type, settings) {
    return function () {
      var segmentLoader = settings.segmentLoaders[type];
      var mediaType = settings.mediaTypes[type];

      _videoJs2['default'].log.warn('Problem encountered loading the subtitle track.' + 'Disabling subtitle track.');

      stopLoaders(segmentLoader, mediaType);

      var track = mediaType.activeTrack();

      if (track) {
        track.mode = 'disabled';
      }

      mediaType.onTrackChanged();
    };
  }
};

exports.onError = onError;
var setupListeners = {
  /**
   * Setup event listeners for audio playlist loader
   *
   * @param {String} type
   *        MediaGroup type
   * @param {PlaylistLoader|null} playlistLoader
   *        PlaylistLoader to register listeners on
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function setupListeners.AUDIO
   */
  AUDIO: function AUDIO(type, playlistLoader, settings) {
    if (!playlistLoader) {
      // no playlist loader means audio will be muxed with the video
      return;
    }

    var tech = settings.tech;
    var requestOptions = settings.requestOptions;
    var segmentLoader = settings.segmentLoaders[type];

    playlistLoader.on('loadedmetadata', function () {
      var media = playlistLoader.media();

      segmentLoader.playlist(media, requestOptions);

      // if the video is already playing, or if this isn't a live video and preload
      // permits, start downloading segments
      if (!tech.paused() || media.endList && tech.preload() !== 'none') {
        segmentLoader.load();
      }
    });

    playlistLoader.on('loadedplaylist', function () {
      segmentLoader.playlist(playlistLoader.media(), requestOptions);

      // If the player isn't paused, ensure that the segment loader is running
      if (!tech.paused()) {
        segmentLoader.load();
      }
    });

    playlistLoader.on('error', onError[type](type, settings));
  },
  /**
   * Setup event listeners for subtitle playlist loader
   *
   * @param {String} type
   *        MediaGroup type
   * @param {PlaylistLoader|null} playlistLoader
   *        PlaylistLoader to register listeners on
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function setupListeners.SUBTITLES
   */
  SUBTITLES: function SUBTITLES(type, playlistLoader, settings) {
    var tech = settings.tech;
    var requestOptions = settings.requestOptions;
    var segmentLoader = settings.segmentLoaders[type];
    var mediaType = settings.mediaTypes[type];

    playlistLoader.on('loadedmetadata', function () {
      var media = playlistLoader.media();

      segmentLoader.playlist(media, requestOptions);
      segmentLoader.track(mediaType.activeTrack());

      // if the video is already playing, or if this isn't a live video and preload
      // permits, start downloading segments
      if (!tech.paused() || media.endList && tech.preload() !== 'none') {
        segmentLoader.load();
      }
    });

    playlistLoader.on('loadedplaylist', function () {
      segmentLoader.playlist(playlistLoader.media(), requestOptions);

      // If the player isn't paused, ensure that the segment loader is running
      if (!tech.paused()) {
        segmentLoader.load();
      }
    });

    playlistLoader.on('error', onError[type](type, settings));
  }
};

exports.setupListeners = setupListeners;
var initialize = {
  /**
   * Setup PlaylistLoaders and AudioTracks for the audio groups
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize.AUDIO
   */
  'AUDIO': function AUDIO(type, settings) {
    var mode = settings.mode;
    var hls = settings.hls;
    var segmentLoader = settings.segmentLoaders[type];
    var requestOptions = settings.requestOptions;
    var mediaGroups = settings.master.mediaGroups;
    var _settings$mediaTypes$type = settings.mediaTypes[type];
    var groups = _settings$mediaTypes$type.groups;
    var tracks = _settings$mediaTypes$type.tracks;

    // force a default if we have none or we are not
    // in html5 mode (the only mode to support more than one
    // audio track)
    if (!mediaGroups[type] || Object.keys(mediaGroups[type]).length === 0 || mode !== 'html5') {
      mediaGroups[type] = { main: { 'default': { 'default': true } } };
    }

    for (var groupId in mediaGroups[type]) {
      if (!groups[groupId]) {
        groups[groupId] = [];
      }

      for (var variantLabel in mediaGroups[type][groupId]) {
        var properties = mediaGroups[type][groupId][variantLabel];
        var playlistLoader = undefined;

        if (properties.resolvedUri) {
          playlistLoader = new _playlistLoader2['default'](properties.resolvedUri, hls, requestOptions);
        } else {
          // no resolvedUri means the audio is muxed with the video when using this
          // audio track
          playlistLoader = null;
        }

        properties = _videoJs2['default'].mergeOptions({ id: variantLabel, playlistLoader: playlistLoader }, properties);

        setupListeners[type](type, properties.playlistLoader, settings);

        groups[groupId].push(properties);

        if (typeof tracks[variantLabel] === 'undefined') {
          var track = new _videoJs2['default'].AudioTrack({
            id: variantLabel,
            kind: audioTrackKind_(properties),
            enabled: false,
            language: properties.language,
            'default': properties['default'],
            label: variantLabel
          });

          tracks[variantLabel] = track;
        }
      }
    }

    // setup single error event handler for the segment loader
    segmentLoader.on('error', onError[type](type, settings));
  },
  /**
   * Setup PlaylistLoaders and TextTracks for the subtitle groups
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize.SUBTITLES
   */
  'SUBTITLES': function SUBTITLES(type, settings) {
    var tech = settings.tech;
    var hls = settings.hls;
    var segmentLoader = settings.segmentLoaders[type];
    var requestOptions = settings.requestOptions;
    var mediaGroups = settings.master.mediaGroups;
    var _settings$mediaTypes$type2 = settings.mediaTypes[type];
    var groups = _settings$mediaTypes$type2.groups;
    var tracks = _settings$mediaTypes$type2.tracks;

    for (var groupId in mediaGroups[type]) {
      if (!groups[groupId]) {
        groups[groupId] = [];
      }

      for (var variantLabel in mediaGroups[type][groupId]) {
        if (mediaGroups[type][groupId][variantLabel].forced) {
          // Subtitle playlists with the forced attribute are not selectable in Safari.
          // According to Apple's HLS Authoring Specification:
          //   If content has forced subtitles and regular subtitles in a given language,
          //   the regular subtitles track in that language MUST contain both the forced
          //   subtitles and the regular subtitles for that language.
          // Because of this requirement and that Safari does not add forced subtitles,
          // forced subtitles are skipped here to maintain consistent experience across
          // all platforms
          continue;
        }

        var properties = mediaGroups[type][groupId][variantLabel];

        properties = _videoJs2['default'].mergeOptions({
          id: variantLabel,
          playlistLoader: new _playlistLoader2['default'](properties.resolvedUri, hls, requestOptions)
        }, properties);

        setupListeners[type](type, properties.playlistLoader, settings);

        groups[groupId].push(properties);

        if (typeof tracks[variantLabel] === 'undefined') {
          var track = tech.addRemoteTextTrack({
            id: variantLabel,
            kind: 'subtitles',
            enabled: false,
            language: properties.language,
            label: variantLabel
          }, false).track;

          tracks[variantLabel] = track;
        }
      }
    }

    // setup single error event handler for the segment loader
    segmentLoader.on('error', onError[type](type, settings));
  },
  /**
   * Setup TextTracks for the closed-caption groups
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @function initialize['CLOSED-CAPTIONS']
   */
  'CLOSED-CAPTIONS': function CLOSEDCAPTIONS(type, settings) {
    var tech = settings.tech;
    var mediaGroups = settings.master.mediaGroups;
    var _settings$mediaTypes$type3 = settings.mediaTypes[type];
    var groups = _settings$mediaTypes$type3.groups;
    var tracks = _settings$mediaTypes$type3.tracks;

    for (var groupId in mediaGroups[type]) {
      if (!groups[groupId]) {
        groups[groupId] = [];
      }

      for (var variantLabel in mediaGroups[type][groupId]) {
        var properties = mediaGroups[type][groupId][variantLabel];

        // We only support CEA608 captions for now, so ignore anything that
        // doesn't use a CCx INSTREAM-ID
        if (!properties.instreamId.match(/CC\d/)) {
          continue;
        }

        // No PlaylistLoader is required for Closed-Captions because the captions are
        // embedded within the video stream
        groups[groupId].push(_videoJs2['default'].mergeOptions({ id: variantLabel }, properties));

        if (typeof tracks[variantLabel] === 'undefined') {
          var track = tech.addRemoteTextTrack({
            id: properties.instreamId,
            kind: 'captions',
            enabled: false,
            language: properties.language,
            label: variantLabel
          }, false).track;

          tracks[variantLabel] = track;
        }
      }
    }
  }
};

exports.initialize = initialize;
/**
 * Returns a function used to get the active group of the provided type
 *
 * @param {String} type
 *        MediaGroup type
 * @param {Object} settings
 *        Object containing required information for media groups
 * @return {Function}
 *         Function that returns the active media group for the provided type. Takes an
 *         optional parameter {TextTrack} track. If no track is provided, a list of all
 *         variants in the group, otherwise the variant corresponding to the provided
 *         track is returned.
 * @function activeGroup
 */
var activeGroup = function activeGroup(type, settings) {
  return function (track) {
    var masterPlaylistLoader = settings.masterPlaylistLoader;
    var groups = settings.mediaTypes[type].groups;

    var media = masterPlaylistLoader.media();

    if (!media) {
      return null;
    }

    var variants = null;

    if (media.attributes[type]) {
      variants = groups[media.attributes[type]];
    }

    variants = variants || groups.main;

    if (typeof track === 'undefined') {
      return variants;
    }

    if (track === null) {
      // An active track was specified so a corresponding group is expected. track === null
      // means no track is currently active so there is no corresponding group
      return null;
    }

    return variants.filter(function (props) {
      return props.id === track.id;
    })[0] || null;
  };
};

exports.activeGroup = activeGroup;
var activeTrack = {
  /**
   * Returns a function used to get the active track of type provided
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Function that returns the active media track for the provided type. Returns
   *         null if no track is active
   * @function activeTrack.AUDIO
   */
  AUDIO: function AUDIO(type, settings) {
    return function () {
      var tracks = settings.mediaTypes[type].tracks;

      for (var id in tracks) {
        if (tracks[id].enabled) {
          return tracks[id];
        }
      }

      return null;
    };
  },
  /**
   * Returns a function used to get the active track of type provided
   *
   * @param {String} type
   *        MediaGroup type
   * @param {Object} settings
   *        Object containing required information for media groups
   * @return {Function}
   *         Function that returns the active media track for the provided type. Returns
   *         null if no track is active
   * @function activeTrack.SUBTITLES
   */
  SUBTITLES: function SUBTITLES(type, settings) {
    return function () {
      var tracks = settings.mediaTypes[type].tracks;

      for (var id in tracks) {
        if (tracks[id].mode === 'showing') {
          return tracks[id];
        }
      }

      return null;
    };
  }
};

exports.activeTrack = activeTrack;
/**
 * Setup PlaylistLoaders and Tracks for media groups (Audio, Subtitles,
 * Closed-Captions) specified in the master manifest.
 *
 * @param {Object} settings
 *        Object containing required information for setting up the media groups
 * @param {SegmentLoader} settings.segmentLoaders.AUDIO
 *        Audio segment loader
 * @param {SegmentLoader} settings.segmentLoaders.SUBTITLES
 *        Subtitle segment loader
 * @param {SegmentLoader} settings.segmentLoaders.main
 *        Main segment loader
 * @param {Tech} settings.tech
 *        The tech of the player
 * @param {Object} settings.requestOptions
 *        XHR request options used by the segment loaders
 * @param {PlaylistLoader} settings.masterPlaylistLoader
 *        PlaylistLoader for the master source
 * @param {String} mode
 *        Mode of the hls source handler. Can be 'auto', 'html5', or 'flash'
 * @param {HlsHandler} settings.hls
 *        HLS SourceHandler
 * @param {Object} settings.master
 *        The parsed master manifest
 * @param {Object} settings.mediaTypes
 *        Object to store the loaders, tracks, and utility methods for each media type
 * @param {Function} settings.blacklistCurrentPlaylist
 *        Blacklists the current rendition and forces a rendition switch.
 * @function setupMediaGroups
 */
var setupMediaGroups = function setupMediaGroups(settings) {
  ['AUDIO', 'SUBTITLES', 'CLOSED-CAPTIONS'].forEach(function (type) {
    initialize[type](type, settings);
  });

  var mediaTypes = settings.mediaTypes;
  var masterPlaylistLoader = settings.masterPlaylistLoader;
  var tech = settings.tech;
  var hls = settings.hls;

  // setup active group and track getters and change event handlers
  ['AUDIO', 'SUBTITLES'].forEach(function (type) {
    mediaTypes[type].activeGroup = activeGroup(type, settings);
    mediaTypes[type].activeTrack = activeTrack[type](type, settings);
    mediaTypes[type].onGroupChanged = onGroupChanged(type, settings);
    mediaTypes[type].onTrackChanged = onTrackChanged(type, settings);
  });

  // DO NOT enable the default subtitle or caption track.
  // DO enable the default audio track
  var audioGroup = mediaTypes.AUDIO.activeGroup();
  var groupId = (audioGroup.filter(function (group) {
    return group['default'];
  })[0] || audioGroup[0]).id;

  mediaTypes.AUDIO.tracks[groupId].enabled = true;
  mediaTypes.AUDIO.onTrackChanged();

  masterPlaylistLoader.on('mediachange', function () {
    ['AUDIO', 'SUBTITLES'].forEach(function (type) {
      return mediaTypes[type].onGroupChanged();
    });
  });

  // custom audio track change event handler for usage event
  var onAudioTrackChanged = function onAudioTrackChanged() {
    mediaTypes.AUDIO.onTrackChanged();
    tech.trigger({ type: 'usage', name: 'hls-audio-change' });
  };

  tech.audioTracks().addEventListener('change', onAudioTrackChanged);
  tech.remoteTextTracks().addEventListener('change', mediaTypes.SUBTITLES.onTrackChanged);

  hls.on('dispose', function () {
    tech.audioTracks().removeEventListener('change', onAudioTrackChanged);
    tech.remoteTextTracks().removeEventListener('change', mediaTypes.SUBTITLES.onTrackChanged);
  });

  // clear existing audio tracks and add the ones we just created
  tech.clearTracks('audio');

  for (var id in mediaTypes.AUDIO.tracks) {
    tech.audioTracks().addTrack(mediaTypes.AUDIO.tracks[id]);
  }
};

exports.setupMediaGroups = setupMediaGroups;
/**
 * Creates skeleton object used to store the loaders, tracks, and utility methods for each
 * media type
 *
 * @return {Object}
 *         Object to store the loaders, tracks, and utility methods for each media type
 * @function createMediaTypes
 */
var createMediaTypes = function createMediaTypes() {
  var mediaTypes = {};

  ['AUDIO', 'SUBTITLES', 'CLOSED-CAPTIONS'].forEach(function (type) {
    mediaTypes[type] = {
      groups: {},
      tracks: {},
      activePlaylistLoader: null,
      activeGroup: noop,
      activeTrack: noop,
      onGroupChanged: noop,
      onTrackChanged: noop
    };
  });

  return mediaTypes;
};
exports.createMediaTypes = createMediaTypes;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./playlist-loader":9}],7:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _binUtils = require('./bin-utils');

var REQUEST_ERRORS = {
  FAILURE: 2,
  TIMEOUT: -101,
  ABORTED: -102
};

exports.REQUEST_ERRORS = REQUEST_ERRORS;
/**
 * Turns segment byterange into a string suitable for use in
 * HTTP Range requests
 *
 * @param {Object} byterange - an object with two values defining the start and end
 *                             of a byte-range
 */
var byterangeStr = function byterangeStr(byterange) {
  var byterangeStart = undefined;
  var byterangeEnd = undefined;

  // `byterangeEnd` is one less than `offset + length` because the HTTP range
  // header uses inclusive ranges
  byterangeEnd = byterange.offset + byterange.length - 1;
  byterangeStart = byterange.offset;
  return 'bytes=' + byterangeStart + '-' + byterangeEnd;
};

/**
 * Defines headers for use in the xhr request for a particular segment.
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 */
var segmentXhrHeaders = function segmentXhrHeaders(segment) {
  var headers = {};

  if (segment.byterange) {
    headers.Range = byterangeStr(segment.byterange);
  }
  return headers;
};

/**
 * Abort all requests
 *
 * @param {Object} activeXhrs - an object that tracks all XHR requests
 */
var abortAll = function abortAll(activeXhrs) {
  activeXhrs.forEach(function (xhr) {
    xhr.abort();
  });
};

/**
 * Gather important bandwidth stats once a request has completed
 *
 * @param {Object} request - the XHR request from which to gather stats
 */
var getRequestStats = function getRequestStats(request) {
  return {
    bandwidth: request.bandwidth,
    bytesReceived: request.bytesReceived || 0,
    roundTripTime: request.roundTripTime || 0
  };
};

/**
 * If possible gather bandwidth stats as a request is in
 * progress
 *
 * @param {Event} progressEvent - an event object from an XHR's progress event
 */
var getProgressStats = function getProgressStats(progressEvent) {
  var request = progressEvent.target;
  var roundTripTime = Date.now() - request.requestTime;
  var stats = {
    bandwidth: Infinity,
    bytesReceived: 0,
    roundTripTime: roundTripTime || 0
  };

  stats.bytesReceived = progressEvent.loaded;
  // This can result in Infinity if stats.roundTripTime is 0 but that is ok
  // because we should only use bandwidth stats on progress to determine when
  // abort a request early due to insufficient bandwidth
  stats.bandwidth = Math.floor(stats.bytesReceived / stats.roundTripTime * 8 * 1000);

  return stats;
};

/**
 * Handle all error conditions in one place and return an object
 * with all the information
 *
 * @param {Error|null} error - if non-null signals an error occured with the XHR
 * @param {Object} request -  the XHR request that possibly generated the error
 */
var handleErrors = function handleErrors(error, request) {
  if (request.timedout) {
    return {
      status: request.status,
      message: 'HLS request timed-out at URL: ' + request.uri,
      code: REQUEST_ERRORS.TIMEOUT,
      xhr: request
    };
  }

  if (request.aborted) {
    return {
      status: request.status,
      message: 'HLS request aborted at URL: ' + request.uri,
      code: REQUEST_ERRORS.ABORTED,
      xhr: request
    };
  }

  if (error) {
    return {
      status: request.status,
      message: 'HLS request errored at URL: ' + request.uri,
      code: REQUEST_ERRORS.FAILURE,
      xhr: request
    };
  }

  return null;
};

/**
 * Handle responses for key data and convert the key data to the correct format
 * for the decryption step later
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */
var handleKeyResponse = function handleKeyResponse(segment, finishProcessingFn) {
  return function (error, request) {
    var response = request.response;
    var errorObj = handleErrors(error, request);

    if (errorObj) {
      return finishProcessingFn(errorObj, segment);
    }

    if (response.byteLength !== 16) {
      return finishProcessingFn({
        status: request.status,
        message: 'Invalid HLS key at URL: ' + request.uri,
        code: REQUEST_ERRORS.FAILURE,
        xhr: request
      }, segment);
    }

    var view = new DataView(response);

    segment.key.bytes = new Uint32Array([view.getUint32(0), view.getUint32(4), view.getUint32(8), view.getUint32(12)]);
    return finishProcessingFn(null, segment);
  };
};

/**
 * Handle init-segment responses
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */
var handleInitSegmentResponse = function handleInitSegmentResponse(segment, finishProcessingFn) {
  return function (error, request) {
    var response = request.response;
    var errorObj = handleErrors(error, request);

    if (errorObj) {
      return finishProcessingFn(errorObj, segment);
    }

    // stop processing if received empty content
    if (response.byteLength === 0) {
      return finishProcessingFn({
        status: request.status,
        message: 'Empty HLS segment content at URL: ' + request.uri,
        code: REQUEST_ERRORS.FAILURE,
        xhr: request
      }, segment);
    }

    segment.map.bytes = new Uint8Array(request.response);
    return finishProcessingFn(null, segment);
  };
};

/**
 * Response handler for segment-requests being sure to set the correct
 * property depending on whether the segment is encryped or not
 * Also records and keeps track of stats that are used for ABR purposes
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} finishProcessingFn - a callback to execute to continue processing
 *                                        this request
 */
var handleSegmentResponse = function handleSegmentResponse(segment, finishProcessingFn) {
  return function (error, request) {
    var response = request.response;
    var errorObj = handleErrors(error, request);

    if (errorObj) {
      return finishProcessingFn(errorObj, segment);
    }

    // stop processing if received empty content
    if (response.byteLength === 0) {
      return finishProcessingFn({
        status: request.status,
        message: 'Empty HLS segment content at URL: ' + request.uri,
        code: REQUEST_ERRORS.FAILURE,
        xhr: request
      }, segment);
    }

    segment.stats = getRequestStats(request);

    if (segment.key) {
      segment.encryptedBytes = new Uint8Array(request.response);
    } else {
      segment.bytes = new Uint8Array(request.response);
    }

    return finishProcessingFn(null, segment);
  };
};

/**
 * Decrypt the segment via the decryption web worker
 *
 * @param {WebWorker} decrypter - a WebWorker interface to AES-128 decryption routines
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} doneFn - a callback that is executed after decryption has completed
 */
var decryptSegment = function decryptSegment(decrypter, segment, doneFn) {
  var decryptionHandler = function decryptionHandler(event) {
    if (event.data.source === segment.requestId) {
      decrypter.removeEventListener('message', decryptionHandler);
      var decrypted = event.data.decrypted;

      segment.bytes = new Uint8Array(decrypted.bytes, decrypted.byteOffset, decrypted.byteLength);
      return doneFn(null, segment);
    }
  };

  decrypter.addEventListener('message', decryptionHandler);

  // this is an encrypted segment
  // incrementally decrypt the segment
  decrypter.postMessage((0, _binUtils.createTransferableMessage)({
    source: segment.requestId,
    encrypted: segment.encryptedBytes,
    key: segment.key.bytes,
    iv: segment.key.iv
  }), [segment.encryptedBytes.buffer, segment.key.bytes.buffer]);
};

/**
 * The purpose of this function is to get the most pertinent error from the
 * array of errors.
 * For instance if a timeout and two aborts occur, then the aborts were
 * likely triggered by the timeout so return that error object.
 */
var getMostImportantError = function getMostImportantError(errors) {
  return errors.reduce(function (prev, err) {
    return err.code > prev.code ? err : prev;
  });
};

/**
 * This function waits for all XHRs to finish (with either success or failure)
 * before continueing processing via it's callback. The function gathers errors
 * from each request into a single errors array so that the error status for
 * each request can be examined later.
 *
 * @param {Object} activeXhrs - an object that tracks all XHR requests
 * @param {WebWorker} decrypter - a WebWorker interface to AES-128 decryption routines
 * @param {Function} doneFn - a callback that is executed after all resources have been
 *                            downloaded and any decryption completed
 */
var waitForCompletion = function waitForCompletion(activeXhrs, decrypter, doneFn) {
  var errors = [];
  var count = 0;

  return function (error, segment) {
    if (error) {
      // If there are errors, we have to abort any outstanding requests
      abortAll(activeXhrs);
      errors.push(error);
    }
    count += 1;

    if (count === activeXhrs.length) {
      // Keep track of when *all* of the requests have completed
      segment.endOfAllRequests = Date.now();

      if (errors.length > 0) {
        var worstError = getMostImportantError(errors);

        return doneFn(worstError, segment);
      }
      if (segment.encryptedBytes) {
        return decryptSegment(decrypter, segment, doneFn);
      }
      // Otherwise, everything is ready just continue
      return doneFn(null, segment);
    }
  };
};

/**
 * Simple progress event callback handler that gathers some stats before
 * executing a provided callback with the `segment` object
 *
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} progressFn - a callback that is executed each time a progress event
 *                                is received
 * @param {Event} event - the progress event object from XMLHttpRequest
 */
var handleProgress = function handleProgress(segment, progressFn) {
  return function (event) {
    segment.stats = _videoJs2['default'].mergeOptions(segment.stats, getProgressStats(event));

    // record the time that we receive the first byte of data
    if (!segment.stats.firstBytesReceivedAt && segment.stats.bytesReceived) {
      segment.stats.firstBytesReceivedAt = Date.now();
    }

    return progressFn(event, segment);
  };
};

/**
 * Load all resources and does any processing necessary for a media-segment
 *
 * Features:
 *   decrypts the media-segment if it has a key uri and an iv
 *   aborts *all* requests if *any* one request fails
 *
 * The segment object, at minimum, has the following format:
 * {
 *   resolvedUri: String,
 *   [byterange]: {
 *     offset: Number,
 *     length: Number
 *   },
 *   [key]: {
 *     resolvedUri: String
 *     [byterange]: {
 *       offset: Number,
 *       length: Number
 *     },
 *     iv: {
 *       bytes: Uint32Array
 *     }
 *   },
 *   [map]: {
 *     resolvedUri: String,
 *     [byterange]: {
 *       offset: Number,
 *       length: Number
 *     },
 *     [bytes]: Uint8Array
 *   }
 * }
 * ...where [name] denotes optional properties
 *
 * @param {Function} xhr - an instance of the xhr wrapper in xhr.js
 * @param {Object} xhrOptions - the base options to provide to all xhr requests
 * @param {WebWorker} decryptionWorker - a WebWorker interface to AES-128
 *                                       decryption routines
 * @param {Object} segment - a simplified copy of the segmentInfo object
 *                           from SegmentLoader
 * @param {Function} progressFn - a callback that receives progress events from the main
 *                                segment's xhr request
 * @param {Function} doneFn - a callback that is executed only once all requests have
 *                            succeeded or failed
 * @returns {Function} a function that, when invoked, immediately aborts all
 *                     outstanding requests
 */
var mediaSegmentRequest = function mediaSegmentRequest(xhr, xhrOptions, decryptionWorker, segment, progressFn, doneFn) {
  var activeXhrs = [];
  var finishProcessingFn = waitForCompletion(activeXhrs, decryptionWorker, doneFn);

  // optionally, request the decryption key
  if (segment.key) {
    var keyRequestOptions = _videoJs2['default'].mergeOptions(xhrOptions, {
      uri: segment.key.resolvedUri,
      responseType: 'arraybuffer'
    });
    var keyRequestCallback = handleKeyResponse(segment, finishProcessingFn);
    var keyXhr = xhr(keyRequestOptions, keyRequestCallback);

    activeXhrs.push(keyXhr);
  }

  // optionally, request the associated media init segment
  if (segment.map && !segment.map.bytes) {
    var initSegmentOptions = _videoJs2['default'].mergeOptions(xhrOptions, {
      uri: segment.map.resolvedUri,
      responseType: 'arraybuffer',
      headers: segmentXhrHeaders(segment.map)
    });
    var initSegmentRequestCallback = handleInitSegmentResponse(segment, finishProcessingFn);
    var initSegmentXhr = xhr(initSegmentOptions, initSegmentRequestCallback);

    activeXhrs.push(initSegmentXhr);
  }

  var segmentRequestOptions = _videoJs2['default'].mergeOptions(xhrOptions, {
    uri: segment.resolvedUri,
    responseType: 'arraybuffer',
    headers: segmentXhrHeaders(segment)
  });
  var segmentRequestCallback = handleSegmentResponse(segment, finishProcessingFn);
  var segmentXhr = xhr(segmentRequestOptions, segmentRequestCallback);

  segmentXhr.addEventListener('progress', handleProgress(segment, progressFn));
  activeXhrs.push(segmentXhr);

  return function () {
    return abortAll(activeXhrs);
  };
};
exports.mediaSegmentRequest = mediaSegmentRequest;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./bin-utils":2}],8:[function(require,module,exports){
(function (global){
/**
 * @file playback-watcher.js
 *
 * Playback starts, and now my watch begins. It shall not end until my death. I shall
 * take no wait, hold no uncleared timeouts, father no bad seeks. I shall wear no crowns
 * and win no glory. I shall live and die at my post. I am the corrector of the underflow.
 * I am the watcher of gaps. I am the shield that guards the realms of seekable. I pledge
 * my life and honor to the Playback Watch, for this Player and all the Players to come.
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _ranges = require('./ranges');

var _ranges2 = _interopRequireDefault(_ranges);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Set of events that reset the playback-watcher time check logic and clear the timeout
var timerCancelEvents = ['seeking', 'seeked', 'pause', 'playing', 'error'];

/**
 * @class PlaybackWatcher
 */

var PlaybackWatcher = (function () {
  /**
   * Represents an PlaybackWatcher object.
   * @constructor
   * @param {object} options an object that includes the tech and settings
   */

  function PlaybackWatcher(options) {
    var _this = this;

    _classCallCheck(this, PlaybackWatcher);

    this.tech_ = options.tech;
    this.seekable = options.seekable;

    this.consecutiveUpdates = 0;
    this.lastRecordedTime = null;
    this.timer_ = null;
    this.checkCurrentTimeTimeout_ = null;

    if (options.debug) {
      this.logger_ = _videoJs2['default'].log.bind(_videoJs2['default'], 'playback-watcher ->');
    }
    this.logger_('initialize');

    var canPlayHandler = function canPlayHandler() {
      return _this.monitorCurrentTime_();
    };
    var waitingHandler = function waitingHandler() {
      return _this.techWaiting_();
    };
    var cancelTimerHandler = function cancelTimerHandler() {
      return _this.cancelTimer_();
    };
    var fixesBadSeeksHandler = function fixesBadSeeksHandler() {
      return _this.fixesBadSeeks_();
    };

    this.tech_.on('seekablechanged', fixesBadSeeksHandler);
    this.tech_.on('waiting', waitingHandler);
    this.tech_.on(timerCancelEvents, cancelTimerHandler);
    this.tech_.on('canplay', canPlayHandler);

    // Define the dispose function to clean up our events
    this.dispose = function () {
      _this.logger_('dispose');
      _this.tech_.off('seekablechanged', fixesBadSeeksHandler);
      _this.tech_.off('waiting', waitingHandler);
      _this.tech_.off(timerCancelEvents, cancelTimerHandler);
      _this.tech_.off('canplay', canPlayHandler);
      if (_this.checkCurrentTimeTimeout_) {
        _globalWindow2['default'].clearTimeout(_this.checkCurrentTimeTimeout_);
      }
      _this.cancelTimer_();
    };
  }

  /**
   * Periodically check current time to see if playback stopped
   *
   * @private
   */

  _createClass(PlaybackWatcher, [{
    key: 'monitorCurrentTime_',
    value: function monitorCurrentTime_() {
      this.checkCurrentTime_();

      if (this.checkCurrentTimeTimeout_) {
        _globalWindow2['default'].clearTimeout(this.checkCurrentTimeTimeout_);
      }

      // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
      this.checkCurrentTimeTimeout_ = _globalWindow2['default'].setTimeout(this.monitorCurrentTime_.bind(this), 250);
    }

    /**
     * The purpose of this function is to emulate the "waiting" event on
     * browsers that do not emit it when they are waiting for more
     * data to continue playback
     *
     * @private
     */
  }, {
    key: 'checkCurrentTime_',
    value: function checkCurrentTime_() {
      if (this.tech_.seeking() && this.fixesBadSeeks_()) {
        this.consecutiveUpdates = 0;
        this.lastRecordedTime = this.tech_.currentTime();
        return;
      }

      if (this.tech_.paused() || this.tech_.seeking()) {
        return;
      }

      var currentTime = this.tech_.currentTime();
      var buffered = this.tech_.buffered();

      if (this.lastRecordedTime === currentTime && (!buffered.length || currentTime + _ranges2['default'].SAFE_TIME_DELTA >= buffered.end(buffered.length - 1))) {
        // If current time is at the end of the final buffered region, then any playback
        // stall is most likely caused by buffering in a low bandwidth environment. The tech
        // should fire a `waiting` event in this scenario, but due to browser and tech
        // inconsistencies (e.g. The Flash tech does not fire a `waiting` event when the end
        // of the buffer is reached and has fallen off the live window). Calling
        // `techWaiting_` here allows us to simulate responding to a native `waiting` event
        // when the tech fails to emit one.
        return this.techWaiting_();
      }

      if (this.consecutiveUpdates >= 5 && currentTime === this.lastRecordedTime) {
        this.consecutiveUpdates++;
        this.waiting_();
      } else if (currentTime === this.lastRecordedTime) {
        this.consecutiveUpdates++;
      } else {
        this.consecutiveUpdates = 0;
        this.lastRecordedTime = currentTime;
      }
    }

    /**
     * Cancels any pending timers and resets the 'timeupdate' mechanism
     * designed to detect that we are stalled
     *
     * @private
     */
  }, {
    key: 'cancelTimer_',
    value: function cancelTimer_() {
      this.consecutiveUpdates = 0;

      if (this.timer_) {
        this.logger_('cancelTimer_');
        clearTimeout(this.timer_);
      }

      this.timer_ = null;
    }

    /**
     * Fixes situations where there's a bad seek
     *
     * @return {Boolean} whether an action was taken to fix the seek
     * @private
     */
  }, {
    key: 'fixesBadSeeks_',
    value: function fixesBadSeeks_() {
      var seeking = this.tech_.seeking();
      var seekable = this.seekable();
      var currentTime = this.tech_.currentTime();
      var seekTo = undefined;

      if (seeking && this.afterSeekableWindow_(seekable, currentTime)) {
        var seekableEnd = seekable.end(seekable.length - 1);

        // sync to live point (if VOD, our seekable was updated and we're simply adjusting)
        seekTo = seekableEnd;
      }

      if (seeking && this.beforeSeekableWindow_(seekable, currentTime)) {
        var seekableStart = seekable.start(0);

        // sync to the beginning of the live window
        // provide a buffer of .1 seconds to handle rounding/imprecise numbers
        seekTo = seekableStart + _ranges2['default'].SAFE_TIME_DELTA;
      }

      if (typeof seekTo !== 'undefined') {
        this.logger_('Trying to seek outside of seekable at time ' + currentTime + ' with ' + ('seekable range ' + _ranges2['default'].printableRange(seekable) + '. Seeking to ') + (seekTo + '.'));

        this.tech_.setCurrentTime(seekTo);
        return true;
      }

      return false;
    }

    /**
     * Handler for situations when we determine the player is waiting.
     *
     * @private
     */
  }, {
    key: 'waiting_',
    value: function waiting_() {
      if (this.techWaiting_()) {
        return;
      }

      // All tech waiting checks failed. Use last resort correction
      var currentTime = this.tech_.currentTime();
      var buffered = this.tech_.buffered();
      var currentRange = _ranges2['default'].findRange(buffered, currentTime);

      // Sometimes the player can stall for unknown reasons within a contiguous buffered
      // region with no indication that anything is amiss (seen in Firefox). Seeking to
      // currentTime is usually enough to kickstart the player. This checks that the player
      // is currently within a buffered region before attempting a corrective seek.
      // Chrome does not appear to continue `timeupdate` events after a `waiting` event
      // until there is ~ 3 seconds of forward buffer available. PlaybackWatcher should also
      // make sure there is ~3 seconds of forward buffer before taking any corrective action
      // to avoid triggering an `unknownwaiting` event when the network is slow.
      if (currentRange.length && currentTime + 3 <= currentRange.end(0)) {
        this.cancelTimer_();
        this.tech_.setCurrentTime(currentTime);

        this.logger_('Stopped at ' + currentTime + ' while inside a buffered region ' + ('[' + currentRange.start(0) + ' -> ' + currentRange.end(0) + ']. Attempting to resume ') + 'playback by seeking to the current time.');

        // unknown waiting corrections may be useful for monitoring QoS
        this.tech_.trigger({ type: 'usage', name: 'hls-unknown-waiting' });
        return;
      }
    }

    /**
     * Handler for situations when the tech fires a `waiting` event
     *
     * @return {Boolean}
     *         True if an action (or none) was needed to correct the waiting. False if no
     *         checks passed
     * @private
     */
  }, {
    key: 'techWaiting_',
    value: function techWaiting_() {
      var seekable = this.seekable();
      var currentTime = this.tech_.currentTime();

      if (this.tech_.seeking() && this.fixesBadSeeks_()) {
        // Tech is seeking or bad seek fixed, no action needed
        return true;
      }

      if (this.tech_.seeking() || this.timer_ !== null) {
        // Tech is seeking or already waiting on another action, no action needed
        return true;
      }

      if (this.beforeSeekableWindow_(seekable, currentTime)) {
        var livePoint = seekable.end(seekable.length - 1);

        this.logger_('Fell out of live window at time ' + currentTime + '. Seeking to ' + ('live point (seekable end) ' + livePoint));
        this.cancelTimer_();
        this.tech_.setCurrentTime(livePoint);

        // live window resyncs may be useful for monitoring QoS
        this.tech_.trigger({ type: 'usage', name: 'hls-live-resync' });
        return true;
      }

      var buffered = this.tech_.buffered();
      var nextRange = _ranges2['default'].findNextRange(buffered, currentTime);

      if (this.videoUnderflow_(nextRange, buffered, currentTime)) {
        // Even though the video underflowed and was stuck in a gap, the audio overplayed
        // the gap, leading currentTime into a buffered range. Seeking to currentTime
        // allows the video to catch up to the audio position without losing any audio
        // (only suffering ~3 seconds of frozen video and a pause in audio playback).
        this.cancelTimer_();
        this.tech_.setCurrentTime(currentTime);

        // video underflow may be useful for monitoring QoS
        this.tech_.trigger({ type: 'usage', name: 'hls-video-underflow' });
        return true;
      }

      // check for gap
      if (nextRange.length > 0) {
        var difference = nextRange.start(0) - currentTime;

        this.logger_('Stopped at ' + currentTime + ', setting timer for ' + difference + ', seeking ' + ('to ' + nextRange.start(0)));

        this.timer_ = setTimeout(this.skipTheGap_.bind(this), difference * 1000, currentTime);
        return true;
      }

      // All checks failed. Returning false to indicate failure to correct waiting
      return false;
    }
  }, {
    key: 'afterSeekableWindow_',
    value: function afterSeekableWindow_(seekable, currentTime) {
      if (!seekable.length) {
        // we can't make a solid case if there's no seekable, default to false
        return false;
      }

      if (currentTime > seekable.end(seekable.length - 1) + _ranges2['default'].SAFE_TIME_DELTA) {
        return true;
      }

      return false;
    }
  }, {
    key: 'beforeSeekableWindow_',
    value: function beforeSeekableWindow_(seekable, currentTime) {
      if (seekable.length &&
      // can't fall before 0 and 0 seekable start identifies VOD stream
      seekable.start(0) > 0 && currentTime < seekable.start(0) - _ranges2['default'].SAFE_TIME_DELTA) {
        return true;
      }

      return false;
    }
  }, {
    key: 'videoUnderflow_',
    value: function videoUnderflow_(nextRange, buffered, currentTime) {
      if (nextRange.length === 0) {
        // Even if there is no available next range, there is still a possibility we are
        // stuck in a gap due to video underflow.
        var gap = this.gapFromVideoUnderflow_(buffered, currentTime);

        if (gap) {
          this.logger_('Encountered a gap in video from ' + gap.start + ' to ' + gap.end + '. ' + ('Seeking to current time ' + currentTime));

          return true;
        }
      }

      return false;
    }

    /**
     * Timer callback. If playback still has not proceeded, then we seek
     * to the start of the next buffered region.
     *
     * @private
     */
  }, {
    key: 'skipTheGap_',
    value: function skipTheGap_(scheduledCurrentTime) {
      var buffered = this.tech_.buffered();
      var currentTime = this.tech_.currentTime();
      var nextRange = _ranges2['default'].findNextRange(buffered, currentTime);

      this.cancelTimer_();

      if (nextRange.length === 0 || currentTime !== scheduledCurrentTime) {
        return;
      }

      this.logger_('skipTheGap_:', 'currentTime:', currentTime, 'scheduled currentTime:', scheduledCurrentTime, 'nextRange start:', nextRange.start(0));

      // only seek if we still have not played
      this.tech_.setCurrentTime(nextRange.start(0) + _ranges2['default'].TIME_FUDGE_FACTOR);

      this.tech_.trigger({ type: 'usage', name: 'hls-gap-skip' });
    }
  }, {
    key: 'gapFromVideoUnderflow_',
    value: function gapFromVideoUnderflow_(buffered, currentTime) {
      // At least in Chrome, if there is a gap in the video buffer, the audio will continue
      // playing for ~3 seconds after the video gap starts. This is done to account for
      // video buffer underflow/underrun (note that this is not done when there is audio
      // buffer underflow/underrun -- in that case the video will stop as soon as it
      // encounters the gap, as audio stalls are more noticeable/jarring to a user than
      // video stalls). The player's time will reflect the playthrough of audio, so the
      // time will appear as if we are in a buffered region, even if we are stuck in a
      // "gap."
      //
      // Example:
      // video buffer:   0 => 10.1, 10.2 => 20
      // audio buffer:   0 => 20
      // overall buffer: 0 => 10.1, 10.2 => 20
      // current time: 13
      //
      // Chrome's video froze at 10 seconds, where the video buffer encountered the gap,
      // however, the audio continued playing until it reached ~3 seconds past the gap
      // (13 seconds), at which point it stops as well. Since current time is past the
      // gap, findNextRange will return no ranges.
      //
      // To check for this issue, we see if there is a gap that starts somewhere within
      // a 3 second range (3 seconds +/- 1 second) back from our current time.
      var gaps = _ranges2['default'].findGaps(buffered);

      for (var i = 0; i < gaps.length; i++) {
        var start = gaps.start(i);
        var end = gaps.end(i);

        // gap is starts no more than 4 seconds back
        if (currentTime - start < 4 && currentTime - start > 2) {
          return {
            start: start,
            end: end
          };
        }
      }

      return null;
    }

    /**
     * A debugging logger noop that is set to console.log only if debugging
     * is enabled globally
     *
     * @private
     */
  }, {
    key: 'logger_',
    value: function logger_() {}
  }]);

  return PlaybackWatcher;
})();

exports['default'] = PlaybackWatcher;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ranges":12,"global/window":32}],9:[function(require,module,exports){
(function (global){
/**
 * @module playlist-loader
 *
 * @file A state machine that manages the loading, caching, and updating of
 * M3U8 playlists.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _resolveUrl = require('./resolve-url');

var _resolveUrl2 = _interopRequireDefault(_resolveUrl);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _m3u8Parser = require('m3u8-parser');

var _m3u8Parser2 = _interopRequireDefault(_m3u8Parser);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

/**
 * Returns a new array of segments that is the result of merging
 * properties from an older list of segments onto an updated
 * list. No properties on the updated playlist will be overridden.
 *
 * @param {Array} original the outdated list of segments
 * @param {Array} update the updated list of segments
 * @param {Number=} offset the index of the first update
 * segment in the original segment list. For non-live playlists,
 * this should always be zero and does not need to be
 * specified. For live playlists, it should be the difference
 * between the media sequence numbers in the original and updated
 * playlists.
 * @return a list of merged segment objects
 */
var updateSegments = function updateSegments(original, update, offset) {
  var result = update.slice();

  offset = offset || 0;
  var length = Math.min(original.length, update.length + offset);

  for (var i = offset; i < length; i++) {
    result[i - offset] = (0, _videoJs.mergeOptions)(original[i], result[i - offset]);
  }
  return result;
};

exports.updateSegments = updateSegments;
var resolveSegmentUris = function resolveSegmentUris(segment, baseUri) {
  if (!segment.resolvedUri) {
    segment.resolvedUri = (0, _resolveUrl2['default'])(baseUri, segment.uri);
  }
  if (segment.key && !segment.key.resolvedUri) {
    segment.key.resolvedUri = (0, _resolveUrl2['default'])(baseUri, segment.key.uri);
  }
  if (segment.map && !segment.map.resolvedUri) {
    segment.map.resolvedUri = (0, _resolveUrl2['default'])(baseUri, segment.map.uri);
  }
};

exports.resolveSegmentUris = resolveSegmentUris;
/**
  * Returns a new master playlist that is the result of merging an
  * updated media playlist into the original version. If the
  * updated media playlist does not match any of the playlist
  * entries in the original master playlist, null is returned.
  *
  * @param {Object} master a parsed master M3U8 object
  * @param {Object} media a parsed media M3U8 object
  * @return {Object} a new object that represents the original
  * master playlist with the updated media playlist merged in, or
  * null if the merge produced no change.
  */
var updateMaster = function updateMaster(master, media) {
  var result = (0, _videoJs.mergeOptions)(master, {});
  var playlist = result.playlists.filter(function (p) {
    return p.uri === media.uri;
  })[0];

  if (!playlist) {
    return null;
  }

  // consider the playlist unchanged if the number of segments is equal and the media
  // sequence number is unchanged
  if (playlist.segments && media.segments && playlist.segments.length === media.segments.length && playlist.mediaSequence === media.mediaSequence) {
    return null;
  }

  var mergedPlaylist = (0, _videoJs.mergeOptions)(playlist, media);

  // if the update could overlap existing segment information, merge the two segment lists
  if (playlist.segments) {
    mergedPlaylist.segments = updateSegments(playlist.segments, media.segments, media.mediaSequence - playlist.mediaSequence);
  }

  // resolve any segment URIs to prevent us from having to do it later
  mergedPlaylist.segments.forEach(function (segment) {
    resolveSegmentUris(segment, mergedPlaylist.resolvedUri);
  });

  // TODO Right now in the playlists array there are two references to each playlist, one
  // that is referenced by index, and one by URI. The index reference may no longer be
  // necessary.
  for (var i = 0; i < result.playlists.length; i++) {
    if (result.playlists[i].uri === media.uri) {
      result.playlists[i] = mergedPlaylist;
    }
  }
  result.playlists[media.uri] = mergedPlaylist;

  return result;
};

exports.updateMaster = updateMaster;
var setupMediaPlaylists = function setupMediaPlaylists(master) {
  // setup by-URI lookups and resolve media playlist URIs
  var i = master.playlists.length;

  while (i--) {
    var playlist = master.playlists[i];

    master.playlists[playlist.uri] = playlist;
    playlist.resolvedUri = (0, _resolveUrl2['default'])(master.uri, playlist.uri);

    if (!playlist.attributes) {
      // Although the spec states an #EXT-X-STREAM-INF tag MUST have a
      // BANDWIDTH attribute, we can play the stream without it. This means a poorly
      // formatted master playlist may not have an attribute list. An attributes
      // property is added here to prevent undefined references when we encounter
      // this scenario.
      playlist.attributes = {};

      _videoJs.log.warn('Invalid playlist STREAM-INF detected. Missing BANDWIDTH attribute.');
    }
  }
};

exports.setupMediaPlaylists = setupMediaPlaylists;
var resolveMediaGroupUris = function resolveMediaGroupUris(master) {
  ['AUDIO', 'SUBTITLES'].forEach(function (mediaType) {
    for (var groupKey in master.mediaGroups[mediaType]) {
      for (var labelKey in master.mediaGroups[mediaType][groupKey]) {
        var mediaProperties = master.mediaGroups[mediaType][groupKey][labelKey];

        if (mediaProperties.uri) {
          mediaProperties.resolvedUri = (0, _resolveUrl2['default'])(master.uri, mediaProperties.uri);
        }
      }
    }
  });
};

exports.resolveMediaGroupUris = resolveMediaGroupUris;
/**
 * Calculates the time to wait before refreshing a live playlist
 *
 * @param {Object} media
 *        The current media
 * @param {Boolean} update
 *        True if there were any updates from the last refresh, false otherwise
 * @return {Number}
 *         The time in ms to wait before refreshing the live playlist
 */
var refreshDelay = function refreshDelay(media, update) {
  var lastSegment = media.segments[media.segments.length - 1];
  var delay = undefined;

  if (update && lastSegment && lastSegment.duration) {
    delay = lastSegment.duration * 1000;
  } else {
    // if the playlist is unchanged since the last reload or last segment duration
    // cannot be determined, try again after half the target duration
    delay = (media.targetDuration || 10) * 500;
  }
  return delay;
};

exports.refreshDelay = refreshDelay;
/**
 * Load a playlist from a remote location
 *
 * @class PlaylistLoader
 * @extends videojs.EventTarget
 * @param {String} srcUrl the url to start with
 * @param {Object} hls
 * @param {Object} [options]
 * @param {Boolean} [options.withCredentials=false] the withCredentials xhr option
 * @param {Boolean} [options.handleManifestRedirects=false] whether to follow redirects, when any
 *        playlist request was redirected
 */

var PlaylistLoader = (function (_EventTarget) {
  _inherits(PlaylistLoader, _EventTarget);

  function PlaylistLoader(srcUrl, hls, options) {
    var _this = this;

    _classCallCheck(this, PlaylistLoader);

    _get(Object.getPrototypeOf(PlaylistLoader.prototype), 'constructor', this).call(this);

    options = options || {};

    this.srcUrl = srcUrl;
    this.hls_ = hls;
    this.withCredentials = !!options.withCredentials;
    this.handleManifestRedirects = !!options.handleManifestRedirects;

    if (!this.srcUrl) {
      throw new Error('A non-empty playlist URL is required');
    }

    // initialize the loader state
    this.state = 'HAVE_NOTHING';

    // live playlist staleness timeout
    this.on('mediaupdatetimeout', function () {
      if (_this.state !== 'HAVE_METADATA') {
        // only refresh the media playlist if no other activity is going on
        return;
      }

      _this.state = 'HAVE_CURRENT_METADATA';

      _this.request = _this.hls_.xhr({
        uri: (0, _resolveUrl2['default'])(_this.master.uri, _this.media().uri),
        withCredentials: _this.withCredentials
      }, function (error, req) {
        // disposed
        if (!_this.request) {
          return;
        }

        if (error) {
          return _this.playlistRequestError(_this.request, _this.media().uri, 'HAVE_METADATA');
        }

        _this.haveMetadata(_this.request, _this.media().uri);
      });
    });
  }

  _createClass(PlaylistLoader, [{
    key: 'playlistRequestError',
    value: function playlistRequestError(xhr, url, startingState) {
      // any in-flight request is now finished
      this.request = null;

      if (startingState) {
        this.state = startingState;
      }

      this.error = {
        playlist: this.master.playlists[url],
        status: xhr.status,
        message: 'HLS playlist request error at URL: ' + url,
        responseText: xhr.responseText,
        code: xhr.status >= 500 ? 4 : 2
      };

      this.trigger('error');
    }

    // update the playlist loader's state in response to a new or
    // updated playlist.
  }, {
    key: 'haveMetadata',
    value: function haveMetadata(xhr, url) {
      var _this2 = this;

      // any in-flight request is now finished
      this.request = null;
      this.state = 'HAVE_METADATA';

      var parser = new _m3u8Parser2['default'].Parser();

      parser.push(xhr.responseText);
      parser.end();
      parser.manifest.uri = url;
      // m3u8-parser does not attach an attributes property to media playlists so make
      // sure that the property is attached to avoid undefined reference errors
      parser.manifest.attributes = parser.manifest.attributes || {};

      // merge this playlist into the master
      var update = updateMaster(this.master, parser.manifest);

      this.targetDuration = parser.manifest.targetDuration;

      if (update) {
        this.master = update;
        this.media_ = this.master.playlists[parser.manifest.uri];
      } else {
        this.trigger('playlistunchanged');
      }

      // refresh live playlists after a target duration passes
      if (!this.media().endList) {
        _globalWindow2['default'].clearTimeout(this.mediaUpdateTimeout);
        this.mediaUpdateTimeout = _globalWindow2['default'].setTimeout(function () {
          _this2.trigger('mediaupdatetimeout');
        }, refreshDelay(this.media(), !!update));
      }

      this.trigger('loadedplaylist');
    }

    /**
     * Abort any outstanding work and clean up.
     */
  }, {
    key: 'dispose',
    value: function dispose() {
      this.stopRequest();
      _globalWindow2['default'].clearTimeout(this.mediaUpdateTimeout);
    }
  }, {
    key: 'stopRequest',
    value: function stopRequest() {
      if (this.request) {
        var oldRequest = this.request;

        this.request = null;
        oldRequest.onreadystatechange = null;
        oldRequest.abort();
      }
    }

    /**
     * When called without any arguments, returns the currently
     * active media playlist. When called with a single argument,
     * triggers the playlist loader to asynchronously switch to the
     * specified media playlist. Calling this method while the
     * loader is in the HAVE_NOTHING causes an error to be emitted
     * but otherwise has no effect.
     *
     * @param {Object=} playlist the parsed media playlist
     * object to switch to
     * @return {Playlist} the current loaded media
     */
  }, {
    key: 'media',
    value: function media(playlist) {
      var _this3 = this;

      // getter
      if (!playlist) {
        return this.media_;
      }

      // setter
      if (this.state === 'HAVE_NOTHING') {
        throw new Error('Cannot switch media playlist from ' + this.state);
      }

      var startingState = this.state;

      // find the playlist object if the target playlist has been
      // specified by URI
      if (typeof playlist === 'string') {
        if (!this.master.playlists[playlist]) {
          throw new Error('Unknown playlist URI: ' + playlist);
        }
        playlist = this.master.playlists[playlist];
      }

      var mediaChange = !this.media_ || playlist.uri !== this.media_.uri;

      // switch to fully loaded playlists immediately
      if (this.master.playlists[playlist.uri].endList) {
        // abort outstanding playlist requests
        if (this.request) {
          this.request.onreadystatechange = null;
          this.request.abort();
          this.request = null;
        }
        this.state = 'HAVE_METADATA';
        this.media_ = playlist;

        // trigger media change if the active media has been updated
        if (mediaChange) {
          this.trigger('mediachanging');
          this.trigger('mediachange');
        }
        return;
      }

      // switching to the active playlist is a no-op
      if (!mediaChange) {
        return;
      }

      this.state = 'SWITCHING_MEDIA';

      // there is already an outstanding playlist request
      if (this.request) {
        if (playlist.resolvedUri === this.request.url) {
          // requesting to switch to the same playlist multiple times
          // has no effect after the first
          return;
        }
        this.request.onreadystatechange = null;
        this.request.abort();
        this.request = null;
      }

      // request the new playlist
      if (this.media_) {
        this.trigger('mediachanging');
      }

      this.request = this.hls_.xhr({
        uri: playlist.resolvedUri,
        withCredentials: this.withCredentials
      }, function (error, req) {
        // disposed
        if (!_this3.request) {
          return;
        }

        playlist.resolvedUri = _this3.resolveManifestRedirect(playlist.resolvedUri, req);

        if (error) {
          return _this3.playlistRequestError(_this3.request, playlist.uri, startingState);
        }

        _this3.haveMetadata(req, playlist.uri);

        // fire loadedmetadata the first time a media playlist is loaded
        if (startingState === 'HAVE_MASTER') {
          _this3.trigger('loadedmetadata');
        } else {
          _this3.trigger('mediachange');
        }
      });
    }

    /**
     * Checks whether xhr request was redirected and returns correct url depending
     * on `handleManifestRedirects` option
     *
     * @api private
     *
     * @param  {String} url - an url being requested
     * @param  {XMLHttpRequest} req - xhr request result
     *
     * @return {String}
     */
  }, {
    key: 'resolveManifestRedirect',
    value: function resolveManifestRedirect(url, req) {
      if (this.handleManifestRedirects && req.responseURL && url !== req.responseURL) {
        return req.responseURL;
      }

      return url;
    }

    /**
     * pause loading of the playlist
     */
  }, {
    key: 'pause',
    value: function pause() {
      this.stopRequest();
      _globalWindow2['default'].clearTimeout(this.mediaUpdateTimeout);
      if (this.state === 'HAVE_NOTHING') {
        // If we pause the loader before any data has been retrieved, its as if we never
        // started, so reset to an unstarted state.
        this.started = false;
      }
      // Need to restore state now that no activity is happening
      if (this.state === 'SWITCHING_MEDIA') {
        // if the loader was in the process of switching media, it should either return to
        // HAVE_MASTER or HAVE_METADATA depending on if the loader has loaded a media
        // playlist yet. This is determined by the existence of loader.media_
        if (this.media_) {
          this.state = 'HAVE_METADATA';
        } else {
          this.state = 'HAVE_MASTER';
        }
      } else if (this.state === 'HAVE_CURRENT_METADATA') {
        this.state = 'HAVE_METADATA';
      }
    }

    /**
     * start loading of the playlist
     */
  }, {
    key: 'load',
    value: function load(isFinalRendition) {
      var _this4 = this;

      _globalWindow2['default'].clearTimeout(this.mediaUpdateTimeout);

      var media = this.media();

      if (isFinalRendition) {
        var delay = media ? media.targetDuration / 2 * 1000 : 5 * 1000;

        this.mediaUpdateTimeout = _globalWindow2['default'].setTimeout(function () {
          return _this4.load();
        }, delay);
        return;
      }

      if (!this.started) {
        this.start();
        return;
      }

      if (media && !media.endList) {
        this.trigger('mediaupdatetimeout');
      } else {
        this.trigger('loadedplaylist');
      }
    }

    /**
     * start loading of the playlist
     */
  }, {
    key: 'start',
    value: function start() {
      var _this5 = this;

      this.started = true;

      // request the specified URL
      this.request = this.hls_.xhr({
        uri: this.srcUrl,
        withCredentials: this.withCredentials
      }, function (error, req) {
        // disposed
        if (!_this5.request) {
          return;
        }

        // clear the loader's request reference
        _this5.request = null;

        if (error) {
          _this5.error = {
            status: req.status,
            message: 'HLS playlist request error at URL: ' + _this5.srcUrl,
            responseText: req.responseText,
            // MEDIA_ERR_NETWORK
            code: 2
          };
          if (_this5.state === 'HAVE_NOTHING') {
            _this5.started = false;
          }
          return _this5.trigger('error');
        }

        var parser = new _m3u8Parser2['default'].Parser();

        parser.push(req.responseText);
        parser.end();

        _this5.state = 'HAVE_MASTER';

        _this5.srcUrl = _this5.resolveManifestRedirect(_this5.srcUrl, req);

        parser.manifest.uri = _this5.srcUrl;

        // loaded a master playlist
        if (parser.manifest.playlists) {
          _this5.master = parser.manifest;

          setupMediaPlaylists(_this5.master);
          resolveMediaGroupUris(_this5.master);

          _this5.trigger('loadedplaylist');
          if (!_this5.request) {
            // no media playlist was specifically selected so start
            // from the first listed one
            _this5.media(parser.manifest.playlists[0]);
          }
          return;
        }

        // loaded a media playlist
        // infer a master playlist if none was previously requested
        _this5.master = {
          mediaGroups: {
            'AUDIO': {},
            'VIDEO': {},
            'CLOSED-CAPTIONS': {},
            'SUBTITLES': {}
          },
          uri: _globalWindow2['default'].location.href,
          playlists: [{
            uri: _this5.srcUrl,
            resolvedUri: _this5.srcUrl,
            // m3u8-parser does not attach an attributes property to media playlists so make
            // sure that the property is attached to avoid undefined reference errors
            attributes: {}
          }]
        };
        _this5.master.playlists[_this5.srcUrl] = _this5.master.playlists[0];
        _this5.haveMetadata(req, _this5.srcUrl);
        return _this5.trigger('loadedmetadata');
      });
    }
  }]);

  return PlaylistLoader;
})(_videoJs.EventTarget);

exports['default'] = PlaylistLoader;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./resolve-url":15,"global/window":32,"m3u8-parser":33}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _playlist = require('./playlist');

var _playlist2 = _interopRequireDefault(_playlist);

var _utilCodecsJs = require('./util/codecs.js');

// Utilities

/**
 * Returns the CSS value for the specified property on an element
 * using `getComputedStyle`. Firefox has a long-standing issue where
 * getComputedStyle() may return null when running in an iframe with
 * `display: none`.
 *
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 * @param {HTMLElement} el the htmlelement to work on
 * @param {string} the proprety to get the style for
 */
var safeGetComputedStyle = function safeGetComputedStyle(el, property) {
  var result = undefined;

  if (!el) {
    return '';
  }

  result = window.getComputedStyle(el);
  if (!result) {
    return '';
  }

  return result[property];
};

/**
 * Resuable stable sort function
 *
 * @param {Playlists} array
 * @param {Function} sortFn Different comparators
 * @function stableSort
 */
var stableSort = function stableSort(array, sortFn) {
  var newArray = array.slice();

  array.sort(function (left, right) {
    var cmp = sortFn(left, right);

    if (cmp === 0) {
      return newArray.indexOf(left) - newArray.indexOf(right);
    }
    return cmp;
  });
};

/**
 * A comparator function to sort two playlist object by bandwidth.
 *
 * @param {Object} left a media playlist object
 * @param {Object} right a media playlist object
 * @return {Number} Greater than zero if the bandwidth attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the bandwidth of right is greater than left and
 * exactly zero if the two are equal.
 */
var comparePlaylistBandwidth = function comparePlaylistBandwidth(left, right) {
  var leftBandwidth = undefined;
  var rightBandwidth = undefined;

  if (left.attributes.BANDWIDTH) {
    leftBandwidth = left.attributes.BANDWIDTH;
  }
  leftBandwidth = leftBandwidth || window.Number.MAX_VALUE;
  if (right.attributes.BANDWIDTH) {
    rightBandwidth = right.attributes.BANDWIDTH;
  }
  rightBandwidth = rightBandwidth || window.Number.MAX_VALUE;

  return leftBandwidth - rightBandwidth;
};

exports.comparePlaylistBandwidth = comparePlaylistBandwidth;
/**
 * A comparator function to sort two playlist object by resolution (width).
 * @param {Object} left a media playlist object
 * @param {Object} right a media playlist object
 * @return {Number} Greater than zero if the resolution.width attribute of
 * left is greater than the corresponding attribute of right. Less
 * than zero if the resolution.width of right is greater than left and
 * exactly zero if the two are equal.
 */
var comparePlaylistResolution = function comparePlaylistResolution(left, right) {
  var leftWidth = undefined;
  var rightWidth = undefined;

  if (left.attributes.RESOLUTION && left.attributes.RESOLUTION.width) {
    leftWidth = left.attributes.RESOLUTION.width;
  }

  leftWidth = leftWidth || window.Number.MAX_VALUE;

  if (right.attributes.RESOLUTION && right.attributes.RESOLUTION.width) {
    rightWidth = right.attributes.RESOLUTION.width;
  }

  rightWidth = rightWidth || window.Number.MAX_VALUE;

  // NOTE - Fallback to bandwidth sort as appropriate in cases where multiple renditions
  // have the same media dimensions/ resolution
  if (leftWidth === rightWidth && left.attributes.BANDWIDTH && right.attributes.BANDWIDTH) {
    return left.attributes.BANDWIDTH - right.attributes.BANDWIDTH;
  }
  return leftWidth - rightWidth;
};

exports.comparePlaylistResolution = comparePlaylistResolution;
/**
 * Chooses the appropriate media playlist based on bandwidth and player size
 *
 * @param {Object} master
 *        Object representation of the master manifest
 * @param {Number} playerBandwidth
 *        Current calculated bandwidth of the player
 * @param {Number} playerWidth
 *        Current width of the player element
 * @param {Number} playerHeight
 *        Current height of the player element
 * @return {Playlist} the highest bitrate playlist less than the
 * currently detected bandwidth, accounting for some amount of
 * bandwidth variance
 */
var simpleSelector = function simpleSelector(master, playerBandwidth, playerWidth, playerHeight) {
  // convert the playlists to an intermediary representation to make comparisons easier
  var sortedPlaylistReps = master.playlists.map(function (playlist) {
    var width = undefined;
    var height = undefined;
    var bandwidth = undefined;

    width = playlist.attributes.RESOLUTION && playlist.attributes.RESOLUTION.width;
    height = playlist.attributes.RESOLUTION && playlist.attributes.RESOLUTION.height;
    bandwidth = playlist.attributes.BANDWIDTH;

    bandwidth = bandwidth || window.Number.MAX_VALUE;

    return {
      bandwidth: bandwidth,
      width: width,
      height: height,
      playlist: playlist
    };
  });

  stableSort(sortedPlaylistReps, function (left, right) {
    return left.bandwidth - right.bandwidth;
  });

  // filter out any playlists that have been excluded due to
  // incompatible configurations
  sortedPlaylistReps = sortedPlaylistReps.filter(function (rep) {
    return !_playlist2['default'].isIncompatible(rep.playlist);
  });

  // filter out any playlists that have been disabled manually through the representations
  // api or blacklisted temporarily due to playback errors.
  var enabledPlaylistReps = sortedPlaylistReps.filter(function (rep) {
    return _playlist2['default'].isEnabled(rep.playlist);
  });

  if (!enabledPlaylistReps.length) {
    // if there are no enabled playlists, then they have all been blacklisted or disabled
    // by the user through the representations api. In this case, ignore blacklisting and
    // fallback to what the user wants by using playlists the user has not disabled.
    enabledPlaylistReps = sortedPlaylistReps.filter(function (rep) {
      return !_playlist2['default'].isDisabled(rep.playlist);
    });
  }

  // filter out any variant that has greater effective bitrate
  // than the current estimated bandwidth
  var bandwidthPlaylistReps = enabledPlaylistReps.filter(function (rep) {
    return rep.bandwidth * _config2['default'].BANDWIDTH_VARIANCE < playerBandwidth;
  });

  var highestRemainingBandwidthRep = bandwidthPlaylistReps[bandwidthPlaylistReps.length - 1];

  // get all of the renditions with the same (highest) bandwidth
  // and then taking the very first element
  var bandwidthBestRep = bandwidthPlaylistReps.filter(function (rep) {
    return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
  })[0];

  // filter out playlists without resolution information
  var haveResolution = bandwidthPlaylistReps.filter(function (rep) {
    return rep.width && rep.height;
  });

  // sort variants by resolution
  stableSort(haveResolution, function (left, right) {
    return left.width - right.width;
  });

  // if we have the exact resolution as the player use it
  var resolutionBestRepList = haveResolution.filter(function (rep) {
    return rep.width === playerWidth && rep.height === playerHeight;
  });

  highestRemainingBandwidthRep = resolutionBestRepList[resolutionBestRepList.length - 1];
  // ensure that we pick the highest bandwidth variant that have exact resolution
  var resolutionBestRep = resolutionBestRepList.filter(function (rep) {
    return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
  })[0];

  var resolutionPlusOneList = undefined;
  var resolutionPlusOneSmallest = undefined;
  var resolutionPlusOneRep = undefined;

  // find the smallest variant that is larger than the player
  // if there is no match of exact resolution
  if (!resolutionBestRep) {
    resolutionPlusOneList = haveResolution.filter(function (rep) {
      return rep.width > playerWidth || rep.height > playerHeight;
    });

    // find all the variants have the same smallest resolution
    resolutionPlusOneSmallest = resolutionPlusOneList.filter(function (rep) {
      return rep.width === resolutionPlusOneList[0].width && rep.height === resolutionPlusOneList[0].height;
    });

    // ensure that we also pick the highest bandwidth variant that
    // is just-larger-than the video player
    highestRemainingBandwidthRep = resolutionPlusOneSmallest[resolutionPlusOneSmallest.length - 1];
    resolutionPlusOneRep = resolutionPlusOneSmallest.filter(function (rep) {
      return rep.bandwidth === highestRemainingBandwidthRep.bandwidth;
    })[0];
  }

  // fallback chain of variants
  var chosenRep = resolutionPlusOneRep || resolutionBestRep || bandwidthBestRep || enabledPlaylistReps[0] || sortedPlaylistReps[0];

  return chosenRep ? chosenRep.playlist : null;
};

exports.simpleSelector = simpleSelector;
// Playlist Selectors

/**
 * Chooses the appropriate media playlist based on the most recent
 * bandwidth estimate and the player size.
 *
 * Expects to be called within the context of an instance of HlsHandler
 *
 * @return {Playlist} the highest bitrate playlist less than the
 * currently detected bandwidth, accounting for some amount of
 * bandwidth variance
 */
var lastBandwidthSelector = function lastBandwidthSelector() {
  return simpleSelector(this.playlists.master, this.systemBandwidth, parseInt(safeGetComputedStyle(this.tech_.el(), 'width'), 10), parseInt(safeGetComputedStyle(this.tech_.el(), 'height'), 10));
};

exports.lastBandwidthSelector = lastBandwidthSelector;
/**
 * Chooses the appropriate media playlist based on an
 * exponential-weighted moving average of the bandwidth after
 * filtering for player size.
 *
 * Expects to be called within the context of an instance of HlsHandler
 *
 * @param {Number} decay - a number between 0 and 1. Higher values of
 * this parameter will cause previous bandwidth estimates to lose
 * significance more quickly.
 * @return {Function} a function which can be invoked to create a new
 * playlist selector function.
 * @see https://en.wikipedia.org/wiki/Moving_average#Exponential_moving_average
 */
var movingAverageBandwidthSelector = function movingAverageBandwidthSelector(decay) {
  var average = -1;

  if (decay < 0 || decay > 1) {
    throw new Error('Moving average bandwidth decay must be between 0 and 1.');
  }

  return function () {
    if (average < 0) {
      average = this.systemBandwidth;
    }

    average = decay * this.systemBandwidth + (1 - decay) * average;
    return simpleSelector(this.playlists.master, average, parseInt(safeGetComputedStyle(this.tech_.el(), 'width'), 10), parseInt(safeGetComputedStyle(this.tech_.el(), 'height'), 10));
  };
};

exports.movingAverageBandwidthSelector = movingAverageBandwidthSelector;
/**
 * Chooses the appropriate media playlist based on the potential to rebuffer
 *
 * @param {Object} settings
 *        Object of information required to use this selector
 * @param {Object} settings.master
 *        Object representation of the master manifest
 * @param {Number} settings.currentTime
 *        The current time of the player
 * @param {Number} settings.bandwidth
 *        Current measured bandwidth
 * @param {Number} settings.duration
 *        Duration of the media
 * @param {Number} settings.segmentDuration
 *        Segment duration to be used in round trip time calculations
 * @param {Number} settings.timeUntilRebuffer
 *        Time left in seconds until the player has to rebuffer
 * @param {Number} settings.currentTimeline
 *        The current timeline segments are being loaded from
 * @param {SyncController} settings.syncController
 *        SyncController for determining if we have a sync point for a given playlist
 * @return {Object|null}
 *         {Object} return.playlist
 *         The highest bandwidth playlist with the least amount of rebuffering
 *         {Number} return.rebufferingImpact
 *         The amount of time in seconds switching to this playlist will rebuffer. A
 *         negative value means that switching will cause zero rebuffering.
 */
var minRebufferMaxBandwidthSelector = function minRebufferMaxBandwidthSelector(settings) {
  var master = settings.master;
  var currentTime = settings.currentTime;
  var bandwidth = settings.bandwidth;
  var duration = settings.duration;
  var segmentDuration = settings.segmentDuration;
  var timeUntilRebuffer = settings.timeUntilRebuffer;
  var currentTimeline = settings.currentTimeline;
  var syncController = settings.syncController;

  // filter out any playlists that have been excluded due to
  // incompatible configurations
  var compatiblePlaylists = master.playlists.filter(function (playlist) {
    return !_playlist2['default'].isIncompatible(playlist);
  });

  // filter out any playlists that have been disabled manually through the representations
  // api or blacklisted temporarily due to playback errors.
  var enabledPlaylists = compatiblePlaylists.filter(_playlist2['default'].isEnabled);

  if (!enabledPlaylists.length) {
    // if there are no enabled playlists, then they have all been blacklisted or disabled
    // by the user through the representations api. In this case, ignore blacklisting and
    // fallback to what the user wants by using playlists the user has not disabled.
    enabledPlaylists = compatiblePlaylists.filter(function (playlist) {
      return !_playlist2['default'].isDisabled(playlist);
    });
  }

  var bandwidthPlaylists = enabledPlaylists.filter(_playlist2['default'].hasAttribute.bind(null, 'BANDWIDTH'));

  var rebufferingEstimates = bandwidthPlaylists.map(function (playlist) {
    var syncPoint = syncController.getSyncPoint(playlist, duration, currentTimeline, currentTime);
    // If there is no sync point for this playlist, switching to it will require a
    // sync request first. This will double the request time
    var numRequests = syncPoint ? 1 : 2;
    var requestTimeEstimate = _playlist2['default'].estimateSegmentRequestTime(segmentDuration, bandwidth, playlist);
    var rebufferingImpact = requestTimeEstimate * numRequests - timeUntilRebuffer;

    return {
      playlist: playlist,
      rebufferingImpact: rebufferingImpact
    };
  });

  var noRebufferingPlaylists = rebufferingEstimates.filter(function (estimate) {
    return estimate.rebufferingImpact <= 0;
  });

  // Sort by bandwidth DESC
  stableSort(noRebufferingPlaylists, function (a, b) {
    return comparePlaylistBandwidth(b.playlist, a.playlist);
  });

  if (noRebufferingPlaylists.length) {
    return noRebufferingPlaylists[0];
  }

  stableSort(rebufferingEstimates, function (a, b) {
    return a.rebufferingImpact - b.rebufferingImpact;
  });

  return rebufferingEstimates[0] || null;
};

exports.minRebufferMaxBandwidthSelector = minRebufferMaxBandwidthSelector;
/**
 * Chooses the appropriate media playlist, which in this case is the lowest bitrate
 * one with video.  If no renditions with video exist, return the lowest audio rendition.
 *
 * Expects to be called within the context of an instance of HlsHandler
 *
 * @return {Object|null}
 *         {Object} return.playlist
 *         The lowest bitrate playlist that contains a video codec.  If no such rendition
 *         exists pick the lowest audio rendition.
 */
var lowestBitrateCompatibleVariantSelector = function lowestBitrateCompatibleVariantSelector() {
  // filter out any playlists that have been excluded due to
  // incompatible configurations or playback errors
  var playlists = this.playlists.master.playlists.filter(_playlist2['default'].isEnabled);

  // Sort ascending by bitrate
  stableSort(playlists, function (a, b) {
    return comparePlaylistBandwidth(a, b);
  });

  // Parse and assume that playlists with no video codec have no video
  // (this is not necessarily true, although it is generally true).
  //
  // If an entire manifest has no valid videos everything will get filtered
  // out.
  var playlistsWithVideo = playlists.filter(function (playlist) {
    return (0, _utilCodecsJs.parseCodecs)(playlist.attributes.CODECS).videoCodec;
  });

  return playlistsWithVideo[0] || null;
};
exports.lowestBitrateCompatibleVariantSelector = lowestBitrateCompatibleVariantSelector;
},{"./config":3,"./playlist":11,"./util/codecs.js":19}],11:[function(require,module,exports){
(function (global){
/**
 * @file playlist.js
 *
 * Playlist related utilities.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

/**
 * walk backward until we find a duration we can use
 * or return a failure
 *
 * @param {Playlist} playlist the playlist to walk through
 * @param {Number} endSequence the mediaSequence to stop walking on
 */

var backwardDuration = function backwardDuration(playlist, endSequence) {
  var result = 0;
  var i = endSequence - playlist.mediaSequence;
  // if a start time is available for segment immediately following
  // the interval, use it
  var segment = playlist.segments[i];

  // Walk backward until we find the latest segment with timeline
  // information that is earlier than endSequence
  if (segment) {
    if (typeof segment.start !== 'undefined') {
      return { result: segment.start, precise: true };
    }
    if (typeof segment.end !== 'undefined') {
      return {
        result: segment.end - segment.duration,
        precise: true
      };
    }
  }
  while (i--) {
    segment = playlist.segments[i];
    if (typeof segment.end !== 'undefined') {
      return { result: result + segment.end, precise: true };
    }

    result += segment.duration;

    if (typeof segment.start !== 'undefined') {
      return { result: result + segment.start, precise: true };
    }
  }
  return { result: result, precise: false };
};

/**
 * walk forward until we find a duration we can use
 * or return a failure
 *
 * @param {Playlist} playlist the playlist to walk through
 * @param {Number} endSequence the mediaSequence to stop walking on
 */
var forwardDuration = function forwardDuration(playlist, endSequence) {
  var result = 0;
  var segment = undefined;
  var i = endSequence - playlist.mediaSequence;
  // Walk forward until we find the earliest segment with timeline
  // information

  for (; i < playlist.segments.length; i++) {
    segment = playlist.segments[i];
    if (typeof segment.start !== 'undefined') {
      return {
        result: segment.start - result,
        precise: true
      };
    }

    result += segment.duration;

    if (typeof segment.end !== 'undefined') {
      return {
        result: segment.end - result,
        precise: true
      };
    }
  }
  // indicate we didn't find a useful duration estimate
  return { result: -1, precise: false };
};

/**
  * Calculate the media duration from the segments associated with a
  * playlist. The duration of a subinterval of the available segments
  * may be calculated by specifying an end index.
  *
  * @param {Object} playlist a media playlist object
  * @param {Number=} endSequence an exclusive upper boundary
  * for the playlist.  Defaults to playlist length.
  * @param {Number} expired the amount of time that has dropped
  * off the front of the playlist in a live scenario
  * @return {Number} the duration between the first available segment
  * and end index.
  */
var intervalDuration = function intervalDuration(playlist, endSequence, expired) {
  var backward = undefined;
  var forward = undefined;

  if (typeof endSequence === 'undefined') {
    endSequence = playlist.mediaSequence + playlist.segments.length;
  }

  if (endSequence < playlist.mediaSequence) {
    return 0;
  }

  // do a backward walk to estimate the duration
  backward = backwardDuration(playlist, endSequence);
  if (backward.precise) {
    // if we were able to base our duration estimate on timing
    // information provided directly from the Media Source, return
    // it
    return backward.result;
  }

  // walk forward to see if a precise duration estimate can be made
  // that way
  forward = forwardDuration(playlist, endSequence);
  if (forward.precise) {
    // we found a segment that has been buffered and so it's
    // position is known precisely
    return forward.result;
  }

  // return the less-precise, playlist-based duration estimate
  return backward.result + expired;
};

/**
  * Calculates the duration of a playlist. If a start and end index
  * are specified, the duration will be for the subset of the media
  * timeline between those two indices. The total duration for live
  * playlists is always Infinity.
  *
  * @param {Object} playlist a media playlist object
  * @param {Number=} endSequence an exclusive upper
  * boundary for the playlist. Defaults to the playlist media
  * sequence number plus its length.
  * @param {Number=} expired the amount of time that has
  * dropped off the front of the playlist in a live scenario
  * @return {Number} the duration between the start index and end
  * index.
  */
var duration = function duration(playlist, endSequence, expired) {
  if (!playlist) {
    return 0;
  }

  if (typeof expired !== 'number') {
    expired = 0;
  }

  // if a slice of the total duration is not requested, use
  // playlist-level duration indicators when they're present
  if (typeof endSequence === 'undefined') {
    // if present, use the duration specified in the playlist
    if (playlist.totalDuration) {
      return playlist.totalDuration;
    }

    // duration should be Infinity for live playlists
    if (!playlist.endList) {
      return _globalWindow2['default'].Infinity;
    }
  }

  // calculate the total duration based on the segment durations
  return intervalDuration(playlist, endSequence, expired);
};

exports.duration = duration;
/**
  * Calculate the time between two indexes in the current playlist
  * neight the start- nor the end-index need to be within the current
  * playlist in which case, the targetDuration of the playlist is used
  * to approximate the durations of the segments
  *
  * @param {Object} playlist a media playlist object
  * @param {Number} startIndex
  * @param {Number} endIndex
  * @return {Number} the number of seconds between startIndex and endIndex
  */
var sumDurations = function sumDurations(playlist, startIndex, endIndex) {
  var durations = 0;

  if (startIndex > endIndex) {
    var _ref = [endIndex, startIndex];
    startIndex = _ref[0];
    endIndex = _ref[1];
  }

  if (startIndex < 0) {
    for (var i = startIndex; i < Math.min(0, endIndex); i++) {
      durations += playlist.targetDuration;
    }
    startIndex = 0;
  }

  for (var i = startIndex; i < endIndex; i++) {
    durations += playlist.segments[i].duration;
  }

  return durations;
};

exports.sumDurations = sumDurations;
/**
 * Determines the media index of the segment corresponding to the safe edge of the live
 * window which is the duration of the last segment plus 2 target durations from the end
 * of the playlist.
 *
 * @param {Object} playlist
 *        a media playlist object
 * @return {Number}
 *         The media index of the segment at the safe live point. 0 if there is no "safe"
 *         point.
 * @function safeLiveIndex
 */
var safeLiveIndex = function safeLiveIndex(playlist) {
  if (!playlist.segments.length) {
    return 0;
  }

  var i = playlist.segments.length - 1;
  var distanceFromEnd = playlist.segments[i].duration || playlist.targetDuration;
  var safeDistance = distanceFromEnd + playlist.targetDuration * 2;

  while (i--) {
    distanceFromEnd += playlist.segments[i].duration;

    if (distanceFromEnd >= safeDistance) {
      break;
    }
  }

  return Math.max(0, i);
};

exports.safeLiveIndex = safeLiveIndex;
/**
 * Calculates the playlist end time
 *
 * @param {Object} playlist a media playlist object
 * @param {Number=} expired the amount of time that has
 *                  dropped off the front of the playlist in a live scenario
 * @param {Boolean|false} useSafeLiveEnd a boolean value indicating whether or not the
 *                        playlist end calculation should consider the safe live end
 *                        (truncate the playlist end by three segments). This is normally
 *                        used for calculating the end of the playlist's seekable range.
 * @returns {Number} the end time of playlist
 * @function playlistEnd
 */
var playlistEnd = function playlistEnd(playlist, expired, useSafeLiveEnd) {
  if (!playlist || !playlist.segments) {
    return null;
  }
  if (playlist.endList) {
    return duration(playlist);
  }

  if (expired === null) {
    return null;
  }

  expired = expired || 0;

  var endSequence = useSafeLiveEnd ? safeLiveIndex(playlist) : playlist.segments.length;

  return intervalDuration(playlist, playlist.mediaSequence + endSequence, expired);
};

exports.playlistEnd = playlistEnd;
/**
  * Calculates the interval of time that is currently seekable in a
  * playlist. The returned time ranges are relative to the earliest
  * moment in the specified playlist that is still available. A full
  * seekable implementation for live streams would need to offset
  * these values by the duration of content that has expired from the
  * stream.
  *
  * @param {Object} playlist a media playlist object
  * dropped off the front of the playlist in a live scenario
  * @param {Number=} expired the amount of time that has
  * dropped off the front of the playlist in a live scenario
  * @return {TimeRanges} the periods of time that are valid targets
  * for seeking
  */
var seekable = function seekable(playlist, expired) {
  var useSafeLiveEnd = true;
  var seekableStart = expired || 0;
  var seekableEnd = playlistEnd(playlist, expired, useSafeLiveEnd);

  if (seekableEnd === null) {
    return (0, _videoJs.createTimeRange)();
  }
  return (0, _videoJs.createTimeRange)(seekableStart, seekableEnd);
};

exports.seekable = seekable;
var isWholeNumber = function isWholeNumber(num) {
  return num - Math.floor(num) === 0;
};

var roundSignificantDigit = function roundSignificantDigit(increment, num) {
  // If we have a whole number, just add 1 to it
  if (isWholeNumber(num)) {
    return num + increment * 0.1;
  }

  var numDecimalDigits = num.toString().split('.')[1].length;

  for (var i = 1; i <= numDecimalDigits; i++) {
    var scale = Math.pow(10, i);
    var temp = num * scale;

    if (isWholeNumber(temp) || i === numDecimalDigits) {
      return (temp + increment) / scale;
    }
  }
};

var ceilLeastSignificantDigit = roundSignificantDigit.bind(null, 1);
var floorLeastSignificantDigit = roundSignificantDigit.bind(null, -1);

/**
 * Determine the index and estimated starting time of the segment that
 * contains a specified playback position in a media playlist.
 *
 * @param {Object} playlist the media playlist to query
 * @param {Number} currentTime The number of seconds since the earliest
 * possible position to determine the containing segment for
 * @param {Number} startIndex
 * @param {Number} startTime
 * @return {Object}
 */
var getMediaInfoForTime = function getMediaInfoForTime(playlist, currentTime, startIndex, startTime) {
  var i = undefined;
  var segment = undefined;
  var numSegments = playlist.segments.length;

  var time = currentTime - startTime;

  if (time < 0) {
    // Walk backward from startIndex in the playlist, adding durations
    // until we find a segment that contains `time` and return it
    if (startIndex > 0) {
      for (i = startIndex - 1; i >= 0; i--) {
        segment = playlist.segments[i];
        time += floorLeastSignificantDigit(segment.duration);
        if (time > 0) {
          return {
            mediaIndex: i,
            startTime: startTime - sumDurations(playlist, startIndex, i)
          };
        }
      }
    }
    // We were unable to find a good segment within the playlist
    // so select the first segment
    return {
      mediaIndex: 0,
      startTime: currentTime
    };
  }

  // When startIndex is negative, we first walk forward to first segment
  // adding target durations. If we "run out of time" before getting to
  // the first segment, return the first segment
  if (startIndex < 0) {
    for (i = startIndex; i < 0; i++) {
      time -= playlist.targetDuration;
      if (time < 0) {
        return {
          mediaIndex: 0,
          startTime: currentTime
        };
      }
    }
    startIndex = 0;
  }

  // Walk forward from startIndex in the playlist, subtracting durations
  // until we find a segment that contains `time` and return it
  for (i = startIndex; i < numSegments; i++) {
    segment = playlist.segments[i];
    time -= ceilLeastSignificantDigit(segment.duration);
    if (time < 0) {
      return {
        mediaIndex: i,
        startTime: startTime + sumDurations(playlist, startIndex, i)
      };
    }
  }

  // We are out of possible candidates so load the last one...
  return {
    mediaIndex: numSegments - 1,
    startTime: currentTime
  };
};

exports.getMediaInfoForTime = getMediaInfoForTime;
/**
 * Check whether the playlist is blacklisted or not.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is blacklisted or not
 * @function isBlacklisted
 */
var isBlacklisted = function isBlacklisted(playlist) {
  return playlist.excludeUntil && playlist.excludeUntil > Date.now();
};

exports.isBlacklisted = isBlacklisted;
/**
 * Check whether the playlist is compatible with current playback configuration or has
 * been blacklisted permanently for being incompatible.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is incompatible or not
 * @function isIncompatible
 */
var isIncompatible = function isIncompatible(playlist) {
  return playlist.excludeUntil && playlist.excludeUntil === Infinity;
};

exports.isIncompatible = isIncompatible;
/**
 * Check whether the playlist is enabled or not.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is enabled or not
 * @function isEnabled
 */
var isEnabled = function isEnabled(playlist) {
  var blacklisted = isBlacklisted(playlist);

  return !playlist.disabled && !blacklisted;
};

exports.isEnabled = isEnabled;
/**
 * Check whether the playlist has been manually disabled through the representations api.
 *
 * @param {Object} playlist the media playlist object
 * @return {boolean} whether the playlist is disabled manually or not
 * @function isDisabled
 */
var isDisabled = function isDisabled(playlist) {
  return playlist.disabled;
};

exports.isDisabled = isDisabled;
/**
 * Returns whether the current playlist is an AES encrypted HLS stream
 *
 * @return {Boolean} true if it's an AES encrypted HLS stream
 */
var isAes = function isAes(media) {
  for (var i = 0; i < media.segments.length; i++) {
    if (media.segments[i].key) {
      return true;
    }
  }
  return false;
};

exports.isAes = isAes;
/**
 * Returns whether the current playlist contains fMP4
 *
 * @return {Boolean} true if the playlist contains fMP4
 */
var isFmp4 = function isFmp4(media) {
  for (var i = 0; i < media.segments.length; i++) {
    if (media.segments[i].map) {
      return true;
    }
  }
  return false;
};

exports.isFmp4 = isFmp4;
/**
 * Checks if the playlist has a value for the specified attribute
 *
 * @param {String} attr
 *        Attribute to check for
 * @param {Object} playlist
 *        The media playlist object
 * @return {Boolean}
 *         Whether the playlist contains a value for the attribute or not
 * @function hasAttribute
 */
var hasAttribute = function hasAttribute(attr, playlist) {
  return playlist.attributes && playlist.attributes[attr];
};

exports.hasAttribute = hasAttribute;
/**
 * Estimates the time required to complete a segment download from the specified playlist
 *
 * @param {Number} segmentDuration
 *        Duration of requested segment
 * @param {Number} bandwidth
 *        Current measured bandwidth of the player
 * @param {Object} playlist
 *        The media playlist object
 * @param {Number=} bytesReceived
 *        Number of bytes already received for the request. Defaults to 0
 * @return {Number|NaN}
 *         The estimated time to request the segment. NaN if bandwidth information for
 *         the given playlist is unavailable
 * @function estimateSegmentRequestTime
 */
var estimateSegmentRequestTime = function estimateSegmentRequestTime(segmentDuration, bandwidth, playlist) {
  var bytesReceived = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  if (!hasAttribute('BANDWIDTH', playlist)) {
    return NaN;
  }

  var size = segmentDuration * playlist.attributes.BANDWIDTH;

  return (size - bytesReceived * 8) / bandwidth;
};

exports.estimateSegmentRequestTime = estimateSegmentRequestTime;
/*
 * Returns whether the current playlist is the lowest rendition
 *
 * @return {Boolean} true if on lowest rendition
 */
var isLowestEnabledRendition = function isLowestEnabledRendition(master, media) {
  if (master.playlists.length === 1) {
    return true;
  }

  var currentBandwidth = media.attributes.BANDWIDTH || Number.MAX_VALUE;

  return master.playlists.filter(function (playlist) {
    if (!isEnabled(playlist)) {
      return false;
    }

    return (playlist.attributes.BANDWIDTH || 0) < currentBandwidth;
  }).length === 0;
};

exports.isLowestEnabledRendition = isLowestEnabledRendition;
// exports
exports['default'] = {
  duration: duration,
  seekable: seekable,
  safeLiveIndex: safeLiveIndex,
  getMediaInfoForTime: getMediaInfoForTime,
  isEnabled: isEnabled,
  isDisabled: isDisabled,
  isBlacklisted: isBlacklisted,
  isIncompatible: isIncompatible,
  playlistEnd: playlistEnd,
  isAes: isAes,
  isFmp4: isFmp4,
  hasAttribute: hasAttribute,
  estimateSegmentRequestTime: estimateSegmentRequestTime,
  isLowestEnabledRendition: isLowestEnabledRendition
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"global/window":32}],12:[function(require,module,exports){
(function (global){
/**
 * ranges
 *
 * Utilities for working with TimeRanges.
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Fudge factor to account for TimeRanges rounding
var TIME_FUDGE_FACTOR = 1 / 30;
// Comparisons between time values such as current time and the end of the buffered range
// can be misleading because of precision differences or when the current media has poorly
// aligned audio and video, which can cause values to be slightly off from what you would
// expect. This value is what we consider to be safe to use in such comparisons to account
// for these scenarios.
var SAFE_TIME_DELTA = TIME_FUDGE_FACTOR * 3;

/**
 * Clamps a value to within a range
 * @param {Number} num - the value to clamp
 * @param {Number} start - the start of the range to clamp within, inclusive
 * @param {Number} end - the end of the range to clamp within, inclusive
 * @return {Number}
 */
var clamp = function clamp(num, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var start = _ref2[0];
  var end = _ref2[1];

  return Math.min(Math.max(start, num), end);
};
var filterRanges = function filterRanges(timeRanges, predicate) {
  var results = [];
  var i = undefined;

  if (timeRanges && timeRanges.length) {
    // Search for ranges that match the predicate
    for (i = 0; i < timeRanges.length; i++) {
      if (predicate(timeRanges.start(i), timeRanges.end(i))) {
        results.push([timeRanges.start(i), timeRanges.end(i)]);
      }
    }
  }

  return _videoJs2['default'].createTimeRanges(results);
};

/**
 * Attempts to find the buffered TimeRange that contains the specified
 * time.
 * @param {TimeRanges} buffered - the TimeRanges object to query
 * @param {number} time  - the time to filter on.
 * @returns {TimeRanges} a new TimeRanges object
 */
var findRange = function findRange(buffered, time) {
  return filterRanges(buffered, function (start, end) {
    return start - TIME_FUDGE_FACTOR <= time && end + TIME_FUDGE_FACTOR >= time;
  });
};

/**
 * Returns the TimeRanges that begin later than the specified time.
 * @param {TimeRanges} timeRanges - the TimeRanges object to query
 * @param {number} time - the time to filter on.
 * @returns {TimeRanges} a new TimeRanges object.
 */
var findNextRange = function findNextRange(timeRanges, time) {
  return filterRanges(timeRanges, function (start) {
    return start - TIME_FUDGE_FACTOR >= time;
  });
};

/**
 * Returns gaps within a list of TimeRanges
 * @param {TimeRanges} buffered - the TimeRanges object
 * @return {TimeRanges} a TimeRanges object of gaps
 */
var findGaps = function findGaps(buffered) {
  if (buffered.length < 2) {
    return _videoJs2['default'].createTimeRanges();
  }

  var ranges = [];

  for (var i = 1; i < buffered.length; i++) {
    var start = buffered.end(i - 1);
    var end = buffered.start(i);

    ranges.push([start, end]);
  }

  return _videoJs2['default'].createTimeRanges(ranges);
};

/**
 * Search for a likely end time for the segment that was just appened
 * based on the state of the `buffered` property before and after the
 * append. If we fin only one such uncommon end-point return it.
 * @param {TimeRanges} original - the buffered time ranges before the update
 * @param {TimeRanges} update - the buffered time ranges after the update
 * @returns {Number|null} the end time added between `original` and `update`,
 * or null if one cannot be unambiguously determined.
 */
var findSoleUncommonTimeRangesEnd = function findSoleUncommonTimeRangesEnd(original, update) {
  var i = undefined;
  var start = undefined;
  var end = undefined;
  var result = [];
  var edges = [];

  // In order to qualify as a possible candidate, the end point must:
  //  1) Not have already existed in the `original` ranges
  //  2) Not result from the shrinking of a range that already existed
  //     in the `original` ranges
  //  3) Not be contained inside of a range that existed in `original`
  var overlapsCurrentEnd = function overlapsCurrentEnd(span) {
    return span[0] <= end && span[1] >= end;
  };

  if (original) {
    // Save all the edges in the `original` TimeRanges object
    for (i = 0; i < original.length; i++) {
      start = original.start(i);
      end = original.end(i);

      edges.push([start, end]);
    }
  }

  if (update) {
    // Save any end-points in `update` that are not in the `original`
    // TimeRanges object
    for (i = 0; i < update.length; i++) {
      start = update.start(i);
      end = update.end(i);

      if (edges.some(overlapsCurrentEnd)) {
        continue;
      }

      // at this point it must be a unique non-shrinking end edge
      result.push(end);
    }
  }

  // we err on the side of caution and return null if didn't find
  // exactly *one* differing end edge in the search above
  if (result.length !== 1) {
    return null;
  }

  return result[0];
};

/**
 * Calculate the intersection of two TimeRanges
 * @param {TimeRanges} bufferA
 * @param {TimeRanges} bufferB
 * @returns {TimeRanges} The interesection of `bufferA` with `bufferB`
 */
var bufferIntersection = function bufferIntersection(bufferA, bufferB) {
  var start = null;
  var end = null;
  var arity = 0;
  var extents = [];
  var ranges = [];

  if (!bufferA || !bufferA.length || !bufferB || !bufferB.length) {
    return _videoJs2['default'].createTimeRange();
  }

  // Handle the case where we have both buffers and create an
  // intersection of the two
  var count = bufferA.length;

  // A) Gather up all start and end times
  while (count--) {
    extents.push({ time: bufferA.start(count), type: 'start' });
    extents.push({ time: bufferA.end(count), type: 'end' });
  }
  count = bufferB.length;
  while (count--) {
    extents.push({ time: bufferB.start(count), type: 'start' });
    extents.push({ time: bufferB.end(count), type: 'end' });
  }
  // B) Sort them by time
  extents.sort(function (a, b) {
    return a.time - b.time;
  });

  // C) Go along one by one incrementing arity for start and decrementing
  //    arity for ends
  for (count = 0; count < extents.length; count++) {
    if (extents[count].type === 'start') {
      arity++;

      // D) If arity is ever incremented to 2 we are entering an
      //    overlapping range
      if (arity === 2) {
        start = extents[count].time;
      }
    } else if (extents[count].type === 'end') {
      arity--;

      // E) If arity is ever decremented to 1 we leaving an
      //    overlapping range
      if (arity === 1) {
        end = extents[count].time;
      }
    }

    // F) Record overlapping ranges
    if (start !== null && end !== null) {
      ranges.push([start, end]);
      start = null;
      end = null;
    }
  }

  return _videoJs2['default'].createTimeRanges(ranges);
};

/**
 * Calculates the percentage of `segmentRange` that overlaps the
 * `buffered` time ranges.
 * @param {TimeRanges} segmentRange - the time range that the segment
 * covers adjusted according to currentTime
 * @param {TimeRanges} referenceRange - the original time range that the
 * segment covers
 * @param {Number} currentTime - time in seconds where the current playback
 * is at
 * @param {TimeRanges} buffered - the currently buffered time ranges
 * @returns {Number} percent of the segment currently buffered
 */
var calculateBufferedPercent = function calculateBufferedPercent(adjustedRange, referenceRange, currentTime, buffered) {
  var referenceDuration = referenceRange.end(0) - referenceRange.start(0);
  var adjustedDuration = adjustedRange.end(0) - adjustedRange.start(0);
  var bufferMissingFromAdjusted = referenceDuration - adjustedDuration;
  var adjustedIntersection = bufferIntersection(adjustedRange, buffered);
  var referenceIntersection = bufferIntersection(referenceRange, buffered);
  var adjustedOverlap = 0;
  var referenceOverlap = 0;

  var count = adjustedIntersection.length;

  while (count--) {
    adjustedOverlap += adjustedIntersection.end(count) - adjustedIntersection.start(count);

    // If the current overlap segment starts at currentTime, then increase the
    // overlap duration so that it actually starts at the beginning of referenceRange
    // by including the difference between the two Range's durations
    // This is a work around for the way Flash has no buffer before currentTime
    if (adjustedIntersection.start(count) === currentTime) {
      adjustedOverlap += bufferMissingFromAdjusted;
    }
  }

  count = referenceIntersection.length;

  while (count--) {
    referenceOverlap += referenceIntersection.end(count) - referenceIntersection.start(count);
  }

  // Use whichever value is larger for the percentage-buffered since that value
  // is likely more accurate because the only way
  return Math.max(adjustedOverlap, referenceOverlap) / referenceDuration * 100;
};

/**
 * Return the amount of a range specified by the startOfSegment and segmentDuration
 * overlaps the current buffered content.
 *
 * @param {Number} startOfSegment - the time where the segment begins
 * @param {Number} segmentDuration - the duration of the segment in seconds
 * @param {Number} currentTime - time in seconds where the current playback
 * is at
 * @param {TimeRanges} buffered - the state of the buffer
 * @returns {Number} percentage of the segment's time range that is
 * already in `buffered`
 */
var getSegmentBufferedPercent = function getSegmentBufferedPercent(startOfSegment, segmentDuration, currentTime, buffered) {
  var endOfSegment = startOfSegment + segmentDuration;

  // The entire time range of the segment
  var originalSegmentRange = _videoJs2['default'].createTimeRanges([[startOfSegment, endOfSegment]]);

  // The adjusted segment time range that is setup such that it starts
  // no earlier than currentTime
  // Flash has no notion of a back-buffer so adjustedSegmentRange adjusts
  // for that and the function will still return 100% if a only half of a
  // segment is actually in the buffer as long as the currentTime is also
  // half-way through the segment
  var adjustedSegmentRange = _videoJs2['default'].createTimeRanges([[clamp(startOfSegment, [currentTime, endOfSegment]), endOfSegment]]);

  // This condition happens when the currentTime is beyond the segment's
  // end time
  if (adjustedSegmentRange.start(0) === adjustedSegmentRange.end(0)) {
    return 0;
  }

  var percent = calculateBufferedPercent(adjustedSegmentRange, originalSegmentRange, currentTime, buffered);

  // If the segment is reported as having a zero duration, return 0%
  // since it is likely that we will need to fetch the segment
  if (isNaN(percent) || percent === Infinity || percent === -Infinity) {
    return 0;
  }

  return percent;
};

/**
 * Gets a human readable string for a TimeRange
 *
 * @param {TimeRange} range
 * @returns {String} a human readable string
 */
var printableRange = function printableRange(range) {
  var strArr = [];

  if (!range || !range.length) {
    return '';
  }

  for (var i = 0; i < range.length; i++) {
    strArr.push(range.start(i) + ' => ' + range.end(i));
  }

  return strArr.join(', ');
};

/**
 * Calculates the amount of time left in seconds until the player hits the end of the
 * buffer and causes a rebuffer
 *
 * @param {TimeRange} buffered
 *        The state of the buffer
 * @param {Numnber} currentTime
 *        The current time of the player
 * @param {Number} playbackRate
 *        The current playback rate of the player. Defaults to 1.
 * @return {Number}
 *         Time until the player has to start rebuffering in seconds.
 * @function timeUntilRebuffer
 */
var timeUntilRebuffer = function timeUntilRebuffer(buffered, currentTime) {
  var playbackRate = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var bufferedEnd = buffered.length ? buffered.end(buffered.length - 1) : 0;

  return (bufferedEnd - currentTime) / playbackRate;
};

exports['default'] = {
  findRange: findRange,
  findNextRange: findNextRange,
  findGaps: findGaps,
  findSoleUncommonTimeRangesEnd: findSoleUncommonTimeRangesEnd,
  getSegmentBufferedPercent: getSegmentBufferedPercent,
  TIME_FUDGE_FACTOR: TIME_FUDGE_FACTOR,
  SAFE_TIME_DELTA: SAFE_TIME_DELTA,
  printableRange: printableRange,
  timeUntilRebuffer: timeUntilRebuffer
};
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var defaultOptions = {
  errorInterval: 30,
  getSource: function getSource(next) {
    var tech = this.tech({ IWillNotUseThisInPlugins: true });
    var sourceObj = tech.currentSource_;

    return next(sourceObj);
  }
};

/**
 * Main entry point for the plugin
 *
 * @param {Player} player a reference to a videojs Player instance
 * @param {Object} [options] an object with plugin options
 * @private
 */
var initPlugin = function initPlugin(player, options) {
  var lastCalled = 0;
  var seekTo = 0;
  var localOptions = _videoJs2['default'].mergeOptions(defaultOptions, options);

  player.ready(function () {
    player.trigger({ type: 'usage', name: 'hls-error-reload-initialized' });
  });

  /**
   * Player modifications to perform that must wait until `loadedmetadata`
   * has been triggered
   *
   * @private
   */
  var loadedMetadataHandler = function loadedMetadataHandler() {
    if (seekTo) {
      player.currentTime(seekTo);
    }
  };

  /**
   * Set the source on the player element, play, and seek if necessary
   *
   * @param {Object} sourceObj An object specifying the source url and mime-type to play
   * @private
   */
  var setSource = function setSource(sourceObj) {
    if (sourceObj === null || sourceObj === undefined) {
      return;
    }
    seekTo = player.duration() !== Infinity && player.currentTime() || 0;

    player.one('loadedmetadata', loadedMetadataHandler);

    player.src(sourceObj);
    player.trigger({ type: 'usage', name: 'hls-error-reload' });
    player.play();
  };

  /**
   * Attempt to get a source from either the built-in getSource function
   * or a custom function provided via the options
   *
   * @private
   */
  var errorHandler = function errorHandler() {
    // Do not attempt to reload the source if a source-reload occurred before
    // 'errorInterval' time has elapsed since the last source-reload
    if (Date.now() - lastCalled < localOptions.errorInterval * 1000) {
      player.trigger({ type: 'usage', name: 'hls-error-reload-canceled' });
      return;
    }

    if (!localOptions.getSource || typeof localOptions.getSource !== 'function') {
      _videoJs2['default'].log.error('ERROR: reloadSourceOnError - The option getSource must be a function!');
      return;
    }
    lastCalled = Date.now();

    return localOptions.getSource.call(player, setSource);
  };

  /**
   * Unbind any event handlers that were bound by the plugin
   *
   * @private
   */
  var cleanupEvents = function cleanupEvents() {
    player.off('loadedmetadata', loadedMetadataHandler);
    player.off('error', errorHandler);
    player.off('dispose', cleanupEvents);
  };

  /**
   * Cleanup before re-initializing the plugin
   *
   * @param {Object} [newOptions] an object with plugin options
   * @private
   */
  var reinitPlugin = function reinitPlugin(newOptions) {
    cleanupEvents();
    initPlugin(player, newOptions);
  };

  player.on('error', errorHandler);
  player.on('dispose', cleanupEvents);

  // Overwrite the plugin function so that we can correctly cleanup before
  // initializing the plugin
  player.reloadSourceOnError = reinitPlugin;
};

/**
 * Reload the source when an error is detected as long as there
 * wasn't an error previously within the last 30 seconds
 *
 * @param {Object} [options] an object with plugin options
 */
var reloadSourceOnError = function reloadSourceOnError(options) {
  initPlugin(this, options);
};

exports['default'] = reloadSourceOnError;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _playlistJs = require('./playlist.js');

/**
 * Returns a function that acts as the Enable/disable playlist function.
 *
 * @param {PlaylistLoader} loader - The master playlist loader
 * @param {String} playlistUri - uri of the playlist
 * @param {Function} changePlaylistFn - A function to be called after a
 * playlist's enabled-state has been changed. Will NOT be called if a
 * playlist's enabled-state is unchanged
 * @param {Boolean=} enable - Value to set the playlist enabled-state to
 * or if undefined returns the current enabled-state for the playlist
 * @return {Function} Function for setting/getting enabled
 */
var enableFunction = function enableFunction(loader, playlistUri, changePlaylistFn) {
  return function (enable) {
    var playlist = loader.master.playlists[playlistUri];
    var incompatible = (0, _playlistJs.isIncompatible)(playlist);
    var currentlyEnabled = (0, _playlistJs.isEnabled)(playlist);

    if (typeof enable === 'undefined') {
      return currentlyEnabled;
    }

    if (enable) {
      delete playlist.disabled;
    } else {
      playlist.disabled = true;
    }

    if (enable !== currentlyEnabled && !incompatible) {
      // Ensure the outside world knows about our changes
      changePlaylistFn();
      if (enable) {
        loader.trigger('renditionenabled');
      } else {
        loader.trigger('renditiondisabled');
      }
    }
    return enable;
  };
};

/**
 * The representation object encapsulates the publicly visible information
 * in a media playlist along with a setter/getter-type function (enabled)
 * for changing the enabled-state of a particular playlist entry
 *
 * @class Representation
 */

var Representation = function Representation(hlsHandler, playlist, id) {
  _classCallCheck(this, Representation);

  // Get a reference to a bound version of fastQualityChange_
  var fastChangeFunction = hlsHandler.masterPlaylistController_.fastQualityChange_.bind(hlsHandler.masterPlaylistController_);

  // some playlist attributes are optional
  if (playlist.attributes.RESOLUTION) {
    var resolution = playlist.attributes.RESOLUTION;

    this.width = resolution.width;
    this.height = resolution.height;
  }

  this.bandwidth = playlist.attributes.BANDWIDTH;

  // The id is simply the ordinality of the media playlist
  // within the master playlist
  this.id = id;

  // Partially-apply the enableFunction to create a playlist-
  // specific variant
  this.enabled = enableFunction(hlsHandler.playlists, playlist.uri, fastChangeFunction);
}

/**
 * A mixin function that adds the `representations` api to an instance
 * of the HlsHandler class
 * @param {HlsHandler} hlsHandler - An instance of HlsHandler to add the
 * representation API into
 */
;

var renditionSelectionMixin = function renditionSelectionMixin(hlsHandler) {
  var playlists = hlsHandler.playlists;

  // Add a single API-specific function to the HlsHandler instance
  hlsHandler.representations = function () {
    return playlists.master.playlists.filter(function (media) {
      return !(0, _playlistJs.isIncompatible)(media);
    }).map(function (e, i) {
      return new Representation(hlsHandler, e, e.uri);
    });
  };
};

exports['default'] = renditionSelectionMixin;
module.exports = exports['default'];
},{"./playlist.js":11}],15:[function(require,module,exports){
/**
 * @file resolve-url.js
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _urlToolkit = require('url-toolkit');

var _urlToolkit2 = _interopRequireDefault(_urlToolkit);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var resolveUrl = function resolveUrl(baseURL, relativeURL) {
  // return early if we don't need to resolve
  if (/^[a-z]+:/i.test(relativeURL)) {
    return relativeURL;
  }

  // if the base URL is relative then combine with the current location
  if (!/\/\//i.test(baseURL)) {
    baseURL = _urlToolkit2['default'].buildAbsoluteURL(_globalWindow2['default'].location.href, baseURL);
  }

  return _urlToolkit2['default'].buildAbsoluteURL(baseURL, relativeURL);
};

exports['default'] = resolveUrl;
module.exports = exports['default'];
},{"global/window":32,"url-toolkit":63}],16:[function(require,module,exports){
(function (global){
/**
 * @file segment-loader.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _playlist = require('./playlist');

var _playlist2 = _interopRequireDefault(_playlist);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _sourceUpdater = require('./source-updater');

var _sourceUpdater2 = _interopRequireDefault(_sourceUpdater);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs = require('videojs-contrib-media-sources/es5/remove-cues-from-track.js');

var _videojsContribMediaSourcesEs5RemoveCuesFromTrackJs2 = _interopRequireDefault(_videojsContribMediaSourcesEs5RemoveCuesFromTrackJs);

var _binUtils = require('./bin-utils');

var _mediaSegmentRequest = require('./media-segment-request');

var _ranges = require('./ranges');

var _playlistSelectors = require('./playlist-selectors');

// in ms
var CHECK_BUFFER_DELAY = 500;

/**
 * Determines if we should call endOfStream on the media source based
 * on the state of the buffer or if appened segment was the final
 * segment in the playlist.
 *
 * @param {Object} playlist a media playlist object
 * @param {Object} mediaSource the MediaSource object
 * @param {Number} segmentIndex the index of segment we last appended
 * @returns {Boolean} do we need to call endOfStream on the MediaSource
 */
var detectEndOfStream = function detectEndOfStream(playlist, mediaSource, segmentIndex) {
  if (!playlist || !mediaSource) {
    return false;
  }

  var segments = playlist.segments;

  // determine a few boolean values to help make the branch below easier
  // to read
  var appendedLastSegment = segmentIndex === segments.length;

  // if we've buffered to the end of the video, we need to call endOfStream
  // so that MediaSources can trigger the `ended` event when it runs out of
  // buffered data instead of waiting for me
  return playlist.endList && mediaSource.readyState === 'open' && appendedLastSegment;
};

var finite = function finite(num) {
  return typeof num === 'number' && isFinite(num);
};

var illegalMediaSwitch = function illegalMediaSwitch(loaderType, startingMedia, newSegmentMedia) {
  // Although these checks should most likely cover non 'main' types, for now it narrows
  // the scope of our checks.
  if (loaderType !== 'main' || !startingMedia || !newSegmentMedia) {
    return null;
  }

  if (!newSegmentMedia.containsAudio && !newSegmentMedia.containsVideo) {
    return 'Neither audio nor video found in segment.';
  }

  if (startingMedia.containsVideo && !newSegmentMedia.containsVideo) {
    return 'Only audio found in segment when we expected video.' + ' We can\'t switch to audio only from a stream that had video.' + ' To get rid of this message, please add codec information to the manifest.';
  }

  if (!startingMedia.containsVideo && newSegmentMedia.containsVideo) {
    return 'Video found in segment when we expected only audio.' + ' We can\'t switch to a stream with video from an audio only stream.' + ' To get rid of this message, please add codec information to the manifest.';
  }

  return null;
};

exports.illegalMediaSwitch = illegalMediaSwitch;
/**
 * Calculates a time value that is safe to remove from the back buffer without interupting
 * playback.
 *
 * @param {TimeRange} seekable
 *        The current seekable range
 * @param {Number} currentTime
 *        The current time of the player
 * @param {Number} targetDuration
 *        The target duration of the current playlist
 * @return {Number}
 *         Time that is safe to remove from the back buffer without interupting playback
 */
var safeBackBufferTrimTime = function safeBackBufferTrimTime(seekable, currentTime, targetDuration) {
  var removeToTime = undefined;

  if (seekable.length && seekable.start(0) > 0 && seekable.start(0) < currentTime) {
    // If we have a seekable range use that as the limit for what can be removed safely
    removeToTime = seekable.start(0);
  } else {
    // otherwise remove anything older than 30 seconds before the current play head
    removeToTime = currentTime - 30;
  }

  // Don't allow removing from the buffer within target duration of current time
  // to avoid the possibility of removing the GOP currently being played which could
  // cause playback stalls.
  return Math.min(removeToTime, currentTime - targetDuration);
};

exports.safeBackBufferTrimTime = safeBackBufferTrimTime;
/**
 * An object that manages segment loading and appending.
 *
 * @class SegmentLoader
 * @param {Object} options required and optional options
 * @extends videojs.EventTarget
 */

var SegmentLoader = (function (_videojs$EventTarget) {
  _inherits(SegmentLoader, _videojs$EventTarget);

  function SegmentLoader(settings) {
    var _this = this;

    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, SegmentLoader);

    _get(Object.getPrototypeOf(SegmentLoader.prototype), 'constructor', this).call(this);
    // check pre-conditions
    if (!settings) {
      throw new TypeError('Initialization settings are required');
    }
    if (typeof settings.currentTime !== 'function') {
      throw new TypeError('No currentTime getter specified');
    }
    if (!settings.mediaSource) {
      throw new TypeError('No MediaSource specified');
    }
    // public properties
    this.state = 'INIT';
    this.bandwidth = settings.bandwidth;
    this.throughput = { rate: 0, count: 0 };
    this.roundTrip = NaN;
    this.resetStats_();
    this.mediaIndex = null;

    // private settings
    this.hasPlayed_ = settings.hasPlayed;
    this.currentTime_ = settings.currentTime;
    this.seekable_ = settings.seekable;
    this.seeking_ = settings.seeking;
    this.duration_ = settings.duration;
    this.mediaSource_ = settings.mediaSource;
    this.hls_ = settings.hls;
    this.loaderType_ = settings.loaderType;
    this.startingMedia_ = void 0;
    this.segmentMetadataTrack_ = settings.segmentMetadataTrack;
    this.goalBufferLength_ = settings.goalBufferLength;

    // private instance variables
    this.checkBufferTimeout_ = null;
    this.error_ = void 0;
    this.currentTimeline_ = -1;
    this.pendingSegment_ = null;
    this.mimeType_ = null;
    this.sourceUpdater_ = null;
    this.xhrOptions_ = null;

    // Fragmented mp4 playback
    this.activeInitSegmentId_ = null;
    this.initSegments_ = {};

    this.decrypter_ = settings.decrypter;

    // Manages the tracking and generation of sync-points, mappings
    // between a time in the display time and a segment index within
    // a playlist
    this.syncController_ = settings.syncController;
    this.syncPoint_ = {
      segmentIndex: 0,
      time: 0
    };

    this.syncController_.on('syncinfoupdate', function () {
      return _this.trigger('syncinfoupdate');
    });

    this.mediaSource_.addEventListener('sourceopen', function () {
      return _this.ended_ = false;
    });

    // ...for determining the fetch location
    this.fetchAtBuffer_ = false;

    if (options.debug) {
      this.logger_ = _videoJs2['default'].log.bind(_videoJs2['default'], 'segment-loader', this.loaderType_, '->');
    }
  }

  /**
   * reset all of our media stats
   *
   * @private
   */

  _createClass(SegmentLoader, [{
    key: 'resetStats_',
    value: function resetStats_() {
      this.mediaBytesTransferred = 0;
      this.mediaRequests = 0;
      this.mediaRequestsAborted = 0;
      this.mediaRequestsTimedout = 0;
      this.mediaRequestsErrored = 0;
      this.mediaTransferDuration = 0;
      this.mediaSecondsLoaded = 0;
    }

    /**
     * dispose of the SegmentLoader and reset to the default state
     */
  }, {
    key: 'dispose',
    value: function dispose() {
      this.state = 'DISPOSED';
      this.pause();
      this.abort_();
      if (this.sourceUpdater_) {
        this.sourceUpdater_.dispose();
      }
      this.resetStats_();
    }

    /**
     * abort anything that is currently doing on with the SegmentLoader
     * and reset to a default state
     */
  }, {
    key: 'abort',
    value: function abort() {
      if (this.state !== 'WAITING') {
        if (this.pendingSegment_) {
          this.pendingSegment_ = null;
        }
        return;
      }

      this.abort_();

      // We aborted the requests we were waiting on, so reset the loader's state to READY
      // since we are no longer "waiting" on any requests. XHR callback is not always run
      // when the request is aborted. This will prevent the loader from being stuck in the
      // WAITING state indefinitely.
      this.state = 'READY';

      // don't wait for buffer check timeouts to begin fetching the
      // next segment
      if (!this.paused()) {
        this.monitorBuffer_();
      }
    }

    /**
     * abort all pending xhr requests and null any pending segements
     *
     * @private
     */
  }, {
    key: 'abort_',
    value: function abort_() {
      if (this.pendingSegment_) {
        this.pendingSegment_.abortRequests();
      }

      // clear out the segment being processed
      this.pendingSegment_ = null;
    }

    /**
     * set an error on the segment loader and null out any pending segements
     *
     * @param {Error} error the error to set on the SegmentLoader
     * @return {Error} the error that was set or that is currently set
     */
  }, {
    key: 'error',
    value: function error(_error) {
      if (typeof _error !== 'undefined') {
        this.error_ = _error;
      }

      this.pendingSegment_ = null;
      return this.error_;
    }
  }, {
    key: 'endOfStream',
    value: function endOfStream() {
      this.ended_ = true;
      this.pause();
      this.trigger('ended');
    }

    /**
     * Indicates which time ranges are buffered
     *
     * @return {TimeRange}
     *         TimeRange object representing the current buffered ranges
     */
  }, {
    key: 'buffered_',
    value: function buffered_() {
      if (!this.sourceUpdater_) {
        return _videoJs2['default'].createTimeRanges();
      }

      return this.sourceUpdater_.buffered();
    }

    /**
     * Gets and sets init segment for the provided map
     *
     * @param {Object} map
     *        The map object representing the init segment to get or set
     * @param {Boolean=} set
     *        If true, the init segment for the provided map should be saved
     * @return {Object}
     *         map object for desired init segment
     */
  }, {
    key: 'initSegment',
    value: function initSegment(map) {
      var set = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (!map) {
        return null;
      }

      var id = (0, _binUtils.initSegmentId)(map);
      var storedMap = this.initSegments_[id];

      if (set && !storedMap && map.bytes) {
        this.initSegments_[id] = storedMap = {
          resolvedUri: map.resolvedUri,
          byterange: map.byterange,
          bytes: map.bytes
        };
      }

      return storedMap || map;
    }

    /**
     * Returns true if all configuration required for loading is present, otherwise false.
     *
     * @return {Boolean} True if the all configuration is ready for loading
     * @private
     */
  }, {
    key: 'couldBeginLoading_',
    value: function couldBeginLoading_() {
      return this.playlist_ && (
      // the source updater is created when init_ is called, so either having a
      // source updater or being in the INIT state with a mimeType is enough
      // to say we have all the needed configuration to start loading.
      this.sourceUpdater_ || this.mimeType_ && this.state === 'INIT') && !this.paused();
    }

    /**
     * load a playlist and start to fill the buffer
     */
  }, {
    key: 'load',
    value: function load() {
      // un-pause
      this.monitorBuffer_();

      // if we don't have a playlist yet, keep waiting for one to be
      // specified
      if (!this.playlist_) {
        return;
      }

      // not sure if this is the best place for this
      this.syncController_.setDateTimeMapping(this.playlist_);

      // if all the configuration is ready, initialize and begin loading
      if (this.state === 'INIT' && this.couldBeginLoading_()) {
        return this.init_();
      }

      // if we're in the middle of processing a segment already, don't
      // kick off an additional segment request
      if (!this.couldBeginLoading_() || this.state !== 'READY' && this.state !== 'INIT') {
        return;
      }

      this.state = 'READY';
    }

    /**
     * Once all the starting parameters have been specified, begin
     * operation. This method should only be invoked from the INIT
     * state.
     *
     * @private
     */
  }, {
    key: 'init_',
    value: function init_() {
      this.state = 'READY';
      this.sourceUpdater_ = new _sourceUpdater2['default'](this.mediaSource_, this.mimeType_);
      this.resetEverything();
      return this.monitorBuffer_();
    }

    /**
     * set a playlist on the segment loader
     *
     * @param {PlaylistLoader} media the playlist to set on the segment loader
     */
  }, {
    key: 'playlist',
    value: function playlist(newPlaylist) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!newPlaylist) {
        return;
      }

      var oldPlaylist = this.playlist_;
      var segmentInfo = this.pendingSegment_;

      this.playlist_ = newPlaylist;
      this.xhrOptions_ = options;

      // when we haven't started playing yet, the start of a live playlist
      // is always our zero-time so force a sync update each time the playlist
      // is refreshed from the server
      if (!this.hasPlayed_()) {
        newPlaylist.syncInfo = {
          mediaSequence: newPlaylist.mediaSequence,
          time: 0
        };
      }

      // in VOD, this is always a rendition switch (or we updated our syncInfo above)
      // in LIVE, we always want to update with new playlists (including refreshes)
      this.trigger('syncinfoupdate');

      // if we were unpaused but waiting for a playlist, start
      // buffering now
      if (this.state === 'INIT' && this.couldBeginLoading_()) {
        return this.init_();
      }

      if (!oldPlaylist || oldPlaylist.uri !== newPlaylist.uri) {
        if (this.mediaIndex !== null) {
          // we must "resync" the segment loader when we switch renditions and
          // the segment loader is already synced to the previous rendition
          this.resyncLoader();
        }

        // the rest of this function depends on `oldPlaylist` being defined
        return;
      }

      // we reloaded the same playlist so we are in a live scenario
      // and we will likely need to adjust the mediaIndex
      var mediaSequenceDiff = newPlaylist.mediaSequence - oldPlaylist.mediaSequence;

      this.logger_('mediaSequenceDiff', mediaSequenceDiff);

      // update the mediaIndex on the SegmentLoader
      // this is important because we can abort a request and this value must be
      // equal to the last appended mediaIndex
      if (this.mediaIndex !== null) {
        this.mediaIndex -= mediaSequenceDiff;
      }

      // update the mediaIndex on the SegmentInfo object
      // this is important because we will update this.mediaIndex with this value
      // in `handleUpdateEnd_` after the segment has been successfully appended
      if (segmentInfo) {
        segmentInfo.mediaIndex -= mediaSequenceDiff;

        // we need to update the referenced segment so that timing information is
        // saved for the new playlist's segment, however, if the segment fell off the
        // playlist, we can leave the old reference and just lose the timing info
        if (segmentInfo.mediaIndex >= 0) {
          segmentInfo.segment = newPlaylist.segments[segmentInfo.mediaIndex];
        }
      }

      this.syncController_.saveExpiredSegmentInfo(oldPlaylist, newPlaylist);
    }

    /**
     * Prevent the loader from fetching additional segments. If there
     * is a segment request outstanding, it will finish processing
     * before the loader halts. A segment loader can be unpaused by
     * calling load().
     */
  }, {
    key: 'pause',
    value: function pause() {
      if (this.checkBufferTimeout_) {
        _globalWindow2['default'].clearTimeout(this.checkBufferTimeout_);

        this.checkBufferTimeout_ = null;
      }
    }

    /**
     * Returns whether the segment loader is fetching additional
     * segments when given the opportunity. This property can be
     * modified through calls to pause() and load().
     */
  }, {
    key: 'paused',
    value: function paused() {
      return this.checkBufferTimeout_ === null;
    }

    /**
     * create/set the following mimetype on the SourceBuffer through a
     * SourceUpdater
     *
     * @param {String} mimeType the mime type string to use
     */
  }, {
    key: 'mimeType',
    value: function mimeType(_mimeType) {
      if (this.mimeType_) {
        return;
      }

      this.mimeType_ = _mimeType;
      // if we were unpaused but waiting for a sourceUpdater, start
      // buffering now
      if (this.state === 'INIT' && this.couldBeginLoading_()) {
        this.init_();
      }
    }

    /**
     * Delete all the buffered data and reset the SegmentLoader
     */
  }, {
    key: 'resetEverything',
    value: function resetEverything() {
      this.ended_ = false;
      this.resetLoader();
      this.remove(0, this.duration_());
      this.trigger('reseteverything');
    }

    /**
     * Force the SegmentLoader to resync and start loading around the currentTime instead
     * of starting at the end of the buffer
     *
     * Useful for fast quality changes
   