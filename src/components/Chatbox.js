import React, { Component } from "react";
import chalk from "chalk";
import styles from "../styles.js";

/**
 * Chatbox component.
 */
export default class Chatbox extends Component {
  componentDidMount() {
    // set placeholder text
    this.setPlaceholder();
    // // Focus on the first box
    // this.refs.textarea.focus();
  }

  setPlaceholder() {
    if (this.refs.textarea.value === "Enter message...")
      this.refs.textarea.setValue("");
    else if (!this.refs.textarea.value)
      this.refs.textarea.setValue("Enter message...");
    else return;

    this.forceUpdate();
  }

  render() {
    return (
      <form height="20%" bottom={0}>
        <textarea
          onFocus={() => this.setPlaceholder()}
          onBlur={() => this.setPlaceholder()}
          ref="textarea"
          inputOnFocus={true}
          class={styles.bordered}
          mouse={true}
          scrollable={true}
          height={4}
          bottom={0}
        />
      </form>
    );
  }
}
