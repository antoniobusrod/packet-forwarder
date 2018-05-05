/* global describe it */
const mockUdp = require('mock-udp')
const { expect } = require('chai')
const PacketForwarder = require('../lib/index')

describe('Packet forwarder integration tests', () => {
  it('Can send an uplink to remote Network Server (UDP)', async () => {
    const gateway = 'DABBCCFFFF2A79CB'
    const target = 'localhost'
    const port = 1234
    const scope = mockUdp(`${target}:${port}`)
    const packetForwarder = new PacketForwarder(gateway, target, port)
    await packetForwarder.sendUplink({ foo: 'bar' })
    expect(scope.buffer.toString('hex')).to.equal('02000000dabbccffff2a79cb7b22666f6f223a22626172227d')
    await packetForwarder.close()
    scope.done()
  })
})
