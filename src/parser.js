import { toArray } from './utils/array'
import { getVal } from './utils/admx'
import { useGlobal } from './global'

const {
    curPolicy,
    curConfig,
    configs,
    getPolicy,
    getStringVal,
    getPresentationVal
} = useGlobal()

const bool = val => {
    if (val === true || val?.toLowerCase() === 'true') {
        return true
    }
    return false
}

const number = (val, defaultValue) => {
    if (typeof val === 'number') {
        return val
    }
    if (typeof val === 'string') {
        try {
            return Number(val)
        } catch (e) {
            return defaultValue
        }
    }
    return defaultValue
}

const regVal = (value, scope, key, valueName) => {
    const { del, long, ret } = getVal(value)
    const action = del ? 'del' : 'set'
    let type = null
    if (typeof ret === 'string') {
        type = 'REG_SZ'
    }
    if (typeof ret === 'number') {
        type = long ? 'REG_QWORD' : 'REG_DWORD'
    }

    return {
        action,
        type,
        scope,
        key,
        valueName,
        val: ret
    }
}

const regValueAndValueList = (po, el, value, valList, boolValue) => {
    const results = []

    const scope = po.scope

    const defaultKey = el.key ?? po.item.key
    const defaultValueName = el.valueName ?? po.item.valueName

    if (
        !value &&
        !valList &&
        typeof boolValue === 'boolean' &&
        defaultKey &&
        defaultValueName
    ) {
        value = {
            decimal: { value: boolValue ? 1 : 0 }
        }
    }

    if (value) {
        results.push(regVal(value, scope, defaultKey, defaultValueName))
    }

    if (valList) {
        const itemDefaultKey = valList.defaultKey
        const items = toArray(valList.item) ?? []

        items.forEach(i => {
            const val = i.value
            const key = i.key ?? itemDefaultKey ?? defaultKey
            const valueName = i.valueName ?? defaultValueName

            results.push(regVal(val, scope, key, valueName))
        })
    }

    return results
}

const getDefaultKeyAndValueName = (po, el) => {
    return {
        defaultKey: el.key ?? po.item.key,
        defaultValueName: el.valueName ?? po.item.valueName
    }
}

const getEnumComp = (policy, id, defaultValue, item) => {
    const enumEl = getComponentDefinition(policy, id, 'enum')
    const noSort = bool(item[':@'].noSort)
    const required = bool(enumEl.required)
    const items = getEnumItems(policy, id, noSort)
    defaultValue[id] = number(item[':@'].defaultItem, null)
    return {
        type: 'dropdown',
        label: item.dropdownList?.[0]?.['#text'],
        prop: id,
        display: val => items.find(i => i.val === val)?.label,
        validate: val => {
            if (required && (val === null || val === undefined)) {
                throw Error('{label} is required.')
            }
        },
        reg: val => {
            if (val === null || val === undefined) {
                return []
            }
            const targetItem = toArray(enumEl.item)[val]
            return regValueAndValueList(
                policy,
                enumEl,
                targetItem.value,
                targetItem.valueList
            )
        },
        options: items
    }
}

const getBooleanComp = (policy, id, defaultValue, item) => {
    const booleanEl = getComponentDefinition(policy, id, 'boolean')
    defaultValue[id] = bool(item[':@'].defaultChecked)
    return {
        type: 'checkbox',
        label: item.checkBox?.[0]?.['#text'],
        display: val => val,
        validate: () => {},
        prop: id,
        reg: val => {
            if (val === true) {
                return regValueAndValueList(
                    policy,
                    booleanEl,
                    booleanEl.trueValue,
                    booleanEl.trueList,
                    true
                )
            }
            if (val === false) {
                return regValueAndValueList(
                    policy,
                    booleanEl,
                    booleanEl.falseValue,
                    booleanEl.falseList,
                    false
                )
            }
            return []
        }
    }
}

