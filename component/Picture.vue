<template>
  <img
    :style="{
      opacity: opacity
    }"
    class="picture"
    v-bind="$attrs"
    v-on="$listeners"
    @click="handleClick"
    ref="img"
  />
</template>

<script>
/**
 * 用法
 * <Picture :sources="[{src: 'xxx.pc.jpg', media: '(min-width: 750px)', attrs: {}}, {src: 'xxx.mobile.jpg', media: '(max-width: 754px)'}]" />
 */
export default {
  inheritAttrs: false,
  name: 'Picture',
  props: {
    sources: {
      type: Array
    },
    defaultSource: {
      type: Object
    }
  },
  data () {
    return {
      opacity: '0'
    }
  },
  created () {
    this.activeMediaList = []
    this.mediaLists = []
    this.unmediaListsListener = []
  },
  beforeDestroy () {
    this.unmediaListener()
  },
  mounted () {
    this.createMatchLists() // 创建媒体查询监听
  },
  watch: {
    sources () {
      this.unmediaListener()
      this.createMatchLists()
    },
    defaultSrc () {
      this.initImg(this.mediaLists || [])
    }
  },
  methods: {
    handleClick (e) {
      this.$emit('click', [...this.activeMediaList])
    },
    addMediaListener (mediaList, fn) { // 添加媒体查询监听器
      mediaList.addListener(fn)
      return () => {
        mediaList.removeListener(fn)
      }
    },
    createMatchLists () { // 创建媒体查询监听
      if (!this.sources) return
      try {
        this.mediaLists = this.sources
          .filter(source => source.src && source.media)
          .map(source => {
            const mediaList = window.matchMedia(source.media)
            this.unmediaListsListener.push(
              this.addMediaListener(mediaList, () => {
                this.updateDom(this.mediaLists)
              })
            )
            return mediaList
          })
        this.updateDom(this.mediaLists)
      } catch (e) {
        throw new Error('media string is not valide')
      }
    },
    updateDom (mediaLists) { // 更新
      let hasMatch = false
      this.activeMediaList = []
      mediaLists.forEach((mediaList, index) => {
        if (mediaList.matches) {
          hasMatch = true
          this.updateImgWithMediaList(mediaList)
          this.activeMediaList.push(mediaList)
        }
      })
      if (hasMatch === false) {
        this.updateImg(this.defaultSource)
      }
      if (this.opacity === '0') {
        this.opacity = '1'
      }
    },
    updateImgWithMediaList (mediaList) { // 更新图片
      if (mediaList.matches) {
        const source = this.findSource(mediaList.media)
        this.updateImg(source)
      }
    },
    updateImg (source) {
      if (!source) return
      this.$refs.img.setAttribute('src', source.src)
      if (source.attrs) { // 更新属性
        Object.keys(source.attrs).forEach(attr => {
          if (source.attrs[attr] !== undefined) {
            this.$refs.img.setAttribute(attr, source.attrs[attr])
          }
        })
      }
    },
    findSource (media) { // 根据media查询找到对应的数据源
      return this.sources.find(item => item.media === media)
    },
    unmediaListener () { // 移除媒体查询监听器
      this.unmediaListsListener.forEach(unListener => {
        unListener()
      })
    }
  }
}
</script>

<style lang="less">
.picture {
  transition: opacity .5s;
}
</style>
