import { Children, KeyboardEvent, ReactElement, Ref, cloneElement, forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import withHonorable from '../withHonorable'

import MenuContext, { MenuContextType, MenuStateType } from '../contexts/MenuContext'
import usePartProps from '../hooks/usePartProps'
import useForkedRef from '../hooks/useForkedRef'

import { Div, DivProps, Span } from './tags'
import { Menu } from './Menu'
import { Caret } from './Caret'

export type MenuItemProps = DivProps & {
  value?: any
  itemIndex?: number
  active?: boolean
  isSubMenuItem?: boolean
  fade?: boolean
  disabled?: boolean
}

export const menuItemPropTypes = {
  value: PropTypes.any,
  itemIndex: PropTypes.number,
  active: PropTypes.bool,
  isSubMenuItem: PropTypes.bool,
  fade: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

// A triangle to smooth the user interaction with the submenus
// Prevents losing focus when hovering on a submenu
// TODO replace it with a delay on the menu disappearance
function MenuItemTriangle(props: any) {
  const { isTop = false, size = 0, ...otherProps } = props
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()
  const [displayed, setDisplayed] = useState(true)

  const extendTriangle = usePartProps('MenuItem', 'Triangle', props)

  if (!displayed) return null

  return (
    <Div
      width={0}
      height={0}
      borderLeft={`${size}px solid transparent`}
      borderBottom={isTop ? `${size}px solid transparent` : 'none'}
      borderTop={!isTop ? `${size}px solid transparent` : 'none'}
      cursor="pointer"
      onMouseEnter={() => {
        setTimeoutId(setTimeout(() => {
          setDisplayed(false)
        }, 200))
      }}
      onMouseLeave={() => clearTimeout(timeoutId)}
      // onMouseMove={handleMouseMove}
      zIndex={100}
      {...otherProps}
      extend={extendTriangle}
    />
  )
}

function MenuItemRef(props: MenuItemProps, ref: Ref<any>) {
  const {
    value,
    children,
    active,
    itemIndex,
    isSubMenuItem,
    fade,
    disabled,
    ...otherProps
  } = props
  const menuItemRef = useRef<HTMLDivElement>()
  const forkedRef = useForkedRef(ref, menuItemRef)
  const [menuState, setMenuState, parentMenuState, setParentMenuState] = useContext(MenuContext)
  const [subMenu, setSubMenu] = useState(null)
  const [subMenuState, setSubMenuState] = useState<MenuStateType>({ active: false, isSubMenuVisible: false })
  const menuValue = useMemo<MenuContextType>(() => [menuState, setMenuState, parentMenuState, setParentMenuState], [menuState, setMenuState, parentMenuState, setParentMenuState])
  const [height, setHeight] = useState(0)

  const extendInner = usePartProps('MenuItem', 'Inner', props)
  const extendCaret = usePartProps('MenuItem', 'Caret', props)

  // Set height for the submenu's triangle
  useEffect(() => {
    // times 1.5 to make the triangle large enough
    setHeight(menuItemRef.current.offsetHeight * 1.5)
  }, [])

  // Find subMenu amongs children
  useEffect(() => {
    Children.forEach(children, (child: ReactElement) => {
      if (child?.type === Menu) {
        setSubMenu(child)
      }
    })
  }, [children])

  // Focus if active
  // Otherwise if subMenu is focused unfocus subMenu
  // Otherwise hide subMenu
  useEffect(() => {
    if (active && menuState.active) {
      menuItemRef.current.focus()
    }
  }, [active, menuState.active])

  // Set renderedItem if value matches menuState.value
  // Used by selects with value set on
  useEffect(() => {
    if (menuState.value === value) console.log('foo', value)
    if (menuState.value === value && menuState.renderedItem !== children) {

      setMenuState(x => ({ ...x, renderedItem: children }))
    }
  }, [menuState, setMenuState, value, children])

  // Sync with child menu to propagate new value
  useEffect(() => {
    if (menuState.shouldSyncWithChild) {
      console.log('sync child')

      setSubMenuState(x => ({
        ...x,
        value: menuState.value,
        event: menuState.event,
        renderedItem: menuState.renderedItem,
        shouldSyncWithChild: true,
      }))
      setTimeout(() => {
        console.log('sync child off')
        setMenuState(x => ({ ...x, shouldSyncWithChild: false }))
      }, 1)
    }
  }, [menuState, setMenuState, setSubMenuState])

  // On right key, focus subMenu
  // On left key, unfocus menu
  // On enter key, select item
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    event.preventDefault()

    if (!(active && menuState.active)) return

    if (subMenu && event.key === 'ArrowRight') {
      if (menuState.isSubMenuVisible) {
        setMenuState(x => ({ ...x, active: false }))
        setSubMenuState(x => ({ ...x, active: true, activeItemIndex: 0, isSubMenuVisible: true }))
      }
      else {
        setMenuState(x => ({ ...x, isSubMenuVisible: true }))
        setSubMenuState(x => ({ ...x, active: false, activeItemIndex: -1 }))
      }
    }
    else if (isSubMenuItem && event.key === 'ArrowLeft') {
      if (subMenu) {
        setSubMenuState(x => ({ ...x, active: false, isSubMenuVisible: false }))

        if (menuState.isSubMenuVisible) {
          menuItemRef.current.focus()
          setMenuState(x => ({ ...x, active: true, isSubMenuVisible: false }))
        }
        else {
          setMenuState(x => ({ ...x, active: false, activeItemIndex: -1 }))
          setTimeout(() => {
            setParentMenuState(x => ({ ...x, active: true, isSubMenuVisible: false }))
          }, 0)
        }
      }
      else {
        setMenuState(x => ({ ...x, active: false, isSubMenuVisible: false }))
        setTimeout(() => {
          setParentMenuState(x => ({ ...x, active: true, isSubMenuVisible: false }))
        }, 0)
      }
    }
    else if (!disabled && event.key === 'Enter') {
      event.persist()

      setMenuState(x => ({
        ...x,
        value,
        event,
        renderedItem: children,
        shouldSyncWithParent: true,
      }))
      setSubMenuState(x => ({
        ...x,
        active: false,
        isSubMenuVisible: false,
        activeItemIndex: -1,
      }))
    }
  }

  return (
    <Div
      ref={forkedRef}
      position="relative"
      tabIndex={itemIndex}
      {...otherProps}
      onKeyDown={event => {
        handleKeyDown(event)
        if (typeof props.onKeyDown === 'function') props.onKeyDown(event)
      }}
    >
      <Div
        cursor="pointer"
        userSelect="none"
        xflex="x4"
        onClick={event => {
          if (disabled) return

          event.persist()

          setMenuState(x => ({
            ...x,
            value,
            event,
            renderedItem: children,
            shouldSyncWithParent: true,
          }))
        }}
        onMouseMove={() => {
          if (!(active && menuState.active && menuState.activeItemIndex === itemIndex)) {
            setMenuState(x => ({
              ...x,
              active: true,
              activeItemIndex: itemIndex,
              isSubMenuVisible: true,
            }))
            setSubMenuState(x => ({ ...x, active: false, activeItemIndex: -1, isSubMenuVisible: false }))
            setParentMenuState(x => ({ ...x, active: false }))
            menuItemRef.current.focus()
          }
        }}
        extend={extendInner}
      >
        {Children.map(children, (child: ReactElement) => {
          if (child?.type === Menu) return null

          return child
        })}
        {subMenu && (
          <>
            <Span flexGrow={1} />
            <Caret
              ml={0.5}
              mr={-0.5}
              rotation={-90}
              extend={extendCaret}
            />
          </>
        )}
      </Div>
      {active && subMenu && (
        <>
          <MenuItemTriangle
            isTop
            size={height}
            position="absolute"
            top={-height}
            right={0}
            display={menuState.isSubMenuVisible ? 'block' : 'none'}
          />
          <MenuContext.Provider value={menuValue}>
            {cloneElement(subMenu, {
              fade,
              isSubMenu: true,
              menuState: subMenuState,
              setMenuState: setSubMenuState,
              position: 'absolute',
              top: 0,
              left: '100%',
              display: menuState.isSubMenuVisible ? 'block' : 'none',
              ...subMenu.props,
            })}
          </MenuContext.Provider>
          <MenuItemTriangle
            size={height}
            position="absolute"
            bottom={-height}
            right={0}
            display={menuState.isSubMenuVisible ? 'block' : 'none'}
          />
        </>
      )}
    </Div>
  )
}

MenuItemRef.displayName = 'MenuItemRef'

const ForwardedMenuItem = forwardRef(MenuItemRef)

ForwardedMenuItem.propTypes = menuItemPropTypes

export const MenuItem = withHonorable<MenuItemProps>(ForwardedMenuItem, 'MenuItem')
