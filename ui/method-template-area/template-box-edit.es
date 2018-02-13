import React, { Component } from 'react'
import {
  Button,
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import { PTyp } from '../../ptyp'
import { Template } from '../../structs'

import { LevelingMethodPanel } from '../goal-area/leveling-method-panel'
import { fillStates, stateToMethod } from '../goal-area/goal-box-edit'
import { STypeEdit } from './stype-edit'

class TemplateBoxEdit extends Component {
  static propTypes = {
    template: PTyp.Template.isRequired,
    stypes: PTyp.arrayOf(PTyp.number),
    stypeInfo: PTyp.ShipTypeInfo.isRequired,
    onModifySTypes: PTyp.func.isRequired,
    onModifyTemplateListElem: PTyp.func.isRequired,
    onRemoveTemplate: PTyp.func.isRequired,
    onFinishEdit: PTyp.func.isRequired,
  }

  static defaultProps = {
    stypes: [],
  }

  static prepareState = props => {
    const { template } = props
    const { method } = template
    return {
      methodType: method.type,
      ...fillStates(method),
    }
  }

  constructor(props) {
    super(props)
    this.state = TemplateBoxEdit.prepareState(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(TemplateBoxEdit.prepareState(nextProps))
  }

  handleMethodTypeSelect = e => {
    this.setState({methodType: e})
  }

  handleSortieInputChange = newValue =>
    this.setState({sortieInput: newValue})

  handleCustomInputChange = newValue => {
    this.setState({customInput: newValue})
  }

  handleSaveTemplate = () => {
    const method = stateToMethod(this.state)
    const {
      template,
      onModifyTemplateListElem,
      onFinishEdit,
    } = this.props

    Template.destruct({
      main: () => onModifyTemplateListElem(tmpl => ({
        ...tmpl,
        method,
      })),
      custom: () => {
        const { stypes } = this.props
        onModifyTemplateListElem(tmpl => ({
          ...tmpl,
          method,
          stypes,
        }))
      },
    })(template)

    onFinishEdit()
  }

  handleRemoveTemplate = () => {
    const {
      template,
      onRemoveTemplate,
    } = this.props

    Template.destruct({
      custom: () => onRemoveTemplate(),
      main: () => console.error('Main Template cannot be removed'),
    })(template)
  }

  render() {
    const {
      methodType,
      sortieInput,
      customInput,
    } = this.state
    const {
      template,
      stypes,
      stypeInfo,
      onModifySTypes,
    } = this.props
    const isMainTemplate = template.type === 'main'

    return (
      <div className="template-box-edit">
        <div className="panels">
          <STypeEdit
            templateId={template.id}
            stypeInfo={stypeInfo}
            stypes={stypes}
            disabled={isMainTemplate}
            onModifySTypes={onModifySTypes}
          />
          <LevelingMethodPanel
            methodType={methodType}
            sortieInput={sortieInput}
            customInput={customInput}
            onMethodTypeSelect={this.handleMethodTypeSelect}
            onSortieInputChange={this.handleSortieInputChange}
            onCustomInputChange={this.handleCustomInputChange}
          />
        </div>
        <div className="edit-control">
          <Button
            onClick={this.handleRemoveTemplate}
            disabled={isMainTemplate}>
            <FontAwesome name="trash" />
          </Button>
          <Button onClick={this.handleSaveTemplate} >
            <FontAwesome name="save" />
          </Button>
        </div>
      </div>
    )
  }
}

export { TemplateBoxEdit }
