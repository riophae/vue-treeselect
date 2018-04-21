import sleep from 'yaku/lib/sleep'
import SearchInput from '@riophae/vue-treeselect/components/SearchInput'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'
import { INPUT_DEBOUNCE_DELAY } from '@riophae/vue-treeselect/constants'

const MOUSE_BUTTON_LEFT = { button: 0 }
const KEY_BACKSPACE = { which: 8, keyCode: 8 }
const KEY_DELETE = { which: 46, keyCode: 46 }
const KEY_ESCAPE = { which: 27, keyCode: 27 }
const KEY_A = { which: 65, keyCode: 65 }

// currently avoriaz has a bad support for keyboard event testing
// so here we implement it ourself
export function customTrigger(wrapper, eventType, eventData) {
  const event = document.createEvent('Event')
  event.initEvent(eventType, true, true)
  Object.assign(event, eventData)
  wrapper.element.dispatchEvent(event)
}

export function leftClick(wrapper) {
  customTrigger(wrapper, 'mousedown', MOUSE_BUTTON_LEFT)
}

export function pressBackspaceKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  customTrigger(inputWrapper, 'keydown', KEY_BACKSPACE)
}

export function pressDeleteKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  customTrigger(inputWrapper, 'keydown', KEY_DELETE)
}

export function pressEscapeKey(wrapper, modifierKey) {
  const inputWrapper = findInput(wrapper)
  const eventData = { ...KEY_ESCAPE }
  if (modifierKey) eventData[modifierKey] = true
  customTrigger(inputWrapper, 'keydown', eventData)
}

export function pressAKey(wrapper) {
  const inputWrapper = findInput(wrapper)
  customTrigger(inputWrapper, 'keydown', KEY_A)
}

export async function typeSearchText(wrapper, text) {
  // eslint-disable-next-line newline-per-chained-call
  wrapper.find(SearchInput).vm.onInput({
    target: {
      value: text,
    },
  })
  await sleep(INPUT_DEBOUNCE_DELAY + 10)
  expect(wrapper.vm.searchQuery).toBe(text)
}

export function findInput(wrapper) {
  return wrapper.find('.vue-treeselect__input')
}

export function findOptionByNodeId(wrapper, nodeId) {
  return wrapper.findAll(TreeselectOption).wrappers
    .find(optionWrapper => optionWrapper.vm.node.id === nodeId)
}

export function findLabelWrapperByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__label-wrapper')
}

export function findCheckboxByNodeId(wrapper, nodeId) {
  return findOptionByNodeId(wrapper, nodeId).find('.vue-treeselect__checkbox')
}
