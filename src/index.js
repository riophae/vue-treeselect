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
