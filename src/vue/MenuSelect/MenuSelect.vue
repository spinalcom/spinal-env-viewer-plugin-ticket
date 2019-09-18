<template>
  <div style="height: 100%;">
    <div class="ticket-panel-container-header">
      <h3>Accueil</h3>
    </div>
    <md-content class="ticket-panel-container-content md-scrollbar">
      <md-list>
        <md-list-item @click="$emit('onSelectConsult')">
          <md-icon>import_contacts</md-icon>
          <span class="md-list-item-text">CONSULTER les demandes</span>
        </md-list-item>
        <md-list-item @click="$emit('onSelectDeclare')">
          <md-icon>content_paste</md-icon>
          <span class="md-list-item-text">CREE une demande</span>
        </md-list-item>
        <md-list-item
                      href="https://www.alteva.net/EMIssiON?base=semlrdl" target="_blank">
          <md-icon>content_paste</md-icon>
          <span class="md-list-item-text">OUVRIR eMission</span>
        </md-list-item>

      </md-list>

    </md-content>
  </div>
</template>

<script>
export default {
  name: "menu-select",
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scpoed>
.ticket-panel-container-content > .md-list {
  background-color: transparent;
  padding: 0;
}
</style>

