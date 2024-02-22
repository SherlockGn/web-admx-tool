<template>
    <div>
        <template v-for="item in parsedPolicy.components">
            <template v-if="!item">
                <div>
                    <el-text type="danger">Unknown component.</el-text>
                </div>
            </template>
            <template v-else-if="item.type === 'text'">
                <div style="margin-bottom: 20px">
                    <el-text>{{ item.val }}</el-text>
                </div>
            </template>
            <template v-else-if="item.type === 'dropdown'">
                <el-form-item :label="item.label">
                    <el-select
                        v-model="curConfig.config[item.prop]"
                        :disabled="disabled">
                        <el-option
                            v-for="op in item.options"
                            :label="op.label"
                            :value="op.val"></el-option>
                    </el-select>
                </el-form-item>
            </template>
            <template v-else-if="item.type === 'checkbox'">
                <el-form-item :label="item.label">
                    <el-checkbox
                        :disabled="disabled"
                        v-model="curConfig.config[item.prop]"></el-checkbox>
                </el-form-item>
            </template>
            <template v-else-if="item.type === 'textbox'">
                <el-form-item :label="item.label">
                    <el-input
                        :disabled="disabled"
                        v-model="curConfig.config[item.prop]"></el-input>
                </el-form-item>
            </template>
            <template v-else-if="item.type === 'multitextbox'">
                <el-form-item :label="item.label">
                    <el-input
                        type="textarea"
                        :rows="3"
                        :disabled="disabled"
                        v-model="curConfig.config[item.prop]"></el-input>
                </el-form-item>
            </template>
            <template v-else-if="item.type === 'decimal'">
                <el-form-item :label="item.label">
                    <el-input-number
                        :disabled="disabled"
                        :step="item.attrs.spinStep"
                        step-strictly
                        :min="item.attrs.minValue"
                        :max="item.attrs.maxValue"
                        v-model="curConfig.config[item.prop]"></el-input-number>
                </el-form-item>
            </template>
            <template v-else-if="item.type === 'list'">
                <el-form-item :label="item.label">
                    <list-box
                        :disabled="disabled"
                        :explicitValue="item.attrs.explicitValue"
                        v-model="curConfig.config[item.prop]"></list-box>
                </el-form-item>
            </template>
        </template>
    </div>
</template>

<script setup>
import { useGlobal } from '../global'
import { useParser } from '../parser'

const { curConfig } = useGlobal()
const { parsedPolicy } = useParser()

const disabled = computed(() => curConfig.value.enabled !== true)
</script>
