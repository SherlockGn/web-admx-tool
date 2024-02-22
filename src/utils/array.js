export const flatten = array => {
    return array.reduce((flat, toFlatten) => {
        return flat.concat(
            Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
        )
    }, [])
}
window.flatten = flatten

export const toArray = o => {
    return Array.isArray(o) ? o : o ? [o] : []
}
window.toArray = toArray

export const listToTree = (list, parentFn, idFn) => {
    const map = {},
        roots = []
    let node, i

    for (i = 0; i < list.length; i += 1) {
        map[idFn(list[i])] = i
        list[i].children = []
    }

    for (i = 0; i < list.length; i += 1) {
        node = list[i]
        if (parentFn(node) !== null && map[parentFn(node)] !== undefined) {
            list[map[parentFn(node)]].children.push(node)
        } else {
            roots.push(node)
        }
    }
    return roots
}

export const removeEmptyCategories = tree => {
    const calculateCount = node => {
        if (!node.isCategory) {
            return 1
        }

        let count = 0
        if (node.children) {
            for (let child of node.children) {
                count += calculateCount(child)
            }
        }

        node.count = count
        return count
    }

    const _removeEmpty = (node, parent, index) => {
        if (node.count === 0) {
            const arr = parent === null ? tree : parent.children
            arr.splice(index, 1)
        } else {
            if (node.children) {
                for (let i = node.children.length - 1; i >= 0; i--) {
                    _removeEmpty(node.children[i], node, i)
                }
            }
        }
    }

    for (let i = tree.length - 1; i >= 0; i--) {
        calculateCount(tree[i])
    }

    for (let i = tree.length - 1; i >= 0; i--) {
        _removeEmpty(tree[i], null, i)
    }

    return tree
}
