const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertTodoDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let dataArray = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      dataArray = await database.all(getTodosQuery);
      response.send(
        dataArray.map((eachData) =>
          convertTodoDbObjectToResponseObject(eachData)
        )
      );
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}';`;
        dataArray = await database.all(getTodosQuery);
        response.send(
          dataArray.map((eachData) =>
            convertTodoDbObjectToResponseObject(eachData)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
        dataArray = await database.all(getTodosQuery);
        response.send(
          dataArray.map((eachData) =>
            convertTodoDbObjectToResponseObject(eachData)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
        dataArray = await database.all(getTodosQuery);
        response.send(
          dataArray.map((eachData) =>
            convertTodoDbObjectToResponseObject(eachData)
          )
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
      dataArray = await database.all(getTodosQuery);
      response.send(
        dataArray.map((eachData) =>
          convertTodoDbObjectToResponseObject(eachData)
        )
      );
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id='${todoId}';
    `;
  const todo = await database.get(getTodoQuery);
  response.send(convertTodoDbObjectToResponseObject(todo));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (date === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const isDateValid = isValid(new Date(date));
    if (isDateValid) {
      const formattedDate = format(new Date(date), `yyyy-MM-dd`);
      const getTodoDateQuery = `
                SELECT id,todo,priority,status,category,due_date AS dueDate
                FROM todo
                WHERE due_date='${formattedDate}';
            `;
      dataArray = await database.all(getTodoDateQuery);
      console.log(dataArray);
      response.send(dataArray);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  switch (true) {
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const postQuery = `
        INSERT INTO todo (id, todo,priority,status,category,due_date)
        VALUES ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');
    `;
        await database.run(postQuery);
        response.send("Todo Successfully Added");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        const postQuery = `
        INSERT INTO todo (id, todo,priority,status,category,due_date)
        VALUES ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');
    `;
        await database.run(postQuery);
        response.send("Todo Successfully Added");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const postQuery = `
        INSERT INTO todo (id, todo,priority,status,category,due_date)
        VALUES ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');
    `;
        await database.run(postQuery);
        response.send("Todo Successfully Added");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    case hasDueDateProperty(request.query):
      if (true) {
        const postQuery = `
        INSERT INTO todo (id, todo,priority,status,category,due_date)
        VALUES ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');
    `;
        await database.run(postQuery);
        response.send("Todo Successfully Added");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "due_date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
