<template>
    <el-table :data="value" size="small">
        <el-table-column v-if="explicitValue" label="Value name">
            <template #default="scope">
                <template v-if="scope.$index === value.length - 1">
                    <el-input
                        :disabled="disabled"
                        v-model="addValueName"></el-input>
                </template>
                <template v-else-if="scope.$index === activeIndex">
                    <el-input
                        :disabled="disabled"
                        v-model="updateValueName"></el-input>
                </template>
                <template v-else>
                    {{ scope.row.valueName }}
                </template>
            </template>
        </el-table-column>
        <el-table-column label="value">
            <template #default="scope">
                <template v-if="scope.$index === value.length - 1">
                    <el-input
                        :disabled="disabled"
                        v-model="addValue"></el-input>
                </template>
                <template v-else-if="scope.$index === activeIndex">
                    <el-input
                        :disabled="disabled"
                        v-model="updateValue"></el-input>
                </template>
                <template v-else>
                    {{ scope.row.value }}
                </template>
            </template>
        </el-table-column>
        <el-table-column label="Operation">
            <template #default="scope">
                <template v-if="scope.$index === value.length - 1">
                    <el-button
                        :disabled="disabled"
                        plain
                        type="success"
                        size="small"
                        @click="add()">
                        <i-ep-check />
                    </el-button>
                </template>
                <template v-else-if="scope.$index === activeIndex">
                    <el-button
                        :disabled="disabled"
                        plain
                        type="success"
                        size="small"
                        @click="update(scope.$index)">
                        <i-ep-check />
                    </el-button>
                </template>
                <template v-else>
                    <el-button
                        :disabled="disabled"
                        plain
                        type="danger"
                        size="small"
                        @click="del(scope.$index)">
                        <i-ep-delete />
                    </el-button>
                    <el-button
                        :disabled="disabled"
                        plain
                        type="primary"
                        size="small"
                        @click="edit(scope.$index)">
                        <i-ep-edit />
                    </el-button>
                </template>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    modelValue: Array,
    disabled: Boolean,
    explicitValue: Boolean
})

const addValue = ref('')
const addValueName = ref('')

const activeIndex = ref(null)
const updateValue = ref('')
const updateValueName = ref('')

const value = computed({
    get() {
        if (props.modelValue === undefined) {
            return [{}]
        }
        const list = props.modelValue.map(item => ({ ...item }))
        list.push({})
        return list
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const add = () => {
    const el = props.explicitValue
        ? {
              value: addValue.value,
              valueName: addValueName.value
          }
        : {
              value: addValue.value
          }
    value.value.splice(value.value.length - 1, 0, el)
    value.value = value.value.filter((_, i) => i !== value.value.length - 1)
    addValue.value = ''
    addValueName.value = ''
}

const del = idx => {
    value.value = value.value.filter(
        (_, i) => i !== idx && i !== value.value.length - 1
    )
}

const edit = idx => {
    activeIndex.value = idx
    updateValue.value = value.value[idx].value
    updateValueName.value = value.value[idx].valueName
}

const update = idx => {
    value.value[idx].value = updateValue.value
    if (props.explicitValue) {
        value.value[idx].valueName = updateValueName.value
    }
    value.value = value.value.filter((_, i) => i !== value.value.length - 1)
    activeIndex.value = null
}
</script>
