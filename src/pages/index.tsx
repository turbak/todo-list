import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api, RouterOutputs } from "../utils/api";
import { useState } from "react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Todo list</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="absolute top-4 right-4">
          <Auth />
        </div>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">Todo</span> List
          </h1>
          <div className="flex flex-col items-center gap-2">
            <TodoList />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;


const TodoList: React.FC = () => {
  const { data: sessionData } = useSession();
  const utils = api.useContext();
  const listQuery = api.todo.list.useQuery(undefined, {enabled: !!sessionData});

  const [todoDesc, setTodoDesc] = useState('');
  const createTodo = api.todo.create.useMutation({
    async onMutate(newTodo) {
      await utils.todo.list.cancel()
      const previousTodos = utils.todo.list.getData()
      utils.todo.list.setData(undefined, (old) => [...old, newTodo]);

      return { previousTodos }
    },
    onError(err, newTodo, ctx) {
      utils.todo.list.setData(undefined, ctx?.previousTodos);
    },
    onSettled() {
      utils.todo.list.invalidate();
    },
  })

  if (!sessionData) {
    return null;
  }


  return (
    <>
      <form 
      className="flex gap-4"
      onSubmit={() => createTodo.mutate({description: todoDesc})}>
        <input value={todoDesc} onChange={e => setTodoDesc(e.target.value)} />
        <button 
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        type="submit">
          Create
        </button>
      </form>
      <ul>
        {listQuery.data?.map((todo) => (
          <TodoItem todo={todo} />
        ))}
      </ul>
    </>
  )
}

const TodoItem: React.FC<{todo: RouterOutputs['todo']['get']}> = ({todo}) => {
  const { data: sessionData } = useSession();
  const utils = api.useContext();
  const listQuery = api.todo.list.useQuery(undefined, {enabled: !!sessionData});

  const deleteTodo = api.todo.delete.useMutation({
    async onMutate({id}) {
      await utils.todo.list.cancel()
      const previousTodos = utils.todo.list.getData()
      utils.todo.list.setData(undefined, (old) => old?.filter(todo => todo.id !== id));
      
      return { previousTodos }
    },
    onError(err, id, ctx) {
      utils.todo.list.setData(undefined, ctx?.previousTodos);
    },
    onSettled() {
      utils.todo.list.invalidate();
    },
  })

  if (!todo) {
    return null;
  }

  return (
    <>
      <li className="text-2xl text-white" id={todo?.id}>
        {todo?.description}
        <button 
        className="text-2xl text-gray-500 px-3"
        onClick={e => deleteTodo.mutate({id: todo.id})}>
          x
        </button>
      </li>
      
    </>
  )
}

const Auth: React.FC = () => {
  const { data: sessionData } = useSession();
  return (
    <>
    <div className="flex items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData ? `Hello, ${sessionData.user.name}` : 'Please sign in'}
      </p>
      <button 
    className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
    onClick={() => sessionData ? signOut() : signIn()}>
      {sessionData ? 'Sign out' : 'Sign in'}
    </button>
    </div>
    </>
  )
}