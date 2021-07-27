<style lang="less">
body {
  margin: 0;
}
.pull-down-fresh-container {
  height: 100vh;
  background-color: red;
  position: relative;
  .pull-down-tip-container {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    width: 100%;
    padding-bottom: 20px;
  }
}
</style>
<template>
  <div class="editor">
    <div
      :style="{
        transform: `translateY(${transformY}px)`
      }"
      ref="pullDownFreshContainer"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
      class="pull-down-fresh-container"
    >
      <div class="pull-down-tip-container">{{text}}</div>
    </div>
    <div style="height: 500px; background-color: #000"></div>
  </div>
</template>
<script>
const PULL_INIT = -1
const PULLING = 0
const LOSING = 1
const LOGING = 2
// const PULL_DOWN = 1
export default {
  data () {
    return {
      pullState: PULL_INIT,
      text: '下拉即可刷新...',
      transformY: 0,
      lastTransformY: 0,
      reachBottomDistance: 30,
      pullingText: '下拉即可刷新...',
      losingText: '释放即可刷新...',
      loadingText: '加载中'
    }
  },
  created () {
    this.scrollTop = 0
    this.pullDistance = 80
    window.addEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleTouchStart (e) {
      this.touchStartY = e.changedTouches[0].clientY
      this.lastY = e.changedTouches[0].clientY
      if (this.canTriggerTouchMove || this.pullState !== PULL_INIT) return
      if (this.scrollTop === 0) {
        this.canTriggerTouchMove = true
        this.$refs.pullDownFreshContainer.style.transition = 'none'
        this.text = this.pullingText
      }
    },
    handleTouchMove (e) {
      if (!this.canTriggerTouchMove) return
      const offsetY = e.changedTouches[0].clientY - this.lastY
      this.lastY = e.changedTouches[0].clientY
      if (this.scrollTop === 0 && offsetY > 0) {
        if (this.pullState === PULL_INIT) {
          this.pullState = PULLING
          this.text = this.pullingText
        }
      }
      if (this.pullState === PULL_INIT) return
      const distance = Math.round(this.ease(e.changedTouches[0].clientY - this.touchStartY))
      if (distance < 0) return
      // 设置状态
      if (distance > this.pullDistance) {
        // 可释放
        if (this.pullState !== LOSING) {
          this.pullState = LOSING
          this.text = this.losingText
        }
      } else {
        // 下拉中
        if (this.pullState !== PULLING) {
          this.pullState = PULLING
          this.text = this.pullingText
        }
      }
      this.transformY = distance
    },
    ease (distance) {
      if (distance < this.pullDistance) {
        return distance
      } else if (distance <= this.pullDistance * 2) {
        return this.pullDistance + 0.5 * (distance - this.pullDistance)
      } else {
        return this.pullDistance * 1.5 + (distance - this.pullDistance * 2) * 0.2
      }
    },
    handleTouchEnd () {
      if (this.transformY > this.pullDistance) {
        this.$emit('refresh')
        console.log('refresh')
      }
      this.$refs.pullDownFreshContainer.style.transition = 'all 0.3s'
      if (this.pullState === LOSING) {
        this.pullState = LOGING
        this.text = this.loadingText
        this.transformY = this.pullDistance
        setTimeout(() => {
          this.stopPullDownRefresh()
        }, 500)
      } else {
        this.stopPullDownRefresh()
      }
    },
    handleScroll () {
      this.scrollTop = window.pageYOffset
    },
    stopPullDownRefresh () {
      if (this.pullState !== PULL_INIT) {
        this.pullState = PULL_INIT
        this.transformY = 0
        this.canTriggerTouchMove = false
      }
    }
  }
}
</script>