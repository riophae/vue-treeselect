import Treeselect from './components/Treeselect'
import treeselectMixin from './mixins/treeselectMixin'
import './style.less'
// add
export default Treeselect
export { Treeselect, treeselectMixin }
export {
  // Delayed loading.
  LOAD_ROOT_OPTIONS,
  LOAD_CHILDREN_OPTIONS,
  ASYNC_SEARCH,
} from './constants'
let test="message"
export const VERSION = PKG_VERSION
