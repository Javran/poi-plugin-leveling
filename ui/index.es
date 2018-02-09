import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store, extendReducer } from 'views/create-store'
import { Nav, NavItem } from 'react-bootstrap'

import { reducer, boundActionCreators as bac } from '../store'

import { migrate } from '../migrate'
import { loadPState } from '../p-state'

import {
  admiralIdSelector,
} from '../selectors'

import { GoalArea } from './goal-area'
import { MethodTemplateArea } from './method-template-area'
import { globalSubscribe, globalUnsubscribe } from '../observers'

const { $, __, getStore } = window

extendReducer('poi-plugin-leveling', reducer)
globalSubscribe()

const handleWindowUnload = () => {
  window.removeEventListener('unload', handleWindowUnload)
  globalUnsubscribe()
}

window.addEventListener('unload', handleWindowUnload)

/*
   TODO

   - note that ships can be identified by rosterId, but templates aren't,
     we might give it an id to make things easier
   - use template id on UI
   - recover UI functions
   - saving mechamism
   - do Tabs properly
   - minimum width
   - scollbar inside content
   - derive more data with selectors
   - Separate "Goals" to "Goals" and "Ships":

     - "Ships" lists all ships including those that have goals
     - improve UI.

   - TODO: mstId-specific templates
   - Tab "Misc"
     - User Manual
     - settings (toggle ship avatar)
     - exp table
   - allow applying template even if ship type mismatches
   - allow cloning goal settings
   - save current goal setting as template
   - template can have names
 */

window.store = store

// start loading process
setTimeout(() => {
  // try normalizing plugin dir structure to one used in 2.0.0
  migrate()
  const pStateOrNull = loadPState()
  bac.ready(pStateOrNull)
  const admiralId = admiralIdSelector(getStore())
  if (admiralId) {
    bac.loadGoalTable(admiralId)
  }
})

$('#fontawesome-css').setAttribute(
  'href',
  require.resolve('font-awesome/css/font-awesome.css')
)

class LevelingMain extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: "goal",
    }
  }

  handleTabSwitch = activeTab =>
    this.setState({ activeTab })

  render() {
    const { activeTab } = this.state
    return (
      <div className="leveling-main">
        <Nav
          bsStyle="tabs"
          activeKey={activeTab}
          onSelect={this.handleTabSwitch}
          justified className="main-nav">
          <NavItem eventKey="goal">{__('Top.Goals')}</NavItem>
          <NavItem eventKey="template">{__('Top.Templates')}</NavItem>
        </Nav>
        <GoalArea visible={activeTab === 'goal'} />
        <MethodTemplateArea visible={activeTab === 'template'} />
      </div>
    )
  }
}

ReactDOM.render(
  <Provider store={store}>
    <LevelingMain />
  </Provider>,
  $('#content-root')
)
