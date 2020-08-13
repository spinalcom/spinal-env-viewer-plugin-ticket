<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title class="mdDialogTitle">Create Ticket
    </md-dialog-title>

    <md-dialog-content class="mdDialogContent">
      <!-- 
          <md-field>
            <label>Ticket name</label>
            <md-input v-model="ticket.name"
                      ref="nameTextField"></md-input>
          </md-field>

        <md-field>
          <label>Message</label>
          <md-textarea v-model="ticket.note"></md-textarea>
        </md-field>

        <md-field>
          <label>Urls</label>
          <md-textarea v-model="ticket.urls"></md-textarea>
          <span class="md-helper-text">Put one URL per line</span>
        </md-field>

        <div class="addPJ">
          <input type="file"
                 @change="addAttachments"
                 ref="attachments"
                 multiple
                 name="addPJ"
                 placeholder="Add Attachment">
        </div>
      -->

      <hr class="hr-text"
          data-content="Details">

      <div class="content details">
        <div class="left">

          <div class="detail"
               v-if="nodeInfo">
            <div class="label">Element</div>
            <div class="value">{{nodeInfo.name}}</div>
          </div>

          <div class="detail"
               v-if="commonTicketInfo">
            <div class="label">Title</div>
            <div class="value">{{commonTicketInfo.name}}</div>
          </div>

          <div class="detail"
               v-else-if="!commonTicketInfo">
            <md-field>
              <label>Ticket name</label>
              <md-input v-model="ticket.name"></md-input>
            </md-field>
          </div>

        </div>

        <!-- <div class="right">
          <div class="detail">
            <div class="label">Name</div>
            <div class="value">{{nodeInfo.name}}</div>
          </div>

          <div class="detail">
            <div class="label">Name</div>
            <div class="value">{{nodeInfo.name}}</div>
          </div>

        </div> -->

      </div>

      <hr class="hr-text"
          data-content="Priority">

      <div class="content priority">
        <md-radio v-model="ticket.priority"
                  :value="PRIORITY_DATA.occasionally"
                  class="md-primary">Occasionally</md-radio>

        <md-radio v-model="ticket.priority"
                  :value="PRIORITY_DATA.normal"
                  class="md-primary">Normal</md-radio>

        <md-radio v-model="ticket.priority"
                  :value="PRIORITY_DATA.urgent"
                  class="md-primary">Urgent</md-radio>
      </div>

      <hr class="hr-text"
          data-content="Notes">

      <div class="content notes">
        <!-- <md-field>
            <label>Message</label>
            <md-textarea v-model="ticket.note"></md-textarea>
          </md-field> -->

        <!-- <md-button class="icons md-icon-button md-raised md-primary"
                     @click="addPJ">
            <md-icon>attach_file</md-icon>
          </md-button> -->

        <div class="pj">

          <md-button class="md-dense md-primary"
                     @click="addPJ">
            <md-icon>attach_file</md-icon>
            ADD
          </md-button>

          <md-content class="pjDiv md-scrollbar"
                      v-if="messages.pj.length > 0">

            <attachment-component v-for="(file,index) in messages.pj"
                                  :key="index"
                                  :file="file"
                                  @remove="removePJ">{{file.name}}
            </attachment-component>
          </md-content>

          <md-content class="pjDiv empty"
                      v-else>
            No Attachment added
          </md-content>

        </div>

        <md-field>
          <label>Message</label>
          <md-textarea v-model="messages.note"></md-textarea>
        </md-field>

        <!-- <md-field class="myField">
              <label>Message</label>
              <md-input v-model="messages.note"></md-input>
            </md-field> -->
      </div>

      <!-- <div class="sendBtn">450px
              Send
              <md-icon>send</md-icon>
            </md-button>
          </div> -->

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>
      <md-button class="md-primary"
                 @click="closeDialog(true)"
                 :disabled="!(ticket.name.trim().length > 0)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";
