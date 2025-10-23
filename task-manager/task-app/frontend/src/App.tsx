import { useState, useEffect } from 'react';
import './App.css';
type a_data = { completed: number; id: number; title: string };
type datas = a_data[];
function CheckComplete({ prop, func }: { prop: a_data; func: Function }) {
  let next = prop.completed == 1 ? 0 : 1;
  return (
    <input
      type="checkbox"
      defaultChecked={!next}
      onClick={() => {
        func('update', { id: prop.id, comp: next });
      }}
    />
  );
}
function Deletebutton({ prop, func }: { prop: a_data; func: Function }) {
  return (
    <button
      className="delbutton"
      onClick={() => {
        func('delete', { id: prop.id });
      }}
    >
      delete
    </button>
  );
}
function EddittingLine({
  prop = { completed: 0, id: -1, title: "don't use" },
  func,
  set = () => 0,
  add = false,
}: {
  prop?: a_data;
  func: Function;
  set?: Function;
  add?: boolean;
}) {
  function handleSubmit(e: FormData) {
    console.log('handleSubmit ran')
    let locate = add ? 'insert' : 'update';
    let content = add
      ? { title: String(e.get('newTitle')) }
      : { id: prop.id, title: String(e.get('newTitle')) };
    console.log(String(e.get('newTitle')))
    if (String(e.get('newTitle'))!=""){
      func(locate, content);
    }
    set();
  }
  return (
    <>
      <form action={handleSubmit} id={String(prop.id)}>
        <input type="text" name="newTitle" defaultValue={''} />
        {!add && (
          <button
            type="button"
            className="cancel"
            name="cancel"
            onClick={() => {
              set();
            }}
          >
            Cancel
          </button>
        )}
        <button className="edit-add" name="submit" type="submit">
          Enter
        </button>
      </form>
    </>
  );
}
function Oneline({ prop, func }: { prop: a_data; func: Function }) {
  const [editting, setEditting] = useState(false);
  function editting_func() {
    setEditting(!editting);
  }
  return (
    <>
      {!editting && (
        <span>
          <CheckComplete prop={prop} func={func} />
          {prop.title}
          <button className="edit-add" onClick={editting_func}>
            Edit
          </button>
          <Deletebutton prop={prop} func={func} />
        </span>
      )}
      {editting && (
        <span className="edit">
          <EddittingLine prop={prop} func={func} set={editting_func} />
        </span>
      )}
    </>
  );
}
function sortById(a: a_data, b: a_data) {
  return a.id - b.id;
}
function sortByCompleted(a: a_data, b: a_data) {
  return a.completed - b.completed;
}
function TaskList({ func, data }: { func: Function; data: datas }) {
  console.log(data);
  const list = data.map((task) => (
    <h2 key={task.id}><Oneline prop={task} func={func} key={task.id} /></h2>
  ));
  return (
    <div>
      {data.length == 0 && <h2>no task</h2>}
      {list}
    </div>
  );
}
function App() {
  const [data, setData] = useState<datas>([
    { completed: 0, id: 1, title: 'sample1' },
    { completed: 0, id: 2, title: 'sample2' },
  ]);
  const [isError, setIsError] = useState<boolean>(false);
  async function fetchapi(locate: string, content: object) {
    let url: string = `http://${location.hostname}:8000/` + locate;
    try {
      const response = await fetch(url, {
        // リクエストのタイプをPOSTに指定（データを送信する）
        method: 'POST',
        // リクエストのヘッダーに送信するデータがJSON形式であることを指定
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      let jsonRes = await response.json();
      setData(jsonRes.sort(sortById).sort(sortByCompleted));
    } catch (e) {
      console.log(e);
      setIsError(true);
    }
  }
  useEffect(() => {
    //マウント時にfetch
    async function getdata() {
      let ignore = false;
      let url: string = `http://${location.hostname}:8000/`;
      try {
        if (!ignore) {
          const response = await fetch(url);
          let jsonRes = await response.json();
          setData(jsonRes.sort(sortById).sort(sortByCompleted));
          return () => {
            ignore = true;
          };
        }
      } catch (e) {
        console.log(e);
        setIsError(true);
      }
    }
    getdata();
  }, []);
  return (
    <>
      <h1>Task-manager</h1>
      {isError && <h3>接続エラー:情報を取得できませんでした</h3>}
      <TaskList func={fetchapi} data={data} />
      <span className="adds">
        <EddittingLine func={fetchapi} add={true} />
      </span>
    </>
  );
}

export default App;
