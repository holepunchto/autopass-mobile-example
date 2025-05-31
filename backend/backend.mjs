// /* global Bare, BareKit */

import RPC from 'bare-rpc'
import fs from 'bare-fs'
import URL from 'bare-url'
import { join } from 'bare-path'
import { RPC_RESET, RPC_MESSAGE } from '../rpc-commands.mjs'

import Autopass from 'autopass'
import Corestore from 'corestore'
const { IPC } = BareKit

const path = join(URL.fileURLToPath(Bare.argv[0]), 'autopass-example')

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
Bare.on('teardown', () => pass.close())

await pass.ready()

pass.on('update', async (e) => {
  const req = rpc.request(RPC_RESET)
  req.send('data')

  for await (const data of pass.list()) {
    const value = JSON.parse(data.value)

    if (value[0] === 'password') {
      const req = rpc.request(RPC_MESSAGE)
      req.send(JSON.stringify(value))
    }
  }
})
