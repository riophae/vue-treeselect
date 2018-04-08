<template>
  <div>
    <p>Available properties of <code>node</code> object.</p>
    <table class="striped">
      <thead>
        <tr>
          <th class="name">Key</th>
          <th>Type</th>
          <th class="desc">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>id</strong> (required)</td>
          <td><code>Number</code> or <code>String</code></td>
          <td>Used to identify the option within the tree. It's value must be unique across all options.</td>
        </tr>
        <tr>
          <td><strong>label</strong> (required)</td>
          <td><code>String</code></td>
          <td>Used to display the option.</td>
        </tr>
        <tr>
          <td><strong>children</strong></td>
          <td><code>Array&lt;node&gt;</code> or <code>null</code></td>
          <td>Declares a branch node. Set to empty array for no children options. Set to <code>null</code> for <a href="#delayed-loading">delayed loading</a>.</td>
        </tr>
        <tr>
          <td><strong>isBranch</strong></td>
          <td><code>Boolean</code></td>
          <td>Useful for declaring an <a href="#delayed-loading">unloaded branch node</a>. For other cases, just use <code>children</code> instead.</td>
        </tr>
        <tr>
          <td><strong>isDisabled</strong></td>
          <td><code>Boolean</code></td>
          <td>Used for disabling item selection. See <a href="#disable-item-selection">here</a> for detailed information.</td>
        </tr>
        <tr>
          <td><strong>isDefaultExpanded</strong></td>
          <td><code>Boolean</code></td>
          <td>Whether the branch option should be expanded by default.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
