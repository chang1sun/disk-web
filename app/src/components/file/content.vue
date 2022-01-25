<template>
  <el-container class="content-container">
    <el-head class="content-header" name="content-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          :to="{
            path: '/',
          }"
          >根目录</el-breadcrumb-item
        >
        <el-breadcrumb-item
          v-for="(pos, index) in getPathArray()"
          :key="index"
          :to="{
            path:
              userId +
              '/content/' +
              encodeURIComponent(
                '/' + getPathArray().slice(0, index).join('/') + '/'
              ),
          }"
          >{{ pos }}</el-breadcrumb-item
        >
      </el-breadcrumb>
      <el-button type="primary" icon="el-icon-edit"></el-button>
      <el-button type="primary" icon="el-icon-share"></el-button>
      <el-button type="primary" icon="el-icon-delete"></el-button>
      <el-button type="primary" icon="el-icon-search">搜索</el-button>
      <el-button type="primary"
        >上传<i class="el-icon-upload el-icon--right"></i
      ></el-button>
    </el-head>
    <el-main class="content-main"> </el-main>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      userId: window.sessionStorage.getItem("userId"),
      currentPath: "/",
      queryInfo: {
        keyword: "",
      },
      content: [],
      showHide: false, // 展示隐藏文件 & 文件夹
    };
  },
  methods: {
    getPathArray() {
      var arr = this.currentPath.split("/");
      return arr.slice(1, arr.length);
    },
    async getContentList() {
      await this.$http
        .get(this.userId + "/files", {
          params: { path: this.currentPath, showHide: this.showHide },
        })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else {
            this.content = res.data.details;
          }
        });
    },
  },
};
</script>