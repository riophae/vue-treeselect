<template>
<div>
    <treeselect :options="options" :value="value" :multiple="multiple">
        <div slot="value-label" slot-scope="{ node }">{{ node.raw.customLabel }}</div>
    </treeselect>
    <p>
        <label>
            <input type="checkbox" v-model="multiple" />Multi-select
        </label>
    </p>
</div>
</template>

<script>
export default {
    data: () => ({
        multiple: true,
        value: null,
        options: [{
                id: "fruits",
                label: "Fruits with custom colors",
                customLabel: "Fruits 🍎 🍇 🍐 🍓 🍉",
                customClass: "fruit-yellow",
                children: [{
                        id: "apple",
                        label: "Apple 🍎",
                        customLabel: "🍎",
                        customClass: "fruit-red"
                    },
                    {
                        id: "grapes",
                        customClass: "fruit-green",
                        label: "Grapes 🍇",
                        customLabel: "🍇"
                    },
                    {
                        id: "pear",
                        customClass: "fruit-yellow",
                        label: "Pear 🍐",
                        customLabel: "🍐"
                    },
                    {
                        id: "strawberry",
                        customClass: "fruit-red",
                        label: "Strawberry 🍓",
                        customLabel: "🍓"
                    },
                    {
                        id: "watermelon",
                        customClass: "fruit-green",
                        label: "Watermelon 🍉",
                        customLabel: "🍉"
                    }
                ]
            },
            {
                id: "vegetables",
                label: "Vegetables",
                customLabel: "Vegetables 🌽🥕🍆🍅",
                children: [{
                        id: "corn",
                        label: "Corn 🌽",
                        customLabel: "🌽"
                    },
                    {
                        id: "carrot",
                        label: "Carrot 🥕",
                        customLabel: "🥕"
                    },
                    {
                        id: "eggplant",
                        label: "Eggplant 🍆",
                        customLabel: "🍆"
                    },
                    {
                        id: "tomato",
                        label: "Tomato 🍅",
                        customLabel: "🍅"
                    }
                ]
            }
        ]
    })
};
</script>

<style lang="less">
.fruit-yellow {
    background-color: yellow;
    color: black;
}

.fruit-red {
    background-color: red;
    color: white;
}

.fruit-green {
    background-color: green;
    color: white;
}
</style>
