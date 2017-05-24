import { ensureDirSync, readJsonSync, writeJsonSync } from 'fs-extra'
import { join } from 'path-extra'

const { APPDATA_PATH } = window

// ensures goal table path exists, and returns goal table file name
const getGoalTablePath = admiralId => {
  const goalTablePath = join(APPDATA_PATH,'leveling')
  ensureDirSync(goalTablePath)
  return join(goalTablePath, `goal-table-${admiralId}.json`)
}

const loadGoalTable = admiralId => {
  try {
    return readJsonSync(getGoalTablePath(admiralId))
  } catch (err) {
    // ignore error when it's about not finding the file, which is fine,
    // otherwise this could be a problem and we print it in this case.
    if (err.syscall !== 'open' || err.code !== 'ENOENT') {
      console.error('Error while loading goal table', err)
    }
  }
  return {}
}

const saveGoalTable = (admiralId,gt) => {
  try {
    const filePath = getGoalTablePath(admiralId)
    writeJsonSync(filePath,gt)
  } catch (err) {
    console.error('Error while writing to goal table file', err)
  }
}

export {
  loadGoalTable,
  saveGoalTable,
}