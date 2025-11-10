import {gql} from 'mercurius-codegen'
export default gql`
type Todo {
    id: ID!
    clientId: String!
    title: String!
    completed: Boolean!
}

type Query {
    hello(name: String!): String!
    todos: [Todo]
}

type Mutation {
    addTodo(title: String!, clientId: String!): Todo
    toggleTodo(id: ID!): Todo
    deleteTodo(id: ID!): Todo
}
`
