import React, { Component } from 'react'

interface ColumnProps {
  options: string[]
  name: string
  value: any
  itemHeight: number
  columnHeight: number
  onChange: (name: string, value: string) => void
  onClick: (name: string, value: any) => void
}

interface ColumnState {
  isMoving?: boolean
  startTouchY: number
  startScrollerTranslate: number | undefined
  scrollerTranslate?: number
  minTranslate?: number
  maxTranslate?: number
}

export class Column extends Component<ColumnProps, ColumnState> {
  constructor(props: ColumnProps) {
    super(props)
    this.state = {
      isMoving: false,
      startTouchY: 0,
      startScrollerTranslate: 0,
      ...this.computeTranslate(props)
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.state.isMoving) {
      return
    }
    // @ts-ignore
    this.setState(this.computeTranslate(nextProps))
  }

  computeTranslate = (props: ColumnProps) => {
    const { options, value, itemHeight, columnHeight } = props
    let selectedIndex = options.indexOf(value)
    if (selectedIndex < 0) {
      // throw new ReferenceError();
      console.warn(
        'Warning: "' +
          this.props.name +
          '" doesn\'t contain an option of "' +
          value +
          '".'
      )
      this.onValueSelected(options[0])
      selectedIndex = 0
    }
    return {
      scrollerTranslate:
        columnHeight / 2 - itemHeight / 2 - selectedIndex * itemHeight,
      minTranslate:
        columnHeight / 2 - itemHeight * options.length + itemHeight / 2,
      maxTranslate: columnHeight / 2 - itemHeight / 2
    }
  }

  onValueSelected = (newValue: string) => {
    this.props.onChange(this.props.name, newValue)
  }

  handleTouchStart = (event:any) => {
    const startTouchY = event.targetTouches[0].pageY
    this.setState(({ scrollerTranslate }) => ({
      startTouchY,
      startScrollerTranslate: scrollerTranslate
    }))
  }

  safePreventDefault = (event: {
    _reactName: string
    preventDefault: () => void
  }) => {
    const passiveEvents = ['onTouchStart', 'onTouchMove', 'onWheel']
    if (!passiveEvents.includes(event._reactName)) {
      event.preventDefault()
    }
  }

  handleTouchMove = (event: any) => {
    this.safePreventDefault(event)
    const touchY = event.targetTouches[0].pageY
    this.setState(
      ({
        isMoving,
        startTouchY,
        startScrollerTranslate,
        minTranslate,
        maxTranslate
      }) => {
        if (!isMoving) {
          return {
            isMoving: true
          }
        }

        let nextScrollerTranslate =
          startScrollerTranslate + touchY - startTouchY
        if (nextScrollerTranslate < minTranslate!) {
          nextScrollerTranslate =
            minTranslate! - Math.pow(minTranslate! - nextScrollerTranslate, 0.8)
        } else if (nextScrollerTranslate > maxTranslate!) {
          nextScrollerTranslate =
            maxTranslate! + Math.pow(nextScrollerTranslate - maxTranslate!, 0.8)
        }
        return {
          scrollerTranslate: nextScrollerTranslate
        }
      }
    )
  }

  handleTouchEnd = () => {
    if (!this.state.isMoving) {
      return
    }
    this.setState({
      isMoving: false,
      startTouchY: 0,
      startScrollerTranslate: 0
    })
    setTimeout(() => {
      const { options, itemHeight } = this.props
      const { scrollerTranslate, minTranslate, maxTranslate } = this.state
      let activeIndex
      if (scrollerTranslate! > maxTranslate!) {
        activeIndex = 0
      } else if (scrollerTranslate! < minTranslate!) {
        activeIndex = options.length - 1
      } else {
        activeIndex = -Math.floor(
          (scrollerTranslate! - maxTranslate!) / itemHeight
        )
      }
      this.onValueSelected(options[activeIndex])
    }, 0)
  }

  handleTouchCancel = () => {
    if (!this.state.isMoving) {
      return
    }
    this.setState((startScrollerTranslate as number) => ({
      isMoving: false,
      startTouchY: 0,
      startScrollerTranslate: 0,
      scrollerTranslate: startScrollerTranslate
    }))
  }

  handleItemClick = (option: string) => {
    if (option !== this.props.value) {
      this.onValueSelected(option)
    } else {
      this.props.onClick(this.props.name, this.props.value)
    }
  }

  renderItems() {
    const { options, itemHeight, value } = this.props
    return options.map((option, index) => {
      const style = {
        height: itemHeight + 'px',
        lineHeight: itemHeight + 'px'
      }
      const className = `picker-item${
        option === value ? ' picker-item-selected' : ''
      }`
      return (
        <div
          key={index}
          className={className}
          style={style}
          onClick={() => this.handleItemClick(option)}
        >
          {option}
        </div>
      )
    })
  }

  render() {
    const translateString = `translate3d(0, ${this.state.scrollerTranslate}px, 0)`
    const style = {
      MsTransform: translateString,
      MozTransform: translateString,
      OTransform: translateString,
      WebkitTransform: translateString,
      transform: translateString
    }
    if (this.state.isMoving) {
      // @ts-ignore
      style.transitionDuration = '0ms'
    }
    return (
      <div className='picker-column'>
        <div
          className='picker-scroller'
          style={style}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
          onTouchCancel={this.handleTouchCancel}
        >
          {this.renderItems()}
        </div>
      </div>
    )
  }
}
