import React, { Component } from "react";
import chalk from "chalk";
import styles from "../styles.js";
import marked from "marked";
import TerminalRenderer from "marked-terminal";

import Chatbox from "../components/Chatbox";

marked.setOptions({
  // Define custom renderer
  renderer: new TerminalRenderer()
});

/**
 * Chatroom component.
 */
export default class Chatroom extends Component {
  render() {
    return (
      <box left="30%" width="70%">
        <box
          label={chalk.bold("Chatroom")}
          class={styles.bordered}
          // height="90%"
          scrollable={true}
          keys={true}
          mouse={true}
          vi={true}
          alwaysScroll={true}
          scrollbar={{
            ch: " ",
            inverse: true
          }}
        >
          {"\n" +
            chatitems
              .map(
                ({ username, msg }, i) =>
                  `${chalk.bold.grey(username)}\n${marked(msg).trim()}`
              )
              .join(
                `\n${chalk.grey(
                  "____________________________________________"
                )}\n\n`
              )}
        </box>
        <Chatbox />
      </box>
    );
  }
}

// class ChatItem extends Component {
//   render() {
//     let { width, height, username, msg } = this.props;

//     return (
//       <box width={width} height={height}>
//         <text children={username} class={{ style: { bg: "red" } }} />
//         <text children={msg} top="50" />
//       </box>
//     );
//   }
// }

const chatitems = [
  {
    username: "@hally1992",
    msg: `The following snippet of text is rendered as **bold text**. The following snippet of text is rendered as *italicized text*.
[I'm an inline-style link](https://www.google.com)
For example, \`<section>\` should be wrapped as inline.`
  },
  {
    username: "@johndoe",
    msg: `**Unordered List**

* Lorem ipsum dolor sit amet, consectetur adipisicing.
* Lorem ipsum dolor sit amet.
* Lorem ipsum dolor sit amet, consectetur.
  * Lorem ipsum dolor sit amet, consectetur adipisicing.
  * Lorem ipsum dolor sit amet.
  * Lorem ipsum dolor sit amet, consectetur.
  * Lorem ipsum dolor.
* Lorem ipsum dolor.
* Lorem ipsum dolor sit amet.`
  },
  {
    username: "@sally",
    msg: `First Header | Second Header
------------ | -------------
Content Cell | Content Cell
Content Cell | Content Cell
Content Cell | Content Cell`
  },
  {
    username: "@santa",
    msg: `**Blockquote**
> Lorem ipsum dolor sit amet, consectetur adipisicing elit.`
  },
  {
    username: "@monica",
    msg: `__Code__
\`\`\`javascript
var num1 = 3;
var num2 = 2;

function add(a, b) {
  return a + b;
}

var sum = add(num1, num2);

console.log(sum);
\`\`\``
  },
  { username: "@dave_32", msg: "soluta!" },
  {
    username: "@seth23",
    msg: `*Headings*

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6`
  },
  {
    username: "@_hon",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@packer",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@tailor_van_los",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@jane",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@doe",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@cater",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@lolly",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@ben",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@jamine",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@jasmin",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@dolly",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@1337",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@peter_pan",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@dora",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@sean32",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@six1nine",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@care_bare",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@ninja_in_pajamas",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@taken",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  },
  {
    username: "@i_farted",
    msg:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Modi animi non voluptate, deleniti neque officiis quisquam ratione suscipit aperiam commodi debitis cum cumque ipsum ab quasi, autem voluptatibus in soluta!"
  }
];
