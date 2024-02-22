<template>
    <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick">
        <template #default="{ data }">
            <el-row>
                <el-text>
                    <el-icon style="margin-right: 6px">
                        <template v-if="data.isCategory">
                            <i-ep-folder />
                        </template>
                        <template v-else>
                            <i-ep-document />
                        </template>
                    </el-icon>
                </el-text>
                <el-text v-if="isEnabled(data) !== null">
                    <el-icon
                        style="margin-right: 6px"
                        :color="isEnabled(data) ? '#67c23a' : '#f56c6c'">
                        <template v-if="isEnabled(data) === true">
                            <i-ep-circle-check-filled />
                        </template>
                        <template v-else-if="isEnabled(data) === false">
                            <i-ep-circle-close-filled />
                        </template>
                    </el-icon>
                </el-text>
                <el-text>{{ data.display }}</el-text>
                <el-text
                    v-if="data.explain && data.isCategory"
                    type="info"
                    style="width: 500px; margin-left: 10px"
                    truncated>
                    ({{ data.explain }})
                </el-text>
            </el-row>
        </template>
    </el-tree>
</template>

<script setup>
import { useGlobal } from '../global'

const { treeData, configs, curPolicy, getPolicy } = useGlobal()

const emit = defineEmits(['click'])

const defaultProps = {
    children: 'children',
    label: 'label',
    class: (data, node) => {
        if (data.isCategory) {
            return null
        }
        return 'leafnode'
    }
}

const handleNodeClick = data => {
    if (data.isCategory) {
        return
    }
    curPolicy.value = getPolicy(data)
    emit('click')
}

const isEnabled = data => {
    return configs.value.find(config => config.id === data.id)?.enabled ?? null
}
</script>

<style>
.leafnode span:hover {
    color: #409eff;
    text-decoration: underline;
}
</style>
