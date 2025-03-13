// /* global Bare, BareKit */

import RPC from 'bare-rpc'
import fs from 'bare-fs'

import Autopass from 'autopass'
import Corestore from 'corestore'
const { IPC } = BareKit

const path =
  Bare.argv[0] === 'android'
    ? '/data/data/to.holepunch.bare.expo/autopass-example'
    : './tmp/autopass-example/'

const rpc = new RPC(IPC, (req, error) => {
  // Handle two way communication here
})

// For a clean start
if (fs.existsSync(path)) {
  fs.rmSync(path, {
    recursive: true,
    force: true
  })
}

fs.mkdirSync(path)
const invite = Bare.argv[1]
const pair = Autopass.pair(new Corestore(path), invite)
const pass = await pair.finished()

await pass.ready()

pass.on('update', async (e) => {
  const req = rpc.request('reset')
  req.send('data')

  for await (const data of pass.list()) {
    const value = JSON.parse(data.value)

    if (value[0] === 'password') {
      const req = rpc.request('message')
      req.send(JSON.stringify(value))
    }
  }
})
