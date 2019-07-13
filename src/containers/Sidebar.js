import React, { Component } from "react";
import chalk from "chalk";
import styles from "../styles.js";

/**
 * Sidebar component.
 */
export default class Sidebar extends Component {
  render() {
    return (
      <list
        label={chalk.bold("All Conversations")}
        class={styles.bordered}
        width="30%"
        style={{
          // item: { fg: "black" },
          selected: { fg: "white", bg: "magenta" }
        }}
        mouse={true}
        keys={true}
        items={items}
        onSelect={() => null}
      />
    );
  }
}

const items = [
  "@johndoe",
  "@sally",
  "@santa",
  "@monica",
  "@dave_32",
  "@hally1992",
  "@seth23",
  "@_hon",
  "@packer",
  "@tailor_van_los",
  "@jane",
  "@doe",
  "@cater",
  "@lolly",
  "@ben",
  "@jamine",
  "@jasmin",
  "@dolly",
  "@1337",
  "@peter_pan",
  "@dora",
  "@sean32",
  "@six1nine",
  "@care_bare",
  "@ninja_in_pajamas",
  "@taken",
  "@i_farted"
];
