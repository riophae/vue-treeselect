<template>
  <div class="example">
    <div class="example-demo">
      <label class="example-label">Demo</label>
      <div class="example-inner">
        <slot name="demo" />
      </div>
    </div>
    <div class="example-code">
      <label class="example-label">
        Code
        <span class="example-code-lang-switch">
          <a class="example-code-lang" :class="{ current: current === 'html' }" @click="toggle">HTML</a>
          |
          <a class="example-code-lang" :class="{ current: current === 'javascript' }" @click="toggle">JavaScript</a>
        </span>
      </label>
      <div class="example-inner">
        <pre class="language-html" :class="{ current: current === 'html' }"><slot name="html" /></pre>
        <pre class="language-javascript" :class="{ current: current === 'javascript' }"><slot name="javascript" /></pre>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      current: 'html',
    }),

    methods: {
      toggle() {
        this.current = this.current === 'html'
          ? 'javascript'
          : 'html'
      },
    },
  }
</script>
