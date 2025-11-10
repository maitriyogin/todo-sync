# server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


mutation
---------
action to mutate state
mutate local state
intercept that action
if they're api send off the mutation
get new state

query
---------
use a selector for that state
action to query
update state
selector updates with new state

or 
use a query ( no selector )
RTK updates api state
returns {data}
spread data into your component
