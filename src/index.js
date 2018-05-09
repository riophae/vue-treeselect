import Treeselect from './components/Treeselect'
import treeselectMixin from './mixins/treeselectMixin'
import optionMixin from './mixins/optionMixin'
import valueMixin from './mixins/valueMixin'

import './style.less'

export default Treeselect
export { Treeselect, treeselectMixin, optionMixin, valueMixin }
export {
  // delayed loading
  LOAD_ROOT_OPTIONS,
  LOAD_CHILDREN_OPTIONS,
  ASYNC_SEARCH,
} from './constants'

// workaround that webpack doesn't set `__esModule=true` on library export
// see: https://github.com/webpack/webpack/issues/2945#issuecomment-244733810
export const __esModule = true
