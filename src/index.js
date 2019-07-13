import React, { Component } from "react";
import blessed from "blessed";
import { render } from "react-blessed";
import styles from "./styles.js";

import Sidebar from "./containers/Sidebar";
import Chatroom from "./containers/Chatroom";

/**
 * Top level component.
 */
class CliApp extends Component {
  render() {
    return (
      <element>
        <Sidebar />
        <Chatroom />
      </element>
    );
  }
}

/**
 * Rendering the screen.
 */
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: "GitterSlim Client"
});

screen.key(["escape", "q", "C-c"], function(ch, key) {
  return process.exit(0);
});

render(<CliApp />, screen);
