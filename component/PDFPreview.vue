<template>
  <div class="pdf-preview" ref="pdfContainer"></div>
</template>

<script>
export default {
  model: {
    prop: 'visible',
    event: 'input'
  },
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  mounted () {
    this.initPdf()
  },
  watch: {
    url () {
      this.$nextTick(() => {
        this.initPdf()
      })
    }
  },
  methods: {
    initPdf () {
      if (this.url) {
        import('pdfobject')
          .then(mod => {
            const PDFObject = mod.default
            PDFObject.embed(this.url, this.$refs.pdfContainer)
          })
      }
    }
  }
}
</script>
<style lang="less">
.pdf-preview {
}
</style>
