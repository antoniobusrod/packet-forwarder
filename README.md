# Packet Forwarder (Node.js)

[![Build Status](https://travis-ci.org/antoniobusrod/packet-forwarder.svg?branch=master)](https://travis-ci.org/antoniobusrod/packet-forwarder)[![npm version](https://badge.fury.io/js/packet-forwarder.svg)](https://badge.fury.io/js/packet-forwarder)

Virtual LoRa packet forwarder that forwards RF packets from API to a server through a IP/UDP link, and emits RF packets that are sent by the server. To be used for _Node.js_ applications.

## Getting Started

In LoRaWAN, you need real gateways and real devices for your real test case.
However, it is simpler to using a simulated gateway and simulated devices in order to choose the best LoRaWAN Network Server that fulfills your real requirements.

### Prerequisites

- Node.js v8.x


### Installation

```sh
npm intall --save packet-forwarder
```


## Usage

Send an uplink to remote Network Server using Packet Forwarder protocol. Fake gateway EUI, fake network server name and network server port have been used in the next usage example.

```javascript
const PacketForwarder = require('packet-forwarder')

async function sendFakeUplink() {
  const gateway = 'DABBCCFFFF2A79CB'
  const target = 'network-server.foo-company.local'
  const port = 1234
  const packetForwarder = new PacketForwarder(gateway, target, port)
  const message = { foo: 'invalid-message' }
  await packetForwarder.sendUplink(message)
  await packetForwarder.close()
}

```

## Testing

Clone repository, install dependencies and run tests `npm test`.


## Deployment

Add additional notes about how to deploy this on a live system


## Contributing

Respect `standard` rules.


## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

* **Antonio Bustos** - *Initial work* - [antoniobusrod](https://github.com/antoniobusrod)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details


## Acknowledgments

* [LORIOT](https://loriot.io)
* [Semtech Packet Forwarder](https://github.com/Lora-net/packet_forwarder)
