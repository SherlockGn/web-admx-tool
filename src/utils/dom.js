export const download = (filename, data) => {
    const element = document.createElement('a')
    element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(data))
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
}

export const selectJson = async () => {
    let file
    try {
        file = await showOpenFilePicker({
            excludeAcceptAllOption: true,
            types: [
                {
                    accept: {
                        'application/json': ['.json']
                    }
                }
            ]
        })
    } catch {
        ElMessage.warning('The user has canceled the file selection.')
        return
    }

    const name = file[0].name
    const data = JSON.parse(await (await file[0].getFile()).text())

    return {
        name,
        data
    }
}
