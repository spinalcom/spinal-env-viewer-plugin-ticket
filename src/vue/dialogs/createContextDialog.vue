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
             @md-closed="closeDialog(false)"
             class="mdDialog">
    <md-dialog-title class="mdDialogTitle">Create Ticket context
    </md-dialog-title>

    <md-dialog-content class="mdDialogContainer">

      <md-steppers :md-active-step.sync="stepper.active"
                   @md-changed="changeStep"
                   md-linear
                   class="mySteppers">
        <md-step class="mdStep"
                 :id="STEPPERS_DATA.context"
                 md-label="Context"
                 :md-done.sync="stepper.first">
          <md-content class="contents">
            <md-field>
              <label>Context name</label>
              <md-input v-model="inputValue"
                        ref="nameTextField"></md-input>
            </md-field>
          </md-content>

        </md-step>

        <md-step class="mdStep"
                 :id="STEPPERS_DATA.steps"
                 md-label="Steps"
                 :md-done.sync="stepper.second">

          <sortable-list :items="steps"
                         ref="draggableComponent"
                         @addStep="addStep"
                         @delete="deleteItem"></sortable-list>

        </md-step>

      </md-steppers>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 v-if="stepper.active === this.STEPPERS_DATA.context"
                 :disabled="!(inputValue.trim().length > 0)"
                 @click="PassToSecondStep">Next</md-button>

      <md-button v-if="stepper.active === this.STEPPERS_DATA.steps"
                 :disabled="disabledButton()"
                 class="md-primary"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

    <!-- <form class="dialogForm"
          @submit.prevent="closeDialog(true)">
      <md-dialog-content>
        <md-field>
          <label>Context name</label>
          <md-input v-model="inputValue"overflow: hidden ;
      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>

        <md-button class="md-primary"
                   type="submit"
                   :disabled="!(inputValue.trim().length > 0)">Save</md-button>
      </md-dialog-actions>
    </form> -->
  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";

import SortableList from "./components/sortable-list.vue";

export default {
  name: "createTicketContextDialog",
  props: ["onFinised"],
  components: {
    "sortable-list": SortableList,
  },
  data() {
    this.STEPPERS_DATA = {
      context: "first",
      steps: "second",
    };
    return {
      showDialog: true,
      inputValue: "",
      steps: [],
      stepper: {
        active: this.STEPPERS_DATA.context,
        first: false,
        second: false,
      },
    };
  },
  methods: {
    opened(option) {
      this.autoFocusNameInput();
    },

    async removed(res) {
      const value = res.inputValue.trim();

      if (res.closeResult && value.length > 0) {
        serviceTicketPersonalized.createContext(value, res.steps);
      }

      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        const steps = this.getSteps();
        this.onFinised({
          closeResult,
          inputValue: this.inputValue,
          steps,
        });
      }
    },

    getSteps() {
      if (this.$refs.draggableComponent) {
        const steps = this.$refs.draggableComponent.itemsSorted;
        return steps.map((el, index) => {
          el.order = index;
          return el;
        });
      }
    },

    disabledButton() {
      const contextCondition = this.inputValue.trim().length === 0;
      const stepsCondition = this.steps.length === 0;
      return contextCondition || stepsCondition;
    },

    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },

    changeStep(stepId) {
      if (stepId === this.STEPPERS_DATA.context) {
        this.stepper.active = stepId;
        this.stepper.first = false;
      }
    },

    PassToSecondStep() {
      this.stepper.first = true;
      this.stepper.active = this.STEPPERS_DATA.steps;
    },

    addStep(res) {
      this.steps = [...this.steps, res];
    },

    deleteItem(order) {
      this.steps = this.steps.filter((el) => el.order !== order);
    },
  },
};
</script>

<style scoped>
/* .dialogForm { 
   display: flex; 
  flex-direction: column; 
 } */

.mdDialog {
  width: 450px;
  height: 500px;
}

.mdDialog .mdDialogTitle {
  text-align: center;
}

.mdDialog .mdDialogContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mdDialog .mdDialogContainer .mdStep {
  height: 300px;
  overflow: hidden;
  padding: 10px 0px;
}

.mdDialog .mdDialogContainer .mdStep .contents {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: auto;
}

/* .mdDialog .mdDialogContainer .contents.contextName {
  display: flex;
  align-items: center;
}

.mdDialog .mdDialogContainer .actions {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: flex-end;
} */
</style>

<style>
.mdDialog .mdDialogContainer .mdStep .md-stepper-content.md-active {
  width: 100%;
  height: 100%;
}
</style>