import AttachmentComponent from "./components/attachment.vue";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { FileExplorer } from "spinal-env-viewer-plugin-documentation/service/fileSystemExplorer";
import { MESSAGE_TYPES } from "spinal-models-documentation";
import { SpinalServiceUser } from "spinal-service-user";

import { spinalIO } from "../../extensions/spinalIO";

export default {
  name: "createTicketDialog",
  props: ["onFinised"],
  components: {
    "attachment-component": AttachmentComponent,
  },
  data() {
    this.PRIORITY_DATA = TICKET_PRIORITIES;
    return {
      showDialog: true,
      contextId: undefined,
      processId: undefined,
      commonTicket: undefined,
      nodeInfo: undefined,
      commonTicketInfo: undefined,
      ticket: {
        name: "",
        objet: null,
        images: [],
        urls: "",
        priority: this.PRIORITY_DATA.occasionally,
        user: window.spinal.spinalSystem.getUser(),
      },
      messages: {
        note: "",
        pj: [],
      },
    };
  },
  methods: {
    async opened(option) {
      // this.autoFocusNameInput();
      this.contextId = option.contextId;
      this.processId = option.processId;
      this.nodeInfo = option.selectedNode.info.get();
      if (option.incidentId) {
        this.commonTicketInfo = SpinalGraphService.getInfo(
          option.incidentId
        ).get();
      }
      this.ticket.objet = new Ptr(option.selectedNode);
      this.ticket.user = await spinalIO.getUserConnected();
    },

    async removed(res) {
      if (res.closeResult) {
        // this.ticket.urls = this.ticket.urls.split("\n");
        // this.ticket.images = new Ptr(this.ticket.images);

        serviceTicketPersonalized
          .addTicket(this.ticket, this.processId, this.contextId, this.nodeId)
          .then((ticketId) => {
            const node = SpinalGraphService.getRealNode(ticketId);
            if (node) {
              this.addNote(node);
            }
          });
      }

      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, inputValue: this.inputValue });
      }
    },
    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },

    _getFileType(file) {
      const imagesExtension = [
        "JPG",
        "PNG",
        "GIF",
        "WEBP",
        "TIFF",
        "PSD",
        "RAW",
        "BMP",
        "HEIF",
        "INDD",
        "JPEG 2000",
        "SVG",
      ];
      const extension = /[^.]+$/.exec(file.name)[0];
      return imagesExtension.indexOf(extension.toUpperCase()) !== -1
        ? MESSAGE_TYPES.image
        : MESSAGE_TYPES.file;
    },

    addAttachments(event) {
      const files = event.target.files;
      this.ticket.images = files;
    },

    addPJ() {
      const maxSize = 25000000;
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.click();
      input.addEventListener(
        "change",
        (event) => {
          const files = event.target.files;
          let filelist = [];
          for (const file of files) {
            filelist.push(file);
          }
          filelist.push(...this.messages.pj);
          const sizes = filelist.map((el) => el.size);
          const filesSize = sizes.reduce((a, b) => a + b);
          if (filesSize > maxSize) {
            alert(
              "The selected file(s) is too large. The maximum size must not exceed 25 MB"
            );
            return;
          }
          this.messages.pj = filelist;
        },
        false
      );
    },

    removePJ(file) {
      this.messages.pj = this.messages.pj.filter((el) => el.name !== file.name);
    },

    async addNote(ticketNode) {
      await this.addFilesNote(ticketNode);

      if (this.messages.note.trim().length === 0) return;
      await this._sendNote(ticketNode, this.messages.note);
    },

    _sendNote(node, message, type, path) {
      serviceDocumentation
        .addNote(
          node,
          {
            username: window.spinal.spinalSystem.getUser().username,
            userId: FileSystem._user_id,
          },
          message,
          type,
          path
        )
        .then((result) => {
          // serviceDocumentation.linkNoteToGroup(
          //   this.noteContextSelected.id,
          //   this.noteGroupSelected.id,
          //   result.getId().get()
          // );
        });
    },

    async addFilesNote(ticketNode) {
      if (this.messages.pj.length === 0) return;

      const promises = this.messages.pj.map(async (file) => {
        return {
          file: file,
          directory: await this._getOrCreateFileDirectory(ticketNode),
        };
      });
      return Promise.all(promises).then((res) => {
        return res.map((data) => {
          const type = this._getFileType(data.file);
          let files = FileExplorer.addFileUpload(data.directory, [data.file]);
          let file = files.length > 0 ? files[0] : undefined;
          this._sendNote(ticketNode, data.file.name, type, file);
        });
      });
    },

    async _getOrCreateFileDirectory(node) {
      let directory = await FileExplorer.getDirectory(node);
      if (!directory) {
        directory = await FileExplorer.createDirectory(node);
      }
      return directory;
    },
  },
  watch: {
    commonTicketInfo() {
      if (this.commonTicketInfo && this.commonTicketInfo.name)
        this.ticket.name = this.commonTicketInfo.name;
    },
  },
};
</script>

