const dgram = require('dgram')
const EventEmitter = require('events')
const debug = require('debug')('packet-forwarder')

function sanitizeBuffer (value, encoding) {
  if (Buffer.isBuffer(value) === true) {
    return value
  }

  return Buffer.from(value, encoding)
}

module.exports = class PacketForwarder extends EventEmitter {
  /**
   *
   * @param {string} gatewayEui Gateway EUI used to deliver uplink message
   * @param {object} message Packet forwarder JSON uplink message
   * @param {string} target Network Server UDP address
   * @param {number} port Network Server UDP port
   */
  constructor (gateway, target, port) {
    super()
    this.gateway = sanitizeBuffer(gateway, 'hex')
    this.target = target
    this.port = port
    const clientUdpPort = port + 1
    const socket = dgram.createSocket('udp4')
    socket.bind(clientUdpPort, undefined, () => {
      debug(`Client packet-forwarder listening on port ${clientUdpPort}`)
    })
    socket.on('error', err => this.emit('error', err))
    socket.on('message', (msg, rinfo) => this.emit('message', msg, rinfo))
    this.socket = socket
  }

  /**
   * Send UDP packet to Network Server
   *
   * @async
   * @function sendUdpPacket
   * @param {object} message Packet forwarder JSON uplink message
   */
  async sendUplink (message) {
    const frame = Buffer.concat([
      Buffer.from([
        2, // protocol version
        0, // random token
        0, // random token
        0 // PUSH_DATA
      ]),
      this.gateway,
      sanitizeBuffer(JSON.stringify(message), 'utf8')
    ])
    const bytes = await new Promise((resolve, reject) => {
      const callback = (err, bytes) => {
        if (err !== undefined && err !== null) {
          return reject(err)
        }

        resolve(bytes)
      }
      this.socket.send(frame, 0, frame.length, this.port, this.target, callback)
    })
    if (bytes !== frame.length) {
      throw new Error(`Sent bytes (${bytes.toString()}) !== buffer length (${frame.length.toString()})`)
    }
    debug('Uplink sent succesfully')
  }

  async close () {
    await new Promise(resolve => this.socket.close(resolve))
  }
}
