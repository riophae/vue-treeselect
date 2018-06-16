<template>
  <div>
    <div style="overflow:hidden;height:105px;border: 1px dashed rgb(110, 128, 150);">
      <treeselect v-if="show"
        name="demo"
        :append-to-body="appendToBody"
        :options="options"
        :limit="3"
        :max-height="200"
        />
    </div>
    <p>
      <label><input type="checkbox" v-model="appendToBody">Append To Body</label>
    </p>
  </div>
</template>

<script>
  import { generateOptions } from './utils'

  export default {
    data: () => ({
      show: true,
      appendToBody: false,
      options: generateOptions(2, 3),
    }),
    watch: {
      appendToBody() {
        this.show = false
        this.$nextTick(function nextTick() {
          this.show = true
        })
      },
    },
  }
</script>
