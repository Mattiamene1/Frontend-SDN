class NetworkTopology {
    constructor(baseUrl) {
        this.BASE_URL = baseUrl;
        this.hostsList = [];
        this.switchesList = [];
        this.linksList = [];
        this.idMap = {};
        this.nextId = 0;
        this.portsSwitchMap = {};
    }

    async fetchData(endpoint) {
        const response = await axios.get(this.BASE_URL + endpoint);
        return response.data;
    }

    async fetchHosts() {
        this.hostsList = await this.fetchData('/hosts');
    }

    async fetchSwitches() {
        this.switchesList = await this.fetchData('/switches');
    }

    async fetchLinks() {
        this.linksList = await this.fetchData('/links');
    }

    async fetchFlowTable(id) {
        const response = await this.fetchData(`/stats/flow/${id}`);
        return response;
    }

    generateInternalId(idStr) {
        return idStr.replace('s', '1');
    }

    resetTopology() {
        this.idMap = {};
        this.nextId = 0;
        this.portsSwitchMap = {};
    }

    buildTopologyData() {
        const topologyData = {
            nodes: [],
            links: []
        };

        if (!this.switchesList) {
            this.switchesList = [];
        }

        for (const [index, switch_] of this.switchesList.entries()) {
            const switchId = switch_.ports[0].name.split('-')[0] || switch_.dpid;
            this.idMap[switchId] = this.nextId;
            this.nextId++;

            topologyData.nodes.push({
                id: switchId,
                name: parseInt(switch_.dpid),
                deviceType: "switch"
            });

            for (const port of switch_.ports) {
                this.portsSwitchMap[port.name] = switchId;
            }
        }

        if (!this.hostsList) {
            this.hostsList = [];
        }

        for (const [index, host] of this.hostsList.entries()) {
            const hostPortName = host.port.name;
            const ip = [host.ipv4[0] || host.ipv6[0]];
            this.idMap[hostPortName] = this.nextId;
            this.nextId++;

            topologyData.nodes.push({
                id: hostPortName,
                name: ip,
                deviceType: "host"
            });

            topologyData.links.push({
                source: this.idMap[hostPortName],
                target: this.idMap[hostPortName.split('-')[0]]
            });
        }

        if (!this.linksList) {
            this.linksList = [];
        }

        for (const link of this.linksList) {
            if (!link.src || !link.dst) {
                continue;
            }

            const source = this.idMap[link.src.name] || this.idMap[this.portsSwitchMap[link.src.name]];
            const target = this.idMap[link.dst.name] || this.idMap[this.portsSwitchMap[link.dst.name]];

            let isPresent = false;

            for (const edge of topologyData.links) {
                if ((edge.source === source && edge.target === target) || (edge.source === target && edge.target === source)) {
                    isPresent = true;
                    break;
                }
            }

            if (!isPresent) {
                topologyData.links.push({
                    source: source,
                    target: target,
                    color: 'red'
                });
            }
        }

        return topologyData;
    }
}

// Usage
const topology = new NetworkTopology('http://localhost:3000');
await topology.fetchSwitches();
await topology.fetchHosts();
await topology.fetchLinks();
const finalTopology = topology.buildTopologyData();
console.log(finalTopology);
