import React from 'react'
import { ShipList } from './ship-list'
import { ShipFilter } from './ship-filter'

// a standalone part that allows user to do simple filtering and sorting
// on ships and picking ships for leveling.
const ShipPicker = _props => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <ShipFilter />
    <ShipList />
  </div>
)

export { ShipPicker }
