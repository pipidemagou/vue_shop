<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList">
        <!--        展开-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--            栅格布局 一行分为24格-->
            <el-row :class="['bdbottom',index01===0?'bdtop':'','vcenter']" :key=index01
                    v-for="(item01,index01) in scope.row.children">
              <!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item01.id)">{{ item01.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!--              渲染二级权限-->
              <el-col :span="19">
                <el-row :class="[index02===0?'':'bdtop','vcenter']" :key=index02
                        v-for="(item02,index02) in item01.children">
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="removeRightById(scope.row,item02.id)">{{ item02.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--                  渲染三级权限-->
                  <el-col :span="18">
                    <el-tag type="warning" :class="[index03===0?'':'bdtop']" :key=index03
                            v-for="(item03,index03) in item02.children" closable
                            @close="removeRightById(scope.row,item03.id)">
                      {{ item03.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>
            </pre>
          </template>
        </el-table-column>
        <!--        索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!--         node-key="id",选中的本质是id而不是authName-->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色数据
      rolesList: [],
      // 分配权限对话框显示or隐藏
      setRightDialogVisible: false,
      // 权限数据
      rightsList: [],
      // 树形控件的属性绑定
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defaultKeys: [],
      // 当前分配权限角色的id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取全部角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取权限列表失败！',
          center: true
        })
      }
      this.rolesList = res.data
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightId) {
      await this.$messagebox.confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '权限删除失败！',
            center: true
          })
        }
        // 响应的结果是最新的权限数据
        role.children = res.data
        this.$message.success({
          message: '权限删除成功!',
          center: true
        })
      }).catch(() => {
        this.$message.info({
          message: '已取消权限删除',
          center: true
        })
      })
    },
    // 显示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取全部权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取权限数据失败!',
          center: true
        })
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defaultKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的方式，获取三级权限的id,保存到defaultKeys
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭对话框就清空默认选中的节点id值的数组
    setRightDialogClosed () {
      this.defaultKeys = []
    },
    // 分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        this.$message.error({
          message: '分配权限数据失败!',
          center: true
        })
      } else {
        this.$message.success({
          message: '分配权限数据成功!',
          center: true
        })
      }
      await this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;

}

//第一，第二权限居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
