import { ReactNode, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import withHonorable from '../withHonorable'

import { Span } from './tags'

type IconButtonProps = {
  children: ReactNode
}

const propTypes = {
  children: PropTypes.node.isRequired,
}

function IconButton(props: IconButtonProps) {
  const rootRef = useRef<any>()
  const [height, setHeight] = useState('auto')

  useEffect(() => {
    if (rootRef.current) {
      setHeight(rootRef.current.clientWidth)
    }
  }, [])

  return (
    <Span
      ref={rootRef}
      height={height}
      xflex="x5"
      display="inline-flex"
      cursor="pointer"
      role="button"
      {...props}
    />
  )
}

IconButton.propTypes = propTypes

export default withHonorable<IconButtonProps>(IconButton)
