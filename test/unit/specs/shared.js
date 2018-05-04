import sleep from 'yaku/lib/sleep'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'
import { INPUT_DEBOUNCE_DELAY } from '@riophae/vue-treeselect/constants'

const MOUSE_BUTTON_LEFT = { button: 0 }
const KEY_BACKSPACE = { which: 8, keyCode: 8 }
const KEY_DELETE = { which: 46, keyCode: 46 }
const KEY_ESCAPE = { which: 27, keyCode: 27 }
const KEY_A = { which: 65, keyCode: 65 }

export function leftClick(wrapper) {
  wrapper.trigger('mousedown', MOUSE_BUTTON_LEFT)
}

export function pressBackspaceKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  inputWrapper.trigger('keydown', KEY_BACKSPACE)
}

export function pressDeleteKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  inputWrapper.trigger('keydown', KEY_DELETE)
}

export function pressEscapeKey(wrapper, modifierKey) {
  const inputWrapper = findInput(wrapper)
  let eventData = KEY_ESCAPE
  if (modifierKey) eventData = { ...KEY_ESCAPE, [modifierKey]: true }
  inputWrapper.trigger('keydown', eventData)
}

export function pressAKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  inputWrapper.trigger('keydown', KEY_A)
}

export async function typeSearchText(wrapper, text) {
  const $input = findInput(wrapper)
  $input.element.value = text
  $input.trigger('input')
  await sleep(INPUT_DEBOUNCE_DELAY + 10)
  expect(wrapper.vm.searchQuery).toBe(text)
}

export function findInput(wrapper) {
  return wrapper.find('.vue-treeselect__input')
}

export function findMenu(wrapper) {
  return wrapper.find('.vue-treeselect__menu')
}

export function findOptionByNodeId(wrapper, nodeId) {
  return wrapper.findAll(TreeselectOption).wrappers
    .find(optionWrapper => optionWrapper.vm.node.id === nodeId)
}

export function findOptionArrowContainerByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__option-arrow-container')
}

export function findOptionArrowByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__option-arrow')
}

export function findCheckboxByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__checkbox')
}

export function findLabelContainerByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__label-container')
}

export function findChildrenOptionListByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__list')
}
