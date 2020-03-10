<template>
  <div>
    <p>Available properties of a <code>node</code> object.</p>
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
          <td class="type">Number | String</td>
          <td>Used to identify the option within the tree. Its value must be unique across all options.</td>
        </tr>
        <tr>
          <td><strong>label</strong> (required)</td>
          <td class="type">String</td>
          <td>Used to display the option.</td>
        </tr>
        <tr>
          <td><strong>children</strong></td>
          <td class="type"><code>node[]</code> | <code>null</code></td>
          <td>Declares a branch node. You can:<br><b>1)</b> Set to an array of children options consisting of <b>a.</b> leaf nodes, <b>b.</b> branch nodes, or <b>c.</b> a mixture of these two. <i>or</i><br><b>2)</b> Set to empty array for no children options. <i>or</i><br><b>3)</b> Set to <code>null</code> to declare an <i>unloaded branch node</i> for <a href="#delayed-loading">delayed loading</a>. You can reassign an array (regardless of whether it's empty or not) later in <code>loadOptions()</code> to register these children options, and mark this branch node as <i>loaded</i>. <br>If you want to declare a leaf node, set <code>children: undefined</code> or simply omit this property.</td>
        </tr>
        <tr>
          <td><strong>isDisabled</strong></td>
          <td class="type">Boolean</td>
          <td>Used for disabling item selection. See <a href="#disable-item-selection">here</a> for detailed information.</td>
        </tr>
        <tr>
          <td><strong>isNew</strong></td>
          <td class="type">Boolean</td>
          <td>Used for giving new nodes a different color.</td>
        </tr>
        <tr>
          <td><strong>isDefaultExpanded</strong></td>
          <td class="type">Boolean</td>
          <td>Whether this folder option should be expanded by default.</td>
        </tr>
      </tbody>
    </table>
    <p class="tip">The value of <code>label</code>, <code>children</code> or <code>isDisabled</code> can be reassigned anytime.</p>
    <p class="tip">Add more properties than the listed ones IS okay. You can even use these extra properties in your custom template by accessing <code>node.raw.xxx</code>.</p>
  </div>
</template>
