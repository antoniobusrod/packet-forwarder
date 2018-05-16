const dgram = require('dgram')
const EventEmitter = require('events')
const debug = require('debug')('packet-forwarder')
const { randomBytes } = require('crypto')

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
    this._uplinkAck = new Map()
    this.target = target
    this.port = port
    const clientUdpPort = port + 1
    const socket = dgram.createSocket('udp4')
    socket.bind(clientUdpPort, undefined, () => {
      debug(`Client packet-forwarder listening on port ${clientUdpPort}`)
    })
    socket.on('error', err => this.emit('error', err))
    socket.on('message', (msg, rinfo) => {
      if (msg[0] === 2) {
        const token = msg.slice(1, 3)
        const key = token.toString('hex')
        const uplinkResolve = this._uplinkAck.get(key)
        if (uplinkResolve !== undefined) {
          uplinkResolve()
          this._uplinkAck.delete(key)
        }
      }
      this.emit('message', msg, rinfo)
    })
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
    const token = randomBytes(2)
    const frame = Buffer.concat([
      Buffer.from([ 2 ]), // protocol version
      token,
      Buffer.from([ 0 ]), // PUSH_DATA
      this.gateway,
      sanitizeBuffer(JSON.stringify(message), 'utf8')
    ])
    const bytes = await new Promise((resolve, reject) => {
      let bytes
      const callback = (err, _bytes) => {
        if (err !== undefined && err !== null) {
          return reject(err)
        }

        bytes = _bytes
      }
      const key = token.toString('hex')
      this._uplinkAck.set(key, () => resolve(bytes))
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
