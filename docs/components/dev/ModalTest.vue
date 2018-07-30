<template>
  <div id="modal-test">
    <button type="button" @click="showModal = true">Click Me</button>
    <vodal :show="showModal" :custom-styles="modalStyle" :close-button="false" @hide="showModal = false">
      <treeselect :multiple="true" :flat="true" :options="options" :default-expand-level="1" :append-to-body="true" />
    </vodal>
  </div>
</template>

<script>
  import Vodal from 'vodal'
  import 'vodal/common.css'
  import { generateOptions } from '../utils'

  export default {
    components: { Vodal },

    data: () => ({
      showModal: false,
      options: generateOptions(3),
    }),

    computed: {
      modalStyle() {
        return {
          height: 'auto',
          top: '50%',
          bottom: 'auto',
          transform: 'translateY(-50%)',
          overflow: 'hidden',
        }
      },
    },
  }
</script>
