<template>
  <el-container class="content-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        :to="{
          path: '/home/contents/' + encodeURIComponent('/'),
        }"
        >根目录</el-breadcrumb-item
      >
      <el-breadcrumb-item
        v-for="(pos, index) in getPathArray()"
        :key="index"
        :to="{
          path:
            '/home' +
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
      <el-button
        type="primary"
        icon="el-icon-upload"
        @click="uploadDialogVisible = true"
        >上传</el-button
      >
      <el-button type="primary" icon="el-icon-folder-add" @click="mkdir()"
        >新建</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-download"
        plain
        :disabled="multipleSelection.length === 0"
        >下载</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-copy-document"
        plain
        @click="copyMulDialogVisible = true"
        :disabled="multipleSelection.length === 0"
        >复制到...</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-thumb"
        plain
        @click="moveMulDialogVisible = true"
        :disabled="multipleSelection.length === 0"
        >移动到...</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-open"
        plain
        @click="setHiddenDocInBatch(1)"
        :disabled="multipleSelection.length === 0"
        >设为隐藏</el-button
      >
      <el-button
        type="primary"
        icon="el-icon-turn-off"
        plain
        @click="setHiddenDocInBatch(2)"
        :disabled="multipleSelection.length === 0"
        >取消隐藏</el-button
      >
      <el-button
        type="danger"
        icon="el-icon-delete"
        @click="moveToRecycleBinInBatch()"
        :disabled="multipleSelection.length === 0"
        >删除</el-button
      >
    </el-button-group>
    <el-switch
      v-model="showHide"
      active-text="显示隐藏文件夹"
      class="show-hide-switch"
    >
    </el-switch>
    <el-table
      :key="contentTableKey"
      class="content-table"
      ref="multipleTable"
      :data="content"
      tooltip-effect="dark"
      style="width: 1200px"
      max-height="550"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'isDir', order: 'ascending' }"
      @row-dblclick="handleFilePreview"
      v-loading="contentLoading"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column
        prop="isDir"
        label="类型"
        width="70"
        :filters="[
          { text: '文件', value: 2 },
          { text: '文件夹', value: 1 },
        ]"
        :filter-method="filterHandler"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <span style="font-size: 16px">
            <i
              v-if="scope.row.isDir === 1"
              class="el-icon-folder-opened el-icon--right"
            ></i>
            <i v-else class="el-icon-document el-icon--right"></i>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="docName" label="文件名" width="500" sortable>
        <template slot-scope="scope">
          <span v-if="scope.row.isDir === 2" style="font-size: 14px">{{
            scope.row.docName
          }}</span>
          <el-button
            v-else
            type="text"
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
          <div class="op-group">
            <el-button
              type="text"
              size="small"
              @click="showCopyDialog(scope.row)"
            >
              复制
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="showMoveDialog(scope.row)"
            >
              移动
            </el-button>
            <el-dropdown class="op-more" placement="bottom">
              <span class="el-dropdown-link">
                &nbsp;&nbsp;&nbsp;&nbsp;<i
                  class="el-icon-arrow-down el-icon--right"
                ></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="download(scope.row)"
                  >下载</el-dropdown-item
                >
                <el-dropdown-item @click.native="rename(scope.row.docId)"
                  >重命名</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="moveToRecycleBin([scope.row.docId])"
                  >删除</el-dropdown-item
                >
                <el-dropdown-item
                  divided
                  @click.native="setHiddenDoc([scope.row.docId], 1)"
                  >设为隐藏</el-dropdown-item
                >
                <el-dropdown-item
                  @click.native="setHiddenDoc([scope.row.docId], 2)"
                  >取消隐藏</el-dropdown-item
                >
                <el-dropdown-item
                  divided
                  @click.native="showCreateShareDialog(scope.row)"
                  >分享</el-dropdown-item
                >
                <el-dropdown-item disabled>面对面分享</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 以下是对话框 -->
    <!--  -->
    <!-- 复制提示对话框 -->
    <!--  -->
    <el-dialog
      name="single-copy-dialog"
      title="复制"
      :visible.sync="copyDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="copyToPath"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="multiple-copy-dialog"
      title="复制"
      :visible.sync="copyMulDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="copyToPathInBatch"
      >
      </el-tree>
    </el-dialog>
    <!--  -->
    <!-- 移动文件提示对话框 -->
    <!--  -->
    <el-dialog
      name="single-move-dialog"
      title="移动"
      :visible.sync="moveDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="moveToPath"
      >
      </el-tree>
    </el-dialog>
    <el-dialog
      name="multiple-move-dialog"
      title="移动"
      :visible.sync="moveMulDialogVisible"
      width="40%"
      :before-close="handleDialogClose"
    >
      <el-tree
        :props="tree.defaultProps"
        :load="loadNode"
        node-key="id"
        lazy
        @node-click="moveToPathInBatch"
      >
      </el-tree>
    </el-dialog>
    <!--  -->
    <!-- 上传对话框 -->
    <!--  -->
    <el-dialog
      name="upload-dialog"
      title="上传文件"
      :visible.sync="uploadDialogVisible"
      width="30%"
      :before-close="handleDialogClose"
    >
      <!-- 上传组件 -->
      <el-upload
        class="upload-demo"
        ref="upload"
        action=""
        :auto-upload="false"
        drag
        :show-file-list="false"
        :on-change="handleUploadChange"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
        :limit="1"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div v-if="isFileSelected">
        <el-progress
          :text-inside="true"
          :stroke-width="18"
          :percentage="uploadPercent"
        ></el-progress>
      </div>
    </el-dialog>
    <!--  -->
    <!-- 创建分享对话框 -->
    <!--  -->
    <el-dialog
      name="create-share-dialog"
      :title="'为' + singleSelection.docName + '创建分享'"
      :visible.sync="createShareDialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-form :inline="true" :model="share" class="create-share-form">
        <el-form-item label="分享者">
          <el-input v-model="userId" placeholder="上传用户" readonly></el-input>
        </el-form-item>
        <el-form-item label="有效时长">
          <el-input
            v-model="share.expireVal"
            class="input-with-select"
            style="width: 160px"
          >
            <el-select
              v-model="share.expireUnit"
              slot="append"
              placeholder="天"
              style="width: 60px"
            >
              <el-option label="时" value="1"></el-option>
              <el-option label="天" value="2"></el-option>
              <el-option label="周" value="3"></el-option>
              <el-option label="月" value="4"></el-option>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createShare()">创建</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--  -->
    <!-- 生成分享成功对话框 -->
    <!--  -->
    <el-dialog
      name="create-share-success-dialog"
      title="提示"
      :visible.sync="createShareSuccessDialogVisible"
      width="50%"
      :before-close="handleDialogClose"
    >
      <el-skeleton :rows="3" animated v-if="createShareLoading" />
      <div v-else>
        <el-result
          icon="success"
          title="创建分享成功"
          subTitle="您可以点击下方按钮复制分享链接与提取码"
        ></el-result>
        <el-form :model="share" class="create-share-success-form">
          <el-form-item label="分享链接">
            <el-input v-model="share.url" readonly></el-input>
          </el-form-item>
          <el-form-item label="提取码">
            <el-input v-model="share.password" readonly></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="info" @click="copyShareToClipboard()"
              >一键复制分享链接</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import SparkMD5 from "spark-md5";
