<template>
  <treeselect
    :options="options"
    :multiple="true"
    :normalizer="normalizer"
    virtual
    :virtual-row-height="25"
    />
</template>

<script>
  // import { generateOptions } from '../utils'
  import data from '../data/data'

  export default {
    data: () => ({
      options: data,
      normalizer: node => {
        const isChild = !!(node.Children && node.Children.length)

        return {
          id: isChild ? node.WarehouseType + node.WarehouseTypeName : node.WarehouseId,
          label: isChild ? node.WarehouseTypeName : node.WarehouseName,
          children: isChild ? node.Children : undefined,
          // children: node.OrderSourceChildren && node.OrderSourceChildren.length ? node.OrderSourceChildren : undefined,
          // isDisabled: !node.IsAvailable,
        }
      },
    }),
  }
</script>
