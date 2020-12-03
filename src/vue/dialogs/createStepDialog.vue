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
  <md-dialog :md-active.sync="showDialog"
             class="stepDialogContainer"
             @md-closed="closeDialog(false)">
    <form class="dialogForm"
          @submit.prevent="closeDialog(true)">
      <md-dialog-title>Create Ticket Step</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>Step name</label>
          <md-input ref="nameTextField"
                    v-model="step.name"></md-input>
        </md-field>

        <!-- <md-field>
          <label>Step Order</label>
          <md-input v-model="step.order"
                    type="number"></md-input>
          <span class="md-helper-text md-primary">The first step index is
            0</span>
        </md-field> -->

        <div class="order_div md-layout md-gutter">
          <span class="md-layout-item md-size-20 md-caption insert_div">Insert
            it</span>

          <div class="md-layout-item md-size-30">
            <md-field>
              <md-select v-model="place"
                         name="Place"
                         id="Place"
                         placeholder="Place">
                <!-- <md-option disabled
                           :value="-1">Place</md-option> -->
                <md-option :value="PLACEMENT.before">Before</md-option>
                <md-option :value="PLACEMENT.after">After</md-option>
              </md-select>
            </md-field>
          </div>

          <div class="md-layout-item md-size-50">
            <md-field>
              <md-select v-model="orderSelected"
                         name="step"
                         id="step"
                         placeholder="Steps">
                <!-- <md-option disabled
                           :value="-1">Steps</md-option> -->
                <md-option v-for="s in steps"
                           :key="s.order"
                           :value="s.order">{{s.name}}</md-option>

              </md-select>
            </md-field>
          </div>

        </div>

        <chrome-picker class="stepChromePicker"
                       v-model="step.color" />

      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>
        <md-button class="md-primary"
                   type="submit"
                   :disabled="disabled()">Save
        </md-button>
      </md-dialog-actions>

    </form>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { Chrome } from "vue-color";

export default {
  name: "createStepDialog",
  props: ["onFinised"],
  components: {
    "chrome-picker": Chrome,
  },
  data() {
    this.PLACEMENT = {
      before: 0,
      after: 1,
    };
    return {
      showDialog: true,
      processId: undefined,
      contextId: undefined,
      place: undefined,
      orderSelected: undefined,
      steps: [],
      step: {
        name: "",
        color: "#000000",
        order: 0,
      },
    };
  },
  methods: {
    async opened(option) {
      this.autoFocusNameInput();
      this.processId = option.processId;
      this.contextId = option.contextId;
      this.steps = await this.getSteps(this.processId, this.contextId);
    },

    async removed(res) {
      if (
        res.closeResult &&
        res.step.name.length > 0 &&
        this.processId &&
        this.contextId
      ) {
        serviceTicketPersonalized.insertStep(
          this.contextId,
          this.processId,
          res.step
        );

        // serviceTicketPersonalized.addStep(
        //   res.step.name,
        //   res.step.color,
        //   res.step.order,
        //   this.processId,
        //   this.contextId
        // );
      }

      this.showDialog = false;
    },

    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.step.color =
          typeof this.step.color === "string"
            ? this.step.color
            : this.step.color.hex;

        this.step.order = this.orderSelected + this.place;

        this.onFinised({ closeResult, step: this.step });
      }
    },

    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },

    disabled() {
      return !(
        this.step.name.trim().length > 0 &&
        typeof this.place !== "undefined" &&
        typeof this.orderSelected !== "undefined"
      );
    },

    getSteps(processId, contextId) {
      return serviceTicketPersonalized
        .getStepsFromProcess(processId, contextId)
        .then((result) => {
          return result.map((el) => el.get()).filter((el) => el.order !== -1);
        });
    },
  },
};
</script>

<style scoped>
.stepDialogContainer {
  width: 450px;
}

.stepChromePicker {
  width: 100%;
}

.dialogForm {
  display: flex;
  flex-direction: column;
}

.dialogForm .insert_div {
  display: flex;
  align-items: center;
}
</style>