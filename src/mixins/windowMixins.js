const deviceTypes = {
  mobile: 0,
  tablet: 1,
  smallMonitor: 2,
  largeMonitor: 3,
  extraLargeMonitor: 4
}

const deviceNames = [
  'Mobile',
  'Tablet',
  'Small Monitor',
  'Large Monitor',
  'Extra Large Monitor'
]

function getDeviceInfo() {
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth

  let type

  // Keep this logic aligned with the mixin deviceType computed property
  if (width <= 768) {
    // Mobile
    type = deviceTypes.mobile
  } else if (width <= 991) {
    // Tablet
    type = deviceTypes.tablet
  } else if (width <= 1200) {
    // Small Monitor
    type = deviceTypes.smallMonitor
  } else if (width <= 1500) {
    // Large Monitor
    type = deviceTypes.largeMonitor
  } else {
    // Extra-Large Monitor
    type = deviceTypes.extraLargeMonitor
  }

  return { type: type, name: deviceNames[type] }
}

var sizeHandlerMixin = {
  data() {
    return {
      windowSize: {
        width: 0,
        height: 0
      },
      deviceTypes: deviceTypes,
      deviceNames: deviceNames
    }
  },
  computed: {
    deviceType() {
      // Based on Semantic UI https://semantic-ui.com/elements/container.html#/introduction
      if (this.windowSize.width <= 768) {
        // Mobile
        return deviceTypes.mobile
      } else if (this.windowSize.width <= 991) {
        // Tablet
        return deviceTypes.tablet
      } else if (this.windowSize.width <= 1200) {
        // Small Monitor
        return deviceTypes.smallMonitor
      } else if (this.windowSize.width <= 1500) {
        // Large Monitor
        return deviceTypes.largeMonitor
      } else {
        // Extra-Large Monitor
        return deviceTypes.extraLargeMonitor
      }
    },
    deviceName() {
      return this.deviceNames[this.deviceType]
    },
    isMobile() {
      return this.deviceName == 'Mobile'
    },
    isTablet() {
      return this.deviceName == 'Tablet'
    },
    isSmallMonitor() {
      return this.deviceName == 'Small Monitor'
    },
    isLargeMonitor() {
      return this.deviceName == 'Large Monitor'
    },
    isExtraLargeMonitor() {
      return this.deviceName == 'Extra Large Monitor'
    },
    isSmallDevice() {
      return this.isMobile || this.isTablet || this.isSmallMonitor
    }
  },
  created() {
    console.time(this.$options.name + '.sizeHandlerMixin', 'created')
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
    console.timeEnd(this.$options.name + '.sizeHandlerMixin', 'created')
  },
  destroyed() {
    console.time(this.$options.name + '.sizeHandlerMixin', 'destroyed')
    window.removeEventListener('resize', this.handleResize)
    console.timeEnd(this.$options.name + '.sizeHandlerMixin', 'destroyed')
  },
  methods: {
    /**
     * Recalculate windowSize (width and height).
     */
    handleResize() {
      this.windowSize.width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
      this.windowSize.height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
    },
    /**
     * Set the focus on an element after a given delay.
     * Note: if the element is disabled the focus is not set.
     * @param {string} elementName element to focus
     * @param {number} [ms=200] delay in milliseconds
     * @example:
     * setFocus('btnInvest', 100)
     */
    setFocus(elementName, ms = 200) {
      const jQueryMode = false
      if (jQueryMode) {
        const toFocus = $(`#${elementName}`)
        if (toFocus.length > 0) {
          setTimeout(() => {
            if (!toFocus.hasClass('disabled')) {
              toFocus.focus()
            }
          }, ms)
        }
      } else {
        const toFocus = document.getElementById(elementName)
        if (toFocus) {
          setTimeout(() => {
            if (!toFocus.classList.contains('disabled')) {
              toFocus.focus({
                preventScroll: true
              })
            }
          }, ms)
        }
      }
    },
    getDeviceName() {
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth

      // Based on Semantic UI https://semantic-ui.com/elements/container.html#/introduction
      if (width <= 768) {
        // Mobile
        return 'mobile'
      } else if (width <= 991) {
        // Tablet
        return 'tablet'
      } else if (width <= 1200) {
        // Small Monitor
        return 'smallMonitor'
      } else if (width <= 1500) {
        // Large Monitor
        return 'largeMonitor'
      } else {
        // Extra-Large Monitor
        return 'extraLargeMonitor'
      }
    }
  }
}

export { sizeHandlerMixin, getDeviceInfo }
