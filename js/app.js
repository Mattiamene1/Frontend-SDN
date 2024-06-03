const { createApp } = Vue

createApp({
  data() {
    return {
      topology: null,
      topologyConfig: {
        // configuration for nodes
        // adaptive: true,
        width: window.innerWidth,
        height: window.innerHeight,
        nodeConfig: {
          label: "model.name",
          iconType: "model.device_type",
          color: "model.color",
        },
        // configuration for links
        linkConfig: {
          linkType: "straight",
          color: "model.color"
        },
        // if true, the nodes' icons are shown, a dot is shown instead
        showIcon: true,
        //enableSmartNode: true,
        //autoLayout: true,
        dataProcessor: "force"
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

      // Translation related data
      title: '',
      autoUpdateButtonTextStart: '',
      autoUpdateButtonTextStop: '',
      layoutVertical: '',
      layoutHorizontal: '',
      switchDetailsTitle: '',
      closeSwitchDetailsButton: '',
      switchPortsTitle: '',
      portNumber: '',
      name: '',
      macAddress: '',
      flowTableTitle: '',
      tableID: '',
      priority: '',
      actions: '',
      match: '',
      timeout: '',
      idle: '',
      hard: '',
      duration: '',
      packetCount: '',
      hostDetailsTitle: '',
      closeHostDetailsButton: '',
      connectedHostPortTitle: '',
      lang: '',
      updateFrequencyLabel: '',
    }
  },
  watch: {
    flow_table_hidden: function (newVal, oldVal) {
      this.topology.adaptToContainer()
    }
  },
  methods: {
    change_auto_update: function () {
      let vm = this
      if (this.auto_update) {
        clearInterval(this.auto_update_interval)
        this.auto_update_interval = null
        this.auto_update = false
      } else {
        this.auto_update_interval = setInterval(async function () {
          reset_topology()
          hosts = await get_hosts()
          switches = await get_switches()
          links = await get_links()

          if (!vm.topology) {
            vm.init_topology()
          }

          vm.topology.setData(build_topology())
          if (vm.switch_detail) {
            vm.show_switch(vm.switch_id)
          }
          if (vm.host_detail) {
            vm.show_host(vm.host_id)
          }
        },vm.updateFrequency);
        this.auto_update = true
      }
    },
    updateFrequencyChanged: function () {
      if (this.auto_update) {
        this.change_auto_update();
        this.change_auto_update();
      }
    },
    vertical_layout: function () {
      var layout = this.topology.getLayout('hierarchicalLayout');
      layout.direction('vertical');
      layout.sortOrder(['switch', 'host']);
      layout.levelBy(function (node, model) {
        return model.get('device_type');
      });
      this.topology.activateLayout('hierarchicalLayout');
    },
    horizontal_layout: function () {
      var layout = this.topology.getLayout('hierarchicalLayout');
      layout.direction('horizontal');
      layout.sortOrder(['switch', 'host']);
      layout.levelBy(function (node, model) {
        return model.get('device_type');
      });
      this.topology.activateLayout('hierarchicalLayout');
    },
    show_flow_table: async function (id) {
      let res = await get_flow_table(id)
      this.flow_table = res[id]
    },
    show_switch: function (id) {
      this.switch_id = id
      for (switch_ of switches) {
        if (id === parseInt(switch_.dpid)) {
          this.switch_ = switch_
          break
        }
      }
      this.show_flow_table(id)
      this.switch_detail = true
    },
    hide_switch: function () {
      this.switch_detail = false
    },
    show_host: function (id) {
      this.host_id = id
      for (host of hosts) {
        if (host.ipv4.includes(id) || host.ipv6.includes(id)) {
          this.host = host
          break
        }
      }
      this.host_detail = true
    },
    hide_host: function () {
      this.host_detail = false
    },
    init_topology: async function () {
      hosts = await get_hosts()
      switches = await get_switches()
      links = await get_links()
      let vm = this

      // instantiate next app
      const app = new nx.ui.Application();

      // instantiate Topology class
      this.topology = new nx.graphic.Topology(this.topologyConfig);

      // load topology data from app/data.js
      this.topology.data(build_topology());

      // bind the topology object to the app

      this.topology.on('topologyGenerated', function () {
        vm.topology.eachNode(function (callback, context) {
          callback.on('clickNode', function () {
            let nodeType = arguments[0].iconType()
            if (nodeType == 'switch') {
              let id = arguments[0].label()
              vm.show_switch(id)
            } else if (nodeType == 'host') {
              let id = arguments[0].label()
              vm.show_host(id[0])
            }
          })
        })
      })

      this.topology.attach(app);

      // app must run inside a specific container. In our case this is the one with id="topology-container"
      app.container(document.getElementById("topology-container"));

      const elements = document.getElementsByClassName('n-popupContainer');
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    },
    loadTranslation: function (lang) {
      fetch("json/translation.json")
        .then((response) => response.json())
        .then((data) => {
          const texts = data[lang].text;
          this.title = texts.title;
          this.autoUpdateButtonTextStart = texts.autoUpdateButtonTextStart;
          this.autoUpdateButtonTextStop = text.autoUpdateButtonTextStop;
          this.layoutVertical = texts.layoutVertical;
          this.layoutHorizontal = texts.layoutHorizontal;
          this.switchDetailsTitle = texts.switchDetailsTitle.replace("{{switchId}}", this.switch_id);
          this.closeSwitchDetailsButton = texts.closeSwitchDetailsButton;
          this.switchPortsTitle = texts.switchPortsTitle.replace("{{switchId}}", this.switch_id);
          this.portNumber = texts.portNumber;
          this.name = texts.name;
          this.macAddress = texts.macAddress;
          this.flowTableTitle = texts.flowTableTitle.replace("{{switchId}}", this.switch_id);
          this.tableID = texts.tableID;
          this.priority = texts.priority;
          this.actions = texts.actions;
          this.match = texts.match;
          this.timeout = texts.timeout;
          this.idle = texts.idle;
          this.hard = texts.hard;
          this.duration = texts.duration;
          this.packetCount = texts.packetCount;
          this.hostDetailsTitle = texts.hostDetailsTitle.replace("{{hostId}}", this.host_id);
          this.closeHostDetailsButton = texts.closeHostDetailsButton;
          this.connectedHostPortTitle = texts.connectedHostPortTitle;
          this.lang = lang;
          this.updateFrequencyLabel = texts.updateFrequencyLabel;
        })
        .catch((error) =>
          console.error("Errore nel caricamento del file JSON:", error)
        );
    },
    setLanguage: function (lang) {
      this.lang = lang;
      this.loadTranslation(lang);
    },
  },
  
  mounted: function () {
    this.init_topology()
    this.loadTranslation("it") // Load default language
  },
}).mount("#app")
