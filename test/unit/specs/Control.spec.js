import { mount } from '@vue/test-utils'
import { leftClick } from './shared'
import Treeselect from '@src/components/Treeselect'

describe('Control', () => {
  it('should toggle the menu when the arrow is clicked', () => {
    const wrapper = mount(Treeselect, {
      sync: false,
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const arrow = wrapper.find('.vue-treeselect__control-arrow-container')

    leftClick(arrow)
    expect(wrapper.vm.menu.isOpen).toBe(true)
    leftClick(arrow)
    expect(wrapper.vm.menu.isOpen).toBe(false)
  })

  it('should render custom slot if provided', () => {
    const openLabel = 'O'
    const closeLabel = 'C'
    const template = `
    <treeselect ref="treeselect" :options="options" v-model="value">
      <template slot="arrow-icon" slot-scope="{ isOpen }">
        {{ isOpen ? "${openLabel}" : "${closeLabel}" }}
      </template>
    </treeselect>
    `

    const wrapper = mount({
      template,
      components: { Treeselect },
      data() {
        return {
          options: [],
          value: '',
        }
      },
    })

    const treeselect = wrapper.vm.$refs.treeselect
    expect(treeselect.menu.isOpen).toBe(false)
    const arrowLabel = wrapper.find('.vue-treeselect__control-arrow-container')
    expect(arrowLabel.text()).toBe(closeLabel)
    leftClick(arrowLabel)
    expect(treeselect.menu.isOpen).toBe(true)
    expect(arrowLabel.text()).toBe(openLabel)
  })
})
