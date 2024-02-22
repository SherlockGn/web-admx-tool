<template>
    <el-drawer
        size="50%"
        title="Manage the template configurations"
        v-model="drawer">
        <el-tabs v-model="activeTab">
            <el-tab-pane label="Configurations" name="config">
                <tab-config></tab-config>
            </el-tab-pane>
            <el-tab-pane label="Registries" name="registry">
                <tab-reg></tab-reg>
            </el-tab-pane>
        </el-tabs>
    </el-drawer>
</template>

<script setup>
const props = defineProps({
    modelValue: Boolean
})
const emit = defineEmits(['update:modelValue'])
const drawer = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

const activeTab = ref('config')
</script>
