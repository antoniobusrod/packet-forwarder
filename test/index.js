/* global describe it */
const dgram = require('dgram')
const { EventEmitter } = require('events')
const sinon = require('sinon')
const { expect } = require('chai')
const PacketForwarder = require('../lib/index')

class UdpSocketMock extends EventEmitter {
  bind () {}
  send (buf, offset, length, port, address, callback) {
    const msg = buf.toString('hex')
    expect(msg.slice(0, 2)).to.equal('02')
    expect(msg.slice(8)).to.equal('dabbccffff2a79cb7b22666f6f223a22626172227d')
    expect(offset).to.equal(0)
    expect(length).to.equal(Buffer.byteLength(buf))
    expect(port).to.equal(1234)
    expect(address).to.equal('localhost')
    callback(null, length)
    this.emit('message', buf.slice(0, 4))
  }
  close (callback) { callback() }
}

describe('Packet forwarder integration tests', () => {
  it('Can send an uplink to remote Network Server (UDP)', async () => {
    const gateway = 'DABBCCFFFF2A79CB'
    const target = 'localhost'
    const port = 1234
    const mock = sinon.mock(dgram)
    mock.expects('createSocket')
      .withArgs('udp4')
      .once()
      .returns(new UdpSocketMock())
    const packetForwarder = new PacketForwarder({ gateway, target, port })
    await packetForwarder.sendUplink({ foo: 'bar' })
    mock.verify()
    await packetForwarder.close()
  })
})