import fileDownload from "js-file-download";
import { Base64 } from "js-base64";

export default {
  data() {
    return {
      userId: "",
      queryInfo: {
        keyword: "",
      },
      content: [],
      contentTableKey: null,
      singleSelection: {},
      multipleSelection: [], // 用户选中
      showHide: false, // 展示隐藏文件 & 文件夹
      contentLoading: true, // 是否正在载入
      createShareLoading: true, // 创建分享响应加载
      // 对话框显示控制
      copyDialogVisible: false,
      copyMulDialogVisible: false,
      moveDialogVisible: false,
      moveMulDialogVisible: false,
      createShareDialogVisible: false,
      createShareSuccessDialogVisible: false,
      // 分享相关
      share: {
        expireVal: 7,
        expireUnit: "2",
        token: "",
        password: "",
        url: "",
      },
      // 树形控件
      tree: {
        defaultProps: {
          label: "docName",
          isLeaf: (data, node) => {
            return data.isDir === 1 ? false : true;
          },
          children: "children",
        },
      },
      // 上传相关
      uploadDialogVisible: false, // 展示上传对话框
      isFileSelected: false,
      uploadPercent: 0,
      fileList: [],
      chunkSize: 1024 * 1024 * 50, // 分块大小：50Mb
    };
  },
  created() {
    this.userId = window.localStorage.getItem("userId");
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
      var arr = this.getPathString().split("/");
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
            this.contentTableKey = Math.random();
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
      this.$router.push("/home/contents/" + encodeURIComponent(path));
    },
    handleFilePreview(row) {
      if (row.isDir === 1) {
        return;
      }
      var originUrl = "https://easydisk.top/api/v1/file/download?uniFileId=" + row.uniFileId + '&fullfilename=' + row.docName; //要预览文件的访问地址
      window.open(
        "http://easydisk.top:8012/onlinePreview?url=" +
          encodeURIComponent(originUrl)
      );
    },
    showCopyDialog(data) {
      this.copyDialogVisible = true;
      this.singleSelection = data;
    },
    showMoveDialog(data) {
      this.moveDialogVisible = true;
      this.singleSelection = data;
    },
    showCreateShareDialog(data) {
      this.createShareDialogVisible = true;
      this.singleSelection = data;
    },
    async createShare() {
      this.createShareDialogVisible = false;
      this.createShareSuccessDialogVisible = true;
      this.createShareLoading = true;
      const data = {
        userId: this.userId,
        docId: this.singleSelection.docId,
        expireHour: this.convertExpireVal(),
      };
      await this.$http.post("files/create-share", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.share.token = res.data.token;
          this.share.password = res.data.password;
          this.share.url = "https://easydisk.top/share/" + res.data.token;
          this.createShareLoading = false;
        }
      });
    },
    convertExpireVal() {
      const val = parseInt(this.share.expireVal);
      switch (this.share.expireUnit) {
        case "1":
          return val;
        case "2":
          return val * 24;
        case "3":
          return val * 24 * 7;
        case "4":
          return val * 24 * 30;
      }
    },
    copyShareToClipboard() {
      navigator.clipboard.writeText(
        this.userId +
          "给你分享了一个文件" +
          "，快打开看看吧！" +
          "链接：" +
          this.share.url +
          "，提取码：" +
          this.share.password
      );
      this.$message.success("复制成功！");
    },
    download(doc) {
      const params = {
        uniFileId: doc.uniFileId,
      };
      this.$http
        .get("file/download", {
          params: params,
          responseType: "blob",
        })
        .then((res) => {
          fileDownload(res.data, doc.docName);
        });
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        this.$http
          .get(this.userId + "/files", {
            params: { path: "/", show_hide: true },
          })
          .then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              resolve(res.data.details);
            }
          });
      } else {
        if (node.data !== null) {
          this.$http
            .get(this.userId + "/files", {
              params: {
                path: node.data.docPath + node.data.docName + "/",
                showHide: 1,
              },
            })
            .then((res) => {
              if (res.status !== 200) {
                return this.$message.error("服务器异常，请重试!");
              } else if (res.data !== null && "code" in res.data) {
                return this.$message.error(res.data.msg);
              } else if (res.data !== null) {
                resolve(res.data.details);
              }
            });
        }
      }
    },
    setHiddenDoc(docIds, hideStatus) {
      const data = {
        userId: this.userId,
        ids: docIds,
        hideStatus: hideStatus,
      };
      this.$http.post("files/set-hidden", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 20201) {
            return this.$message.warn("参数错误，请检查输入或刷新重试");
          } else if (res.data.code === 20202) {
            return this.$message.error(
              "修改数目与实际传入数不符，请再次检查文件列表"
            );
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          this.getContentList();
          return this.$message.success("设置成功!");
        }
      });
    },
    setHiddenDocInBatch(hideStatus) {
      this.$confirm("确认更改所有选中的隐藏状态吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const data = {
            userId: this.userId,
            ids: ids,
            hideStatus: hideStatus,
          };
          this.$http.post("files/set-hidden", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "修改数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("设置成功!");
            }
          });
        })
        .catch(() => {});
    },
    rename(docId) {
      this.$prompt("请输入新名字: ", "重命名", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          const data = {
            userId: this.userId,
            id: docId,
            newName: value,
            overwrite: 2, // 不覆盖
          };
          this.$http.post("files/rename", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("修改名字成功!");
            }
          });
        })
        .catch(() => {});
    },
    mkdir() {
      this.$prompt("请输入文件夹名: ", "在当前路径下创建文件夹", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          const data = {
            userId: this.userId,
            path: this.$route.params.path,
            dirName: value,
            overwrite: 2, // 不覆盖
          };
          this.$http.post("files/mkdir", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("创建新文件夹成功!");
            }
          });
        })
        .catch(() => {});
    },
    moveToPath(data, node, item) {
      this.$confirm("将该文件或文件夹移动到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: [this.singleSelection.docId],
            overwrite: 2,
          };
          this.$http.post("files/move", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.moveDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功移动至选定路径!");
            }
          });
        })
        .catch(() => {});
    },
    moveToPathInBatch(data, node, item) {
      this.$confirm("将所选文件或文件夹移动到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: ids,
            overwrite: 2,
          };
          this.$http.post("files/move", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.moveMulDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功移动至选定路径!");
            }
          });
        })
        .catch(() => {});
    },
    copyToPath(data, node, item, params) {
      this.$confirm("将该文件或文件夹复制到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: [this.singleSelection.docId],
            overwrite: 2,
          };
          this.$http.post("files/copy", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.copyDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功复制!");
            }
          });
        })
        .catch(() => {});
    },
    copyToPathInBatch(data, node, item) {
      this.$confirm("将所选文件或文件夹复制到所选路径下吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const postdata = {
            userId: this.userId,
            path: data.docPath + data.docName + "/",
            ids: ids,
            overwrite: 2,
          };
          this.$http.post("files/copy", postdata).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10105) {
                return this.$message.error("路径不存在！请刷新重试");
              } else if (res.data.code === 10106) {
                return this.$message.error("已存在同名文件或文件夹！");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.copyMulDialogVisible = false;
              this.getContentList();
              return this.$message.success("已成功复制!");
            }
          });
        })
        .catch(() => {});
    },
    moveToRecycleBin(docIds) {
      this.$confirm(
        "删除该文件将把文件放入回收站中，我们最多可以为您保存七天, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          const data = {
            userId: this.userId,
            ids: docIds,
          };
          this.$http.post("files/recycle", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "删除数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("已成功删除!");
            }
          });
        })
        .catch(() => {});
    },
    moveToRecycleBinInBatch() {
      this.$confirm(
        "删除选中文件将把其放入回收站中，我们最多可以为您保存七天, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          let ids = this.multipleSelection.map((a) => a.docId);
          const data = {
            userId: this.userId,
            ids: ids,
          };
          this.$http.post("files/recycle", data).then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 20201) {
                return this.$message.warn("参数错误，请检查输入或刷新重试");
              } else if (res.data.code === 20202) {
                return this.$message.error(
                  "删除数目与实际传入数不符，请再次检查文件列表"
                );
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null) {
              this.getContentList();
              return this.$message.success("已成功删除!");
            }
          });
        })
        .catch(() => {});
    },
    removeDoc(docIds) {
      const data = {
        userId: this.userId,
        ids: docIds,
      };
      this.$http.post("files/delete", data).then((res) => {
        if (res.status !== 200) {
          return this.$message.error("服务器异常，请重试!");
        } else if (res.data !== null && "code" in res.data) {
          if (res.data.code === 20201) {
            return this.$message.warn("参数错误，请检查输入或刷新重试");
          } else if (res.data.code === 20202) {
            return this.$message.error(
              "删除数目与实际传入数不符，请再次检查文件列表"
            );
          }
          return this.$message.error(res.data.msg);
        } else if (res.data !== null) {
          return this.$message.success("已成功删除!");
        }
      });
      this.getContentList();
    },
    //
    // 上传相关
    handleDialogClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    async handleUploadChange(file, fileList) {
      if (!file) return;
      console.log(file);
      this.isFileSelected = true;
      // 获取文件并转成 ArrayBuffer 对象
      const fileObj = file.raw;
      let buffer;
      try {
        buffer = await this.fileToBuffer(fileObj);
      } catch (e) {
        console.log(e);
      }
      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(buffer);
      const md5 = spark.end();
      const formHeader = { "Content-Type": "multipart/form-data" };
      // 低于50mb直接一次上传
      if (fileObj.size < this.chunkSize) {
        const formData = new FormData();
        formData.append("user_id", this.userId);
        formData.append("md5", md5);
        formData.append("file", fileObj);
        await this.$http
          .post("file/upload", formData, {
            header: formHeader,
          })
          .then((res) => {
            if (res.status !== 200) {
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              if (res.data.code === 10109) {
                return this.$message.info("已存在相同文件，请勿重复上传");
              }
              return this.$message.error(res.data.msg);
            } else if (res.data !== null && "file_id" in res.data) {
              this.uploadPercent = 100;
              return this.$message.success("上传成功!");
            }
          });
        return;
      }
      // 将文件按固定大小（50M）进行切片，注意此处同时声明了多个常量
      const chunkList = []; // 保存所有切片的数组
      const chunkListLength = Math.ceil(fileObj.size / this.chunkSize); // 计算总共多个切片
      // 发送探测请求
      var nextIdx = 0;
      const testData = new FormData();
      testData.append("user_id", this.userId);
      testData.append("md5", md5);
      testData.append("file_name", file.name);
      testData.append("chunk_size", this.chunkSize);
      testData.append("chunk_num", chunkListLength);
      var continueUpload = false;
      await this.$http
        .post("file/mp-upload-test", testData, { header: formHeader })
        .then((res) => {
          if (res.status !== 200) {
            return this.$message.error("服务器异常，请重试!");
          } else if (res.data !== null && "code" in res.data) {
            if (res.data.code === 10109) {
              return this.$message.info("已存在相同文件，请勿重复上传");
            }
            return this.$message.error(res.data.msg);
          } else if (res.data !== null && "file_id" in res.data) {
            this.uploadPercent = 100;
            return this.$message.success("已成功秒传!");
          } else if (res.data !== null && "next_idx" in res.data) {
            continueUpload = true;
            nextIdx = parseInt(res.data.next_idx);
          } else {
            return this.$message.error("服务器内部错误");
          }
        });
      if (!continueUpload) return;
      // 生成切片
      let curChunk = 0; // 切片时的初始位置
      for (let i = 0; i < chunkListLength; i++) {
        const item = {
          file: fileObj.slice(curChunk, curChunk + this.chunkSize),
          md5: md5,
          chunk_id: i,
          userId: this.userId,
        };
        curChunk += this.chunkSize;
        chunkList.push(item);
      }
      const uploadData = new FormData();
      uploadData.append("user_id", this.userId);
      uploadData.append("md5", md5);
      uploadData.append("chunk_id", nextIdx);
      uploadData.append("file", chunkList[nextIdx].file);
      // 分多次发送请求，使用flag来控制循环结束
      var flag = true;
      var fusion = 0;
      while (nextIdx < chunkListLength) {
        console.log(uploadData);
        await this.$http
          .post("file/mp-upload", uploadData, { header: formHeader })
          .then((res) => {
            if (res.status !== 200) {
              flag = false;
              return this.$message.error("服务器异常，请重试!");
            } else if (res.data !== null && "code" in res.data) {
              flag = false;
              return this.$message.error(res.data.msg);
            } else if (res.data !== null && "next_idx" in res.data) {
              fusion++;
              nextIdx = parseInt(res.data.next_idx);
              this.uploadPercent = Math.floor(
                (nextIdx / chunkListLength) * 100
              );
              uploadData.set("chunk_id", nextIdx);
              uploadData.set("file", chunkList[nextIdx].file);
            } else if (res.data !== null && "file_id" in res.data) {
              flag = false;
              this.uploadPercent = 100;
              return this.$message.success("文件已成功上传!");
            } else {
              flag = false;
              return this.$message.error("服务器内部错误");
            }
          });
        if (!flag || fusion >= chunkListLength) break;
      }
    },
    // 将 File 对象转为 ArrayBuffer
    fileToBuffer(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = (e) => {
          resolve(e.target.result);
        };
        fr.readAsArrayBuffer(file);
        fr.onerror = () => {
          reject(new Error("转换文件格式发生错误"));
        };
      });
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了       ${files.length + fileList.length} 个文件`
      );
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
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
.op-more {
  font-size: 12px;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
/deep/.el-input-group__append {
  background-color: #fff;
}
</style>