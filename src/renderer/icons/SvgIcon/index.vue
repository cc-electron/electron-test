<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" :style="{...styles}"></use>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String
    },
    styles: {
      type: Object
    },
    prefix: {
      type: String,
      default: "icon-",
    }
  },
  computed: {
    iconName() {
        if (this.prefix) {
          return `#${this.prefix}${this.iconClass}`
        } else {
          return `#${this.iconClass}`
        }
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
