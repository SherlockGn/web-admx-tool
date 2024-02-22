<template>
    <div>
        <div style="margin-bottom: 10px">
            <el-row style="margin-bottom: 20px">
                <el-text>Click to&nbsp;</el-text>
                <el-link
                    type="primary"
                    @click="download('reg.json', parsedRegs)">
                    export
                </el-link>
                <el-text>&nbsp;the registries.</el-text>
            </el-row>
        </div>
        <div v-for="(regs, idx) in parsedRegs">
            <el-descriptions size="small" border>
                <template #title>
                    <template v-if="regs">
                        {{ getTargetParsedPolicy(regs.id).title }}
                    </template>
                    <template v-else>
                        {{ configs[idx].id.split(':')[2] }}
                        <el-tag
                            type="danger"
                            size="small"
                            style="margin-left: 30px">
                            not found
                        </el-tag>
                    </template>
                </template>
            </el-descriptions>
            <template v-if="regs">
                <el-table :data="getData(regs.id)" style="margin-bottom: 20px">
                    <el-table-column prop="action" label="Action" width="80" />
                    <el-table-column prop="scope" label="Scope" width="80" />
                    <el-table-column prop="key" label="Key" />
                    <el-table-column prop="valueName" label="Value name" />
                    <el-table-column prop="type" label="Type" />
                    <el-table-column label="Value">
                        <template #default="scope">
                            <template v-if="Array.isArray(scope.row.val)">
                                {{ scope.row.val.join('; ') }}
                            </template>
                            <template v-else>
                                {{ scope.row.val }}
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <template v-else>
                <div style="margin-bottom: 20px">
                    <el-text>
                        Unable to view the registries due to missing templates.
                    </el-text>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useGlobal } from '../global'
import { useParser } from '../parser'
import { flatten } from '../utils/array'

import { download } from '../utils/dom'

const { configs } = useGlobal()
const { parsedConfigPolicies, parsedRegs } = useParser()

const getTargetParsedPolicy = id =>
    parsedConfigPolicies.value.find(i => i?.id === id)

const getData = id => {
    const regs = parsedRegs.value.find(i => i?.id === id)
    return flatten(Object.values(regs.regs))
}
</script>
