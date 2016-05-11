var styleParser = AFRAME.utils.styleParser;

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('event-set', {
  schema: {
    default: [],
    parse: function (value) {
      return value.split(',').map(styleParser.parse);
    }
  },

  init: function () {
    this.eventListeners = [];
  },

  update: function (oldData) {
    this.eventListeners = [];
    this.removeEventListeners();
    this.updateEventListeners();
    this.addEventListeners();
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    this.removeEventListeners();
  },

  /**
   * Called when entity pauses.
   * Use to stop or remove any dynamic or background behavior such as events.
   */
  pause: function () {
    this.removeEventListeners();
  },

  /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
  play: function () {
    this.addEventListeners();
  },

  /**
   * Update source-of-truth event listener registry.
   * Does not actually attach event listeners yet.
   */
  updateEventListeners: function () {
    var el = this.el;
    var eventListeners = this.eventListeners;

    this.data.forEach(addEventListener);

    function addEventListener (obj) {
      // Set event listener using `_event`.
      var event = obj._event;
      var target = obj._target;
      eventListeners.push([event, handler]);

      // Rest of the properties will describe what properties to set.
      delete obj._event;
      delete obj._target;

      function handler () {
        // Decide the target to `setAttribute` on.
        var targetEl = target ? el.sceneEl.querySelector(target) : el;

        // Get properties to set.
        var setAttributeArgSets = [];
        Object.keys(obj).forEach(function buildSetAttributeArgs (attr) {
          if (attr.indexOf('.') === -1) {
            // Normal attribute or single-property component.
            setAttributeArgSets.push([attr, obj[attr]]);
          } else {
            // Multi-property component with dot syntax.
            var attrSplit = attr.split('.');
            setAttributeArgSets.push([attrSplit[0], attrSplit[1], obj[attr]]);
          }
        });

        // Set attributes.
        setAttributeArgSets.forEach(function doSetAttributes (setAttributeArgs) {
          targetEl.setAttribute.apply(targetEl, setAttributeArgs);
        });
      }
    }
  },

  /**
   * Attach event listeners.
   */
  addEventListeners: function () {
    var el = this.el;
    this.eventListeners.forEach(function addEventListener (eventListenerArr) {
      el.addEventListener(eventListenerArr[0], eventListenerArr[1]);
    });
  },

  removeEventListeners: function () {
    var el = this.el;
    this.eventListeners.forEach(function removeEventListener (eventListenerArr) {
      el.removeEventListener(eventListenerArr[0], eventListenerArr[1]);
    });
  }
});
