import Fastify, {type FastifyReply, type FastifyRequest} from 'fastify'
import mercurius, {type IResolvers} from 'mercurius'
import mercuriusCodegen, {gql} from 'mercurius-codegen'
import schema from './schema';

const app = Fastify()

const buildContext = async (req: FastifyRequest, _reply: FastifyReply) => {
    return {
        authorization: req.headers.authorization

    }
}

type PromiseType<T> = T extends PromiseLike<infer U> ? U : T

declare module 'mercurius' {
    interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {
    }
}

// Using the fake "gql" from mercurius-codegen gives tooling support for
// "prettier formatting" and "IDE syntax highlighting".
// It's optional
let todos = [
    {id: "1", clientId: "1", title: "Learn GraphQL", completed: false},
    {id: "2", clientId: "2", title: "Build a ToDo App", completed: false},
];

const resolvers: IResolvers = {
    Query: {
        hello(root, {name}, ctx, info) {
            // root ~ {}
            // name ~ string
            // ctx.authorization ~ string | undefined
            // info ~ GraphQLResolveInfo
            return 'hello ' + name
        },
        todos: () => todos,
    },
    Mutation: {
        addTodo: (_, {title, clientId}) => {

            const newTodo = {id: Date.now().toString(), clientId, title, completed: false};
            todos.push(newTodo);
            console.log("########### newTodo", newTodo)
            return newTodo;
        },
        toggleTodo: (_, {id}) => {
            const todo = todos.find(t => t.id === id);
            if (todo) todo.completed = !todo?.completed;
            return todo;
        },
        deleteTodo: (_, {id}) => {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todos = todos.filter(t => t.id !== id);
            }
            console.log("########### deleteTodo", todo)
            return todo;
        },
    }
}

app.register(mercurius, {
    schema,
    resolvers,
    context: buildContext,
    graphiql: true,
})

app.addHook('preHandler', (req, res, done) => {

    // example logic for conditionally adding headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "*");

    const isPreflight = /options/i.test(req.method);
    if (isPreflight) {
        return res.send();
    }

    done();
})

mercuriusCodegen(app, {
    // Commonly relative to your root package.json
    targetPath: './src/graphql/generated.ts',
    outputSchema: true,

}).catch(console.error)

app.listen({port: 3000})
