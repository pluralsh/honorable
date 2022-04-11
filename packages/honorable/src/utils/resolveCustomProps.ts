import {
  AnyProps,
  CustomProps,
  StyleProps,
  Theme,
} from '../types'

function resolveCustomProps(customProps: CustomProps, props: AnyProps = {}, theme: Theme = {}): StyleProps {
  const resolvedStyles = {}

  if (!(customProps && customProps instanceof Map)) return resolvedStyles

  customProps.forEach((styles, fn) => {
    try {
      if (typeof fn === 'function' && fn(props, theme)) {
        Object.assign(resolvedStyles, styles)
      }
    }
    catch (error) {
      //
    }
  })

  return resolvedStyles
}

export default resolveCustomProps