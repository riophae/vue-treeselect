import Treeselect from './components/Treeselect'
import treeselectMixin from './mixins/treeselectMixin'
import './style.less'

export default Treeselect
export { Treeselect, treeselectMixin }
export {
  // Delayed loading.
  LOAD_ROOT_OPTIONS,
  LOAD_CHILDREN_OPTIONS,
  ASYNC_SEARCH,
} from './constants'

// Workaround that webpack doesn't set `__esModule=true` on library export.
// See: https://github.com/webpack/webpack/issues/2945#issuecomment-244733810
export const __esModule = true
export const VERSION = PKG_VERSION
