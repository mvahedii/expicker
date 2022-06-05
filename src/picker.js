import React, { Component } from 'react'
import './styles.scss'



export default class Picker extends Component {
  // static propTyps = {
  //   optionGroups: PropTypes.object.isRequired,
  //   valueGroups: PropTypes.object.isRequired,
  //   onChange: PropTypes.func.isRequired,
  //   onClick: PropTypes.func,
  //   itemHeight: PropTypes.number,
  //   height: PropTypes.number
  // }

  static defaultProps = {
    onClick: () => {},
    itemHeight: 36,
    height: 180
  }

  renderInner() {
    const { optionGroups, valueGroups, itemHeight, height, onChange, onClick } =
      this.props
    const highlightStyle = {
      height: itemHeight,
      marginTop: -(itemHeight / 2)
    }
    const columnNodes = []
    for (const name in optionGroups) {
      columnNodes.push(
        <PickerColumn
          key={name}
          name={name}
          options={optionGroups[name]}
          value={valueGroups[name]}
          itemHeight={itemHeight}
          columnHeight={height}
          onChange={onChange}
          onClick={onClick}
        />
      )
    }
    return (
      <div className='picker-inner'>
        {columnNodes}
        <div className='picker-highlight' style={highlightStyle}></div>
      </div>
    )
  }

  render() {
    const style = {
      height: this.props.height
    }

    return (
      <div className='picker-container' style={style}>
        {this.renderInner()}
      </div>
    )
  }
}