const getTextComp = (policy, id, defaultValue, item) => {
    const textEl = getComponentDefinition(policy, id, 'text')
    const label = item.textBox.find(i => i.label)?.label?.[0]?.['#text'] ?? ''
    defaultValue[id] =
        item.textBox.find(i => i.defaultValue)?.defaultValue?.[0]?.['#text'] ??
        ''
    const required = bool(textEl.required)
    const maxLength = number(textEl.maxLength, 65535)
    const expandable = bool(textEl.expandable)
    const soft = bool(textEl.soft)
    return {
        type: 'textbox',
        label,
        display: val => val,
        validate: val => {
            if (required && !val) {
                return '{label} is required'
            }
            if (val.length > maxLength) {
                return `{label} exceeds maximum length of ${maxLength}`
            }
        },
        prop: id,
        reg: val => {
            const { defaultKey, defaultValueName } = getDefaultKeyAndValueName(
                policy,
                textEl
            )
            return [
                {
                    action: 'set',
                    type: expandable ? 'REG_EXPAND_SZ' : 'REG_SZ',
                    scope: policy.scope,
                    key: defaultKey,
                    valueName: defaultValueName,
                    val
                }
            ]
        }
    }
}

const getMultiTextComp = (policy, id, defaultValue, item) => {
    const multiTextEl = getComponentDefinition(policy, id, 'multiText')
    const label = item.multiTextBox?.[0]?.['#text'] ?? ''
    defaultValue[id] = ''
    const required = bool(multiTextEl.required)
    const maxLength = number(multiTextEl.maxLength, 65535)
    const maxStrings = number(multiTextEl.maxStrings, 65535)
    const soft = bool(multiTextEl.soft)
    return {
        type: 'multitextbox',
        label,
        display: val =>
            val
                .split('\n')
                .filter(i => i.length > 0)
                .join('; '),
        validate: val => {
            const cnt = val.split('\n').filter(i => i.length > 0).length
            if (required && cnt === 0) {
                return '{label} is required'
            }
            if (val.length > maxLength) {
                return `{label} exceeds maximum length of ${maxLength}`
            }
            if (cnt > maxStrings) {
                return `{label} exceeds maximum strings of ${maxStrings}`
            }
        },
        prop: id,
        reg: val => {
            const { defaultKey, defaultValueName } = getDefaultKeyAndValueName(
                policy,
                multiTextEl
            )
            return [
                {
                    action: 'set',
                    type: 'REG_MULTI_SZ',
                    scope: policy.scope,
                    key: defaultKey,
                    valueName: defaultValueName,
                    val: val.split('\n').filter(i => i.length > 0)
                }
            ]
        }
    }
}

const getDecimalTextComp = (policy, id, defaultValue, item) => {
    const decimalEl = getComponentDefinition(policy, id, 'decimal')
    const label = item.decimalTextBox?.[0]?.['#text'] ?? ''
    defaultValue[id] = number(item[':@'].defaultValue, 1)
    const spin = bool(item[':@'].spin)
    const spinStep = number(item[':@'].spinStep, 1)
    const required = bool(decimalEl.required)
    const minValue = number(decimalEl.minValue, 1)
    const maxValue = number(decimalEl.maxValue, 65535)
    const storeAsText = bool(decimalEl.storeAsText)
    const soft = bool(decimalEl.soft)
    if (defaultValue[id] < minValue) {
        defaultValue[id] = minValue
    }
    if (defaultValue[id] > maxValue) {
        defaultValue[id] = maxValue
    }
    return {
        type: 'decimal',
        label,
        display: val => val,
        attrs: {
            spin,
            spinStep,
            minValue,
            maxValue
        },
        validate: val => true,
        prop: id,
        reg: val => {
            const { defaultKey, defaultValueName } = getDefaultKeyAndValueName(
                policy,
                decimalEl
            )
            return [
                {
                    action: 'set',
                    type: storeAsText ? 'REG_SZ' : 'REG_DWORD',
                    scope: policy.scope,
                    key: defaultKey,
                    valueName: defaultValueName,
                    val: storeAsText ? val.toString() : val
                }
            ]
        }
    }
}

