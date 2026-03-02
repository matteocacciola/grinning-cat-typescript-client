# Grinning Cat Typescript Client

----

**Grinning Cat Typescript Client** is a library to help the implementation
of [Grinning Cat](https://github.com/matteocacciola/grinning-cat-core) on a JavaScript / TypeScript (e.g. Node.js, React.js, Vue.js) Project

* [Installation](#installation)
* [Usage](#usage)

## Installation

To install Grinning Cat Typescript Client, run:

```bash
npm install grinning-cat-typescript-client
```

or, if you are using yarn:

```bash
yarn add grinning-cat-typescript-client
```

## Usage
Initialization and usage:

```javascript
import { GrinningCatClient, HttpClient, WSClient } from 'grinning-cat-typescript-client';

const catClient = new GrinningCatClient(
    new WSClient('grinning_cat_core', 1865, null),
    new HttpClient('grinning_cat_core', 1865, null)
);
```
Send a message to the websocket:

```javascript
import { Message } from 'grinning-cat-typescript-client';

const notificationClosure = (message: string) => {
 // handle websocket notification, like chat token stream
}

// result is the result of the message
const result = catClient.message().sendWebsocketMessage(
    new Message("Hello world!"),  // message body
    "agent", // agent name
    "user", // user name
    notificationClosure // websocket notification closure handle
);

```

Load data to the rabbit hole:
```javascript
//file
const result = await catClient.rabbitHole().postFile(file, "agent");

//url
const result = await catClient.rabbitHole().postWeb(url, "agent");
```

Memory management utilities:

```javascript
catClient.memory().getMemoryCollections("agent"); // get number of vectors in the working memory
catClient.memory().getMemoryRecall("HELLO", "agent", "user"); // recall memories by text

//delete memory points by metadata, like this example delete by source
catClient.memory().deleteMemoryPointsByMetadata("declarative", "agent", {"source": url});
```
