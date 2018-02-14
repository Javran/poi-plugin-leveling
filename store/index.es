import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { modifyObject } from 'subtender'
import { store } from 'views/create-store'

import { loadGoalTable } from '../goal-table'
import { recommended as recommendedTL } from '../default-template-list'
import {
  goalsReadySelector,
  getShipInfoFuncSelector,
  templateListSelector,
} from '../selectors/common'
import { initState } from './init-state'
import { TemplateList } from '../structs'

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-leveling@ready') {
    const {pState} = action
    return {
      ...state,
      ...pState,
      pReady: true,
    }
  }

  if (!state.pReady)
    return state

  if (action.type === '@poi-plugin-leveling@modify') {
    const {modifier} = action
    return modifier(state)
  }

  return state
}

const actionCreators = {
  ready: pStateOrNull => {
    const templates = _.get(pStateOrNull, 'templates')
    const ui = _.get(pStateOrNull, 'ui')

    const pState = {}
    if (!_.isEmpty(templates)) {
      pState.templates = templates
    } else {
      pState.templates = recommendedTL
    }

    if (!_.isEmpty(ui))
      pState.ui = ui

    return {
      type: '@poi-plugin-leveling@ready',
      pState,
    }
  },
  modify: modifier => ({
    type: '@poi-plugin-leveling@modify',
    modifier,
  }),
  loadGoalTable: admiralId => dispatch =>
    setTimeout(() => {
      const goalTable = loadGoalTable(admiralId)
      const goals = {
        admiralId,
        goalTable,
      }
      dispatch(actionCreators.modify(modifyObject('goals', () => goals)))
    }),
  uiModify: modifier =>
    actionCreators.modify(modifyObject('ui', modifier)),
  templatesModify: modifier =>
    actionCreators.modify(
      modifyObject('templates', templates => {
        if (Array.isArray(templates)) {
          return modifier(templates)
        } else {
          console.error(`templates not ready`, templates)
          return templates
        }
      })
    ),
  goalsModify: modifier =>
    // react-thunk
    (dispatch, getState) => {
      const ready = goalsReadySelector(getState())
      if (ready) {
        dispatch(actionCreators.modify(
          modifyObject('goals', modifier)
        ))
      } else {
        console.error(`<extStore>.goals is not ready`)
      }
    },
  // TODO: should we handle creation here, or
  // it works better if we impl 'add' separately?
  modifyGoalTable: modifier =>
    actionCreators.goalsModify(
      modifyObject('goalTable', modifier)
    ),
  // this action only works after state is ready,
  // so there is no need of making sure <extStore>.templates is valid
  modifyTemplateList: modifier =>
    actionCreators.modify(
      modifyObject('templates', modifier)
    ),
  addShipToGoalTable: rstId =>
    // react-thunk
    (dispatch, getState) => {
      const poiState = getState()
      const ready = goalsReadySelector(poiState)
      if (!ready)
        return

      const getShipInfo = getShipInfoFuncSelector(poiState)
      const templateList = templateListSelector(poiState)
      const ship = getShipInfo(rstId)
      if (!ship)
        return
      const {stype} = ship
      const goalLevel =
        ship.nextRemodelLevel !== null ? ship.nextRemodelLevel :
        ship.level < 99 ? 99 :
        165

      const method = TemplateList.findMethod(templateList,false)(stype)
      dispatch(actionCreators.modifyGoalTable(gt => {
        const newGoal = {
          rosterId: rstId,
          goalLevel,
          method,
        }
        return {...gt, [rstId]: newGoal}
      }))
    },
}

const mapDispatchToProps = _.memoize(dispatch =>
  bindActionCreators(actionCreators, dispatch)
)

const boundActionCreators = mapDispatchToProps(store.dispatch)

export * from './init-state'

export {
  reducer,
  actionCreators,
  mapDispatchToProps,
  boundActionCreators,
}
