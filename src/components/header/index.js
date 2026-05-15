import React from "react"
import styled from "styled-components"
import { Flex, Button } from "@netdata/netdata-ui"
import Node from "./node"
import Options from "./options"
import Version from "./version"
import GlobalControls from "./globalControls"
import Alarms from "./alarms"
import Timezone from "./timezone"

const Wrapper = styled(Flex).attrs({
  as: "header",
  position: "relative",
  justifyContent: "between",
  background: "panel",
  zIndex: 20,
  width: "100%",
  padding: [2, 4, 2, 4],
})`
  pointer-events: all;
`

const Header = () => (
  <Wrapper>
    <Flex alignItems="center" gap={3}>
      <Node />
    </Flex>
    <Flex justifyContent="end" alignItems="center" gap={3}>
      <span className="header-desktop-only"><Version /></span>
      <span className="header-desktop-only"><Options /></span>
      <span className="header-desktop-only"><Timezone /></span>
      <GlobalControls />
      <Alarms />
      <span className="header-mobile-only">
        <Button
          flavour="borderless"
          neutral
          themeType="dark"
          data-toggle="modal"
          data-target="#optionsModal"
          icon="gear"
          title="Settings"
        />
      </span>
    </Flex>
  </Wrapper>
)

export default Header
