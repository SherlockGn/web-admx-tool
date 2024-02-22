<template>
    <div>
        <el-row>
            <Title></Title>
        </el-row>
        <el-divider />
        <el-row>
            <Main></Main>
        </el-row>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    justify-content: center;
}

.padding {
    padding-left: 20px;
    padding-right: 20px;
}
</style>

<script setup>

const alive = ref(true)
const reload = () => {
    alive.value = false
    nextTick(() => {
        alive.value = true
    })
}

provide('reload', reload)

</script>
