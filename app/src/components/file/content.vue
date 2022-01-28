<template>
  <el-container class="content-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        :to="{
          path: '/' + userId + '/contents/' + encodeURIComponent('/'),
        }"
        >根目录</el-breadcrumb-item
      >
      <el-breadcrumb-item
        v-for="(pos, index) in getPathArray()"
        :key="index"
        :to="{
          path:
            '/' +
            userId +
            '/contents/' +
            encodeURIComponent(
              '/' +
                getPathArray()
                  .slice(0, index + 1)
                  .join('/') +
                '/'
            ),
        }"
        >{{ pos }}</el-breadcrumb-item
      >
    </el-breadcrumb>
    <el-button-group class="btn-group-up">
      <el-button type="primary" @click="$router.push('/'+userId+'/upload')"
        >上传<i class="el-icon-upload el-icon--right"></i
      ></el-button>
      <el-button type="primary" icon="el-icon-circle-plus-outline" plain
        >新建</el-button
      >
      <el-button type="primary" icon="el-icon-edit">复制到...</el-button>
      <el-button type="primary" icon="el-icon-share">移动到...</el-button>
      <el-button type="danger" icon="el-icon-delete">删除</el-button>
    </el-button-group>
    <el-switch
      v-model="showHide"
      active-text="显示隐藏文件夹"
      class="show-hide-switch"
    >
    </el-switch>
    <el-table
      class="content-table"
      ref="multipleTable"
      :data="content"
      tooltip-effect="dark"
      style="width: 1200px"
      max-height="500"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'isDir', order: 'ascending' }"
      v-loading="contentLoading"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column
        prop="isDir"
        label="类型"
        width="100"
        :filters="[
          { text: '文件', value: 2 },
          { text: '文件夹', value: 1 },
        ]"
        :filter-method="filterHandler"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isDir === 1 ? 'primary' : 'success'"
            disable-transitions
            >{{ scope.row.isDir === 2 ? "文件" : "文件夹" }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="docName" label="文件名" width="500" sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.isDir === 2">{{ scope.row.docName }}</span>
          <el-button
            v-else
            type="text"
            size="small"
            @click="enterFolder(scope.row.docName)"
            >{{ scope.row.docName }}</el-button
          >
        </template>
      </el-table-column>
      <el-table-column prop="docSize" label="大小" width="100" sortable>
        <template slot-scope="scope">{{
          displaySize(scope.row.fileSize)
        }}</template>
      </el-table-column>
      <el-table-column
        prop="updateAt"
        label="修改日期"
        show-overflow-tooltip
        width="180"
        sortable
      >
        <template slot-scope="scope">{{ scope.row.updateAt }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="240">
        <template slot-scope="scope">
          <el-button type="text" size="small"> 复制 </el-button>
          <el-button type="text" size="small"> 移动 </el-button>
          <el-button
            @click.native.prevent="deleteRow(scope.$index, tableData)"
            type="text"
            size="small"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>
<script>
import ElUploader from "./upload/index.vue";
export default {
  data() {
    return {
      userId: "",
      queryInfo: {
        keyword: "",
      },
      content: [],
      multipleSelection: [], // 用户选中
      showHide: false, // 展示隐藏文件 & 文件夹
      contentLoading: true, // 是否正在载入
      uploadDialogVisible: false, // 展示上传对话框
      uploadFileList: [], // 上传文件列表
    };
  },
  created() {
    this.userId = window.sessionStorage.getItem("userId");
    this.getContentList();
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    $route: "getContentList",
    // 监听显示隐藏文件夹开关
    showHide: "getContentList",
  },
  methods: {
    displaySize(size) {
      if (size === 0 || !size) {
        return "";
      } else if (size < 1000) return String(size) + "B";
      else if (size > 1024 && size < 1048576)
        return String((size / 1024).toFixed(1)) + "KB";
      else if (size > 1048576 && size < 1073741824)
        return String((size / 1048576).toFixed(1)) + "MB";
      else return String((size / 1073741824).toFixed(1)) + "GB";
    },
    clearFilter() {
      this.$refs.contentTable.clearFilter();
    },
    filterHandler(value, row) {
      return row.isDir === value;
    },
    getPathString() {
      return decodeURIComponent(this.$route.params.path);
    },
    getPathArray() {
      var arr = this.getPathString(this.$route.params.path).split("/");
      console.log(arr.slice(1, arr.length), arr.length);
      return arr.slice(1, arr.length);
    },
    async getContentList() {
      await this.$http
        .get(this.userId + "/files", {
          params: { path: this.$route.params.path, show_hide: this.showHide },
        })
        .then((res) => {
          if (res.status !== 200)
            return this.$message.error("请求服务器异常，请重试!");
          else if (res.data !== null && "code" in res.data) {
            return this.$message.error(res.data.msg);
          } else {
            this.contentLoading = false;
            this.content = res.data.details;
          }
        });
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    enterFolder(docName) {
      var path = this.getPathString() + docName + "/";
      this.$router.push(
        "/" + this.userId + "/contents/" + encodeURIComponent(path)
      );
    },
  },
  mounted() {},
};
</script>
<style lang="less" scoped>
.btn-group-up {
  position: fixed;
  left: 230px;
  top: 110px;
}
.content-table {
  position: fixed;
  left: 230px;
  top: 170px;
}
.show-hide-switch {
  position: absolute;
  right: 100px;
  top: 120px;
}
</style>