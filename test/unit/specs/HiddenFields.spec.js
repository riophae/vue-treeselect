import { mount } from '@vue/test-utils'
import Treeselect from '@src/components/Treeselect'

describe('Hidden Fields', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Treeselect, {
      propsData: {
        options: [],
      },
    })
  })

  const getHiddenFields = () => wrapper.findAll('input[type="hidden"]')

  it('must have value & name', () => {
    wrapper.setProps({ value: 'value' })
    expect(getHiddenFields().length).toBe(0)

    wrapper.setProps({ value: null, name: 'test' })
    expect(getHiddenFields().length).toBe(0)

    wrapper.setProps({ value: 'value', name: 'test' })
    expect(getHiddenFields().length).not.toBe(0)
  })

  it('single-select mode', () => {
    wrapper.setProps({ name: 'single', value: 'value' })
    const hiddenFields = getHiddenFields()
    expect(hiddenFields.length).toBe(1)
    expect(hiddenFields.at(0).html()).toBe('<input type="hidden" name="single" value="value">')
  })

  it('multi-select mode', () => {
    wrapper.setProps({ name: 'multiple', multiple: true, value: [ 1, 2, 3 ] })
    const hiddenFields = getHiddenFields()
    expect(hiddenFields.length).toBe(3)
    expect(hiddenFields.wrappers.map(hf => hf.html())).toEqual([
      '<input type="hidden" name="multiple" value="1">',
      '<input type="hidden" name="multiple" value="2">',
      '<input type="hidden" name="multiple" value="3">',
    ])
  })

  it('join values', () => {
    wrapper.setProps({ name: 'join-values', multiple: true, value: [ 'a', 'b', 'c' ], joinValues: true })
    const hiddenFields = getHiddenFields()
    expect(hiddenFields.length).toBe(1)
    expect(hiddenFields.at(0).html()).toBe('<input type="hidden" name="join-values" value="a,b,c">')
  })

  it('delimiter', async () => {
    wrapper.setProps({ name: 'delimiter', multiple: true, value: [ 1, 2, 3 ], joinValues: true, delimiter: ';' })
    await wrapper.vm.$nextTick()
    const hiddenFields = getHiddenFields()
    expect(hiddenFields.length).toBe(1)
    expect(hiddenFields.at(0).html()).toBe('<input type="hidden" name="delimiter" value="1;2;3">')
  })

  it('disabled', async () => {
    wrapper.setProps({ name: 'disabled', value: 'value', disabled: true })
    await wrapper.vm.$nextTick()
    const hiddenFields = getHiddenFields()
    expect(hiddenFields.length).toBe(0)
  })
})
