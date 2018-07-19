// import { mount } from '@vue/test-utils'
// import Treeselect from '@src/components/Treeselect'
// import { findLabelByNodeId } from './shared'

// Currently @vue/test-utils doesn't properly handle scoped slots.

// describe('Slots', () => {
//   it('option-label', async () => {
//     const getLabelText = nodeId => findLabelByNodeId(wrapper, nodeId).element.textContent.trim()
//     const wrapper = mount(Treeselect, {
//       propsData: {
//         options: [ {
//           id: 'a',
//           label: 'a',
//           children: [ {
//             id: 'aa',
//             label: 'aa',
//           } ],
//         }, {
//           id: 'b',
//           label: 'b',
//         } ],
//         defaultExpandLevel: Infinity,
//       },
//       scopedSlots: {
//         'option-label': `
//           <label slot-scope="{ node, shouldShowCount, count, labelClassName, countClassName }" :class="labelClassName">
//             {{ node.isBranch ? 'Branch' : 'Leaf' }}: {{ node.label }}
//             <span v-if="shouldShowCount" :class="countClassName">({{ count }})</span>
//           </label>
//         `,
//       },
//     })
//     const { vm } = wrapper
//
//     vm.openMenu()
//     await vm.$nextTick()
//
//     expect(getLabelText('a')).toBe('Branch: a')
//     expect(getLabelText('aa')).toBe('Leaf: aa')
//     expect(getLabelText('b')).toBe('Branch: b')
//   })
// })
