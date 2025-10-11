import { use, useState } from 'react';
import './App.css';
type a_data = { completed: number; id: number; title: string };
type datas = a_data[];
// const appdata: datas = [
//   { completed: 0, id: 1, title: 'task1' },
//   { completed: 0, id: 2, title: 'task2' },
// ];
async function getdata() {
  let url: string = `http://${location.hostname}:8000/`
  const response = await fetch(url);
  try {
    return response.json()
  } catch (e) {
    console.log(e)
    console.log(response)
    return [{ completed: 0, id: 1, title: 'failed' }]
  }

}
function CheckComplete() {
  return <input
    type="checkbox"
    defaultChecked={false} />
}
function Deletebutton() {
  return <button className="delbutton">
    delete
  </button>
}
function Oneline({ prop }) {
  const [editting, setEditting] = useState(false)
  function editting_func() {
    setEditting(!editting);
  }
  return <>
    {!editting && <><CheckComplete />{prop.title}
      <button className="edit-add" onClick={editting_func}>
        Edit
      </button><Deletebutton /></>}
    {editting && <><input type="text" defaultValue={prop.title} />
      <button className="edit-add" type="submit" onClick={editting_func}>
        Enter
      </button>
      <button className="cancel" onClick={editting_func}>
        Cancel
      </button></>}</>


}
const getdataPromise = getdata()
function TaskList() {
  const gotdata = use(getdataPromise)
  function sortById(a: a_data, b: a_data) {
    return a.id - b.id;
  }
  function sortByCompleted(a: a_data, b: a_data) {
    return a.completed - b.completed;
  }
  const [data, setData] = useState<datas>(gotdata.sort(sortById).sort(sortByCompleted));
  console.log(data);
  const list = data.map((task) => <h2><Oneline prop={task} /></h2>);
  return <div>{list}{data.length == 0 && <h2>no task</h2>}</div>;
}
function AddForm() {
  return <h2 className="adds"><label><input type="text" defaultValue="add new task" /><button className="edit-add"> Enter </button></label></h2>
}
function App() {

  return (
    <>
      <h1>Task-manager</h1>
      <TaskList />
      <AddForm />
    </>
  );
}

export default App;

