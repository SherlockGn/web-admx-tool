<template>
    <div>
        <div style="margin-bottom: 10px">
            <el-row style="margin-bottom: 20px">
                <el-text>Click to&nbsp;</el-text>
                <el-link
                    type="primary"
                    @click="download('configurations.json', configs)">
                    export
                </el-link>
                <el-text>&nbsp;the configurations.&nbsp;</el-text>
                <el-text>Click to&nbsp;</el-text>
                <el-link type="primary" @click="importConfigs">import</el-link>
                <el-text>&nbsp;the configurations.&nbsp;</el-text>
            </el-row>
        </div>
        <el-descriptions
            style="margin-bottom: 20px"
            v-for="cfg in configs"
            :column="1"
            size="small"
            border>
            <template #title>
                <template v-if="getTargetParsedPolicy(cfg.id)">
                    {{ getTargetParsedPolicy(cfg.id).title }}
                </template>
                <template v-else>
                    {{ cfg.id.split(':')[2] }}
                    <el-tag type="danger" size="small" style="margin-left:30px;">not found</el-tag>
                </template>
            </template>
            <el-descriptions-item label="File">
                {{ cfg.id.split(':')[1] + '.admx' }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
                <template v-if="cfg.enabled === true">
                    <el-tag type="success" size="small">Enabled</el-tag>
                </template>
                <template v-else-if="cfg.enabled === false">
                    <el-tag type="danger" size="small">Disabled</el-tag>
                </template>
                <template v-else>
                    <el-tag type="info" size="small">Not configured</el-tag>
                </template>
            </el-descriptions-item>
            <el-descriptions-item label="Scope">
                {{ cfg.id.split(':')[0] }}
            </el-descriptions-item>
            <el-descriptions-item label="Comment">
                {{ cfg.comment }}
            </el-descriptions-item>
            <template v-if="getTargetParsedPolicy(cfg.id)">
                <el-descriptions-item
                    v-for="key in Object.keys(cfg.config)"
                    :label="getLabel(key, cfg)">
                    <template v-if="getVal(key, cfg) === true">
                        <el-tag type="success" size="small">true</el-tag>
                    </template>
                    <template v-else-if="getVal(key, cfg) === false">
                        <el-tag type="danger" size="small">false</el-tag>
                    </template>
                    <template v-else>
                        {{ getVal(key, cfg) }}
                    </template>
                </el-descriptions-item>
            </template>
            <template v-else>
                <el-descriptions-item
                    v-for="key in Object.keys(cfg.config)"
                    :label="key">
                    <template v-if="cfg.config[key] === true">
                        <el-tag type="success" size="small">true</el-tag>
                    </template>
                    <template v-else-if="cfg.config[key] === false">
                        <el-tag type="danger" size="small">false</el-tag>
                    </template>
                    <template v-else-if="typeof cfg.config[key] === 'string' && cfg.config[key].includes('\n')">
                        {{ cfg.config[key].split('\n')
                .filter(i => i.length > 0)
                .join('; ')}}
                    </template>
                    <template v-else-if="Array.isArray(cfg.config[key])">
                        {{ displayArray( cfg.config[key])}}
                    </template>
                    <template v-else>
                        {{ cfg.config[key] }}
                    </template>
                </el-descriptions-item>
            </template>
        </el-descriptions>
    </div>
</template>

<script setup>
import { useGlobal } from '../global'
import { useParser } from '../parser'

import { download, selectJson } from '../utils/dom'

const { parsedConfigPolicies } = useParser()
const { configs } = useGlobal()

const getTargetParsedPolicy = id =>
    parsedConfigPolicies.value.find(i => i?.id === id)

const getComponent = (id, key) =>
    getTargetParsedPolicy(id).components.find(i => i.prop === key)

const getLabel = (key, cfg) => getComponent(cfg.id, key)?.label ?? key

const getVal = (key, cfg) =>
    getComponent(cfg.id, key)?.display(cfg.config[key]) ?? cfg.config[key]

const importConfigs = async () => {
    const { data } = await selectJson()
    configs.value = data
}

const displayArray = arr => {
    if (arr.some(i => i.value)) {
        if (arr.some(i => i.valueName)) {
            return arr.map(i => `${i.valueName}=${i.value}`).join('; ')
        } else {
            return arr.map(i => i.value).join('; ')
        }
    }
    return JSON.stringify(arr)
}
</script>