<style scoped lang="scss">
.mdDialogContainer {
  width: 450px;
  height: 600px;
  // display: flex;
}

.mdDialogContainer .mdDialogTitle {
  text-align: center;
  // margin: 0px !important;
}

.mdDialogContainer .mdDialogContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mdDialogContainer .mdDialogContent .content.details {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .content.details .left,
.mdDialogContainer .mdDialogContent .content.details .right {
  width: 100%;
  height: 100%;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .content.details .detail {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .content.details .detail .value {
  color: #818078;
}

.mdDialogContainer .mdDialogContent .content.priority {
  width: 100%;
  height: 15%;
  display: flex;
  justify-content: center;
}

.mdDialogContainer .mdDialogContent .content.notes {
  width: 100%;
  height: 45%;
}

.mdDialogContainer .mdDialogContent .content.notes .pj {
  width: 100%;
  height: calc(100% - 110px);
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .content.notes .pj .pjDiv {
  width: 60%;
  border: 1px dashed gray;
  background: transparent;
  overflow: auto;
}

.mdDialogContainer .mdDialogContent .content.notes .pj .pjDiv.empty {
  display: flex;
  justify-content: center;
  align-items: center;
}

// .mdDialogContainer  .notes {
//   width: 100%;
//   // height: 100%;
//   display: flex;
// }

// .mdDialogContainer .dialogForm .notes .icons {
//   flex: 0 0 25px;
//   display: flex;
//   align-items: flex-end;
//   align-self: flex-end;
//   border-radius: 20%;
// }
// .mdDialogContainer .dialogForm .notes .messageForm {
//   flex: 1 1 calc(85% - 25px);
//   display: flex;
//   flex-direction: column;
// }
// .mdDialogContainer .dialogForm .notes .messageForm .pjDiv {
//   height: 40px;
//   background: transparent;
//   overflow: auto;
// }
// .mdDialogContainer .dialogForm .notes .messageForm .pjDiv p {
//   margin: 0px;
// }
// .mdDialogContainer .dialogForm .notes .messageForm .myField {
//   flex: 1 1 auto;
//   margin: 0px !important;
//   min-height: unset !important;
//   height: calc(100% - 40px);
// }
// .mdDialogContainer .dialogForm .notes .sendBtn {
//   flex: 1 1 15%;
//   display: flex;
//   align-items: flex-end;
// }

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: white;
  text-align: center;
  height: 1.5em;
  // opacity: 0.5;
  &:before {
    content: "";
    // use the linear-gradient for the fading effect
    // use a solid background color for a solid bar
    // background: linear-gradient(to right, transparent, #818078, transparent);
    background: #818078;
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: white;

    padding: 0 0.5em;
    line-height: 1.5em;
    // this is really the only tricky part, you need to specify the background color of the container element...
    // color: #818078;
    color: #818078;
    text-transform: uppercase;
    font-size: 1em;
    background: #424242;
    // background-color: #fcfcfa;
  }
}
</style>