<template>
  <div>
    Home组件
    <el-button type="info" @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logOut: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
      return this.$message.success({
        message: '退出成功',
        center: true
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
