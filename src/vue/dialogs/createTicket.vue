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
      <div class="normalContent"
           v-if="pageSelected === PAGES.normal">
        <div class="content details">

          <div>
            <hr class="hr-text"
                data-content="Details">
          </div>

          <div class="left">

            <div class="detail"
                 v-if="commonTicketInfo">
              <div class="label">Title</div>
              <div class="value"
                   v-tooltip="commonTicketInfo.name">{{commonTicketInfo.name}}
              </div>
            </div>

            <div class="detail"
                 v-else-if="!commonTicketInfo">
              <md-field>
                <label>Ticket name</label>
                <md-input v-model="ticket.name"></md-input>
              </md-field>
            </div>

            <div class="detail"
                 v-if="nodeInfo">
              <div class="label">Element</div>
              <div class="value"
                   v-tooltip="nodeInfo.name">{{nodeInfo.name}}</div>
            </div>

          </div>

        </div>

        <div class="content priority">

          <div>
            <hr class="hr-text"
                data-content="Priority">
          </div>

          <div class="priorityRadio">
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

        </div>

        <div class="content notes">
          <hr class="hr-text"
              data-content="Notes">

          <div class="pj">

            <md-button class="md-dense md-primary"
                       @click="addPJ">
              <md-icon>attach_file</md-icon>
              ADD
            </md-button>

            <md-content class="pjDiv md-scrollbar"
                        v-if="ticket.pj.length > 0">

              <attachment-component v-for="(file,index) in ticket.pj"
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
            <md-textarea v-model="ticket.description"></md-textarea>
          </md-field>

        </div>
      </div>

      <div class="responseContent"
           v-else>
        <md-progress-spinner md-mode="indeterminate"
                             v-if="pageSelected === PAGES.loading">
        </md-progress-spinner>

        <md-icon v-else
                 class="md-size-5x">{{icon}}</md-icon>
      </div>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>
      <md-button class="md-primary"
                 @click="createTicket"
                 :disabled="!(ticket.name.trim().length > 0)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";
import AttachmentComponent from "./components/attachment.vue";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { spinalIO } from "../../extensions/spinalIO";
import { TICKET_EVENTS } from "../../extensions/ticketsEvents";
import EventBus from "../../extensions/Event";

export default {
  name: "createTicketDialog",
  props: ["onFinised"],
  components: {
    "attachment-component": AttachmentComponent,
  },
  data() {
    this.PRIORITY_DATA = TICKET_PRIORITIES;
    this.PAGES = {
      normal: 0,
      loading: 1,
      success: 2,
      error: 3,
    };

    return {
      pageSelected: this.PAGES.normal,
      showDialog: true,
      contextId: undefined,
      processId: undefined,
      commonTicket: undefined,
      nodeInfo: undefined,
      commonTicketInfo: undefined,
      ticket: {
        name: "",
        // elementSelected: null,
        description: "",
        pj: [],
        priority: this.PRIORITY_DATA.occasionally,
        user: {},
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
      // this.ticket.elementSelected = new Ptr(option.selectedNode);
      const user = await spinalIO.getUserConnected();
      // console.log("user", user);
      this.ticket.user.username = user.name;
      this.ticket.userId = user.id;
    },

    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, inputValue: this.inputValue });
      }
    },

    async removed(res) {
      if (res.closeResult) {
        // this.ticket.urls = this.ticket.urls.split("\n");
        // this.ticket.images = new Ptr(this.ticket.images);
      }

      this.showDialog = false;
    },

    createTicket() {
      // console.log(this.ticket);
      this.pageSelected = this.PAGES.loading;
      serviceTicketPersonalized
        .addTicket(
          this.ticket,
          this.processId,
          this.contextId,
          this.nodeInfo.id
        )
        .then((ticketId) => {
          const node = SpinalGraphService.getRealNode(ticketId);
          if (node) {
            EventBus.$emit(TICKET_EVENTS.created, node.info.get());
            this.pageSelected = this.PAGES.success;
            //  this.addNote(node);
          }
        })
        .catch(() => (this.pageSelected = this.PAGES.error));
    },

    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
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
          filelist.push(...this.ticket.pj);
          const sizes = filelist.map((el) => el.size);
          const filesSize = sizes.reduce((a, b) => a + b);
          if (filesSize > maxSize) {
            alert(
              "The selected file(s) is too large. The maximum size must not exceed 25 MB"
            );
            return;
          }
          this.ticket.pj = filelist;
        },
        false
      );
    },

    removePJ(file) {
      this.ticket.pj = this.ticket.pj.filter((el) => el.name !== file.name);
    },
  },
  computed: {
    icon() {
      switch (this.pageSelected) {
        case this.PAGES.success:
          return "check";
        case this.PAGES.error:
          return "error_outline";
      }
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
  padding: 0 24px 0 24px !important;
}

.mdDialogContainer .mdDialogContent .normalContent,
.mdDialogContainer .mdDialogContent .responseContent {
  width: 100%;
  height: 100%;
}

.mdDialogContainer .mdDialogContent .responseContent {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .normalContent .content.details {
  width: 100%;
  height: 25%;
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .normalContent .content.details .left,
.mdDialogContainer .mdDialogContent .normalContent .content.details .right {
  width: 100%;
  height: 100%;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .normalContent .content.details .detail {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer
  .mdDialogContent
  .normalContent
  .content.details
  .detail
  .label {
  width: 30%;
  // color: #818078;
}

.mdDialogContainer
  .mdDialogContent
  .normalContent
  .content.details
  .detail
  .value {
  width: 69%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #818078;
}

.mdDialogContainer .mdDialogContent .normalContent .content.priority {
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column;
  // justify-content: center;
}

.mdDialogContainer
  .mdDialogContent
  .normalContent
  .content.priority
  .priorityRadio {
  height: calc(100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .normalContent .content.notes {
  width: 100%;
  height: 55%;
}

.mdDialogContainer .mdDialogContent .normalContent .content.notes .pj {
  width: 100%;
  height: 30%;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .normalContent .content.notes .pj .pjDiv {
  width: 60%;
  border: 1px dashed gray;
  background: transparent;
  overflow: auto;
}

.mdDialogContainer
  .mdDialogContent
  .normalContent
  .content.notes
  .pj
  .pjDiv.empty {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: white;
  text-align: center;
  height: 1.5em;
  &:before {
    content: "";
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
    color: #818078;
    text-transform: uppercase;
    font-size: 1em;
    background: #424242;
  }
}
</style>
