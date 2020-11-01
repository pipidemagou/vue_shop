<template>
  <el-container class="home-container">
    <!--    头部区域-->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>Vue后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <!--    页面主体区域-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!--        折叠按钮条-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--          侧边栏菜单区-->
        <el-menu background-color="#393e46"
                 text-color="#fff"
                 active-text-color="#00adb5"
                 unique-opened
                 :collapse=this.isCollapse
                 :collapse-transition="false"
                 router
                 :default-active=activePath>
          <!--          一级菜单-->
          <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menuList">
            <!--            一级菜单模板区-->
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/'+subItem.path" :key="subItem.id" v-for="subItem in item.children"
                          @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <!--      右侧内容主体  -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data () {
    return {
      menuList: [],
      iconList: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠，默认不
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logOut: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
      return this.$message.success({
        message: '退出成功',
        center: true
      })
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$messsage.error(res.meta.msg)
      this.menuList = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存连接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
//撑满全屏
.home-container {
  height: 100%;
}

.el-header {
  background-color: #222831;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

.el-header div {
  display: flex;
  align-items: center;
}

.el > span {
  margin-left: 15px;
}

.el-header div img {
  width: 10%;
}

.el-aside {
  background-color: #393e46;
}

.el-menu {
  border-right: 0;
}

.el-main {
  background-color: #eeeeee;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
