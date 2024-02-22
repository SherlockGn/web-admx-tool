<template>
    <el-drawer
        size="50%"
        :title="display"
        v-model="drawer"
        destroy-on-close
        @open="loadConfig">
        <el-row>
            <pre
                class="el-text"
                style="white-space: pre-wrap; font-family: inherit"
                >{{ explain }}</pre
            >
        </el-row>
        <el-form style="margin-top: 20px" label-position="left">
            <el-form-item label="Enabled" label-width="80">
                <el-radio-group v-model="curConfig.enabled">
                    <el-radio :label="null">Not Configured</el-radio>
                    <el-radio :label="true">Enabled</el-radio>
                    <el-radio :label="false">Disabled</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Comment" label-width="80">
                <el-input
                    v-model="curConfig.comment"
                    type="textarea"
                    :disabled="!curConfig.enabled"
                    :autosize="{ minRows: 2, maxRows: 4 }" />
            </el-form-item>
            <policy-component></policy-component>
        </el-form>
        <el-row>
            <el-button @click="drawer = false">Cancel</el-button>
            <template v-if="errorMsgs.length === 0">
                <el-button type="primary" @click="confirm">OK</el-button>
            </template>
            <template v-else>
                <el-popover
                    placement="top-start"
                    trigger="hover"
                    :content="errorMsgs[0] ?? ''">
                    <template #reference>
                        <el-button
                            type="primary"
                            @click="confirm"
                            :disabled="true">
                            OK
                        </el-button>
                    </template>
                </el-popover>
            </template>
        </el-row>
    </el-drawer>
</template>

<script setup>
import { useGlobal } from '../global'
import { useParser } from '../parser'

const {
    configs,
    curConfig,
    curPolicy,
    resetConfig,
    updateConfig,
    getStringVal
} = useGlobal()
const { parsedPolicy, errorMsgs } = useParser()

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

const display = computed(() => {
    return !curPolicy.value
        ? undefined
        : getStringVal(curPolicy.value.file, curPolicy.value.item.displayName)
})

const explain = computed(() => {
    return !curPolicy.value
        ? undefined
        : getStringVal(curPolicy.value.file, curPolicy.value.item.explainText)
              .split('\n')
              .map(i => i.trim())
              .filter(i => i.length > 0)
              .join('\n')
})

const loadConfig = () => {
    const cfg = configs.value.find(i => i.id === curPolicy.value.id)
    if (cfg) {
        curConfig.value = JSON.parse(JSON.stringify(cfg))
    } else {
        resetConfig()
    }
    if (Object.keys(curConfig.value.config).length > 0) {
        return
    }
    curConfig.value.config = parsedPolicy.value.defaultValue
}

const confirm = () => {
    updateConfig()
    drawer.value = false
}
</script>
