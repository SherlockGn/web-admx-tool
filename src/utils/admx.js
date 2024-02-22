import { XMLParser } from 'fast-xml-parser'

export const getVal = val => {
    let del = false,
        long = false
    let ret
    if (val.decimal) {
        ret = Number(val.decimal.value)
    }
    if (val.longDecimal) {
        ret = Number(val.longDecimal.value)
        long = true
    }
    if (val.string) {
        ret = val.string.value
    }
    if (val.delete) {
        del = true
    }
    return {
        del,
        long,
        ret
    }
}

export const convert = folder => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        ignoreDeclaration: true,
        stopNodes: [
            'policyDefinitionResources.resources.presentationTable.presentation'
        ]
    })
    const presentationParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        preserveOrder: true
    })
    folder.forEach(f => {
        f.content = parser.parse(f.content)
        if (f.content.policyDefinitions) {
            delete f.content['policyDefinitions']['revision']
            delete f.content['policyDefinitions']['schemaVersion']
            delete f.content['policyDefinitions']['xmlns']
            delete f.content['policyDefinitions']['xmlns:xsd']
            delete f.content['policyDefinitions']['xmlns:xsi']
            delete f.content['policyDefinitions']['resources']
            delete f.content['policyDefinitions']['supportedOn']
        }

        if (f.content.policyDefinitionResources) {
            delete f.content['policyDefinitionResources']['revision']
            delete f.content['policyDefinitionResources']['schemaVersion']
            delete f.content['policyDefinitionResources']['xmlns']
            delete f.content['policyDefinitionResources']['xmlns:xsd']
            delete f.content['policyDefinitionResources']['xmlns:xsi']
        }
        const ptab =
            f.content.policyDefinitionResources?.resources?.presentationTable
        if (ptab?.presentation) {
            const p = ptab.presentation
            if (!Array.isArray(p)) {
                ptab.presentation = [p]
            }
            for (let i = 0; i < p.length; i++) {
                p[i] = {
                    id: p[i].id,
                    item: p[i]['#text']
                        ? presentationParser.parse(p[i]['#text'])
                        : null
                }
            }
        }
    })
    const converted = {}
    folder
        .filter(f => !f.name.includes('/'))
        .forEach(f => {
            const name = f.name.split('.')[0]
            converted[name.toLowerCase()] = {
                policy: f.content
            }
        })
    folder
        .filter(f => f.name.includes('/'))
        .forEach(f => {
            const parts = f.name.split('/')
            const lang = parts[0]
            const name = parts[1].split('.')[0]
            if (converted[name.toLowerCase()]) {
                converted[name.toLowerCase()][lang.toLowerCase()] = f.content
            }
        })
    return converted
}
