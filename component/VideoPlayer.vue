<template>
  <div class="video-container">
    <!-- <div data-vjs-player> -->
      <video v-bind="$attrs" ref="videoPlayer" :id="videoId" class="video-js vjs-default-skin"></video>
    <!-- </div> -->
  </div>
</template>

<script>
let videoId = 0
import 'video.js/dist/video-js.min.css'
export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    },
    autoplay: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      player: null,
      videoId: 'videoPlayer' + ++videoId
    }
  },
  mounted () {
    this.lastPlayState = false
    this.initPlayer()
    document.addEventListener('visibilitychange', this.visibilitychange) // 页面可见性
  },
  beforeDestroy () {
    this.dispose()
    document.removeEventListener('visibilitychange', this.visibilitychange) // 页面可见性
  },
  methods: {
    visibilitychange () { // 页面可见性变化
      if (document.visibilityState === 'visible') {
        if (this.lastPlayState) {
          this.play()
        }
      } else {
        this.lastPlayState = !this.player.paused()
        this.pause()
      }
    },
    initPlayer () {
      import('video.js')
        .then(mod => {
          const videojs = mod.default
          this.player = videojs(
            this.$refs.videoPlayer,
            this.options,
            () => {
              console.log('onPlayerReady')
            }
          )
          if (this.autoplay) {
            this.play()
              .then(e => {
                if (!(e instanceof Error)) {
                  this.lastPlayState = true
                }
              })
          }
        })
    },
    dispose () {
      if (this.player) {
        this.pause()
        this.player.dispose()
        this.player = null
      }
    },
    getPlayer () {
      return this.player
    },
    getVideoEl () {
      return this.$refs.videoPlayer
    },
    play () {
      if (this.player) {
        if (this.player.paused()) {
          return this.player.play()
            .catch(e => {
              console.log(e)
              return e
            })
        }
      }
    },
    pause () {
      if (this.player) {
        if (!this.player.paused()) {
          this.player.pause()
        }
      }
    }
  }
}
</script>
<style lang="less">
.video-container {
  position: relative;
  background-color: #000;
  .video-js .vjs-big-play-button {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    width: 1.5em;
    height: 1.5em;
    line-height: 1.3em;
  }
}
</style>
