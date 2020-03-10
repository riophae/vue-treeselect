import sleep from 'yaku/lib/sleep'
import Option from '@src/components/Option'
import { INPUT_DEBOUNCE_DELAY } from '@src/constants'

export function $(selector, context = document) {
  return context.querySelector(selector)
}

function createArray(len, fn) {
  const arr = []
  let i = 0
  while (i < len) arr.push(fn(i++))
  return arr
}

export function generateOptions(maxLevel) {
  const generate = (i, level) => {
    const id = String.fromCharCode(97 + i).repeat(level)
    const option = { id, label: id.toUpperCase() }
    if (level < maxLevel) option.children = [ generate(i, level + 1) ]
    return option
  }

  return createArray(maxLevel, i => generate(i, 1))
}

function createKeyObject(keyCode) {
  return { which: keyCode, keyCode }
}

export function leftClick(wrapper) {
  const MOUSE_BUTTON_LEFT = { button: 0 }
  wrapper.trigger('mousedown', MOUSE_BUTTON_LEFT)
}

export function pressBackspaceKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_BACKSPACE = createKeyObject(8)
  input.trigger('keydown', KEY_BACKSPACE)
}

export function pressEnterKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_ENTER = createKeyObject(13)
  input.trigger('keydown', KEY_ENTER)
}

export function pressEscapeKey(wrapper, modifierKey) {
  const input = findInput(wrapper)
  const KEY_ESCAPE = createKeyObject(27)
  let eventData = KEY_ESCAPE
  if (modifierKey) eventData = { ...KEY_ESCAPE, [modifierKey]: true }
  input.trigger('keydown', eventData)
}

export function pressEndKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_END = createKeyObject(35)
  input.trigger('keydown', KEY_END)
}

export function pressHomeKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_HOME = createKeyObject(36)
  input.trigger('keydown', KEY_HOME)
}

export function pressArrowLeft(wrapper) {
  const input = findInput(wrapper)
  const ARROW_LEFT = createKeyObject(37)
  input.trigger('keydown', ARROW_LEFT)
}

export function pressArrowUp(wrapper) {
  const input = findInput(wrapper)
  const ARROW_UP = createKeyObject(38)
  input.trigger('keydown', ARROW_UP)
}

export function pressArrowRight(wrapper) {
  const input = findInput(wrapper)
  const ARROW_RIGHT = createKeyObject(39)
  input.trigger('keydown', ARROW_RIGHT)
}

export function pressArrowDown(wrapper) {
  const input = findInput(wrapper)
  const ARROW_DOWN = createKeyObject(40)
  input.trigger('keydown', ARROW_DOWN)
}

export function pressDeleteKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_DELETE = createKeyObject(46)
  input.trigger('keydown', KEY_DELETE)
}

export function pressAKey(wrapper) {
  const input = findInput(wrapper)
  const KEY_A = createKeyObject(65)
  input.trigger('keydown', KEY_A)
}

export async function typeSearchText(wrapper, text) {
  const $input = findInput(wrapper)
  $input.element.value = text
  $input.trigger('input')
  expect(wrapper.vm.$refs.control.$refs['value-container'].$refs.input.value).toBe(text)
  await sleep(INPUT_DEBOUNCE_DELAY + 1)
  expect(wrapper.vm.trigger.searchQuery).toBe(text)
}

export function findInputContainer(wrapper) {
  return wrapper.find('.vue-treeselect__input-container')
}

export function findInput(wrapper) {
  return wrapper.find('.vue-treeselect__input')
}

export function findMenuContainer(wrapper) {
  return wrapper.find('.vue-treeselect__menu-container')
}

export function findMenu(wrapper) {
  return wrapper.find('.vue-treeselect__menu')
}

export function findVisibleOptions(wrapper) {
  return wrapper.findAll('.vue-treeselect__option:not(.vue-treeselect__option--hide)')
}

export function findOptionByNodeId(wrapper, nodeId) {
  return wrapper.find(`.vue-treeselect__option[data-id="${nodeId}"]`)
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

export function findLabelByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__label')
}

export function findChildrenOptionListByNodeId(wrapper, nodeId) {
  return wrapper.findAll(Option).wrappers
    .find(optionWrapper => optionWrapper.vm.node.id === nodeId)
    .find('.vue-treeselect__list')
}
