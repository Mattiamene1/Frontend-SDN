import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);

createApp({
  data() {
    return {
      topology: null,
      topologyConfig: {
        // Configurazione per i nodi
        width: window.innerWidth,
        height: window.innerHeight,
        nodeConfig: {
          label: "model.name",
          iconType: "model.device_type",
          color: "model.color",
        },
        // Configurazione per i link
        linkConfig: {
          linkType: "straight",
          color: "model.color",
        },
        showIcon: true,
        dataProcessor: "force",
      },
      customLayoutConfig: {
      numColumns: 5,    // Numero di colonne nella griglia
      gridSize: 100,    // Dimensione della griglia
      offsetX: 100,     // Offset orizzontale del layout
      offsetY: 100,     // Offset verticale del layout
    },
      auto_update: false,
      auto_update_interval: null,
      switch_detail: false,
      flow_table: null,
      switch_id: null,
      switch_: {},
      host: {},
      host_id: null,
      host_detail: false,
      searchQuery: "",
      showSwitches: true,
      showHosts: true,
      customLayout: false,
    };
    
  },
  watch: {
    flow_table_hidden: function (newVal, oldVal) {
      this.topology.adaptToContainer();
    },
    customLayout: function (newVal, oldVal) {
      if (newVal) {
        this.custom_layout();
      } else {
        this.default_layout();
      }
    },
  },
  methods: {
    change_auto_update: function () {
      let vm = this;
      if (this.auto_update) {
        clearInterval(this.auto_update_interval);
        this.auto_update_interval = null;
        this.auto_update = false;
      } else {
        this.auto_update_interval = setInterval(async function () {
          reset_topology();
          hosts = await get_hosts();
          switches = await get_switches();
          links = await get_links();

          if (!vm.topology) {
            vm.init_topology();
          }

          vm.topology.setData(build_topology());
          if (vm.switch_detail) {
            vm.show_switch(vm.switch_id);
          }
          if (vm.host_detail) {
            vm.show_host(vm.host_id);
          }
        }, 5 * 1000); // Aggiorna ogni 5 secondi
        this.auto_update = true;
      }
    },
    vertical_layout: function () {
      var layout = this.topology.getLayout("hierarchicalLayout");
      layout.direction("vertical");
      layout.sortOrder(["switch", "host"]);
      layout.levelBy(function (node, model) {
        return model.get("device_type");
      });
      this.topology.activateLayout("hierarchicalLayout");
    },
    horizontal_layout: function () {
      var layout = this.topology.getLayout("hierarchicalLayout");
      layout.direction("horizontal");
      layout.sortOrder(["switch", "host"]);
      layout.levelBy(function (node, model) {
        return model.get("device_type");
      });
      this.topology.activateLayout("hierarchicalLayout");
    },
    show_flow_table: async function (id) {
      let res = await get_flow_table(id);
      this.flow_table = res[id];
    },
    show_switch: function (id) {
      this.switch_id = id;
      for (switch_ of switches) {
        if (id === parseInt(switch_.dpid)) {
          this.switch_ = switch_;
          break;
        }
      }
      this.show_flow_table(id);
      this.switch_detail = true;
    },
    hide_switch: function () {
      this.switch_detail = false;
    },
    show_host: function (id) {
      this.host_id = id;
      for (host of hosts) {
        if (host.ipv4.includes(id) || host.ipv6.includes(id)) {
          this.host = host;
          break;
        }
      }
      this.host_detail = true;
    },
    hide_host: function () {
      this.host_detail = false;
    },
    init_topology: async function () {
      hosts = await get_hosts();
      switches = await get_switches();
      links = await get_links();
      let vm = this;

      // Creazione dell'applicazione Next
      const app = new nx.ui.Application();

      // Creazione della topologia
      this.topology = new nx.graphic.Topology(this.topologyConfig);

      // Caricamento dei dati della topologia
      this.topology.data(build_topology());

      // Aggancio della topologia all'applicazione
      this.topology.on("topologyGenerated", function () {
        vm.topology.eachNode(function (callback, context) {
          callback.on("clickNode", function () {
            let nodeType = arguments[0].iconType();
            if (nodeType == "switch") {
              let id = arguments[0].label();
              vm.show_switch(id);
            } else if (nodeType == "host") {
              let id = arguments[0].label()[0];
              vm.show_host(id);
            }
          });
        });
      });

      this.topology.attach(app);

      // L'applicazione viene eseguita all'interno del container specifico (id="topology-container")
      app.container(document.getElementById("topology-container"));

      const elements = document.getElementsByClassName("n-popupContainer");
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    },
    search_nodes: function () {
      // Filtra i nodi in base alla ricerca
      if (!this.topology) return;

      const searchQuery = this.searchQuery.toLowerCase();
      this.topology.eachNode((node) => {
        const label = node.model().get("name").toLowerCase();
        const deviceType = node.model().get("device_type").toLowerCase();
        const showNode =
          (this.showSwitches && deviceType === "switch") ||
          (this.showHosts && deviceType === "host");

        if (label.includes(searchQuery) && showNode) {
          node.show();
        } else {
          node.hide();
        }
      });
    },
    toggle_switches: function () {
      this.showSwitches = !this.showSwitches;
      this.search_nodes();
    },
    toggle_hosts: function () {
      this.showHosts = !this.showHosts;
      this.search_nodes();
    },
    custom_layout: function () {
      // Implementa un layout personalizzato
      if (!this.topology) return;
      
      let nodes = this.topology.data().nodes;
      let { numColumns, gridSize, offsetX, offsetY } = this.customLayoutConfig;

      Object.values(nodes).forEach((node, index) => {
        let x = offsetX + (index % numColumns) * gridSize;
        let y = offsetY + Math.floor(index / numColumns) * gridSize;
        node.x = x;
        node.y = y;
      });


      this.topology.adaptToContainer();
    },
    default_layout: function () {
      // Ripristina il layout predefinito
      if (!this.topology) return;

     this.topology.getLayout('hierarchicalLayout').direction('horizontal');
    this.topology.getLayout('hierarchicalLayout').sortOrder(['switch', 'host']);
    this.topology.getLayout('hierarchicalLayout').levelBy(function (node, model) {
      return model.get('device_type');
    });

    this.topology.activateLayout('hierarchicalLayout');
    },
    reset_topology: function () {
      // Resettare la topologia
      if (this.topology) {
        this.topology.clear();
        this.topology = null;
      }
    },
  },
  computed: {
    filteredSwitches: function () {
      return switches.filter(
        (s) => s.name.toLowerCase().includes(this.searchQuery)
      );
    },
    filteredHosts: function () {
      return hosts.filter(
        (h) =>
          h.name.toLowerCase().includes(this.searchQuery) ||
          h.ipv4.join(",").includes(this.searchQuery) ||
          h.ipv6.join(",").includes(this.searchQuery)
      );
    },
  },
  mounted: function () {
    this.init_topology();
    this.change_auto_update();
  },
}).mount("#app");