const getListComp = (policy, id, defaultValue, item) => {
    const listEl = getComponentDefinition(policy, id, 'list')
    const label = item.listBox?.[0]?.['#text'] ?? ''
    defaultValue[id] = []
    const additive = bool(listEl.additive)
    const expandable = bool(listEl.expandable)
    const explicitValue = bool(listEl.explicitValue)
    const valuePrefix = listEl.valuePrefix ?? null
    return {
        type: 'list',
        label,
        display: val => {
            if (!explicitValue) {
                return val.map(i => i.value).join('; ')
            } else {
                return val.map(i => `${i.valueName}=${i.value}`).join('; ')
            }
        },
        attrs: {
            explicitValue
        },
        validate: val => true,
        prop: id,
        reg: val => {
            const { defaultKey } = getDefaultKeyAndValueName(policy, listEl)
            const regs = []
            if (!additive) {
                regs.push({
                    action: 'del',
                    type: null,
                    scope: policy.scope,
                    key: defaultKey,
                    valueName: null,
                    val: null
                })
            }
            val.forEach((v, i) => {
                const val = v.value
                let valueName = val
                if (explicitValue) {
                    valueName = v.valueName
                } else if (valuePrefix !== null) {
                    valueName = valuePrefix + (i + 1)
                }
                regs.push({
                    action: 'set',
                    type: expandable ? 'REG_EXPAND_SZ' : 'REG_SZ',
                    scope: policy.scope,
                    key: defaultKey,
                    valueName,
                    val
                })
            })
            return regs
        }
    }
}

const getParsedPolicy = policy => {
    if (!policy) {
        return null
    }
    const title = getStringVal(policy.file, policy.item.displayName)
    const defaultValue = {}
    const statusReg = val => {
        if (val === true) {
            return regValueAndValueList(
                policy,
                {},
                policy.item.enabledValue,
                policy.item.enabledList,
                true
            )
        }
        if (val === false) {
            return regValueAndValueList(
                policy,
                {},
                policy.item.disabledValue,
                policy.item.disabledList,
                false
            )
        }
    }
    const components = getPresentations(policy).map(item => {
        if (item.text) {
            return {
                type: 'text',
                val: item.text?.[0]?.['#text']
            }
        }
        const id = item[':@'].refId
        if (item.dropdownList) {
            return getEnumComp(policy, id, defaultValue, item)
        }
        if (item.checkBox) {
            return getBooleanComp(policy, id, defaultValue, item)
        }
        if (item.textBox) {
            return getTextComp(policy, id, defaultValue, item)
        }
        if (item.multiTextBox) {
            return getMultiTextComp(policy, id, defaultValue, item)
        }
        if (item.decimalTextBox) {
            return getDecimalTextComp(policy, id, defaultValue, item)
        }
        if (item.listBox) {
            return getListComp(policy, id, defaultValue, item)
        }
    })
    return {
        file: policy.file,
        id: policy.id,
        scope: policy.scope,
        title,
        statusReg,
        components,
        defaultValue
    }
}

const getPresentations = policy => {
    return !policy
        ? []
        : getPresentationVal(policy.file, policy.item.presentation)?.item ?? []
}

const getComponentDefinition = (policy, id, key) => {
    return toArray(policy.item.elements[key]).find(i => id === i.id)
}

const getEnumItems = (policy, id, noSort) => {
    let items = toArray(getComponentDefinition(policy, id, 'enum').item)
    items = items.map((i, idx) => {
        return {
            val: idx,
            label: getStringVal(policy.file, i.displayName)
        }
    })
    if (!noSort) {
        items.sort((a, b) => a.label.localeCompare(b.label))
    }
    return items
}

const parsedPolicy = computed(() => getParsedPolicy(curPolicy.value))

const errorMsgs = computed(() => {
    if (curConfig.value.enabled !== true) {
        return []
    }
    const msgs = []
    parsedPolicy.value.components.forEach(item => {
        if (!item) {
            return
        }
        const val = curConfig.value.config[item.prop]
        try {
            item.validate && item.validate(val)
        } catch (error) {
            msgs.push(error.message.replace('{label}', item.label))
        }
    })
    return msgs
})

const parsedConfigPolicies = computed(() => {
    return configs.value.map(i => getParsedPolicy(getPolicy(i.id)))
})

const parsedRegs = computed(() => {
    return configs.value.map(i => {
        const parsedPolicy = parsedConfigPolicies.value.find(p => p?.id === i.id)
        if (!parsedPolicy) {
            return null
        }
        const regs = {}
        regs._config = parsedPolicy.statusReg(i.enabled)
        Object.keys(i.config).forEach(prop => {
            const component = parsedPolicy.components.find(c => c.prop === prop)
            regs[prop] = component.reg(i.config[prop])
        })
        return {
            id: i.id,
            regs
        }
    })
})

export const useParser = () => {
    return {
        getParsedPolicy,
        parsedPolicy,

        errorMsgs,
        parsedConfigPolicies,
        parsedRegs
    }
}
