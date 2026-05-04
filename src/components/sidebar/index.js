import React, { useCallback } from "react"
import styled from "styled-components"
import { Flex } from "@netdata/netdata-ui"
import { useDispatch, useSelector } from "react-redux"
import { useLocalStorage } from "react-use"
import { selectSpacePanelIsActive } from "@/src/domains/global/selectors"
import { setSpacePanelStatusAction } from "@/src/domains/global/actions"
import Spaces from "./spaces"
import Space from "./space"

const Wrapper = styled(Flex).attrs({ height: "100vh", zIndex: 10 })`
  pointer-events: all;
`

const Sidebar = () => {
  const [lsValue, setLsValue] = useLocalStorage("space-panel-state")
  const isOpen = useSelector(selectSpacePanelIsActive)
  const dispatch = useDispatch()

  const toggle = useCallback(() => {
    dispatch(setSpacePanelStatusAction({ isActive: !isOpen }))
    setLsValue(!isOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <Wrapper>
      <Spaces isOpen={isOpen} toggle={toggle} />
      <Space isOpen={isOpen} toggle={toggle} />
    </Wrapper>
  )
}

export default React.memo(Sidebar)
